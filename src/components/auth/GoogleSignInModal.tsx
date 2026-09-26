import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, ShieldCheck, Sparkles, AlertCircle, Loader2 } from 'lucide-react';

export const GoogleLogoIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);

export const GoogleSignInModal: React.FC = () => {
  const { isSignInModalOpen, closeSignInModal, signInWithGoogle, isLoading, authError } = useAuth();

  if (!isSignInModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-[#141416] border border-[#27272a] rounded-2xl shadow-2xl p-6 sm:p-7 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Brand Gradient Hairline Top Border */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#ff6b1a] via-[#ff3d7f] to-[#2997ff]" />

        {/* Close Button */}
        <button
          onClick={closeSignInModal}
          className="absolute top-4 right-4 text-[#71717a] hover:text-[#f5f5f7] p-1.5 rounded-lg hover:bg-[#1c1c1f] transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-[#ffffff] shadow-sm flex items-center justify-center">
            <GoogleLogoIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-editorial text-2xl text-[#f5f5f7] tracking-tight">
              Sign in with Google
            </h3>
            <p className="text-xs text-[#a1a1a6]">
              Firebase Auth & Cloud Firestore Persistence
            </p>
          </div>
        </div>

        {/* Value Proposition */}
        <div className="p-3.5 bg-[#1c1c1f] rounded-xl border border-[#27272a] text-xs text-[#a1a1a6] space-y-2 mb-5">
          <div className="flex items-center gap-2 text-[#f5f5f7] font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#ff6b1a]" />
            <span>Cross-Device Attention Profile</span>
          </div>
          <p className="leading-relaxed text-[11px]">
            Signing in with your Google account persists your calibrated gaze weights, wishlist, and session recommendations in secure Cloud Firestore with zero third-party disclosure.
          </p>
        </div>

        {/* Error notification if any */}
        {authError && (
          <div className="mb-4 p-3 rounded-xl bg-[#ff453a]/10 border border-[#ff453a]/30 flex items-start gap-2.5 text-[#ff453a] text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="leading-tight">
              <span className="font-medium block mb-0.5">Authentication Note</span>
              <span>{authError}</span>
            </div>
          </div>
        )}

        {/* Google Sign-in Action Button */}
        <div className="space-y-3 mb-5">
          <button
            onClick={() => signInWithGoogle()}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl border border-[#3f3f46] hover:border-[#ff6b1a] bg-[#ffffff] hover:bg-[#f5f5f7] text-[#1c1c1f] transition-all flex items-center justify-center gap-3 group cursor-pointer shadow-lg hover:shadow-xl font-medium text-sm disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-[#1c1c1f]" />
                <span>Connecting to Google...</span>
              </>
            ) : (
              <>
                <GoogleLogoIcon className="w-5 h-5" />
                <span>Continue with Google</span>
              </>
            )}
          </button>
          <p className="text-center text-[10px] text-[#71717a] font-mono">
            Direct popup authentication via Firebase Auth
          </p>
        </div>

        {/* Footer Security Badges */}
        <div className="pt-4 border-t border-[#27272a] flex items-center justify-between text-[11px] text-[#71717a]">
          <div className="flex items-center gap-1.5 text-[#30d158]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>OAuth 2.0 & Firestore TLS 1.3</span>
          </div>
          <span className="text-[10px]">Zero-Trust Encrypted</span>
        </div>
      </div>
    </div>
  );
};
