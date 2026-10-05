import { Product, CategoryType } from '../../types';

export type SessionStage = 0 | 1 | 2 | 3;

export type SessionEventType = 
  | 'session_start'
  | 'product_view'
  | 'product_click'
  | 'product_open'
  | 'category_view'
  | 'search'
  | 'filter'
  | 'add_to_cart'
  | 'wishlist_add'
  | 'dwell_time'
  | 'recommendation_click';

export interface SessionEvent {
  id: string;
  sessionId: string;
  eventType: SessionEventType;
  productId?: string;
  category?: CategoryType;
  dwellMs?: number;
  searchQuery?: string;
  timestamp: number;
}

export interface StructuredSessionState {
  sessionId: string;
  interactionCount: number;
  stage: SessionStage;
  stageDescription: string;
  recentItems: string[]; // product IDs
  recentCategories: CategoryType[];
  categoryDistribution: Record<CategoryType, number>;
  recentInteractionSequence: SessionEvent[];
  averageDwellTimeMs: number;
  lastInteractionTime: number;
  sessionIntent: {
    primaryCategory: CategoryType;
    dominantStyle?: string;
    confidence: number; // 0 to 1 calculated from concentration
    inferredKeywords: string[];
    evidenceCount: number;
  };
  dwellSignalActive: boolean;
  totalDwellMs: number;
}

export interface AdaptiveWeights {
  alpha_session: number;     // α(n): Session dynamics
  beta_content: number;      // β(n): Content similarity
  gamma_collab: number;      // γ(n): Collaborative/co-occurrence
  delta_popularity: number;  // δ(n): Popularity prior
}

export type FusionStrategy = 
  | 'static_50_50'
  | 'static_weighted'
  | 'linear_adaptive'
  | 'sigmoid_adaptive'
  | 'sasher_adaptive';

export type RecommendationModelType = 
  | 'popularity'
  | 'content_based'
  | 'collaborative'
  | 'static_hybrid'
  | 'session_based'
  | 'sasher_adaptive';

export interface ComponentScores {
  s_session: number;
  s_content: number;
  s_collab: number;
  s_popularity: number;
  composite_score: number;
}

export interface ScoredRecommendationItem {
  product: Product;
  score: number; // 0 to 1
  matchPercentage: number; // 0 to 100
  model: RecommendationModelType;
  componentScores: ComponentScores;
  weightsApplied: AdaptiveWeights;
  explanation: {
    primaryReason: string;
    supportingReasons: string[];
    dominantSignal: 'session' | 'content' | 'collaborative' | 'popularity';
    signalContributions: {
      session: number;     // percentage (0-100)
      content: number;     // percentage (0-100)
      collaborative: number; // percentage (0-100)
      popularity: number;  // percentage (0-100)
    };
  };
}

export interface AblationConfig {
  useAdaptiveWeighting: boolean;
  useSessionIntent: boolean;
  useDwellSignal: boolean;
  useContentModel: boolean;
  useCollaborativeModel: boolean;
  usePopularityPrior: boolean;
}

export interface BenchmarkMetrics {
  precision5: number;
  precision10: number;
  recall5: number;
  recall10: number;
  ndcg5: number;
  ndcg10: number;
  mrr: number;
  hitRate: number;
  latencyMs: number;
  sampleCount: number;
}

export interface ColdStartGroupResult {
  group: 'Group A (0 interactions)' | 'Group B (1 interaction)' | 'Group C (2-4 interactions)' | 'Group D (5+ interactions)';
  stage: SessionStage;
  interactionRange: string;
  sampleSize: number;
  baselines: {
    popularity: BenchmarkMetrics;
    contentBased: BenchmarkMetrics;
    collaborative: BenchmarkMetrics;
    staticHybrid: BenchmarkMetrics;
    sessionBased: BenchmarkMetrics;
    sasher: BenchmarkMetrics;
  };
  sasherGainVsStaticPercent: number;
}

export interface AblationStudyResult {
  configuration: string;
  ndcg10: number;
  precision10: number;
  recall10: number;
  deltaNdcgPercent: number;
  activeFeatures: string[];
  description: string;
}

export interface PairedSignificanceResult {
  metric: 'ndcg10' | 'precision10';
  modelA: RecommendationModelType;
  modelB: RecommendationModelType;
  sampleSize: number;
  meanA: number;
  meanB: number;
  meanDiff: number;
  stdDiff: number;
  standardError: number;
  tStatistic: number;
  degreesOfFreedom: number;
  pValue: number;
  isStatisticallySignificant: boolean;
  notes: string;
}

export interface CompleteExperimentReport {
  timestamp: string;
  randomSeed: number;
  datasetInfo: {
    totalProducts: number;
    totalEvaluationCases: number;
    evaluationSource: string;
  };
  overallBaselines: Record<RecommendationModelType, BenchmarkMetrics>;
  coldStartMaturityGroups: ColdStartGroupResult[];
  ablationStudy: AblationStudyResult[];
  significanceTest: PairedSignificanceResult;
  researchQuestions: {
    rq1: {
      question: string;
      answer: string;
      empiricalEvidence: string;
    };
    rq2: {
      question: string;
      answer: string;
      empiricalEvidence: string;
    };
    rq3: {
      question: string;
      answer: string;
      empiricalEvidence: string;
    };
  };
}
