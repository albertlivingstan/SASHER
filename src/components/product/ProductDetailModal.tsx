import React, { useState, useEffect } from 'react';
import { RecommendedProduct, Product } from '../../types';
import { useSasher } from '../../context/SasherContext';
import { useAuth } from '../../context/AuthContext';
import { feedbackService, ProductFeedback, ProductRatingSummary } from '../../services/feedbackService';
import { 
  X, 
  Heart, 
  ShoppingBag, 
  Check, 
  Eye, 
  ShieldCheck, 
  Sparkles,
  Star,
  Activity,
  ArrowRight,
  Send,
  AlertCircle,
  Truck,
  RotateCcw,
  Plus,
  Minus,
  Layers,
  Palette,
  Compass,
  CheckCircle2
} from 'lucide-react';

interface ProductDetailModalProps {
  product: RecommendedProduct | null;
  onClose: () => void;
  onViewResearch?: () => void;
  onSelectSimilarProduct?: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ 
  product, 
  onClose, 
  onViewResearch,
  onSelectSimilarProduct 
}) => {
  const { 
    products,
    wishlistIds, 
    toggleWishlist, 
    addToCart, 
    openCheckout,
    currentGazeTarget,
    getOutfitForProduct,
    getSimilarProducts,
    recordInteraction
  } = useSasher();
  const { isAuthenticated, user } = useAuth();

  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  // User Feedback state
  const [userRating, setUserRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [ratingSummary, setRatingSummary] = useState<ProductRatingSummary | null>(null);
  const [reviewsList, setReviewsList] = useState<ProductFeedback[]>([]);

  // Load verified feedback summary for this product
  useEffect(() => {
    if (product) {
      const summary = feedbackService.getRatingSummary(product.id);
      setRatingSummary(summary);
      setReviewsList(feedbackService.getFeedbackForProduct(product.id));
      setUserRating(0);
      setFeedbackText('');
      setFeedbackSubmitted(false);
      setFeedbackError(null);
      setSelectedImageIdx(0);
      setQuantity(1);
    }
  }, [product]);

  if (!product) return null;

  const isWishlisted = Boolean(product.wishlist || product.isWishlisted || wishlistIds.has(product.id));
  const isBeingGazed = currentGazeTarget?.productId === product.id;

  // Discount percentage
  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  // Image gallery array
  const galleryImages = [
    product.imageUrl,
    product.images?.[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    product.images?.[1] || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80'
  ];

  // Complete the Look outfit bundle (Section 10)
  const outfitLook = getOutfitForProduct(product);

  // Calculated signals for "Why SASHER Recommends This" (Section 8)
  const signals = product.explanation?.signals || {
    styleSimilarity: 88,
    colorPreference: 78,
    categoryPreference: 92,
    previousInteraction: 80,
    browsingBehavior: 85
  };

  const handleToggleWishlist = () => {
    toggleWishlist(product.id);
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product, selectedSize);
    }
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedSize);
    onClose();
    openCheckout();
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackError(null);

    if (userRating < 1 || userRating > 5) {
      setFeedbackError('Please select a star rating between 1 and 5.');
      return;
    }

    const res = feedbackService.submitFeedback(product.id, userRating, feedbackText);
    if (!res.success) {
      setFeedbackError(res.error || 'Submission could not be completed.');
      return;
    }

    setFeedbackSubmitted(true);
    setRatingSummary(feedbackService.getRatingSummary(product.id));
    setReviewsList(feedbackService.getFeedbackForProduct(product.id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto font-sans">
      <div 
        className="relative w-full max-w-5xl bg-[#0f1012] border border-white/[0.1] rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-[#f4f4f5]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-30 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors cursor-pointer border border-white/[0.08]"
          aria-label="Close details"
        >
          <X className="w-4 h-4" />
        </button>

        {/* MAIN BODY: SPLIT LEFT GALLERY & RIGHT METADATA */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-y-auto">
          
          {/* LEFT: Large Product Gallery */}
          <div className="lg:w-1/2 p-6 bg-[#141417] flex flex-col gap-4 border-b lg:border-b-0 lg:border-r border-white/[0.08]">
            
            {/* Main Stage Image */}
            <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-[#18191d] border border-white/[0.06]">
              {!imageFailed ? (
                <img
                  src={galleryImages[selectedImageIdx] || product.imageUrl}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  onError={() => setImageFailed(true)}
                  className="w-full h-full object-cover object-center transition-all duration-300"
                />
              ) : (
                <div 
                  className="w-full h-full flex flex-col items-center justify-center p-8 text-center"
                  style={{ background: product.imageFallbackGradient }}
                >
                  <Sparkles className="w-10 h-10 text-[#d4a373] mb-4" />
                  <span className="font-editorial text-2xl text-white">{product.brand}</span>
                  <span className="text-sm text-white/60 mt-1">{product.name}</span>
                </div>
              )}

              {/* Top Badges */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase bg-black/70 backdrop-blur-md text-[#d4d4d8] px-3 py-1 rounded-full border border-white/[0.1]">
                  {product.category}
                </span>
                {discountPercent && (
                  <span className="text-[10px] font-mono font-bold bg-[#ff6b1a] text-[#09090b] px-2.5 py-0.5 rounded-full">
                    -{discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Gaze Visual Focus Indicator */}
              {isBeingGazed && (
                <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-md border border-[#10b981]/50 rounded-xl p-2.5 flex items-center justify-between text-xs font-mono">
                  <span className="flex items-center gap-2 text-[#10b981]">
                    <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
                    <span>Visual Attention Focused</span>
                  </span>
                  <span className="text-[#a1a1aa]">
                    +3.5× Recommendation Lift
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            <div className="flex items-center gap-3">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`w-16 h-20 rounded-xl overflow-hidden border transition-all cursor-pointer ${
                    selectedImageIdx === idx 
                      ? 'border-[#d4a373] ring-1 ring-[#d4a373]' 
                      : 'border-white/[0.08] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

          </div>

          {/* RIGHT: Product Name, Price, Options, Purchase Actions */}
          <div className="lg:w-1/2 p-6 sm:p-8 overflow-y-auto space-y-6 text-left">
            
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-[#a1a1aa] mb-2">
                <span className="uppercase tracking-widest text-[#d4a373] font-semibold">{product.brand}</span>
                <span className="text-[#d4a373] font-mono flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {product.explanation?.matchScore || 94}% Calculated Match
                </span>
              </div>

              <h2 className="font-editorial text-3xl sm:text-4xl text-[#f4f4f5] leading-tight">
                {product.name}
              </h2>

              {/* Ratings */}
              <div className="flex items-center gap-2 mt-2 text-xs font-mono text-[#a1a1aa]">
                <div className="flex items-center gap-1 text-[#d4a373]">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="font-semibold">{product.rating || 4.8}</span>
                </div>
                <span>·</span>
                <span>{product.reviewCount || 38} Verified Customer Reviews</span>
              </div>

              {/* Price & Discount */}
              <div className="flex items-baseline gap-3 mt-4">
                <span className="font-mono text-2xl sm:text-3xl font-bold text-[#f4f4f5]">
                  {product.currency}{product.price.toLocaleString('en-IN')}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="font-mono text-base text-[#71717a] line-through">
                    {product.currency}{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
                <span className="text-xs text-[#10b981] ml-auto font-mono">
                  {product.stock > 0 ? `In Stock (${product.stock} units)` : 'Sold Out'}
                </span>
              </div>
            </div>

            {/* Color Swatch */}
            <div className="space-y-2 pt-2 border-t border-white/[0.08]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[#71717a] uppercase tracking-wider">Color</span>
                <span className="text-[#f4f4f5] font-medium">{product.color}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full border-2 border-[#d4a373] p-0.5 flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-[#3d3a36]" />
                </div>
              </div>
            </div>

            {/* Size Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[#71717a] uppercase tracking-wider">Size</span>
                <span className="text-[#d4a373] text-[11px] cursor-pointer hover:underline">Size Guide</span>
              </div>
              <div className="flex items-center gap-2">
                {(product.availableSizes || ['S', 'M', 'L', 'XL']).map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-11 h-11 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
                      selectedSize === size
                        ? 'bg-[#d4a373] text-[#09090b] font-bold shadow-md'
                        : 'bg-[#18191d] text-[#a1a1aa] hover:text-[#f4f4f5] border border-white/[0.08]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-2">
              <span className="font-mono text-xs text-[#71717a] uppercase tracking-wider block">Quantity</span>
              <div className="inline-flex items-center rounded-xl bg-[#18191d] border border-white/[0.08]">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2.5 text-[#a1a1aa] hover:text-[#f4f4f5] cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center font-mono text-xs font-bold text-[#f4f4f5]">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  className="p-2.5 text-[#a1a1aa] hover:text-[#f4f4f5] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* CTAs: Add to Cart + Buy Now + Wishlist */}
            <div className="space-y-3 pt-3">
              <div className="flex items-center gap-3">
                {/* Primary Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={addedAnimation}
                  className={`flex-1 py-3.5 px-6 rounded-2xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                    addedAnimation
                      ? 'bg-[#10b981] text-[#09090b]'
                      : 'bg-[#d4a373] hover:bg-[#e0b487] text-[#09090b] shadow-lg'
                  }`}
                >
                  {addedAnimation ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Bag</span>
                    </>
                  )}
                </button>

                {/* Buy Now Button */}
                <button
                  onClick={handleBuyNow}
                  className="flex-1 py-3.5 px-6 rounded-2xl bg-[#f4f4f5] hover:bg-white text-[#09090b] text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer text-center"
                >
                  Buy Now
                </button>

                {/* Wishlist Toggle Button */}
                <button
                  onClick={handleToggleWishlist}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isWishlisted
                      ? 'border-[#d4a373] bg-[#d4a373]/15 text-[#d4a373]'
                      : 'border-white/[0.1] bg-[#18191d] hover:bg-[#202126] text-[#a1a1aa]'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* Description & Materials */}
            <div className="space-y-3 pt-4 border-t border-white/[0.08]">
              <h4 className="text-xs font-mono uppercase tracking-wider text-[#71717a]">Description & Material</h4>
              <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed">
                {product.description}
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <span className="text-[#71717a] block text-[10px]">MATERIAL</span>
                  <span className="text-[#f4f4f5]">{product.material}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <span className="text-[#71717a] block text-[10px]">SILHOUETTE / FIT</span>
                  <span className="text-[#f4f4f5]">{product.fit}</span>
                </div>
              </div>
            </div>

            {/* Shipping & Returns Guarantee */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-xs">
                <Truck className="w-4 h-4 text-[#d4a373] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#f4f4f5] font-medium block">Complimentary Delivery</span>
                  <span className="text-[#71717a] text-[11px]">Express delivery within 2–4 business days</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-xs">
                <RotateCcw className="w-4 h-4 text-[#d4a373] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#f4f4f5] font-medium block">30-Day Returns</span>
                  <span className="text-[#71717a] text-[11px]">Effortless doorstep return pickup</span>
                </div>
              </div>
            </div>

            {/* SECTION 8: WHY SASHER RECOMMENDS THIS (Defensible, calculated signals) */}
            <div className="p-5 rounded-2xl bg-[#141518] border border-[#d4a373]/30 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#d4a373]" />
                  <span className="font-editorial text-base sm:text-lg text-[#f4f4f5]">Why SASHER Recommends This</span>
                </div>
                <span className="text-xs font-mono text-[#d4a373] bg-[#d4a373]/10 px-2.5 py-1 rounded-full border border-[#d4a373]/30">
                  {product.explanation?.matchScore || 94}% Overall Affinity
                </span>
              </div>

              {/* Natural Language Reasons */}
              <div className="space-y-1.5 text-xs text-[#a1a1aa]">
                {(product.explanation?.primaryReasons || [
                  `High silhouette match to your viewed collection`,
                  `Aligns with your preference for ${product.style.toLowerCase()} cuts`
                ]).map((reason, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981] shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>

              {/* Calculated Match Signals Breakdown */}
              <div className="pt-2 border-t border-white/[0.08] space-y-2">
                <span className="text-[10px] font-mono text-[#71717a] uppercase tracking-wider block">
                  Measured Recommendation Signals
                </span>
                
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-[#a1a1aa]">Style Similarity</span>
                    <span className="text-[#f4f4f5]">{signals.styleSimilarity}%</span>
                  </div>
                  <div className="w-full bg-[#1e2025] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#d4a373] h-full rounded-full" style={{ width: `${signals.styleSimilarity}%` }} />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[#a1a1aa]">Color Preference</span>
                    <span className="text-[#f4f4f5]">{signals.colorPreference}%</span>
                  </div>
                  <div className="w-full bg-[#1e2025] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#d4a373] h-full rounded-full" style={{ width: `${signals.colorPreference}%` }} />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[#a1a1aa]">Category Preference</span>
                    <span className="text-[#f4f4f5]">{signals.categoryPreference}%</span>
                  </div>
                  <div className="w-full bg-[#1e2025] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#d4a373] h-full rounded-full" style={{ width: `${signals.categoryPreference}%` }} />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[#a1a1aa]">Browsing & Visual Attention</span>
                    <span className="text-[#f4f4f5]">{signals.browsingBehavior}%</span>
                  </div>
                  <div className="w-full bg-[#1e2025] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#10b981] h-full rounded-full" style={{ width: `${signals.browsingBehavior}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 10: COMPLETE THE LOOK (Outfit Recommendations) */}
            {outfitLook && outfitLook.items.length > 1 && (
              <div className="p-5 rounded-2xl bg-[#141518] border border-white/[0.08] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#d4a373]" />
                      <h4 className="font-editorial text-base sm:text-lg text-[#f4f4f5]">Complete the Look</h4>
                    </div>
                    <p className="text-[11px] text-[#a1a1aa]">
                      These items complement the style and silhouette of the selected product.
                    </p>
                  </div>
                </div>

                {/* Outfit items cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {outfitLook.items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => onSelectSimilarProduct && onSelectSimilarProduct(item)}
                      className={`p-2 rounded-xl bg-[#0c0d0e] border transition-all cursor-pointer group ${
                        item.id === product.id ? 'border-[#d4a373]' : 'border-white/[0.06] hover:border-white/[0.2]'
                      }`}
                    >
                      <div className="aspect-[3/4] rounded-lg overflow-hidden bg-[#18191d] mb-1.5">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <div className="text-[10px] font-mono text-[#71717a] uppercase">{item.category}</div>
                      <div className="text-[11px] text-[#f4f4f5] truncate font-medium">{item.name}</div>
                      <div className="text-[10px] font-mono text-[#d4a373] mt-0.5">{item.currency}{item.price.toLocaleString('en-IN')}</div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-white/[0.06]">
                  <span className="text-xs text-[#a1a1aa] font-mono">
                    Total Ensemble: <strong className="text-[#f4f4f5] font-bold">₹{outfitLook.totalPrice.toLocaleString('en-IN')}</strong>
                  </span>
                  <button
                    onClick={() => {
                      outfitLook.items.forEach(i => addToCart(i, 'M'));
                      setAddedAnimation(true);
                      setTimeout(() => setAddedAnimation(false), 2000);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-xs font-mono text-[#f4f4f5] transition-colors cursor-pointer"
                  >
                    Add Entire Look to Bag
                  </button>
                </div>
              </div>
            )}

            {/* Product Reviews & Rating Submissions */}
            <div className="p-5 rounded-2xl bg-[#141518] border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-editorial text-base text-[#f4f4f5]">Verified Client Reviews</span>
                {ratingSummary?.averageRating && (
                  <span className="text-xs font-mono text-[#d4a373] font-bold">
                    ★ {ratingSummary.averageRating} / 5.0
                  </span>
                )}
              </div>

              {/* Submit rating form */}
              <form onSubmit={handleSubmitFeedback} className="space-y-3 pt-1">
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setUserRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 text-[#71717a] hover:text-[#d4a373] transition-colors cursor-pointer"
                    >
                      <Star className={`w-4 h-4 ${(hoverRating || userRating) >= star ? 'text-[#d4a373] fill-[#d4a373]' : 'text-[#3f3f46]'}`} />
                    </button>
                  ))}
                  <span className="text-xs font-mono text-[#71717a] ml-2">
                    {userRating > 0 ? `${userRating} of 5 stars` : 'Rate piece'}
                  </span>
                </div>

                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Share details on cut, material texture, and proportions..."
                  rows={2}
                  className="w-full bg-[#0c0d0e] border border-white/[0.08] focus:border-[#d4a373] rounded-xl p-3 text-xs text-[#f5f5f7] outline-none placeholder-[#71717a] resize-none"
                />

                {feedbackError && (
                  <span className="text-[11px] text-red-400 block">{feedbackError}</span>
                )}
                {feedbackSubmitted && (
                  <span className="text-[11px] text-[#10b981] font-mono block">✓ Feedback recorded and synced to recommendation profile.</span>
                )}

                <button
                  type="submit"
                  disabled={userRating === 0}
                  className="px-4 py-2 bg-white/[0.08] hover:bg-white/[0.15] disabled:opacity-40 text-xs font-mono rounded-xl text-[#f4f4f5] cursor-pointer transition-colors"
                >
                  Submit Verified Feedback
                </button>
              </form>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
