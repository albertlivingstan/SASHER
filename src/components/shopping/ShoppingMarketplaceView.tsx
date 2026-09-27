import React, { useState } from 'react';
import { useSasher } from '../../context/SasherContext';
import { RecommendedProduct } from '../../types';
import { INITIAL_PRODUCTS } from '../../data/products';
import { ProductCard } from '../product/ProductCard';
import { ShoppingBag, Zap, ShieldCheck, Truck, Star, Search, Filter, Sparkles, Flame, Tag } from 'lucide-react';

interface ShoppingMarketplaceViewProps {
  onSelectProduct: (product: RecommendedProduct) => void;
  onExplainProduct: (product: RecommendedProduct) => void;
}

export const ShoppingMarketplaceView: React.FC<ShoppingMarketplaceViewProps> = ({
  onSelectProduct,
  onExplainProduct
}) => {
  const { recommendedProducts, addToCart } = useSasher();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [priceRange, setPriceRange] = useState<number>(50000);

  // Combine initial products and recommended products for an expansive shopping catalog
  const allShoppingItems = [...recommendedProducts, ...INITIAL_PRODUCTS.filter(p => !recommendedProducts.some(r => r.id === p.id))] as RecommendedProduct[];

  const categories = [
    'All',
    'Women',
    'Men',
    'New Arrivals',
    'Dresses',
    'Tops',
    'Shirts',
    'Trousers',
    'Jeans',
    'Jackets',
    'Blazers',
    'Shoes',
    'Accessories',
    'Bags',
    'Occasions',
    'Sale'
  ];

  const filteredItems = allShoppingItems.filter(item => {
    let matchesCat = true;
    const catLower = selectedCategory.toLowerCase();
    const itemCat = (item.category as string).toLowerCase();
    
    if (selectedCategory !== 'All') {
      if (catLower === 'women') {
        matchesCat = item.gender === 'Women' || item.gender === 'Unisex' || itemCat === 'dresses';
      } else if (catLower === 'men') {
        matchesCat = item.gender === 'Men' || item.gender === 'Unisex' || itemCat === 'tailoring';
      } else if (catLower === 'new arrivals') {
        matchesCat = Boolean((item.popularityScore || 0) > 0.9 || item.id.includes('01') || item.id.includes('02'));
      } else if (catLower === 'dresses') {
        matchesCat = itemCat === 'dresses' || Boolean(item.articleType?.toLowerCase().includes('dress') || item.name.toLowerCase().includes('dress'));
      } else if (catLower === 'tops') {
        matchesCat = itemCat === 'tops' || Boolean(item.articleType?.toLowerCase().includes('top') || item.name.toLowerCase().includes('top') || item.name.toLowerCase().includes('shirt') || item.name.toLowerCase().includes('polo'));
      } else if (catLower === 'shirts') {
        matchesCat = Boolean(item.articleType?.toLowerCase().includes('shirt') || item.name.toLowerCase().includes('shirt'));
      } else if (catLower === 'trousers') {
        matchesCat = itemCat === 'trousers' || Boolean(item.articleType?.toLowerCase().includes('trouser') || item.name.toLowerCase().includes('trouser') || item.name.toLowerCase().includes('pant'));
      } else if (catLower === 'jeans') {
        matchesCat = Boolean(item.articleType?.toLowerCase().includes('jean') || item.name.toLowerCase().includes('jean') || item.description?.toLowerCase().includes('denim'));
      } else if (catLower === 'jackets') {
        matchesCat = itemCat === 'outerwear' || Boolean(item.articleType?.toLowerCase().includes('jacket') || item.name.toLowerCase().includes('jacket') || item.name.toLowerCase().includes('coat'));
      } else if (catLower === 'blazers') {
        matchesCat = itemCat === 'tailoring' || Boolean(item.articleType?.toLowerCase().includes('blazer') || item.name.toLowerCase().includes('blazer'));
      } else if (catLower === 'shoes') {
        matchesCat = itemCat === 'footwear' || Boolean(item.articleType?.toLowerCase().includes('boot') || item.articleType?.toLowerCase().includes('shoe') || item.name.toLowerCase().includes('boot') || item.name.toLowerCase().includes('sneaker'));
      } else if (catLower === 'accessories') {
        matchesCat = itemCat === 'accessories' || itemCat === 'watches & jewelry';
      } else if (catLower === 'bags') {
        matchesCat = itemCat === 'bags' || Boolean(item.name.toLowerCase().includes('bag') || item.name.toLowerCase().includes('tote') || item.name.toLowerCase().includes('backpack'));
      } else if (catLower === 'occasions') {
        matchesCat = Boolean(item.style === 'Tailored' || item.style === 'Architectural' || item.price > 15000);
      } else if (catLower === 'sale') {
        matchesCat = Boolean(item.originalPrice && item.originalPrice > item.price);
      } else {
        matchesCat = itemCat === catLower || Boolean(item.subcategory?.toLowerCase().includes(catLower));
      }
    }

    const matchesQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = item.price <= priceRange;
    return matchesCat && matchesQuery && matchesPrice;
  });

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Marketplace Header Banner (Amazon.in / Flipkart inspired flash sale & assured trust bar) */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#18181c] via-[#221f1a] to-[#18181c] border border-[#d4a373]/30 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#d4a373]/10 blur-3xl pointer-events-none rounded-full" />
        
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4a373]/20 border border-[#d4a373]/40 text-[#d4a373] text-[11px] font-mono">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>SASHER PRIME &amp; FLIPKART ASSURED MEGA STORE</span>
          </div>

          <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-[#f4f4f5] tracking-tight">
            Expanded Luxury &amp; Adaptive Shopping Catalog
          </h1>

          <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed">
            Browse our comprehensive collection featuring verified global courier dispatch, 30-day assured returns, 
            and real-time AI adaptive re-ranking.
          </p>

          <div className="pt-3 flex flex-wrap items-center gap-6 text-xs text-[#d4a373] font-mono">
            <span className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-[#10b981]" />
              <span>Next-Day Priority Delivery</span>
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#10b981]" />
              <span>100% Authenticity Guaranteed</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-[#f59e0b]" />
              <span>Lightning Deals Live</span>
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-2xl bg-[#121316] border border-white/[0.08]">
        
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#d4a373] text-[#0D0D0D] font-semibold shadow-md'
                  : 'bg-[#18191d] hover:bg-[#222328] text-[#a1a1aa] hover:text-[#f4f4f5] border border-white/[0.06]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search & Price Filter */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#71717a]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shopping catalog..."
              className="w-full h-10 pl-10 pr-4 bg-[#18191d] border border-white/[0.08] focus:border-[#d4a373] rounded-xl text-xs text-[#f4f4f5] placeholder-[#71717a] outline-none"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-[#a1a1aa] font-mono shrink-0">
            <span>Max ₹{priceRange.toLocaleString('en-IN')}</span>
            <input
              type="range"
              min="5000"
              max="50000"
              step="2500"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-24 accent-[#d4a373] cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs font-mono text-[#a1a1aa]">
        <span>Showing {filteredItems.length} verified items in store</span>
        <span className="text-[#d4a373]">Amazon Prime &amp; Flipkart Assured Enabled</span>
      </div>

      {/* Expanded Product Grid (5 columns on desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {filteredItems.map((product) => (
          <div key={`shop-${product.id}`} className="relative group">
            {/* Amazon / Flipkart Badge Overlay */}
            <div className="absolute top-3 right-12 z-20 pointer-events-none flex flex-col items-end gap-1">
              <span className="text-[9px] font-mono bg-black/80 backdrop-blur-md text-[#d4a373] px-2 py-0.5 rounded border border-[#d4a373]/30">
                ⚡ Assured
              </span>
            </div>
            <ProductCard
              product={product}
              onSelect={onSelectProduct}
              onExplain={onExplainProduct}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
