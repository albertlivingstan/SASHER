import React, { useState, useEffect } from 'react';
import { useSasher } from '../../context/SasherContext';
import { RecommendedProduct } from '../../types';
import { INITIAL_PRODUCTS } from '../../data/products';
import { productService } from '../../services/productService';
import { ProductCard } from '../product/ProductCard';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { 
  ShoppingBag, 
  Zap, 
  ShieldCheck, 
  Truck, 
  Star, 
  Search, 
  Filter, 
  Sparkles, 
  Flame, 
  Tag, 
  ChevronLeft, 
  ChevronRight,
  SlidersHorizontal,
  Grid,
  CheckCircle2
} from 'lucide-react';

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
  
  // API State & Pagination
  const [apiProducts, setApiProducts] = useState<RecommendedProduct[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [skip, setSkip] = useState<number>(0);
  const [limit] = useState<number>(20);
  const [totalProducts, setTotalProducts] = useState<number>(0);

  const fashionCategories = [
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

  useEffect(() => {
    let isMounted = true;
    async function loadCatalog() {
      setIsLoading(true);
      try {
        const response = await productService.getProducts(limit, skip);
        if (isMounted) {
          setApiProducts(response.products as RecommendedProduct[]);
          setTotalProducts(response.total || 100);
        }
      } catch (err) {
        console.error('Error loading product catalog:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    loadCatalog();
    return () => {
      isMounted = false;
    };
  }, [skip, limit]);

  // Combine fetched API products with local curated items
  const allShoppingItems = [
    ...recommendedProducts,
    ...apiProducts,
    ...INITIAL_PRODUCTS.filter(p => !recommendedProducts.some(r => r.id === p.id) && !apiProducts.some(a => a.id === p.id))
  ] as RecommendedProduct[];

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
        matchesCat = Boolean((item.popularityScore || 0) > 0.9 || item.id.includes('01') || item.id.includes('02') || item.id.includes('dummy'));
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
    <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Luxury Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#141417] via-[#1c1a17] to-[#141417] border border-[#d4a373]/30 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(212,163,115,0.12)_0%,transparent_70%)] pointer-events-none rounded-full blur-2xl" />
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#d4a373]/15 border border-[#d4a373]/40 text-[#d4a373] text-xs font-mono tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SASHER ADAPTIVE FASHION &amp; LIVE PRODUCT CATALOG</span>
          </div>

          <h1 className="font-editorial text-3xl sm:text-5xl text-[#f4f4f5] tracking-tight leading-tight">
            Curated Luxury, Powered by Adaptive Intelligence
          </h1>

          <p className="text-sm sm:text-base text-[#a1a1aa] leading-relaxed max-w-2xl font-light">
            Seamlessly integrating live global product catalogs with AI-driven preference indexing, real-time visual intent, and guaranteed priority delivery.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-[#d4a373] font-mono">
            <span className="flex items-center gap-2 bg-[#0c0d0e]/60 px-3 py-1.5 rounded-xl border border-white/[0.08]">
              <Truck className="w-4 h-4 text-[#10b981]" />
              <span>Express Global Dispatch</span>
            </span>
            <span className="flex items-center gap-2 bg-[#0c0d0e]/60 px-3 py-1.5 rounded-xl border border-white/[0.08]">
              <ShieldCheck className="w-4 h-4 text-[#10b981]" />
              <span>100% Authenticity Guaranteed</span>
            </span>
            <span className="flex items-center gap-2 bg-[#0c0d0e]/60 px-3 py-1.5 rounded-xl border border-white/[0.08]">
              <CheckCircle2 className="w-4 h-4 text-[#d4a373]" />
              <span>30-Day Assured Returns</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Layout Grid: Sidebar Categories + Catalog View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Category Sidebar (Desktop) */}
        <aside className="hidden lg:block lg:col-span-3 bg-[#121316] border border-white/[0.08] rounded-3xl p-6 sticky top-24 space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <SlidersHorizontal className="w-4 h-4 text-[#d4a373]" />
              <h2 className="text-sm font-semibold tracking-wide text-[#f4f4f5] uppercase font-mono">
                Fashion Categories
              </h2>
            </div>
            <span className="text-[10px] font-mono text-[#71717a]">
              {fashionCategories.length} sects
            </span>
          </div>

          <nav className="space-y-1.5 max-h-[calc(100vh-280px)] overflow-y-auto no-scrollbar pr-1">
            {fashionCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#d4a373] text-[#0D0D0D] font-semibold shadow-md'
                    : 'text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#1a1b20]'
                }`}
              >
                <span>{cat}</span>
                {selectedCategory === cat && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0D0D0D]" />
                )}
              </button>
            ))}
          </nav>

          {/* Price Range Filter Widget */}
          <div className="pt-4 border-t border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-[#a1a1aa]">
              <span>Max Price</span>
              <span className="text-[#d4a373] font-semibold">₹{priceRange.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min="5000"
              max="50000"
              step="2500"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full accent-[#d4a373] cursor-pointer"
            />
          </div>
        </aside>

        {/* Catalog Main Content Area */}
        <main className="lg:col-span-9 space-y-6">
          
          {/* Top Search & Mobile Category Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#121316] border border-white/[0.08]">
            
            {/* Mobile Category Horizontal Scroll */}
            <div className="flex lg:hidden items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              {fashionCategories.map(cat => (
                <button
                  key={`mob-${cat}`}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-[#d4a373] text-[#0D0D0D] font-semibold'
                      : 'bg-[#18191d] text-[#a1a1aa] border border-white/[0.06]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands, or adaptive styles..."
                className="w-full h-11 pl-11 pr-4 bg-[#18191d] border border-white/[0.08] focus:border-[#d4a373] rounded-xl text-xs text-[#f4f4f5] placeholder-[#71717a] outline-none shadow-inner"
              />
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 text-xs font-mono text-[#a1a1aa] shrink-0">
              <span className="hidden sm:inline">Active Filter: <strong className="text-[#d4a373]">{selectedCategory}</strong></span>
            </div>
          </div>

          {/* Results Summary Bar */}
          <div className="flex items-center justify-between text-xs font-mono text-[#a1a1aa] px-1">
            <span>Showing {filteredItems.length} curated items (Total Pool: {totalProducts})</span>
            <span className="text-[#d4a373]">Live DummyJSON API Connected</span>
          </div>

          {/* Product Grid / Loading State */}
          {isLoading ? (
            <LoadingSkeleton count={10} />
          ) : filteredItems.length === 0 ? (
            <div className="py-20 text-center rounded-3xl bg-[#121316] border border-white/[0.08] space-y-4">
              <Sparkles className="w-10 h-10 text-[#d4a373] mx-auto opacity-60 animate-pulse" />
              <div className="space-y-1">
                <h3 className="text-base font-medium text-[#f4f4f5]">No matching products found</h3>
                <p className="text-xs text-[#a1a1aa]">Try adjusting your search or selecting another fashion category.</p>
              </div>
              <button
                onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                className="px-4 py-2 bg-[#d4a373] text-[#0D0D0D] text-xs font-semibold rounded-xl cursor-pointer hover:bg-[#e0b487] transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((product) => (
                <div key={`shop-${product.id}`} className="relative group">
                  <div className="absolute top-3 right-12 z-25 pointer-events-none">
                    <span className="text-[9px] font-mono bg-black/85 backdrop-blur-md text-[#d4a373] px-2 py-0.5 rounded border border-[#d4a373]/30 shadow-md">
                      ⚡ API Live
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
          )}

          {/* Pagination Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-white/[0.08] px-1">
            <button
              onClick={() => setSkip(prev => Math.max(0, prev - limit))}
              disabled={skip === 0 || isLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#121316] border border-white/[0.08] text-xs font-medium text-[#f4f4f5] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1a1b20] transition-colors cursor-pointer shadow-md"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Page</span>
            </button>

            <span className="text-xs font-mono text-[#a1a1aa]">
              Page {Math.floor(skip / limit) + 1} of {Math.ceil(totalProducts / limit) || 5}
            </span>

            <button
              onClick={() => setSkip(prev => prev + limit)}
              disabled={skip + limit >= totalProducts || isLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#121316] border border-white/[0.08] text-xs font-medium text-[#f4f4f5] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1a1b20] transition-colors cursor-pointer shadow-md"
            >
              <span>Next Page</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};
