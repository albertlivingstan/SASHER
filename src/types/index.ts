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
  originalPrice?: number;
  currency: string;
  imageUrl: string;
  imageFallbackGradient: string;
  gender: 'Unisex' | 'Men' | 'Women';
  color: string;
  season: 'Fall/Winter' | 'Spring/Summer' | 'All-Season';
  style: 'Minimalist' | 'Tailored' | 'Architectural' | 'Casual' | 'Avant-Garde';
  description: string;
  material: string;
  fit: string;
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
  };
  collaborativeScore?: number;
  wishlist?: boolean;
  wishlistStatus?: 'in_wishlist' | 'none' | boolean;
  isWishlisted?: boolean;
}

export type InteractionType = 
  | 'VIEW'
  | 'HOVER'
  | 'EYE_GAZE'
  | 'WISHLIST'
  | 'CART'
  | 'PURCHASE';

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

export interface RecommendationExplanation {
  matchScore: number; // 0-100
  sessionContribution: number; // %
  visualAttentionContribution: number; // %
  profileContribution: number; // %
  contentSimilarityContribution: number; // %
  popularityContribution: number; // %
  primaryReasons: string[];
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

