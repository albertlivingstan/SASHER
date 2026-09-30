import React, { useState } from 'react';
import { CategoryType, RecommendedProduct } from '../../types';
import { CATEGORIES } from '../../data/products';
import { useSasher } from '../../context/SasherContext';
import { ProductCard } from './ProductCard';
import { Search, SlidersHorizontal, Sparkles, RefreshCw, ChevronDown, Filter, Flame, Route } from 'lucide-react';

interface ProductGridProps {
  onSelectProduct: (product: RecommendedProduct) => void;
  onExplainProduct: (product: RecommendedProduct) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ onSelectProduct, onExplainProduct }) => {
  const { 
    recommendedProducts, 
    activeCategory, 
    setActiveCategory, 
    searchQuery, 
    setSearchQuery,
    sessionIntent,
    resetSession
  } = useSasher();

  const [sortBy, setSortBy] = useState<'match' | 'price-asc' | 'price-desc' | 'popularity'>('match');
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<string>('All Sizes');
  const [selectedColorFilter, setSelectedColorFilter] = useState<string>('Colors');
  const [selectedOccasionFilter, setSelectedOccasionFilter] = useState<string>('Occasions');
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

  const toggleHeatmap = () => {
    setIsHeatmapActive(prev => {
      const next = !prev;
      try {
        localStorage.setItem('sasher_merchandiser_heatmap', String(next));
      } catch {}
      return next;
    });
  };

  const toggleVizMode = () => {
    setVisualizationMode(prev => {
      const next = prev === 'intensity' ? 'path' : 'intensity';
      try {
        localStorage.setItem('sasher_gaze_viz_mode', next);
      } catch {}
      return next;
    });
  };

  // Filter products by active category, size, color and search
  const filteredProducts = recommendedProducts.filter(product => {
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSize = selectedSizeFilter === 'All Sizes' || (product.availableSizes && product.availableSizes.includes(selectedSizeFilter));
    const matchesColor = selectedColorFilter === 'Colors' || (product.color && product.color.toLowerCase().includes(selectedColorFilter.toLowerCase()));

    return matchesCategory && matchesSearch && matchesSize && matchesColor;
  });

  // Sort
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'match') return b.explanation.matchScore - a.explanation.matchScore;
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'popularity') return b.popularityScore - a.popularityScore;
    return 0;
  });

  return (
    <section className="py-8 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Section Title */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-editorial text-2xl sm:text-3xl text-[#f4f4f5] tracking-tight">
          All Browsed
        </h2>
        <span className="text-xs font-mono text-[#a1a1aa]">
          {sortedProducts.length} items available
        </span>
      </div>

      {/* Compact Filter Bar & Pills */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 pb-4 border-b border-white/[0.08]">
        
        {/* Compact Filter Pills: [ User ▾ ] [ All Sizes ▾ ] [ Categories ▾ ] [ Colors ▾ ] [ Occasions ▾ ] */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar flex-wrap">
          
          {/* User Filter Dropdown / Toggle */}
          <div className="px-3.5 py-2 rounded-xl bg-[#151518] hover:bg-[#1a1a1f] border border-white/[0.08] text-xs text-[#d4a373] font-medium flex items-center gap-2 cursor-pointer">
            <span>User</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
          </div>

          {/* Sizes Pill */}
          <select 
            value={selectedSizeFilter}
            onChange={(e) => setSelectedSizeFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-[#151518] hover:bg-[#1a1a1f] border border-white/[0.08] text-xs text-[#a1a1aa] focus:text-[#f4f4f5] outline-none cursor-pointer appearance-none pr-8 relative"
            style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%27292.4%27%20height%3D%27292.4%27%3E%3Cpath%20fill%3D%27%2371717a%27%20d%3D%27M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%27%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', backgroundSize: '9px' }}
          >
            <option value="All Sizes">All Sizes ▾</option>
            <option value="S">Size S</option>
            <option value="M">Size M</option>
            <option value="L">Size L</option>
            <option value="XL">Size XL</option>
          </select>

          {/* Categories Pill / Dropdown */}
          <select
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value as CategoryType)}
            className="px-3.5 py-2 rounded-xl bg-[#151518] hover:bg-[#1a1a1f] border border-white/[0.08] text-xs text-[#a1a1aa] focus:text-[#f4f4f5] outline-none cursor-pointer appearance-none pr-8"
            style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%27292.4%27%20height%3D%27292.4%27%3E%3Cpath%20fill%3D%27%2371717a%27%20d%3D%27M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%27%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', backgroundSize: '9px' }}
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat} ▾</option>
            ))}
          </select>

          {/* Colors Pill */}
          <select
            value={selectedColorFilter}
            onChange={(e) => setSelectedColorFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-[#151518] hover:bg-[#1a1a1f] border border-white/[0.08] text-xs text-[#a1a1aa] focus:text-[#f4f4f5] outline-none cursor-pointer appearance-none pr-8"
            style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%27292.4%27%20height%3D%27292.4%27%3E%3Cpath%20fill%3D%27%2371717a%27%20d%3D%27M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%27%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', backgroundSize: '9px' }}
          >
            <option value="Colors">Colors ▾</option>
            <option value="Camel">Camel / Warm</option>
            <option value="Black">Black / Dark</option>
            <option value="Beige">Beige / Ivory</option>
          </select>

          {/* Occasions Pill */}
          <select
            value={selectedOccasionFilter}
            onChange={(e) => setSelectedOccasionFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-[#151518] hover:bg-[#1a1a1f] border border-white/[0.08] text-xs text-[#a1a1aa] focus:text-[#f4f4f5] outline-none cursor-pointer appearance-none pr-8"
            style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%27292.4%27%20height%3D%27292.4%27%3E%3Cpath%20fill%3D%27%2371717a%27%20d%3D%27M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%27%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', backgroundSize: '9px' }}
          >
            <option value="Occasions">Occasions ▾</option>
            <option value="Formal">Formal &amp; Atelier</option>
            <option value="Casual">Luxury Casual</option>
          </select>

        </div>

        {/* Far Right: [ Heatmap ] [ Filters ] [ Sort ▾ ] */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={toggleHeatmap}
            className={`px-3 py-2 rounded-xl border text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
              isHeatmapActive
                ? 'bg-amber-500/20 text-[#d4a373] border-[#d4a373] font-semibold shadow-sm'
                : 'bg-[#151518] hover:bg-[#1a1a1f] border-white/[0.08] text-[#a1a1aa]'
            }`}
            title="Toggle Merchandiser Dwell Heatmap"
          >
            <Flame className={`w-3.5 h-3.5 ${isHeatmapActive ? 'fill-current text-[#d4a373]' : 'text-[#71717a]'}`} />
            <span>Heatmap {isHeatmapActive ? 'ON' : 'OFF'}</span>
          </button>

          {isHeatmapActive && (
            <button
              onClick={toggleVizMode}
              className={`px-3 py-2 rounded-xl border text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                visualizationMode === 'path'
                  ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 font-semibold'
                  : 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-semibold'
              }`}
              title="Toggle between 'Intensity' (dwell time) and 'Path' (saccade flow) modes"
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

          <button
            onClick={() => resetSession()}
            className="px-3.5 py-2 rounded-xl bg-[#151518] hover:bg-[#1a1a1f] border border-white/[0.08] text-xs text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Filter className="w-3.5 h-3.5 text-[#d4a373]" />
            <span>Filters</span>
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3.5 py-2 rounded-xl bg-[#151518] hover:bg-[#1a1a1f] border border-white/[0.08] text-xs text-[#a1a1aa] focus:text-[#f4f4f5] outline-none cursor-pointer appearance-none pr-8"
            style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%27292.4%27%20height%3D%27292.4%27%3E%3Cpath%20fill%3D%27%2371717a%27%20d%3D%27M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%27%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', backgroundSize: '9px' }}
          >
            <option value="match">Sort: Adaptive Match ▾</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="popularity">Most Popular</option>
          </select>
        </div>
      </div>

      {/* Product Grid - 5 columns on desktop where screen width allows */}
      {sortedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {sortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              showHeatmap={isHeatmapActive}
              heatmapMode={visualizationMode}
              onSelect={onSelectProduct}
              onExplain={onExplainProduct}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center rounded-2xl bg-[#121316] border border-white/[0.08]">
          <Sparkles className="w-8 h-8 text-[#d4a373] mx-auto mb-3 animate-pulse" />
          <h3 className="text-lg font-editorial text-[#f4f4f5]">No matching pieces found</h3>
          <p className="text-xs text-[#a1a1aa] mt-1">Try adjusting your filters or search query.</p>
          <button
            onClick={() => { setActiveCategory('All'); setSearchQuery(''); setSelectedSizeFilter('All Sizes'); }}
            className="mt-4 px-4 py-2 rounded-xl bg-[#d4a373] text-[#0D0D0D] text-xs font-semibold cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}
    </section>
  );
};
