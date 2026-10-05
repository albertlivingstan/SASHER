import { CategoryType, Product } from './index';

export type BodyShapeType = 'Hourglass' | 'Rectangle' | 'Inverted Triangle' | 'Pear' | 'Athletic' | 'Oval';
export type SkinUndertoneType = 'Warm' | 'Cool' | 'Neutral' | 'Olive';
export type FitPreferenceType = 'Slim' | 'Regular' | 'Oversized' | 'Relaxed';
export type ComfortPreferenceType = 'Maximum Comfort' | 'Balanced' | 'Structured Tailored';
export type OccasionType = 'College' | 'Office' | 'Wedding' | 'Party' | 'Casual' | 'Date' | 'Gym' | 'Travel';
export type RetailerPlatform = 'Myntra' | 'AJIO' | 'Amazon India' | 'Tata CLiQ' | 'Meesho' | 'Boutique Atelier';

export interface AdaptiveStyleProfile {
  id: string;
  name: string;
  gender: 'Men' | 'Women' | 'Unisex' | 'All';
  ageRange: string; // '18-24' | '25-34' | '35-44' | '45+'
  heightCm: number;
  measurements: {
    chest: number; // in inches
    waist: number;
    hips: number;
  };
  bodyShape: BodyShapeType;
  skinUndertone?: SkinUndertoneType;
  preferredColors: string[];
  preferredStyles: string[];
  budgetMin: number;
  budgetMax: number;
  targetBudget: number; // e.g. 2000
  likedBrands: string[];
  dislikedBrands: string[];
  comfortPreference: ComfortPreferenceType;
  fitPreference: FitPreferenceType;
  occasions: OccasionType[];
  location: string;
  climate: 'Humid Tropical' | 'Hot & Dry' | 'Moderate Pleasant' | 'Temperate / Cold';
  styleArchetype: string; // e.g. "Minimal Streetwear", "Old Money Classic"
  
  // Real-Time Adaptive Weights
  adaptiveWeights: {
    styleSimilarity: number;    // default 0.25
    colorPreference: number;    // default 0.20
    budgetMatch: number;        // default 0.15
    occasionMatch: number;      // default 0.15
    fitPreference: number;      // default 0.10
    previousInteraction: number;// default 0.10
    popularity: number;         // default 0.05
  };
  
  // Dynamic learned attribute biases (learned from likes/skips/views)
  learnedColorBiases: Record<string, number>; // e.g. { 'Black': 2.4, 'Navy': 1.8 }
  learnedStyleBiases: Record<string, number>; // e.g. { 'Streetwear': 3.1 }
  learnedFitBiases: Record<string, number>;   // e.g. { 'Oversized': 2.5 }
  learnedBrandBiases: Record<string, number>; // e.g. { 'Uniqlo': 1.5, 'Zara': -1.2 }
  
  // Cold-Start Journey
  coldStartStage: 1 | 2 | 3 | 4; // 1: Content-Based, 2: Content+Behavior, 3: Hybrid, 4: Session-Based
  totalInteractionCount: number;
  swipeCount: number;
  lastUpdated: number;
}

export interface WardrobeItem {
  id: string;
  name: string;
  category: 'Shirt' | 'Pants' | 'Shoes' | 'Jacket' | 'Accessories' | 'Traditional' | 'Dress';
  color: string;
  pattern: 'Solid' | 'Striped' | 'Checked' | 'Printed' | 'Embroidered';
  style: string;
  fit: FitPreferenceType;
  imageUrl: string;
  brand?: string;
  occasion: OccasionType;
  dateAdded: string;
  wearCount: number;
  material?: string;
  isOwned: boolean;
}

export interface OutfitLookItem {
  item: Product | WardrobeItem;
  role: 'Top' | 'Bottom' | 'Footwear' | 'Layer' | 'Accessory';
  isOwned: boolean;
  price: number;
  retailer?: RetailerPlatform;
  retailerUrl?: string;
}

export interface CuratedOutfitLook {
  id: string;
  title: string;
  occasion: OccasionType;
  matchScore: number;
  totalCost: number;
  remainingBudget: number;
  targetBudget: number;
  explanation: string;
  items: OutfitLookItem[];
  stylistTip: string;
  weatherSuitability: string;
}

export interface DislikeFeedbackSubmission {
  productId: string;
  productName: string;
  reason: 'too_expensive' | 'bad_color' | 'bad_fit' | 'not_my_style' | 'already_own' | 'poor_quality' | 'other';
  reasonLabel: string;
  notes?: string;
  timestamp: number;
}

export interface WeatherContextInfo {
  city: string;
  temperatureC: number;
  condition: 'Sunny' | 'Humid & Warm' | 'Rain Showers' | 'Pleasant Breeze' | 'Cool Evening';
  humidityPercent: number;
  rainProbability: number;
  clothingAdvice: string;
  recommendedFabric: string;
  recommendedLayering: string;
}

export interface OfflineEvaluationMetricRow {
  modelName: string;
  precisionAtK: number;
  recallAtK: number;
  f1AtK: number;
  ndcgAtK: number;
  mapAtK: number;
  hitRate: number;
  latencyMs: number;
  coldStartPrecision: number;
  description: string;
}
