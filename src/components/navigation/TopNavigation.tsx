import React, { useState } from 'react';
import { useSasher } from '../../context/SasherContext';
import { useAuth } from '../../context/AuthContext';
import { LogoEmblem } from '../ui/LogoEmblem';
import { Search, ShoppingBag, Bell, Eye, Sparkles, User as UserIcon, MapPin, Heart, Package } from 'lucide-react';

interface TopNavigationProps {
  onOpenCart: () => void;
  onOpenProfile: (tab?: 'orders' | 'profile' | 'calibration' | 'security') => void;
  onOpenSupport?: () => void;
  onSearchChange?: (query: string) => void;
  searchQuery?: string;
  onOpenWishlist?: () => void;
  onOpenOrders?: () => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  onOpenCart,
  onOpenProfile,
  onOpenSupport,
  onSearchChange,
  searchQuery = '',
  onOpenWishlist,
  onOpenOrders
}) => {
  const { cart, isEyeTrackingActive, recentAdaptiveNotification, wishlistIds } = useSasher();
  const { user, isAuthenticated } = useAuth();
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(e.target.value);
    if (onSearchChange) {
      onSearchChange(e.target.value);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0D0D0D]/95 backdrop-blur-md border-b border-white/[0.08] transition-colors">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-[74px] flex items-center justify-between gap-4">
        
        {/* Left: Brand spacer / Logo on mobile & Deliver to location */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 lg:hidden">
            <LogoEmblem size={28} />
            <span className="font-editorial text-lg text-[#f4f4f5]">SASHER</span>
          </div>
          
          {/* Deliver to Coimbatore 6410XX */}
          <div className="hidden xl:flex items-center gap-1.5 text-xs text-[#a1a1aa] px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] cursor-pointer hover:border-[#d4a373]/40 transition-colors">
            <MapPin className="w-3.5 h-3.5 text-[#d4a373]" />
            <div className="text-[11px] leading-tight">
              <span className="text-[#71717a] block text-[9px] uppercase tracking-wider">Deliver to</span>
              <span className="text-[#f4f4f5] font-medium">Coimbatore 641001 ▼</span>
            </div>
          </div>
        </div>

        {/* Center: Large Rounded Search Bar with NL prompts */}
        <div className="flex-1 max-w-xl mx-auto">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-4 h-4 text-[#71717a]" />
            <input
              type="text"
              value={localSearch}
              onChange={handleSearchInput}
              placeholder='Search products, styles, brands (e.g., "black formal dress")...'
              className="w-full h-11 pl-11 pr-4 bg-[#151518] hover:bg-[#1a1a1f] focus:bg-[#18181c] border border-white/[0.08] focus:border-[#d4a373]/60 rounded-full text-xs text-[#f4f4f5] placeholder-[#71717a] outline-none transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Right Action Icons & Open Closet Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Wishlist Icon Button */}
          <button
            onClick={onOpenWishlist}
            className="relative p-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors cursor-pointer hidden sm:flex items-center gap-1.5 px-3"
            title="Wishlist"
          >
            <Heart className="w-4 h-4 text-[#d4a373]" />
            <span className="text-xs font-mono">{wishlistIds.size}</span>
          </button>

          {/* Orders Button */}
          <button
            onClick={onOpenOrders}
            className="p-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors cursor-pointer hidden md:flex items-center gap-1.5 px-3 text-xs font-mono"
            title="Orders"
          >
            <Package className="w-4 h-4 text-[#d4a373]" />
            <span>Orders</span>
          </button>

          {/* Notification Bell */}
          <button
            onClick={onOpenSupport}
            className="relative p-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {recentAdaptiveNotification && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#d4a373] animate-pulse" />
            )}
          </button>

          {/* Shopping Bag Button with Badge */}
          <button
            onClick={onOpenCart}
            className="relative p-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors cursor-pointer"
            aria-label="Shopping Bag"
          >
            <ShoppingBag className="w-4 h-4" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#d4a373] text-[#0D0D0D] text-[9px] font-bold flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>

          {/* User Profile Avatar */}
          <button
            onClick={() => onOpenProfile('profile')}
            className="w-9 h-9 rounded-full bg-[#1c1d22] border border-white/[0.1] hover:border-[#d4a373] flex items-center justify-center text-[#f4f4f5] text-xs font-semibold overflow-hidden transition-colors cursor-pointer"
            aria-label="User Profile"
          >
            {isAuthenticated && user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-4 h-4 text-[#d4a373]" />
            )}
          </button>

        </div>
      </div>
    </header>
  );
};
