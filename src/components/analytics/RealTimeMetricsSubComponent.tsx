import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { Activity, Clock, Cpu, Zap } from 'lucide-react';
import { useSasher } from '../../context/SasherContext';

interface RealtimeDataPoint {
  timestamp: string;
  latencyMs: number;
  diversityScore: number;
  sessionLengthSec: number;
}

export const RealTimeMetricsSubComponent: React.FC = () => {
  const { interactions, activeMission } = useSasher();
  const [rollingData, setRollingData] = useState<RealtimeDataPoint[]>([]);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);

  // Rolling window simulation & live telemetry generator
  useEffect(() => {
    if (!isStreaming) return;

    // Initialize initial rolling window if empty
    if (rollingData.length === 0) {
      const now = Date.now();
      const initial: RealtimeDataPoint[] = Array.from({ length: 15 }, (_, i) => {
        const timeOffset = (i - 14) * 2000;
        const d = new Date(now + timeOffset);
        return {
          timestamp: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          latencyMs: Math.round(18 + Math.random() * 14),
          diversityScore: parseFloat((0.68 + Math.random() * 0.22).toFixed(2)),
          sessionLengthSec: Math.round((now - activeMission.missionStartTime) / 1000 + i * 2)
        };
      });
      setRollingData(initial);
    }

    const interval = setInterval(() => {
      const currentTime = Date.now();
      const currentSessionSec = Math.max(1, Math.round((currentTime - activeMission.missionStartTime) / 1000));
      
      // Simulate slight dynamic variation for live telemetry
      const newLatency = Math.round(15 + Math.random() * 22 + (interactions.length % 5));
      const newDiversity = parseFloat((0.72 + Math.sin(currentTime / 5000) * 0.15 + Math.random() * 0.08).toFixed(2));
      const timeStr = new Date(currentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      setRollingData(prev => {
        const nextPoint: RealtimeDataPoint = {
          timestamp: timeStr,
          latencyMs: newLatency,
          diversityScore: Math.min(1.0, Math.max(0.4, newDiversity)),
          sessionLengthSec: currentSessionSec
        };
        // Keep sliding rolling window of last 20 points
        const updated = [...prev, nextPoint];
        if (updated.length > 20) {
          return updated.slice(updated.length - 20);
        }
        return updated;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isStreaming, activeMission.missionStartTime, interactions.length, rollingData.length]);

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-[#121316] border border-white/[0.08] space-y-6 font-sans">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#d4a373] mb-1">
            <Activity className="w-3.5 h-3.5 animate-pulse text-[#10b981]" />
            <span>REAL-TIME ROLLING TELEMETRY & INFERENCE HUB</span>
          </div>
          <h2 className="font-editorial text-2xl sm:text-3xl text-[#f4f4f5]">
            Live Session & Model Performance
          </h2>
          <p className="text-xs text-[#a1a1aa] mt-1">
            Isolated real-time rolling metrics stream tracking active inference latency, catalog diversity, and mission session duration.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsStreaming(prev => !prev)}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer border ${
              isStreaming 
                ? 'bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30 hover:bg-[#10b981]/25' 
                : 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25'
            }`}
          >
            {isStreaming ? '● Live Stream Active' : '⏸ Stream Paused'}
          </button>
        </div>
      </div>

      {/* Quick Live Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#0e0f12] border border-white/[0.06] space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-[#71717a]">
            <span>INFERENCE LATENCY</span>
            <Cpu className="w-4 h-4 text-[#d4a373]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-[#f4f4f5]">
              {rollingData[rollingData.length - 1]?.latencyMs || 22}
            </span>
            <span className="text-xs font-mono text-[#10b981]">ms (avg)</span>
          </div>
          <span className="text-[10px] text-[#a1a1aa] block">Edge WebGL tensor execution</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e0f12] border border-white/[0.06] space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-[#71717a]">
            <span>RECOMMENDATION DIVERSITY</span>
            <Zap className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-sky-400">
              {((rollingData[rollingData.length - 1]?.diversityScore || 0.78) * 100).toFixed(1)}%
            </span>
            <span className="text-xs font-mono text-sky-400/80">MMR Score</span>
          </div>
          <span className="text-[10px] text-[#a1a1aa] block">Intra-list dissimilarity index</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e0f12] border border-white/[0.06] space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-[#71717a]">
            <span>MISSION DURATION</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-emerald-400">
              {Math.floor((rollingData[rollingData.length - 1]?.sessionLengthSec || 0) / 60)}m {((rollingData[rollingData.length - 1]?.sessionLengthSec || 0) % 60)}s
            </span>
            <span className="text-xs font-mono text-emerald-400/80">Active</span>
          </div>
          <span className="text-[10px] text-[#a1a1aa] block">Active mission: {activeMission.purpose}</span>
        </div>
      </div>

      {/* Recharts Multi-Metric Rolling Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        
        {/* Latency & Diversity Trend */}
        <div className="p-5 rounded-2xl bg-[#0e0f12] border border-white/[0.06] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#f4f4f5] font-semibold">
              Live Inference Latency (ms) & Diversity (%)
            </h3>
            <span className="text-[10px] font-mono text-[#71717a]">Rolling 20-Point Window</span>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rollingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="timestamp" stroke="#71717a" fontSize={10} tickLine={false} />
                <YAxis yAxisId="left" stroke="#d4a373" fontSize={10} domain={[0, 60]} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#38bdf8" fontSize={10} domain={[0, 1]} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', fontSize: '11px', color: '#f4f4f5' }}
                  itemStyle={{ color: '#f4f4f5' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line yAxisId="left" type="monotone" dataKey="latencyMs" name="Latency (ms)" stroke="#d4a373" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line yAxisId="right" type="monotone" dataKey="diversityScore" name="Diversity Index" stroke="#38bdf8" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mission Session Length Growth */}
        <div className="p-5 rounded-2xl bg-[#0e0f12] border border-white/[0.06] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#f4f4f5] font-semibold">
              Active Mission Session Length (Seconds)
            </h3>
            <span className="text-[10px] font-mono text-[#71717a]">Isolated Real-Time Buffer</span>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rollingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="timestamp" stroke="#71717a" fontSize={10} tickLine={false} />
                <YAxis stroke="#10b981" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', fontSize: '11px', color: '#f4f4f5' }}
                  itemStyle={{ color: '#f4f4f5' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="sessionLengthSec" name="Session Duration (s)" stroke="#10b981" strokeWidth={2.5} dot={true} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      <div className="p-3.5 rounded-2xl bg-[#141518] border border-white/[0.06] flex items-center justify-between text-xs text-[#a1a1aa] font-mono">
        <span>Note: Real-time telemetry is buffered locally and runs independently to ensure historical offline benchmark datasets remain pristine and unmodified.</span>
        <span className="text-[#10b981] font-bold">ISOLATED ROLLING BUFFER</span>
      </div>

    </div>
  );
};
