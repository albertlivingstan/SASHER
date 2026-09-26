import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSasher } from '../../context/SasherContext';
import { GoogleLogoIcon } from './GoogleSignInModal';
import { LogOut, CheckCircle2, ChevronDown, Database, ShoppingBag, User, ArrowRight } from 'lucide-react';

interface GoogleAuthButtonProps {
  compact?: boolean;
  onOpenProfile?: (tab?: 'orders' | 'profile') => void;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({ 
  compact = false,
  onOpenProfile
}) => {
  const { user, isAuthenticated, openSignInModal, signOut, isLoading } = useAuth();
  const { completedOrders } = useSasher();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated) {
    return (
      <button
        onClick={openSignInModal}
        disabled={isLoading}
        data-magnetic
        className="group relative h-[34px] px-3 flex items-center gap-2 rounded-full bg-[#121316] hover:bg-[#1a1b1e] border border-white/[0.12] hover:border-white/[0.24] text-xs font-medium text-[#f5f5f7] transition-all duration-150 cursor-pointer shadow-sm disabled:opacity-50 whitespace-nowrap shrink-0"
        aria-label="Sign in with Google"
      >
        <GoogleLogoIcon className="w-3.5 h-3.5 shrink-0" />
        <span className="whitespace-nowrap text-xs font-medium tracking-wide">Sign In</span>
      </button>
    );
  }

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        data-magnetic
        className="h-[34px] flex items-center gap-2 px-2.5 rounded-full bg-[#121316] hover:bg-[#1a1b1e] border border-white/[0.12] hover:border-white/[0.24] text-xs text-[#f5f5f7] transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0"
        aria-label="Account options"
      >
        <div className="relative shrink-0 flex items-center justify-center">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user?.name || 'User'}
              className="w-5 h-5 rounded-full object-cover border border-[#2997ff]"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#ff6b1a] to-[#2997ff] flex items-center justify-center text-white text-[9px] font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
          )}
          <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#30d158] border border-[#121316]" />
        </div>
        <span className="hidden sm:inline font-medium text-[11px] truncate max-w-[80px] whitespace-nowrap tracking-wide">
          {user?.name?.split(' ')[0] || 'User'}
        </span>
        <ChevronDown className="w-3 h-3 text-[#71717a] hidden sm:inline shrink-0" />
      </button>

      {/* Account Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-[#141416] border border-[#27272a] rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="pb-3 border-b border-[#27272a]/70 flex items-center gap-3">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user?.name}
                className="w-10 h-10 rounded-full object-cover border border-[#2997ff]"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#ff6b1a] to-[#2997ff] flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
            <div className="overflow-hidden">
              <span className="text-sm font-semibold text-[#f5f5f7] block truncate">
                {user?.name}
              </span>
              <span className="text-xs text-[#a1a1a6] block truncate font-mono text-[10px]">
                {user?.email}
              </span>
              <div className="flex items-center gap-1 text-[9px] text-[#30d158] font-mono mt-0.5">
                <CheckCircle2 className="w-2.5 h-2.5" />
                <span>Google Verified</span>
              </div>
            </div>
          </div>

          {/* Quick Account Profile Actions */}
          {onOpenProfile && (
            <div className="py-2 border-b border-[#27272a]/70 space-y-1">
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  onOpenProfile('orders');
                }}
                className="w-full flex items-center justify-between p-2 rounded-xl bg-[#1c1c1f] hover:bg-[#27272a] text-xs font-mono text-[#f5f5f7] hover:text-[#ff6b1a] transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-3.5 h-3.5 text-[#ff6b1a]" />
                  <span>Order History</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded-full bg-[#ff6b1a]/20 text-[#ff6b1a] text-[10px] font-bold">
                    {completedOrders.length}
                  </span>
                  <ArrowRight className="w-3 h-3 text-[#71717a] group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>

              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  onOpenProfile('profile');
                }}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#1c1c1f] text-xs font-mono text-[#a1a1aa] hover:text-[#f5f5f7] transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-[#2997ff]" />
                  <span>Account Profile</span>
                </div>
                <ArrowRight className="w-3 h-3 text-[#71717a] group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          )}

          <div className="py-2.5 text-xs text-[#a1a1a6] space-y-1.5 border-b border-[#27272a]/70 font-mono text-[11px]">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5">
                <Database className="w-3 h-3 text-[#ff6b1a]" />
                <span>Firestore Sync:</span>
              </span>
              <span className="text-[#30d158] font-semibold">Connected</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Calibration:</span>
              <span className="text-[#f5f5f7]">{user?.calibrationScore ?? 94}%</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={async () => {
                await signOut();
                setIsDropdownOpen(false);
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-[#ff453a] hover:bg-[#ff453a]/10 transition-colors cursor-pointer"
            >
              <span>Sign Out</span>
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

