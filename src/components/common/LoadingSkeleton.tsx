import React from 'react';

/**
 * Individual Product Card Skeleton
 * Accurately mirrors the exact DOM hierarchy, aspect ratio (3:4), paddings,
 * badges, typography lines, and action buttons of `ProductCard.tsx`
 * to eliminate Cumulative Layout Shift (CLS) during data fetching.
 */
export const ProductCardSkeleton: React.FC = () => {
  return (
    <div 
      className="group relative rounded-2xl bg-[#121316] border border-[#27272a]/70 flex flex-col justify-between overflow-hidden shadow-sm"
      aria-hidden="true"
    >
      {/* Product Image Stage (Identical aspect-[3/4] as ProductCard) */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#18191d]">
        {/* Shimmer sweep */}
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.04] to-transparent animate-shimmer" />

        {/* Top Badges / Wishlist Placeholder */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
          {/* Category Pill */}
          <div className="h-5 px-2.5 rounded-md bg-[#0c0d0e]/85 backdrop-blur-md border border-white/[0.08] flex items-center">
            <div className="h-2 w-12 bg-white/[0.15] rounded-sm" />
          </div>

          {/* Wishlist Circle */}
          <div className="w-7 h-7 rounded-full bg-[#0c0d0e]/70 backdrop-blur-md border border-white/[0.08] flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-white/[0.15]" />
          </div>
        </div>

        {/* Center watermark icon */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15">
          <div className="w-12 h-12 rounded-2xl border border-[#d4a373]/40 flex items-center justify-center">
            <div className="w-5 h-5 rounded-lg bg-[#d4a373]/30" />
          </div>
        </div>
      </div>

      {/* Product Card Details (Paddings and spacings identical to ProductCard) */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between bg-[#121316]">
        <div className="space-y-1.5">
          {/* Brand & Interest Match row */}
          <div className="flex items-center justify-between text-xs">
            {/* Brand placeholder */}
            <div className="h-2.5 w-16 bg-white/[0.08] rounded-sm" />
            
            {/* Visual Interest Match placeholder */}
            <div className="h-2.5 w-20 bg-[#d4a373]/25 rounded-sm" />
          </div>

          {/* Product Name placeholder (matches text-sm leading-snug line-clamp-1) */}
          <div className="pt-0.5 space-y-1">
            <div className="h-4 w-4/5 bg-white/[0.1] rounded-md" />
            <div className="h-3 w-1/2 bg-white/[0.04] rounded-md" />
          </div>

          {/* Customer Rating placeholder */}
          <div className="flex items-center gap-1.5 pt-0.5">
            <div className="w-3 h-3 rounded-full bg-[#d4a373]/30" />
            <div className="h-2.5 w-16 bg-white/[0.06] rounded-sm" />
          </div>
        </div>

        {/* Price and Action Buttons Section */}
        <div className="pt-2.5 border-t border-[#27272a]/70 space-y-2.5">
          {/* Price and Style row */}
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              {/* Main Price */}
              <div className="h-5 w-20 bg-white/[0.12] rounded-md" />
              {/* Original Price Strikethrough */}
              <div className="h-3.5 w-12 bg-white/[0.05] rounded-sm" />
            </div>
            {/* Style Tag */}
            <div className="h-2.5 w-14 bg-white/[0.06] rounded-sm" />
          </div>

          {/* Primary "Add to Cart" + "Similar" buttons */}
          <div className="flex items-center gap-1.5">
            {/* Add to cart button */}
            <div className="flex-1 h-8 rounded-xl bg-white/[0.07] border border-white/[0.05] flex items-center justify-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded-sm bg-white/[0.15]" />
              <div className="h-2.5 w-16 rounded-sm bg-white/[0.15]" />
            </div>

            {/* Similar button */}
            <div className="h-8 w-14 rounded-xl bg-[#18191d] border border-[#27272a] flex items-center justify-center">
              <div className="h-2.5 w-8 rounded-sm bg-white/[0.1]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface LoadingSkeletonProps {
  count?: number;
  className?: string;
}

/**
 * Grid of ProductCardSkeletons matching the responsive grid container
 */
export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  count = 8,
  className = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6"
}) => {
  return (
    <div className={className} role="status" aria-label="Loading products">
      {[...Array(count)].map((_, i) => (
        <div key={`product-skeleton-${i}`} className="relative group">
          {/* Top Live Badge Placeholder */}
          <div className="absolute top-3 right-12 z-25 pointer-events-none">
            <span className="inline-block text-[9px] font-mono bg-black/85 backdrop-blur-md text-[#d4a373]/50 px-2 py-0.5 rounded border border-[#d4a373]/20 shadow-md">
              ⚡ Loading
            </span>
          </div>
          <ProductCardSkeleton />
        </div>
      ))}
    </div>
  );
};
