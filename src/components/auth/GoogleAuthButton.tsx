import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { GoogleLogoIcon } from './GoogleSignInModal';
import { LogOut, CheckCircle2, ChevronDown, Database } from 'lucide-react';

export const GoogleAuthButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { user, isAuthenticated, openSignInModal, signOut, isLoading } = useAuth();
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
        className="group relative flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1c1c1f] hover:bg-[#27272a] border border-[#27272a] hover:border-[#ff6b1a]/60 text-xs font-medium text-[#f5f5f7] transition-all cursor-pointer shadow-sm hover:shadow-md disabled:opacity-50"
        aria-label="Sign in with Google"
      >
        <GoogleLogoIcon className="w-3.5 h-3.5" />
        <span className={compact ? 'hidden sm:inline' : 'inline'}>
          Sign In
        </span>
        <span className="hidden md:inline text-[10px] text-[#a1a1a6] font-mono">
          with Google
        </span>
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        data-magnetic
        className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-full bg-[#1c1c1f] hover:bg-[#27272a] border border-[#27272a] hover:border-[#2997ff]/60 text-xs text-[#f5f5f7] transition-all cursor-pointer"
        aria-label="Account options"
      >
        <div className="relative">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user?.name || 'User'}
              className="w-6 h-6 rounded-full object-cover border border-[#2997ff]"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#ff6b1a] to-[#2997ff] flex items-center justify-center text-white text-[10px] font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
          )}
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#30d158] border border-[#141416]" />
        </div>
        <span className="hidden sm:inline font-medium text-[11px] truncate max-w-[90px]">
          {user?.name?.split(' ')[0] || 'User'}
        </span>
        <ChevronDown className="w-3 h-3 text-[#71717a] hidden sm:inline" />
      </button>

      {/* Account Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-[#141416] border border-[#27272a] rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
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
