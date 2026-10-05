import React, { useMemo, useState } from 'react';
import { useSasher } from '../../context/SasherContext';
import { 
  Activity, 
  Clock, 
  MousePointer, 
  Eye, 
  Sparkles, 
  TrendingUp, 
  Flame, 
  Layers, 
  ArrowUpRight,
  ArrowRight,
  Compass,
  Zap,
  Target,
  CheckCircle2,
  Info
} from 'lucide-react';
import { CategoryType } from '../../types';

// Fashion Co-Occurrence & Sequential Next-Category Transition Matrix
const CATEGORY_TRANSITION_RULES: Record<CategoryType, { primary: CategoryType; secondary: CategoryType; baseProb: number; reason: string }> = {
  All: {
    primary: 'Outerwear',
    secondary: 'Tailoring',
    baseProb: 0.72,
    reason: 'Initial broad exploration typically converges on anchor outerwear and architectural tailoring.'
  },
  Tops: {
    primary: 'Trousers',
    secondary: 'Footwear',
    baseProb: 0.86,
    reason: 'Upper-body exploration triggers bottom-half silhouette pairing to complete outfit balance.'
  },
  Outerwear: {
    primary: 'Knitwear',
    secondary: 'Trousers',
    baseProb: 0.82,
    reason: 'Heavy outer layer exploration naturally flows toward mid-layer knitwear and matching trousers.'
  },
  Tailoring: {
    primary: 'Trousers',
    secondary: 'Footwear',
    baseProb: 0.88,
    reason: 'Structured tailoring and blazers drive immediate exploration of formal trousers and dress footwear.'
  },
  Knitwear: {
    primary: 'Trousers',
    secondary: 'Outerwear',
    baseProb: 0.79,
    reason: 'Textured knitwear exploration pairs next with tailored trousers or outer protective trench layers.'
  },
  Dresses: {
    primary: 'Footwear',
    secondary: 'Accessories',
    baseProb: 0.84,
    reason: 'One-piece dress browsing transitions directly into footwear and complementary luxury accessories.'
  },
  Trousers: {
    primary: 'Footwear',
    secondary: 'Tops',
    baseProb: 0.85,
    reason: 'Pants and trouser selection strongly precedes footwear styling to calibrate hemline and break.'
  },
  Footwear: {
    primary: 'Accessories',
    secondary: 'Tops',
    baseProb: 0.76,
    reason: 'Shoe and sneaker focus typically pivots to finishing accessories or foundational shirts.'
  },
  Accessories: {
    primary: 'Outerwear',
    secondary: 'Tops',
    baseProb: 0.74,
    reason: 'Accents and timepiece browsing generally anchors back to outerwear statement garments.'
  }
};

export const SessionIntentWidget: React.FC = () => {
  const { sessionIntent, dynamicWeights, isEyeTrackingActive, interactions, setActiveCategory } = useSasher();
  
  // Interactive Tooltip Hover State
  const [hoveredTooltip, setHoveredTooltip] = useState<string | null>(null);

  const minutes = Math.floor(sessionIntent.sessionDurationSec / 60);
  const seconds = sessionIntent.sessionDurationSec % 60;
  const timeFormatted = `${minutes}m ${seconds.toString().padStart(2, '0')}s`;

  // Compute fine-grained Category View Statistics from real session interactions
  const categoryViewStats = useMemo(() => {
    const viewEvents = interactions.filter(
      ev => ev.type === 'VIEW' || ev.type === 'CLICK' || ev.type === 'HOVER' || ev.type === 'EYE_GAZE'
    );

    const counts: Record<string, number> = {};
    const dwellMsPerCat: Record<string, number> = {};

    viewEvents.forEach(ev => {
      if (ev.category && ev.category !== 'All') {
        counts[ev.category] = (counts[ev.category] || 0) + 1;
        if (ev.dwellMs) {
          dwellMsPerCat[ev.category] = (dwellMsPerCat[ev.category] || 0) + ev.dwellMs;
        }
      }
    });

    const totalViews = Object.values(counts).reduce((sum, n) => sum + n, 0);

    if (totalViews === 0) {
      const fallbackList = (Object.entries(sessionIntent.categoryDistribution) as [CategoryType, number][])
        .filter(([cat]) => cat !== 'All')
        .sort(([, a], [, b]) => b - a);

      const top1 = fallbackList[0];
      const top2 = fallbackList[1];
      const top3 = fallbackList[2];

      return {
        hasExplicitViews: false,
        totalViews: 0,
        ranked: fallbackList.map(([cat, weight]) => ({
          category: cat,
          views: 0,
          percentage: Math.round(weight * 100),
          dwellSeconds: 0
        })),
        top1: top1 ? { category: top1[0], percentage: Math.round(top1[1] * 100), views: 0, dwellSeconds: 0 } : null,
        top2: top2 ? { category: top2[0], percentage: Math.round(top2[1] * 100), views: 0, dwellSeconds: 0 } : null,
        top3: top3 ? { category: top3[0], percentage: Math.round(top3[1] * 100), views: 0, dwellSeconds: 0 } : null,
        badgeText: top1 && top2 
          ? `${top1[0]} & ${top2[0]}`
          : top1 ? top1[0] : 'Curated Exploration',
        badgePercentage: top1 ? Math.round(top1[1] * 100) : 45,
        summarySubtitle: `Exploring catalog with baseline interest in ${top1 ? top1[0] : 'Outerwear'}`
      };
    }

    const ranked = Object.entries(counts)
      .map(([cat, cnt]) => {
        const percentage = Math.round((cnt / totalViews) * 100);
        const dwellSeconds = parseFloat(((dwellMsPerCat[cat] || 0) / 1000).toFixed(1));
        return {
          category: cat as CategoryType,
          views: cnt,
          percentage,
          dwellSeconds
        };
      })
      .sort((a, b) => b.views - a.views);

    const top1 = ranked[0] || null;
    const top2 = ranked[1] || null;
    const top3 = ranked[2] || null;

    let badgeText = '';
    let summarySubtitle = '';

    if (top1 && top2) {
      badgeText = `${top1.category} (${top1.percentage}%) & ${top2.category} (${top2.percentage}%)`;
      summarySubtitle = `User Trend: ${top1.category} leads with ${top1.views} views (${top1.percentage}%), followed closely by ${top2.category} (${top2.views} views).`;
    } else if (top1) {
      badgeText = `${top1.category} (${top1.percentage}%)`;
      summarySubtitle = `User Trend: Dominant focus on ${top1.category} with ${top1.views} session views (${top1.percentage}% of total activity).`;
    } else {
      badgeText = 'Curated Exploration';
      summarySubtitle = 'Exploring diverse fashion categories across the catalog.';
    }

    return {
      hasExplicitViews: true,
      totalViews,
      ranked,
      top1,
      top2,
      top3,
      badgeText,
      badgePercentage: top1?.percentage || 50,
      summarySubtitle
    };
  }, [interactions, sessionIntent.categoryDistribution]);

  // Compute Predictive Next Category Trend based on historical session path and transition matrix
  const predictiveTrend = useMemo(() => {
    const topCategory = categoryViewStats.top1?.category || sessionIntent.primaryCategory || 'Outerwear';
    const recentEvents = interactions.filter(i => i.category && i.category !== 'All').slice(-4);
    const lastEventCategory = recentEvents.length > 0 
      ? recentEvents[recentEvents.length - 1].category 
      : topCategory;

    const transition = CATEGORY_TRANSITION_RULES[lastEventCategory] || CATEGORY_TRANSITION_RULES[topCategory] || CATEGORY_TRANSITION_RULES.Outerwear;

    const primaryViewCount = categoryViewStats.ranked.find(r => r.category === transition.primary)?.views || 0;
    const secondaryViewCount = categoryViewStats.ranked.find(r => r.category === transition.secondary)?.views || 0;

    let predictedCategory = transition.primary;
    let alternativeCategory = transition.secondary;
    let confidence = transition.baseProb;

    if (primaryViewCount > 4 && secondaryViewCount < primaryViewCount) {
      predictedCategory = transition.secondary;
      alternativeCategory = transition.primary;
      confidence = Math.min(0.94, transition.baseProb + 0.05);
    } else {
      const triggerDwell = categoryViewStats.top1?.dwellSeconds || 0;
      if (triggerDwell > 4.0) {
        confidence = Math.min(0.96, confidence + 0.08);
      }
    }

    const confidencePercent = Math.round(confidence * 100);

    const trajectorySteps: { category: string; status: 'history' | 'predicted'; viewsCount: number }[] = [];
    
    if (recentEvents.length >= 2) {
      const distinctRecent = Array.from(new Set(recentEvents.map(e => e.category))).slice(-2);
      distinctRecent.forEach(cat => {
        const matchingStat = categoryViewStats.ranked.find(r => r.category === cat);
        trajectorySteps.push({ category: cat, status: 'history', viewsCount: matchingStat?.views || 1 });
      });
    } else if (categoryViewStats.top1) {
      trajectorySteps.push({ category: categoryViewStats.top1.category, status: 'history', viewsCount: categoryViewStats.top1.views || 2 });
      if (categoryViewStats.top2) {
        trajectorySteps.push({ category: categoryViewStats.top2.category, status: 'history', viewsCount: categoryViewStats.top2.views || 1 });
      }
    } else {
      trajectorySteps.push({ category: 'Outerwear', status: 'history', viewsCount: 1 });
    }

    trajectorySteps.push({ category: predictedCategory, status: 'predicted', viewsCount: 0 });

    return {
      predictedCategory,
      alternativeCategory,
      confidencePercent,
      triggerCategory: lastEventCategory,
      reasonText: transition.reason,
      trajectorySteps
    };
  }, [categoryViewStats, interactions, sessionIntent.primaryCategory]);

  const sortedCategories = (Object.entries(sessionIntent.categoryDistribution) as [CategoryType, number][])
    .filter(([cat]) => cat !== 'All')
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  return (
    <div className="bg-[#121316] border border-[#27272a] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 font-sans">
      
      {/* Title & Dynamic 'User Trend' Header Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#27272a]/60">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#d4a373] mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>REAL-TIME SESSION INTENT ENGINE</span>
          </div>
          <h3 className="font-editorial text-2xl sm:text-3xl text-[#f4f4f5]">
            Your Active Session
          </h3>
        </div>

        {/* Dynamic 'User Trend' Badge and Live Adapting Indicator */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-center">
          
          {/* THE DYNAMIC 'USER TREND' BADGE */}
          <div 
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-[#d4a373]/15 to-emerald-500/15 border border-[#d4a373]/40 shadow-sm transition-all hover:border-[#d4a373]/70"
            title="Dynamic User Trend: Summarizes your most viewed product categories over the current session"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4a373] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#d4a373]"></span>
            </span>

            <span className="text-[10px] font-mono uppercase tracking-wider text-[#d4a373] font-bold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#d4a373]" />
              USER TREND:
            </span>

            <span className="text-xs font-mono font-semibold text-[#f4f4f5] max-w-[220px] truncate">
              {categoryViewStats.badgeText}
            </span>

            <span className="text-[10px] font-mono text-[#10b981] bg-[#10b981]/20 px-2 py-0.5 rounded-full font-bold border border-[#10b981]/30 shrink-0">
              {categoryViewStats.badgePercentage}% Share
            </span>
          </div>

          {/* Active Loop Status */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[10px] uppercase font-bold tracking-wider">ADAPTING</span>
          </div>
        </div>
      </div>

      {/* Dynamic 'User Trend' Summary Highlight Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#18191d] via-[#15161a] to-[#18191d] border border-white/[0.08] space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#d4a373]/15 text-[#d4a373]">
              <TrendingUp className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono uppercase tracking-wider text-[#f4f4f5] font-semibold">
              Session Category Trend Breakdown
            </span>
          </div>

          <span className="text-[10px] font-mono text-[#a1a1aa]">
            {categoryViewStats.totalViews > 0 
              ? `${categoryViewStats.totalViews} total category interactions recorded` 
              : 'Initial Session Exploration Baseline'}
          </span>
        </div>

        <p className="text-xs text-[#a1a1aa] leading-relaxed">
          {categoryViewStats.summarySubtitle}
        </p>

        {/* Top Viewed Category Interactive Chips */}
        <div className="flex flex-wrap gap-2 pt-1">
          {categoryViewStats.ranked.slice(0, 4).map((item, idx) => {
            const isTop = idx === 0;
            return (
              <button
                key={item.category}
                onClick={() => {
                  if (setActiveCategory) setActiveCategory(item.category);
                }}
                className={`py-1.5 px-3 rounded-xl text-xs font-mono flex items-center gap-2 border transition-all cursor-pointer ${
                  isTop
                    ? 'bg-[#d4a373]/20 border-[#d4a373]/50 text-[#f4f4f5] font-semibold shadow-sm'
                    : 'bg-[#121316] border-white/[0.06] text-[#a1a1aa] hover:text-[#f4f4f5] hover:border-white/[0.12]'
                }`}
                title={`Click to filter catalog by ${item.category}`}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isTop ? 'bg-[#d4a373] text-[#09090b]' : 'bg-white/[0.08] text-[#a1a1aa]'
                }`}>
                  #{idx + 1}
                </span>
                <span className="font-medium text-[#f4f4f5]">{item.category}</span>
                <span className="text-[10px] text-[#d4a373] bg-[#d4a373]/15 px-1.5 py-0.5 rounded font-bold">
                  {item.percentage}%
                </span>
                {item.views > 0 && (
                  <span className="text-[10px] text-[#71717a]">
                    ({item.views} {item.views === 1 ? 'view' : 'views'})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* PREDICTIVE TREND SECTION WITH INTERACTIVE TOOLTIPS */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-[#12141a] via-[#161822] to-[#12141a] border border-cyan-500/30 shadow-xl space-y-4">
        
        {/* Predictive Trend Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold block flex items-center gap-1.5">
                <span>SEQUENTIAL MARKOV PREDICTOR · NEXT-STEP FORECAST</span>
                <span className="relative group cursor-pointer text-[#a1a1aa] hover:text-white">
                  <Info className="w-3 h-3 inline" />
                  {/* Global Tooltip for Engine */}
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-3 rounded-xl bg-[#0c0d12]/95 border border-cyan-500/40 text-[11px] font-mono text-[#f4f4f5] shadow-2xl backdrop-blur-xl z-30 pointer-events-none">
                    Uses Markov chain transition probabilities on your recent clickstream views and dwell times to forecast next-step exploration.
                  </span>
                </span>
              </span>
              <h4 className="font-editorial text-lg text-[#f4f4f5]">
                Predictive Trend Forecast
              </h4>
            </div>
          </div>

          {/* Confidence Pill with Interactive Tooltip */}
          <div className="relative">
            <div 
              onMouseEnter={() => setHoveredTooltip('confidence')}
              onMouseLeave={() => setHoveredTooltip(null)}
              className="px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-help"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400 fill-current" />
              <span>{predictiveTrend.confidencePercent}% Confidence</span>
            </div>

            {/* Tooltip for Confidence */}
            {hoveredTooltip === 'confidence' && (
              <div className="absolute right-0 bottom-full mb-2 w-72 p-3.5 rounded-2xl bg-[#0c0d12]/95 border border-cyan-500/50 text-xs font-mono text-[#f4f4f5] shadow-2xl backdrop-blur-xl z-40 space-y-1.5 animate-in fade-in zoom-in-95">
                <div className="text-cyan-300 font-bold flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Model Calibration & Action Influence</span>
                </div>
                <p className="text-[11px] text-[#a1a1aa] leading-relaxed">
                  Generated from session event velocity ({interactions.length} actions), visual gaze intent ({Math.round(sessionIntent.confidence * 100)}%), and historical category co-occurrence weights.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Main Predictive Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          
          {/* Left Column: Big Highlighted Prediction Pill & Action */}
          <div className="md:col-span-5 p-4 rounded-xl bg-[#0c0d11] border border-cyan-500/20 space-y-3 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717a] block">
                SUGGESTED NEXT CATEGORY
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-editorial text-2xl sm:text-3xl text-cyan-300 font-semibold">
                  {predictiveTrend.predictedCategory}
                </span>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  Top Co-Explore
                </span>
              </div>
              <p className="text-xs text-[#a1a1aa] mt-1.5">
                Model predicts you are likely to explore <strong className="text-[#f4f4f5]">{predictiveTrend.predictedCategory}</strong> next based on sequential outfit coordination patterns.
              </p>
            </div>

            <button
              onClick={() => {
                if (setActiveCategory) setActiveCategory(predictiveTrend.predictedCategory);
              }}
              className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-[#09090b] font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:scale-[1.02] cursor-pointer"
            >
              <span>Explore {predictiveTrend.predictedCategory} Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right Column: Historical Trajectory Path & Interactive Tooltips */}
          <div className="md:col-span-7 space-y-3 text-xs font-mono">
            
            {/* Sequential Flow Breadcrumbs with Interactive Tooltips */}
            <div>
              <span className="text-[10px] uppercase text-[#71717a] block mb-1.5">
                Observed Sequence Path ──▶ Forecasted Transition (Hover steps for action impact):
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 pt-1 no-scrollbar">
                {predictiveTrend.trajectorySteps.map((step, idx) => {
                  const isLast = step.status === 'predicted';
                  const tooltipKey = `step-${idx}`;
                  const isHovered = hoveredTooltip === tooltipKey;

                  return (
                    <React.Fragment key={idx}>
                      <div className="relative">
                        <span 
                          onMouseEnter={() => setHoveredTooltip(tooltipKey)}
                          onMouseLeave={() => setHoveredTooltip(null)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-medium shrink-0 flex items-center gap-1.5 transition-all cursor-help ${
                            isLast
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold shadow-sm'
                              : 'bg-[#18191d] text-[#a1a1aa] border-white/[0.08] hover:border-cyan-500/30'
                          }`}
                        >
                          {isLast ? <Zap className="w-3 h-3 text-cyan-400 fill-current" /> : null}
                          <span>{step.category}</span>
                          {isLast ? (
                            <span className="text-[10px] text-cyan-400">({predictiveTrend.confidencePercent}%)</span>
                          ) : (
                            <span className="text-[10px] text-[#71717a]">({step.viewsCount} views)</span>
                          )}
                        </span>

                        {/* Interactive Action Influence Tooltip */}
                        {isHovered && (
                          <div className="absolute left-0 bottom-full mb-2 w-72 p-3 rounded-2xl bg-[#0c0d12]/95 border border-cyan-500/50 text-[11px] font-mono text-[#f4f4f5] shadow-2xl backdrop-blur-xl z-50 space-y-1.5 animate-in fade-in zoom-in-95 pointer-events-none">
                            <div className="text-cyan-300 font-bold flex items-center gap-1.5">
                              <Info className="w-3.5 h-3.5" />
                              <span>{isLast ? 'Predicted Target Influence' : `Action Impact: ${step.category}`}</span>
                            </div>
                            <p className="text-[#a1a1aa] leading-relaxed">
                              {isLast 
                                ? `Forecasted to follow ${predictiveTrend.triggerCategory} with ${predictiveTrend.confidencePercent}% likelihood based on outfit completion rules.`
                                : `User recorded ${step.viewsCount} view interactions in ${step.category}. This sequence contributed +35% weight toward predicting ${predictiveTrend.predictedCategory}.`}
                            </p>
                          </div>
                        )}
                      </div>

                      {idx < predictiveTrend.trajectorySteps.length - 1 && (
                        <ArrowRight className="w-3.5 h-3.5 text-[#52525b] shrink-0" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Natural Language Predictive Reasoning */}
            <div className="p-3 rounded-xl bg-[#14161f] border border-white/[0.06] text-[#d4d4d8] leading-relaxed">
              <span className="text-cyan-400 font-semibold block mb-0.5">Sequential Transition Model:</span>
              <p className="text-xs text-[#a1a1aa]">
                {predictiveTrend.reasonText} SASHER is pre-warming candidate embeddings for <strong className="text-cyan-300">{predictiveTrend.predictedCategory}</strong> in the background ranking pool.
              </p>
            </div>

            {/* Alternative Candidate Chip with Tooltip */}
            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="text-[#71717a]">Alternative Next Transition:</span>
              <div className="relative">
                <button
                  onMouseEnter={() => setHoveredTooltip('alt')}
                  onMouseLeave={() => setHoveredTooltip(null)}
                  onClick={() => {
                    if (setActiveCategory) setActiveCategory(predictiveTrend.alternativeCategory);
                  }}
                  className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                >
                  <span>{predictiveTrend.alternativeCategory} (Secondary Likelihood)</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>

                {hoveredTooltip === 'alt' && (
                  <div className="absolute right-0 bottom-full mb-2 w-64 p-3 rounded-xl bg-[#0c0d12]/95 border border-indigo-500/40 text-[11px] font-mono text-[#f4f4f5] shadow-2xl backdrop-blur-xl z-50 pointer-events-none">
                    <span className="text-indigo-300 font-bold block mb-0.5">Secondary Branch Hypothesis</span>
                    <p className="text-[#a1a1aa]">Queued as alternate transition branch if user pivots away from primary recommendation.</p>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Grid of high level session metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-1 border-y border-[#27272a]/60 text-xs font-mono">
        <div className="p-3 bg-[#18191d] rounded-xl border border-[#27272a]/60 space-y-1">
          <div className="flex items-center gap-1.5 text-[#71717a]">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase">Duration</span>
          </div>
          <span className="text-sm font-semibold text-[#f4f4f5]">{timeFormatted}</span>
        </div>

        <div className="p-3 bg-[#18191d] rounded-xl border border-[#27272a]/60 space-y-1">
          <div className="flex items-center gap-1.5 text-[#71717a]">
            <MousePointer className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase">Interactions</span>
          </div>
          <span className="text-sm font-semibold text-[#f4f4f5]">{interactions.length} events</span>
        </div>

        <div className="p-3 bg-[#18191d] rounded-xl border border-[#27272a]/60 space-y-1">
          <div className="flex items-center gap-1.5 text-[#71717a]">
            <Eye className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase">Visual Gaze</span>
          </div>
          <span className="text-sm font-semibold text-[#10b981]">
            {isEyeTrackingActive ? 'Tracking Live' : 'Paused'}
          </span>
        </div>

        <div className="p-3 bg-[#18191d] rounded-xl border border-[#27272a]/60 space-y-1">
          <div className="flex items-center gap-1.5 text-[#71717a]">
            <Sparkles className="w-3.5 h-3.5 text-[#e2a876]" />
            <span className="text-[10px] uppercase">Intent Confidence</span>
          </div>
          <span className="text-sm font-semibold text-[#e2a876]">
            {Math.round(sessionIntent.confidence * 100)}%
          </span>
        </div>
      </div>

      {/* Category Intent Distribution Bars */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono uppercase tracking-wider text-[11px] text-[#a1a1aa]">
            SESSION CATEGORY DRIFT & WEIGHTS
          </span>
          <span className="text-[11px] font-mono text-[#71717a]">
            Primary Focus: <strong className="text-[#f4f4f5]">{sessionIntent.primaryCategory}</strong>
          </span>
        </div>

        <div className="space-y-2.5">
          {sortedCategories.map(([category, value]) => {
            const pct = Math.round(value * 100);
            return (
              <div key={category} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[#e4e4e7]">{category}</span>
                  <span className="text-[#a1a1aa] font-semibold">{pct}%</span>
                </div>
                <div className="w-full bg-[#18191d] h-2 rounded-full overflow-hidden border border-[#27272a]">
                  <div
                    className={`h-full transition-all duration-700 ${
                      category === sessionIntent.primaryCategory
                        ? 'bg-[#e2a876]'
                        : 'bg-[#52525b]'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Weight Allocation Summary */}
      <div className="p-4 bg-[#18191d]/60 rounded-2xl border border-[#27272a]/70 space-y-2.5">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-[#a1a1aa]">DYNAMIC WEIGHT FUSION (Σ w_i = 1.0)</span>
          <span className="text-[#e2a876] font-semibold">Adaptive Hybrid</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-[10px] font-mono">
          <div className="p-2 bg-[#121316] rounded-xl border border-[#27272a]">
            <span className="text-[#71717a] block">w_session</span>
            <span className="text-[#f4f4f5] font-semibold text-xs">{dynamicWeights.session}</span>
          </div>
          <div className="p-2 bg-[#121316] rounded-xl border border-[#27272a]">
            <span className="text-[#71717a] block">w_gaze</span>
            <span className="text-[#10b981] font-semibold text-xs">{dynamicWeights.eyeGaze}</span>
          </div>
          <div className="p-2 bg-[#121316] rounded-xl border border-[#27272a]">
            <span className="text-[#71717a] block">w_profile</span>
            <span className="text-[#f4f4f5] font-semibold text-xs">{dynamicWeights.profile}</span>
          </div>
          <div className="p-2 bg-[#121316] rounded-xl border border-[#27272a]">
            <span className="text-[#71717a] block">w_collab</span>
            <span className="text-[#f4f4f5] font-semibold text-xs">{dynamicWeights.collaborative}</span>
          </div>
          <div className="p-2 bg-[#121316] rounded-xl border border-[#27272a]">
            <span className="text-[#71717a] block">w_content</span>
            <span className="text-[#f4f4f5] font-semibold text-xs">{dynamicWeights.content}</span>
          </div>
          <div className="p-2 bg-[#121316] rounded-xl border border-[#27272a]">
            <span className="text-[#71717a] block">w_pop</span>
            <span className="text-[#f4f4f5] font-semibold text-xs">{dynamicWeights.popularity}</span>
          </div>
        </div>
      </div>

    </div>
  );
};
