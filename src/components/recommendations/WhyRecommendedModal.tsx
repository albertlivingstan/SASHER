import React, { useState, useMemo } from 'react';
import { useSasher } from '../../context/SasherContext';
import { X, Sparkles, Check, ChevronDown, ChevronUp, Cpu, ShieldCheck, Tag, ExternalLink } from 'lucide-react';
import { adaptiveEngine } from '../../services/adaptiveEngine';

export const WhyRecommendedModal: React.FC = () => {
  const { explanationModalProduct, setExplanationModalProduct } = useSasher();
  const [showMath, setShowMath] = useState(false);

  const tailoredReasons = useMemo(() => {
    if (!explanationModalProduct) return null;
    return adaptiveEngine.generateExplainableReasons(explanationModalProduct);
  }, [explanationModalProduct]);

  if (!explanationModalProduct || !tailoredReasons) return null;

  const explanation = explanationModalProduct.explanation || {
    matchScore: tailoredReasons.matchScore,
    reason: "Matched via multi-modal gaze trajectory and style vector embedding.",
    keyFactors: ["Gaze Dwell > 1.8s", "Visual Fit Match", "High Demand Cohort"],
    primaryReasons: tailoredReasons.checkmarks,
    sessionContribution: 35,
    visualAttentionContribution: 40,
    profileContribution: 15,
    contentSimilarityContribution: 10,
    technicalDetails: {
      wSession: 0.35,
      wGaze: 0.40,
      dotProduct: 0.892
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0c0d0e]/90 backdrop-blur-md p-4">
      <div className="relative w-full max-w-xl bg-[#121316] border border-[#27272a] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#27272a]/60">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono-tabular uppercase tracking-wider text-[#e2a876] mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>EXPLAINABLE AI DECOMPOSITION</span>
            </div>
            <h3 className="font-editorial text-2xl sm:text-3xl text-[#f4f4f5]">
              Why You&apos;re Seeing This Product
            </h3>
            <p className="text-xs text-[#a1a1aa] mt-0.5 truncate max-w-sm">
              &quot;{explanationModalProduct.name}&quot; ({explanationModalProduct.category})
            </p>
          </div>

          <button
            onClick={() => setExplanationModalProduct(null)}
            className="p-1.5 text-[#71717a] hover:text-[#f4f4f5] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Match Score Big Stat */}
        <div className="flex items-center justify-between p-4 bg-[#18191d] rounded-xl border border-[#27272a]">
          <div>
            <span className="text-[10px] font-mono-tabular uppercase tracking-wider text-[#71717a] block">
              AGGREGATED RELEVANCE SCORE
            </span>
            <span className="text-xs text-[#a1a1aa]">
              Normalized multi-signal confidence
            </span>
          </div>
          <span className="font-editorial text-4xl text-[#e2a876]">
            {explanation.matchScore}%
          </span>
        </div>

        {/* Retailer & Pricing Verified Pill */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#16171a] border border-white/[0.06] text-xs font-mono">
          <span className="text-[#a1a1aa]">Catalog Availability:</span>
          <span className="text-[#d4a373] font-semibold">{tailoredReasons.retailer} · In Stock · ₹{explanationModalProduct.price.toLocaleString('en-IN')}</span>
        </div>

        {/* Natural Language Reasons */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono-tabular uppercase tracking-wider text-[#71717a] block">
            DETERMINING SIGNALS
          </span>
          <div className="space-y-2 text-xs text-[#e4e4e7]">
            {explanation.primaryReasons.map((reason, idx) => (
              <div key={idx} className="flex items-start gap-2.5 p-2 bg-[#18191d]/50 rounded-lg">
                <Check className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
                <span>{reason}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Horizontal Contribution Bars */}
        <div className="space-y-3 pt-2">
          <span className="text-[10px] font-mono-tabular uppercase tracking-wider text-[#71717a] block">
            SIGNAL CONTRIBUTION PERCENTAGE
          </span>

          <div className="space-y-2.5">
            <div>
              <div className="flex justify-between text-xs font-mono-tabular mb-1">
                <span className="text-[#a1a1aa]">Active Session Drift</span>
                <span className="text-[#e2a876] font-semibold">{explanation.sessionContribution}%</span>
              </div>
              <div className="w-full bg-[#18191d] h-2 rounded-full overflow-hidden border border-[#27272a]">
                <div className="bg-[#e2a876] h-full" style={{ width: `${explanation.sessionContribution}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono-tabular mb-1">
                <span className="text-[#a1a1aa]">Eye Gaze Attention (Visual Dwell)</span>
                <span className="text-[#10b981] font-semibold">{explanation.visualAttentionContribution}%</span>
              </div>
              <div className="w-full bg-[#18191d] h-2 rounded-full overflow-hidden border border-[#27272a]">
                <div className="bg-[#10b981] h-full" style={{ width: `${explanation.visualAttentionContribution}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono-tabular mb-1">
                <span className="text-[#a1a1aa]">Aesthetic Profile Baseline</span>
                <span className="text-[#f4f4f5] font-semibold">{explanation.profileContribution}%</span>
              </div>
              <div className="w-full bg-[#18191d] h-2 rounded-full overflow-hidden border border-[#27272a]">
                <div className="bg-[#a1a1aa] h-full" style={{ width: `${explanation.profileContribution}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono-tabular mb-1">
                <span className="text-[#a1a1aa]">Content & Material Similarity</span>
                <span className="text-[#a1a1aa] font-semibold">{explanation.contentSimilarityContribution}%</span>
              </div>
              <div className="w-full bg-[#18191d] h-2 rounded-full overflow-hidden border border-[#27272a]">
                <div className="bg-[#71717a] h-full" style={{ width: `${explanation.contentSimilarityContribution}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Expandable Technical Math Block for Researchers */}
        <div className="pt-2 border-t border-[#27272a]/60">
          <button
            onClick={() => setShowMath(!showMath)}
            className="w-full flex items-center justify-between text-xs font-mono-tabular text-[#71717a] hover:text-[#a1a1aa] py-1 cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              <span>{showMath ? 'Hide Formal Vector Math' : 'Show Formal Vector Math'}</span>
            </span>
            {showMath ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showMath && (
            <div className="mt-3 p-3 bg-[#0c0d0e] rounded-xl border border-[#27272a] text-[11px] font-mono-tabular space-y-1.5 text-[#a1a1aa]">
              <div className="text-[#e2a876] pb-1 border-b border-[#27272a]">
                Score = &Sigma; w_i &middot; S_i &minus; (1 &minus; &lambda;) &middot; MMR_penalty
              </div>
              <div className="flex justify-between">
                <span>Dynamic Weight Vector w:</span>
                <span className="text-[#f4f4f5]">[w_s: {explanation.technicalDetails.wSession}, w_g: {explanation.technicalDetails.wGaze}]</span>
              </div>
              <div className="flex justify-between">
                <span>Dot Product Score:</span>
                <span className="text-[#f4f4f5]">{explanation.technicalDetails.dotProduct}</span>
              </div>
              <div className="flex justify-between">
                <span>MMR Diversity &lambda;:</span>
                <span className="text-[#10b981]">0.72 (selected)</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
