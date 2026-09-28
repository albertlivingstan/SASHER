import React from 'react';
import { useSasher } from '../../context/SasherContext';
import { useAuth } from '../../context/AuthContext';
import { ParticleField } from '../ui/ParticleField';
import { CountUp } from '../ui/CountUp';
import { ArrowRight, Eye, Sparkles, SlidersHorizontal, ShieldCheck, Compass } from 'lucide-react';

interface HeroSectionProps {
  onExplore: () => void;
  onHowItWorks: () => void;
  onOpenTelemetry?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExplore, onHowItWorks, onOpenTelemetry }) => {
  const { sessionIntent, hybridWeights, isEyeTrackingActive, recommendedProducts, setIsVisualIntentModalOpen } = useSasher();
  const { isAuthenticated, openSignInModal, user } = useAuth();

  const heroFeaturedProduct = recommendedProducts[0];

  return (
    <section className="relative overflow-hidden pt-10 sm:pt-14 pb-16 sm:pb-20 border-b border-white/[0.08] bg-[#0a0a0c]">
      {/* Subtle luxury particle backdrop */}
      <ParticleField className="opacity-40" densityScale={0.7} interactive={true} />

      {/* Ambient Radial Vignette */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, rgba(212,163,115,0.06), transparent 75%)'
        }}
        aria-hidden="true"
      />

      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Hero Editorial Statement */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8 text-left">
            
            {/* Editorial Overline */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono tracking-widest uppercase text-[#d4a373]">
              <Sparkles className="w-3 h-3" />
              <span>SASHER · ADAPTIVE FASHION RECOMMENDATIONS</span>
            </div>

            {/* Exact Headline requested */}
            <h1 className="font-editorial text-5xl sm:text-6xl xl:text-7xl font-normal leading-[1.04] text-[#f4f4f5] tracking-tight">
              Fashion that adapts <br className="hidden sm:block" />
              <span className="italic font-light text-[#d4a373]">to you.</span>
            </h1>

            {/* Exact Supporting text requested */}
            <p className="text-base sm:text-lg text-[#a1a1aa] font-light leading-relaxed max-w-xl">
              Discover styles shaped by your preferences, interactions, and visual intent.
            </p>

            {/* Exact CTAs requested */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              {/* Primary CTA: "Explore Collection" */}
              <button
                onClick={onExplore}
                className="px-8 py-3.5 bg-[#f4f4f5] hover:bg-[#ffffff] text-[#09090b] rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-200 shadow-xl hover:shadow-2xl cursor-pointer flex items-center gap-2.5 hover:scale-[1.02]"
              >
                <span>Explore Collection</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#09090b]" />
              </button>

              {/* Secondary CTA: "Discover Your Style" */}
              <button
                onClick={onHowItWorks}
                className="px-7 py-3.5 bg-[#141417] hover:bg-[#1a1a1f] border border-white/[0.12] hover:border-[#d4a373]/60 text-[#f4f4f5] rounded-full text-xs font-medium tracking-wider transition-all cursor-pointer flex items-center gap-2"
              >
                <Compass className="w-3.5 h-3.5 text-[#d4a373]" />
                <span>Discover Your Style</span>
              </button>

              {/* Visual Intent Status Badge */}
              <button
                onClick={() => setIsVisualIntentModalOpen(true)}
                className="px-4 py-3.5 rounded-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-xs font-mono text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors cursor-pointer flex items-center gap-2"
              >
                <Eye className="w-3.5 h-3.5 text-[#d4a373]" />
                <span className="text-[11px]">Visual Intent Active</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
              </button>
            </div>

            {/* Live Recommendation Engine Signals Strip */}
            <div className="pt-6 border-t border-white/[0.08] grid grid-cols-3 gap-4 text-left">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#71717a] block tracking-wider">PREFERENCE SIGNAL</span>
                <span className="font-editorial text-2xl text-[#f4f4f5]">
                  <CountUp value={Math.round(sessionIntent.confidence * 100)} suffix="%" durationMs={900} />
                </span>
                <span className="text-[11px] text-[#a1a1aa] block truncate">{sessionIntent.primaryCategory}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-[#71717a] block tracking-wider">VISUAL INTENT</span>
                <span className="font-editorial text-2xl text-[#10b981]">
                  {isEyeTrackingActive ? 'ACTIVE' : 'READY'}
                </span>
                <span className="text-[11px] text-[#a1a1aa] block">+3.5× Dwell Weight</span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-[#71717a] block tracking-wider">HYBRID FUSION</span>
                <span className="font-editorial text-2xl text-[#d4a373]">
                  <CountUp value={Math.round((hybridWeights.alpha + hybridWeights.gamma) * 100)} suffix="%" durationMs={900} />
                </span>
                <span className="text-[11px] text-[#a1a1aa] block">Adaptive Balance</span>
              </div>
            </div>

          </div>

          {/* Right Column: Premium Fashion Showcase Card */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Product Card */}
              <div 
                className="relative rounded-3xl overflow-hidden bg-[#121316] border border-white/[0.08] shadow-2xl group transition-all duration-300"
                data-gaze-product-id={heroFeaturedProduct?.id}
                data-gaze-category={heroFeaturedProduct?.category}
              >
                <div className="aspect-[3/4] w-full overflow-hidden relative">
                  <img
                    src={heroFeaturedProduct?.imageUrl}
                    alt={heroFeaturedProduct?.name || 'Featured Luxury Garment'}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-700 opacity-95"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />

                  {/* Scrim overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/25 to-transparent pointer-events-none" />

                  {/* Editorial Brand Label */}
                  <div className="absolute top-4 left-4">
                    <span className="text-[11px] font-mono tracking-wider uppercase text-[#f4f4f5]/90 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/[0.08]">
                      {heroFeaturedProduct?.brand || 'ATELIER NOIR'}
                    </span>
                  </div>

                  {/* Adaptive match pill */}
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-[#d4a373]/40 text-[11px] font-mono text-[#d4a373]">
                    <Sparkles className="w-3 h-3 text-[#d4a373]" />
                    <span>{heroFeaturedProduct?.explanation.matchScore || 95}% MATCH</span>
                  </div>

                  {/* Bottom details */}
                  <div className="absolute bottom-6 left-6 right-6 space-y-2">
                    <div className="flex items-center justify-between text-xs text-[#a1a1aa] font-mono">
                      <span>{heroFeaturedProduct?.category} · {heroFeaturedProduct?.style}</span>
                      <span className="text-[#d4a373]">Adaptive Highlight</span>
                    </div>

                    <h3 className="font-editorial text-2xl sm:text-3xl text-[#f4f4f5] leading-tight">
                      {heroFeaturedProduct?.name}
                    </h3>

                    <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
                      <span className="font-mono text-base font-semibold text-[#f4f4f5]">
                        {heroFeaturedProduct?.currency}{heroFeaturedProduct?.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-[#a1a1aa] max-w-[60%] truncate text-right">
                        {heroFeaturedProduct?.explanation.primaryReasons[0] || 'Matches your aesthetic intent'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Signal Badge 1 */}
              <div className="absolute -bottom-4 -left-4 sm:-left-6 bg-[#141417]/95 border border-white/[0.08] rounded-2xl p-3 shadow-2xl backdrop-blur-md hidden sm:block max-w-[210px]">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#71717a] mb-0.5">
                  <SlidersHorizontal className="w-3 h-3 text-[#d4a373]" />
                  <span>RECOMMENDATION SIGNAL</span>
                </div>
                <div className="text-xs font-medium text-[#f4f4f5]">
                  Interaction-Weighted Ranking
                </div>
                <p className="text-[10px] text-[#a1a1aa] mt-0.5">
                  Continuous re-ranking without reload
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* 3 Grounded Luxury Discovery Pillars */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div className="p-5 rounded-2xl bg-[#121316] border border-white/[0.06] text-left space-y-1.5">
            <span className="text-[10px] uppercase font-mono tracking-wider text-[#d4a373] block">
              01 · ADAPTIVE PERSONALIZATION
            </span>
            <div className="text-xl font-editorial text-[#f4f4f5]">
              Real-Time Preference Learning
            </div>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              Every view, hover dwell, and wishlist signal continuously recalibrates your personalized recommendation feed.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#121316] border border-white/[0.06] text-left space-y-1.5">
            <span className="text-[10px] uppercase font-mono tracking-wider text-[#d4a373] block">
              02 · VISUAL INTENT SIGNALS
            </span>
            <div className="text-xl font-editorial text-[#f4f4f5]">
              Attention Dwell & Visual Focus
            </div>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              Discreet gaze and hover dwell indicators measure which silhouettes hold your attention, elevating similar garments.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#121316] border border-white/[0.06] text-left space-y-1.5">
            <span className="text-[10px] uppercase font-mono tracking-wider text-[#d4a373] block">
              03 · EXPLAINABLE AI
            </span>
            <div className="text-xl font-editorial text-[#f4f4f5]">
              Transparent Recommendation Factors
            </div>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              Every suggested piece clearly explains why it was chosen based on style similarity, color preference, and session trend.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
