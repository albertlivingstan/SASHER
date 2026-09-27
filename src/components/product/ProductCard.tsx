import React, { useState } from 'react';
import { RecommendedProduct } from '../../types';
import { useSasher } from '../../context/SasherContext';
import { feedbackService } from '../../services/feedbackService';
import { Heart, Eye, Sparkles, Plus, Check, Star, ArrowRight, ShoppingBag } from 'lucide-react';

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
    currentGazeTarget,
    addToCart
  } = useSasher();

  const [isHovered, setIsHovered] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const isWishlisted = Boolean(product.wishlist || product.isWishlisted || wishlistIds.has(product.id));
  const isBeingGazed = currentGazeTarget?.productId === product.id;
  const isInterestConfirmed = isBeingGazed && currentGazeTarget?.status === 'interest_confirmed';

  // Dynamic rating from real user feedback
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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, product.availableSizes?.[0] || 'M');
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  const handleSimilarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShowSimilar) {
      onShowSimilar(product);
    } else {
      onSelect(product);
    }
  };

  // Aesthetic tags from product properties for floating tags in video
  const aestheticTags = [
    product.style.toLowerCase().includes('minimal') ? 'minimalist' : (product.category === 'Outerwear' ? 'tailored' : 'minimalist'),
    product.color.toLowerCase().includes('camel') || product.color.toLowerCase().includes('ash') || product.color.toLowerCase().includes('beige') 
      ? 'earth tones' 
      : 'refined cuts'
  ];

  return (
    <div
      data-gaze-product-id={product.id}
      data-gaze-category={product.category}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
      className={`group relative rounded-2xl bg-[#121316] border transition-all duration-300 hover:scale-[1.015] cursor-pointer flex flex-col justify-between overflow-hidden ${
        isInterestConfirmed
          ? 'border-[#d4a373] shadow-[0_0_30px_rgba(212,163,115,0.25)] ring-1 ring-[#d4a373]/60'
          : isBeingGazed
          ? 'border-[#d4a373]/80 shadow-lg'
          : 'border-[#27272a]/70 hover:border-[#d4a373]/50 hover:shadow-2xl'
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
            className="w-full h-full object-cover object-center group-hover:scale-104 transition-transform duration-500 ease-out"
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
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <span className="text-[10px] font-mono uppercase bg-[#0c0d0e]/85 backdrop-blur-md text-[#d4d4d8] px-2.5 py-1 rounded-md border border-white/[0.08]">
            {product.category}
          </span>

          <button
            onClick={handleWishlistClick}
            data-magnetic
            className={`p-2 rounded-full backdrop-blur-md transition-all cursor-pointer ${
              isWishlisted
                ? 'bg-[#d4a373] text-[#09090b]'
                : 'bg-[#0c0d0e]/70 hover:bg-[#0c0d0e]/95 text-[#f4f4f5]'
            }`}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Dynamic Concentric Eye Focus Reticle from Video (00:02) */}
        {(isBeingGazed || isHovered) && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-15">
            <div className="relative flex items-center justify-center">
              {/* Outer pulsing ring */}
              <div className="w-16 h-16 rounded-full border border-[#d4a373]/40 animate-ping" style={{ animationDuration: '2s' }} />
              {/* Middle ring */}
              <div className="absolute w-11 h-11 rounded-full border border-[#d4a373]/80 animate-pulse" />
              {/* Inner focal core */}
              <div className="absolute w-3 h-3 rounded-full bg-[#d4a373] shadow-[0_0_12px_#d4a373]" />
            </div>
          </div>
        )}

        {/* Floating Attribute Tags from Video (00:02: "minimalist", "earth tones") */}
        {(isBeingGazed || isHovered) && (
          <div className="absolute bottom-11 left-3 flex items-center gap-1.5 z-20 animate-in fade-in slide-in-from-bottom-2 duration-200">
            {aestheticTags.map(tag => (
              <span 
                key={tag}
                className="px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md border border-white/[0.15] text-[10px] text-[#f4f4f5] font-mono tracking-wide"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Visual Attention Real-Time Cue Bar */}
        {(isBeingGazed || isHovered) && (
          <div className="absolute bottom-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#0c0d0e]/90 backdrop-blur-md border border-[#d4a373]/30 text-[10px] font-mono">
            <span className="flex items-center gap-1.5 text-[#d4a373]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4a373] animate-ping" />
              <span>{isInterestConfirmed ? 'Visual Interest Locked' : 'Gaze Focused'}</span>
            </span>
            <span className="text-[#a1a1aa]">
              {currentGazeTarget?.dwellSeconds ? `${currentGazeTarget.dwellSeconds}s` : '0.6s'}
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
            
            {/* Visual Interest Match */}
            <span className="text-[10px] font-mono text-[#d4a373]">
              {product.explanation?.matchScore || Math.round((product.popularityScore || 0.85) * 100)}% Interest
            </span>
          </div>

          <h3 className="text-sm font-medium text-[#f4f4f5] leading-snug line-clamp-1 group-hover:text-[#d4a373] transition-colors">
            {product.name}
          </h3>

          {/* Real Customer Rating */}
          <div className="flex items-center gap-1.5 pt-0.5 text-xs font-mono">
            {ratingSummary.averageRating !== null ? (
              <span className="text-[#d4a373] font-semibold flex items-center gap-1 text-[11px]">
                <Star className="w-3 h-3 fill-current" />
                <span>{ratingSummary.averageRating} ({ratingSummary.totalReviews})</span>
              </span>
            ) : (
              <span className="text-[#71717a] text-[10px]">
                Editorial Collection
              </span>
            )}
          </div>
        </div>

        {/* Price and Action Buttons matching the Video UI */}
        <div className="pt-2.5 border-t border-[#27272a]/70 space-y-2.5">
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
            <span className="text-[10px] text-[#71717a] font-mono">
              {product.style}
            </span>
          </div>

          {/* Primary "Add to Cart" Button + Quick Views (Video 00:02) */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleAddToCart}
              data-magnetic
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium font-sans flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                justAdded
                  ? 'bg-[#10b981] text-white'
                  : 'bg-[#d4a373] hover:bg-[#e0b487] text-[#0e0e11] font-semibold shadow-md hover:shadow-lg'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added to Cart</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add to cart</span>
                </>
              )}
            </button>

            <button
              onClick={handleSimilarClick}
              data-magnetic
              title="Show similar aesthetic pieces"
              className="py-2 px-2.5 bg-[#18191d] hover:bg-[#27272a] text-[#a1a1aa] hover:text-[#f4f4f5] border border-[#27272a] rounded-xl text-xs font-mono transition-colors cursor-pointer"
            >
              Similar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
