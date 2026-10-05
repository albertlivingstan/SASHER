import React, { useState } from 'react';
import { 
  Heart, 
  X, 
  Sparkles, 
  RotateCcw, 
  ArrowRight, 
  Zap, 
  Check, 
  Sliders, 
  Eye, 
  Flame,
  Award
} from 'lucide-react';
import { Product } from '../../types';
import { adaptiveEngine } from '../../services/adaptiveEngine';
import { useSasher } from '../../context/SasherContext';

interface SwipeToTrainViewProps {
  onFinishTraining?: () => void;
  onExploreRecommendations?: () => void;
}

export const SwipeToTrainView: React.FC<SwipeToTrainViewProps> = ({
  onFinishTraining,
  onExploreRecommendations
}) => {
  const { products } = useSasher();
  const [profile, setProfile] = useState(() => adaptiveEngine.getProfile());
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [swipeLog, setSwipeLog] = useState<{ id: string; action: 'LIKE' | 'SKIP' | 'SUPERLIKE'; name: string }[]>([]);
  const [animatingDirection, setAnimatingDirection] = useState<'left' | 'right' | 'up' | null>(null);

  // Deck of products to swipe through
  const deck = products.length > 0 ? products : [];
  const currentProduct = deck[currentIndex % Math.max(1, deck.length)];

  const handleAction = (action: 'LIKE' | 'SKIP' | 'SUPERLIKE') => {
    if (!currentProduct) return;

    setAnimatingDirection(action === 'LIKE' ? 'right' : action === 'SKIP' ? 'left' : 'up');

    setTimeout(() => {
      // Record adaptive learning interaction
      const interactionType = action === 'LIKE' ? 'SWIPE_LIKE' : action === 'SUPERLIKE' ? 'SAVE' : 'SWIPE_SKIP';
      const updated = adaptiveEngine.recordInteraction(interactionType, currentProduct);
      setProfile(updated);

      setSwipeLog(prev => [{ id: currentProduct.id, action, name: currentProduct.name }, ...prev.slice(0, 7)]);
      setCurrentIndex(prev => prev + 1);
      setAnimatingDirection(null);
    }, 240);
  };

  const progressPercent = Math.min(100, Math.round((profile.swipeCount / 20) * 100));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8 font-sans">
      
      {/* Top Header & Context Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4a373]/15 border border-[#d4a373]/30 text-xs font-mono text-[#d4a373]">
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>REINFORCEMENT LEARNING · ACTIVE TASTE CALIBRATION</span>
        </div>
        <h1 className="font-editorial text-3xl sm:text-4xl text-[#f4f4f5]">
          Swipe to Train SASHER
        </h1>
        <p className="text-xs sm:text-sm text-[#a1a1aa] max-w-lg mx-auto">
          Teach SASHER your subconscious fashion preferences in seconds. Every swipe reweights the underlying adaptive recommendation engine.
        </p>
      </div>

      {/* Progress & Cold-Start Stage Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#121316] border border-white/[0.08] space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-[#d4a373] font-bold">
              {profile.swipeCount} / 20 Swipes
            </span>
            <span className="text-[#71717a]">·</span>
            <span className="text-[#a1a1aa]">
              {profile.swipeCount >= 20 
                ? 'High Accuracy Profile Achieved' 
                : `${20 - profile.swipeCount} more to complete rapid training`}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 font-semibold text-[10px]">
            STAGE {profile.coldStartStage}: {profile.coldStartStage === 1 ? 'CONTENT-BASED' : profile.coldStartStage === 2 ? 'BEHAVIORAL HYBRID' : profile.coldStartStage === 3 ? 'COLLABORATIVE MATRIX' : 'SESSION-ADAPTIVE'}
          </span>
        </div>

        <div className="w-full bg-[#1e2025] h-2 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-[#d4a373] via-[#e8c49e] to-[#10b981] h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Interactive Swipe Stage */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Interactive Card Deck */}
        <div className="md:col-span-7 flex flex-col items-center">
          
          {currentProduct ? (
            <div className="relative w-full max-w-sm">
              
              {/* Product Card */}
              <div 
                className={`relative rounded-3xl overflow-hidden bg-[#15161a] border border-white/[0.12] shadow-2xl transition-transform duration-200 select-none ${
                  animatingDirection === 'left' 
                    ? '-translate-x-32 rotate-[-12deg] opacity-0' 
                    : animatingDirection === 'right' 
                    ? 'translate-x-32 rotate-[12deg] opacity-0' 
                    : animatingDirection === 'up' 
                    ? '-translate-y-32 scale-95 opacity-0' 
                    : 'translate-x-0 rotate-0 opacity-100'
                }`}
              >
                {/* Image Container with Luxury Gradient */}
                <div className="relative aspect-[3/4] w-full bg-[#0a0a0c] overflow-hidden">
                  <img
                    src={currentProduct.imageUrl}
                    alt={currentProduct.name}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e0f12] via-transparent to-black/30" />

                  {/* Floating Attribute Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                    <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/[0.1] text-[10px] font-mono font-medium text-[#f4f4f5]">
                      {currentProduct.brand}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-[#d4a373]/90 text-[#09090b] text-[10px] font-mono font-bold">
                      {currentProduct.fit || 'Regular'} Fit
                    </span>
                  </div>

                  {/* Product Details Gradient Overlay at Bottom */}
                  <div className="absolute bottom-0 inset-x-0 p-5 space-y-2 z-10">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#d4a373] bg-[#d4a373]/20 px-2 py-0.5 rounded">
                        {currentProduct.style}
                      </span>
                      <span className="text-[10px] font-mono text-[#a1a1aa]">
                        {currentProduct.color}
                      </span>
                    </div>

                    <h3 className="font-editorial text-2xl text-[#f4f4f5] leading-tight drop-shadow">
                      {currentProduct.name}
                    </h3>

                    <div className="flex items-baseline justify-between pt-1">
                      <span className="font-mono text-xl font-bold text-[#f4f4f5]">
                        ₹{currentProduct.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-[#a1a1aa] font-mono">
                        {currentProduct.category}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Controls: [ SKIP ← ] [ ⭐ SUPERLIKE ] [ ❤️ LIKE → ] */}
                <div className="p-4 bg-[#111215] border-t border-white/[0.06] flex items-center justify-around gap-3">
                  
                  {/* Skip Button */}
                  <button
                    onClick={() => handleAction('SKIP')}
                    className="flex-1 py-3 px-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center gap-2 text-xs font-mono font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    title="Skip (Press Left Arrow)"
                  >
                    <X className="w-4 h-4" />
                    <span>SKIP</span>
                  </button>

                  {/* Superlike / Save */}
                  <button
                    onClick={() => handleAction('SUPERLIKE')}
                    className="p-3.5 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-all hover:scale-110 active:scale-95 cursor-pointer"
                    title="Superlike / Must Have"
                  >
                    <Sparkles className="w-5 h-5 fill-current" />
                  </button>

                  {/* Like Button */}
                  <button
                    onClick={() => handleAction('LIKE')}
                    className="flex-1 py-3 px-4 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 flex items-center justify-center gap-2 text-xs font-mono font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    title="Like (Press Right Arrow)"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                    <span>LIKE</span>
                  </button>
                </div>

              </div>

              {/* Sub-card Keyboard Tip */}
              <div className="mt-3 text-center text-[10px] font-mono text-[#71717a]">
                Pro Tip: Tap Skip or Like to immediately reweight style weights
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-[#141518] rounded-3xl border border-white/[0.08]">
              <Sparkles className="w-8 h-8 text-[#d4a373] mx-auto mb-3" />
              <h3 className="font-editorial text-xl text-[#f4f4f5]">Training Deck Completed</h3>
              <p className="text-xs text-[#a1a1aa] mt-1">You&apos;ve trained SASHER on our curated catalog.</p>
            </div>
          )}

        </div>

        {/* Right Column: Live Adaptive Taste Vector Radar & Learned Biases */}
        <div className="md:col-span-5 space-y-4">
          
          {/* Active Adaptive State Card */}
          <div className="p-5 rounded-2xl bg-[#141518] border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#d4a373] flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                LIVE LEARNED WEIGHT MATRIX
              </span>
              <span className="text-xs font-mono text-[#10b981]">
                ADAPTIVE LOOP ACTIVE
              </span>
            </div>

            {/* Dynamic Weights Visualization */}
            <div className="space-y-2 text-xs font-mono">
              <div>
                <div className="flex justify-between text-[#a1a1aa] text-[11px] mb-1">
                  <span>Style Similarity</span>
                  <span className="text-[#d4a373] font-bold">
                    {(profile.adaptiveWeights.styleSimilarity * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-[#1e2025] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#d4a373] h-full" style={{ width: `${profile.adaptiveWeights.styleSimilarity * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[#a1a1aa] text-[11px] mb-1">
                  <span>Color Preference</span>
                  <span className="text-sky-400 font-bold">
                    {(profile.adaptiveWeights.colorPreference * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-[#1e2025] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-sky-400 h-full" style={{ width: `${profile.adaptiveWeights.colorPreference * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[#a1a1aa] text-[11px] mb-1">
                  <span>Budget Precision</span>
                  <span className="text-emerald-400 font-bold">
                    {(profile.adaptiveWeights.budgetMatch * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-[#1e2025] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full" style={{ width: `${profile.adaptiveWeights.budgetMatch * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[#a1a1aa] text-[11px] mb-1">
                  <span>Occasion Fit</span>
                  <span className="text-purple-400 font-bold">
                    {(profile.adaptiveWeights.occasionMatch * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-[#1e2025] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-purple-400 h-full" style={{ width: `${profile.adaptiveWeights.occasionMatch * 100}%` }} />
                </div>
              </div>
            </div>

            {/* Learned Taste Biases Pill Cloud */}
            <div className="pt-2 border-t border-white/[0.06] space-y-2">
              <span className="text-[10px] font-mono text-[#71717a] uppercase block">
                Top Learned Feature Biases
              </span>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(profile.learnedColorBiases)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 4)
                  .map(([color, bias]) => (
                    <span key={color} className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-sky-500/10 text-sky-300 border border-sky-500/20">
                      Color: {color} (+{bias})
                    </span>
                  ))}
                {Object.entries(profile.learnedFitBiases)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 2)
                  .map(([fit, bias]) => (
                    <span key={fit} className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-[#d4a373]/15 text-[#d4a373] border border-[#d4a373]/30">
                      Fit: {fit} (+{bias})
                    </span>
                  ))}
              </div>
            </div>
          </div>

          {/* Recent Swipes Stream */}
          {swipeLog.length > 0 && (
            <div className="p-4 rounded-2xl bg-[#0e0f12] border border-white/[0.06] space-y-2">
              <span className="text-[10px] font-mono text-[#71717a] uppercase block">
                Real-Time Training Feedback Log
              </span>
              <div className="space-y-1.5 text-xs font-mono">
                {swipeLog.map((log, i) => (
                  <div key={i} className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                    <span className="text-[#a1a1aa] truncate max-w-[200px]">{log.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      log.action === 'LIKE' ? 'bg-emerald-500/20 text-emerald-400' :
                      log.action === 'SUPERLIKE' ? 'bg-amber-500/20 text-amber-300' :
                      'bg-rose-500/20 text-rose-400'
                    }`}>
                      {log.action}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Call to Action: Regenerate Recommendations */}
          <button
            onClick={() => {
              if (onExploreRecommendations) onExploreRecommendations();
              else if (onFinishTraining) onFinishTraining();
            }}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#d4a373] to-[#e8c49e] text-[#09090b] font-bold text-xs font-mono tracking-wider uppercase flex items-center justify-center gap-2 shadow-xl hover:brightness-105 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>Apply Learned Style & Explore Feed</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </div>

      </div>

    </div>
  );
};
