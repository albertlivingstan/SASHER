import React from 'react';

export const LoadingSkeleton: React.FC<{ count?: number }> = ({ count = 10 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {[...Array(count)].map((_, i) => (
        <div 
          key={`skeleton-${i}`} 
          className="bg-[#121316] border border-white/[0.06] rounded-2xl p-4 space-y-4 animate-pulse h-96 flex flex-col justify-between"
        >
          <div className="w-full h-56 bg-white/[0.05] rounded-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent animate-[shimmer_1.5s_infinite]" />
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-white/[0.06] rounded w-1/3" />
            <div className="h-4 bg-white/[0.08] rounded w-4/5" />
            <div className="h-3 bg-white/[0.06] rounded w-1/2" />
          </div>
          <div className="pt-2 flex items-center justify-between">
            <div className="h-5 bg-white/[0.08] rounded w-1/4" />
            <div className="h-9 bg-white/[0.08] rounded-xl w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
};
