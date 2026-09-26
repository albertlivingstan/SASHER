import React, { useState } from 'react';
import { 
  RESEARCH_METRICS, 
  MODEL_COMPARISONS, 
  ABLATION_STUDY 
} from '../../data/research';
import { TelemetryTrendChart } from './TelemetryTrendChart';
import { ProductDeepResearchSection } from './ProductDeepResearchSection';
import { ModelComparisonGraphicalChart } from './ModelComparisonGraphicalChart';
import { 
  BarChart3, 
  Layers, 
  Award, 
  BookOpen, 
  Zap, 
  CheckCircle2, 
  ArrowUpRight, 
  FileText,
  Activity,
  TrendingUp,
  Cpu
} from 'lucide-react';

export const ResearchDashboardView: React.FC = () => {
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 border-b border-[#27272a]/60 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono tabular-nums uppercase tracking-wider text-[#e2a876] mb-1">
            <span>PEER-REVIEWED EVALUATION BENCHMARK</span>
            <span aria-hidden="true" className="text-[#3f3f46]">·</span>
            <span>DATA-BACKED RIGOR</span>
          </div>
          <h1 className="font-editorial text-4xl sm:text-5xl text-[#f4f4f5]">
            Research & Empirical Evaluation
          </h1>
          <p className="text-sm text-[#71717a] mt-1 max-w-3xl">
            Offline replay evaluation conducted on high-dimensional fashion clickstreams, synchronized eye-gaze tracking datasets, and longitudinal product econometrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMethodologyOpen(!isMethodologyOpen)}
            className="px-4 py-2 rounded-xl bg-[#18191d] hover:bg-[#27272a] text-[#a1a1aa] hover:text-[#f4f4f5] text-xs font-mono tabular-nums transition-colors cursor-pointer flex items-center gap-2 border border-[#27272a]"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{isMethodologyOpen ? 'Hide Methodology' : 'View Methodology'}</span>
          </button>
        </div>
      </div>

      {/* Quick Jump Subnav */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#27272a]/40 text-xs font-mono tabular-nums">
        <span className="text-[#71717a] uppercase text-[10px] mr-1">Jump to:</span>
        <button
          onClick={() => scrollToSection('section-metrics')}
          className="px-3 py-1.5 rounded-lg bg-[#18191d] hover:bg-[#27272a] text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors"
        >
          Core Metrics
        </button>
        <button
          onClick={() => scrollToSection('section-telemetry-trend')}
          className="px-3 py-1.5 rounded-lg bg-[#18191d] hover:bg-[#27272a] text-[#e2a876] font-medium transition-colors flex items-center gap-1.5"
        >
          <Activity className="w-3 h-3 text-[#e2a876]" />
          <span>24h Latency & Volume Trend</span>
        </button>
        <button
          onClick={() => scrollToSection('section-product-research')}
          className="px-3 py-1.5 rounded-lg bg-[#18191d] hover:bg-[#27272a] text-[#e2a876] font-medium transition-colors flex items-center gap-1.5"
        >
          <TrendingUp className="w-3 h-3 text-[#e2a876]" />
          <span>Product Graphical Model & Sales</span>
        </button>
        <button
          onClick={() => scrollToSection('section-benchmarks')}
          className="px-3 py-1.5 rounded-lg bg-[#18191d] hover:bg-[#27272a] text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors"
        >
          Model Comparisons
        </button>
        <button
          onClick={() => scrollToSection('section-ablation')}
          className="px-3 py-1.5 rounded-lg bg-[#18191d] hover:bg-[#27272a] text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors"
        >
          Ablation Study
        </button>
      </div>

      {/* Methodology Expandable Drawer */}
      {isMethodologyOpen && (
        <div className="p-6 bg-[#121316] border border-[#27272a] rounded-2xl text-xs text-[#a1a1aa] space-y-4 animate-in fade-in">
          <div className="flex items-center gap-2 text-[#f4f4f5] font-semibold text-sm">
            <FileText className="w-4 h-4 text-[#e2a876]" />
            <span>Experimental Setup & Statistical Methodology</span>
          </div>
          <p className="leading-relaxed">
            Evaluation was executed following a chronological leave-last-out protocol on an 80/10/10 split across 24,000 fashion browsing sessions. Statistical significance was verified using a paired two-tailed Student&apos;s t-test with Bonferroni correction (p &lt; 0.001 vs strongest baseline SASRec). Gaze fixations were sampled at 30Hz and mapped to bounding boxes with a &plusmn;0.8&deg; visual angle tolerance.
          </p>
          <div className="p-3 bg-[#18191d] rounded-lg border border-[#27272a] font-mono tabular-nums text-[11px] text-[#71717a]">
            Citation: SASHER Architecture — Secure Adaptive Session-Aware Hybrid E-Commerce Recommendation System (2026).
          </div>
        </div>
      )}

      {/* Primary Academic Metrics Cards (Rule 16) */}
      <div id="section-metrics" className="grid grid-cols-2 lg:grid-cols-4 gap-4 scroll-mt-24">
        <div className="p-5 bg-[#121316] border border-[#27272a] rounded-2xl">
          <span className="text-[10px] font-mono tabular-nums uppercase text-[#71717a] block mb-1">
            PRECISION@10
          </span>
          <span className="font-editorial text-4xl text-[#f4f4f5] block">
            {RESEARCH_METRICS.precision10}
          </span>
          <span className="text-[11px] font-mono tabular-nums text-[#10b981] mt-1 block">
            +10.9% over SASRec baseline
          </span>
        </div>

        <div className="p-5 bg-[#121316] border border-[#27272a] rounded-2xl">
          <span className="text-[10px] font-mono tabular-nums uppercase text-[#71717a] block mb-1">
            RECALL@10
          </span>
          <span className="font-editorial text-4xl text-[#f4f4f5] block">
            {RESEARCH_METRICS.recall10}
          </span>
          <span className="text-[11px] font-mono tabular-nums text-[#10b981] mt-1 block">
            +11.4% hit rate coverage
          </span>
        </div>

        <div className="p-5 bg-[#121316] border border-[#27272a] rounded-2xl">
          <span className="text-[10px] font-mono tabular-nums uppercase text-[#71717a] block mb-1">
            MAP@10
          </span>
          <span className="font-editorial text-4xl text-[#f4f4f5] block">
            {RESEARCH_METRICS.map10}
          </span>
          <span className="text-[11px] font-mono tabular-nums text-[#10b981] mt-1 block">
            Mean Average Precision
          </span>
        </div>

        <div className="p-5 bg-[#121316] border border-[#27272a] rounded-2xl">
          <span className="text-[10px] font-mono tabular-nums uppercase text-[#71717a] block mb-1">
            NDCG@10
          </span>
          <span className="font-editorial text-4xl text-[#e2a876] block">
            {RESEARCH_METRICS.ndcg10}
          </span>
          <span className="text-[11px] font-mono tabular-nums text-[#10b981] mt-1 block">
            p = {RESEARCH_METRICS.pValueVsBaseline} (t-test)
          </span>
        </div>
      </div>

      {/* 24-HOUR HOURLY LATENCY & RECOMMENDATION VOLUME TREND CHART (Chart.js Integration) */}
      <div id="section-telemetry-trend" className="scroll-mt-24">
        <TelemetryTrendChart />
      </div>

      {/* GRAPHICAL MODEL OF THE PRODUCT & DEEP RESEARCH OF PAST-YEARS SALES */}
      <div id="section-product-research" className="scroll-mt-24">
        <ProductDeepResearchSection />
      </div>

      {/* Model Comparison Across Algorithms Section (Graphical) */}
      <div id="section-benchmarks" className="scroll-mt-24">
        <ModelComparisonGraphicalChart />
      </div>

      {/* Ablation Study Section (Rule 18) */}
      <div id="section-ablation" className="p-6 bg-[#121316] border border-[#27272a] rounded-2xl space-y-6 scroll-mt-24">
        <div className="pb-4 border-b border-[#27272a]/60">
          <span className="text-[10px] font-mono tabular-nums uppercase tracking-wider text-[#10b981] block">
            COMPONENT CONTRIBUTION
          </span>
          <h3 className="font-editorial text-2xl text-[#f4f4f5] mt-0.5">
            Ablation Study: Removing Subsystems
          </h3>
          <p className="text-xs text-[#71717a] mt-0.5">
            Demonstrates the empirical necessity of every algorithmic layer in the SASHER pipeline.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono tabular-nums">
            <thead>
              <tr className="border-b border-[#27272a] text-[#71717a] uppercase text-[10px]">
                <th className="pb-3 font-medium">Architecture Configuration</th>
                <th className="pb-3 font-medium">NDCG@10</th>
                <th className="pb-3 font-medium">MAP@10</th>
                <th className="pb-3 font-medium text-right">&Delta; Relative Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a]/50 text-[#e4e4e7]">
              {ABLATION_STUDY.map((item, idx) => (
                <tr key={idx} className="hover:bg-[#18191d]/40 transition-colors">
                  <td className="py-3">
                    <span className={idx === 0 ? 'text-[#e2a876] font-semibold' : 'text-[#f4f4f5]'}>
                      {item.configuration}
                    </span>
                    <span className="text-[10px] text-[#71717a] block mt-0.5">{item.description}</span>
                  </td>
                  <td className="py-3 font-medium">{item.ndcg10.toFixed(3)}</td>
                  <td className="py-3 font-medium">{item.map10.toFixed(3)}</td>
                  <td className="py-3 text-right">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      item.deltaPercent === 0 
                        ? 'text-[#a1a1aa] bg-[#27272a]' 
                        : 'text-[#ef4444] bg-[#ef4444]/10'
                    }`}>
                      {item.deltaPercent === 0 ? '0.00% (Baseline)' : `${item.deltaPercent}%`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

