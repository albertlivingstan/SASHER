import React, { useState } from 'react';
import { RecommendedProduct } from '../../types';
import { useSasher } from '../../context/SasherContext';
import { feedbackService } from '../../services/feedbackService';
import { Heart, Eye, Sparkles, Plus, Check, Star, ArrowRight } from 'lucide-react';

interface ProductCardProps {
  product: RecommendedProduct;
  onSelect: (product: RecommendedProduct) => void;
  onExplain: (product: RecommendedProduct) => void;
  onShowSimilar?: (product: RecommendedProduct) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onSelect, 
  onExplain,
  onShowSimilar 
}) => {
  const { 
    wishlistIds, 
    toggleWishlist, 
    recordInteraction, 
    currentGazeTarget
  } = useSasher();

  const [isHovered, setIsHovered] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const isWishlisted = Boolean(product.wishlist || product.isWishlisted || wishlistIds.has(product.id));
  const isBeingGazed = currentGazeTarget?.productId === product.id;
  const isInterestConfirmed = isBeingGazed && currentGazeTarget?.status === 'interest_confirmed';

  // Dynamic rating from real user feedback (Section 2 & 3: Never fake ratings)
  const ratingSummary = feedbackService.getRatingSummary(product.id);

  const handleMouseEnter = () => {
    setIsHovered(true);
    recordInteraction('HOVER', product.id, product.category);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleCardClick = () => {
    recordInteraction('VIEW', product.id, product.category);
    onSelect(product);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleSimilarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShowSimilar) {
      onShowSimilar(product);
    } else {
      onSelect(product);
    }
  };

  return (
    <div
      data-gaze-product-id={product.id}
      data-gaze-category={product.category}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
      className={`group relative rounded-2xl bg-[#121316] border transition-all duration-300 hover:scale-[1.015] cursor-pointer flex flex-col justify-between overflow-hidden ${
        isInterestConfirmed
          ? 'border-[#10b981]/70 shadow-[0_0_25px_rgba(16,185,129,0.15)] ring-1 ring-[#10b981]/40'
          : isBeingGazed
          ? 'border-[#ff6b1a]/70 shadow-lg'
          : 'border-[#27272a]/70 hover:border-[#3f3f46] hover:shadow-2xl'
      }`}
    >
      {/* Product Image Stage */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#18191d]">
        {!imageFailed ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
            className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div 
            className="w-full h-full flex flex-col items-center justify-center p-6 text-center"
            style={{ background: product.imageFallbackGradient }}
          >
            <Sparkles className="w-8 h-8 text-white/70 mb-2" />
            <span className="font-editorial text-base text-white">{product.brand}</span>
            <span className="text-xs text-white/60 mt-1">{product.articleType}</span>
          </div>
        )}

        {/* Top Badges / Wishlist */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <span className="text-[10px] font-mono uppercase bg-[#0c0d0e]/80 backdrop-blur-md text-[#d4d4d8] px-2.5 py-1 rounded-md border border-[#27272a]">
            {product.category}
          </span>

          <button
            onClick={handleWishlistClick}
            data-magnetic
            className={`p-2 rounded-full backdrop-blur-md transition-all cursor-pointer ${
              isWishlisted
                ? 'bg-[#ff6b1a] text-[#09090b]'
                : 'bg-[#0c0d0e]/60 hover:bg-[#0c0d0e]/90 text-[#f4f4f5]'
            }`}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Visual Attention Real-Time Cue */}
        {(isBeingGazed || isHovered) && (
          <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#0c0d0e]/85 backdrop-blur-md border border-[#27272a] text-[11px] font-mono">
            <span className="flex items-center gap-1.5 text-[#10b981]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-ping" />
              <span>{isInterestConfirmed ? 'Visual interest locked' : 'Tracking gaze...'}</span>
            </span>
            <span className="text-[#a1a1aa]">
              {currentGazeTarget?.dwellSeconds ? `${currentGazeTarget.dwellSeconds}s` : '0.4s'}
            </span>
          </div>
        )}
      </div>

      {/* Product Card Details */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-[#a1a1aa]">
            <span className="tracking-wider uppercase text-[10px] font-mono font-medium text-[#71717a]">
              {product.brand}
            </span>
            
            {/* Algorithmic Match Score */}
            <span className="text-[10px] font-mono text-[#ff6b1a]">
              {product.explanation.matchScore}% Match
            </span>
          </div>

          <h3 className="text-sm font-medium text-[#f4f4f5] leading-snug line-clamp-1 group-hover:text-[#ff6b1a] transition-colors">
            {product.name}
          </h3>

          {/* Rating Section (Section 2 & 15: Truthful rating & review count) */}
          <div className="flex items-center gap-1.5 pt-0.5 text-xs font-mono">
            {ratingSummary.averageRating !== null ? (
              <span className="text-[#ff6b1a] font-semibold flex items-center gap-1 text-[11px]">
                <Star className="w-3 h-3 fill-current" />
                <span>{ratingSummary.averageRating} ({ratingSummary.totalReviews})</span>
              </span>
            ) : (
              <span className="text-[#71717a] text-[10px]">
                Ratings unavailable
              </span>
            )}
          </div>
        </div>

        {/* Price and Action Buttons (Section 15: [View Product], [♡ Save], [Similar]) */}
        <div className="pt-2.5 border-t border-[#27272a]/70 space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-sm font-bold text-[#f4f4f5]">
              {product.currency}{product.price.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-[#71717a] font-mono">
              {product.style}
            </span>
          </div>

          {/* Explicit 3 Actions Requested by Section 15 */}
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            <button
              onClick={handleCardClick}
              data-magnetic
              className="py-1.5 px-2 bg-[#18191d] hover:bg-[#27272a] text-[#f4f4f5] border border-[#27272a] hover:border-[#3f3f46] rounded-lg text-[10px] font-mono font-medium transition-colors cursor-pointer text-center truncate"
            >
              View Product
            </button>

            <button
              onClick={handleWishlistClick}
              data-magnetic
              className={`py-1.5 px-2 rounded-lg text-[10px] font-mono font-medium transition-colors cursor-pointer text-center truncate border ${
                isWishlisted
                  ? 'bg-[#ff6b1a]/15 text-[#ff6b1a] border-[#ff6b1a]/40'
                  : 'bg-[#18191d] hover:bg-[#27272a] text-[#a1a1aa] border-[#27272a]'
              }`}
            >
              {isWishlisted ? 'Saved ♡' : '♡ Save'}
            </button>

            <button
              onClick={handleSimilarClick}
              data-magnetic
              className="py-1.5 px-2 bg-[#18191d] hover:bg-[#27272a] text-[#ff6b1a] border border-[#ff6b1a]/30 hover:border-[#ff6b1a] rounded-lg text-[10px] font-mono font-medium transition-colors cursor-pointer text-center truncate"
            >
              Similar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
