import React, { useState, useEffect } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [fadeOut, setFadeOut] = useState(false);

  const handleDismiss = () => {
    setFadeOut(true);
    setTimeout(() => {
      onComplete();
    }, 400);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss();
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      onClick={handleDismiss}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070709] text-[#f4f4f5] transition-opacity duration-500 select-none cursor-pointer ${fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      title="Click anywhere to enter"
    >
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,163,115,0.15)_0%,transparent_70%)] pointer-events-none" />

      {/* Logo Graphic */}
      <div className="relative mb-6 transform animate-pulse">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#1a1a1f] to-[#111115] border border-[#d4a373]/50 shadow-2xl flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[#d4a373]/10" />
          
          <svg className="w-14 h-14 text-[#d4a373]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M72 34L50 22L28 34V58L50 70L72 58V34Z" 
              fill="currentColor" 
              fillOpacity="0.25"
              stroke="currentColor" 
              strokeWidth="6" 
              strokeLinejoin="round"
            />
            <path 
              d="M36 42L50 34L64 42V58L50 66L36 58V42Z" 
              stroke="#070709" 
              strokeWidth="6" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Brand Name & Tagline */}
      <div className="text-center space-y-2 z-10">
        <h1 className="font-editorial text-4xl sm:text-5xl tracking-widest text-[#f4f4f5]">
          SASHER
        </h1>
        <p className="text-xs font-mono uppercase tracking-[0.3em] text-[#d4a373]">
          Adaptive Fashion Recommendation System
        </p>
      </div>

      <div className="mt-8 text-[11px] font-mono text-[#71717a] animate-pulse">
        Click anywhere to enter ➔
      </div>
    </div>
  );
};
