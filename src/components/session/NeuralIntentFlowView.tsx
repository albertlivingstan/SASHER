import React, { useState, useEffect } from 'react';
import { useSasher } from '../../context/SasherContext';
import { Sparkles, User, Cpu, Sliders, Eye, Activity, CheckCircle2, Zap, ArrowRight, ShieldCheck } from 'lucide-react';

interface NeuralIntentFlowViewProps {
  onClose?: () => void;
  standalone?: boolean;
}

export const NeuralIntentFlowView: React.FC<NeuralIntentFlowViewProps> = ({ onClose, standalone = false }) => {
  const { sessionIntent, dynamicWeights, interactions, currentGazeTarget, isEyeTrackingActive } = useSasher();
  const [pulseTick, setPulseTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseTick(prev => (prev + 1) % 100);
    }, 80);
    return () => clearInterval(interval);
  }, []);

  const recentInteractionCount = interactions.length;
  const dominantStyle = sessionIntent.primaryStyle || 'Minimalist Tailoring';
  const dominantCategory = sessionIntent.primaryCategory || 'Outerwear';
  const gazeDwell = currentGazeTarget?.dwellSeconds || 1.8;

  // Personalization branches mirroring the video:
  // "earth tones", "Live WR", "Aucomolizations", "ADF VOC Slot", "Minimalist Cuts"
  const personalizationBranches = [
    { label: dominantCategory, code: 'CL-CATEGORY', weight: Math.round(dynamicWeights.eyeGaze * 100) },
    { label: dominantStyle, code: 'ST-AESTHETIC', weight: Math.round(dynamicWeights.session * 100) },
    { label: 'Live Weight Calibration', code: 'LIVE-WR', weight: Math.round((dynamicWeights.eyeGaze + dynamicWeights.session) * 48) },
    { label: 'Adaptive Recommendations', code: 'REC-STREAM', weight: 96 },
    { label: 'Intent Affinity Vector', code: 'ADF-VOC', weight: Math.round(sessionIntent.confidence * 100) },
  ];

  return (
    <div className={`relative rounded-3xl overflow-hidden bg-[#0d0e11] border border-[#d4a373]/30 shadow-2xl ${
      standalone ? 'p-6 sm:p-10' : 'p-6 sm:p-8 max-w-5xl mx-auto'
    }`}>
      {/* Background Neural Grid & Golden Glow */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(212,163,115,0.15) 0%, rgba(13,14,17,0.95) 75%)'
        }}
      />
      
      {/* Subtle Hairline Brand Top Highlight */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#d4a373] to-transparent" />

      {/* Header bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#27272a]/80">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono tracking-widest uppercase text-[#d4a373]">
            <Sparkles className="w-3.5 h-3.5 text-[#d4a373]" />
            <span>REAL-TIME INTENT ENGINE</span>
            <span className="text-[#3f3f46]">·</span>
            <span className="text-[#a1a1aa]">LATENCY &lt; 14ms</span>
          </div>
          <h2 className="font-editorial text-2xl sm:text-3xl text-[#f4f4f5] tracking-tight mt-1">
            Sasher Understands Your Intent in Real Time
          </h2>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-full border border-white/[0.1] hover:border-white/[0.2] bg-white/[0.04] text-xs font-mono text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors cursor-pointer"
          >
            Close Inspector ✕
          </button>
        )}
      </div>

      {/* Interactive Visual Neural Core Diagram */}
      <div className="relative z-10 py-10 sm:py-14 flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-12">
        
        {/* LEFT NODE: USER & INTERACTIONS */}
        <div className="w-full lg:w-1/4 space-y-4">
          <div className="p-4 rounded-2xl bg-[#14151a] border border-[#27272a] shadow-lg relative group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#d4a373]/20 border border-[#d4a373] flex items-center justify-center text-[#d4a373]">
                <User className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs uppercase font-mono text-[#d4a373] tracking-wider block">SOURCE</span>
                <span className="text-sm font-semibold text-[#f4f4f5]">Shopper</span>
              </div>
            </div>

            <div className="space-y-1.5 text-[11px] font-mono text-[#a1a1aa] border-t border-[#27272a]/60 pt-2.5">
              <div className="flex justify-between">
                <span>Interactions:</span>
                <span className="text-[#f4f4f5] font-semibold">{recentInteractionCount} events</span>
              </div>
              <div className="flex justify-between">
                <span>Visual Gaze Dwell:</span>
                <span className="text-[#10b981] font-semibold">{gazeDwell}s</span>
              </div>
              <div className="flex justify-between">
                <span>Optical Eye Tracking:</span>
                <span className={isEyeTrackingActive ? 'text-[#10b981]' : 'text-[#71717a]'}>
                  {isEyeTrackingActive ? 'CALIBRATED' : 'STANDBY'}
                </span>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-center gap-1.5 text-[10px] font-mono text-[#71717a]">
            <span>Continuous Telemetry Stream</span>
            <ArrowRight className="w-3 h-3 text-[#d4a373] animate-pulse" />
          </div>
        </div>

        {/* CENTER NUCLEUS: AI INTENT CORE */}
        <div className="relative flex flex-col items-center justify-center shrink-0">
          {/* Animated Synaptic Rings */}
          <div 
            className="absolute w-44 h-44 rounded-full border border-[#d4a373]/30 animate-ping pointer-events-none"
            style={{ animationDuration: '3s' }}
          />
          <div 
            className="absolute w-36 h-36 rounded-full border border-[#d4a373]/50 pointer-events-none"
            style={{ transform: `scale(${1 + Math.sin(pulseTick * 0.1) * 0.05})` }}
          />

          <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-[#1a1612] via-[#2d2218] to-[#1a1612] border-2 border-[#d4a373] shadow-[0_0_40px_rgba(212,163,115,0.35)] flex flex-col items-center justify-center relative z-10 text-center p-2">
            <Cpu className="w-6 h-6 text-[#d4a373] mb-1 animate-pulse" />
            <span className="font-editorial text-xl font-bold text-[#f4f4f5] tracking-wide leading-none">AI</span>
            <span className="text-[9px] font-mono text-[#d4a373] uppercase tracking-widest mt-0.5">INTENT CORE</span>
          </div>

          <span className="text-[10px] font-mono text-[#a1a1aa] mt-3">
            Real-Time Transformer Re-ranking
          </span>
        </div>

        {/* RIGHT NODE: PERSONALIZATION OUTCOMES */}
        <div className="w-full lg:w-1/3 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-mono text-[#d4a373] uppercase tracking-wider mb-1 px-1">
            <span>PERSONALIZATION</span>
            <span>WEIGHT</span>
          </div>

          {personalizationBranches.map((branch, idx) => (
            <div 
              key={branch.code}
              className="p-2.5 rounded-xl bg-[#14151a] border border-[#27272a] hover:border-[#d4a373]/50 transition-all flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d4a373]" />
                <span className="text-[#f4f4f5] font-medium">{branch.label}</span>
                <span className="text-[9px] font-mono text-[#71717a]">[{branch.code}]</span>
              </div>
              <div className="flex items-center gap-2 font-mono">
                <div className="w-14 h-1.5 rounded-full bg-black/60 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#d4a373] to-[#ffaa5a] rounded-full"
                    style={{ width: `${branch.weight}%` }}
                  />
                </div>
                <span className="text-[11px] text-[#d4a373] font-semibold w-7 text-right">
                  {branch.weight}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Guarantee */}
      <div className="relative z-10 pt-4 border-t border-[#27272a]/70 flex flex-wrap items-center justify-between text-[11px] text-[#71717a] font-mono">
        <div className="flex items-center gap-2 text-[#10b981]">
          <ShieldCheck className="w-4 h-4" />
          <span>Zero-Telemetry Visual Privacy Guaranteed</span>
        </div>
        <span>Weights calibrated live via WebGaze &amp; Transformer Attention</span>
      </div>
    </div>
  );
};
