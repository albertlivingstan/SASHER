import React from 'react';

interface LogoEmblemProps {
  className?: string;
  size?: number;
}

export const LogoEmblem: React.FC<LogoEmblemProps> = ({ className = "w-8 h-8", size = 32 }) => {
  return (
    <div 
      className={`rounded-xl bg-gradient-to-tr from-[#161619] via-[#1c1c22] to-[#121215] border border-[#d4a373]/50 shadow-xl flex items-center justify-center relative overflow-hidden group shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Radial Champagne Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#d4a373]/20 via-transparent to-[#d4a373]/5 opacity-80 group-hover:opacity-100 transition-opacity" />
      
      {/* High-Quality SVG Hexagonal S Monogram */}
      <svg 
        className="w-[65%] h-[65%] text-[#d4a373] drop-shadow-sm" 
        viewBox="0 0 120 120" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Hexagonal Frame */}
        <path 
          d="M60 12L102 36V84L60 108L18 84V36L60 12Z" 
          stroke="currentColor" 
          strokeWidth="6" 
          strokeOpacity="0.4"
          strokeLinejoin="round"
        />
        {/* Upper S Curve Segment */}
        <path 
          d="M86 38L60 23L34 38V54L60 69L86 54V38Z" 
          fill="currentColor" 
          fillOpacity="0.2"
          stroke="currentColor" 
          strokeWidth="8" 
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Lower S Curve Segment Interlocking */}
        <path 
          d="M34 82L60 97L86 82V66L60 51L34 66V82Z" 
          fill="currentColor" 
          fillOpacity="0.35"
          stroke="currentColor" 
          strokeWidth="8" 
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};
