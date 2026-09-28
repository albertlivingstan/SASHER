import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Product, 
  CategoryType, 
  InteractionEvent, 
  InteractionType, 
  RecommendedProduct, 
  SessionIntentState, 
  DynamicWeights, 
  GazeTarget, 
  AnomalyDetectionState, 
  CartItem,
  RecommendationExplanation,
  CompletedOrder,
  UserPreferenceProfile,
  HybridRecommendationWeights,
  OutfitLook,
  ProductFeedbackType
} from '../types';
import { 
  DEFAULT_HYBRID_WEIGHTS,
  computeUserPreferenceProfile,
  calculateHybridRankings,
  generateOutfitLook,
  calculateFeatureSimilarity
} from '../services/recommendationEngine';
import { INITIAL_PRODUCTS } from '../data/products';
import { DEFAULT_PAST_ORDERS } from '../data/defaultOrders';
import { eyeTracker, GazeCallbackPayload } from '../services/eyeTracker';
import { RankingService } from '../services/RankingService';
import { projectSuggestionService, SuggestedProject, GazeProductAnalysis } from '../services/projectSuggestionService';
import { useAuth } from './AuthContext';
import { 
  saveWishlistItemToFirestore, 
  removeWishlistItemFromFirestore, 
  subscribeToUserWishlist, 
  saveUserOrderToFirestore, 
  subscribeToUserOrders, 
  saveUserSessionToFirestore 
} from '../services/firestoreStorage';

interface SasherContextType {
  products: Product[];
  recommendedProducts: RecommendedProduct[];
  activeCategory: CategoryType;
  setActiveCategory: (cat: CategoryType) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedProduct: RecommendedProduct | null;
  setSelectedProduct: (p: RecommendedProduct | null) => void;
  
  // Interactions & Session
  interactions: InteractionEvent[];
  recordInteraction: (type: InteractionType, productId: string, category: CategoryType, dwellMs?: number, gazeWeight?: number) => void;
  sessionIntent: SessionIntentState;
  dynamicWeights: DynamicWeights;
  resetSession: () => void;
  
  // Research & Personalization Engine
  userPreferenceProfile: UserPreferenceProfile;
  hybridWeights: HybridRecommendationWeights;
  setHybridWeights: (weights: Partial<HybridRecommendationWeights>) => void;
  recordFeedback: (productId: string, type: ProductFeedbackType) => void;
  feedbackMap: Record<string, ProductFeedbackType>;
  visualIntentMode: 'interaction' | 'webcam' | 'paused';
  setVisualIntentMode: (mode: 'interaction' | 'webcam' | 'paused') => void;
  isVisualIntentModalOpen: boolean;
  setIsVisualIntentModalOpen: (open: boolean) => void;
  genderFilter: 'All' | 'Women' | 'Men';
  setGenderFilter: (gender: 'All' | 'Women' | 'Men') => void;
  getSimilarProducts: (product: Product, limit?: number) => RecommendedProduct[];
  getOutfitForProduct: (product: Product) => OutfitLook;
  
  // Eye-Tracking
  isEyeTrackingActive: boolean;
  toggleEyeTracking: () => void;
  setEyeTrackingActive: (active: boolean) => void;
  isCalibrated: boolean;
  calibrationScore: number;
  openCalibration: () => void;
  closeCalibration: () => void;
  isCalibrationModalOpen: boolean;
  completeCalibration: (score: number) => void;
  currentGazeTarget: GazeTarget | null;
  lastGazeCoordinates: { x: number; y: number };

  // Eye-Gaze Suggested Project & Analysis
  activeSuggestedProject: SuggestedProject | null;
  activeGazeAnalysis: GazeProductAnalysis | null;
  isProjectDrawerOpen: boolean;
  setIsProjectDrawerOpen: (open: boolean) => void;
  triggerProjectForProduct: (product: Product) => void;
  addAllProjectItemsToCart: (project: SuggestedProject) => void;
  
  // Debug & Explainability
  isGazeDebugOpen: boolean;
  toggleGazeDebug: () => void;
  explanationModalProduct: RecommendedProduct | null;
  setExplanationModalProduct: (p: RecommendedProduct | null) => void;
  
  // Anomaly / Security
  anomalyState: AnomalyDetectionState;
  simulateRoboticAttack: () => void;
  resetAnomalyState: () => void;
  
  // Wishlist & Cart
  wishlistIds: Set<string>;
  toggleWishlist: (productId: string) => void;
  cart: CartItem[];
  addToCart: (product: Product, size?: string) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  
  // Checkout & Payment Methods
  isCheckoutModalOpen: boolean;
  setIsCheckoutModalOpen: (open: boolean) => void;
  openCheckout: () => void;
  closeCheckout: () => void;
  completedOrders: CompletedOrder[];
  completeOrder: (order: CompletedOrder) => void;
  clearCart: () => void;
  
  // Adaptive Notification Toast
  recentAdaptiveNotification: string | null;
  dismissAdaptiveNotification: () => void;
}

const SasherContext = createContext<SasherContextType | undefined>(undefined);

const INITIAL_CATEGORY_DISTRIBUTION: Record<CategoryType, number> = {
  All: 0.12,
  Outerwear: 0.14,
  Tailoring: 0.13,
  Knitwear: 0.12,
  Tops: 0.13,
  Dresses: 0.12,
  Trousers: 0.12,
  Footwear: 0.12,
  Accessories: 0.12
};

export const SasherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, updateCalibrationScore } = useAuth();
  const [products] = useState<Product[]>(INITIAL_PRODUCTS);
  const [activeCategory, setActiveCategory] = useState<CategoryType>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<RecommendedProduct | null>(null);
  
  // Session interactions
  const [interactions, setInteractions] = useState<InteractionEvent[]>([]);
  const [sessionStartTime] = useState<number>(Date.now());
  const [recentAdaptiveNotification, setRecentAdaptiveNotification] = useState<string | null>(null);
  
  // Eye-tracking state
  const [isEyeTrackingActive, setIsEyeTrackingActive] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('sasher_visual_intent_active');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });
  const [isCalibrated, setIsCalibrated] = useState<boolean>(true);
  const [calibrationScore, setCalibrationScore] = useState<number>(() => user?.calibrationScore ?? 94);
  const [isCalibrationModalOpen, setIsCalibrationModalOpen] = useState<boolean>(false);
  const [currentGazeTarget, setCurrentGazeTarget] = useState<GazeTarget | null>(null);
  const [lastGazeCoordinates, setLastGazeCoordinates] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isGazeDebugOpen, setIsGazeDebugOpen] = useState<boolean>(false);
  const [explanationModalProduct, setExplanationModalProduct] = useState<RecommendedProduct | null>(null);

  // Eye-Gaze Suggested Project & Real-Time Product Analysis State
  const [activeSuggestedProject, setActiveSuggestedProject] = useState<SuggestedProject | null>(() => {
    return projectSuggestionService.generateProjectForProduct(INITIAL_PRODUCTS[0]);
  });
  const [activeGazeAnalysis, setActiveGazeAnalysis] = useState<GazeProductAnalysis | null>(() => {
    return projectSuggestionService.analyzeGazedProduct(INITIAL_PRODUCTS[0], 1.2);
  });
  const [isProjectDrawerOpen, setIsProjectDrawerOpen] = useState<boolean>(false);

  // Research & Hybrid Recommendation Configuration
  const [hybridWeights, setHybridWeightsState] = useState<HybridRecommendationWeights>(DEFAULT_HYBRID_WEIGHTS);
  const [feedbackMap, setFeedbackMap] = useState<Record<string, ProductFeedbackType>>({});
  const [visualIntentMode, setVisualIntentMode] = useState<'interaction' | 'webcam' | 'paused'>('interaction');
  const [isVisualIntentModalOpen, setIsVisualIntentModalOpen] = useState<boolean>(false);
  const [genderFilter, setGenderFilter] = useState<'All' | 'Women' | 'Men'>('All');

  const setHybridWeights = useCallback((weights: Partial<HybridRecommendationWeights>) => {
    setHybridWeightsState(prev => ({ ...prev, ...weights }));
  }, []);

  // Security / Anomaly State
  const [anomalyState, setAnomalyState] = useState<AnomalyDetectionState>({
    status: 'normal',
    anomalyScore: 0.08,
    eventsProcessed: 0,
    eventVelocity: 0.4,
    suspiciousFlagsCount: 0,
    fallbackActive: false,
    lastCheckTimestamp: Date.now()
  });

  // Wishlist & Cart
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set(['prod-01']));
  const [cart, setCart] = useState<CartItem[]>([
    { product: INITIAL_PRODUCTS[0], quantity: 1, size: 'M' }
  ]);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [completedOrders, setCompletedOrders] = useState<CompletedOrder[]>(DEFAULT_PAST_ORDERS);

  // Real-time Firestore sync when user signs in with Google
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    if (typeof user.calibrationScore === 'number') {
      setCalibrationScore(user.calibrationScore);
      eyeTracker.setCalibrationScore(user.calibrationScore);
    }

    const unsubscribeWishlist = subscribeToUserWishlist(user.id, (ids) => {
      if (ids.length > 0) {
        setWishlistIds(new Set(ids));
      }
    });

    const unsubscribeOrders = subscribeToUserOrders(user.id, (storedOrders) => {
      if (storedOrders.length > 0) {
        setCompletedOrders(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const existingOrderNums = new Set(prev.map(p => p.orderNumber));
          const newConverted: CompletedOrder[] = storedOrders
            .filter(o => !existingIds.has(o.orderId) && !existingOrderNums.has(o.orderNumber))
            .map(o => ({
              id: o.orderId,
              orderNumber: o.orderNumber,
              timestamp: o.createdAt ? new Date(o.createdAt).getTime() : Date.now(),
              items: [
                {
                  product: INITIAL_PRODUCTS[0],
                  quantity: o.itemCount || 1,
                  size: 'M'
                }
              ],
              subtotal: o.totalAmount,
              discount: 0,
              tax: Math.round(o.totalAmount * 0.12),
              shipping: 0,
              total: o.totalAmount,
              currency: '₹',
              paymentMethod: (o.paymentMethod as any) || 'CARD',
              paymentReference: `REF-${o.orderId}`,
              shippingAddress: {
                fullName: user.name || 'Valued Client',
                email: user.email || 'client@sasher.luxury',
                street: '124 Horizon Boulevard, Suite 8',
                city: 'Bangalore',
                postalCode: '560001',
                country: 'India'
              },
              journalHash: `0x${o.orderId}a8b7c6d5e4f3`
            }));
          return [...newConverted, ...prev];
        });
      }
    });

    return () => {
      unsubscribeWishlist();
      unsubscribeOrders();
    };
  }, [isAuthenticated, user?.id, user?.calibrationScore]);

  // Compute Dynamic Weights based on session depth & eye tracking
  const dynamicWeights: DynamicWeights = useMemo(() => {
    const count = interactions.length;
    const gazeEvents = interactions.filter(i => i.type === 'EYE_GAZE').length;
    
    // Cold start (0-2 interactions): baseline popularity & profile dominate
    if (count === 0) {
      return {
        session: 0.18,
        profile: 0.22,
        collaborative: 0.20,
        content: 0.15,
        popularity: 0.20,
        eyeGaze: isEyeTrackingActive ? 0.05 : 0.00
      };
    }

    // Dynamic shift as session interactions accrue
    const sessionFactor = Math.min(1.0, count / 8);
    const gazeFactor = isEyeTrackingActive ? Math.min(1.0, gazeEvents / 3) : 0;

    let wSession = 0.18 + sessionFactor * 0.28; // Up to 0.46
    let wGaze = isEyeTrackingActive ? (0.05 + gazeFactor * 0.22) : 0; // Up to 0.27
    let wPopularity = Math.max(0.04, 0.20 - sessionFactor * 0.16); // Down to 0.04
    let wProfile = Math.max(0.12, 0.22 - sessionFactor * 0.08); // Down to 0.14
    let wCollab = 0.18;
    let wContent = 0.15;

    // Normalize so sum equals 1.0
    const total = wSession + wGaze + wPopularity + wProfile + wCollab + wContent;
    return {
      session: parseFloat((wSession / total).toFixed(3)),
      profile: parseFloat((wProfile / total).toFixed(3)),
      collaborative: parseFloat((wCollab / total).toFixed(3)),
      content: parseFloat((wContent / total).toFixed(3)),
      popularity: parseFloat((wPopularity / total).toFixed(3)),
      eyeGaze: parseFloat((wGaze / total).toFixed(3))
    };
  }, [interactions, isEyeTrackingActive]);

  // Compute Session Intent State
  const sessionIntent: SessionIntentState = useMemo(() => {
    const categoryCounts: Record<CategoryType, number> = {
      All: 0,
      Outerwear: 0,
      Tailoring: 0,
      Knitwear: 0,
      Tops: 0,
      Dresses: 0,
      Trousers: 0,
      Footwear: 0,
      Accessories: 0
    };

    // Weight recent interactions higher (decay factor)
    interactions.forEach((ev, idx) => {
      const recencyWeight = 1.0 + (idx / Math.max(1, interactions.length)) * 1.5;
      const typeWeight = ev.type === 'PURCHASE' ? 5.0
        : ev.type === 'CART' ? 4.0
        : ev.type === 'WISHLIST' ? 3.5
        : ev.type === 'EYE_GAZE' ? 3.5 // Prompt specifies +3.5x for gaze intent
        : ev.type === 'VIEW' ? 2.0
        : 1.0;

      categoryCounts[ev.category] = (categoryCounts[ev.category] || 0) + (typeWeight * recencyWeight);
    });

    const totalWeightedInteractions = Object.values(categoryCounts).reduce((a, b) => a + b, 0);

    const categoryDistribution: Record<CategoryType, number> = { ...INITIAL_CATEGORY_DISTRIBUTION };
    if (totalWeightedInteractions > 0) {
      (Object.keys(categoryCounts) as CategoryType[]).forEach(cat => {
        if (cat !== 'All') {
          categoryDistribution[cat] = parseFloat(
            Math.min(0.96, Math.max(0.04, (categoryCounts[cat] / totalWeightedInteractions) * 0.8 + 0.1)).toFixed(2)
          );
        }
      });
    }

    // Determine primary category
    let maxCat: CategoryType = 'Outerwear';
    let maxVal = -1;
    (Object.keys(categoryDistribution) as CategoryType[]).forEach(cat => {
      if (cat !== 'All' && categoryDistribution[cat] > maxVal) {
        maxVal = categoryDistribution[cat];
        maxCat = cat;
      }
    });

    // Trend description
    let trend = 'Exploring curated collection';
    if (interactions.length > 0) {
      const topCat = maxCat.toLowerCase();
      trend = `Your session is trending toward ${topCat}`;
    }

    const elapsedSeconds = Math.round((Date.now() - sessionStartTime) / 1000);
    const confidence = interactions.length === 0 ? 0.65 : Math.min(0.98, 0.70 + (interactions.length * 0.04));

    return {
      primaryCategory: maxCat,
      primaryStyle: 'Architectural Minimalist',
      confidence: parseFloat(confidence.toFixed(2)),
      categoryDistribution,
      styleDistribution: {
        Architectural: 0.42,
        Minimalist: 0.35,
        Tailored: 0.18,
        Casual: 0.05
      },
      totalInteractions: interactions.length,
      sessionDurationSec: elapsedSeconds,
      lastUpdated: Date.now(),
      trendDescription: trend
    };
  }, [interactions, sessionStartTime]);

  // Record an interaction event & update anomaly tracker
  const recordInteraction = useCallback((
    type: InteractionType,
    productId: string,
    category: CategoryType,
    dwellMs?: number,
    gazeWeight?: number
  ) => {
    const newEvent: InteractionEvent = {
      id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      type,
      productId,
      category,
      dwellMs,
      gazeWeight
    };

    setInteractions(prev => [...prev.slice(-40), newEvent]);

    // Update anomaly detection metrics
    setAnomalyState(prev => {
      const count = prev.eventsProcessed + 1;
      const velocity = Math.min(10, count / Math.max(1, (Date.now() - sessionStartTime) / 1000));
      // Robotic threshold check (> 8 events/sec is abnormal)
      const isAbnormal = velocity > 6.0;
      const newScore = isAbnormal ? Math.min(0.98, prev.anomalyScore + 0.35) : Math.max(0.04, prev.anomalyScore * 0.95);
      const isFallback = newScore > 0.80;

      return {
        ...prev,
        eventsProcessed: count,
        eventVelocity: parseFloat(velocity.toFixed(2)),
        anomalyScore: parseFloat(newScore.toFixed(3)),
        status: isFallback ? 'fallback' : isAbnormal ? 'suspicious' : 'normal',
        fallbackActive: isFallback,
        lastCheckTimestamp: Date.now()
      };
    });

    if (type === 'EYE_GAZE') {
      const product = products.find(p => p.id === productId);
      setRecentAdaptiveNotification(
        product 
          ? `Visual attention detected on "${product.name}". Recommendations updated.`
          : 'Visual interest registered. Real-time recommendation weights adjusted.'
      );
    } else if (type === 'WISHLIST') {
      setRecentAdaptiveNotification('Wishlist preference incorporated into long-term style vector.');
    }
  }, [products, sessionStartTime]);

  // Handle Eye Tracker Gaze Callbacks
  useEffect(() => {
    if (!isEyeTrackingActive) return;

    eyeTracker.startTracking();

    let lastCoordTime = 0;
    const unsubscribe = eyeTracker.subscribe((payload: GazeCallbackPayload) => {
      const now = Date.now();
      // Throttle coordinate context updates so other debug panels don't thrash
      if (now - lastCoordTime > 200) {
        lastCoordTime = now;
        setLastGazeCoordinates(prev => {
          if (Math.abs(prev.x - payload.x) > 20 || Math.abs(prev.y - payload.y) > 20) {
            return { x: payload.x, y: payload.y };
          }
          return prev;
        });
      }

      if (payload.targetElementId) {
        const targetId = payload.targetElementId;
        const prod = products.find(p => p.id === targetId);
        const newStatus = payload.dwellSeconds >= 1.2 ? 'interest_confirmed' : 'detecting';

        setCurrentGazeTarget(prev => {
          if (
            prev &&
            prev.productId === targetId &&
            prev.status === newStatus &&
            Math.abs(prev.dwellSeconds - payload.dwellSeconds) < 0.3
          ) {
            return prev;
          }

          return {
            productId: targetId,
            productName: prod?.name || 'Fashion Item',
            category: (payload.targetCategory as CategoryType) || 'Outerwear',
            dwellSeconds: payload.dwellSeconds,
            dwellStart: Date.now() - (payload.dwellSeconds * 1000),
            status: newStatus,
            coordinates: { x: payload.x, y: payload.y }
          };
        });

        // Trigger discrete EYE_GAZE event upon dwell >= 1.2s
        if (payload.eventDispatched && prod) {
          recordInteraction('EYE_GAZE', prod.id, prod.category, payload.dwellSeconds * 1000, 3.5);
          const analysis = projectSuggestionService.analyzeGazedProduct(prod, payload.dwellSeconds);
          const project = projectSuggestionService.generateProjectForProduct(prod);
          setActiveGazeAnalysis(analysis);
          setActiveSuggestedProject(project);
        }
      } else {
        setCurrentGazeTarget(prev => (prev === null ? null : null));
      }
    });

    return () => {
      unsubscribe();
      eyeTracker.pauseTracking();
    };
  }, [isEyeTrackingActive, products, recordInteraction]);

  // User explicit feedback handler (Like / Dislike / More Like This)
  const recordFeedback = useCallback((productId: string, type: ProductFeedbackType) => {
    setFeedbackMap(prev => ({ ...prev, [productId]: type }));
    const product = products.find(p => p.id === productId);
    const category = product?.category || 'Outerwear';
    
    let interactionType: InteractionType = 'FEEDBACK_LIKE';
    if (type === 'DISLIKE') {
      interactionType = 'FEEDBACK_DISLIKE';
      setRecentAdaptiveNotification(`Item suppressed. Similar silhouettes deprioritized.`);
    } else if (type === 'MORE_LIKE_THIS') {
      interactionType = 'FEEDBACK_MORE_LIKE_THIS';
      setRecentAdaptiveNotification(`Preferences updated. Prioritizing styles similar to "${product?.name}".`);
    } else {
      interactionType = 'FEEDBACK_LIKE';
      setRecentAdaptiveNotification(`Saved "${product?.name}" to your taste profile.`);
    }

    recordInteraction(interactionType, productId, category, 1000);
  }, [products, recordInteraction]);

  // Listen to RankingService hyperparameter weight updates from Research Dashboard
  const [rankingConfigVersion, setRankingConfigVersion] = useState(0);

  useEffect(() => {
    return RankingService.subscribe(() => {
      setRankingConfigVersion(v => v + 1);
    });
  }, []);

  // Compute live research-grade User Preference Profile
  const userPreferenceProfile = useMemo(() => {
    return computeUserPreferenceProfile(interactions, products, feedbackMap);
  }, [interactions, products, feedbackMap]);

  // Compute recommended products via technically defensible weighted HybridScore formula:
  // HybridScore(i) = α × CF(i) + β × CBF(i) + γ × Session(i) + δ × Popularity(i) + ε × ColdStart(i)
  const recommendedProducts: RecommendedProduct[] = useMemo(() => {
    const activeGazeId = isEyeTrackingActive ? (currentGazeTarget?.productId || null) : null;
    const ranked = RankingService.rankProducts(
      products,
      interactions,
      user?.savedPreferences || [],
      searchQuery,
      activeGazeId,
      products.length
    );

    // Sync live wishlist status
    return ranked.map(p => {
      const inWishlist = wishlistIds.has(p.id);
      return {
        ...p,
        wishlist: inWishlist,
        wishlistStatus: (inWishlist ? 'in_wishlist' : 'none') as 'in_wishlist' | 'none',
        isWishlisted: inWishlist
      };
    });
  }, [products, interactions, user?.savedPreferences, searchQuery, isEyeTrackingActive, currentGazeTarget?.productId, wishlistIds, rankingConfigVersion]);

  // Get similar products for Quick View / Complete Look
  const getSimilarProducts = useCallback((product: Product, limit = 4): RecommendedProduct[] => {
    const scored = products
      .filter(p => p.id !== product.id)
      .map(p => ({
        ...p,
        similarity: calculateFeatureSimilarity(p.featureVector, product.featureVector)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return scored.map(item => {
      const matchScore = Math.round(item.similarity * 100);
      const inWishlist = wishlistIds.has(item.id);
      return {
        ...item,
        wishlist: inWishlist,
        wishlistStatus: inWishlist ? 'in_wishlist' : 'none',
        isWishlisted: inWishlist,
        explanation: {
          matchScore,
          sessionContribution: 30,
          visualAttentionContribution: 20,
          profileContribution: 30,
          contentSimilarityContribution: 20,
          popularityContribution: 10,
          primaryReasons: [
            `High textile & cut similarity (${matchScore}%) to ${product.name}`,
            `Shares complementary ${product.style} aesthetic`
          ],
          signals: {
            styleSimilarity: matchScore,
            colorPreference: 85,
            categoryPreference: item.category === product.category ? 95 : 70,
            previousInteraction: 80,
            browsingBehavior: 85
          },
          technicalDetails: {
            wSession: 0.35,
            wGaze: 0.25,
            wProfile: 0.35,
            wCollab: 0.15,
            wContent: 0.25,
            wPopularity: 0.15,
            dotProduct: parseFloat(item.similarity.toFixed(3)),
            mmrScore: parseFloat((item.similarity * 0.95).toFixed(3)),
            diversityPenalty: 0.05
          }
        }
      } as RecommendedProduct;
    });
  }, [products, wishlistIds]);

  // Dynamic Outfit Look bundle ("Complete the Look")
  const getOutfitForProduct = useCallback((product: Product): OutfitLook => {
    return generateOutfitLook(product, products);
  }, [products]);

  // Wishlist toggle with Firestore persistence
  const toggleWishlist = (productId: string) => {
    const prod = products.find(p => p.id === productId);
    setWishlistIds(prev => {
      const next = new Set(prev);
      const isAdding = !next.has(productId);
      if (isAdding) {
        next.add(productId);
        if (isAuthenticated && user?.id && prod) {
          saveWishlistItemToFirestore(user.id, prod.id, prod.name, prod.category, prod.price).catch(console.error);
        }
      } else {
        next.delete(productId);
        if (isAuthenticated && user?.id) {
          removeWishlistItemFromFirestore(user.id, productId).catch(console.error);
        }
      }
      if (prod && isAdding) {
        recordInteraction('WISHLIST', prod.id, prod.category);
      }
      return next;
    });
  };

  // Cart operations
  const addToCart = (product: Product, size = 'M') => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id && item.size === size);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1, size }];
    });
    recordInteraction('CART', product.id, product.category);
    setIsCartDrawerOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item => item.product.id === productId ? { ...item, quantity } : item)
    );
  };

  const toggleEyeTracking = () => {
    setIsEyeTrackingActive(prev => {
      const next = !prev;
      try {
        localStorage.setItem('sasher_visual_intent_active', String(next));
      } catch {}
      if (!next) {
        eyeTracker.pauseTracking();
        setCurrentGazeTarget(null);
        setRecentAdaptiveNotification('Visual Intent paused. Recommendations reverting to baseline hybrid weights.');
      } else {
        eyeTracker.startTracking();
        setRecentAdaptiveNotification('Visual Intent activated. Real-time attention signals now adapt recommendation slates.');
      }
      return next;
    });
  };

  const setEyeTrackingActive = (active: boolean) => {
    setIsEyeTrackingActive(active);
    try {
      localStorage.setItem('sasher_visual_intent_active', String(active));
    } catch {}
    if (!active) {
      eyeTracker.pauseTracking();
      setCurrentGazeTarget(null);
      setRecentAdaptiveNotification('Visual Intent turned off. Recommendations operating on standard profile baselines.');
    } else {
      eyeTracker.startTracking();
      setRecentAdaptiveNotification('Visual Intent turned on. Attention tracking and dwell signals enabled.');
    }
  };

  const openCalibration = () => setIsCalibrationModalOpen(true);
  const closeCalibration = () => setIsCalibrationModalOpen(false);

  const completeCalibration = (score: number) => {
    setCalibrationScore(score);
    setIsCalibrated(true);
    eyeTracker.setCalibrationScore(score);
    setIsCalibrationModalOpen(false);
    if (isAuthenticated && user?.id) {
      updateCalibrationScore(score).catch(console.error);
    }
    setRecentAdaptiveNotification(`Visual calibration completed (${score}% accuracy). Tracking active.`);
  };

  const toggleGazeDebug = () => setIsGazeDebugOpen(prev => !prev);

  const resetSession = () => {
    setInteractions([]);
    setRecentAdaptiveNotification('Session memory cleared. Cold-start baseline restored.');
  };

  const simulateRoboticAttack = () => {
    setAnomalyState(prev => ({
      ...prev,
      status: 'fallback',
      anomalyScore: 0.94,
      eventsProcessed: prev.eventsProcessed + 45,
      eventVelocity: 14.8,
      suspiciousFlagsCount: prev.suspiciousFlagsCount + 1,
      fallbackActive: true,
      lastCheckTimestamp: Date.now()
    }));
    setRecentAdaptiveNotification('Unusual interaction pattern detected. Recommendation engine switched to robust fallback mode.');
  };

  const resetAnomalyState = () => {
    setAnomalyState({
      status: 'normal',
      anomalyScore: 0.08,
      eventsProcessed: 0,
      eventVelocity: 0.4,
      suspiciousFlagsCount: 0,
      fallbackActive: false,
      lastCheckTimestamp: Date.now()
    });
    setRecentAdaptiveNotification('Security state reset. Standard hybrid pipeline restored.');
  };

  const dismissAdaptiveNotification = () => setRecentAdaptiveNotification(null);

  const triggerProjectForProduct = (product: Product) => {
    const analysis = projectSuggestionService.analyzeGazedProduct(product, 1.4);
    const project = projectSuggestionService.generateProjectForProduct(product);
    setActiveGazeAnalysis(analysis);
    setActiveSuggestedProject(project);
    setIsProjectDrawerOpen(true);
    recordInteraction('EYE_GAZE', product.id, product.category, 1400, 3.5);
  };

  const addAllProjectItemsToCart = (project: SuggestedProject) => {
    setCart(prev => {
      let updated = [...prev];
      project.allProducts.forEach(prod => {
        const existing = updated.find(i => i.product.id === prod.id);
        if (existing) {
          updated = updated.map(i => i.product.id === prod.id ? { ...i, quantity: i.quantity + 1 } : i);
        } else {
          updated.push({ product: prod, quantity: 1, size: 'M' });
        }
      });
      return updated;
    });
    setIsCartDrawerOpen(true);
    setRecentAdaptiveNotification(`Complete "${project.title}" (${project.allProducts.length} items) added to bag with 15% project savings!`);
  };

  const openCheckout = () => {
    setIsCartDrawerOpen(false);
    setIsCheckoutModalOpen(true);
  };

  const closeCheckout = () => {
    setIsCheckoutModalOpen(false);
  };

  const completeOrder = (order: CompletedOrder) => {
    setCompletedOrders(prev => [order, ...prev]);
    if (isAuthenticated && user?.id) {
      saveUserOrderToFirestore(user.id, order).catch(console.error);
    }
    recordInteraction(
      'PURCHASE', 
      order.items[0]?.product.id || 'ord-01', 
      order.items[0]?.product.category || 'Outerwear'
    );
    setRecentAdaptiveNotification(`Payment authorized. Order ${order.orderNumber} placed and saved to your account.`);
  };

  const clearCart = () => {
    setCart([]);
  };

  // Sync session intent state to Firestore (debounced)
  useEffect(() => {
    if (!isAuthenticated || !user?.id || sessionIntent.totalInteractions === 0) return;
    const timer = setTimeout(() => {
      saveUserSessionToFirestore(user.id, {
        primaryCategory: sessionIntent.primaryCategory,
        confidence: sessionIntent.confidence,
        totalInteractions: sessionIntent.totalInteractions,
        trendDescription: sessionIntent.trendDescription
      }).catch(console.error);
    }, 1500);
    return () => clearTimeout(timer);
  }, [isAuthenticated, user?.id, sessionIntent.primaryCategory, sessionIntent.confidence, sessionIntent.totalInteractions, sessionIntent.trendDescription]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!recentAdaptiveNotification) return;
    const t = setTimeout(() => {
      setRecentAdaptiveNotification(null);
    }, 4500);
    return () => clearTimeout(t);
  }, [recentAdaptiveNotification]);

  // Enrich product collection with live wishlist status
  const enrichedProducts: Product[] = useMemo(() => {
    return products.map(p => {
      const inWishlist = wishlistIds.has(p.id);
      return {
        ...p,
        wishlist: inWishlist,
        wishlistStatus: (inWishlist ? 'in_wishlist' : 'none') as 'in_wishlist' | 'none',
        isWishlisted: inWishlist
      };
    });
  }, [products, wishlistIds]);

  return (
    <SasherContext.Provider
      value={{
        products: enrichedProducts,
        recommendedProducts,
        activeCategory,
        setActiveCategory,
        searchQuery,
        setSearchQuery,
        selectedProduct,
        setSelectedProduct,
        interactions,
        recordInteraction,
        sessionIntent,
        dynamicWeights,
        resetSession,
        isEyeTrackingActive,
        toggleEyeTracking,
        setEyeTrackingActive,
        isCalibrated,
        calibrationScore,
        openCalibration,
        closeCalibration,
        isCalibrationModalOpen,
        completeCalibration,
        currentGazeTarget,
        lastGazeCoordinates,
        activeSuggestedProject,
        activeGazeAnalysis,
        isProjectDrawerOpen,
        setIsProjectDrawerOpen,
        triggerProjectForProduct,
        addAllProjectItemsToCart,
        isGazeDebugOpen,
        toggleGazeDebug,
        explanationModalProduct,
        setExplanationModalProduct,
        anomalyState,
        simulateRoboticAttack,
        resetAnomalyState,
        
        // Research & Personalization Engine
        userPreferenceProfile,
        hybridWeights,
        setHybridWeights,
        recordFeedback,
        feedbackMap,
        visualIntentMode,
        setVisualIntentMode,
        isVisualIntentModalOpen,
        setIsVisualIntentModalOpen,
        genderFilter,
        setGenderFilter,
        getSimilarProducts,
        getOutfitForProduct,

        wishlistIds,
        toggleWishlist,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        isCheckoutModalOpen,
        setIsCheckoutModalOpen,
        openCheckout,
        closeCheckout,
        completedOrders,
        completeOrder,
        clearCart,
        recentAdaptiveNotification,
        dismissAdaptiveNotification
      }}
    >
      {children}
    </SasherContext.Provider>
  );
};

export const useSasher = () => {
  const context = useContext(SasherContext);
  if (!context) {
    throw new Error('useSasher must be used within a SasherProvider');
  }
  return context;
};
