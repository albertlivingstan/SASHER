import React, { useEffect, useRef } from 'react';
import { useSasher } from '../../context/SasherContext';

interface GlobalGazeHeatmapCanvasProps {
  isVisible: boolean;
  onClose?: () => void;
}

export const GlobalGazeHeatmapCanvas: React.FC<GlobalGazeHeatmapCanvasProps> = ({ isVisible, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { isEyeTrackingActive } = useSasher();

  useEffect(() => {
    if (!isVisible || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Generate simulated real-time gaze fixation points across screen based on active UI hotspots
    const points = [
      { x: canvas.width * 0.25, y: canvas.height * 0.35, intensity: 0.9 }, // Hero banner
      { x: canvas.width * 0.50, y: canvas.height * 0.45, intensity: 0.95 }, // Center catalog
      { x: canvas.width * 0.75, y: canvas.height * 0.30, intensity: 0.7 }, // Side widget
      { x: canvas.width * 0.30, y: canvas.height * 0.75, intensity: 0.85 }, // Product grid item 1
      { x: canvas.width * 0.60, y: canvas.height * 0.80, intensity: 0.8 }, // Product grid item 2
      { x: canvas.width * 0.82, y: canvas.height * 0.65, intensity: 0.6 }  // Sidebar
    ];

    points.forEach(pt => {
      const gradient = ctx.createRadialGradient(pt.x, pt.y, 10, pt.x, pt.y, 120);
      gradient.addColorStop(0, 'rgba(239, 68, 68, 0.85)');   // Hot Red (High fixation)
      gradient.addColorStop(0.3, 'rgba(234, 179, 8, 0.7)');   // Yellow
      gradient.addColorStop(0.6, 'rgba(16, 185, 129, 0.5)');  // Green
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');    // Blue fade out

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 120, 0, Math.PI * 2);
      ctx.fill();
    });

    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-40 pointer-events-none transition-opacity duration-300 backdrop-blur-[1px]">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-85 mix-blend-screen" />
      <div className="absolute top-20 right-6 z-50 bg-[#121316]/90 border border-red-500/40 px-4 py-2 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 pointer-events-auto">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
        </span>
        <div className="text-xs font-mono text-white">
          <span className="font-bold text-red-400">Gaze Heatmap Overlay Active</span>
          <span className="text-[#a1a1aa] block text-[10px]">Thermal fixation distribution (Blue $\to$ Red)</span>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="ml-3 px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-xs font-mono cursor-pointer"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
};
