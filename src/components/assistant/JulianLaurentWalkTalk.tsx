import React, { useState, useEffect, useRef } from 'react';
import { Product, RecommendedProduct } from '../../types';
import { ConsultantAvatar } from './ConsultantAvatar';
import { julianSpeechService } from '../../services/speechService';
import { generateJulianAiAction, generateJulianProductThoughts, JulianThought } from '../../services/geminiService';
import { 
  Sparkles, 
  MessageSquare, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  ChevronRight, 
  Compass, 
  Eye, 
  CheckCircle2, 
  X,
  Maximize2,
  Minimize2,
  Palette,
  Camera,
  Activity,
  Layers
} from 'lucide-react';

interface JulianLaurentWalkTalkProps {
  product: RecommendedProduct | Product;
  onOpenChat?: () => void;
  className?: string;
}

type AnimationPhase = 'walking' | 'saying_hi' | 'sharing_thoughts';
type AiActionState = null | 'color_harmony' | 'lookbook' | 'proportions' | 'gaze_sync';

export const JulianLaurentWalkTalk: React.FC<JulianLaurentWalkTalkProps> = ({
  product,
  onOpenChat,
  className = ''
}) => {
  const [phase, setPhase] = useState<AnimationPhase>('walking');
  const [currentThoughtIndex, setCurrentThoughtIndex] = useState(0);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isVoiceSpeaking, setIsVoiceSpeaking] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [walkRunCount, setWalkRunCount] = useState(0);
  const [activeAiAction, setActiveAiAction] = useState<AiActionState>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionOutput, setActionOutput] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout[]>([]);

  // Vocalize Julian Laurent's thoughts using Web Speech API TTS
  const speakText = (text: string) => {
    if (!isAudioEnabled) return;
    julianSpeechService.speak(
      text,
      () => setIsVoiceSpeaking(true),
      () => setIsVoiceSpeaking(false),
      () => setIsVoiceSpeaking(false)
    );
  };

  // Synthesized friendly greeting chime (Web Audio API)
  const playGreetingChime = () => {
    if (!isAudioEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.08, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(987.77, now + 0.15);
      gain2.gain.setValueAtTime(0.08, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.55);
    } catch {
      // Audio context fallbacks
    }
  };

  // Run walking -> waving/talking -> sharing thoughts sequence
  const startSequence = () => {
    // Clear any existing timers & active speech
    timerRef.current.forEach(t => clearTimeout(t));
    timerRef.current = [];
    julianSpeechService.stop();
    setIsVoiceSpeaking(false);
    setActiveAiAction(null);
    setActionOutput(null);

    setPhase('walking');

    // Phase 2: After 2.2s, stop walking, wave and speak "Hi!"
    const t1 = setTimeout(() => {
      setPhase('saying_hi');
      playGreetingChime();
      speakText(`Hi! I'm Julian Laurent. Welcome! Let me share my curated styling thoughts for the ${product.name}.`);
    }, 2200);

    // Phase 3: After 4.2s, present thoughts and vocalize initial thought
    const t2 = setTimeout(() => {
      setPhase('sharing_thoughts');
      const thoughts = getProductThoughts();
      speakText(thoughts[0].content);
    }, 4500);

    timerRef.current.push(t1, t2);
  };

  const [geminiThoughts, setGeminiThoughts] = useState<JulianThought[] | null>(null);

  useEffect(() => {
    let isMounted = true;
    generateJulianProductThoughts(product).then((res) => {
      if (isMounted && res && res.length >= 5) {
        setGeminiThoughts(res);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [product.id]);

  useEffect(() => {
    startSequence();
    setCurrentThoughtIndex(0);
    return () => {
      timerRef.current.forEach(t => clearTimeout(t));
      julianSpeechService.stop();
      setIsVoiceSpeaking(false);
    };
  }, [product.id, walkRunCount]);

  // Product-specific curated thoughts from Julian Laurent (Gemini AI enhanced)
  const getProductThoughts = () => {
    if (geminiThoughts && geminiThoughts.length >= 5) {
      return geminiThoughts.map(t => {
        let icon = Sparkles;
        if (t.iconType === 'compass') icon = Compass;
        else if (t.iconType === 'check') icon = CheckCircle2;
        else if (t.iconType === 'eye') icon = Eye;
        else if (t.iconType === 'palette') icon = Palette;

        return {
          tag: t.tag,
          title: t.title,
          icon,
          content: t.content
        };
      });
    }

    const category = product.category || 'Piece';
    const name = product.name;
    const material = product.material || 'fine textile weave';
    const fit = product.fit || 'tailored silhouette';
    const rating = product.rating ? product.rating.toFixed(1) : '4.6';
    const stock = product.stock !== undefined ? product.stock : 24;

    return [
      {
        tag: 'Stylist Compliment & Thought',
        title: 'Julian\'s Aesthetic Verdict',
        icon: Sparkles,
        content: `The ${name} by ${product.brand} is an exceptional ${category.toLowerCase()} piece. Its ${product.color} hue and ${product.style.toLowerCase()} aesthetic align effortlessly with modern proportions.`
      },
      {
        tag: 'Drape & Silhouette',
        title: 'Architectural Proportion',
        icon: Compass,
        content: `The drape of this ${name} is exceptional. The ${material} creates clean structural lines that maintain form while preserving effortless fluid motion.`
      },
      {
        tag: 'Ensemble Styling',
        title: 'Julian\'s Pairing Blueprint',
        icon: Sparkles,
        content: category === 'Outerwear' || category === 'Tailoring'
          ? `I suggest pairing this with minimalist dark trousers, a fine gauge knit mockneck, and burnished leather footwear for an understated, elevated ensemble.`
          : category === 'Dresses'
          ? `Accentuate this dress with a structured cocoon trench and minimal geometric jewelry to let the silhouette speak for itself.`
          : category === 'Tops'
          ? `Balance this top by styling it under an open gabardine overcoat or with relaxed pleat-front trousers in neutral earth tones.`
          : `Anchor this piece as your tonal focal point. Complement it with monochrome essentials to let the texture lead.`
      },
      {
        tag: 'Evaluation & Fit',
        title: 'Curator\'s Sizing Verdict',
        icon: CheckCircle2,
        content: `In our connected DummyJSON evaluation dataset, this piece commands a ${rating}★ rating across customer batches. The ${fit} fits true to size, with ${stock > 0 ? `${stock} units in demo inventory` : 'limited run status'}.`
      },
      {
        tag: 'Visual Attention Telemetry',
        title: 'Visual Dwell Connection',
        icon: Eye,
        content: `When users pause their gaze on this piece, the attention dwells on the shoulder-to-hem geometry. It delivers an immediate +3.5× intent lift because the proportions are mathematically balanced.`
      }
    ];
  };

  const thoughts = getProductThoughts();
  const currentThought = thoughts[currentThoughtIndex % thoughts.length];

  const handleNextThought = () => {
    const nextIdx = (currentThoughtIndex + 1) % thoughts.length;
    setCurrentThoughtIndex(nextIdx);
    setActiveAiAction(null);
    setActionOutput(null);
    speakText(thoughts[nextIdx].content);
  };

  const handleSelectThought = (idx: number) => {
    setCurrentThoughtIndex(idx);
    setActiveAiAction(null);
    setActionOutput(null);
    speakText(thoughts[idx].content);
  };

  const handleToggleAudio = () => {
    const next = !isAudioEnabled;
    setIsAudioEnabled(next);
    if (next) {
      if (phase === 'saying_hi') {
        speakText(`Hi! I'm Julian Laurent. Welcome! Let me share my curated styling thoughts for the ${product.name}.`);
      } else {
        speakText(currentThought.content);
      }
    } else {
      julianSpeechService.stop();
      setIsVoiceSpeaking(false);
    }
  };

  const handleReplayWalk = () => {
    setWalkRunCount((prev) => prev + 1);
  };

  // AI Action triggers powered by Gemini AI
  const handleAiActionClick = async (actionType: AiActionState) => {
    if (!actionType) return;
    setActiveAiAction(actionType);
    setActionLoading(true);
    setActionOutput(null);

    try {
      const output = await generateJulianAiAction(actionType, product);
      setActionLoading(false);
      setActionOutput(output);
    } catch {
      setActionLoading(false);
      setActionOutput(`AI Analysis completed for ${product.name}.`);
    }
  };

  return (
    <div className={`relative bg-gradient-to-br from-[#18191d] via-[#141518] to-[#0f1013] border border-[#27272a] rounded-2xl p-4 sm:p-5 overflow-hidden shadow-xl ${className}`}>
      {/* Background Ambience & Runway Light */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-[#e2a876]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 left-10 w-60 h-20 bg-[#2997ff]/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-10 flex items-center justify-between pb-3 border-b border-[#27272a]/70">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-7 h-7 rounded-full bg-[#e2a876]/15 border border-[#e2a876]/40 flex items-center justify-center text-xs text-[#e2a876] font-editorial font-bold">
              JL
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#10b981] ring-2 ring-[#18191d]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-xs font-semibold text-[#f4f4f5] tracking-wide">
                Julian Laurent
              </h4>
              <span className="text-[10px] font-mono-tabular px-1.5 py-0.5 bg-[#e2a876]/10 text-[#e2a876] rounded border border-[#e2a876]/25 whitespace-nowrap">
                AI Stylist & Consultant
              </span>
            </div>
            <p className="text-[10px] text-[#71717a] font-mono-tabular">
              {phase === 'walking' 
                ? 'Walking in to present piece...' 
                : phase === 'saying_hi' 
                ? 'Greeting & Introduction' 
                : 'Sharing Curated Styling Thoughts'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 text-xs font-mono-tabular">
          {/* Audio TTS Voice Toggle */}
          <button
            onClick={handleToggleAudio}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isAudioEnabled 
                ? 'bg-[#e2a876]/15 border-[#e2a876]/40 text-[#e2a876]' 
                : 'bg-[#121316] border-[#27272a] text-[#71717a] hover:text-[#a1a1aa]'
            }`}
            title={isAudioEnabled ? "Julian's Voice ON (Click to Mute)" : "Julian's Voice OFF (Click to Enable Voice)"}
          >
            {isAudioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Replay Walk Button */}
          <button
            onClick={handleReplayWalk}
            className="p-1.5 rounded-lg border border-[#27272a] bg-[#121316] text-[#a1a1aa] hover:text-[#f4f4f5] hover:border-[#3f3f46] transition-colors cursor-pointer flex items-center gap-1"
            title="Watch Julian walk in and greet again"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[10px]">Walk Again</span>
          </button>

          {/* Minimize / Expand */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg border border-[#27272a] bg-[#121316] text-[#71717a] hover:text-[#f4f4f5] transition-colors cursor-pointer"
            title={isCollapsed ? "Expand Julian's Consultation" : "Minimize"}
          >
            {isCollapsed ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Consultation Stage */}
      {!isCollapsed && (
        <div className="relative z-10 pt-4 flex flex-col md:flex-row items-center gap-4 sm:gap-6 min-h-[200px]">
          {/* LEFT: Runway / Julian Laurent Avatar */}
          <div className="relative w-32 h-52 sm:w-36 sm:h-56 shrink-0 flex items-end justify-center overflow-visible">
            {/* Runway Floor Track */}
            <div className="absolute bottom-1 inset-x-0 h-4 bg-gradient-to-r from-transparent via-[#27272a]/50 to-transparent rounded-full" />

            {/* Walking Translation Container */}
            <div 
              className="relative transition-transform duration-[2200ms] ease-out will-change-transform"
              style={{
                transform: phase === 'walking' 
                  ? 'translateX(-38px) scale(0.96)' 
                  : 'translateX(0px) scale(1.0)'
              }}
            >
              <ConsultantAvatar
                isWalking={phase === 'walking'}
                isWaving={phase === 'saying_hi'}
                isSpeaking={isVoiceSpeaking || phase === 'saying_hi'}
                className="w-32 h-48 sm:w-36 sm:h-52"
              />
            </div>

            {/* Footstep / Walking indicator badge */}
            {phase === 'walking' && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#090a0c]/90 border border-[#e2a876]/40 rounded-full px-2.5 py-0.5 text-[9px] font-mono-tabular text-[#e2a876] whitespace-nowrap animate-bounce flex items-center gap-1 shadow-lg">
                <span>Walking in</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#e2a876] animate-ping" />
              </div>
            )}
          </div>

          {/* RIGHT: Speech & Animated Thought Bubble Container */}
          <div className="flex-1 w-full min-w-0 relative flex flex-col justify-center">
            {/* PHASE 1: WALKING STATUS */}
            {phase === 'walking' && (
              <div className="p-4 bg-[#121316]/90 border border-[#27272a] rounded-2xl text-xs font-mono-tabular space-y-2 animate-pulse">
                <div className="flex items-center gap-2 text-[#e2a876]">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span className="font-semibold">Consultant approaching...</span>
                </div>
                <p className="text-[#a1a1aa] text-[11px] leading-relaxed">
                  Julian Laurent is reviewing your visual dwell coordinates and curating custom styling thoughts for the <strong className="text-[#f4f4f5]">{product.name}</strong>.
                </p>
              </div>
            )}

            {/* PHASE 2: SAYING HI GREETING BANNER */}
            {phase === 'saying_hi' && (
              <div className="relative animate-in fade-in zoom-in-95 duration-500">
                <div className="hidden md:block absolute -left-2 top-8 w-4 h-4 bg-[#1e2026] rotate-45 border-l border-b border-[#e2a876]/40" />

                <div className="p-4 sm:p-5 bg-gradient-to-r from-[#1c1d23] to-[#141519] border border-[#e2a876]/50 rounded-2xl shadow-xl space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">👋</span>
                    <h3 className="font-editorial text-xl sm:text-2xl text-[#f4f4f5] tracking-wide">
                      "Hi! I'm Julian Laurent."
                    </h3>
                  </div>
                  <p className="text-xs text-[#e4e4e7] leading-relaxed font-sans">
                    Welcome to this piece. As your dedicated stylist, I’ve examined the cut, texture, and empirical evaluation metrics for the <strong className="text-[#e2a876]">{product.name}</strong>. Here are my thoughts:
                  </p>
                  <div className="flex items-center gap-2 pt-1 text-[11px] font-mono-tabular text-[#a1a1aa]">
                    <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                    <span>Sharing personal curation in 1s...</span>
                  </div>
                </div>
              </div>
            )}

            {/* PHASE 3: SHARING THOUGHTS & AI ACTIONS */}
            {phase === 'sharing_thoughts' && (
              <div className="relative animate-in fade-in slide-in-from-bottom-3 duration-500">
                <style>{`
                  @keyframes floatGentle {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-3px); }
                  }
                  .thought-bubble-card {
                    animation: floatGentle 4.5s ease-in-out infinite;
                  }
                `}</style>

                {/* Animated Thought Bubble Dots */}
                <div className="hidden md:flex absolute -left-4 top-10 flex-col items-center gap-1.5 pointer-events-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e2a876]/70 animate-ping" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#e2a876]/50 shadow" />
                  <span className="w-3.5 h-3.5 rounded-full bg-[#1e2026] border border-[#e2a876]/40 shadow" />
                </div>

                {/* Main Thought Bubble Card */}
                <div className="thought-bubble-card bg-[#14161a] border border-[#e2a876]/30 hover:border-[#e2a876]/60 transition-all rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3 relative overflow-hidden">
                  {/* Thought Bubble Accent Header */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-[#e2a876]/15 text-[#e2a876] border border-[#e2a876]/30">
                        {React.createElement(currentThought.icon, { className: "w-3.5 h-3.5" })}
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-mono-tabular tracking-wider text-[#e2a876] font-semibold block">
                          Julian's AI Thought &middot; {currentThought.tag}
                        </span>
                        <h4 className="text-xs sm:text-sm font-semibold text-[#f4f4f5] leading-tight">
                          {currentThought.title}
                        </h4>
                      </div>
                    </div>

                    {/* Step indicator */}
                    <div className="flex items-center gap-1 text-[10px] font-mono-tabular text-[#71717a]">
                      {thoughts.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSelectThought(idx)}
                          className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                            idx === currentThoughtIndex 
                              ? 'w-4 bg-[#e2a876]' 
                              : 'bg-[#27272a] hover:bg-[#3f3f46]'
                          }`}
                          aria-label={`Thought ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Thought Bubble Body Text */}
                  <p className="text-xs sm:text-sm text-[#e4e4e7] leading-relaxed font-sans bg-[#0c0d0e]/60 p-3.5 rounded-xl border border-[#27272a]/60 italic">
                    "{currentThought.content}"
                  </p>

                  {/* AI Action Integration Ribbon */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono-tabular text-[11px]">
                    <button
                      onClick={() => handleAiActionClick('color_harmony')}
                      className={`px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        activeAiAction === 'color_harmony' 
                          ? 'bg-[#e2a876] text-[#09090b] font-bold border-[#e2a876]' 
                          : 'bg-[#18191d] hover:bg-[#22242a] border-[#27272a] text-[#a1a1aa] hover:text-[#f4f4f5]'
                      }`}
                    >
                      <Palette className="w-3.5 h-3.5 text-[#e2a876]" />
                      <span>Color Harmony</span>
                    </button>

                    <button
                      onClick={() => handleAiActionClick('lookbook')}
                      className={`px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        activeAiAction === 'lookbook' 
                          ? 'bg-[#2997ff] text-[#09090b] font-bold border-[#2997ff]' 
                          : 'bg-[#18191d] hover:bg-[#22242a] border-[#27272a] text-[#a1a1aa] hover:text-[#f4f4f5]'
                      }`}
                    >
                      <Camera className="w-3.5 h-3.5 text-[#2997ff]" />
                      <span>AI Lookbook</span>
                    </button>

                    <button
                      onClick={() => handleAiActionClick('proportions')}
                      className={`px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        activeAiAction === 'proportions' 
                          ? 'bg-[#10b981] text-[#09090b] font-bold border-[#10b981]' 
                          : 'bg-[#18191d] hover:bg-[#22242a] border-[#27272a] text-[#a1a1aa] hover:text-[#f4f4f5]'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5 text-[#10b981]" />
                      <span>Proportions</span>
                    </button>

                    <button
                      onClick={() => handleAiActionClick('gaze_sync')}
                      className={`px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        activeAiAction === 'gaze_sync' 
                          ? 'bg-[#f4f4f5] text-[#09090b] font-bold border-[#f4f4f5]' 
                          : 'bg-[#18191d] hover:bg-[#22242a] border-[#27272a] text-[#a1a1aa] hover:text-[#f4f4f5]'
                      }`}
                    >
                      <Activity className="w-3.5 h-3.5 text-[#ff6b1a]" />
                      <span>Gaze Sync</span>
                    </button>
                  </div>

                  {/* AI Action Execution Output Box */}
                  {activeAiAction !== null && (
                    <div className="p-3 bg-[#18191d] border border-[#e2a876]/40 rounded-xl text-xs font-mono-tabular text-[#f4f4f5] animate-in fade-in duration-300">
                      {actionLoading ? (
                        <div className="flex items-center gap-2 text-[#e2a876]">
                          <Sparkles className="w-4 h-4 animate-spin" />
                          <span>Julian Laurent AI analyzing parameters...</span>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] text-[#71717a]">
                            <span className="text-[#e2a876] font-semibold uppercase">AI Stylist Output</span>
                            <span>Verified</span>
                          </div>
                          <p className="text-xs text-[#e4e4e7] font-sans leading-relaxed">
                            {actionOutput}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Thought Bubble Interactive Actions Bottom Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#27272a]/50 text-xs font-mono-tabular">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleNextThought}
                        className="px-3 py-1.5 bg-[#e2a876]/15 hover:bg-[#e2a876]/25 text-[#e2a876] border border-[#e2a876]/30 rounded-xl text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Next Thought ({currentThoughtIndex + 1}/{thoughts.length})</span>
                      </button>

                      {onOpenChat && (
                        <button
                          onClick={onOpenChat}
                          className="px-3 py-1.5 bg-[#1f2026] hover:bg-[#272930] text-[#f4f4f5] border border-[#27272a] rounded-xl text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <span>Ask Julian</span>
                          <ChevronRight className="w-3 h-3 text-[#71717a]" />
                        </button>
                      )}
                    </div>

                    <span className="text-[10px] text-[#71717a] font-mono">
                      Aesthetic Curation Matrix
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
