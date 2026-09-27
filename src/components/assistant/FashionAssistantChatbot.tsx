import React, { useState, useEffect, useRef } from 'react';
import { ConsultantAvatar } from './ConsultantAvatar';
import { assistantService, AssistantMessage } from '../../services/assistantService';
import { julianSpeechService } from '../../services/speechService';
import { Product, RecommendedProduct } from '../../types';
import { useSasher } from '../../context/SasherContext';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  ShoppingBag, 
  ArrowRight,
  Maximize2,
  Minimize2,
  HelpCircle,
  Eye,
  Smile,
  Volume2,
  VolumeX
} from 'lucide-react';

interface FashionAssistantChatbotProps {
  activeModalProduct?: Product | null;
  onSelectProduct?: (product: Product) => void;
}

type ConsultantEmotion = 'welcoming' | 'thinking' | 'complimenting' | 'analyzing';

export const FashionAssistantChatbot: React.FC<FashionAssistantChatbotProps> = ({
  activeModalProduct,
  onSelectProduct
}) => {
  const { interactions, addToCart } = useSasher();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isVoiceMuted, setIsVoiceMuted] = useState(true);
  const [emotion, setEmotion] = useState<ConsultantEmotion>('welcoming');
  
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: "Hello! I'm Julian Laurent, your personal fashion and styling consultant. You look exceptional today—let me curate an immaculate aesthetic selection tailored precisely to your proportions.",
      timestamp: Date.now(),
      actionButtons: [
        { label: 'College Event Outfits', action: 'browse_category', payload: 'college' },
        { label: 'Casual Shirts', action: 'browse_category', payload: 'casual_shirts' },
        { label: 'Women’s Dresses', action: 'browse_category', payload: 'dresses' },
        { label: 'Shoes & Footwear', action: 'browse_category', payload: 'shoes' },
        { label: 'Watches & Bags', action: 'browse_category', payload: 'watches' },
        { label: 'Top Rated Pieces', action: 'higher_rated' },
        { label: 'Under ₹5,000', action: 'browse_category', payload: 'under_5000' }
      ]
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recentProductIds = interactions.map(i => i.productId);

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  // Context awareness & Emotion state machine + TTS voice output
  useEffect(() => {
    if (activeModalProduct) {
      setEmotion('thinking');
      setIsThinking(true);
      
      const timer = setTimeout(() => {
        setIsThinking(false);
        setEmotion('complimenting');
        
        const complimentPrefix: AssistantMessage = {
          id: `comp-${Date.now()}`,
          sender: 'assistant',
          text: `✨ *Aesthetic Compliment*: Hmm, I noticed you lingering on the **${activeModalProduct.name}**. Excellent eye! That piece features a refined ${activeModalProduct.material || 'textile weave'} and architectural drape that will suit your silhouette and coloring impeccably.`,
          timestamp: Date.now()
        };

        const greeting = assistantService.getProductContextGreeting(activeModalProduct);
        setMessages(prev => [...prev, complimentPrefix, greeting]);

        if (isOpen && !isVoiceMuted) {
          julianSpeechService.speak(
            greeting.text,
            () => setIsSpeaking(true),
            () => {
              setIsSpeaking(false);
              setEmotion('welcoming');
            },
            () => {
              setIsSpeaking(false);
              setEmotion('welcoming');
            }
          );
        }
      }, 700);

      return () => clearTimeout(timer);
    }
  }, [activeModalProduct, isOpen, isVoiceMuted]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg: AssistantMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setEmotion('thinking');
    setIsThinking(true);

    try {
      const response = await assistantService.handleUserQueryAsync(
        text,
        activeModalProduct || null,
        recentProductIds
      );
      
      setIsThinking(false);
      setEmotion('analyzing');
      setMessages(prev => [...prev, response]);

      if (!isVoiceMuted) {
        julianSpeechService.speak(
          response.text,
          () => setIsSpeaking(true),
          () => {
            setIsSpeaking(false);
            setEmotion('welcoming');
          },
          () => {
            setIsSpeaking(false);
            setEmotion('welcoming');
          }
        );
      }
    } catch {
      setIsThinking(false);
      setEmotion('welcoming');
    }
  };

  const handleActionButton = (action: string, payload?: any) => {
    if (action === 'why_product') {
      handleSend('Why was this product recommended?');
    } else if (action === 'find_similar') {
      handleSend('Show products similar to this.');
    } else if (action === 'higher_rated') {
      handleSend('Which products have high ratings?');
    } else if (action === 'style_outfit') {
      handleSend('Style this outfit for me with complete accessories.');
    } else if (action === 'browse_category') {
      if (payload === 'college') handleSend('What should I wear for a college event?');
      else if (payload === 'casual_shirts') handleSend('Show me casual shirts.');
      else if (payload === 'dresses') handleSend('Show me women’s dresses.');
      else if (payload === 'shoes') handleSend('Show me shoes and footwear.');
      else if (payload === 'watches') handleSend('Show me watches and bags.');
      else if (payload === 'under_5000') handleSend('Show me products under 5000.');
      else if (payload === 'under_10000') handleSend('Show me products under 10000.');
      else handleSend(`Show me ${payload}`);
    }
  };

  const getStatusText = () => {
    if (isThinking) return 'Thinking & Analyzing...';
    if (isSpeaking) return 'Speaking...';
    if (emotion === 'complimenting') return 'Complimenting Vibe';
    if (emotion === 'analyzing') return 'Processing Gaze & Intent';
    return 'Observing & Ready';
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 font-sans select-none">
      
      {/* 1. FLOATING LAUNCHER BUTTON (When Closed) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          data-magnetic
          className="group relative flex items-center gap-3 px-4 py-3 bg-[#18191d]/95 hover:bg-[#22242a] border border-[#ff6b1a]/40 hover:border-[#ff6b1a] rounded-full shadow-2xl backdrop-blur-xl transition-all duration-300 cursor-pointer text-left"
          aria-label="Open AI Fashion Assistant"
        >
          {/* Subtle Live Avatar Badge */}
          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-[#27272a] border border-[#ff6b1a]/50 flex items-center justify-center shrink-0">
            <ConsultantAvatar className="w-12 h-16 -mt-3 scale-90" />
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#10b981] ring-1 ring-[#0c0d0e]" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-[#f5f5f7]">Julian Laurent</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#ff6b1a]/15 text-[#ff6b1a] font-medium">AI Stylist</span>
            </div>
            <span className="text-[10px] text-[#a1a1aa] block leading-tight">
              {activeModalProduct ? `Viewing ${activeModalProduct.name.slice(0, 18)}...` : 'Personal Fashion Consultant'}
            </span>
          </div>
        </button>
      )}

      {/* 2. CHATBOT MODAL DOCK (When Open) */}
      {isOpen && (
        <div className={`w-[94vw] sm:w-[480px] bg-[#121316] border border-[#27272a] rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${
          isMinimized ? 'h-16' : 'h-[600px] max-h-[85vh]'
        }`}>
          
          {/* Chatbot Top Bar */}
          <div className="p-3.5 bg-[#18191d] border-b border-[#27272a] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-[#272930] border border-[#ff6b1a]/40 flex items-center justify-center shrink-0">
                <ConsultantAvatar isThinking={isThinking} className="w-12 h-16 -mt-3 scale-90" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-semibold text-[#f5f5f7]">Julian Laurent</h3>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#10b981]/15 text-[#10b981] font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                    <span>Stylist Online</span>
                  </span>
                </div>
                <span className="text-[10px] text-[#71717a] block leading-tight">
                  Lead Fashion Consultant &middot; {getStatusText()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  if (!isVoiceMuted) {
                    julianSpeechService.stop();
                    setIsSpeaking(false);
                  }
                  setIsVoiceMuted(!isVoiceMuted);
                }}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  !isVoiceMuted 
                    ? 'text-[#ff6b1a] bg-[#ff6b1a]/15 hover:bg-[#ff6b1a]/25' 
                    : 'text-[#71717a] hover:text-[#f5f5f7] hover:bg-[#27272a]'
                }`}
                title={isVoiceMuted ? 'Enable Voice Consultation' : 'Mute Voice Consultation'}
                aria-label={isVoiceMuted ? 'Enable Voice' : 'Mute Voice'}
              >
                {!isVoiceMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                onClick={() => {
                  if (!isMinimized) {
                    julianSpeechService.stop();
                    setIsSpeaking(false);
                  }
                  setIsMinimized(!isMinimized);
                }}
                className="p-1.5 text-[#71717a] hover:text-[#f5f5f7] rounded-lg transition-colors cursor-pointer"
                aria-label={isMinimized ? "Maximize chatbot" : "Minimize chatbot"}
              >
                {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <button
                onClick={() => {
                  julianSpeechService.stop();
                  setIsSpeaking(false);
                  setIsOpen(false);
                }}
                className="p-1.5 text-[#71717a] hover:text-[#f5f5f7] rounded-lg transition-colors cursor-pointer"
                aria-label="Close chatbot"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Content Body (when not minimized) */}
          {!isMinimized && (
            <div className="flex-1 flex overflow-hidden">
              
              {/* LEFT SIDE: STANDING CONSULTANT STAGE WITH EMOTIONS & THINKING STATE */}
              <div className="hidden sm:flex flex-col items-center justify-between w-36 bg-[#0e0f12] border-r border-[#27272a] p-3 shrink-0 relative overflow-hidden">
                <div className="text-center z-10">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-[#ff6b1a] block font-bold">
                    ATELIER STYLIST
                  </span>
                  <span className="text-[10px] text-[#e2a876] block font-semibold">
                    {isThinking ? '🧠 Thinking...' : isSpeaking ? '💬 Speaking...' : emotion === 'complimenting' ? '✨ Complimenting' : '👀 Observing'}
                  </span>
                </div>

                {/* Animated Human Avatar with thinking & speaking states */}
                <div className="my-auto py-2">
                  <ConsultantAvatar 
                    isSpeaking={isSpeaking} 
                    isThinking={isThinking}
                    className="w-32 h-56 transition-all duration-300" 
                  />
                </div>

                {/* Status indicator */}
                <div className="text-[9px] font-mono text-[#71717a] text-center z-10">
                  <span>Persona AI v2.4</span>
                </div>
              </div>

              {/* RIGHT SIDE: MESSAGE THREAD & INPUT */}
              <div className="flex-1 flex flex-col justify-between bg-[#121316]">
                
                {/* Scrollable Messages Thread */}
                <div className="flex-1 p-3.5 space-y-3.5 overflow-y-auto">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[88%] p-3 rounded-xl text-xs leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-[#ff6b1a] text-[#09090b] font-medium rounded-tr-none shadow-md'
                            : 'bg-[#18191d] text-[#e4e4e7] border border-[#27272a] rounded-tl-none'
                        }`}
                      >
                        <p className="whitespace-pre-line">{msg.text}</p>

                        {/* Embedded Real Products (Section 8: Never invent products) */}
                        {msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-[#27272a] space-y-1.5">
                            {msg.suggestedProducts.map(product => (
                              <div
                                key={product.id}
                                onClick={() => onSelectProduct && onSelectProduct(product)}
                                className="flex items-center justify-between p-2 rounded-lg bg-[#121316] border border-[#27272a] hover:border-[#ff6b1a] transition-colors cursor-pointer group"
                              >
                                <div className="flex items-center gap-2">
                                  <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="w-8 h-10 object-cover rounded bg-[#18191d]"
                                  />
                                  <div>
                                    <h5 className="text-[11px] font-medium text-[#f5f5f7] line-clamp-1 group-hover:text-[#ff6b1a]">
                                      {product.name}
                                    </h5>
                                    <span className="text-[10px] text-[#71717a]">
                                      {product.category} &middot; {product.currency}{product.price.toLocaleString('en-IN')}
                                    </span>
                                  </div>
                                </div>
                                <ArrowRight className="w-3.5 h-3.5 text-[#71717a] group-hover:text-[#ff6b1a]" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Interactive Working Action Buttons (Section 9) */}
                      {msg.actionButtons && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {msg.actionButtons.map((btn, bidx) => (
                            <button
                              key={bidx}
                              onClick={() => handleActionButton(btn.action, btn.payload)}
                              data-magnetic
                              className="px-2.5 py-1 bg-[#18191d] hover:bg-[#27272a] border border-[#3f3f46]/70 hover:border-[#ff6b1a] text-[#f5f5f7] rounded-lg text-[10px] font-mono tracking-wider transition-all cursor-pointer flex items-center gap-1"
                            >
                              <span>{btn.label}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      <span className="text-[9px] text-[#52525b] mt-1 font-mono">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}

                  {/* Thinking Indicator Bubble */}
                  {isThinking && (
                    <div className="flex items-center gap-2 p-3 bg-[#18191d] border border-[#ff6b1a]/30 rounded-xl text-xs text-[#e2a876] animate-pulse">
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      <span>Julian is pondering your aesthetic proportions and gaze telemetry...</span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input Bar */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="p-2.5 bg-[#18191d] border-t border-[#27272a] flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={activeModalProduct ? `Ask about ${activeModalProduct.name}...` : "Ask a fashion or styling question..."}
                    className="flex-1 bg-[#121316] border border-[#27272a] focus:border-[#ff6b1a] rounded-xl px-3 py-2 text-xs text-[#f5f5f7] placeholder-[#71717a] outline-none"
                    maxLength={300}
                  />

                  <button
                    type="submit"
                    disabled={!inputText.trim() || isThinking}
                    data-magnetic
                    className="p-2 bg-[#ff6b1a] hover:bg-[#e05a10] disabled:bg-[#27272a] disabled:text-[#71717a] text-[#09090b] rounded-xl transition-all cursor-pointer"
                    aria-label="Send query"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>

              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
