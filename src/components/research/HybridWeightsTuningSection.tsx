import React, { useState, useEffect } from 'react';
import { RankingService, RecommendationConfigWeights, RecommendationConfig } from '../../services/RankingService';
import { useSasher } from '../../context/SasherContext';
import { 
  Sliders, 
  Sparkles, 
  RefreshCw, 
  Check, 
  Info, 
  Download, 
  Zap, 
  Cpu, 
  TrendingUp, 
  ShieldCheck,
  Save,
  HelpCircle
} from 'lucide-react';

export const HybridWeightsTuningSection: React.FC = () => {
  const { products, interactions, searchQuery } = useSasher();
  const [config, setConfig] = useState<RecommendationConfig>(() => RankingService.getConfig());
  const [weights, setWeights] = useState<RecommendationConfigWeights>(() => RankingService.getWeights());
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activePreset, setActivePreset] = useState<string>('balanced');

  useEffect(() => {
    const unsubscribe = RankingService.subscribe((newConfig) => {
      setConfig(newConfig);
      setWeights(newConfig.weights);
    });
    return unsubscribe;
  }, []);

  const totalSum = 
    weights.CF_WEIGHT + 
    weights.CBF_WEIGHT + 
    weights.SESSION_WEIGHT + 
    weights.POPULARITY_WEIGHT + 
    weights.COLD_START_WEIGHT;

  const normalized = {
    cf: Math.round((weights.CF_WEIGHT / (totalSum || 1)) * 100),
    cbf: Math.round((weights.CBF_WEIGHT / (totalSum || 1)) * 100),
    session: Math.round((weights.SESSION_WEIGHT / (totalSum || 1)) * 100),
    pop: Math.round((weights.POPULARITY_WEIGHT / (totalSum || 1)) * 100),
    coldStart: Math.round((weights.COLD_START_WEIGHT / (totalSum || 1)) * 100)
  };

  const handleWeightChange = (key: keyof RecommendationConfigWeights, val: number) => {
    const updated = {
      ...weights,
      [key]: parseFloat(val.toFixed(2))
    };
    setWeights(updated);
    RankingService.setWeights(updated);
    setActivePreset('custom');
    showSaveToast();
  };

  const applyPreset = (presetName: string, presetWeights: RecommendationConfigWeights) => {
    setActivePreset(presetName);
    setWeights(presetWeights);
    RankingService.setWeights(presetWeights);
    showSaveToast();
  };

  const handleReset = () => {
    RankingService.resetToDefaultWeights();
    const defaults = RankingService.getWeights();
    setWeights(defaults);
    setActivePreset('balanced');
    showSaveToast();
  };

  const showSaveToast = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleDownloadConfig = () => {
    const currentConfig = RankingService.getConfig();
    const blob = new Blob([JSON.stringify(currentConfig, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recommendation_config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Preview sample calculation on catalog
  const sampleRankings = RankingService.rankProducts(
    products.slice(0, 8),
    interactions,
    ['Festive', 'Traditional', 'Minimalist'],
    searchQuery,
    null,
    3
  );

  return (
    <div id="section-hybrid-tuning" className="p-6 sm:p-8 bg-[#121316] border border-[#27272a] rounded-3xl space-y-8 scroll-mt-24 shadow-2xl text-[#f4f4f5]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#27272a]/60">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#d4a373]">
            <Sliders className="w-3.5 h-3.5" />
            <span>HYPERPARAMETER TUNING</span>
            <span className="text-[#3f3f46]">·</span>
            <span>RESEARCH ENGINE CONFIG</span>
          </div>
          <h2 className="font-editorial text-2xl sm:text-3xl text-[#f4f4f5]">
            Hybrid Recommendation Weights (HybridScore Formula)
          </h2>
          <p className="text-xs text-[#a1a1aa] max-w-3xl leading-relaxed">
            Configure the 5 core objective signal weights defined in <code className="text-[#d4a373] bg-[#18191d] px-1.5 py-0.5 rounded text-[11px] font-mono">recommendation_config.json</code>. Weights are normalized on the fly and instantaneously applied across user sessions and catalog rankings.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          {savedSuccess && (
            <span className="text-xs font-mono text-[#10b981] flex items-center gap-1 bg-[#10b981]/10 px-2.5 py-1 rounded-full border border-[#10b981]/30 animate-in fade-in">
              <Check className="w-3.5 h-3.5" />
              <span>Applied Live</span>
            </span>
          )}

          <button
            onClick={handleDownloadConfig}
            className="px-3.5 py-2 rounded-xl bg-[#18191d] hover:bg-[#27272a] text-[#a1a1aa] hover:text-[#f4f4f5] text-xs font-mono border border-[#27272a] transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Download current recommendation_config.json"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl bg-[#18191d] hover:bg-[#27272a] text-[#a1a1aa] hover:text-[#f4f4f5] text-xs font-mono border border-[#27272a] transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Reset weights to default config"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Formula Mathematical Notation Banner */}
      <div className="p-4 sm:p-5 bg-[#18191d] rounded-2xl border border-[#27272a] space-y-2">
        <span className="text-[10px] font-mono text-[#71717a] uppercase tracking-wider block">
          Governing Hybrid Optimization Function:
        </span>
        <div className="font-mono text-xs sm:text-sm text-[#d4a373] overflow-x-auto py-1">
          HybridScore(i) = &alpha; &times; CF(i) + &beta; &times; CBF(i) + &gamma; &times; Session(i) + &delta; &times; Popularity(i) + &epsilon; &times; ColdStart(i)
        </div>
        <p className="text-[11px] text-[#71717a] leading-relaxed">
          Where &Sigma;(&alpha; + &beta; + &gamma; + &delta; + &epsilon;) = 1.0 (normalized). Each signal represents an orthogonal recommender subsystem mitigating user and item cold-start in Indian e-commerce.
        </p>
      </div>

      {/* Strategy Preset Chips */}
      <div className="space-y-2">
        <label className="text-[11px] font-mono text-[#71717a] uppercase tracking-wider block">
          Quick Research Strategy Presets:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          
          <button
            onClick={() => applyPreset('balanced', {
              CF_WEIGHT: 0.25,
              CBF_WEIGHT: 0.25,
              SESSION_WEIGHT: 0.25,
              POPULARITY_WEIGHT: 0.15,
              COLD_START_WEIGHT: 0.10
            })}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              activePreset === 'balanced'
                ? 'bg-[#d4a373]/15 border-[#d4a373] text-[#f4f4f5]'
                : 'bg-[#18191d] border-[#27272a] text-[#a1a1aa] hover:border-white/[0.2]'
            }`}
          >
            <span className="text-xs font-semibold block">Balanced Hybrid</span>
            <span className="text-[10px] text-[#71717a] block mt-0.5">Equal CF, CBF & Session focus</span>
          </button>

          <button
            onClick={() => applyPreset('coldstart', {
              CF_WEIGHT: 0.10,
              CBF_WEIGHT: 0.35,
              SESSION_WEIGHT: 0.20,
              POPULARITY_WEIGHT: 0.10,
              COLD_START_WEIGHT: 0.25
            })}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              activePreset === 'coldstart'
                ? 'bg-[#10b981]/15 border-[#10b981] text-[#f4f4f5]'
                : 'bg-[#18191d] border-[#27272a] text-[#a1a1aa] hover:border-white/[0.2]'
            }`}
          >
            <span className="text-xs font-semibold block text-[#10b981]">Cold-Start Mitigation</span>
            <span className="text-[10px] text-[#71717a] block mt-0.5">High CBF & Cold-Start prior</span>
          </button>

          <button
            onClick={() => applyPreset('session', {
              CF_WEIGHT: 0.15,
              CBF_WEIGHT: 0.20,
              SESSION_WEIGHT: 0.45,
              POPULARITY_WEIGHT: 0.10,
              COLD_START_WEIGHT: 0.10
            })}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              activePreset === 'session'
                ? 'bg-[#60a5fa]/15 border-[#60a5fa] text-[#f4f4f5]'
                : 'bg-[#18191d] border-[#27272a] text-[#a1a1aa] hover:border-white/[0.2]'
            }`}
          >
            <span className="text-xs font-semibold block text-[#60a5fa]">Session Intent Dominant</span>
            <span className="text-[10px] text-[#71717a] block mt-0.5">Focus on clicks & visual gaze</span>
          </button>

          <button
            onClick={() => applyPreset('collab', {
              CF_WEIGHT: 0.45,
              CBF_WEIGHT: 0.20,
              SESSION_WEIGHT: 0.15,
              POPULARITY_WEIGHT: 0.15,
              COLD_START_WEIGHT: 0.05
            })}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              activePreset === 'collab'
                ? 'bg-[#c084fc]/15 border-[#c084fc] text-[#f4f4f5]'
                : 'bg-[#18191d] border-[#27272a] text-[#a1a1aa] hover:border-white/[0.2]'
            }`}
          >
            <span className="text-xs font-semibold block text-[#c084fc]">Collaborative Heavy</span>
            <span className="text-[10px] text-[#71717a] block mt-0.5">Interaction matrix affinity</span>
          </button>

        </div>
      </div>

      {/* Visual Weight Distribution Stacked Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[#71717a] uppercase text-[10px]">
            Normalized Influence Share (% of Hybrid Decision):
          </span>
          <span className="text-[#d4a373] font-bold">100% Total Slate Mix</span>
        </div>

        <div className="h-3 w-full bg-[#18191d] rounded-full overflow-hidden flex border border-[#27272a]">
          <div style={{ width: `${normalized.cf}%` }} className="bg-[#c084fc] h-full transition-all duration-300" title={`CF: ${normalized.cf}%`} />
          <div style={{ width: `${normalized.cbf}%` }} className="bg-[#d4a373] h-full transition-all duration-300" title={`CBF: ${normalized.cbf}%`} />
          <div style={{ width: `${normalized.session}%` }} className="bg-[#10b981] h-full transition-all duration-300" title={`Session: ${normalized.session}%`} />
          <div style={{ width: `${normalized.pop}%` }} className="bg-[#60a5fa] h-full transition-all duration-300" title={`Popularity: ${normalized.pop}%`} />
          <div style={{ width: `${normalized.coldStart}%` }} className="bg-[#f43f5e] h-full transition-all duration-300" title={`Cold-Start: ${normalized.coldStart}%`} />
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono pt-1 text-[#a1a1aa]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#c084fc]" />
            <span>CF: {normalized.cf}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d4a373]" />
            <span>CBF: {normalized.cbf}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
            <span>Session: {normalized.session}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#60a5fa]" />
            <span>Popularity: {normalized.pop}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f43f5e]" />
            <span>Cold-Start: {normalized.coldStart}%</span>
          </div>
        </div>
      </div>

      {/* 5 Interactive Sliders */}
      <div className="space-y-5 pt-2">
        
        {/* 1. Collaborative Filtering */}
        <div className="p-4 rounded-2xl bg-[#18191d] border border-[#27272a] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#c084fc]" />
              <span className="text-xs font-semibold text-[#f4f4f5]">
                &alpha; · Collaborative Filtering Weight (CF_WEIGHT)
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-[#c084fc]">
              {weights.CF_WEIGHT.toFixed(2)} ({normalized.cf}%)
            </span>
          </div>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.01"
            value={weights.CF_WEIGHT}
            onChange={(e) => handleWeightChange('CF_WEIGHT', parseFloat(e.target.value))}
            className="w-full accent-[#c084fc] cursor-pointer"
          />
          <p className="text-[10px] text-[#71717a]">
            Interaction matrix similarity (view=1, click=2, wishlist=4, cart=5, purchase=8).
          </p>
        </div>

        {/* 2. Content-Based Filtering */}
        <div className="p-4 rounded-2xl bg-[#18191d] border border-[#27272a] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#d4a373]" />
              <span className="text-xs font-semibold text-[#f4f4f5]">
                &beta; · Content-Based Similarity Weight (CBF_WEIGHT)
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-[#d4a373]">
              {weights.CBF_WEIGHT.toFixed(2)} ({normalized.cbf}%)
            </span>
          </div>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.01"
            value={weights.CBF_WEIGHT}
            onChange={(e) => handleWeightChange('CBF_WEIGHT', parseFloat(e.target.value))}
            className="w-full accent-[#d4a373] cursor-pointer"
          />
          <p className="text-[10px] text-[#71717a]">
            Fabric, silhouette, occasion, style vectors, and Indian apparel category taxonomy.
          </p>
        </div>

        {/* 3. Session Intent & Visual Attention */}
        <div className="p-4 rounded-2xl bg-[#18191d] border border-[#27272a] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10b981]" />
              <span className="text-xs font-semibold text-[#f4f4f5]">
                &gamma; · Session Intent & Visual Attention Weight (SESSION_WEIGHT)
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-[#10b981]">
              {weights.SESSION_WEIGHT.toFixed(2)} ({normalized.session}%)
            </span>
          </div>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.01"
            value={weights.SESSION_WEIGHT}
            onChange={(e) => handleWeightChange('SESSION_WEIGHT', parseFloat(e.target.value))}
            className="w-full accent-[#10b981] cursor-pointer"
          />
          <p className="text-[10px] text-[#71717a]">
            Short-term sequential decay: exp(-0.05 &times; &Delta;t) + ocular gaze dwell lock.
          </p>
        </div>

        {/* 4. Popularity Prior */}
        <div className="p-4 rounded-2xl bg-[#18191d] border border-[#27272a] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#60a5fa]" />
              <span className="text-xs font-semibold text-[#f4f4f5]">
                &delta; · Popularity & Rating Benchmark Weight (POPULARITY_WEIGHT)
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-[#60a5fa]">
              {weights.POPULARITY_WEIGHT.toFixed(2)} ({normalized.pop}%)
            </span>
          </div>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.01"
            value={weights.POPULARITY_WEIGHT}
            onChange={(e) => handleWeightChange('POPULARITY_WEIGHT', parseFloat(e.target.value))}
            className="w-full accent-[#60a5fa] cursor-pointer"
          />
          <p className="text-[10px] text-[#71717a]">
            Prior global sales volume, view velocity, and verified customer star ratings.
          </p>
        </div>

        {/* 5. Cold-Start Mitigation */}
        <div className="p-4 rounded-2xl bg-[#18191d] border border-[#27272a] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#f43f5e]" />
              <span className="text-xs font-semibold text-[#f4f4f5]">
                &epsilon; · Cold-Start Mitigation Module Weight (COLD_START_WEIGHT)
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-[#f43f5e]">
              {weights.COLD_START_WEIGHT.toFixed(2)} ({normalized.coldStart}%)
            </span>
          </div>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.01"
            value={weights.COLD_START_WEIGHT}
            onChange={(e) => handleWeightChange('COLD_START_WEIGHT', parseFloat(e.target.value))}
            className="w-full accent-[#f43f5e] cursor-pointer"
          />
          <p className="text-[10px] text-[#71717a]">
            First-click bootstrap for new users and zero-interaction item candidate generation.
          </p>
        </div>

      </div>

      {/* Live Impact Preview with Current Weights */}
      <div className="space-y-3 pt-2 border-t border-[#27272a]/60">
        <span className="text-[10px] font-mono text-[#71717a] uppercase tracking-wider block">
          Live Top-3 Hybrid Recommendation Impact Preview:
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {sampleRankings.map((item, idx) => (
            <div key={item.id} className="p-4 rounded-2xl bg-[#18191d] border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#d4a373] font-bold">
                  #{idx + 1} Candidate
                </span>
                <span className="text-xs font-mono font-bold text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded-full border border-[#10b981]/30">
                  Score: {Math.round(item.hybridBreakdown.hybridScore * 100)}%
                </span>
              </div>
              <span className="text-xs font-medium text-[#f4f4f5] block truncate">
                {item.name}
              </span>
              <div className="grid grid-cols-5 gap-1 text-[9px] font-mono text-center pt-1 border-t border-white/[0.04]">
                <div className="bg-black/30 p-1 rounded">
                  <span className="text-[#71717a] block">CF</span>
                  <span className="text-[#c084fc] font-bold">{Math.round(item.hybridBreakdown.cfScore * 100)}</span>
                </div>
                <div className="bg-black/30 p-1 rounded">
                  <span className="text-[#71717a] block">CBF</span>
                  <span className="text-[#d4a373] font-bold">{Math.round(item.hybridBreakdown.cbfScore * 100)}</span>
                </div>
                <div className="bg-black/30 p-1 rounded">
                  <span className="text-[#71717a] block">SES</span>
                  <span className="text-[#10b981] font-bold">{Math.round(item.hybridBreakdown.sessionScore * 100)}</span>
                </div>
                <div className="bg-black/30 p-1 rounded">
                  <span className="text-[#71717a] block">POP</span>
                  <span className="text-[#60a5fa] font-bold">{Math.round(item.hybridBreakdown.popularityScore * 100)}</span>
                </div>
                <div className="bg-black/30 p-1 rounded">
                  <span className="text-[#71717a] block">COLD</span>
                  <span className="text-[#f43f5e] font-bold">{Math.round(item.hybridBreakdown.coldStartScore * 100)}</span>
                </div>
              </div>
              <span className="text-[9px] font-mono text-[#71717a] block truncate">
                Driver: {item.hybridBreakdown.dominantSignal}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
