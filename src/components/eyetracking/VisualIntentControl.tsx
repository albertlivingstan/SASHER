import React, { useState, useRef, useEffect } from 'react';
import { useSasher } from '../../context/SasherContext';
import { Eye, EyeOff, CheckCircle2, Shield, Terminal, RefreshCw, X } from 'lucide-react';

export const VisualIntentControl: React.FC = () => {
  const { 
    isEyeTrackingActive, 
    toggleEyeTracking, 
    calibrationScore, 
    openCalibration,
    currentGazeTarget,
    toggleGazeDebug,
    isGazeDebugOpen
  } = useSasher();

  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  // Close popover on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block font-sans" ref={popoverRef}>
      {/* Compact Eye Icon Button (20px icon, refined visual-intent status) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        data-magnetic
        className={`p-2 rounded-full transition-all duration-150 cursor-pointer relative flex items-center justify-center shrink-0 ${
          isEyeTrackingActive 
            ? 'text-[#ff6b1a] bg-[#ff6b1a]/10 border border-[#ff6b1a]/40 hover:border-[#ff6b1a] shadow-[0_0_10px_rgba(255,107,26,0.18)]' 
            : 'text-[#8e8e93] hover:text-[#f4f4f5] border border-white/[0.08] hover:bg-white/[0.04]'
        }`}
        title={isEyeTrackingActive ? "Visual Intent Gaze AI: ACTIVE (Click for telemetry)" : "Visual Intent Gaze AI: PAUSED (Click to view)"}
        aria-label="Visual Intent Control"
      >
        <Eye className="w-5 h-5 transition-transform group-hover:scale-105" strokeWidth={1.75} />
        {isEyeTrackingActive && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#10b981] ring-2 ring-[#0a0a0c]" />
        )}
      </button>

      {/* Popover Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-[#121316] border border-[#27272a] rounded-2xl p-4 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#27272a]/60">
            <div>
              <h4 className="text-xs font-semibold tracking-wider uppercase text-[#f4f4f5] flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isEyeTrackingActive ? 'bg-[#30d158] animate-pulse' : 'bg-[#71717a]'}`} />
                <span>Visual Intent: {isEyeTrackingActive ? 'ACTIVE' : 'PAUSED'}</span>
              </h4>
              <p className="text-[11px] text-[#71717a] font-mono mt-0.5">Tracking &middot; Calib {calibrationScore}%</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-[#71717a] hover:text-[#f4f4f5] rounded-md transition-colors cursor-pointer"
              aria-label="Close popover"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body stats */}
          <div className="py-3 space-y-3 font-mono-tabular text-xs">
            {/* Calibration & Status */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#a1a1aa]">Gaze Calibration</span>
              <span className="text-[#f4f4f5] font-medium flex items-center gap-1">
                <span>{calibrationScore}%</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
              </span>
            </div>

            {/* Current Focus */}
            <div className="p-2.5 bg-[#18191d] rounded-xl border border-[#27272a]/70">
              <span className="text-[10px] uppercase tracking-wider text-[#71717a] block mb-1">
                Current Gaze Target
              </span>
              <p className="text-xs font-medium text-[#f4f4f5] truncate">
                {currentGazeTarget ? `"${currentGazeTarget.productName}"` : 'Scanning catalog (no focal target)'}
              </p>
              
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-[#27272a]/50 text-[11px]">
                <div>
                  <span className="text-[#71717a] block text-[10px]">Dwell Time</span>
                  <span className="text-[#e2a876] font-semibold">
                    {currentGazeTarget ? `${currentGazeTarget.dwellSeconds}s` : '0.0s'}
                  </span>
                </div>
                <div>
                  <span className="text-[#71717a] block text-[10px]">Intent Lift</span>
                  <span className="text-[#10b981] font-semibold">
                    {currentGazeTarget?.dwellSeconds && currentGazeTarget.dwellSeconds >= 1.2 ? '+3.5×' : '+1.0×'}
                  </span>
                </div>
              </div>
            </div>

            {/* Privacy notice */}
            <div className="flex items-start gap-2 text-[10px] text-[#71717a] bg-[#18191d]/50 p-2 rounded-lg font-sans">
              <Shield className="w-3.5 h-3.5 text-[#71717a] shrink-0 mt-0.5" />
              <span>Webcam telemetry runs strictly client-side. No biometric data is ever stored.</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 border-t border-[#27272a]/60 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={toggleEyeTracking}
                className={`w-full py-2 px-3 rounded-xl text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  isEyeTrackingActive 
                    ? 'bg-[#27272a] hover:bg-[#3f3f46] text-[#f4f4f5]'
                    : 'bg-[#e2a876] hover:bg-[#d69864] text-[#09090b]'
                }`}
              >
                {isEyeTrackingActive ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Resume</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  openCalibration();
                }}
                className="w-full py-2 px-3 bg-[#18191d] hover:bg-[#27272a] text-[#f4f4f5] border border-[#27272a] rounded-xl text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#a1a1aa]" />
                <span>Calibrate</span>
              </button>
            </div>

            {/* Technical Debug HUD trigger */}
            <button
              onClick={() => {
                toggleGazeDebug();
              }}
              className="w-full py-1.5 text-center text-[10px] font-mono text-[#71717a] hover:text-[#a1a1aa] transition-colors cursor-pointer flex items-center justify-center gap-1"
            >
              <Terminal className="w-3 h-3" />
              <span>{isGazeDebugOpen ? 'Hide Gaze Debug HUD' : 'Researcher Gaze Debug Mode'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
