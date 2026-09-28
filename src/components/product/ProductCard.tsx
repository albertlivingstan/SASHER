import React, { useState } from 'react';
import { RecommendedProduct } from '../../types';
import { useSasher } from '../../context/SasherContext';
import { feedbackService } from '../../services/feedbackService';
import { 
  Heart, 
  Sparkles, 
  Check, 
  Star, 
  ShoppingBag, 
  Eye, 
  X, 
  ThumbsUp,
  Sparkle
} from 'lucide-react';

interface ProductCardProps {
  product: RecommendedProduct;
  onSelect: (product: RecommendedProduct) => void;
  onExplain?: (product: RecommendedProduct) => void;
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
    recordFeedback,
    feedbackMap,
    currentGazeTarget,
    addToCart
  } = useSasher();

  const [isHovered, setIsHovered] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const isWishlisted = Boolean(product.wishlist || product.isWishlisted || wishlistIds.has(product.id));
  const isBeingGazed = currentGazeTarget?.productId === product.id;
  const isInterestConfirmed = isBeingGazed && currentGazeTarget?.status === 'interest_confirmed';
  const currentFeedback = feedbackMap[product.id];

  // Dynamic rating from real user feedback
  const ratingSummary = feedbackService.getRatingSummary(product.id);
  const displayRating = ratingSummary.averageRating ?? product.rating;

  // Discount percentage
  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleMouseEnter = () => {
    setIsHovered(true);
    recordInteraction('HOVER', product.id, product.category, 600);
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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, product.availableSizes?.[0] || 'M');
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  };

  const handleMoreLikeThis = (e: React.MouseEvent) => {
    e.stopPropagation();
    recordFeedback(product.id, 'MORE_LIKE_THIS');
    if (onShowSimilar) {
      onShowSimilar(product);
    }
  };

  const handleNotInterested = (e: React.MouseEvent) => {
    e.stopPropagation();
    recordFeedback(product.id, 'DISLIKE');
  };

  if (currentFeedback === 'DISLIKE') {
    return null; // Suppress immediately from view
  }

  return (
    <div
      data-gaze-product-id={product.id}
      data-gaze-category={product.category}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
      className={`group relative rounded-2xl bg-[#121316] border transition-all duration-300 hover:scale-[1.015] cursor-pointer flex flex-col justify-between overflow-hidden ${
        isInterestConfirmed
          ? 'border-[#d4a373] shadow-[0_0_25px_rgba(212,163,115,0.2)] ring-1 ring-[#d4a373]/60'
          : isBeingGazed
          ? 'border-[#d4a373]/80 shadow-lg'
          : 'border-white/[0.08] hover:border-[#d4a373]/50 hover:shadow-xl'
      }`}
    >
      {/* Product Image Stage (Aspect 3:4) */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#18191d]">
        {!imageFailed ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div 
            className="w-full h-full flex flex-col items-center justify-center p-6 text-center"
            style={{ background: product.imageFallbackGradient }}
          >
            <Sparkles className="w-8 h-8 text-[#d4a373] mb-2" />
            <span className="font-editorial text-base text-white">{product.brand}</span>
            <span className="text-xs text-white/60 mt-1">{product.articleType}</span>
          </div>
        )}

        {/* Top Badges / Wishlist */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono uppercase bg-[#0c0d0e]/85 backdrop-blur-md text-[#d4d4d8] px-2.5 py-1 rounded-md border border-white/[0.08]">
              {product.category}
            </span>
            {discountPercent && (
              <span className="text-[10px] font-mono font-bold bg-[#ff6b1a] text-[#09090b] px-2 py-0.5 rounded-md shadow-sm">
                -{discountPercent}%
              </span>
            )}
          </div>

          <button
            onClick={handleWishlistClick}
            className={`p-2 rounded-full backdrop-blur-md transition-all cursor-pointer ${
              isWishlisted
                ? 'bg-[#d4a373] text-[#09090b]'
                : 'bg-[#0c0d0e]/75 hover:bg-[#0c0d0e] text-[#f4f4f5]'
            }`}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Hover Quick Actions Overlay Bar */}
        <div className="absolute inset-x-3 bottom-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-between gap-1.5 p-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/[0.12]">
          {/* Quick View */}
          <button
            onClick={(e) => { e.stopPropagation(); onSelect(product); }}
            className="flex-1 py-1.5 px-2 rounded-lg bg-white/[0.08] hover:bg-white/[0.16] text-[#f4f4f5] text-[11px] font-medium flex items-center justify-center gap-1 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>

          {/* More Like This (Section 15) */}
          <button
            onClick={handleMoreLikeThis}
            title="More Like This: Boosts similar recommendations"
            className="p-1.5 rounded-lg bg-[#d4a373]/20 hover:bg-[#d4a373]/35 text-[#d4a373] text-[10px] flex items-center gap-1 font-mono transition-colors"
          >
            <Sparkles className="w-3 h-3" />
            <span className="hidden sm:inline">More</span>
          </button>

          {/* Not Interested (Section 15: Suppress) */}
          <button
            onClick={handleNotInterested}
            title="Not Interested: Suppress from recommendations"
            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-400 text-[10px] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Visual Attention Focal Cue */}
        {isBeingGazed && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-15 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border border-[#d4a373]/60 animate-ping" />
            <div className="absolute w-2 h-2 rounded-full bg-[#d4a373]" />
          </div>
        )}
      </div>

      {/* Product Details Section */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-1 text-left">
          <div className="flex items-center justify-between text-xs text-[#a1a1aa]">
            <span className="tracking-wider uppercase text-[10px] font-mono font-medium text-[#71717a]">
              {product.brand}
            </span>
            
            {/* Match score */}
            <span className="text-[10px] font-mono text-[#d4a373] flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              {product.explanation?.matchScore || 92}% Match
            </span>
          </div>

          <h3 className="text-sm font-medium text-[#f4f4f5] leading-snug line-clamp-1 group-hover:text-[#d4a373] transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 pt-0.5 text-xs font-mono">
            {displayRating ? (
              <span className="text-[#d4a373] font-semibold flex items-center gap-1 text-[11px]">
                <Star className="w-3 h-3 fill-current" />
                <span>{typeof displayRating === 'number' ? displayRating.toFixed(1) : displayRating}</span>
                {product.reviewCount && <span className="text-[#71717a] font-normal">({product.reviewCount})</span>}
              </span>
            ) : (
              <span className="text-[#71717a] text-[10px]">
                Editorial Collection
              </span>
            )}
            <span className="text-[#3f3f46]">·</span>
            <span className="text-[#71717a] text-[10px] truncate max-w-[110px]">{product.style}</span>
          </div>
        </div>

        {/* Pricing and Primary Add-to-Cart Button */}
        <div className="pt-2.5 border-t border-white/[0.06] space-y-2.5">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-sm sm:text-base font-bold text-[#f4f4f5]">
                {product.currency}{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-[11px] text-[#71717a] line-through font-mono">
                  {product.currency}{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <span className="text-[10px] text-[#a1a1aa] font-mono">
              {product.color}
            </span>
          </div>

          {/* Add to Cart Bar */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddToCart}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                justAdded
                  ? 'bg-[#10b981] text-white'
                  : 'bg-[#d4a373] hover:bg-[#e0b487] text-[#0e0e11] font-semibold shadow-sm'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add to cart</span>
                </>
              )}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(product);
              }}
              title="View technical recommendation breakdown"
              className="py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-[#a1a1aa] hover:text-[#f4f4f5] border border-white/[0.08] text-xs font-mono transition-colors"
            >
              Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
