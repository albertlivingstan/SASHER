import React, { useState, useMemo } from 'react';
import { useSasher } from '../../context/SasherContext';
import { CategoryType, RecommendedProduct, Product } from '../../types';
import { CATEGORIES } from '../../data/products';
import { ProductCard } from '../product/ProductCard';
import { SessionIntentWidget } from '../session/SessionIntentWidget';
import { RankingService } from '../../services/RankingService';
import { GazeHeatmapOverlay } from '../eyetracking/GazeHeatmapOverlay';
import { gazeHeatmapService, ProductGazeHeatmapData } from '../../services/gazeHeatmapService';
import { 
  Grid, 
  Search, 
  SlidersHorizontal, 
  Sparkles, 
  RefreshCw, 
  Check, 
  Eye, 
  EyeOff,
  Filter,
  Layers,
  TrendingUp,
  Tag,
  Flame,
  Info,
  ChevronRight,
  ShoppingBag,
  Sparkle,
  Route
} from 'lucide-react';

interface BrowseViewProps {
  onSelectProduct: (product: RecommendedProduct) => void;
  onExplainProduct: (product: RecommendedProduct) => void;
}

export const BrowseView: React.FC<BrowseViewProps> = ({
  onSelectProduct,
  onExplainProduct
}) => {
  const { 
    products,
    recommendedProducts, 
    activeCategory, 
    setActiveCategory, 
    searchQuery, 
    setSearchQuery,
    isEyeTrackingActive,
    toggleEyeTracking,
    sessionIntent,
    interactions,
    genderFilter,
    setGenderFilter
  } = useSasher();

  const [sortBy, setSortBy] = useState<'hybrid' | 'price-asc' | 'price-desc' | 'popularity' | 'rating' | 'dwell'>('hybrid');
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<string>('All');
  const [selectedOccasionFilter, setSelectedOccasionFilter] = useState<string>('All');
  const [selectedStyleFilter, setSelectedStyleFilter] = useState<string>('All');

  // Merchandiser Gaze Heatmap State
  const [isHeatmapActive, setIsHeatmapActive] = useState<boolean>(() => {
    try {
      return localStorage.getItem('sasher_merchandiser_heatmap') === 'true';
    } catch {
      return false;
    }
  });
  const [visualizationMode, setVisualizationMode] = useState<'intensity' | 'path'>(() => {
    try {
      return (localStorage.getItem('sasher_gaze_viz_mode') as 'intensity' | 'path') || 'intensity';
    } catch {
      return 'intensity';
    }
  });
  const [classificationFilter, setClassificationFilter] = useState<string>('ALL');
  const [inspectingProductData, setInspectingProductData] = useState<ProductGazeHeatmapData | null>(null);

  const handleToggleHeatmap = (active: boolean) => {
    setIsHeatmapActive(active);
    try {
      localStorage.setItem('sasher_merchandiser_heatmap', String(active));
    } catch {}
  };

  const handleVisualizationModeChange = (mode: 'intensity' | 'path') => {
    setVisualizationMode(mode);
    try {
      localStorage.setItem('sasher_gaze_viz_mode', mode);
    } catch {}
  };

  const userColdStartStatus = useMemo(() => {
    return RankingService.getUserColdStartStatus(interactions.length);
  }, [interactions.length]);

  // Base catalog with safety fallback
  const baseCatalog: RecommendedProduct[] = useMemo(() => {
    if (recommendedProducts && recommendedProducts.length > 0) {
      return recommendedProducts;
    }
    // Fallback to raw products if ranking is calculating
    return (products || []).map(p => ({
      ...p,
      explanation: {
        matchScore: Math.round((p.popularityScore || 0.8) * 100),
        sessionContribution: 50,
        visualAttentionContribution: 40,
        profileContribution: 50,
        contentSimilarityContribution: 50,
        popularityContribution: Math.round((p.popularityScore || 0.8) * 100),
        primaryReasons: ['Catalog discovery fallback']
      }
    })) as RecommendedProduct[];
  }, [recommendedProducts, products]);

  // Comprehensive resilient filter logic
  const filteredProducts = useMemo(() => {
    return baseCatalog.filter(product => {
      // 1. Category
      const matchesCategory = activeCategory === 'All' || product.category === activeCategory;

      // 2. Gender (Unisex matches both Men and Women)
      const matchesGender = 
        genderFilter === 'All' || 
        product.gender === 'Unisex' || 
        product.gender === genderFilter;

      // 3. Search query: multi-token resilient search
      const q = searchQuery.toLowerCase().trim();
      const tokens = q.split(/\s+/).filter(Boolean);
      const matchesSearch = tokens.length === 0 || tokens.every(token => 
        product.name.toLowerCase().includes(token) ||
        product.brand.toLowerCase().includes(token) ||
        product.category.toLowerCase().includes(token) ||
        (product.subcategory && product.subcategory.toLowerCase().includes(token)) ||
        (product.articleType && product.articleType.toLowerCase().includes(token)) ||
        (product.color && product.color.toLowerCase().includes(token)) ||
        (product.material && product.material.toLowerCase().includes(token)) ||
        (product.description && product.description.toLowerCase().includes(token)) ||
        (product.tags && product.tags.some(t => t.toLowerCase().includes(token)))
      );

      // 4. Size
      const matchesSize = 
        selectedSizeFilter === 'All' || 
        (product.availableSizes && product.availableSizes.includes(selectedSizeFilter));

      // 5. Occasion: smart multi-attribute match
      const matchesOccasion = selectedOccasionFilter === 'All' || (() => {
        const occ = (product.occasion || '').toLowerCase();
        const filter = selectedOccasionFilter.toLowerCase();
        if (occ && (occ === filter || occ.includes(filter))) return true;
        
        // Semantic fallbacks
        const haystack = `${product.name} ${product.category} ${product.subcategory || ''} ${product.description || ''} ${product.style || ''} ${product.season || ''} ${(product.tags || []).join(' ')}`.toLowerCase();
        if (filter === 'festive') {
          return product.season === 'Festive' || product.style === 'Traditional' || product.style === 'Festive' || /saree|sherwani|kurta|lehenga|festive|silk|zari|anarkali|bandhani|chikankari|kadwa/i.test(haystack);
        }
        if (filter === 'wedding') {
          return /wedding|sangeet|sherwani|saree|lehenga|brocade|zardozi|royal|katan|achkan/i.test(haystack);
        }
        if (filter === 'formal') {
          return product.category === 'Tailoring' || product.category === 'Outerwear' || /blazer|suit|trench|trouser|formal|oxford|watch|nehru|bandhgala|portfolio/i.test(haystack);
        }
        if (filter === 'casual') {
          return product.category === 'Tops' || product.category === 'Footwear' || product.style === 'Casual' || /casual|shirt|sneaker|sunglasses|t-shirt|polo|denim/i.test(haystack);
        }
        return false;
      })();

      // 6. Style
      const matchesStyle = 
        selectedStyleFilter === 'All' || 
        (product.style && product.style.toLowerCase() === selectedStyleFilter.toLowerCase());

      // 7. Merchandiser Heatmap Classification Filter
      const matchesClassification = classificationFilter === 'ALL' || !isHeatmapActive || (() => {
        const hm = gazeHeatmapService.getHeatmapForProduct(product.id);
        return hm.classification === classificationFilter;
      })();

      return matchesCategory && matchesGender && matchesSearch && matchesSize && matchesOccasion && matchesStyle && matchesClassification;
    });
  }, [
    baseCatalog, 
    activeCategory, 
    genderFilter, 
    searchQuery, 
    selectedSizeFilter, 
    selectedOccasionFilter, 
    selectedStyleFilter,
    classificationFilter,
    isHeatmapActive
  ]);

  // Sort logic
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (sortBy === 'dwell') {
        const hmA = gazeHeatmapService.getHeatmapForProduct(a.id);
        const hmB = gazeHeatmapService.getHeatmapForProduct(b.id);
        return hmB.dwellTimeSeconds - hmA.dwellTimeSeconds;
      }
      if (sortBy === 'hybrid') {
        return (b.explanation?.matchScore ?? 0) - (a.explanation?.matchScore ?? 0);
      }
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'popularity') return (b.popularityScore ?? 0) - (a.popularityScore ?? 0);
      if (sortBy === 'rating') return (b.rating ?? 0) - (a.rating ?? 0);
      return 0;
    });
  }, [filteredProducts, sortBy]);

  const resetAllFilters = () => {
    setActiveCategory('All');
    setGenderFilter('All');
    setSearchQuery('');
    setSelectedSizeFilter('All');
    setSelectedOccasionFilter('All');
    setSelectedStyleFilter('All');
    setClassificationFilter('ALL');
    setSortBy('hybrid');
  };

  const hasActiveFilters = 
    activeCategory !== 'All' || 
    genderFilter !== 'All' || 
    searchQuery.trim().length > 0 || 
    selectedSizeFilter !== 'All' || 
    selectedOccasionFilter !== 'All' || 
    selectedStyleFilter !== 'All' ||
    (isHeatmapActive && classificationFilter !== 'ALL');

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-[#f4f4f5] pb-24">
      
      {/* Header Banner */}
      <div className="border-b border-white/[0.08] bg-[#0E0F12]/80 backdrop-blur-xl">
        <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-4">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-[#d4a373]">
                <Grid className="w-3.5 h-3.5" />
                <span>CATALOG ARCHIVE</span>
                <span className="text-[#3f3f46]">·</span>
                <span>INDIAN E-COMMERCE ADAPTIVE FEED</span>
              </div>
              <h1 className="font-editorial text-3xl sm:text-5xl text-[#f4f4f5] tracking-tight">
                Browse Collection
              </h1>
              <p className="text-xs sm:text-sm text-[#a1a1aa] max-w-2xl">
                Explore handloom textiles, Varanasi silk, Lucknow chikankari, and contemporary atelier silhouettes ranked via the session-aware hybrid recommender engine.
              </p>
            </div>

            {/* Quick Engine Status Indicator & Heatmap Fast Toggle */}
            <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
              
              {/* Cold-Start State */}
              <div className="px-3 py-1.5 rounded-full bg-[#141518] border border-white/[0.08] flex items-center gap-2 text-xs font-mono">
                <span className="text-[#71717a]">User State:</span>
                <span className={`font-semibold ${
                  userColdStartStatus === 'NEW_USER' ? 'text-[#e0b487]' : 'text-[#10b981]'
                }`}>
                  {userColdStartStatus === 'NEW_USER' ? 'Cold-Start (Guest)' : 'Active Session'}
                </span>
              </div>

              {/* Merchandiser Heatmap Fast Toggle */}
              <button
                onClick={() => handleToggleHeatmap(!isHeatmapActive)}
                className={`px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 text-xs font-mono cursor-pointer ${
                  isHeatmapActive 
                    ? 'bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-[#d4a373] border-[#d4a373] shadow-[0_0_12px_rgba(212,163,115,0.25)] font-semibold' 
                    : 'bg-white/[0.04] text-[#a1a1aa] border-white/[0.08] hover:text-[#f4f4f5]'
                }`}
                title="Toggle Merchandiser Gaze Heatmap Overlay on product grid"
              >
                <Flame className={`w-3.5 h-3.5 ${isHeatmapActive ? 'fill-current text-[#d4a373]' : ''}`} />
                <span>Heatmap: {isHeatmapActive ? 'ON' : 'OFF'}</span>
              </button>

              {/* Mode Indicator Pill (Intensity vs Path) when active */}
              {isHeatmapActive && (
                <button
                  onClick={() => handleVisualizationModeChange(visualizationMode === 'intensity' ? 'path' : 'intensity')}
                  className={`px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 text-xs font-mono cursor-pointer ${
                    visualizationMode === 'path'
                      ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 font-semibold'
                      : 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-semibold'
                  }`}
                  title="Switch between 'Intensity' (dwell time) and 'Path' (saccade flow) visualization modes"
                >
                  {visualizationMode === 'path' ? (
                    <>
                      <Route className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Mode: Path</span>
                    </>
                  ) : (
                    <>
                      <Flame className="w-3.5 h-3.5 text-amber-400 fill-current" />
                      <span>Mode: Intensity</span>
                    </>
                  )}
                </button>
              )}

              {/* Visual Intent Gaze Toggle */}
              <button
                onClick={() => toggleEyeTracking()}
                className={`px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1.5 text-xs font-mono cursor-pointer ${
                  isEyeTrackingActive 
                    ? 'bg-[#10b981]/15 text-[#10b981] border-[#10b981]/40' 
                    : 'bg-white/[0.04] text-[#71717a] border-white/[0.08]'
                }`}
                title={isEyeTrackingActive ? "Visual Intent is ACTIVE — Click to pause" : "Visual Intent is PAUSED — Click to enable"}
              >
                {isEyeTrackingActive ? <Eye className="w-3.5 h-3.5 animate-pulse" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>Visual Intent: {isEyeTrackingActive ? 'ON' : 'OFF'}</span>
              </button>

            </div>
          </div>

          {/* Search & Gender Filter Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Banarasi saree, Chikankari kurta, sherwani, cashmere trench..."
                className="w-full h-11 pl-10 pr-10 bg-[#141518] border border-white/[0.08] focus:border-[#d4a373]/60 rounded-xl text-xs text-[#f4f4f5] placeholder-[#71717a] outline-none transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717a] hover:text-[#f4f4f5] text-sm"
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>

            {/* Gender Toggle Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-[#141518] border border-white/[0.08] rounded-xl self-start sm:self-auto">
              {(['All', 'Women', 'Men'] as const).map(gender => (
                <button
                  key={gender}
                  onClick={() => setGenderFilter(gender)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    genderFilter === gender
                      ? 'bg-[#d4a373] text-[#0D0D0D] font-semibold shadow'
                      : 'text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-white/[0.04]'
                  }`}
                >
                  {gender === 'All' ? 'All Genders' : gender}
                </button>
              ))}
            </div>

          </div>

          {/* Category Filter Horizontal Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar border-t border-white/[0.04]">
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all cursor-pointer border ${
                  activeCategory === category
                    ? 'bg-white/[0.12] text-[#f4f4f5] border-[#d4a373]/50 font-semibold'
                    : 'bg-[#141518] text-[#a1a1aa] border-white/[0.06] hover:bg-white/[0.04] hover:text-[#f4f4f5]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Main Browse Catalog Section */}
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Merchandiser Gaze Heatmap Overlay Component & Control Dashboard */}
        <GazeHeatmapOverlay
          products={baseCatalog}
          isHeatmapActive={isHeatmapActive}
          onToggleHeatmap={handleToggleHeatmap}
          visualizationMode={visualizationMode}
          onVisualizationModeChange={handleVisualizationModeChange}
          selectedClassificationFilter={classificationFilter}
          onClassificationFilterChange={(f) => setClassificationFilter(f)}
          onInspectProduct={(p) => onSelectProduct(p as RecommendedProduct)}
        />

        {/* Secondary Filter & Sort Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
          
          {/* Left: Secondary Filters (Occasion, Style, Size) */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Occasion Filter */}
            <select
              value={selectedOccasionFilter}
              onChange={(e) => setSelectedOccasionFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-[#141518] border border-white/[0.08] text-xs text-[#a1a1aa] hover:text-[#f4f4f5] outline-none cursor-pointer"
            >
              <option value="All">Occasion: All</option>
              <option value="Festive">Festive & Diwali</option>
              <option value="Wedding">Wedding & Sangeet</option>
              <option value="Formal">Formal & Evening</option>
              <option value="Casual">Casual Daily</option>
            </select>

            {/* Style Filter */}
            <select
              value={selectedStyleFilter}
              onChange={(e) => setSelectedStyleFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-[#141518] border border-white/[0.08] text-xs text-[#a1a1aa] hover:text-[#f4f4f5] outline-none cursor-pointer"
            >
              <option value="All">Aesthetic Style: All</option>
              <option value="Traditional">Traditional / Indian Ethnic</option>
              <option value="Festive">Festive Celebration</option>
              <option value="Tailored">Tailored Architecture</option>
              <option value="Minimalist">Minimalist</option>
              <option value="Casual">Contemporary Casual</option>
            </select>

            {/* Size Filter */}
            <select
              value={selectedSizeFilter}
              onChange={(e) => setSelectedSizeFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-[#141518] border border-white/[0.08] text-xs text-[#a1a1aa] hover:text-[#f4f4f5] outline-none cursor-pointer"
            >
              <option value="All">Size: All</option>
              <option value="S">Size S</option>
              <option value="M">Size M</option>
              <option value="L">Size L</option>
              <option value="XL">Size XL</option>
              <option value="Free Size">Free Size (Sarees)</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="px-2.5 py-1 text-xs text-[#d4a373] hover:underline cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {/* Right: Results Count & Sort Dropdown */}
          <div className="flex items-center gap-3 self-end lg:self-auto">
            <span className="text-xs font-mono text-[#71717a]">
              Showing <span className="text-[#f4f4f5] font-semibold">{sortedProducts.length}</span> of {baseCatalog.length} garments
            </span>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#71717a] font-mono hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 rounded-lg bg-[#141518] border border-white/[0.08] text-xs text-[#d4a373] font-medium outline-none cursor-pointer"
              >
                <option value="hybrid">✨ Hybrid Recommendation Score</option>
                <option value="dwell">🔥 Eye Dwell Time (Heatmap Focus)</option>
                <option value="popularity">🔥 Popularity & Sales Volume</option>
                <option value="rating">★ Highest Customer Rating</option>
                <option value="price-asc">₹ Price: Low to High</option>
                <option value="price-desc">₹ Price: High to Low</option>
              </select>
            </div>
          </div>

        </div>

        {/* Product Cards Grid with Optional Heatmap Overlays */}
        {sortedProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {sortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                showHeatmap={isHeatmapActive}
                heatmapMode={visualizationMode}
                onInspectHeatmap={(hmData) => setInspectingProductData(hmData)}
                onSelect={() => onSelectProduct(product)}
                onExplain={() => onExplainProduct(product)}
              />
            ))}
          </div>
        ) : (
          /* Empty Search Recovery State */
          <div className="py-16 text-center space-y-6 bg-[#121316] border border-white/[0.06] rounded-3xl p-8 max-w-2xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-[#71717a]">
              <Search className="w-6 h-6 text-[#d4a373]" />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-editorial text-2xl text-[#f4f4f5]">
                No garments found with active filter set
              </h3>
              <p className="text-xs text-[#a1a1aa] leading-relaxed max-w-lg mx-auto">
                No products match the specific combination:
                {activeCategory !== 'All' && <span className="text-[#d4a373] font-medium"> Category &ldquo;{activeCategory}&rdquo;</span>}
                {genderFilter !== 'All' && <span className="text-[#d4a373] font-medium"> · Gender &ldquo;{genderFilter}&rdquo;</span>}
                {searchQuery && <span className="text-[#d4a373] font-medium"> · Search &ldquo;{searchQuery}&rdquo;</span>}
                {selectedOccasionFilter !== 'All' && <span className="text-[#d4a373] font-medium"> · Occasion &ldquo;{selectedOccasionFilter}&rdquo;</span>}
              </p>
            </div>

            {/* Quick Action Recovery Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {activeCategory !== 'All' && (
                <button
                  onClick={() => setActiveCategory('All')}
                  className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-mono text-[#f4f4f5] border border-white/[0.08] transition-colors cursor-pointer"
                >
                  Clear Category ({activeCategory})
                </button>
              )}

              {genderFilter !== 'All' && (
                <button
                  onClick={() => setGenderFilter('All')}
                  className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-mono text-[#f4f4f5] border border-white/[0.08] transition-colors cursor-pointer"
                >
                  Show All Genders
                </button>
              )}

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-mono text-[#f4f4f5] border border-white/[0.08] transition-colors cursor-pointer"
                >
                  Clear Search Keyword
                </button>
              )}

              <button
                onClick={resetAllFilters}
                className="px-5 py-2 rounded-xl bg-[#d4a373] text-[#0D0D0D] font-semibold text-xs tracking-wide hover:bg-[#e0b487] transition-colors cursor-pointer shadow"
              >
                Reset All Filters
              </button>
            </div>

            {/* Auto Suggested Recommendations Below Recovery */}
            <div className="pt-8 border-t border-white/[0.06] text-left">
              <div className="flex items-center gap-2 mb-4 text-xs font-mono text-[#d4a373]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Explore Top Recommender Highlights Instead</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {baseCatalog.slice(0, 4).map((alt) => (
                  <div
                    key={alt.id}
                    onClick={() => onSelectProduct(alt)}
                    className="p-3 rounded-xl bg-[#0c0d0f] border border-white/[0.06] hover:border-[#d4a373]/50 cursor-pointer space-y-2 transition-all group"
                  >
                    <img 
                      src={alt.imageUrl} 
                      alt={alt.name} 
                      className="w-full aspect-[3/4] object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="space-y-0.5">
                      <div className="text-[10px] text-[#71717a] font-mono">{alt.brand}</div>
                      <div className="text-xs text-[#f4f4f5] font-medium truncate">{alt.name}</div>
                      <div className="text-xs text-[#d4a373] font-mono">₹{alt.price.toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Bottom Session Intent & Recommendation Engine Analytics */}
        <div className="pt-12 border-t border-white/[0.06]">
          <div className="max-w-4xl mx-auto">
            <SessionIntentWidget />
          </div>
        </div>

      </div>

      {/* Merchandiser Insight Popup from clicking Card Badge */}
      {inspectingProductData && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
          onClick={() => setInspectingProductData(null)}
        >
          <div 
            className="w-full max-w-lg bg-[#141518] border border-white/[0.12] rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 text-[#f4f4f5]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#d4a373] bg-[#d4a373]/10 px-2.5 py-0.5 rounded-md border border-[#d4a373]/30">
                  Rank #{inspectingProductData.attentionRank} Focus
                </span>
                <h3 className="font-editorial text-xl text-[#f4f4f5] mt-1.5">
                  {inspectingProductData.productName}
                </h3>
                <p className="text-xs text-[#a1a1aa] font-mono">
                  {inspectingProductData.brand} · ₹{inspectingProductData.price.toLocaleString('en-IN')}
                </p>
              </div>

              <button
                onClick={() => setInspectingProductData(null)}
                className="p-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-[#a1a1aa] hover:text-[#f4f4f5]"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-[#0e0f12] border border-white/[0.06]">
                <div className="text-[10px] text-[#71717a] font-mono">Dwell Time</div>
                <div className="text-base font-semibold text-[#f4f4f5] font-mono">{inspectingProductData.dwellTimeSeconds}s</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0e0f12] border border-white/[0.06]">
                <div className="text-[10px] text-[#71717a] font-mono">Fixations</div>
                <div className="text-base font-semibold text-[#f4f4f5] font-mono">{inspectingProductData.fixationCount}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0e0f12] border border-white/[0.06]">
                <div className="text-[10px] text-[#71717a] font-mono">Gaze-to-Cart</div>
                <div className="text-base font-semibold text-emerald-400 font-mono">{inspectingProductData.gazeToCartRate}%</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#191b22] border border-[#d4a373]/30 space-y-2">
              <div className="text-xs font-mono font-semibold text-[#d4a373] flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>Merchandiser Diagnosis</span>
              </div>
              <p className="text-xs text-[#d4d4d8] leading-relaxed">
                {inspectingProductData.actionableInsight}
              </p>
              <div className="text-xs text-emerald-400 pt-1 border-t border-white/[0.06]">
                <span className="font-semibold">Action: </span>
                <span className="text-[#a1a1aa]">{inspectingProductData.merchandiserRecommendation}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectingProductData(null)}
                className="px-4 py-2 rounded-xl bg-[#d4a373] text-[#09090b] text-xs font-mono font-medium hover:bg-[#e0b487]"
              >
                Close Diagnostic
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
