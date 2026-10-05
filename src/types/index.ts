export type CategoryType = 
  | 'All'
  | 'Outerwear'
  | 'Tailoring'
  | 'Knitwear'
  | 'Tops'
  | 'Dresses'
  | 'Trousers'
  | 'Footwear'
  | 'Accessories';

export interface Product {
  id: string;
  product_id?: string;
  name: string;
  brand: string;
  category: CategoryType;
  subcategory?: string;
  articleType: string;
  price: number;
  price_inr?: number;
  originalPrice?: number;
  currency: string;
  imageUrl: string;
  imageFallbackGradient: string;
  gender: 'Unisex' | 'Men' | 'Women';
  color: string;
  season: 'Fall/Winter' | 'Spring/Summer' | 'Monsoon' | 'Festive' | 'All-Season';
  style: 'Minimalist' | 'Tailored' | 'Architectural' | 'Casual' | 'Avant-Garde' | 'Traditional' | 'Festive';
  occasion?: 'Festive' | 'Wedding' | 'Formal' | 'Casual' | 'College' | 'Evening' | 'Resort';
  description: string;
  material: string;
  fit: string;
  silhouette?: string;
  rating: number | null; // Nullable when no external dataset is connected
  reviewCount: number | null; // Nullable when no external dataset is connected
  stock: number;
  availableSizes?: string[];
  attributes?: Record<string, string | number | boolean>;
  popularityScore: number; // 0-1
  recommendationScore?: number | null;
  featureVector: {
    outerwear: number;
    tailoring: number;
    knitwear: number;
    minimalism: number;
    formal: number;
    casual: number;
    warmth: number;
    traditional?: number;
  };
  collaborativeScore?: number;
  wishlist?: boolean;
  wishlistStatus?: 'in_wishlist' | 'none' | boolean;
  isWishlisted?: boolean;
  images?: string[];
  tags?: string[];
  isColdStartItem?: boolean;
  historicalInteractionsCount?: number;
}

export type InteractionType = 
  | 'VIEW'
  | 'HOVER'
  | 'CLICK'
  | 'SEARCH'
  | 'WISHLIST'
  | 'CART'
  | 'PURCHASE'
  | 'FEEDBACK_LIKE'
  | 'FEEDBACK_DISLIKE'
  | 'FEEDBACK_MORE_LIKE_THIS'
  | 'EYE_GAZE';

export interface InteractionEvent {
  id: string;
  timestamp: number;
  type: InteractionType;
  productId: string;
  category: CategoryType;
  dwellMs?: number;
  gazeWeight?: number;
  metadata?: Record<string, unknown>;
}

export interface MatchSignalBreakdown {
  styleSimilarity: number; // 0-100
  colorPreference: number; // 0-100
  categoryPreference: number; // 0-100
  previousInteraction: number; // 0-100
  browsingBehavior: number; // 0-100
}

export interface RecommendationExplanation {
  matchScore: number; // 0-100
  sessionContribution: number; // %
  visualAttentionContribution: number; // %
  profileContribution: number; // %
  contentSimilarityContribution: number; // %
  popularityContribution: number; // %
  primaryReasons: string[];
  signals?: MatchSignalBreakdown;
  technicalDetails: {
    wSession: number;
    wGaze: number;
    wProfile: number;
    wCollab: number;
    wContent: number;
    wPopularity: number;
    dotProduct: number;
    mmrScore: number;
    diversityPenalty: number;
  };
}

export interface RecommendedProduct extends Product {
  explanation: RecommendationExplanation;
  isGazeInfluenced?: boolean;
}

export interface SessionIntentState {
  primaryCategory: CategoryType;
  primaryStyle: string;
  confidence: number; // 0-1
  categoryDistribution: Record<CategoryType, number>;
  styleDistribution: Record<string, number>;
  totalInteractions: number;
  sessionDurationSec: number;
  lastUpdated: number;
  trendDescription: string;
}

export interface DynamicWeights {
  session: number; // w1
  profile: number; // w2
  collaborative: number; // w3
  content: number; // w4
  popularity: number; // w5
  eyeGaze: number; // w6
}

export interface GazeTarget {
  productId: string;
  productName: string;
  category: CategoryType;
  dwellSeconds: number;
  dwellStart: number;
  status: 'detecting' | 'interest_confirmed';
  coordinates: { x: number; y: number };
}

export interface AnomalyDetectionState {
  status: 'normal' | 'suspicious' | 'fallback';
  anomalyScore: number; // 0 (normal) to 1 (anomaly)
  eventsProcessed: number;
  eventVelocity: number; // events per second
  suspiciousFlagsCount: number;
  fallbackActive: boolean;
  lastCheckTimestamp: number;
}

export type ProductFeedbackType = 'LIKE' | 'DISLIKE' | 'MORE_LIKE_THIS';

export interface UserPreferenceProfile {
  preferredCategories: { category: CategoryType; score: number; count: number }[];
  preferredColors: { color: string; count: number }[];
  preferredStyles: { style: string; count: number }[];
  preferredPriceRange: { min: number; max: number; average: number };
  suppressedProductIds: string[];
  boostedProductIds: string[];
  totalInteractions: number;
  lastUpdated: number;
}

export interface HybridRecommendationWeights {
  alpha: number; // User Preference Score (0 - 1)
  beta: number;  // Content Similarity (0 - 1)
  gamma: number; // Interaction Signal / Visual Intent (0 - 1)
  delta: number; // Popularity Prior (0 - 1)
}

export interface OutfitLook {
  id: string;
  title: string;
  anchorProductId: string;
  items: Product[];
  description: string;
  totalPrice: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
}

export interface ResearchMetricSet {
  precision10: number;
  recall10: number;
  map10: number;
  ndcg10: number;
  mrr: number;
  latencyMs: number;
  pValueVsBaseline: number;
}

export interface ModelComparisonData {
  modelName: string;
  precision10: number;
  recall10: number;
  map10: number;
  ndcg10: number;
  latencyMs: number;
  isHighlighted?: boolean;
  description: string;
}

export interface AblationStudyData {
  configuration: string;
  ndcg10: number;
  map10: number;
  deltaPercent: number;
  description: string;
}

export type PaymentMethodType = 'CARD' | 'UPI' | 'NET_BANKING' | 'BNPL' | 'APPLE_PAY';

export interface CompletedOrder {
  id: string;
  orderNumber: string;
  timestamp: number;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  paymentMethod: PaymentMethodType;
  paymentReference: string;
  shippingAddress: {
    fullName: string;
    email: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  journalHash: string;
}

// -------------------------------------------------------------
// RESEARCH ARCHITECTURE & COLD-START MITIGATION SYSTEM TYPES
// -------------------------------------------------------------

export type UserColdStartStatus = 'NEW_USER' | 'WARM_USER' | 'ACTIVE_USER';
export type ItemColdStartStatus = 'NEW_ITEM' | 'WARM_ITEM';
export type SessionColdStartStatus = 'COLD_SESSION' | 'ACTIVE_SESSION';

export interface ColdStartClassification {
  userStatus: UserColdStartStatus;
  itemStatus: ItemColdStartStatus;
  sessionStatus: SessionColdStartStatus;
  userInteractionCount: number;
  itemInteractionCount: number;
  sessionEventCount: number;
  mitigationStrategyApplied: string;
}

export interface RecommendationEngineConfig {
  CF_WEIGHT: number;          // α: Collaborative Filtering weight
  CBF_WEIGHT: number;         // β: Content-Based Filtering weight
  SESSION_WEIGHT: number;     // γ: Session-Aware Intent weight
  POPULARITY_WEIGHT: number;  // δ: Popularity Prior weight
  COLD_START_BOOST: number;   // ε: Cold-Start Prior weight
  MMR_DIVERSITY_LAMBDA: number; // λ for Maximal Marginal Relevance (0-1)
  SESSION_DECAY_LAMBDA: number; // Exponential time-decay rate for session events
  NEW_USER_THRESHOLD: number;   // Threshold < N interactions for cold-start user
  NEW_ITEM_THRESHOLD: number;   // Threshold < N interactions for cold-start item
  TOP_K: number;                // Slate size (e.g. 10)
}

export interface CFModelArtifacts {
  latentDimensions: number;
  userEmbeddings: Record<string, number[]>;
  itemEmbeddings: Record<string, number[]>;
  globalMean: number;
  userBiases: Record<string, number>;
  itemBiases: Record<string, number>;
  trainedEpochs: number;
  rmse: number;
}

export interface SessionContextRepresentation {
  sessionId: string;
  userId?: string;
  sessionVector: number[];
  inferredCategoryIntent: CategoryType;
  inferredStyleIntent: string;
  inferredColorIntent?: string;
  intentConfidence: number;
  eventSequenceCount: number;
  latestEventTimestamp: number;
  timeDecayApplied: boolean;
  visualIntentActive: boolean;
  visualIntentScore: number;
  recentInteractions: InteractionEvent[];
}

export interface DetailedRecommendationScore {
  productId: string;
  cfScore: number;
  cbfScore: number;
  sessionScore: number;
  popularityScore: number;
  coldStartScore: number;
  diversityPenalty: number;
  hybridScore: number;
  finalRankScore: number;
  coldStartClassification: ColdStartClassification;
  explanationText: string;
  matchedFeatures: string[];
}

export type ExperimentModelType = 
  | 'EXPERIMENT_A_POPULARITY'
  | 'EXPERIMENT_B_CONTENT_BASED'
  | 'EXPERIMENT_C_COLLABORATIVE'
  | 'EXPERIMENT_D_STATIC_HYBRID'
  | 'EXPERIMENT_E_SESSION_HYBRID'
  | 'EXPERIMENT_F_SESSION_COLD_START_HYBRID';

export interface EvaluationBenchmarkMetrics {
  precisionAt5: number;
  precisionAt10: number;
  precisionAt20: number;
  recallAt5: number;
  recallAt10: number;
  recallAt20: number;
  ndcgAt5: number;
  ndcgAt10: number;
  ndcgAt20: number;
  mrr: number;
  hitRateAt10: number;
  avgLatencyMs: number;
  sampleSize: number;
  timestamp: string;
}

export interface ModelAblationResult {
  experimentId: ExperimentModelType;
  modelName: string;
  description: string;
  overall: EvaluationBenchmarkMetrics;
  coldUserSubset: EvaluationBenchmarkMetrics;
  warmUserSubset: EvaluationBenchmarkMetrics;
  coldItemSubset: EvaluationBenchmarkMetrics;
  newSessionSubset: EvaluationBenchmarkMetrics;
  isProposedArchitecture?: boolean;
}


