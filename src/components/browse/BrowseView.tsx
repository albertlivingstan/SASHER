import React, { useState, useMemo } from 'react';
import { useSasher } from '../../context/SasherContext';
import { CategoryType, RecommendedProduct } from '../../types';
import { CATEGORIES } from '../../data/products';
import { ProductCard } from '../product/ProductCard';
import { SessionIntentWidget } from '../session/SessionIntentWidget';
import { RankingService } from '../../services/RankingService';
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
  Tag
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

  const [sortBy, setSortBy] = useState<'hybrid' | 'price-asc' | 'price-desc' | 'popularity' | 'rating'>('hybrid');
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<string>('All');
  const [selectedOccasionFilter, setSelectedOccasionFilter] = useState<string>('All');
  const [selectedStyleFilter, setSelectedStyleFilter] = useState<string>('All');

  const userColdStartStatus = useMemo(() => {
    return RankingService.getUserColdStartStatus(interactions.length);
  }, [interactions.length]);

  // Comprehensive filter logic
  const filteredProducts = useMemo(() => {
    return recommendedProducts.filter(product => {
      // 1. Category
      const matchesCategory = activeCategory === 'All' || product.category === activeCategory;

      // 2. Gender
      const matchesGender = 
        genderFilter === 'All' || 
        product.gender === 'Unisex' || 
        product.gender === genderFilter;

      // 3. Search query
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        product.name.toLowerCase().includes(q) ||
        product.brand.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q) ||
        product.color.toLowerCase().includes(q) ||
        (product.description && product.description.toLowerCase().includes(q)) ||
        (product.tags && product.tags.some(t => t.toLowerCase().includes(q)));

      // 4. Size
      const matchesSize = 
        selectedSizeFilter === 'All' || 
        (product.availableSizes && product.availableSizes.includes(selectedSizeFilter));

      // 5. Occasion
      const matchesOccasion = 
        selectedOccasionFilter === 'All' || 
        (product.occasion && product.occasion.toLowerCase() === selectedOccasionFilter.toLowerCase()) ||
        (selectedOccasionFilter === 'Festive' && (product.season === 'Festive' || product.style === 'Traditional'));

      // 6. Style
      const matchesStyle = 
        selectedStyleFilter === 'All' || 
        product.style.toLowerCase() === selectedStyleFilter.toLowerCase();

      return matchesCategory && matchesGender && matchesSearch && matchesSize && matchesOccasion && matchesStyle;
    });
  }, [
    recommendedProducts, 
    activeCategory, 
    genderFilter, 
    searchQuery, 
    selectedSizeFilter, 
    selectedOccasionFilter, 
    selectedStyleFilter
  ]);

  // Sort logic
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
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
    setSortBy('hybrid');
  };

  const hasActiveFilters = 
    activeCategory !== 'All' || 
    genderFilter !== 'All' || 
    searchQuery.trim().length > 0 || 
    selectedSizeFilter !== 'All' || 
    selectedOccasionFilter !== 'All' || 
    selectedStyleFilter !== 'All';

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
                Explore handloom textiles, contemporary silhouettes, and festive Indian atelier pieces ranked via the session-aware hybrid recommender engine.
              </p>
            </div>

            {/* Quick Engine Status Indicator */}
            <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
              <div className="px-3 py-1.5 rounded-full bg-[#141518] border border-white/[0.08] flex items-center gap-2 text-xs font-mono">
                <span className="text-[#71717a]">User State:</span>
                <span className={`font-semibold ${
                  userColdStartStatus === 'NEW_USER' ? 'text-[#e0b487]' : 'text-[#10b981]'
                }`}>
                  {userColdStartStatus === 'NEW_USER' ? 'Cold-Start (Guest)' : 'Active Session'}
                </span>
              </div>

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
                placeholder="Search raw silk, sherwanis, black leather, tailored kurtas..."
                className="w-full h-11 pl-10 pr-10 bg-[#141518] border border-white/[0.08] focus:border-[#d4a373]/60 rounded-xl text-xs text-[#f4f4f5] placeholder-[#71717a] outline-none transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717a] hover:text-[#f4f4f5] text-sm"
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
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
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
              <option value="Minimalist">Minimalist</option>
              <option value="Tailored">Tailored</option>
              <option value="Architectural">Architectural</option>
              <option value="Traditional">Traditional / Indian</option>
              <option value="Festive">Festive</option>
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
              Showing <span className="text-[#f4f4f5] font-semibold">{sortedProducts.length}</span> of {recommendedProducts.length} garments
            </span>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#71717a] font-mono hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 rounded-lg bg-[#141518] border border-white/[0.08] text-xs text-[#d4a373] font-medium outline-none cursor-pointer"
              >
                <option value="hybrid">✨ Hybrid Recommendation Score</option>
                <option value="popularity">🔥 Popularity & Sales Volume</option>
                <option value="rating">★ Highest Customer Rating</option>
                <option value="price-asc">₹ Price: Low to High</option>
                <option value="price-desc">₹ Price: High to Low</option>
              </select>
            </div>
          </div>

        </div>

        {/* Product Cards Grid */}
        {sortedProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {sortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={() => onSelectProduct(product)}
                onExplain={() => onExplainProduct(product)}
              />
            ))}
          </div>
        ) : (
          /* Empty Search State */
          <div className="py-24 text-center space-y-4 bg-[#121316] border border-white/[0.06] rounded-3xl p-8 max-w-xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-[#71717a]">
              <Search className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-editorial text-2xl text-[#f4f4f5]">
                No matching garments found
              </h3>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">
                No products match the selected filters or search keyword &ldquo;{searchQuery}&rdquo;. Try clearing filters or exploring general fashion categories.
              </p>
            </div>
            <button
              onClick={resetAllFilters}
              className="px-5 py-2.5 rounded-xl bg-[#d4a373] text-[#0D0D0D] font-medium text-xs tracking-wide hover:bg-[#e0b487] transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* Bottom Session Intent & Recommendation Engine Analytics */}
        <div className="pt-12 border-t border-white/[0.06]">
          <div className="max-w-4xl mx-auto">
            <SessionIntentWidget />
          </div>
        </div>

      </div>

    </div>
  );
};
