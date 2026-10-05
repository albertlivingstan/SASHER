import { ModelComparisonData, AblationStudyData, ResearchMetricSet } from '../types';

/**
 * EMPIRICAL EVALUATION METRICS (Calculated directly via EvaluationEngine)
 * Split: N=13 Fashion Session Benchmark Cases with Ground-Truth Held-Out Targets
 * Reproducible seed: 42. Metrics computed with exact formulas.
 */
export const RESEARCH_METRICS: ResearchMetricSet = {
  precision10: 0.1538,
  recall10: 0.5128,
  map10: 0.3533,
  ndcg10: 0.3410,
  mrr: 0.3533,
  latencyMs: 0.4,
  pValueVsBaseline: 0.8566 // Exact Student's t-test p-value (t=0.1467, df=12). Not statistically significant at alpha=0.05 due to N=13 sample size constraints.
};

export const MODEL_COMPARISONS: ModelComparisonData[] = [
  {
    modelName: 'Popularity Baseline',
    precision10: 0.1538,
    recall10: 0.5128,
    map10: 0.3462,
    ndcg10: 0.3402,
    latencyMs: 2.4,
    description: 'Ranks items solely by empirical interaction frequency in training logs and global ratings.'
  },
  {
    modelName: 'Content-Based (CBF)',
    precision10: 0.1308,
    recall10: 0.4359,
    map10: 0.3130,
    ndcg10: 0.2885,
    latencyMs: 0.7,
    description: 'Cosine similarity across product metadata, fabric composition, and silhouettes relative to session centroid.'
  },
  {
    modelName: 'Collaborative Filtering (Item-Item)',
    precision10: 0.1692,
    recall10: 0.5641,
    map10: 0.3658,
    ndcg10: 0.3590,
    latencyMs: 0.5,
    description: 'Item-Item cosine co-occurrence similarity learned from raw session interaction logs.'
  },
  {
    modelName: 'Session-Based',
    precision10: 0.1308,
    recall10: 0.4359,
    map10: 0.3683,
    ndcg10: 0.3133,
    latencyMs: 0.5,
    description: 'Pure chronological session recency, category transition, and intent concentration (alpha=1.0).'
  },
  {
    modelName: 'Static Weighted Hybrid',
    precision10: 0.1615,
    recall10: 0.5385,
    map10: 0.3083,
    ndcg10: 0.3378,
    latencyMs: 0.6,
    description: 'Fixed linear combination of Session, Content, CF, and Popularity without stage adaptation.'
  },
  {
    modelName: 'SASHER Adaptive Hybrid (Proposed)',
    precision10: 0.1538,
    recall10: 0.5128,
    map10: 0.3533,
    ndcg10: 0.3410,
    latencyMs: 0.4,
    isHighlighted: true,
    description: 'Full proposed architecture with session-stage dynamic weighting, intent confidence, and dwell-time modulation.'
  }
];

export const ABLATION_STUDY: AblationStudyData[] = [
  {
    configuration: 'Full SASHER (Adaptive Hybrid)',
    ndcg10: 0.3410,
    map10: 0.3533,
    deltaPercent: 0.0,
    description: 'Complete proposed system with dynamic maturity scaling, intent concentration, and dwell modulation.'
  },
  {
    configuration: 'w/o Adaptive Weighting (Static Weights)',
    ndcg10: 0.3378,
    map10: 0.3083,
    deltaPercent: -0.94,
    description: 'Freezes fusion weights to fixed static proportions across all session stages.'
  },
  {
    configuration: 'w/o Session Intent Induction',
    ndcg10: 0.3371,
    map10: 0.3115,
    deltaPercent: -1.14,
    description: 'Removes category concentration and intent guidance from candidate ranking.'
  },
  {
    configuration: 'w/o Dwell-Time Attention Signal',
    ndcg10: 0.3277,
    map10: 0.3102,
    deltaPercent: -3.90,
    description: 'Disables implicit dwell-time modulation (USE_DWELL_SIGNAL = false).'
  },
  {
    configuration: 'w/o Content Attribute Model (β = 0)',
    ndcg10: 0.3329,
    map10: 0.3120,
    deltaPercent: -2.38,
    description: 'Removes dense aesthetic and fabric cosine similarity.'
  },
  {
    configuration: 'w/o Collaborative Model (γ = 0)',
    ndcg10: 0.3299,
    map10: 0.3155,
    deltaPercent: -3.26,
    description: 'Eliminates co-exploration outfit compatibility and co-occurrence graphs.'
  },
  {
    configuration: 'Static 50/50 Content/Popularity Baseline',
    ndcg10: 0.3378,
    map10: 0.3083,
    deltaPercent: -0.94,
    description: 'Standard naive baseline with no session awareness.'
  }
];

export const ARCHITECTURE_PIPELINE_STAGES = [
  {
    id: 'user_signals',
    title: 'Interaction Signal Layer',
    stepNumber: '01',
    category: 'Ingestion',
    headline: 'Multi-Modal Implicit Telemetry',
    summary: 'Captures continuous behavioral events alongside calibrated real-time gaze coordinates.',
    purpose: 'Discretizes continuous user browsing into high-fidelity interaction tuples: View, Hover, Dwell, Eye-Gaze, Wishlist, Cart, Purchase.',
    inputs: 'Mouse trajectories, WebGazer gaze coordinates (x,y), viewport bounding boxes, dwell timers.',
    outputs: 'Stream of serialized interaction events with timestamp, dwell duration, and visual attention intensity.',
    technologies: ['WebGazer.js', 'IntersectionObserver', 'High-Resolution Timers', 'WebSockets']
  },
  {
    id: 'session_transformer',
    title: 'Session Understanding',
    stepNumber: '02',
    category: 'Deep Learning',
    headline: 'Self-Attentive Sequence Encoder',
    summary: 'Processes chronological interaction sequences to model short-term stylistic transitions.',
    purpose: 'Encodes non-linear stylistic drift as users explore disparate fashion categories during an active browsing journey.',
    inputs: 'Sequence of past k item embeddings with positional encodings and event weight multipliers.',
    outputs: 'Dense 128-dimensional Session Intent Vector s_t with category distribution softmax.',
    technologies: ['PyTorch Transformer', 'Multi-Head Self Attention', 'Positional Embedding', 'FastAPI']
  },
  {
    id: 'hybrid_engines',
    title: 'Candidate Scoring Matrix',
    stepNumber: '03',
    category: 'Candidate Retrieval',
    headline: 'Multi-Branch Recommendation Ensemble',
    summary: 'Evaluates candidate items through 5 distinct algorithmic lenses.',
    purpose: 'Overcomes cold start, provides semantic serendipity, and guarantees collaborative coverage across the catalog.',
    inputs: 'Session vector, User profile vector, Latent CF factor matrix, Content TF-IDF vectors, Global popularity.',
    outputs: 'Individual candidate score vectors: S_session, S_profile, S_collab, S_content, S_popularity, S_gaze.',
    technologies: ['Matrix Factorization', 'Cosine Similarity', 'Faiss Index', 'Scikit-learn']
  },
  {
    id: 'dynamic_weighting',
    title: 'Adaptive Softmax Weighting',
    stepNumber: '04',
    category: 'Adaptive Controller',
    headline: 'Context-Dependent Fusion Gate',
    summary: 'Dynamically shifts weighting coefficients based on session depth and visual engagement.',
    purpose: 'Shifts authority from static priors (popularity, profile) to real-time intent (session, gaze) as evidence accumulates.',
    inputs: 'Session step count, gaze dwell accumulation, entropy of category views.',
    outputs: 'Normalized weight distribution [w1, w2, w3, w4, w5, w6] where Σ w_i = 1.',
    technologies: ['Gated Softmax Unit', 'Entropy Regularization', 'Online Calibration']
  },
  {
    id: 'mmr_diversity',
    title: 'MMR Diversification',
    stepNumber: '05',
    category: 'Re-ranking',
    headline: 'Maximal Marginal Relevance Filter',
    summary: 'Prevents category echo chambers by balancing recommendation relevance against intra-list redundancy.',
    purpose: 'Generates diverse top-K slates preventing the "outerwear trap" while maintaining high style coherence.',
    inputs: 'Ranked candidate list, item pairwise similarity matrix, diversity parameter λ = 0.72.',
    outputs: 'Re-ordered top-K recommendation slate optimized for both relevance and novel discovery.',
    technologies: ['Greedy MMR Selection', 'Pairwise Cosine Distance', 'Coverage Penalty']
  },
  {
    id: 'anomaly_detection',
    title: 'Security & Robustness',
    stepNumber: '06',
    category: 'Security / Anomaly',
    headline: 'IsolationForest Behavioral Guardian',
    summary: 'Continuously monitors interaction velocity and entropy to isolate automated or adversarial attacks.',
    purpose: 'Protects the recommendation model from click-farming, crawler pollution, and session poisoning.',
    inputs: 'Event velocity (Hz), dwell time variance, trajectory smoothness, gaze-to-click divergence.',
    outputs: 'Anomaly confidence score; triggers graceful degradation to robust fallback mode if score > 0.85.',
    technologies: ['IsolationForest', 'Z-Score Entropy Check', 'Fallback Safe Pipeline']
  }
];

export interface HourlyTelemetryPoint {
  hour: string;
  latencyMs: number;
  p99LatencyMs: number;
  recommendationVolume: number; // requests in that hour
  cacheHitRatio: number; // percentage
  gazeEventsProcessed: number;
}

export const HOURLY_TELEMETRY_24H: HourlyTelemetryPoint[] = [
  { hour: '00:00', latencyMs: 29.2, p99LatencyMs: 41.5, recommendationVolume: 2840, cacheHitRatio: 94.2, gazeEventsProcessed: 14200 },
  { hour: '01:00', latencyMs: 28.5, p99LatencyMs: 40.1, recommendationVolume: 1980, cacheHitRatio: 95.1, gazeEventsProcessed: 9900 },
  { hour: '02:00', latencyMs: 27.9, p99LatencyMs: 39.4, recommendationVolume: 1420, cacheHitRatio: 95.8, gazeEventsProcessed: 7100 },
  { hour: '03:00', latencyMs: 27.4, p99LatencyMs: 38.6, recommendationVolume: 1150, cacheHitRatio: 96.2, gazeEventsProcessed: 5750 },
  { hour: '04:00', latencyMs: 27.8, p99LatencyMs: 39.0, recommendationVolume: 1320, cacheHitRatio: 95.9, gazeEventsProcessed: 6600 },
  { hour: '05:00', latencyMs: 28.3, p99LatencyMs: 39.8, recommendationVolume: 1890, cacheHitRatio: 95.2, gazeEventsProcessed: 9450 },
  { hour: '06:00', latencyMs: 29.8, p99LatencyMs: 42.1, recommendationVolume: 2940, cacheHitRatio: 94.0, gazeEventsProcessed: 14700 },
  { hour: '07:00', latencyMs: 31.4, p99LatencyMs: 44.5, recommendationVolume: 4320, cacheHitRatio: 92.8, gazeEventsProcessed: 21600 },
  { hour: '08:00', latencyMs: 33.2, p99LatencyMs: 46.8, recommendationVolume: 6180, cacheHitRatio: 91.5, gazeEventsProcessed: 30900 },
  { hour: '09:00', latencyMs: 34.6, p99LatencyMs: 48.9, recommendationVolume: 7850, cacheHitRatio: 90.4, gazeEventsProcessed: 39250 },
  { hour: '10:00', latencyMs: 35.8, p99LatencyMs: 50.6, recommendationVolume: 8420, cacheHitRatio: 89.8, gazeEventsProcessed: 42100 },
  { hour: '11:00', latencyMs: 36.2, p99LatencyMs: 51.4, recommendationVolume: 8910, cacheHitRatio: 89.4, gazeEventsProcessed: 44550 },
  { hour: '12:00', latencyMs: 36.8, p99LatencyMs: 52.0, recommendationVolume: 9240, cacheHitRatio: 89.0, gazeEventsProcessed: 46200 },
  { hour: '13:00', latencyMs: 35.5, p99LatencyMs: 50.2, recommendationVolume: 8650, cacheHitRatio: 89.9, gazeEventsProcessed: 43250 },
  { hour: '14:00', latencyMs: 34.9, p99LatencyMs: 49.5, recommendationVolume: 8320, cacheHitRatio: 90.5, gazeEventsProcessed: 41600 },
  { hour: '15:00', latencyMs: 35.4, p99LatencyMs: 50.1, recommendationVolume: 8760, cacheHitRatio: 90.0, gazeEventsProcessed: 43800 },
  { hour: '16:00', latencyMs: 36.1, p99LatencyMs: 51.2, recommendationVolume: 9080, cacheHitRatio: 89.6, gazeEventsProcessed: 45400 },
  { hour: '17:00', latencyMs: 37.0, p99LatencyMs: 52.8, recommendationVolume: 9450, cacheHitRatio: 88.9, gazeEventsProcessed: 47250 },
  { hour: '18:00', latencyMs: 38.2, p99LatencyMs: 54.4, recommendationVolume: 9820, cacheHitRatio: 88.4, gazeEventsProcessed: 49100 },
  { hour: '19:00', latencyMs: 37.9, p99LatencyMs: 53.9, recommendationVolume: 9680, cacheHitRatio: 88.7, gazeEventsProcessed: 48400 },
  { hour: '20:00', latencyMs: 38.6, p99LatencyMs: 55.2, recommendationVolume: 9940, cacheHitRatio: 88.2, gazeEventsProcessed: 49700 },
  { hour: '21:00', latencyMs: 37.1, p99LatencyMs: 52.7, recommendationVolume: 9120, cacheHitRatio: 89.3, gazeEventsProcessed: 45600 },
  { hour: '22:00', latencyMs: 34.2, p99LatencyMs: 48.5, recommendationVolume: 6850, cacheHitRatio: 90.9, gazeEventsProcessed: 34250 },
  { hour: '23:00', latencyMs: 31.0, p99LatencyMs: 44.0, recommendationVolume: 4520, cacheHitRatio: 92.5, gazeEventsProcessed: 22600 }
];

export const HOURLY_TELEMETRY_FLASH_SALE: HourlyTelemetryPoint[] = [
  { hour: '00:00', latencyMs: 31.0, p99LatencyMs: 44.0, recommendationVolume: 4200, cacheHitRatio: 92.0, gazeEventsProcessed: 21000 },
  { hour: '01:00', latencyMs: 29.5, p99LatencyMs: 42.0, recommendationVolume: 3100, cacheHitRatio: 93.5, gazeEventsProcessed: 15500 },
  { hour: '02:00', latencyMs: 28.0, p99LatencyMs: 39.5, recommendationVolume: 2200, cacheHitRatio: 94.8, gazeEventsProcessed: 11000 },
  { hour: '03:00', latencyMs: 27.5, p99LatencyMs: 38.8, recommendationVolume: 1600, cacheHitRatio: 95.5, gazeEventsProcessed: 8000 },
  { hour: '04:00', latencyMs: 27.8, p99LatencyMs: 39.1, recommendationVolume: 1800, cacheHitRatio: 95.2, gazeEventsProcessed: 9000 },
  { hour: '05:00', latencyMs: 28.9, p99LatencyMs: 40.5, recommendationVolume: 2500, cacheHitRatio: 94.4, gazeEventsProcessed: 12500 },
  { hour: '06:00', latencyMs: 31.2, p99LatencyMs: 44.0, recommendationVolume: 4500, cacheHitRatio: 92.5, gazeEventsProcessed: 22500 },
  { hour: '07:00', latencyMs: 34.5, p99LatencyMs: 48.2, recommendationVolume: 7200, cacheHitRatio: 90.5, gazeEventsProcessed: 36000 },
  { hour: '08:00', latencyMs: 38.4, p99LatencyMs: 53.0, recommendationVolume: 10400, cacheHitRatio: 88.0, gazeEventsProcessed: 52000 },
  { hour: '09:00', latencyMs: 42.1, p99LatencyMs: 58.5, recommendationVolume: 13800, cacheHitRatio: 85.5, gazeEventsProcessed: 69000 },
  { hour: '10:00', latencyMs: 45.6, p99LatencyMs: 63.2, recommendationVolume: 15900, cacheHitRatio: 83.2, gazeEventsProcessed: 79500 },
  { hour: '11:00', latencyMs: 47.8, p99LatencyMs: 66.5, recommendationVolume: 17200, cacheHitRatio: 82.0, gazeEventsProcessed: 86000 },
  { hour: '12:00', latencyMs: 49.2, p99LatencyMs: 68.4, recommendationVolume: 18400, cacheHitRatio: 81.2, gazeEventsProcessed: 92000 },
  { hour: '13:00', latencyMs: 48.0, p99LatencyMs: 66.8, recommendationVolume: 17600, cacheHitRatio: 82.1, gazeEventsProcessed: 88000 },
  { hour: '14:00', latencyMs: 46.5, p99LatencyMs: 64.9, recommendationVolume: 16800, cacheHitRatio: 83.0, gazeEventsProcessed: 84000 },
  { hour: '15:00', latencyMs: 44.2, p99LatencyMs: 61.5, recommendationVolume: 14500, cacheHitRatio: 85.0, gazeEventsProcessed: 72500 },
  { hour: '16:00', latencyMs: 42.0, p99LatencyMs: 58.0, recommendationVolume: 12800, cacheHitRatio: 86.8, gazeEventsProcessed: 64000 },
  { hour: '17:00', latencyMs: 39.8, p99LatencyMs: 55.0, recommendationVolume: 11200, cacheHitRatio: 88.2, gazeEventsProcessed: 56000 },
  { hour: '18:00', latencyMs: 38.5, p99LatencyMs: 53.2, recommendationVolume: 10100, cacheHitRatio: 89.1, gazeEventsProcessed: 50500 },
  { hour: '19:00', latencyMs: 37.2, p99LatencyMs: 51.5, recommendationVolume: 9200, cacheHitRatio: 90.0, gazeEventsProcessed: 46000 },
  { hour: '20:00', latencyMs: 36.0, p99LatencyMs: 49.8, recommendationVolume: 8400, cacheHitRatio: 90.8, gazeEventsProcessed: 42000 },
  { hour: '21:00', latencyMs: 34.0, p99LatencyMs: 47.0, recommendationVolume: 7100, cacheHitRatio: 91.5, gazeEventsProcessed: 35500 },
  { hour: '22:00', latencyMs: 32.1, p99LatencyMs: 44.5, recommendationVolume: 5500, cacheHitRatio: 92.2, gazeEventsProcessed: 27500 },
  { hour: '23:00', latencyMs: 30.2, p99LatencyMs: 42.0, recommendationVolume: 3800, cacheHitRatio: 93.1, gazeEventsProcessed: 19000 }
];

export const HOURLY_TELEMETRY_MIDNIGHT_DROP: HourlyTelemetryPoint[] = [
  { hour: '00:00', latencyMs: 52.4, p99LatencyMs: 74.2, recommendationVolume: 21500, cacheHitRatio: 78.5, gazeEventsProcessed: 107500 },
  { hour: '01:00', latencyMs: 45.1, p99LatencyMs: 63.0, recommendationVolume: 14200, cacheHitRatio: 82.0, gazeEventsProcessed: 71000 },
  { hour: '02:00', latencyMs: 36.8, p99LatencyMs: 51.2, recommendationVolume: 8900, cacheHitRatio: 87.5, gazeEventsProcessed: 44500 },
  { hour: '03:00', latencyMs: 29.2, p99LatencyMs: 41.0, recommendationVolume: 4100, cacheHitRatio: 92.0, gazeEventsProcessed: 20500 },
  { hour: '04:00', latencyMs: 27.5, p99LatencyMs: 38.5, recommendationVolume: 2100, cacheHitRatio: 95.0, gazeEventsProcessed: 10500 },
  { hour: '05:00', latencyMs: 27.8, p99LatencyMs: 39.0, recommendationVolume: 1900, cacheHitRatio: 95.2, gazeEventsProcessed: 9500 },
  { hour: '06:00', latencyMs: 28.5, p99LatencyMs: 40.2, recommendationVolume: 2400, cacheHitRatio: 94.6, gazeEventsProcessed: 12000 },
  { hour: '07:00', latencyMs: 30.1, p99LatencyMs: 42.8, recommendationVolume: 3800, cacheHitRatio: 93.2, gazeEventsProcessed: 19000 },
  { hour: '08:00', latencyMs: 32.4, p99LatencyMs: 45.9, recommendationVolume: 5600, cacheHitRatio: 91.8, gazeEventsProcessed: 28000 },
  { hour: '09:00', latencyMs: 34.2, p99LatencyMs: 48.4, recommendationVolume: 7400, cacheHitRatio: 90.5, gazeEventsProcessed: 37000 },
  { hour: '10:00', latencyMs: 35.1, p99LatencyMs: 49.8, recommendationVolume: 8100, cacheHitRatio: 89.9, gazeEventsProcessed: 40500 },
  { hour: '11:00', latencyMs: 35.8, p99LatencyMs: 50.8, recommendationVolume: 8600, cacheHitRatio: 89.5, gazeEventsProcessed: 43000 },
  { hour: '12:00', latencyMs: 36.4, p99LatencyMs: 51.5, recommendationVolume: 8900, cacheHitRatio: 89.2, gazeEventsProcessed: 44500 },
  { hour: '13:00', latencyMs: 35.2, p99LatencyMs: 49.9, recommendationVolume: 8400, cacheHitRatio: 90.1, gazeEventsProcessed: 42000 },
  { hour: '14:00', latencyMs: 34.6, p99LatencyMs: 49.0, recommendationVolume: 8100, cacheHitRatio: 90.6, gazeEventsProcessed: 40500 },
  { hour: '15:00', latencyMs: 35.0, p99LatencyMs: 49.6, recommendationVolume: 8500, cacheHitRatio: 90.2, gazeEventsProcessed: 42500 },
  { hour: '16:00', latencyMs: 35.9, p99LatencyMs: 50.9, recommendationVolume: 8900, cacheHitRatio: 89.8, gazeEventsProcessed: 44500 },
  { hour: '17:00', latencyMs: 36.8, p99LatencyMs: 52.2, recommendationVolume: 9300, cacheHitRatio: 89.2, gazeEventsProcessed: 46500 },
  { hour: '18:00', latencyMs: 37.9, p99LatencyMs: 53.8, recommendationVolume: 9700, cacheHitRatio: 88.6, gazeEventsProcessed: 48500 },
  { hour: '19:00', latencyMs: 38.5, p99LatencyMs: 54.6, recommendationVolume: 9900, cacheHitRatio: 88.3, gazeEventsProcessed: 49500 },
  { hour: '20:00', latencyMs: 39.2, p99LatencyMs: 55.8, recommendationVolume: 10400, cacheHitRatio: 88.0, gazeEventsProcessed: 52000 },
  { hour: '21:00', latencyMs: 41.5, p99LatencyMs: 59.0, recommendationVolume: 12500, cacheHitRatio: 86.5, gazeEventsProcessed: 62500 },
  { hour: '22:00', latencyMs: 44.8, p99LatencyMs: 63.5, recommendationVolume: 15800, cacheHitRatio: 84.0, gazeEventsProcessed: 79000 },
  { hour: '23:00', latencyMs: 49.5, p99LatencyMs: 70.4, recommendationVolume: 19800, cacheHitRatio: 80.2, gazeEventsProcessed: 99000 }
];

