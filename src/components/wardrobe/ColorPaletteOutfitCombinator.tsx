import React, { useState } from 'react';
import { Sparkles, Palette, Layers, CheckCircle2, ArrowRight } from 'lucide-react';
import { INITIAL_PRODUCTS } from '../../data/products';
import { Product } from '../../types';

interface ColorPaletteOutfitCombinatorProps {
  onSelectProduct?: (product: Product) => void;
}

export const ColorPaletteOutfitCombinator: React.FC<ColorPaletteOutfitCombinatorProps> = ({ onSelectProduct }) => {
  const [selectedHarmonizer, setSelectedHarmonizer] = useState<'complementary' | 'triadic' | 'monochrome'>('complementary');
  const [activeColorHex, setActiveColorHex] = useState('#2b2d42'); // Navy / Charcoal base

  // Sample palette extraction from gazed/active products
  const paletteSwatches = [
    { name: 'Midnight Navy', hex: '#1d2a44', hsv: '220°, 58%, 27%' },
    { name: 'Warm Terracotta', hex: '#d97757', hsv: '16°, 60%, 85%' },
    { name: 'Ecru Silk', hex: '#f4f1ea', hsv: '40°, 4%, 95%' },
    { name: 'Olive Drab', hex: '#555d50', hsv: '95°, 14%, 36%' }
  ];

  return (
    <div className="p-6 bg-[#121316] border border-[#27272a] rounded-3xl space-y-6 font-sans shadow-xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#d4a373] mb-1">
            <Palette className="w-3.5 h-3.5" />
            <span>ADVANCED AESTHETIC ENGINE · HSV/RGB COLOR SPECTRUM</span>
          </div>
          <h3 className="font-editorial text-2xl text-[#f4f4f5]">
            Dominant Color Palette & Capsule Outfit Combinator
          </h3>
          <p className="text-xs text-[#a1a1aa] mt-0.5">
            Extracts dominant color spectrum from gazed items to synthesize color-harmonized capsule looks.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-[#18191d] rounded-xl border border-white/10 text-xs font-mono">
          {(['complementary', 'triadic', 'monochrome'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setSelectedHarmonizer(mode)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                selectedHarmonizer === mode ? 'bg-[#d4a373] text-[#09090b] font-bold shadow' : 'text-[#a1a1aa] hover:text-white'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Extracted Swatches */}
      <div className="space-y-3">
        <span className="text-xs font-mono uppercase text-[#71717a] tracking-wider block">
          Extracted Color Spectrum (HSV / RGB from Active Gaze Target)
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {paletteSwatches.map((swatch, idx) => (
            <div 
              key={idx} 
              onClick={() => setActiveColorHex(swatch.hex)}
              className={`p-3 rounded-2xl bg-[#18191d] border transition-all cursor-pointer flex items-center gap-3 ${
                activeColorHex === swatch.hex ? 'border-[#d4a373] ring-1 ring-[#d4a373]' : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="w-10 h-10 rounded-xl shadow-md border border-white/10 shrink-0" style={{ backgroundColor: swatch.hex }} />
              <div className="overflow-hidden">
                <span className="text-xs font-medium text-white block truncate">{swatch.name}</span>
                <span className="text-[10px] font-mono text-[#a1a1aa] block">{swatch.hsv}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Harmonized Capsule Look */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-[#18191d] to-[#121316] border border-white/[0.08] space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-xs font-mono uppercase text-[#d4a373] tracking-wider">
            Synthesized Capsule Outfit ({selectedHarmonizer.toUpperCase()} Harmony)
          </span>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            96.4% Color Theory Match
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {INITIAL_PRODUCTS.slice(0, 3).map((prod) => (
            <div 
              key={prod.id}
              onClick={() => onSelectProduct && onSelectProduct(prod)}
              className="p-3 rounded-2xl bg-[#0c0d0e] border border-white/10 hover:border-[#d4a373] transition-all cursor-pointer group space-y-2"
            >
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-black/40">
                <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div>
                <span className="text-xs font-semibold text-white block truncate">{prod.name}</span>
                <span className="text-[10px] font-mono text-[#d4a373]">₹{prod.price.toLocaleString('en-IN')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
