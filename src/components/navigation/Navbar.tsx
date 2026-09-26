import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useSasher } from '../../context/SasherContext';
import { GoogleAuthButton } from '../auth/GoogleAuthButton';
import { VisualIntentControl } from '../eyetracking/VisualIntentControl';
import { 
  Sun, 
  Moon, 
  Laptop, 
  Bell, 
  Heart, 
  ShoppingBag, 
  Truck, 
  RotateCcw, 
  Headphones, 
  Menu, 
  X,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  BookOpen,
  Eye,
  BarChart2,
  Activity,
  Layers,
  Cpu,
  Zap
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenSupport?: () => void;
  onOpenTracking?: () => void;
  onOpenReturn?: () => void;
  onOpenProfile?: (initialTab?: 'orders' | 'profile') => void;
  onOpenOrderHistory?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentTab, 
  setCurrentTab, 
  onOpenSupport, 
  onOpenTracking,
  onOpenReturn,
  onOpenProfile,
  onOpenOrderHistory 
}) => {
  const { 
    isEyeTrackingActive, 
    wishlistIds, 
    cart, 
    setIsCartDrawerOpen,
    completedOrders,
    recentAdaptiveNotification,
    dismissAdaptiveNotification
  } = useSasher();

  const [theme, setTheme] = useState<'system' | 'dark' | 'light'>('dark');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const notifRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const savedTheme = localStorage.getItem('app_theme_mode') as 'system' | 'dark' | 'light' | null;
      if (savedTheme) {
        setTheme(savedTheme);
        applyTheme(savedTheme);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Close notifications popover on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    if (isNotificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotificationOpen]);

  // Lock body scroll when mobile/tablet drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  // Close drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen]);

  const applyTheme = (mode: 'system' | 'dark' | 'light') => {
    try {
      if (mode === 'system') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', mode);
      }
      localStorage.setItem('app_theme_mode', mode);
    } catch (e) {
      console.error(e);
    }
  };

  const cycleTheme = () => {
    const nextTheme: 'dark' | 'light' | 'system' = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark';
    setTheme(nextTheme);
    applyTheme(nextTheme);
  };

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  // All 8 Core Architecture Components
  const allNavItems = [
    { 
      id: 'discover', 
      label: 'Discover', 
      shortLabel: 'Discover',
      desc: 'Curated Runway Catalog & Interactive Adaptation Showcase',
      icon: Sparkles 
    },
    { 
      id: 'research', 
      label: 'Research & Evaluation', 
      shortLabel: 'Research',
      desc: 'Peer-Reviewed Empirical Metrics, Sales Econometrics & Ablation Study',
      icon: BookOpen 
    },
    { 
      id: 'gaze_studio', 
      label: 'Gaze HUD', 
      shortLabel: 'Gaze HUD',
      desc: 'Live Optical Visual Attention Studio & Reticle Calibration',
      icon: Eye 
    },
    { 
      id: 'evaluation_analytics', 
      label: 'Model Evaluation', 
      shortLabel: 'Evaluation',
      desc: 'Precision-Recall Curves & Offline Replay Analytics',
      icon: BarChart2 
    },
    { 
      id: 'platform_analytics', 
      label: 'Platform', 
      shortLabel: 'Platform',
      desc: 'Security Defense Shield & Throughput Analytics',
      icon: Activity 
    },
    { 
      id: 'recommendations', 
      label: 'Recommendations', 
      shortLabel: 'Recommendations',
      desc: 'Sequential Transformer Personalized Catalog',
      icon: Layers 
    },
    { 
      id: 'insights', 
      label: 'AI Insights', 
      shortLabel: 'AI Insights',
      desc: 'Dynamic MMR Weight Breakdown & Entropy Analysis',
      icon: Cpu 
    },
    { 
      id: 'telemetry', 
      label: 'Telemetry', 
      shortLabel: 'Telemetry',
      desc: '24h Live Stream Telemetry & Pipeline Latency Engine',
      icon: Zap 
    },
  ];

  const handleNavClick = (tabId: string) => {
    setCurrentTab(tabId);
    setIsDrawerOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#0a0a0c]/90 backdrop-blur-md border-b border-white/[0.08] transition-colors duration-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-[74px] flex items-center justify-between gap-3">
          
          {/* ================= LEFT: WORDMARK ================= */}
          <div className="flex items-center shrink-0">
            <button
              onClick={() => handleNavClick('discover')}
              data-magnetic
              className="group cursor-pointer focus:outline-none flex items-center select-none"
              aria-label="SASHER Home"
            >
              <span className="font-editorial text-2xl sm:text-[26px] tracking-tight text-[#f5f5f7] group-hover:text-[#ff6b1a] transition-colors duration-150 whitespace-nowrap">
                SASHER
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#ff6b1a] ml-2 shrink-0 mb-0.5" />
            </button>
          </div>

          {/* ================= CENTER: NAVIGATION ITEMS (Desktop >= 1024px) ================= */}
          <nav className="hidden lg:flex items-center gap-3.5 xl:gap-5 2xl:gap-7 mx-auto whitespace-nowrap">
            {allNavItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  data-magnetic
                  className={`relative py-2 text-[11px] xl:text-xs uppercase tracking-[0.07em] font-medium transition-colors duration-150 cursor-pointer ${
                    isActive ? 'text-[#f5f5f7] font-semibold' : 'text-[#8e8e93] hover:text-[#f4f4f5]'
                  }`}
                  title={item.desc}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute -bottom-[20px] left-0 right-0 h-[2px] rounded-full bg-[#ff6b1a] transition-all duration-200" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* ================= RIGHT: UTILITY AREA (Desktop >= 1024px) ================= */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink-0 whitespace-nowrap">
            
            {/* 1. Theme / Dark Mode icon */}
            <button
              onClick={cycleTheme}
              data-magnetic
              title={`Current Theme: ${theme.toUpperCase()} (Click to toggle)`}
              className="p-2 text-[#8e8e93] hover:text-[#ff6b1a] rounded-full hover:bg-white/[0.04] transition-all duration-150 cursor-pointer shrink-0"
              aria-label="Toggle theme"
            >
              {theme === 'dark' && <Moon className="w-5 h-5" strokeWidth={1.75} />}
              {theme === 'light' && <Sun className="w-5 h-5 text-[#2997ff]" strokeWidth={1.75} />}
              {theme === 'system' && <Laptop className="w-5 h-5" strokeWidth={1.75} />}
            </button>

            {/* 2. Sign In button */}
            <div className="shrink-0 px-0.5">
              <GoogleAuthButton compact={true} onOpenProfile={onOpenProfile} />
            </div>

            {/* 3. Notifications */}
            <div className="relative shrink-0" ref={notifRef}>
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                data-magnetic
                className="p-2 text-[#8e8e93] hover:text-[#ff6b1a] rounded-full hover:bg-white/[0.04] transition-all duration-150 cursor-pointer relative"
                title="Telemetry & Adaptive Notifications"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" strokeWidth={1.75} />
                {recentAdaptiveNotification && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ff6b1a] ring-2 ring-[#0a0a0c] animate-pulse" />
                )}
              </button>

              {/* Notification Popover */}
              {isNotificationOpen && (
                <div className="absolute right-0 mt-2.5 w-80 bg-[#121316] border border-white/[0.1] rounded-2xl p-4 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150 text-xs">
                  <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.08]">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-[#a1a1aa] font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#ff6b1a]" />
                      <span>Real-Time Updates</span>
                    </span>
                    <button 
                      onClick={() => setIsNotificationOpen(false)}
                      className="text-[#71717a] hover:text-[#f4f4f5] p-0.5 rounded-md"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="py-3">
                    {recentAdaptiveNotification ? (
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-[#ff6b1a]/25 text-[#f4f4f5] text-[11px] leading-relaxed space-y-2">
                        <p>{recentAdaptiveNotification}</p>
                        <button
                          onClick={dismissAdaptiveNotification}
                          className="text-[10px] font-mono text-[#ff6b1a] hover:underline block"
                        >
                          Dismiss notification
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 text-center text-[#71717a] text-[11px] font-mono">
                        All visual intent channels synchronized. No pending alerts.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 4. Wishlist */}
            <button
              onClick={() => handleNavClick('discover')}
              data-magnetic
              className="p-2 text-[#8e8e93] hover:text-[#ff6b1a] rounded-full hover:bg-white/[0.04] transition-all duration-150 relative cursor-pointer shrink-0"
              title="Wishlist"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" strokeWidth={1.75} />
              {wishlistIds.size > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] px-1 rounded-full bg-[#ff6b1a] text-[#0a0a0c] text-[9px] font-bold font-mono flex items-center justify-center pointer-events-none leading-none">
                  {wishlistIds.size}
                </span>
              )}
            </button>

            {/* 5. Shopping Bag */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              data-magnetic
              className="p-2 text-[#f4f4f5] hover:text-[#ff6b1a] rounded-full hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/[0.2] transition-all duration-150 relative cursor-pointer shrink-0"
              title={`Shopping Bag (${totalCartItems} items)`}
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" strokeWidth={1.75} />
              {totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-[#ff6b1a] text-[#0a0a0c] text-[9px] font-bold font-mono flex items-center justify-center pointer-events-none leading-none shadow-sm">
                  {totalCartItems}
                </span>
              )}
            </button>

            {/* 6. Delivery / Orders */}
            <button
              onClick={() => {
                if (onOpenProfile) onOpenProfile('orders');
                else if (onOpenTracking) onOpenTracking();
              }}
              data-magnetic
              className="p-2 text-[#8e8e93] hover:text-[#ff6b1a] rounded-full hover:bg-white/[0.04] transition-all duration-150 cursor-pointer relative shrink-0"
              title="My Orders & Shipment Tracking"
              aria-label="Orders and Tracking"
            >
              <Truck className="w-5 h-5" strokeWidth={1.75} />
              {completedOrders.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] px-1 rounded-full bg-[#2997ff] text-[#0a0a0c] text-[9px] font-bold font-mono flex items-center justify-center pointer-events-none leading-none">
                  {completedOrders.length}
                </span>
              )}
            </button>

            {/* 7. Undo/History */}
            <button
              onClick={onOpenReturn}
              data-magnetic
              className="p-2 text-[#8e8e93] hover:text-[#ff6b1a] rounded-full hover:bg-white/[0.04] transition-all duration-150 cursor-pointer shrink-0"
              title="30-Day Complimentary Luxury Returns"
              aria-label="Returns and Exchanges"
            >
              <RotateCcw className="w-5 h-5" strokeWidth={1.75} />
            </button>

            {/* 8. Support/Headset */}
            <button
              onClick={onOpenSupport}
              data-magnetic
              className="p-2 text-[#8e8e93] hover:text-[#ff6b1a] rounded-full hover:bg-white/[0.04] transition-all duration-150 cursor-pointer shrink-0"
              title="24/7 Client Care & Concierge Hotline"
              aria-label="Client Support"
            >
              <Headphones className="w-5 h-5" strokeWidth={1.75} />
            </button>

            {/* 9. Gaze / Eye control */}
            <div className="shrink-0 pl-1">
              <VisualIntentControl />
            </div>

          </div>

          {/* ================= TABLET & MOBILE VIEWPORT HEADER CONTROLS (< 1024px) ================= */}
          <div className="flex lg:hidden items-center gap-1.5 sm:gap-2.5 shrink-0">
            
            {/* Sign In Button */}
            <div className="shrink-0">
              <GoogleAuthButton compact={true} onOpenProfile={onOpenProfile} />
            </div>

            {/* Shopping Bag */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              data-magnetic
              className="p-2 text-[#f4f4f5] hover:text-[#ff6b1a] rounded-full hover:bg-white/[0.06] border border-white/[0.08] relative transition-colors shrink-0"
              title={`Shopping Bag (${totalCartItems} items)`}
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" strokeWidth={1.75} />
              {totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-[#ff6b1a] text-[#0a0a0c] text-[9px] font-bold font-mono flex items-center justify-center pointer-events-none leading-none shadow-sm">
                  {totalCartItems}
                </span>
              )}
            </button>

            {/* Visual Intent Status */}
            <div className="shrink-0 hidden sm:block">
              <VisualIntentControl />
            </div>

            {/* Hamburger Menu Toggle Button */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              data-magnetic
              className="p-2 text-[#f5f5f7] hover:text-[#ff6b1a] rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.12] transition-colors cursor-pointer shrink-0 ml-0.5"
              title="Open Platform Architecture & Components Menu"
              aria-label="Open Platform Navigation Menu"
            >
              <Menu className="w-5 h-5" strokeWidth={1.75} />
            </button>
          </div>

        </div>
      </header>

      {/* ================= FULL-SCREEN PORTAL DRAWER (Mounted directly to document.body) ================= */}
      {/* Portaling to document.body ensures it NEVER gets trapped or squashed by header backdrop-blur! */}
      {mounted && typeof document !== 'undefined' && createPortal(
        <div 
          className={`fixed inset-0 z-[9999] transition-all duration-300 ${
            isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          aria-hidden={!isDrawerOpen}
        >
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Slide-over panel (100% full viewport height, independent stacking context) */}
          <aside 
            className={`fixed top-0 right-0 bottom-0 w-full sm:w-[440px] max-w-[92vw] h-screen h-[100dvh] bg-[#0c0d10] border-l border-white/[0.1] shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-out ${
              isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
            aria-label="Mobile Navigation Drawer"
          >
            {/* Top Header of Drawer */}
            <div className="p-5 sm:p-6 border-b border-white/[0.08] flex items-center justify-between bg-[#101115] shrink-0">
              <div className="flex items-center select-none">
                <span className="font-editorial text-2xl tracking-tight text-[#f5f5f7]">
                  SASHER
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b1a] ml-2 shrink-0 mb-0.5" />
              </div>

              <button
                onClick={() => setIsDrawerOpen(false)}
                data-magnetic
                className="p-2 rounded-full text-[#8e8e93] hover:text-[#f4f4f5] hover:bg-white/[0.06] border border-white/[0.08] transition-colors cursor-pointer"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" strokeWidth={1.75} />
              </button>
            </div>

            {/* Drawer Body: Scrollable Content with guaranteed min-h-0 flex-1 */}
            <div className="p-5 sm:p-6 overflow-y-auto min-h-0 flex-1 space-y-6">
              
              {/* Main Platform Architecture & Views (All 8 Components Fully Visible) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono uppercase tracking-[0.1em] text-[#71717a] block">
                    Platform Architecture & Views
                  </span>
                  <span className="text-[10px] font-mono text-[#ff6b1a] bg-[#ff6b1a]/10 border border-[#ff6b1a]/30 px-2 py-0.5 rounded-full font-bold">
                    8 Components
                  </span>
                </div>

                {allNavItems.map((item) => {
                  const isActive = currentTab === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full text-left p-3 rounded-2xl transition-all duration-150 group cursor-pointer flex items-center justify-between gap-3 border ${
                        isActive 
                          ? 'bg-white/[0.08] border-[#ff6b1a]/50 text-[#ff6b1a] shadow-md' 
                          : 'bg-white/[0.02] border-white/[0.06] text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-white/[0.05] hover:border-white/[0.12]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                          isActive 
                            ? 'bg-[#ff6b1a]/20 border-[#ff6b1a]/40 text-[#ff6b1a]' 
                            : 'bg-white/[0.04] border-white/[0.08] text-[#71717a] group-hover:text-[#f4f4f5]'
                        }`}>
                          <Icon className="w-4 h-4" strokeWidth={1.75} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs uppercase tracking-[0.06em] font-semibold truncate flex items-center gap-2">
                            <span>{item.label}</span>
                            {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b1a]" />}
                          </div>
                          <p className="text-[10px] text-[#71717a] truncate group-hover:text-[#a1a1aa] transition-colors mt-0.5 font-mono">
                            {item.desc}
                          </p>
                        </div>
                      </div>

                      <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${
                        isActive ? 'text-[#ff6b1a] translate-x-0.5' : 'text-[#52525b] group-hover:text-[#a1a1aa]'
                      }`} />
                    </button>
                  );
                })}
              </div>

              {/* Client Care & Order Services */}
              <div className="pt-4 border-t border-white/[0.08] space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-[0.1em] text-[#71717a] block mb-2">
                  Client Care & Order Services
                </span>
                
                {/* Orders & Tracking */}
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    if (onOpenProfile) onOpenProfile('orders');
                    else if (onOpenTracking) onOpenTracking();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] text-xs font-mono text-[#a1a1aa] hover:text-[#f5f5f7] transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Truck className="w-4 h-4 text-[#2997ff]" strokeWidth={1.75} />
                    <span>Orders & Live Tracking</span>
                  </div>
                  {completedOrders.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-[#2997ff]/20 text-[#2997ff] text-[10px] font-bold">
                      {completedOrders.length}
                    </span>
                  )}
                </button>

                {/* Returns & Exchanges */}
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    if (onOpenReturn) onOpenReturn();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] text-xs font-mono text-[#a1a1aa] hover:text-[#f5f5f7] transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <RotateCcw className="w-4 h-4 text-[#10b981]" strokeWidth={1.75} />
                    <span>30-Day Luxury Returns</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#52525b] group-hover:text-[#a1a1aa]" />
                </button>

                {/* Concierge & Support */}
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    if (onOpenSupport) onOpenSupport();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] text-xs font-mono text-[#a1a1aa] hover:text-[#f5f5f7] transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Headphones className="w-4 h-4 text-[#ff6b1a]" strokeWidth={1.75} />
                    <span>24/7 Client Care Helpline</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#52525b] group-hover:text-[#a1a1aa]" />
                </button>

                {/* Wishlist */}
                <button
                  onClick={() => handleNavClick('discover')}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] text-xs font-mono text-[#a1a1aa] hover:text-[#f5f5f7] transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Heart className="w-4 h-4 text-[#e2a876]" strokeWidth={1.75} />
                    <span>Saved Wishlist</span>
                  </div>
                  {wishlistIds.size > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-[#ff6b1a]/20 text-[#ff6b1a] text-[10px] font-bold">
                      {wishlistIds.size}
                    </span>
                  )}
                </button>
              </div>

              {/* Visual Intent Status on Mobile */}
              <div className="sm:hidden pt-4 border-t border-white/[0.08]">
                <span className="text-[10px] font-mono uppercase tracking-[0.1em] text-[#71717a] block mb-2">
                  Optical Gaze Control
                </span>
                <div className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.06] flex items-center justify-between">
                  <span className="text-xs font-mono text-[#a1a1aa]">Visual Intent Gaze AI</span>
                  <VisualIntentControl />
                </div>
              </div>

              {/* Quick Settings & Theme */}
              <div className="pt-4 border-t border-white/[0.08] space-y-3">
                <span className="text-[10px] font-mono uppercase tracking-[0.1em] text-[#71717a] block">
                  Atelier Interface Theme
                </span>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-mono">
                  <button
                    onClick={() => {
                      setTheme('dark');
                      applyTheme('dark');
                    }}
                    className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-white/[0.08] border-[#ff6b1a] text-[#ff6b1a]'
                        : 'bg-white/[0.02] border-white/[0.06] text-[#71717a] hover:text-[#f5f5f7]'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span>Dark</span>
                  </button>
                  <button
                    onClick={() => {
                      setTheme('light');
                      applyTheme('light');
                    }}
                    className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      theme === 'light'
                        ? 'bg-white/[0.08] border-[#2997ff] text-[#2997ff]'
                        : 'bg-white/[0.02] border-white/[0.06] text-[#71717a] hover:text-[#f5f5f7]'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    <span>Light</span>
                  </button>
                  <button
                    onClick={() => {
                      setTheme('system');
                      applyTheme('system');
                    }}
                    className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      theme === 'system'
                        ? 'bg-white/[0.08] border-white/[0.4] text-[#f5f5f7]'
                        : 'bg-white/[0.02] border-white/[0.06] text-[#71717a] hover:text-[#f5f5f7]'
                    }`}
                  >
                    <Laptop className="w-3.5 h-3.5" />
                    <span>System</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Drawer Bottom Watermark */}
            <div className="p-5 sm:p-6 border-t border-white/[0.08] bg-[#090a0c] space-y-1 text-center shrink-0">
              <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-[#10b981]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>256-Bit Encrypted Atelier Gateway</span>
              </div>
              <p className="text-[10px] font-mono text-[#52525b]">
                SASHER Adaptive Fashion Atelier & Research Labs
              </p>
            </div>

          </aside>
        </div>,
        document.body
      )}
    </>
  );
};
