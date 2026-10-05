import React, { useState } from 'react';
import { useSasher } from '../../context/SasherContext';
import { useAuth } from '../../context/AuthContext';
import { LogoEmblem } from '../ui/LogoEmblem';
import { 
  Search, 
  ShoppingBag, 
  Eye, 
  EyeOff,
  Heart, 
  User as UserIcon, 
  Menu, 
  X, 
  Sparkles,
  SlidersHorizontal,
  Compass
} from 'lucide-react';

interface TopNavigationProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenCart: () => void;
  onOpenProfile: (tab?: 'orders' | 'profile' | 'calibration' | 'security') => void;
  onOpenWishlist?: () => void;
  onOpenOrders?: () => void;
  onOpenSearch?: () => void;
  onOpenSupport?: () => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  currentTab,
  onSelectTab,
  onOpenCart,
  onOpenProfile,
  onOpenWishlist,
  onOpenOrders,
  onOpenSearch,
  onOpenSupport
}) => {
  const { 
    cart, 
    wishlistIds, 
    isEyeTrackingActive, 
    toggleEyeTracking,
    setIsVisualIntentModalOpen,
    genderFilter,
    setGenderFilter,
    searchQuery,
    setSearchQuery,
    setActiveCategory
  } = useSasher();
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const navLinks = [
    { 
      label: '✨ For You', 
      action: () => { 
        onSelectTab('for_you'); 
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
      } 
    },
    { 
      label: 'Home', 
      action: () => { 
        setGenderFilter('All'); 
        setActiveCategory('All');
        onSelectTab('discover'); 
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
      } 
    },
    { 
      label: 'Browse', 
      action: () => { 
        setGenderFilter('All'); 
        setActiveCategory('All');
        setSearchQuery('');
        onSelectTab('browse'); 
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
      } 
    },
    { 
      label: 'Wardrobe', 
      action: () => { 
        onSelectTab('wardrobe'); 
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
      } 
    },
    { 
      label: 'Swipe Train', 
      action: () => { 
        onSelectTab('swipe_train'); 
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
      } 
    },
    { label: 'Collections', action: () => { onSelectTab('shopping'); } },
    { label: 'Research', action: () => { onSelectTab('research'); } }
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0a0a0c]/95 backdrop-blur-xl border-b border-white/[0.08] transition-colors">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between gap-4">
        
        {/* Left: Brand Logo Wordmark */}
        <div className="flex items-center gap-6">
          <button 
            onClick={() => { setGenderFilter('All'); onSelectTab('discover'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="flex items-center gap-2.5 group cursor-pointer text-left"
          >
            <LogoEmblem size={28} />
            <div className="flex flex-col">
              <span className="font-editorial text-xl sm:text-2xl tracking-[0.2em] text-[#f4f4f5] group-hover:text-[#d4a373] transition-colors font-medium">
                SASHER
              </span>
              <span className="text-[8px] font-mono tracking-widest text-[#71717a] uppercase -mt-1 hidden sm:block">
                Adaptive Fashion Platform
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 pl-4 border-l border-white/[0.06]">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={link.action}
                className={`px-3 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all cursor-pointer ${
                  (link.label === 'Women' && genderFilter === 'Women' && currentTab === 'browse') ||
                  (link.label === 'Men' && genderFilter === 'Men' && currentTab === 'browse') ||
                  (link.label === 'Browse' && currentTab === 'browse' && genderFilter === 'All') ||
                  (link.label === 'Collections' && currentTab === 'shopping') ||
                  (link.label === 'Research' && currentTab === 'research') ||
                  (link.label === 'Home' && currentTab === 'discover')
                    ? 'text-[#f4f4f5] bg-white/[0.08]'
                    : 'text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-white/[0.04]'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Center: Search Bar (Adaptive expand/collapse) */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-[#71717a] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, styles, colors (e.g. black leather jacket)..."
              className="w-full h-10 pl-10 pr-4 bg-[#141417] hover:bg-[#18181c] focus:bg-[#161619] border border-white/[0.08] focus:border-[#d4a373]/60 rounded-full text-xs text-[#f4f4f5] placeholder-[#71717a] outline-none transition-all shadow-inner"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-[#71717a] hover:text-[#f4f4f5] text-xs"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Mobile search toggle */}
          <button
            onClick={() => setIsSearchExpanded(!isSearchExpanded)}
            className="md:hidden p-2 rounded-full text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-white/[0.04] transition-colors"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Visual Intent Dynamic Status & Quick Toggle Control Button */}
          <div 
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all ${
              isEyeTrackingActive
                ? 'bg-[#10b981]/10 border-[#10b981]/30 text-[#f4f4f5]'
                : 'bg-white/[0.03] border-white/[0.08] text-[#71717a]'
            }`}
          >
            <button
              onClick={() => setIsVisualIntentModalOpen(true)}
              className="flex items-center gap-1.5 cursor-pointer hover:opacity-90 transition-opacity"
              title="Open Visual Intent Studio Configurator"
              aria-label="Open Visual Intent Studio"
            >
              {isEyeTrackingActive ? (
                <Eye className="w-3.5 h-3.5 text-[#10b981] animate-pulse shrink-0" />
              ) : (
                <EyeOff className="w-3.5 h-3.5 text-[#71717a] shrink-0" />
              )}
              <span className={`text-xs font-medium hidden sm:inline ${isEyeTrackingActive ? 'text-[#f4f4f5]' : 'text-[#a1a1aa]'}`}>
                Visual Intent
              </span>
            </button>

            {/* Direct 1-Click Toggle Switch */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleEyeTracking();
              }}
              type="button"
              role="switch"
              aria-checked={isEyeTrackingActive}
              className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border transition-colors duration-200 ease-in-out focus:outline-none ${
                isEyeTrackingActive ? 'bg-[#10b981] border-[#10b981]' : 'bg-[#27272a] border-[#3f3f46]'
              }`}
              title={isEyeTrackingActive ? "Visual Intent is ON. Click to turn OFF." : "Visual Intent is OFF. Click to turn ON."}
              aria-label="Toggle Visual Intent On/Off"
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-2.5 w-2.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out mt-[1px] ${
                  isEyeTrackingActive ? 'translate-x-3.5' : 'translate-x-0.5'
                }`}
              />
            </button>

            <span 
              onClick={() => setIsVisualIntentModalOpen(true)}
              className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider cursor-pointer ${
                isEyeTrackingActive 
                  ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40' 
                  : 'bg-white/[0.06] text-[#71717a] border border-white/[0.08]'
              }`}
              title="Click to view full Visual Intent analytics"
            >
              {isEyeTrackingActive ? 'ON' : 'OFF'}
            </span>
          </div>

          {/* Wishlist Button */}
          <button
            onClick={onOpenWishlist}
            className="relative p-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors cursor-pointer"
            aria-label="Wishlist"
            title="Wishlist"
          >
            <Heart className="w-4 h-4 text-[#d4a373]" />
            {wishlistIds.size > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#d4a373] text-[#0D0D0D] text-[9px] font-bold flex items-center justify-center">
                {wishlistIds.size}
              </span>
            )}
          </button>

          {/* Shopping Bag / Cart */}
          <button
            onClick={onOpenCart}
            className="relative p-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors cursor-pointer"
            aria-label="Shopping Cart"
            title="Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#d4a373] text-[#0D0D0D] text-[9px] font-bold flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>

          {/* Profile Button */}
          <button
            onClick={() => onOpenProfile('profile')}
            className="w-9 h-9 rounded-full bg-[#16171b] border border-white/[0.1] hover:border-[#d4a373] flex items-center justify-center text-[#f4f4f5] text-xs font-semibold overflow-hidden transition-colors cursor-pointer"
            aria-label="User Account"
            title="Profile"
          >
            {isAuthenticated && user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-4 h-4 text-[#d4a373]" />
            )}
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-full text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-white/[0.04] transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>
      </div>

      {/* Mobile Search Expandable Bar */}
      {isSearchExpanded && (
        <div className="md:hidden px-4 pb-3 pt-1 border-t border-white/[0.06] bg-[#0a0a0c]">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-[#71717a]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, styles, colors..."
              className="w-full h-10 pl-10 pr-4 bg-[#141417] border border-white/[0.08] rounded-full text-xs text-[#f4f4f5] placeholder-[#71717a] outline-none"
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Mobile Slide-Out Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/[0.08] bg-[#0a0a0c] px-4 py-6 space-y-4 animate-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => {
                  link.action();
                  setMobileMenuOpen(false);
                }}
                className="p-3 text-left rounded-xl bg-white/[0.03] hover:bg-white/[0.06] text-xs font-medium text-[#f4f4f5] border border-white/[0.04]"
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#a1a1aa]">
            <button
              onClick={() => {
                setIsVisualIntentModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-[#d4a373]"
            >
              <Eye className="w-4 h-4" />
              <span>Visual Intent Controls</span>
            </button>
            <button
              onClick={() => {
                onOpenProfile('orders');
                setMobileMenuOpen(false);
              }}
              className="text-[#a1a1aa] hover:text-[#f4f4f5]"
            >
              My Orders
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
