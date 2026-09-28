import React from 'react';
import { useSasher } from '../../context/SasherContext';
import { 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Activity, 
  MousePointer, 
  Camera, 
  CheckCircle2, 
  X, 
  Sliders, 
  Sparkles,
  Info
} from 'lucide-react';

export const VisualIntentModal: React.FC = () => {
  const { 
    isVisualIntentModalOpen, 
    setIsVisualIntentModalOpen,
    visualIntentMode,
    setVisualIntentMode,
    isEyeTrackingActive,
    toggleEyeTracking,
    setEyeTrackingActive,
    currentGazeTarget,
    openCalibration,
    calibrationScore
  } = useSasher();

  if (!isVisualIntentModalOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => setIsVisualIntentModalOpen(false)}
    >
      <div 
        className="relative w-full max-w-xl bg-[#0f1012] border border-[#d4a373]/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-[#f4f4f5] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsVisualIntentModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-full text-[#71717a] hover:text-[#f4f4f5] bg-white/[0.04] hover:bg-white/[0.08] transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4a373]/10 border border-[#d4a373]/30 text-[#d4a373] text-[11px] font-mono tracking-wider uppercase">
            <Eye className="w-3.5 h-3.5" />
            <span>SASHER VISUAL INTENT</span>
          </div>
          <h2 className="font-editorial text-2xl sm:text-3xl tracking-tight text-[#f4f4f5]">
            Attention-Driven Fashion Adaptation
          </h2>
          <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed">
            SASHER uses visual interaction signals to understand which products attract your attention.
          </p>
        </div>

        {/* MASTER ON / OFF TOGGLE SWITCH */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#141519] border border-white/[0.08] shadow-inner space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#f4f4f5]">Visual Intent Engine</span>
                <span 
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isEyeTrackingActive 
                      ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40' 
                      : 'bg-white/[0.06] text-[#71717a] border border-white/[0.08]'
                  }`}
                >
                  {isEyeTrackingActive ? 'ACTIVE (ON)' : 'PAUSED (OFF)'}
                </span>
              </div>
              <p className="text-xs text-[#a1a1aa]">
                {isEyeTrackingActive
                  ? 'Actively capturing attention focus to dynamically adapt recommendation feeds in real time.'
                  : 'Attention tracking is disabled. Recommendations operate on standard profile & popularity baselines.'}
              </p>
            </div>

            {/* Interactive Toggle Switch */}
            <button
              onClick={() => toggleEyeTracking()}
              type="button"
              role="switch"
              aria-checked={isEyeTrackingActive}
              className={`relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#d4a373] focus:ring-offset-2 focus:ring-offset-[#0f1012] ${
                isEyeTrackingActive 
                  ? 'bg-[#10b981] border-[#10b981]' 
                  : 'bg-[#27272a] border-[#3f3f46]'
              }`}
            >
              <span className="sr-only">Toggle Visual Intent</span>
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
                  isEyeTrackingActive ? 'translate-x-8' : 'translate-x-0'
                }`}
              >
                {isEyeTrackingActive ? (
                  <Eye className="w-3.5 h-3.5 text-[#10b981]" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-[#71717a]" />
                )}
              </span>
            </button>
          </div>

          {/* Quick status bar */}
          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs">
            <span className="text-[#71717a] font-mono text-[11px]">
              {isEyeTrackingActive ? 'Live Gaze Reticle & Dwell Multiplier Enabled' : 'Gaze Reticle Muted'}
            </span>
            <button
              onClick={() => toggleEyeTracking()}
              className={`text-xs font-mono font-medium hover:underline cursor-pointer ${
                isEyeTrackingActive ? 'text-[#e0b487]' : 'text-[#10b981]'
              }`}
            >
              {isEyeTrackingActive ? 'Turn Off' : 'Turn On'}
            </button>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="space-y-3">
          <label className="text-[11px] font-mono text-[#71717a] uppercase tracking-wider block">
            Select Active Attention Mode
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Interaction-Based (Default & Truthful) */}
            <div 
              onClick={() => {
                setVisualIntentMode('interaction');
                if (!isEyeTrackingActive) setEyeTrackingActive(true);
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 text-left ${
                visualIntentMode === 'interaction'
                  ? 'bg-[#18191d] border-[#d4a373] shadow-[0_0_15px_rgba(212,163,115,0.15)]'
                  : 'bg-[#121316] border-white/[0.08] hover:border-white/[0.18]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#f4f4f5]">
                  <MousePointer className="w-4 h-4 text-[#d4a373]" />
                  <span>Interaction-Based</span>
                </div>
                {visualIntentMode === 'interaction' && (
                  <CheckCircle2 className="w-4 h-4 text-[#d4a373]" />
                )}
              </div>
              <p className="text-[11px] text-[#a1a1aa] leading-snug">
                Detects product hover dwell duration, image inspection focus, clicks, and scroll alignment.
              </p>
            </div>

            {/* Webcam Optical Sensor */}
            <div 
              onClick={() => {
                setVisualIntentMode('webcam');
                if (!isEyeTrackingActive) setEyeTrackingActive(true);
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 text-left ${
                visualIntentMode === 'webcam'
                  ? 'bg-[#18191d] border-[#10b981] shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                  : 'bg-[#121316] border-white/[0.08] hover:border-white/[0.18]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#f4f4f5]">
                  <Camera className="w-4 h-4 text-[#10b981]" />
                  <span>Webcam Optical Gaze</span>
                </div>
                {visualIntentMode === 'webcam' && (
                  <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                )}
              </div>
              <p className="text-[11px] text-[#a1a1aa] leading-snug">
                Uses client-side ocular geometry for hands-free gaze tracking across product grids.
              </p>
            </div>

          </div>
        </div>

        {/* Real-time Signals Breakdown */}
        <div className="p-4 rounded-2xl bg-[#141518] border border-white/[0.06] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-[#71717a] uppercase text-[10px] tracking-wider">
              {isEyeTrackingActive ? 'Active Attention Signals' : 'Attention Signals (Paused)'}
            </span>
            {isEyeTrackingActive ? (
              <span className="text-[#10b981] flex items-center gap-1.5 font-mono text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-ping" />
                LIVE STREAM
              </span>
            ) : (
              <span className="text-[#71717a] font-mono text-[11px]">STANDBY</span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center font-mono">
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.04]">
              <span className="block text-[10px] text-[#71717a]">HOVER DWELL</span>
              <span className="text-sm font-semibold text-[#d4a373]">+1.2× – 2.5×</span>
            </div>
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.04]">
              <span className="block text-[10px] text-[#71717a]">FOCUS &gt; 1.2s</span>
              <span className="text-sm font-semibold text-[#10b981]">+3.5× Intent</span>
            </div>
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.04]">
              <span className="block text-[10px] text-[#71717a]">MORE LIKE THIS</span>
              <span className="text-sm font-semibold text-[#e2a876]">+3.5× Boost</span>
            </div>
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.04]">
              <span className="block text-[10px] text-[#71717a]">CURRENT TARGET</span>
              <span className="text-[11px] font-semibold text-[#f4f4f5] truncate block">
                {isEyeTrackingActive ? (currentGazeTarget?.productName || 'Browsing Slate') : 'None (Paused)'}
              </span>
            </div>
          </div>
        </div>

        {/* 9-Point Calibration option */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-4 h-4 text-[#d4a373]" />
            <div>
              <span className="text-[#f4f4f5] font-medium block">9-Point Eye Tracker Calibration</span>
              <span className="text-[11px] text-[#71717a]">Current accuracy score: {calibrationScore}%</span>
            </div>
          </div>
          <button
            onClick={() => {
              setIsVisualIntentModalOpen(false);
              openCalibration();
            }}
            className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs font-mono text-[#d4a373] border border-[#d4a373]/30 transition-colors cursor-pointer"
          >
            Calibrate
          </button>
        </div>

        {/* Privacy Commitment */}
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-xs text-[#a1a1aa]">
          <ShieldCheck className="w-4 h-4 text-[#d4a373] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="text-[#f4f4f5] font-medium block">Privacy & Security Assured</span>
            <p className="text-[11px] leading-relaxed text-[#71717a]">
              All interaction signals are processed strictly in your local browser runtime. No private video or imagery is ever uploaded to a server.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setIsVisualIntentModalOpen(false)}
          className="w-full py-3 rounded-xl bg-[#d4a373] text-[#0D0D0D] text-xs font-semibold hover:bg-[#e0b487] transition-colors cursor-pointer"
        >
          Confirm & Return to Catalog
        </button>
      </div>
    </div>
  );
};
