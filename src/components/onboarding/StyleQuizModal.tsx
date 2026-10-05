import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Sliders, 
  Heart, 
  Ruler, 
  Compass, 
  Layers, 
  ShoppingBag,
  Zap
} from 'lucide-react';
import { 
  adaptiveEngine, 
  DEFAULT_STYLE_PROFILE 
} from '../../services/adaptiveEngine';
import { 
  AdaptiveStyleProfile, 
  BodyShapeType, 
  SkinUndertoneType, 
  FitPreferenceType, 
  ComfortPreferenceType, 
  OccasionType 
} from '../../types/adaptiveFashion';

interface StyleQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileCreated?: (profile: AdaptiveStyleProfile) => void;
}

const AVAILABLE_COLORS = [
  { name: 'Black', hex: '#0a0a0a' },
  { name: 'White', hex: '#ffffff' },
  { name: 'Navy', hex: '#1e293b' },
  { name: 'Charcoal', hex: '#374151' },
  { name: 'Olive', hex: '#556b2f' },
  { name: 'Beige', hex: '#d2b48c' },
  { name: 'Cream', hex: '#fdfbf7' },
  { name: 'Burgundy', hex: '#800020' },
  { name: 'Emerald', hex: '#046307' },
  { name: 'Royal Silk Gold', hex: '#d4af37' }
];

const AVAILABLE_STYLES = [
  'Minimal Streetwear',
  'Old Money Classic',
  'Tailored Formal',
  'Casual Chic',
  'Indo-Western Fusion',
  'Athleisure',
  'Architectural Avant-Garde'
];

const AVAILABLE_OCCASIONS: OccasionType[] = [
  'College',
  'Office',
  'Wedding',
  'Party',
  'Casual',
  'Date',
  'Gym',
  'Travel'
];

const BODY_SHAPES: { type: BodyShapeType; label: string; desc: string }[] = [
  { type: 'Athletic', label: 'Athletic / V-Shape', desc: 'Broader shoulders, tapered waist' },
  { type: 'Rectangle', label: 'Rectangle', desc: 'Shoulders, waist, and hips of similar width' },
  { type: 'Hourglass', label: 'Hourglass', desc: 'Balanced bust/hips with a defined waistline' },
  { type: 'Inverted Triangle', label: 'Inverted Triangle', desc: 'Prominent shoulder line, narrower hips' },
  { type: 'Pear', label: 'Pear / Triangle', desc: 'Hips broader than shoulder line' },
  { type: 'Oval', label: 'Oval / Soft', desc: 'Fuller midsection with graceful lines' }
];

const POPULAR_BRANDS = [
  'Uniqlo', 'Zara', 'H&M', 'Fabindia', 'Manyavar', 'Nike', 'Levi\'s', 'Sabyasachi', 'Snitch', 'Westside'
];

export const StyleQuizModal: React.FC<StyleQuizModalProps> = ({
  isOpen,
  onClose,
  onProfileCreated
}) => {
  const currentProfile = adaptiveEngine.getProfile();
  
  const [step, setStep] = useState<number>(1);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  
  // Form State
  const [gender, setGender] = useState<'Men' | 'Women' | 'Unisex' | 'All'>(currentProfile.gender);
  const [ageRange, setAgeRange] = useState<string>(currentProfile.ageRange || '22-26');
  const [heightCm, setHeightCm] = useState<number>(currentProfile.heightCm || 178);
  const [chest, setChest] = useState<number>(currentProfile.measurements?.chest || 40);
  const [waist, setWaist] = useState<number>(currentProfile.measurements?.waist || 32);
  const [hips, setHips] = useState<number>(currentProfile.measurements?.hips || 38);
  const [bodyShape, setBodyShape] = useState<BodyShapeType>(currentProfile.bodyShape || 'Athletic');
  const [skinUndertone, setSkinUndertone] = useState<SkinUndertoneType>(currentProfile.skinUndertone || 'Warm');
  const [selectedColors, setSelectedColors] = useState<string[]>(currentProfile.preferredColors || ['Black', 'Navy', 'White']);
  const [selectedStyles, setSelectedStyles] = useState<string[]>(currentProfile.preferredStyles || ['Minimal Streetwear', 'Casual']);
  const [budgetMax, setBudgetMax] = useState<number>(currentProfile.budgetMax || 2500);
  const [targetBudget, setTargetBudget] = useState<number>(currentProfile.targetBudget || 2000);
  const [fitPreference, setFitPreference] = useState<FitPreferenceType>(currentProfile.fitPreference || 'Oversized');
  const [comfortPreference, setComfortPreference] = useState<ComfortPreferenceType>(currentProfile.comfortPreference || 'Balanced');
  const [selectedOccasions, setSelectedOccasions] = useState<OccasionType[]>(currentProfile.occasions || ['College', 'Casual']);
  const [likedBrands, setLikedBrands] = useState<string[]>(currentProfile.likedBrands || ['Uniqlo', 'H&M']);
  const [cityLocation, setCityLocation] = useState<string>(currentProfile.location || 'Mumbai, India');

  if (!isOpen) return null;

  const toggleColor = (colorName: string) => {
    setSelectedColors(prev => 
      prev.includes(colorName) ? prev.filter(c => c !== colorName) : [...prev, colorName]
    );
  };

  const toggleStyle = (styleName: string) => {
    setSelectedStyles(prev => 
      prev.includes(styleName) ? prev.filter(s => s !== styleName) : [...prev, styleName]
    );
  };

  const toggleOccasion = (occ: OccasionType) => {
    setSelectedOccasions(prev => 
      prev.includes(occ) ? prev.filter(o => o !== occ) : [...prev, occ]
    );
  };

  const toggleBrand = (b: string) => {
    setLikedBrands(prev => 
      prev.includes(b) ? prev.filter(brand => brand !== b) : [...prev, b]
    );
  };

  const handleFinish = () => {
    // Infer archetype from chosen style
    const archetype = selectedStyles[0] || 'Minimal Streetwear';

    const updatedProfile: Partial<AdaptiveStyleProfile> = {
      gender,
      ageRange,
      heightCm,
      measurements: { chest, waist, hips },
      bodyShape,
      skinUndertone,
      preferredColors: selectedColors,
      preferredStyles: selectedStyles,
      budgetMin: Math.max(500, Math.round(budgetMax * 0.4)),
      budgetMax,
      targetBudget,
      fitPreference,
      comfortPreference,
      occasions: selectedOccasions,
      likedBrands,
      location: cityLocation,
      styleArchetype: archetype,
      coldStartStage: 2, // Upgraded from Stage 1 Cold-Start
      lastUpdated: Date.now()
    };

    const saved = adaptiveEngine.saveProfile(updatedProfile);
    setIsCompleted(true);
    if (onProfileCreated) onProfileCreated(saved);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 font-sans animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-[#0e0f12] border border-white/[0.12] rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Subtle Accent Glow */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#d4a373] to-transparent" />

        {/* Modal Header */}
        <div className="p-6 bg-[#141518] border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d4a373]/15 border border-[#d4a373]/30 flex items-center justify-center text-[#d4a373]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#d4a373]">
                ADAPTIVE ONBOARDING
              </div>
              <h2 className="font-editorial text-xl sm:text-2xl text-[#f4f4f5]">
                {isCompleted ? 'Your SASHER Style Profile' : 'Configure Your Style Profile'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#71717a] hover:text-[#f4f4f5] transition-colors rounded-xl hover:bg-white/[0.05] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar (if not completed) */}
        {!isCompleted && (
          <div className="px-6 pt-4 pb-2 bg-[#121316] border-b border-white/[0.05]">
            <div className="flex items-center justify-between text-xs font-mono text-[#a1a1aa] mb-2">
              <span>Step {step} of 4</span>
              <span>
                {step === 1 && 'Basics & Body Silhouette'}
                {step === 2 && 'Fit, Comfort & Aesthetics'}
                {step === 3 && 'Palette & Occasions'}
                {step === 4 && 'Budget & Retailers'}
              </span>
            </div>
            <div className="w-full bg-[#1e2025] h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-[#d4a373] to-[#e8c49e] h-full transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Modal Content Stage */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          
          {isCompleted ? (
            /* COMPLETED SUMMARY CARD */
            <div className="space-y-6 animate-in zoom-in-95 duration-200">
              <div className="p-6 rounded-2xl bg-gradient-to-b from-[#181a1f] to-[#121316] border border-[#d4a373]/40 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#10b981] flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    STYLE PROFILE CALIBRATED
                  </span>
                  <span className="text-xs font-mono text-[#d4a373] bg-[#d4a373]/15 px-2.5 py-0.5 rounded-full border border-[#d4a373]/30">
                    STAGE 2: BEHAVIOR HYBRID
                  </span>
                </div>

                <div className="flex items-baseline justify-between border-b border-white/[0.08] pb-4">
                  <div>
                    <h3 className="text-2xl font-editorial text-[#f4f4f5]">
                      {selectedStyles[0] || 'Minimal Streetwear'}
                    </h3>
                    <p className="text-xs text-[#a1a1aa] mt-0.5">
                      Tailored for {gender} · {heightCm} cm · {bodyShape} Silhouette
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-[#a1a1aa]">Target Budget</div>
                    <div className="text-lg font-mono font-bold text-[#d4a373]">
                      ₹{targetBudget.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Attribute Matrix Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#0c0d0f] border border-white/[0.06]">
                    <span className="text-[10px] font-mono text-[#71717a] block uppercase">Fit Silhouette</span>
                    <span className="font-semibold text-[#f4f4f5]">{fitPreference}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0c0d0f] border border-white/[0.06]">
                    <span className="text-[10px] font-mono text-[#71717a] block uppercase">Core Palette</span>
                    <div className="flex items-center gap-1 mt-1">
                      {selectedColors.slice(0, 4).map(c => (
                        <span key={c} className="text-[10px] bg-white/[0.08] px-1.5 py-0.5 rounded text-[#d4d4d8]">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0c0d0f] border border-white/[0.06]">
                    <span className="text-[10px] font-mono text-[#71717a] block uppercase">Key Occasions</span>
                    <span className="font-semibold text-[#f4f4f5] truncate block">
                      {selectedOccasions.slice(0, 2).join(' + ')}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0c0d0f] border border-white/[0.06]">
                    <span className="text-[10px] font-mono text-[#71717a] block uppercase">Preferred Brands</span>
                    <span className="font-semibold text-[#f4f4f5] truncate block">
                      {likedBrands.slice(0, 3).join(', ')}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0c0d0f] border border-white/[0.06]">
                    <span className="text-[10px] font-mono text-[#71717a] block uppercase">Body Shape</span>
                    <span className="font-semibold text-[#f4f4f5]">{bodyShape}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0c0d0f] border border-white/[0.06]">
                    <span className="text-[10px] font-mono text-[#71717a] block uppercase">Climate Context</span>
                    <span className="font-semibold text-[#f4f4f5]">{cityLocation}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#10b981]/10 border border-[#10b981]/20 text-xs text-[#10b981] flex items-center gap-2">
                  <Zap className="w-4 h-4 shrink-0" />
                  <span>Adaptive weighting applied: SASHER has boosted {selectedStyles[0]} and {fitPreference} fit models across your catalog.</span>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-xl bg-[#d4a373] text-[#09090b] font-semibold text-xs tracking-wider uppercase transition-all shadow-lg hover:bg-[#e0b487] cursor-pointer"
                >
                  Explore Adaptive Recommendations →
                </button>
              </div>
            </div>
          ) : (
            /* MULTI-STEP FLOW */
            <div>
              {/* STEP 1: BASICS & BODY SILHOUETTE */}
              {step === 1 && (
                <div className="space-y-6">
                  {/* Gender / Clothing Preference */}
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-[#a1a1aa] block mb-2">
                      Gender / Preferred Clothing Line
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['Men', 'Women', 'Unisex', 'All'] as const).map(g => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setGender(g)}
                          className={`py-2.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                            gender === g
                              ? 'bg-[#d4a373]/15 border-[#d4a373] text-[#d4a373] font-semibold'
                              : 'bg-[#141518] border-white/[0.08] text-[#a1a1aa] hover:bg-white/[0.04]'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Height & Age */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-mono uppercase tracking-wider text-[#a1a1aa] block mb-2">
                        Height ({heightCm} cm)
                      </label>
                      <input 
                        type="range"
                        min={150}
                        max={205}
                        value={heightCm}
                        onChange={e => setHeightCm(Number(e.target.value))}
                        className="w-full accent-[#d4a373]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono uppercase tracking-wider text-[#a1a1aa] block mb-2">
                        Age Range
                      </label>
                      <select
                        value={ageRange}
                        onChange={e => setAgeRange(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-[#141518] border border-white/[0.08] text-xs text-[#f4f4f5] outline-none"
                      >
                        <option value="18-24">18–24 (College / Young Adult)</option>
                        <option value="25-34">25–34 (Early Professional)</option>
                        <option value="35-44">35–44 (Contemporary)</option>
                        <option value="45+">45+ (Timeless Atelier)</option>
                      </select>
                    </div>
                  </div>

                  {/* Body Shape Selector */}
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-[#a1a1aa] block mb-2">
                      Body Shape Silhouette
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {BODY_SHAPES.map(bs => (
                        <button
                          key={bs.type}
                          type="button"
                          onClick={() => setBodyShape(bs.type)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            bodyShape === bs.type
                              ? 'bg-[#d4a373]/15 border-[#d4a373] shadow-sm'
                              : 'bg-[#141518] border-white/[0.08] hover:bg-white/[0.04]'
                          }`}
                        >
                          <div className="font-semibold text-xs text-[#f4f4f5]">{bs.label}</div>
                          <div className="text-[10px] text-[#71717a] mt-0.5 leading-tight">{bs.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Approximate Measurements (Chest, Waist, Hips in inches) */}
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-[#a1a1aa] block mb-2">
                      Approximate Body Measurements (Inches)
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl bg-[#141518] border border-white/[0.08]">
                        <span className="text-[10px] font-mono text-[#71717a] block">Chest/Bust</span>
                        <input
                          type="number"
                          value={chest}
                          onChange={e => setChest(Number(e.target.value))}
                          className="w-full bg-transparent text-sm font-bold text-[#f4f4f5] outline-none mt-1"
                        />
                      </div>
                      <div className="p-3 rounded-xl bg-[#141518] border border-white/[0.08]">
                        <span className="text-[10px] font-mono text-[#71717a] block">Waist</span>
                        <input
                          type="number"
                          value={waist}
                          onChange={e => setWaist(Number(e.target.value))}
                          className="w-full bg-transparent text-sm font-bold text-[#f4f4f5] outline-none mt-1"
                        />
                      </div>
                      <div className="p-3 rounded-xl bg-[#141518] border border-white/[0.08]">
                        <span className="text-[10px] font-mono text-[#71717a] block">Hips</span>
                        <input
                          type="number"
                          value={hips}
                          onChange={e => setHips(Number(e.target.value))}
                          className="w-full bg-transparent text-sm font-bold text-[#f4f4f5] outline-none mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: FIT, COMFORT & AESTHETIC STYLES */}
              {step === 2 && (
                <div className="space-y-6">
                  {/* Fit Preference (Slim, Regular, Oversized, Relaxed) */}
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-[#a1a1aa] block mb-2">
                      Fit Preference
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['Slim', 'Regular', 'Oversized', 'Relaxed'] as FitPreferenceType[]).map(fit => (
                        <button
                          key={fit}
                          type="button"
                          onClick={() => setFitPreference(fit)}
                          className={`py-3 px-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                            fitPreference === fit
                              ? 'bg-[#d4a373]/15 border-[#d4a373] text-[#d4a373] font-semibold'
                              : 'bg-[#141518] border-white/[0.08] text-[#a1a1aa] hover:bg-white/[0.04]'
                          }`}
                        >
                          {fit}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preferred Styles */}
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-[#a1a1aa] block mb-2">
                      Preferred Style Aesthetics (Choose multiple)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_STYLES.map(style => {
                        const isSelected = selectedStyles.includes(style);
                        return (
                          <button
                            key={style}
                            type="button"
                            onClick={() => toggleStyle(style)}
                            className={`px-3.5 py-2 rounded-xl text-xs transition-all border cursor-pointer ${
                              isSelected
                                ? 'bg-[#d4a373] text-[#09090b] font-semibold border-[#d4a373]'
                                : 'bg-[#141518] text-[#a1a1aa] border-white/[0.08] hover:text-[#f4f4f5]'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 inline mr-1" />}
                            {style}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Comfort Level */}
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-[#a1a1aa] block mb-2">
                      Comfort Priority
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Maximum Comfort', 'Balanced', 'Structured Tailored'] as ComfortPreferenceType[]).map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setComfortPreference(c)}
                          className={`p-3 rounded-xl border text-xs text-center transition-all cursor-pointer ${
                            comfortPreference === c
                              ? 'bg-[#d4a373]/15 border-[#d4a373] text-[#d4a373] font-semibold'
                              : 'bg-[#141518] border-white/[0.08] text-[#a1a1aa]'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: COLOR PALETTE & OCCASIONS */}
              {step === 3 && (
                <div className="space-y-6">
                  {/* Colors */}
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-[#a1a1aa] block mb-2">
                      Preferred Color Palette
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                      {AVAILABLE_COLORS.map(c => {
                        const isSelected = selectedColors.includes(c.name);
                        return (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => toggleColor(c.name)}
                            className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-white/[0.1] border-[#d4a373] text-[#f4f4f5]'
                                : 'bg-[#141518] border-white/[0.08] text-[#a1a1aa]'
                            }`}
                          >
                            <span 
                              className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                              style={{ backgroundColor: c.hex }}
                            />
                            <span className="text-xs truncate">{c.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Common Occasions */}
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-[#a1a1aa] block mb-2">
                      Common Occasions You Dress For
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {AVAILABLE_OCCASIONS.map(occ => {
                        const isSelected = selectedOccasions.includes(occ);
                        return (
                          <button
                            key={occ}
                            type="button"
                            onClick={() => toggleOccasion(occ)}
                            className={`py-2.5 px-3 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#d4a373]/20 border-[#d4a373] text-[#d4a373] font-semibold'
                                : 'bg-[#141518] border-white/[0.08] text-[#a1a1aa]'
                            }`}
                          >
                            {occ}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Location & Climate */}
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-[#a1a1aa] block mb-2">
                      Location / Climate Context
                    </label>
                    <input
                      type="text"
                      value={cityLocation}
                      onChange={e => setCityLocation(e.target.value)}
                      placeholder="e.g. Mumbai, Delhi, Bengaluru, London"
                      className="w-full p-3 rounded-xl bg-[#141518] border border-white/[0.08] text-xs text-[#f4f4f5] outline-none"
                    />
                  </div>
                </div>
              )}

              {/* STEP 4: BUDGET & BRAND PREFERENCES */}
              {step === 4 && (
                <div className="space-y-6">
                  {/* Budget Slider */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-mono uppercase tracking-wider text-[#a1a1aa]">
                        Target Outfit Budget (₹)
                      </label>
                      <span className="font-mono text-sm font-bold text-[#d4a373]">
                        ₹{targetBudget.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1000}
                      max={12000}
                      step={250}
                      value={targetBudget}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setTargetBudget(val);
                        setBudgetMax(Math.round(val * 1.3));
                      }}
                      className="w-full accent-[#d4a373]"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-[#71717a] mt-1">
                      <span>₹1,000 (Student / Budget)</span>
                      <span>₹5,000 (Contemporary)</span>
                      <span>₹12,000+ (Luxury Atelier)</span>
                    </div>
                  </div>

                  {/* Brands Liked */}
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-[#a1a1aa] block mb-2">
                      Preferred Brands & Retailers
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {POPULAR_BRANDS.map(b => {
                        const isLiked = likedBrands.includes(b);
                        return (
                          <button
                            key={b}
                            type="button"
                            onClick={() => toggleBrand(b)}
                            className={`px-3 py-1.5 rounded-xl text-xs border transition-all cursor-pointer ${
                              isLiked
                                ? 'bg-[#d4a373]/20 border-[#d4a373] text-[#d4a373] font-semibold'
                                : 'bg-[#141518] border-white/[0.08] text-[#a1a1aa]'
                            }`}
                          >
                            {isLiked && <Check className="w-3 h-3 inline mr-1" />}
                            {b}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-6 border-t border-white/[0.08] mt-6">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep(s => s - 1)}
                    className="px-4 py-2.5 rounded-xl bg-[#141518] hover:bg-white/[0.06] text-xs text-[#a1a1aa] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                ) : (
                  <div />
                )}

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={() => setStep(s => s + 1)}
                    className="px-5 py-2.5 rounded-xl bg-[#d4a373] text-[#09090b] font-semibold text-xs flex items-center gap-1.5 transition-all hover:bg-[#e0b487] shadow cursor-pointer"
                  >
                    Next Step
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinish}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d4a373] to-[#e8c49e] text-[#09090b] font-bold text-xs flex items-center gap-2 transition-all shadow-lg hover:brightness-110 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    Generate SASHER Style Profile
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
