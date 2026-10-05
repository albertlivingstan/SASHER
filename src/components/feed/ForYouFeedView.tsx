import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  CloudSun, 
  ShoppingBag, 
  Eye, 
  Heart, 
  ExternalLink, 
  Sliders, 
  Check, 
  Tag, 
  Layers, 
  ArrowRight,
  Flame,
  Calendar,
  Zap,
  CloudRain
} from 'lucide-react';
import { useSasher } from '../../context/SasherContext';
import { Product, RecommendedProduct } from '../../types';
import { 
  adaptiveEngine, 
  CURRENT_WEATHER_MUMBAI 
} from '../../services/adaptiveEngine';
import { 
  CuratedOutfitLook, 
  OccasionType 
} from '../../types/adaptiveFashion';
import { ProductCard } from '../product/ProductCard';

interface ForYouFeedViewProps {
  onSelectProduct: (product: RecommendedProduct) => void;
  onExplainProduct: (product: RecommendedProduct) => void;
  onOpenStyleQuiz: () => void;
  onOpenSwipeTrain: () => void;
  onOpenWardrobe: () => void;
}

const OCCASION_FILTERS: { id: OccasionType; label: string; icon: string }[] = [
  { id: 'College', label: 'College', icon: '🎓' },
  { id: 'Casual', label: 'Casual', icon: '☕' },
  { id: 'Office', label: 'Interview & Work', icon: '💼' },
  { id: 'Party', label: 'Party & Night Out', icon: '🎉' },
  { id: 'Wedding', label: 'Wedding & Festive', icon: '💒' },
  { id: 'Date', label: 'Date Night', icon: '❤️' },
  { id: 'Gym', label: 'Athleisure & Gym', icon: '🏋️' },
  { id: 'Travel', label: 'Airport & Travel', icon: '✈️' }
];

export const ForYouFeedView: React.FC<ForYouFeedViewProps> = ({
  onSelectProduct,
  onExplainProduct,
  onOpenStyleQuiz,
  onOpenSwipeTrain,
  onOpenWardrobe
}) => {
  const { products, recommendedProducts, addToCart } = useSasher();
  const profile = adaptiveEngine.getProfile();
  
  const [selectedOccasion, setSelectedOccasion] = useState<OccasionType>('College');
  const [customBudget, setCustomBudget] = useState<number>(profile.targetBudget || 2000);
  const [isAssemblingBudgetOutfit, setIsAssemblingBudgetOutfit] = useState<boolean>(false);

  // Dynamic greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Budget Assembler Look
  const budgetLook = useMemo(() => {
    return adaptiveEngine.assembleBudgetOutfit(customBudget, selectedOccasion, products);
  }, [customBudget, selectedOccasion, products]);

  // Curated Daily Outfits
  const dailyOutfits = useMemo(() => {
    return adaptiveEngine.getCuratedDailyOutfits(products);
  }, [products]);

  // Top Individual Recommendations adapted to chosen occasion
  const occasionProducts = useMemo(() => {
    const pool = recommendedProducts.length > 0 ? recommendedProducts : (products as RecommendedProduct[]);
    return pool
      .filter(p => !p.occasion || p.occasion === selectedOccasion || selectedOccasion === 'Casual')
      .slice(0, 10);
  }, [recommendedProducts, products, selectedOccasion]);

  const handleAddFullOutfitToCart = (outfit: CuratedOutfitLook) => {
    outfit.items.forEach(it => {
      if (!it.isOwned && 'id' in it.item) {
        addToCart(it.item as Product);
      }
    });
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 font-sans">
      
      {/* Editorial Header Greeting & Profile Chip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#d4a373] mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>DAILY PERSONALIZED FASHION INTELLIGENCE</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl text-[#f4f4f5] tracking-tight">
            {greeting}, {profile.name} 👋
          </h1>
          <p className="text-xs sm:text-sm text-[#a1a1aa] mt-1">
            Based on your <span className="text-[#f4f4f5] font-medium">{profile.styleArchetype}</span> profile, {profile.totalInteractionCount} interactions, and real-time context:
          </p>
        </div>

        {/* Quick Style Profile Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenSwipeTrain}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-[#d4a373] border border-[#d4a373]/40 text-xs font-mono font-semibold flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>Swipe to Train ({profile.swipeCount}/20)</span>
          </button>

          <button
            onClick={onOpenWardrobe}
            className="px-3.5 py-2 rounded-xl bg-[#141518] hover:bg-[#1a1b20] border border-white/[0.08] text-xs font-mono text-[#a1a1aa] hover:text-[#f4f4f5] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Virtual Wardrobe</span>
          </button>

          <button
            onClick={onOpenStyleQuiz}
            className="px-3.5 py-2 rounded-xl bg-[#141518] hover:bg-[#1a1b20] border border-white/[0.08] text-xs font-mono text-[#d4a373] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Style Quiz</span>
          </button>
        </div>
      </div>

      {/* Weather Context Ribbon (Feature 8) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#12141a] via-[#151720] to-[#12141a] border border-sky-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
            <CloudRain className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-sky-300">
                {CURRENT_WEATHER_MUMBAI.city} · {CURRENT_WEATHER_MUMBAI.temperatureC}°C
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                {CURRENT_WEATHER_MUMBAI.humidityPercent}% Humidity · {CURRENT_WEATHER_MUMBAI.rainProbability}% Rain
              </span>
            </div>
            <p className="text-xs text-[#d4d4d8] mt-0.5">
              {CURRENT_WEATHER_MUMBAI.clothingAdvice}
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-[#a1a1aa] bg-[#0c0d0f] px-3.5 py-2 rounded-xl border border-white/[0.06] shrink-0">
          <span className="text-[10px] text-[#71717a] block uppercase">Recommended Fabric</span>
          <span className="text-sky-300 font-semibold">{CURRENT_WEATHER_MUMBAI.recommendedFabric}</span>
        </div>
      </div>

      {/* Occasion Switcher Ribbon (Feature 9) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-[#a1a1aa] flex items-center gap-2">
            <span>WHAT ARE YOU DRESSING FOR?</span>
            <span className="text-[#d4a373]">({selectedOccasion})</span>
          </span>
          <span className="text-[10px] font-mono text-[#71717a]">
            Adapting ranking parameters to {selectedOccasion} context
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {OCCASION_FILTERS.map(occ => {
            const isSelected = selectedOccasion === occ.id;
            return (
              <button
                key={occ.id}
                onClick={() => setSelectedOccasion(occ.id)}
                className={`py-2 px-3.5 rounded-xl text-xs font-medium border flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#d4a373] text-[#09090b] font-bold border-[#d4a373] shadow-md'
                    : 'bg-[#141518] hover:bg-[#1a1b20] border-white/[0.08] text-[#a1a1aa] hover:text-[#f4f4f5]'
                }`}
              >
                <span>{occ.icon}</span>
                <span>{occ.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CURATED DAILY OUTFITS GRID (Feature 5) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-editorial text-2xl sm:text-3xl text-[#f4f4f5]">
              Today&apos;s Curated Outfits
            </h2>
            <p className="text-xs text-[#a1a1aa]">
              Multi-piece ensembles calibrated to your silhouette and budget
            </p>
          </div>
          <span className="text-xs font-mono text-[#d4a373]">
            {dailyOutfits.length} Curated Looks
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {dailyOutfits.map((outfit) => (
            <div 
              key={outfit.id}
              className="p-5 rounded-3xl bg-[#121316] border border-white/[0.08] hover:border-[#d4a373]/40 transition-all shadow-xl flex flex-col justify-between space-y-4 group"
            >
              {/* Header Match Badge & Occasion */}
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 text-xs font-mono font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  <span>{outfit.matchScore}% Match</span>
                </span>
                <span className="text-xs font-mono text-[#a1a1aa] bg-[#1a1b20] px-2.5 py-0.5 rounded-full border border-white/[0.06]">
                  {outfit.occasion}
                </span>
              </div>

              {/* Title & Explanation */}
              <div>
                <h3 className="font-editorial text-xl text-[#f4f4f5] group-hover:text-[#d4a373] transition-colors">
                  {outfit.title}
                </h3>
                <p className="text-xs text-[#a1a1aa] mt-1 line-clamp-2">
                  {outfit.explanation}
                </p>
              </div>

              {/* Coordinated Items Thumbnails & Breakdown */}
              <div className="space-y-2 py-2 border-y border-white/[0.06]">
                {outfit.items.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2.5">
                      <img 
                        src={'imageUrl' in it.item ? it.item.imageUrl : ''} 
                        alt={it.item.name}
                        className="w-10 h-10 rounded-lg object-cover border border-white/[0.08]"
                      />
                      <div>
                        <div className="text-[#f4f4f5] font-medium truncate max-w-[150px]">
                          {it.item.name}
                        </div>
                        <div className="text-[10px] text-[#71717a]">
                          {it.role} · {it.retailer || 'Atelier'}
                        </div>
                      </div>
                    </div>
                    <span className="text-[#d4a373] font-semibold">
                      ₹{it.price.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total Cost & Actions */}
              <div className="space-y-3 pt-1">
                <div className="flex items-baseline justify-between font-mono">
                  <span className="text-xs text-[#a1a1aa]">Total Ensemble Cost</span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-[#f4f4f5]">
                      ₹{outfit.totalCost.toLocaleString('en-IN')}
                    </span>
                    {outfit.remainingBudget > 0 && (
                      <span className="text-[10px] text-[#10b981] block">
                        ₹{outfit.remainingBudget} within budget
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAddFullOutfitToCart(outfit)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-[#d4a373] hover:bg-[#e0b487] text-[#09090b] font-bold text-xs font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add Full Look to Bag</span>
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* PRICE / BUDGET INTELLIGENCE TOOL (Feature 11) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#141518] to-[#0e0f12] border border-[#d4a373]/30 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#d4a373]/15 text-[#d4a373] border border-[#d4a373]/30 text-[10px] font-mono mb-1">
              <Tag className="w-3 h-3" />
              <span>BUDGET INTELLIGENCE ENGINE</span>
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl text-[#f4f4f5]">
              Generate Coordinated Outfit Under ₹{customBudget.toLocaleString('en-IN')}
            </h2>
            <p className="text-xs text-[#a1a1aa]">
              Slide your target budget. SASHER will assemble top, bottom, and footwear perfectly under your limit.
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-[#a1a1aa] font-mono">Target Budget</span>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-[#d4a373]">
              ₹{customBudget.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Budget Slider */}
        <div className="space-y-2">
          <input
            type="range"
            min={1200}
            max={8000}
            step={200}
            value={customBudget}
            onChange={e => setCustomBudget(Number(e.target.value))}
            className="w-full accent-[#d4a373]"
          />
          <div className="flex justify-between text-[10px] font-mono text-[#71717a]">
            <span>₹1,200 (Minimal Budget)</span>
            <span>₹3,000 (Popular Sweetspot)</span>
            <span>₹8,000 (Luxury Ensemble)</span>
          </div>
        </div>

        {/* Dynamic Assembled Result Box */}
        <div className="p-5 rounded-2xl bg-[#0c0d0f] border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <span className="text-xs font-mono font-semibold text-[#f4f4f5]">
              Assembled Look: {budgetLook.title}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#10b981] font-bold">
                Total: ₹{budgetLook.totalCost.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Budget Remaining: ₹{budgetLook.remainingBudget}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {budgetLook.items.map((it, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-[#141518] border border-white/[0.06] flex items-center gap-3">
                <img 
                  src={'imageUrl' in it.item ? it.item.imageUrl : ''} 
                  alt={it.item.name}
                  className="w-12 h-12 rounded-lg object-cover border border-white/[0.08]"
                />
                <div className="min-w-0">
                  <div className="text-[10px] font-mono text-[#71717a] uppercase">{it.role}</div>
                  <div className="text-xs font-semibold text-[#f4f4f5] truncate">{it.item.name}</div>
                  <div className="text-xs font-mono text-[#d4a373] mt-0.5">₹{it.price.toLocaleString('en-IN')} · {it.retailer}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => handleAddFullOutfitToCart(budgetLook)}
              className="px-5 py-2.5 rounded-xl bg-[#d4a373] hover:bg-[#e0b487] text-[#09090b] font-bold text-xs font-mono flex items-center gap-2 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add Assembled Outfit to Bag</span>
            </button>
          </div>
        </div>
      </div>

      {/* INDIVIDUAL OCCASION RECOMMENDATIONS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-editorial text-2xl sm:text-3xl text-[#f4f4f5]">
              Pieces Matched to Your Style Profile
            </h2>
            <p className="text-xs text-[#a1a1aa]">
              Click &quot;Why this?&quot; on any card to view the exact checkmarked Explainable AI match breakdown
            </p>
          </div>
          <span className="text-xs font-mono text-[#a1a1aa]">
            {occasionProducts.length} Pieces
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {occasionProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onSelect={onSelectProduct}
              onExplain={onExplainProduct}
            />
          ))}
        </div>
      </div>

    </div>
  );
};
