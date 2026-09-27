/**
 * Julian Laurent Speech Synthesis & Voice Service
 * Powered by Web Speech API (SpeechSynthesis)
 * Provides articulate, natural vocalization for Julian Laurent's fashion consultation thoughts.
 */

class JulianSpeechService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private selectedVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();

    // Prefer elegant male English voices (Daniel, Oliver, Arthur, Guy, Google UK English Male)
    const preferred = this.voices.find(v => 
      v.lang.startsWith('en') && (
        v.name.includes('Daniel') ||
        v.name.includes('Oliver') ||
        v.name.includes('Arthur') ||
        v.name.includes('Google UK English Male') ||
        v.name.includes('Guy') ||
        v.name.includes('Natural') ||
        v.name.includes('Male')
      )
    ) || this.voices.find(v => v.lang.startsWith('en-GB') || v.lang.startsWith('en-US') || v.lang.startsWith('en')) || this.voices[0];

    if (preferred) {
      this.selectedVoice = preferred;
    }
  }

  public speak(
    text: string, 
    onStart?: () => void, 
    onEnd?: () => void, 
    onError?: () => void
  ): boolean {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return false;
    }

    try {
      this.stop();

      // Clean text for speech (strip markdown characters and emojis)
      const cleanText = text
        .replace(/[*_~`]/g, '')
        .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
        .trim();

      if (!cleanText) return false;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      this.currentUtterance = utterance;

      if (!this.selectedVoice) {
        this.loadVoices();
      }
      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
      }

      utterance.rate = 0.96; // Refined cadence
      utterance.pitch = 0.95; // Elegant male pitch
      utterance.volume = 1.0;

      utterance.onstart = () => {
        if (onStart) onStart();
      };

      utterance.onend = () => {
        this.currentUtterance = null;
        if (onEnd) onEnd();
      };

      utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
        // Normal speech cancellation/interruption or browser audio permission policies should not trigger warnings
        if (e.error !== 'canceled' && e.error !== 'interrupted' && e.error !== 'not-allowed') {
          // Silent recovery without flooding console
        }
        this.currentUtterance = null;
        if (onError) onError();
        if (onEnd) onEnd();
      };

      if (this.synth) {
        if (this.synth.paused) {
          this.synth.resume();
        }
        this.synth.speak(utterance);
      }
      return true;
    } catch (err) {
      console.warn('Failed to speak with SpeechSynthesis:', err);
      return false;
    }
  }

  public stop() {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {}
      this.currentUtterance = null;
    }
  }

  public isSpeaking(): boolean {
    return !!(this.synth && (this.synth.speaking || this.synth.pending));
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }
}

export const julianSpeechService = new JulianSpeechService();
