import React, { useEffect, useRef, useState } from 'react';
import { useSasher } from '../../context/SasherContext';
import { eyeTracker, GazeCallbackPayload } from '../../services/eyeTracker';
import { CheckCircle2 } from 'lucide-react';

interface CoordinateSample {
  x: number;
  y: number;
  time: number;
}

// Temporal smoothing configuration constants
const MOVING_AVERAGE_WINDOW_SIZE = 7;
const SACCADE_THRESHOLD_PX = 135;
const JITTER_DEADZONE_PX = 0.85;

export const GazeReticleOverlay: React.FC = () => {
  const { 
    isEyeTrackingActive, 
    currentGazeTarget 
  } = useSasher();

  const reticleRef = useRef<HTMLDivElement | null>(null);
  const progressCircleRef = useRef<SVGCircleElement | null>(null);

  // History buffer for sliding window temporal moving average
  const historyBufferRef = useRef<CoordinateSample[]>([]);
  const currentSmoothedRef = useRef({ x: 720, y: 450 });

  const radius = 22;
  const circumference = 2 * Math.PI * radius;

  // Direct high-performance eye-tracker subscription bypassing React re-render cycles
  useEffect(() => {
    if (!isEyeTrackingActive) {
      historyBufferRef.current = [];
      return;
    }

    const unsubscribe = eyeTracker.subscribe((payload: GazeCallbackPayload) => {
      const rawX = payload.x;
      const rawY = payload.y;
      if (typeof rawX !== 'number' || typeof rawY !== 'number') return;

      const now = performance.now();
      const history = historyBufferRef.current;

      // Detect saccadic eye movements
      if (history.length > 0) {
        const lastSample = history[history.length - 1];
        const jumpDistance = Math.hypot(rawX - lastSample.x, rawY - lastSample.y);
        if (jumpDistance > SACCADE_THRESHOLD_PX) {
          history.length = 0;
        }
      }

      history.push({ x: rawX, y: rawY, time: now });
      if (history.length > MOVING_AVERAGE_WINDOW_SIZE) {
        history.shift();
      }

      // Compute weighted moving average
      let totalWeight = 0;
      let weightedSumX = 0;
      let weightedSumY = 0;

      for (let i = 0; i < history.length; i++) {
        const weight = i + 1;
        weightedSumX += history[i].x * weight;
        weightedSumY += history[i].y * weight;
        totalWeight += weight;
      }

      const filteredX = weightedSumX / totalWeight;
      const filteredY = weightedSumY / totalWeight;

      const prev = currentSmoothedRef.current;
      const displacement = Math.hypot(filteredX - prev.x, filteredY - prev.y);

      if (displacement > JITTER_DEADZONE_PX) {
        currentSmoothedRef.current = { x: filteredX, y: filteredY };
        if (reticleRef.current) {
          reticleRef.current.style.transform = `translate3d(${filteredX - 30}px, ${filteredY - 30}px, 0)`;
        }
      }

      // Update dwell progress arc directly in DOM to avoid state thrash
      if (progressCircleRef.current) {
        const dwellProgress = Math.min(100, Math.round((payload.dwellSeconds / 1.2) * 100));
        const offset = circumference - (dwellProgress / 100) * circumference;
        progressCircleRef.current.style.strokeDashoffset = `${offset}`;
        progressCircleRef.current.style.stroke = payload.dwellSeconds >= 1.2 ? '#10b981' : '#ff6b1a';
      }
    });

    return () => unsubscribe();
  }, [isEyeTrackingActive, circumference]);

  if (!isEyeTrackingActive) return null;

  const dwellSeconds = currentGazeTarget?.dwellSeconds || 0;
  const isInterestLocked = dwellSeconds >= 1.2 || currentGazeTarget?.status === 'interest_confirmed';

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden font-sans select-none">
      {/* Temporally Filtered Gaze Reticle */}
      <div 
        ref={reticleRef}
        className="absolute top-0 left-0 transition-transform duration-75 ease-out will-change-transform"
        style={{
          transform: `translate3d(${currentSmoothedRef.current.x - 30}px, ${currentSmoothedRef.current.y - 30}px, 0)`
        }}
      >
        <div className="relative w-[60px] h-[60px] flex items-center justify-center">
          {/* Circular Progress Ring for 1.2s Dwell Intent */}
          <svg className="w-full h-full -rotate-90">
            {/* Background Track */}
            <circle
              cx="30"
              cy="30"
              r={radius}
              className="stroke-[#27272a]/50"
              strokeWidth="2.5"
              fill="transparent"
            />
            {/* Active Dwell Progress Arc */}
            <circle
              ref={progressCircleRef}
              cx="30"
              cy="30"
              r={radius}
              stroke={isInterestLocked ? '#10b981' : '#ff6b1a'}
              strokeWidth="2.5"
              strokeDasharray={circumference}
              strokeDashoffset={circumference}
              strokeLinecap="round"
              fill="transparent"
              style={{
                transition: 'stroke-dashoffset 0.08s linear, stroke 0.2s ease'
              }}
            />
          </svg>

          {/* Center Focal Dot & Crosshair */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div 
              className={`w-2 h-2 rounded-full transition-all duration-150 ${
                isInterestLocked 
                  ? 'bg-[#10b981] shadow-[0_0_12px_#10b981] scale-125' 
                  : 'bg-[#ff6b1a] shadow-[0_0_8px_#ff6b1a]'
              }`} 
            />
            {/* Outer Subtle Pulse Ring */}
            <div 
              className={`absolute w-8 h-8 rounded-full border border-dashed transition-all duration-300 ${
                isInterestLocked
                  ? 'border-[#10b981]/80 animate-ping opacity-40'
                  : 'border-[#ff6b1a]/40 animate-pulse'
              }`}
            />
          </div>

          {/* Target Tooltip Badge */}
          {currentGazeTarget && (
            <div 
              className={`absolute left-1/2 -bottom-9 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-mono font-medium shadow-xl backdrop-blur-md border transition-all animate-in fade-in duration-150 ${
                isInterestLocked
                  ? 'bg-[#10b981]/20 border-[#10b981] text-[#10b981]'
                  : 'bg-[#121316]/90 border-[#ff6b1a]/60 text-[#f5f5f7]'
              }`}
            >
              <div className="flex items-center gap-1.5">
                {isInterestLocked ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-[#10b981]" />
                    <span>Locked: +3.5× Intent Lift</span>
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b1a] animate-pulse" />
                    <span className="truncate max-w-[120px]">{currentGazeTarget.productName}</span>
                    <span className="text-[#a1a1aa] font-bold">{dwellSeconds.toFixed(1)}s</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
