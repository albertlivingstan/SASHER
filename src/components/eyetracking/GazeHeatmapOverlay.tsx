import React, { useState, useEffect, useMemo } from 'react';
import { 
  gazeHeatmapService, 
  ProductGazeHeatmapData, 
  MerchandiserHeatClassification,
  GazeHeatmapSummaryMetrics 
} from '../../services/gazeHeatmapService';
import { Product } from '../../types';
import { 
  Flame, 
  Eye, 
  AlertTriangle, 
  TrendingUp, 
  Sparkles, 
  Download, 
  SlidersHorizontal, 
  X, 
  Info, 
  Layers, 
  Check, 
  ChevronRight,
  ShoppingBag,
  Heart,
  FileSpreadsheet,
  FileCode,
  Sparkle,
  Route,
  GitCommit,
  ArrowRight,
  Compass,
  Activity
} from 'lucide-react';

interface GazeHeatmapOverlayProps {
  products: Product[];
  isHeatmapActive: boolean;
  onToggleHeatmap: (active: boolean) => void;
  visualizationMode?: 'intensity' | 'path';
  onVisualizationModeChange?: (mode: 'intensity' | 'path') => void;
  selectedClassificationFilter?: string;
  onClassificationFilterChange?: (filter: string) => void;
  onInspectProduct?: (product: Product) => void;
  className?: string;
}

export const GazeHeatmapOverlay: React.FC<GazeHeatmapOverlayProps> = ({
  products,
  isHeatmapActive,
  onToggleHeatmap,
  visualizationMode: controlledVizMode,
  onVisualizationModeChange,
  selectedClassificationFilter = 'ALL',
  onClassificationFilterChange,
  onInspectProduct,
  className = ''
}) => {
  const [internalVizMode, setInternalVizMode] = useState<'intensity' | 'path'>(() => {
    try {
      return (localStorage.getItem('sasher_gaze_viz_mode') as 'intensity' | 'path') || 'intensity';
    } catch {
      return 'intensity';
    }
  });

  const vizMode = controlledVizMode !== undefined ? controlledVizMode : internalVizMode;

  const handleModeSwitch = (mode: 'intensity' | 'path') => {
    setInternalVizMode(mode);
    try {
      localStorage.setItem('sasher_gaze_viz_mode', mode);
    } catch {}
    if (onVisualizationModeChange) {
      onVisualizationModeChange(mode);
    }
  };

  const [heatmapMode, setHeatmapMode] = useState<'aggregated' | 'live'>('aggregated');
  const [heatmapData, setHeatmapData] = useState<ProductGazeHeatmapData[]>([]);
  const [selectedProductInsight, setSelectedProductInsight] = useState<ProductGazeHeatmapData | null>(null);
  const [intensity, setIntensity] = useState<number>(0.85); // 0.2 to 1.0
  const [filterClassification, setFilterClassification] = useState<string>(selectedClassificationFilter);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState<boolean>(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [modalTab, setModalTab] = useState<'dwell' | 'saccade'>('dwell');

  // Sync with prop
  useEffect(() => {
    setFilterClassification(selectedClassificationFilter);
  }, [selectedClassificationFilter]);

  // Load and subscribe to heatmap updates
  useEffect(() => {
    const updateData = () => {
      const data = gazeHeatmapService.getProductGazeData(products, heatmapMode);
      setHeatmapData(data);
    };

    updateData();
    const unsubscribe = gazeHeatmapService.subscribe(updateData);
    return unsubscribe;
  }, [products, heatmapMode]);

  // Summary metrics across catalog
  const summaryMetrics: GazeHeatmapSummaryMetrics = useMemo(() => {
    return gazeHeatmapService.getSummaryMetrics(heatmapData);
  }, [heatmapData]);

  // Saccade path aggregate statistics
  const saccadeAggregates = useMemo(() => {
    if (heatmapData.length === 0) {
      return {
        totalSaccades: 0,
        averageScanpathLength: 0,
        averageVelocity: 0,
        averageEfficiency: 0
      };
    }
    const totalSaccades = heatmapData.reduce((acc, d) => acc + (d.saccadeFlow?.totalSaccades || 3), 0);
    const avgScanpath = Math.round(heatmapData.reduce((acc, d) => acc + (d.saccadeFlow?.scanpathLengthPx || 380), 0) / heatmapData.length);
    const avgVelocity = parseFloat((heatmapData.reduce((acc, d) => acc + (d.saccadeFlow?.averageSaccadeVelocity || 1.6), 0) / heatmapData.length).toFixed(2));
    const avgEfficiency = Math.round((heatmapData.reduce((acc, d) => acc + (d.saccadeFlow?.explorationEfficiency || 0.72), 0) / heatmapData.length) * 100);

    return {
      totalSaccades,
      averageScanpathLength: avgScanpath,
      averageVelocity: avgVelocity,
      averageEfficiency: avgEfficiency
    };
  }, [heatmapData]);

  // Classification lookup map
  const classificationOptions: { id: string; label: string; count: number; color: string }[] = useMemo(() => {
    const counts = {
      ALL: heatmapData.length,
      STAR_PERFORMER: heatmapData.filter(d => d.classification === 'STAR_PERFORMER').length,
      HIGH_INTEREST_FRICTION: heatmapData.filter(d => d.classification === 'HIGH_INTEREST_FRICTION').length,
      SKIMMED_FATIGUE: heatmapData.filter(d => d.classification === 'SKIMMED_FATIGUE').length,
      COLD_START_DISCOVERY: heatmapData.filter(d => d.classification === 'COLD_START_DISCOVERY').length,
      STEADY_ENGAGEMENT: heatmapData.filter(d => d.classification === 'STEADY_ENGAGEMENT').length
    };

    return [
      { id: 'ALL', label: 'All Items', count: counts.ALL, color: 'border-white/20 text-[#f4f4f5]' },
      { id: 'STAR_PERFORMER', label: '⭐ Star Performers', count: counts.STAR_PERFORMER, color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' },
      { id: 'HIGH_INTEREST_FRICTION', label: '⚠️ Friction Alerts', count: counts.HIGH_INTEREST_FRICTION, color: 'border-amber-500/40 text-amber-400 bg-amber-500/10' },
      { id: 'SKIMMED_FATIGUE', label: '❄️ Skimmed / Fatigue', count: counts.SKIMMED_FATIGUE, color: 'border-sky-500/40 text-sky-400 bg-sky-500/10' },
      { id: 'COLD_START_DISCOVERY', label: '🌱 Cold Discovery', count: counts.COLD_START_DISCOVERY, color: 'border-purple-500/40 text-purple-400 bg-purple-500/10' }
    ];
  }, [heatmapData]);

  const handleSelectFilter = (filterId: string) => {
    setFilterClassification(filterId);
    if (onClassificationFilterChange) {
      onClassificationFilterChange(filterId);
    }
  };

  const handleExportCSV = () => {
    const csv = gazeHeatmapService.exportReportCSV(heatmapData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sasher_gaze_heatmap_merchandiser_report_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setIsExportMenuOpen(false);
    triggerNotice('Exported CSV Merchandiser Report');
  };

  const handleExportJSON = () => {
    const json = gazeHeatmapService.exportReportJSON(heatmapData);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sasher_gaze_heatmap_analytics_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setIsExportMenuOpen(false);
    triggerNotice('Exported JSON Merchandiser Dataset');
  };

  const triggerNotice = (msg: string) => {
    setExportNotice(msg);
    setTimeout(() => setExportNotice(null), 3000);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      
      {/* Merchandiser Control Banner */}
      <div className={`rounded-2xl border transition-all duration-300 backdrop-blur-xl ${
        isHeatmapActive 
          ? 'bg-[#121318]/95 border-[#d4a373]/40 shadow-[0_0_35px_rgba(212,163,115,0.08)]' 
          : 'bg-[#121316]/70 border-white/[0.08]'
      }`}>
        <div className="p-4 sm:p-5 space-y-4">
          
          {/* Header Row: Title, Master Switch, and Mode Toggle */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-inner ${
                isHeatmapActive 
                  ? vizMode === 'intensity'
                    ? 'bg-gradient-to-br from-amber-500/25 to-rose-500/25 border border-amber-500/50 text-[#d4a373]'
                    : 'bg-gradient-to-br from-cyan-500/25 to-indigo-500/25 border border-cyan-500/50 text-cyan-400'
                  : 'bg-white/[0.04] border border-white/[0.08] text-[#71717a]'
              }`}>
                {vizMode === 'intensity' ? (
                  <Flame className={`w-5 h-5 ${isHeatmapActive ? 'animate-pulse text-[#d4a373]' : ''}`} />
                ) : (
                  <Route className={`w-5 h-5 ${isHeatmapActive ? 'animate-pulse text-cyan-400' : ''}`} />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-editorial text-lg sm:text-xl text-[#f4f4f5] tracking-tight">
                    Merchandiser Gaze Heatmap
                  </h3>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    isHeatmapActive 
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 font-semibold' 
                      : 'bg-white/[0.04] border-white/[0.08] text-[#71717a]'
                  }`}>
                    {isHeatmapActive ? 'OVERLAY ACTIVE' : 'OVERLAY OFF'}
                  </span>
                </div>
                <p className="text-xs text-[#a1a1aa] mt-0.5">
                  {vizMode === 'intensity' 
                    ? 'Intensity Mode: Visualizing thermal dwell concentrations and cognitive interest distributions across the catalog.' 
                    : 'Path Mode: Visualizing chronological saccade flow vectors, gaze trajectory sequences, and numbered ocular fixations.'}
                </p>
              </div>
            </div>

            {/* Master Toggle, Visualization Switcher, and Export Controls */}
            <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
              
              {/* PRIMARY VISUALIZATION MODE SWITCH: Intensity (Dwell) vs Path (Saccade Flow) */}
              {isHeatmapActive && (
                <div className="flex items-center p-1 rounded-xl bg-[#0e0f12] border border-white/[0.12] text-xs font-mono shadow-inner">
                  <button
                    onClick={() => handleModeSwitch('intensity')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      vizMode === 'intensity'
                        ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-[#09090b] font-bold shadow-md'
                        : 'text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-white/[0.04]'
                    }`}
                    title="Intensity Mode: Visualizes dwell-time heat concentrations and thermal hotspots"
                  >
                    <Flame className="w-3.5 h-3.5 fill-current" />
                    <span>Intensity (Dwell)</span>
                  </button>

                  <button
                    onClick={() => handleModeSwitch('path')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      vizMode === 'path'
                        ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-[#09090b] font-bold shadow-md'
                        : 'text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-white/[0.04]'
                    }`}
                    title="Path Mode: Visualizes chronological gaze saccade flow trajectory vectors and numbered fixations"
                  >
                    <Route className="w-3.5 h-3.5" />
                    <span>Path (Saccade Flow)</span>
                  </button>
                </div>
              )}

              {/* Heatmap Dataset Mode Toggle: Aggregated vs Live */}
              {isHeatmapActive && (
                <div className="flex items-center p-1 rounded-xl bg-[#0e0f12] border border-white/[0.08] text-xs font-mono">
                  <button
                    onClick={() => setHeatmapMode('aggregated')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      heatmapMode === 'aggregated'
                        ? 'bg-[#d4a373] text-[#09090b] font-semibold shadow'
                        : 'text-[#a1a1aa] hover:text-[#f4f4f5]'
                    }`}
                  >
                    Aggregated (24K)
                  </button>
                  <button
                    onClick={() => setHeatmapMode('live')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                      heatmapMode === 'live'
                        ? 'bg-[#10b981] text-[#09090b] font-semibold shadow'
                        : 'text-[#a1a1aa] hover:text-[#f4f4f5]'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>Live</span>
                  </button>
                </div>
              )}

              {/* Master Switch Button */}
              <button
                onClick={() => onToggleHeatmap(!isHeatmapActive)}
                className={`px-4 py-2 rounded-xl text-xs font-medium font-mono tracking-wide transition-all cursor-pointer flex items-center gap-2 border shadow-sm ${
                  isHeatmapActive
                    ? 'bg-gradient-to-r from-[#d4a373] to-[#e0b487] text-[#09090b] font-bold border-[#d4a373] shadow-[0_0_18px_rgba(212,163,115,0.3)]'
                    : 'bg-[#16171b] hover:bg-[#1f2025] text-[#d4d4d8] border-white/[0.12]'
                }`}
              >
                <Flame className={`w-4 h-4 ${isHeatmapActive ? 'fill-current' : 'text-[#71717a]'}`} />
                <span>{isHeatmapActive ? 'Disable Heatmap' : 'Enable Gaze Heatmap'}</span>
              </button>

              {/* Export Menu Dropdown */}
              {isHeatmapActive && (
                <div className="relative">
                  <button
                    onClick={() => setIsExportMenuOpen(prev => !prev)}
                    className="p-2 rounded-xl bg-[#141518] hover:bg-[#1a1b20] border border-white/[0.08] text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-mono"
                    title="Export Merchandiser Analytics"
                  >
                    <Download className="w-4 h-4 text-[#d4a373]" />
                    <span className="hidden sm:inline">Export</span>
                  </button>

                  {isExportMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-[#141518] border border-white/[0.12] shadow-2xl p-2 z-50 space-y-1 backdrop-blur-2xl">
                      <div className="px-2.5 py-1 text-[10px] font-mono text-[#71717a] uppercase tracking-wider">
                        Export Merchandiser Data
                      </div>
                      <button
                        onClick={handleExportCSV}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#f4f4f5] hover:bg-white/[0.06] transition-colors text-left cursor-pointer"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                        <div>
                          <div className="font-medium">CSV Table</div>
                          <div className="text-[10px] text-[#71717a]">Excel & BI compatible</div>
                        </div>
                      </button>
                      <button
                        onClick={handleExportJSON}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#f4f4f5] hover:bg-white/[0.06] transition-colors text-left cursor-pointer"
                      >
                        <FileCode className="w-4 h-4 text-[#d4a373]" />
                        <div>
                          <div className="font-medium">JSON Dataset</div>
                          <div className="text-[10px] text-[#71717a]">Raw fixation & saccade vectors</div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>

          </div>

          {/* Expanded Merchandiser Toolbar & Summary Bar (when heatmap is active) */}
          {isHeatmapActive && (
            <div className="pt-3 border-t border-white/[0.06] space-y-4">
              
              {/* Summary KPIs Row - Adaptive between Intensity and Path mode */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                
                {vizMode === 'intensity' ? (
                  <>
                    <div className="p-2.5 rounded-xl bg-[#0c0d0f] border border-white/[0.05] space-y-0.5">
                      <span className="text-[10px] font-mono text-[#71717a] uppercase block">Total Gaze Dwell</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-base font-semibold text-[#f4f4f5] font-mono">{summaryMetrics.totalDwellSeconds}s</span>
                        <span className="text-[10px] text-[#10b981]">dwell</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#0c0d0f] border border-white/[0.05] space-y-0.5">
                      <span className="text-[10px] font-mono text-[#71717a] uppercase block">Avg Catalog Dwell</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-base font-semibold text-[#d4a373] font-mono">{summaryMetrics.averageCatalogDwell}s</span>
                        <span className="text-[10px] text-[#71717a]">/ item</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#0c0d0f] border border-white/[0.05] space-y-0.5">
                      <span className="text-[10px] font-mono text-[#71717a] uppercase block">Total Fixations</span>
                      <span className="text-base font-semibold text-[#f4f4f5] font-mono">{summaryMetrics.totalFixations}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#0c0d0f] border border-emerald-500/20 space-y-0.5">
                      <span className="text-[10px] font-mono text-emerald-400 uppercase block">⭐ Star Performers</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-semibold text-emerald-400 font-mono">{summaryMetrics.starPerformersCount}</span>
                        <span className="text-[10px] text-[#a1a1aa]">High Dwell & Cart</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#0c0d0f] border border-amber-500/20 space-y-0.5">
                      <span className="text-[10px] font-mono text-amber-400 uppercase block">⚠️ Friction Alerts</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-semibold text-amber-400 font-mono">{summaryMetrics.frictionAlertsCount}</span>
                        <span className="text-[10px] text-[#a1a1aa]">High Dwell, Low Cart</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#0c0d0f] border border-white/[0.05] space-y-0.5">
                      <span className="text-[10px] font-mono text-[#71717a] uppercase block">Top Gazed Category</span>
                      <span className="text-xs font-semibold text-[#f4f4f5] truncate block mt-0.5">{summaryMetrics.topGazedCategory}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-2.5 rounded-xl bg-[#0c0d0f] border border-cyan-500/20 space-y-0.5">
                      <span className="text-[10px] font-mono text-cyan-400 uppercase block">Total Saccades</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-base font-semibold text-cyan-300 font-mono">{saccadeAggregates.totalSaccades}</span>
                        <span className="text-[10px] text-[#a1a1aa]">vectors</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#0c0d0f] border border-indigo-500/20 space-y-0.5">
                      <span className="text-[10px] font-mono text-indigo-400 uppercase block">Avg Scanpath Length</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-base font-semibold text-indigo-300 font-mono">{saccadeAggregates.averageScanpathLength}px</span>
                        <span className="text-[10px] text-[#71717a]">/ card</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#0c0d0f] border border-white/[0.05] space-y-0.5">
                      <span className="text-[10px] font-mono text-[#71717a] uppercase block">Saccade Velocity</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-base font-semibold text-[#f4f4f5] font-mono">{saccadeAggregates.averageVelocity}</span>
                        <span className="text-[10px] text-[#a1a1aa]">px/ms</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#0c0d0f] border border-emerald-500/20 space-y-0.5">
                      <span className="text-[10px] font-mono text-emerald-400 uppercase block">Path Directness</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-base font-semibold text-emerald-400 font-mono">{saccadeAggregates.averageEfficiency}%</span>
                        <span className="text-[10px] text-[#a1a1aa]">Efficiency</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#0c0d0f] border border-purple-500/20 space-y-0.5">
                      <span className="text-[10px] font-mono text-purple-400 uppercase block">Primary Entry Point</span>
                      <span className="text-xs font-semibold text-purple-300 truncate block mt-0.5">Hero Lapel & Neck</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#0c0d0f] border border-white/[0.05] space-y-0.5">
                      <span className="text-[10px] font-mono text-[#71717a] uppercase block">Flow Terminal Point</span>
                      <span className="text-xs font-semibold text-[#f4f4f5] truncate block mt-0.5">Price & Bag Action</span>
                    </div>
                  </>
                )}

              </div>

              {/* Sub-toolbar: Classification Filter Pills + Intensity Slider */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
                
                {/* Classification Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar flex-wrap">
                  <span className="text-xs text-[#71717a] font-mono mr-1 hidden sm:inline">Filter Focus:</span>
                  {classificationOptions.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectFilter(opt.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium font-mono transition-all cursor-pointer border ${
                        filterClassification === opt.id
                          ? 'bg-white/[0.12] text-[#f4f4f5] border-[#d4a373] shadow-sm font-semibold'
                          : 'bg-[#141518] text-[#a1a1aa] border-white/[0.06] hover:bg-white/[0.04] hover:text-[#f4f4f5]'
                      }`}
                    >
                      <span>{opt.label}</span>
                      <span className="ml-1.5 text-[10px] text-[#71717a]">({opt.count})</span>
                    </button>
                  ))}
                </div>

                {/* Heatmap Intensity Slider */}
                <div className="flex items-center gap-2.5 self-start md:self-auto bg-[#141518] px-3 py-1.5 rounded-xl border border-white/[0.08]">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#d4a373]" />
                  <span className="text-xs font-mono text-[#a1a1aa] whitespace-nowrap">
                    {vizMode === 'intensity' ? 'Thermal Opacity:' : 'Vector Stroke:'}
                  </span>
                  <input
                    type="range"
                    min="0.2"
                    max="1.0"
                    step="0.05"
                    value={intensity}
                    onChange={(e) => setIntensity(parseFloat(e.target.value))}
                    className="w-20 sm:w-24 accent-[#d4a373] cursor-pointer"
                  />
                  <span className="text-xs font-mono text-[#f4f4f5] w-7 text-right">
                    {Math.round(intensity * 100)}%
                  </span>
                </div>

              </div>

            </div>
          )}

          {/* Export Toast Notification */}
          {exportNotice && (
            <div className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg flex items-center gap-2 animate-in fade-in">
              <Check className="w-3.5 h-3.5" />
              <span>{exportNotice}</span>
            </div>
          )}

        </div>
      </div>

      {/* Merchandiser Actionable Insight Drawer / Modal */}
      {selectedProductInsight && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
          onClick={() => setSelectedProductInsight(null)}
        >
          <div 
            className="w-full max-w-xl bg-[#141518] border border-white/[0.12] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 animate-in zoom-in-95 text-[#f4f4f5]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase text-[#d4a373] bg-[#d4a373]/10 px-2.5 py-0.5 rounded-md border border-[#d4a373]/30">
                    Rank #{selectedProductInsight.attentionRank} Focus
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
                    selectedProductInsight.classification === 'STAR_PERFORMER' ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400' :
                    selectedProductInsight.classification === 'HIGH_INTEREST_FRICTION' ? 'bg-amber-500/15 border-amber-500/40 text-amber-400' :
                    selectedProductInsight.classification === 'SKIMMED_FATIGUE' ? 'bg-sky-500/15 border-sky-500/40 text-sky-400' :
                    'bg-white/[0.05] border-white/[0.10] text-[#a1a1aa]'
                  }`}>
                    {selectedProductInsight.badgeLabel}
                  </span>
                </div>
                <h3 className="font-editorial text-2xl text-[#f4f4f5] tracking-tight">
                  {selectedProductInsight.productName}
                </h3>
                <p className="text-xs text-[#a1a1aa] font-mono">
                  {selectedProductInsight.brand} · {selectedProductInsight.category} · ₹{selectedProductInsight.price.toLocaleString('en-IN')}
                </p>
              </div>

              <button
                onClick={() => setSelectedProductInsight(null)}
                className="p-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.12] text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Subtabs: Dwell Analysis vs Saccade Scanpath Timeline */}
            <div className="flex items-center gap-2 border-b border-white/[0.06] pb-2 text-xs font-mono">
              <button
                onClick={() => setModalTab('dwell')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  modalTab === 'dwell'
                    ? 'bg-white/[0.12] text-[#f4f4f5] font-semibold border border-white/[0.12]'
                    : 'text-[#71717a] hover:text-[#f4f4f5]'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-[#d4a373]" />
                <span>Dwell & Conversion</span>
              </button>

              <button
                onClick={() => setModalTab('saccade')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  modalTab === 'saccade'
                    ? 'bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/30'
                    : 'text-[#71717a] hover:text-[#f4f4f5]'
                }`}
              >
                <Route className="w-3.5 h-3.5 text-cyan-400" />
                <span>Saccade Scanpath Trajectory</span>
              </button>
            </div>

            {modalTab === 'dwell' ? (
              <>
                {/* Metrics Breakdown Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-[#0e0f12] border border-white/[0.06] space-y-0.5">
                    <span className="text-[10px] font-mono text-[#71717a] uppercase block">Dwell Time</span>
                    <span className="text-lg font-semibold text-[#f4f4f5] font-mono">{selectedProductInsight.dwellTimeSeconds}s</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0e0f12] border border-white/[0.06] space-y-0.5">
                    <span className="text-[10px] font-mono text-[#71717a] uppercase block">Fixation Count</span>
                    <span className="text-lg font-semibold text-[#f4f4f5] font-mono">{selectedProductInsight.fixationCount}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0e0f12] border border-white/[0.06] space-y-0.5">
                    <span className="text-[10px] font-mono text-[#71717a] uppercase block">Gaze-to-Cart</span>
                    <span className="text-lg font-semibold text-emerald-400 font-mono">{selectedProductInsight.gazeToCartRate}%</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0e0f12] border border-white/[0.06] space-y-0.5">
                    <span className="text-[10px] font-mono text-[#71717a] uppercase block">Gaze-to-Wishlist</span>
                    <span className="text-lg font-semibold text-[#d4a373] font-mono">{selectedProductInsight.gazeToWishlistRate}%</span>
                  </div>
                </div>

                {/* Actionable Merchandiser Insights Callout */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#191b22] to-[#121316] border border-[#d4a373]/30 space-y-3 shadow-inner">
                  <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-[#d4a373]">
                    <Info className="w-4 h-4" />
                    <span>Actionable Merchandiser Diagnostics</span>
                  </div>
                  <p className="text-xs text-[#e4e4e7] leading-relaxed">
                    {selectedProductInsight.actionableInsight}
                  </p>
                  
                  <div className="pt-2 border-t border-white/[0.08] flex items-start gap-2.5">
                    <ChevronRight className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <span className="font-semibold text-emerald-400">Merchandiser Action: </span>
                      <span className="text-[#a1a1aa]">{selectedProductInsight.merchandiserRecommendation}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Saccadic Trajectory Scanpath Details */
              <div className="space-y-4">
                
                {/* Saccade KPIs */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-[#0e0f12] border border-cyan-500/20 space-y-0.5">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase block">Scanpath Length</span>
                    <span className="text-base font-semibold text-cyan-300 font-mono">{selectedProductInsight.saccadeFlow.scanpathLengthPx}px</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0e0f12] border border-indigo-500/20 space-y-0.5">
                    <span className="text-[10px] font-mono text-indigo-400 uppercase block">Saccade Velocity</span>
                    <span className="text-base font-semibold text-indigo-300 font-mono">{selectedProductInsight.saccadeFlow.averageSaccadeVelocity} px/ms</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0e0f12] border border-emerald-500/20 space-y-0.5">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase block">Path Directness</span>
                    <span className="text-base font-semibold text-emerald-400 font-mono">{Math.round(selectedProductInsight.saccadeFlow.explorationEfficiency * 100)}%</span>
                  </div>
                </div>

                {/* Saccadic Sequence Timeline */}
                <div className="p-4 rounded-2xl bg-[#0e0f12] border border-white/[0.08] space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-[#a1a1aa]">
                    <span className="text-cyan-400 font-semibold uppercase">Chronological Fixation Sequence:</span>
                    <span>{selectedProductInsight.saccadeFlow.nodes.length} Steps</span>
                  </div>

                  <div className="space-y-2">
                    {selectedProductInsight.saccadeFlow.nodes.map((node) => (
                      <div 
                        key={node.order}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#141518] border border-white/[0.05] text-xs font-mono"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            node.order === 1 
                              ? 'bg-cyan-500 text-[#09090b]' 
                              : node.order === selectedProductInsight.saccadeFlow.nodes.length 
                              ? 'bg-rose-500 text-white' 
                              : 'bg-indigo-600 text-white'
                          }`}>
                            {node.order}
                          </span>
                          <span className="text-[#f4f4f5]">{node.label}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#71717a]">
                          <span>{node.durationMs}ms dwell</span>
                          <span>({node.xPercent}%, {node.yPercent}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Saccadic Trajectory Merchandiser Interpretation */}
                <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-xs text-cyan-200 leading-relaxed space-y-1">
                  <div className="font-semibold text-cyan-400 flex items-center gap-1.5">
                    <Route className="w-3.5 h-3.5" />
                    <span>Trajectory Diagnostics:</span>
                  </div>
                  <p>
                    Scanpath initiated at <span className="text-white font-medium">&ldquo;{selectedProductInsight.saccadeFlow.entryFixation}&rdquo;</span> and concluded cleanly at <span className="text-white font-medium">&ldquo;{selectedProductInsight.saccadeFlow.exitFixation}&rdquo;</span>. Smooth vector transitions indicate high cognitive processing fluency.
                  </p>
                </div>

              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between pt-2">
              <div className="text-[11px] font-mono text-[#71717a]">
                Mode: {vizMode === 'intensity' ? 'Dwell-Time Heatmap' : 'Saccadic Trajectory Vector Flow'}
              </div>
              
              <button
                onClick={() => {
                  const prod = products.find(p => p.id === selectedProductInsight.productId);
                  if (prod && onInspectProduct) {
                    onInspectProduct(prod);
                  }
                  setSelectedProductInsight(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#d4a373] text-[#09090b] text-xs font-medium font-mono hover:bg-[#e0b487] transition-colors cursor-pointer"
              >
                Inspect Garment Specs
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
