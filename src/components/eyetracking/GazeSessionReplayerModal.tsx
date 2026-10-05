import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, FastForward, Eye, X, Clock, Sparkles } from 'lucide-react';

interface GazeSessionReplayerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ReplayFrame {
  timeMs: number;
  x: number;
  y: number;
  dwellMs: number;
  targetCategory: string;
}

const MOCK_REPLAY_TRAJECTORY: ReplayFrame[] = [
  { timeMs: 0, x: 150, y: 200, dwellMs: 400, targetCategory: 'Outerwear' },
  { timeMs: 500, x: 350, y: 250, dwellMs: 800, targetCategory: 'Outerwear' },
  { timeMs: 1200, x: 600, y: 300, dwellMs: 1400, targetCategory: 'Tailoring' },
  { timeMs: 2000, x: 800, y: 450, dwellMs: 1200, targetCategory: 'Knitwear' },
  { timeMs: 3000, x: 500, y: 600, dwellMs: 2200, targetCategory: 'Tops' },
  { timeMs: 4200, x: 300, y: 700, dwellMs: 900, targetCategory: 'Trousers' },
  { timeMs: 5000, x: 700, y: 750, dwellMs: 1500, targetCategory: 'Footwear' },
  { timeMs: 6000, x: 900, y: 400, dwellMs: 1800, targetCategory: 'Accessories' }
];

export const GazeSessionReplayerModal: React.FC<GazeSessionReplayerModalProps> = ({ isOpen, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [speedMultiplier, setSpeedMultiplier] = useState<1 | 2 | 5>(1);
  const maxDurationMs = 6000;

  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    let lastTimestamp = performance.now();
    const updatePlay = (now: number) => {
      const delta = (now - lastTimestamp) * speedMultiplier;
      lastTimestamp = now;

      setCurrentTimeMs(prev => {
        const next = prev + delta;
        if (next >= maxDurationMs) {
          setIsPlaying(false);
          return maxDurationMs;
        }
        return next;
      });

      animationRef.current = requestAnimationFrame(updatePlay);
    };

    animationRef.current = requestAnimationFrame(updatePlay);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, speedMultiplier]);

  if (!isOpen) return null;

  // Find active frame based on current time
  const currentFrame = MOCK_REPLAY_TRAJECTORY.reduce((prev, curr) => {
    return curr.timeMs <= currentTimeMs ? curr : prev;
  }, MOCK_REPLAY_TRAJECTORY[0]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-[#121316] border border-[#27272a] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#27272a] flex items-center justify-between bg-[#18191d]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-editorial text-xl text-[#f4f4f5]">Gaze Session Replay Studio</h3>
              <span className="text-[10px] font-mono text-[#a1a1aa]">High-frequency 60Hz Fixation Trajectory Replay</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Replay Simulation Arena */}
        <div className="relative aspect-[16/9] w-full bg-[#0a0a0c] overflow-hidden border-b border-[#27272a] flex items-center justify-center p-6">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d4a373_1px,transparent_1px)] [background-size:24px_24px]" />
          
          {/* Simulated App Wireframe Backdrop */}
          <div className="absolute inset-8 border border-white/10 rounded-2xl p-6 flex flex-col justify-between pointer-events-none">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <span className="font-editorial text-lg text-white/60">SASHER V2 Studio Sandbox</span>
              <span className="text-xs font-mono text-emerald-400">Target Category: {currentFrame.targetCategory}</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="h-32 rounded-xl bg-white/5 border border-white/5" />
              <div className="h-32 rounded-xl bg-white/5 border border-white/5" />
              <div className="h-32 rounded-xl bg-white/5 border border-white/5" />
            </div>
            <div className="text-[10px] font-mono text-white/40 text-center">
              Recorded Fixation Dwell: {currentFrame.dwellMs}ms · Coordinates: X:{Math.round(currentFrame.x)}, Y:{Math.round(currentFrame.y)}
            </div>
          </div>

          {/* Animated Gaze Reticle Cursor */}
          <div 
            className="absolute w-12 h-12 rounded-full border-2 border-emerald-400 bg-emerald-500/20 backdrop-blur-sm flex items-center justify-center transition-all duration-100 pointer-events-none -translate-x-1/2 -translate-y-1/2 shadow-[0_0_20px_rgba(16,185,129,0.5)]"
            style={{ left: `${(currentFrame.x / 1000) * 100}%`, top: `${(currentFrame.y / 800) * 100}%` }}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
        </div>

        {/* Replay Control Bar */}
        <div className="p-6 bg-[#18191d] space-y-4 font-mono">
          
          {/* Scrubber Timeline */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-[#a1a1aa]">
              <span>{(currentTimeMs / 1000).toFixed(1)}s</span>
              <span>{(maxDurationMs / 1000).toFixed(1)}s</span>
            </div>
            <input 
              type="range" 
              min={0} 
              max={maxDurationMs} 
              value={currentTimeMs}
              onChange={(e) => setCurrentTimeMs(Number(e.target.value))}
              className="w-full accent-[#d4a373] cursor-pointer"
            />
          </div>

          {/* Controls & Speed */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-4 py-2.5 rounded-xl bg-[#d4a373] text-[#09090b] font-bold text-xs flex items-center gap-2 hover:bg-[#e2a876] transition-colors cursor-pointer shadow-lg"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? 'Pause Replay' : 'Play Replay'}</span>
              </button>

              <button
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentTimeMs(0);
                }}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer"
                title="Reset"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#71717a]">Speed:</span>
              {(['1', '2', '5'] as const).map(spd => (
                <button
                  key={spd}
                  onClick={() => setSpeedMultiplier(Number(spd) as 1 | 2 | 5)}
                  className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    speedMultiplier === Number(spd)
                      ? 'bg-[#d4a373] text-[#09090b] font-bold border-[#d4a373]'
                      : 'bg-white/5 text-[#a1a1aa] border-white/10 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
