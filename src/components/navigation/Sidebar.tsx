import React from 'react';
import { LogoEmblem } from '../ui/LogoEmblem';
import { 
  Home, 
  User, 
  Grid, 
  Heart, 
  BarChart3, 
  ShoppingBag, 
  Clock, 
  Sparkles,
  Search
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenProfile: (tab?: 'orders' | 'profile' | 'calibration' | 'security') => void;
  onOpenWishlist?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentTab, 
  setCurrentTab, 
  onOpenProfile,
  onOpenWishlist 
}) => {
  const navItems = [
    { id: 'discover', label: 'Home', icon: Home },
    { id: 'user_profile', label: 'User', icon: User, action: () => onOpenProfile('profile') },
    { id: 'browse', label: 'Browse', icon: Grid },
    { id: 'favorites', label: 'Favorites', icon: Heart, action: onOpenWishlist },
    { id: 'insights', label: 'Analytics', icon: BarChart3 },
    { id: 'shopping', label: 'Shopping', icon: ShoppingBag },
    { id: 'history', label: 'History', icon: Clock, action: () => onOpenProfile('orders') },
    { id: 'gaze_studio', label: 'Concepts', icon: Sparkles },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-60 fixed top-0 bottom-0 left-0 bg-[#0A0A0C] border-r border-white/[0.08] z-30 select-none">
      {/* Brand Header */}
      <div className="h-[74px] px-6 flex items-center border-b border-white/[0.06]">
        <button
          onClick={() => setCurrentTab('discover')}
          className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
        >
          <LogoEmblem size={32} />
          <div>
            <span className="font-editorial text-lg tracking-tight text-[#f4f4f5] group-hover:text-[#d4a373] transition-colors block leading-none">
              SASHER
            </span>
            <span className="text-[9px] font-mono tracking-widest uppercase text-[#a1a1aa] block mt-1">
              Adaptive Fashion
            </span>
          </div>
        </button>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 py-4 px-3 space-y-4 overflow-y-auto">
        <div>
          <div className="px-3 pb-2 text-[10px] font-mono tracking-wider uppercase text-[#71717a]">
            Navigation
          </div>
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.action) {
                      item.action();
                    } else {
                      setCurrentTab(item.id);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                    isActive 
                      ? 'bg-[#d4a373]/15 text-[#d4a373] font-semibold border border-[#d4a373]/30 shadow-sm'
                      : 'text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#d4a373]' : 'text-[#8e8e93]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Fashion Categories Section */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-mono tracking-wider uppercase text-[#71717a]">
            Fashion Categories
          </div>
          <div className="grid grid-cols-2 gap-1 text-[11px] text-[#a1a1aa] font-medium px-1">
            {['Women', 'Men', 'New Arrivals', 'Dresses', 'Tops', 'Shirts', 'Trousers', 'Jeans', 'Jackets', 'Blazers', 'Shoes', 'Bags', 'Accessories', 'Occasions', 'Sale'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCurrentTab('shopping')}
                className="text-left px-2.5 py-1.5 rounded-lg hover:bg-white/[0.04] hover:text-[#f4f4f5] transition-colors truncate cursor-pointer"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Search Saved Items */}
      <div className="p-4 border-t border-white/[0.06] bg-[#0c0d0e]">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#151518] border border-white/[0.06] text-xs text-[#a1a1aa]">
          <Search className="w-3.5 h-3.5 text-[#71717a]" />
          <input 
            type="text" 
            placeholder="Search saved items..." 
            className="bg-transparent border-none outline-none text-[#f4f4f5] placeholder-[#71717a] w-full text-xs"
          />
        </div>
      </div>
    </aside>
  );
};
