import React, { useState, useEffect } from 'react';
import { eyeTracker, EyeTrackerLiveAnalytics } from '../../services/eyeTracker';
import { useSasher } from '../../context/SasherContext';
import { 
  Eye, 
  Activity, 
  Target, 
  Camera, 
  MousePointer, 
  Zap, 
  Sliders, 
  CheckCircle2, 
  BarChart2, 
  Crosshair, 
  Maximize2,
  Minimize2
} from 'lucide-react';

export const LiveEyeTrackerAnalyticsPanel: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { products, isEyeTrackingActive, toggleEyeTracking } = useSasher();
  const [analytics, setAnalytics] = useState<EyeTrackerLiveAnalytics | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(!compact);
  const [showGazeTrail, setShowGazeTrail] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = eyeTracker.subscribeAnalytics((data) => {
      setAnalytics(data);
    });
    return () => unsubscribe();
  }, []);

  if (!isEyeTrackingActive) {
    return (
      <div className="p-4 rounded-2xl bg-[#141416] border border-[#27272a] text-center space-y-2">
        <Eye className="w-5 h-5 text-[#71717a] mx-auto" />
        <span className="text-xs font-mono text-[#a1a1aa] block">Eye Tracker Inactive</span>
        <button
          onClick={toggleEyeTracking}
          className="px-3.5 py-1.5 bg-[#ff6b1a] text-[#09090b] rounded-xl text-xs font-mono font-bold cursor-pointer"
        >
          Enable Eye-Tracking
        </button>
      </div>
    );
  }

  const currentProduct = analytics?.currentTargetId 
    ? products.find(p => p.id === analytics.currentTargetId) 
    : null;

  const dwellPct = analytics ? Math.min(100, Math.round((analytics.currentDwellMs / 1200) * 100)) : 0;

  return (
    <div className="p-5 rounded-3xl bg-[#121316] border border-[#27272a] shadow-2xl font-mono text-xs space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#27272a]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#ff6b1a]/15 text-[#ff6b1a] border border-[#ff6b1a]/30 flex items-center justify-center">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#f5f5f7] tracking-wider uppercase">
                LIVE EYE TRACKER TELEMETRY
              </span>
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
            </div>
            <span className="text-[10px] text-[#71717a]">
              Adaptive Saccade & Fixation Classification
            </span>
          </div>
        </div>

        {/* Tracking Mode Switcher */}
        <div className="flex items-center gap-1 bg-[#18181b] p-1 rounded-xl border border-[#27272a]">
          <button
            onClick={() => eyeTracker.setTrackingMode('hybrid')}
            className={`px-2 py-1 rounded-lg text-[10px] transition-all cursor-pointer ${
              analytics?.trackingMode === 'hybrid'
                ? 'bg-[#ff6b1a] text-[#09090b] font-bold shadow'
                : 'text-[#a1a1aa] hover:text-[#f5f5f7]'
            }`}
            title="Hybrid Optical + Cursor tracking"
          >
            Hybrid
          </button>
          <button
            onClick={() => eyeTracker.setTrackingMode('webcam')}
            className={`px-2 py-1 rounded-lg text-[10px] transition-all cursor-pointer ${
              analytics?.trackingMode === 'webcam'
                ? 'bg-[#ff6b1a] text-[#09090b] font-bold shadow'
                : 'text-[#a1a1aa] hover:text-[#f5f5f7]'
            }`}
            title="Optical Camera Pupil Tracking only"
          >
            Camera
          </button>
          <button
            onClick={() => eyeTracker.setTrackingMode('cursor')}
            className={`px-2 py-1 rounded-lg text-[10px] transition-all cursor-pointer ${
              analytics?.trackingMode === 'cursor'
                ? 'bg-[#ff6b1a] text-[#09090b] font-bold shadow'
                : 'text-[#a1a1aa] hover:text-[#f5f5f7]'
            }`}
            title="Simulated Organic Gaze Cursor tracking"
          >
            Cursor
          </button>
        </div>
      </div>

      {/* Real-Time Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Coordinates */}
        <div className="p-3 bg-[#18191d] rounded-2xl border border-[#27272a] space-y-1">
          <span className="text-[10px] text-[#71717a] block">GAZE POSITION</span>
          <div className="text-sm font-bold text-[#f5f5f7]">
            X: {analytics?.x ?? 0} <span className="text-[#71717a] font-normal">px</span>
          </div>
          <div className="text-xs text-[#a1a1aa]">
            Y: {analytics?.y ?? 0} <span className="text-[#71717a] font-normal">px</span>
          </div>
        </div>

        {/* State: Saccade vs Fixation */}
        <div className="p-3 bg-[#18191d] rounded-2xl border border-[#27272a] space-y-1">
          <span className="text-[10px] text-[#71717a] block">GAZE DYNAMICS</span>
          <div className={`text-sm font-bold ${analytics?.isFixating ? 'text-[#10b981]' : 'text-[#ff6b1a]'}`}>
            {analytics?.isFixating ? 'FIXATION' : 'SACCADE'}
          </div>
          <div className="text-[10px] text-[#a1a1aa]">
            Velocity: {analytics?.saccadeVelocity ?? 0} px/s
          </div>
        </div>

        {/* Gaze Stability Meter */}
        <div className="p-3 bg-[#18191d] rounded-2xl border border-[#27272a] space-y-1">
          <span className="text-[10px] text-[#71717a] block">STABILITY INDEX</span>
          <div className="text-sm font-bold text-[#f5f5f7]">
            {analytics?.gazeStability ?? 94}%
          </div>
          <div className="w-full h-1.5 bg-[#27272a] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#ff6b1a] to-[#10b981] transition-all duration-150"
              style={{ width: `${analytics?.gazeStability ?? 94}%` }}
            />
          </div>
        </div>

        {/* Pupil Dilation & Sensor Quality */}
        <div className="p-3 bg-[#18191d] rounded-2xl border border-[#27272a] space-y-1">
          <span className="text-[10px] text-[#71717a] block">PUPIL APERTURE</span>
          <div className="text-sm font-bold text-[#2997ff]">
            {analytics?.pupilDilationMm ?? 3.4} mm
          </div>
          <div className="text-[10px] text-[#10b981] flex items-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5" />
            <span>Calibrated {analytics?.calibrationScore ?? 95}%</span>
          </div>
        </div>
      </div>

      {/* Target Fixation Lock Bar */}
      <div className="p-4 bg-[#18191d] rounded-2xl border border-[#27272a] space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Target className={`w-4 h-4 ${currentProduct ? 'text-[#ff6b1a] animate-pulse' : 'text-[#71717a]'}`} />
            <span className="text-[#a1a1aa]">
              {currentProduct ? `Target Lock: ${currentProduct.name}` : 'Scanning Catalog / Neutral Visual Field'}
            </span>
          </div>
          <span className="text-[11px] font-bold text-[#f5f5f7]">
            {dwellPct}% ({analytics ? (analytics.currentDwellMs / 1000).toFixed(2) : 0}s / 1.2s)
          </span>
        </div>

        {/* Progress Bar towards 1.2s threshold */}
        <div className="w-full h-2 bg-[#27272a] rounded-full overflow-hidden relative">
          <div 
            className={`h-full transition-all duration-100 ${
              dwellPct >= 100 ? 'bg-[#10b981]' : 'bg-gradient-to-r from-[#ff6b1a] to-[#e2a876]'
            }`}
            style={{ width: `${dwellPct}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-[#71717a]">
          <span>Neutral Exploration</span>
          <span>1.2s Intent Trigger Threshold</span>
        </div>
      </div>

      {/* 2D Real-Time Gaze Radar & Spatial Heat Map Canvas */}
      <div className="p-4 bg-[#18191d] rounded-2xl border border-[#27272a] space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Crosshair className="w-3.5 h-3.5 text-[#ff6b1a]" />
            <span className="text-[#f5f5f7] font-semibold">2D Real-Time Gaze Radar & Saccadic Trail</span>
          </div>
          <span className="text-[10px] text-[#71717a]">
            Normalized ({analytics?.normalizedX.toFixed(2)}, {analytics?.normalizedY.toFixed(2)})
          </span>
        </div>

        {/* Radar Canvas Container */}
        <div className="relative w-full h-36 bg-[#0c0d0f] rounded-xl border border-[#27272a] overflow-hidden flex items-center justify-center">
          {/* Subtle grid divisions representing viewport layout */}
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 pointer-events-none opacity-20">
            <div className="border-r border-b border-white/20 p-1 text-[8px] text-white/50">Header</div>
            <div className="border-r border-b border-white/20 p-1 text-[8px] text-white/50">Hero</div>
            <div className="border-b border-white/20 p-1 text-[8px] text-white/50">Nav / Cart</div>
            <div className="border-r border-white/20 p-1 text-[8px] text-white/50">Filters</div>
            <div className="border-r border-white/20 p-1 text-[8px] text-white/50">Catalog Grid</div>
            <div className="p-1 text-[8px] text-white/50">Details</div>
          </div>

          {/* Saccade Trail Points */}
          {analytics?.recentTrail && analytics.recentTrail.map((pt, idx) => {
            const w = typeof window !== 'undefined' ? window.innerWidth : 1440;
            const h = typeof window !== 'undefined' ? window.innerHeight : 900;
            const pctX = Math.max(2, Math.min(98, (pt.x / w) * 100));
            const pctY = Math.max(2, Math.min(98, (pt.y / h) * 100));
            const opacity = (idx + 1) / analytics.recentTrail.length;

            return (
              <div
                key={idx}
                className="absolute w-1.5 h-1.5 rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-all duration-75"
                style={{
                  left: `${pctX}%`,
                  top: `${pctY}%`,
                  backgroundColor: `rgba(255, 107, 26, ${opacity * 0.7})`,
                  transform: `scale(${0.5 + opacity * 0.5})`
                }}
              />
            );
          })}

          {/* Current Live Gaze Point Radar Target */}
          {analytics && (
            <div
              className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-all duration-75 z-10 flex items-center justify-center"
              style={{
                left: `${Math.max(3, Math.min(97, analytics.normalizedX * 100))}%`,
                top: `${Math.max(3, Math.min(97, analytics.normalizedY * 100))}%`
              }}
            >
              <div className="w-4 h-4 rounded-full border border-[#ff6b1a] bg-[#ff6b1a]/20 animate-ping absolute" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff6b1a] border border-white shadow-[0_0_8px_#ff6b1a]" />
            </div>
          )}
        </div>
      </div>

      {/* Category Attention Distribution */}
      {analytics?.categoryDwellDistribution && (
        <div className="space-y-2.5 pt-1">
          <span className="text-[11px] text-[#a1a1aa] block uppercase tracking-wider font-semibold">
            Visual Attention Dwell by Fashion Category
          </span>
          <div className="space-y-2">
            {Object.entries(analytics.categoryDwellDistribution).map(([cat, seconds]) => {
              const maxSec = Math.max(...Object.values(analytics.categoryDwellDistribution), 1);
              const barPct = Math.round((seconds / maxSec) * 100);
              return (
                <div key={cat} className="space-y-0.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#f5f5f7]">{cat}</span>
                    <span className="text-[#a1a1aa]">{seconds.toFixed(1)}s</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#18191d] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#ff6b1a] rounded-full transition-all duration-300"
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer Controls */}
      <div className="pt-2 border-t border-[#27272a] flex items-center justify-between text-[11px] text-[#71717a]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#10b981]" />
          <span>Optical Engine 60 FPS Subsampling</span>
        </div>
        <span className="text-[10px]">
          Total Fixation Events: {analytics?.totalFixations ?? 0}
        </span>
      </div>
    </div>
  );
};
