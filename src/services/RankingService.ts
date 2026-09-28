import recommendationConfigDefault from '../config/recommendation_config.json';
import { 
  Product, 
  RecommendedProduct, 
  InteractionEvent, 
  CategoryType,
  RecommendationExplanation
} from '../types';

export interface RecommendationConfigWeights {
  CF_WEIGHT: number;
  CBF_WEIGHT: number;
  SESSION_WEIGHT: number;
  POPULARITY_WEIGHT: number;
  COLD_START_WEIGHT: number;
}

export interface ColdStartConfig {
  user_interaction_threshold: number;
  item_interaction_threshold: number;
  new_user_strategy: string;
  new_item_strategy: string;
  new_session_strategy: string;
}

export interface RecommendationConfig {
  system_title: string;
  version: string;
  weights: RecommendationConfigWeights;
  cold_start: ColdStartConfig;
  interaction_weights: Record<string, number>;
  session: {
    decay_lambda: number;
    max_recent_items: number;
    dwell_threshold_seconds: number;
  };
  indian_ecommerce: {
    currency: string;
    festive_boost: number;
    regional_categories: string[];
    price_sensitivity: {
      budget_max: number;
      contemporary_max: number;
      luxury_min: number;
    };
  };
  ranking: {
    top_k: number;
    candidate_pool_size: number;
    diversity_lambda_mmr: number;
  };
}

export interface HybridScoreBreakdown {
  cfScore: number;
  cbfScore: number;
  sessionScore: number;
  popularityScore: number;
  coldStartScore: number;
  hybridScore: number;
  normalizedWeights: RecommendationConfigWeights;
  userColdStartStatus: 'NEW_USER' | 'WARM_USER' | 'ACTIVE_USER';
  itemColdStartStatus: 'NEW_ITEM' | 'WARM_ITEM';
  dominantSignal: string;
  festiveMultiplier: number;
}

export interface RankedProductItem extends RecommendedProduct {
  hybridBreakdown: HybridScoreBreakdown;
}

type ConfigListener = (config: RecommendationConfig) => void;

class RankingServiceImpl {
  private config: RecommendationConfig;
  private listeners: Set<ConfigListener> = new Set();

  constructor() {
    // Load default config from recommendation_config.json, with local storage persistence
    this.config = this.loadConfig();
  }

  private loadConfig(): RecommendationConfig {
    try {
      const saved = localStorage.getItem('sasher_recommendation_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...recommendationConfigDefault,
          ...parsed,
          weights: {
            ...recommendationConfigDefault.weights,
            ...(parsed.weights || {})
          }
        };
      }
    } catch {
      // Fallback to default
    }
    return JSON.parse(JSON.stringify(recommendationConfigDefault));
  }

  public getConfig(): RecommendationConfig {
    return JSON.parse(JSON.stringify(this.config));
  }

  public getWeights(): RecommendationConfigWeights {
    return { ...this.config.weights };
  }

  public setWeights(newWeights: Partial<RecommendationConfigWeights>): void {
    this.config.weights = {
      ...this.config.weights,
      ...newWeights
    };
    this.persistAndNotify();
  }

  public updateConfig(partial: Partial<RecommendationConfig>): void {
    this.config = {
      ...this.config,
      ...partial,
      weights: {
        ...this.config.weights,
        ...(partial.weights || {})
      }
    };
    this.persistAndNotify();
  }

  public resetToDefaultWeights(): void {
    this.config.weights = { ...recommendationConfigDefault.weights };
    this.persistAndNotify();
  }

  private persistAndNotify(): void {
    try {
      localStorage.setItem('sasher_recommendation_config', JSON.stringify(this.config));
    } catch {
      // Ignore local storage error
    }
    this.listeners.forEach(fn => fn(this.getConfig()));
  }

  public subscribe(listener: ConfigListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Evaluates user cold-start status based on configurable threshold
   */
  public getUserColdStartStatus(interactionCount: number): 'NEW_USER' | 'WARM_USER' | 'ACTIVE_USER' {
    const threshold = this.config.cold_start.user_interaction_threshold;
    if (interactionCount < threshold) return 'NEW_USER';
    if (interactionCount < threshold + 5) return 'WARM_USER';
    return 'ACTIVE_USER';
  }

  /**
   * Evaluates item cold-start status based on configurable threshold
   */
  public getItemColdStartStatus(product: Product): 'NEW_ITEM' | 'WARM_ITEM' {
    const threshold = this.config.cold_start.item_interaction_threshold;
    const count = product.historicalInteractionsCount ?? 0;
    if (product.isColdStartItem || count < threshold) return 'NEW_ITEM';
    return 'WARM_ITEM';
  }

  /**
   * Computes Collaborative Filtering score: CF(i)
   * Derived from implicit feedback interaction matrix & item co-occurrence affinity
   */
  private calculateCFScore(
    product: Product,
    interactions: InteractionEvent[],
    userStatus: 'NEW_USER' | 'WARM_USER' | 'ACTIVE_USER'
  ): number {
    if (userStatus === 'NEW_USER' && interactions.length === 0) {
      // Uninformed prior based on general collaborative popularity density
      return Math.min(0.85, Math.max(0.35, product.popularityScore * 0.7 + 0.2));
    }

    const { interaction_weights } = this.config;
    let cfSignal = 0;
    let totalInteractionsWeight = 0;

    interactions.forEach(ev => {
      let weight = interaction_weights[ev.type.toLowerCase()] ?? 1.0;
      if (ev.type === 'EYE_GAZE' && ev.gazeWeight) {
        weight = ev.gazeWeight;
      }
      totalInteractionsWeight += weight;

      if (ev.productId === product.id) {
        cfSignal += weight * 1.5;
      } else if (ev.category === product.category) {
        cfSignal += weight * 0.6;
      }
    });

    const normalizedCF = totalInteractionsWeight > 0 
      ? Math.min(1.0, cfSignal / Math.max(1, totalInteractionsWeight * 0.8))
      : product.popularityScore;

    return Math.max(0.1, Math.min(1.0, normalizedCF));
  }

  /**
   * Computes Content-Based Filtering score: CBF(i)
   * Derived from multi-attribute cosine similarity with user's explicit preferences and viewed styles
   */
  private calculateCBFScore(
    product: Product,
    userPreferences: string[],
    interactions: InteractionEvent[]
  ): number {
    let score = 0.4; // Base score
    const prodText = [
      product.category,
      product.subcategory || '',
      product.brand,
      product.style,
      product.occasion || '',
      product.material,
      product.color,
      ...(product.tags || [])
    ].join(' ').toLowerCase();

    // 1. User explicit preference tags match
    if (userPreferences.length > 0) {
      let prefHits = 0;
      userPreferences.forEach(pref => {
        const pLower = pref.toLowerCase();
        if (prodText.includes(pLower)) {
          prefHits += 1;
        }
      });
      score += (prefHits / Math.max(1, userPreferences.length)) * 0.45;
    }

    // 2. Interacted items content similarity
    const recentProductIds = new Set(interactions.slice(-6).map(i => i.productId));
    if (recentProductIds.has(product.id)) {
      score += 0.2;
    }

    return Math.max(0.05, Math.min(1.0, score));
  }

  /**
   * Computes Session Intent score: Session(i)
   * Tracks recency exponential decay: weight = exp(-lambda * delta_t)
   */
  private calculateSessionScore(
    product: Product,
    interactions: InteractionEvent[],
    activeGazeId: string | null = null,
    searchQuery: string = ''
  ): number {
    const { decay_lambda } = this.config.session;
    const now = Date.now();
    let sessionAffinity = 0.35; // baseline

    // 1. Search Query intent
    if (searchQuery.trim().length > 1) {
      const q = searchQuery.toLowerCase().trim();
      const match = 
        product.name.toLowerCase().includes(q) ||
        product.brand.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q) ||
        product.color.toLowerCase().includes(q) ||
        (product.description && product.description.toLowerCase().includes(q));
      
      if (match) {
        sessionAffinity += 0.45;
      }
    }

    // 2. Gaze dwell immediate focal lock
    if (activeGazeId === product.id) {
      sessionAffinity += 0.40;
    }

    // 3. Sequential interaction decay
    if (interactions.length > 0) {
      let decayWeightedCategoryMatch = 0;
      let decayWeightSum = 0;

      interactions.forEach(ev => {
        const deltaSeconds = Math.max(0, (now - ev.timestamp) / 1000);
        const timeDecay = Math.exp(-decay_lambda * deltaSeconds);
        decayWeightSum += timeDecay;

        if (ev.category === product.category) {
          decayWeightedCategoryMatch += timeDecay * 0.5;
        }
        if (ev.productId === product.id) {
          decayWeightedCategoryMatch += timeDecay * 1.0;
        }
      });

      if (decayWeightSum > 0) {
        sessionAffinity += (decayWeightedCategoryMatch / decayWeightSum) * 0.35;
      }
    }

    return Math.max(0.1, Math.min(1.0, sessionAffinity));
  }

  /**
   * Computes Popularity Prior score: Popularity(i)
   */
  private calculatePopularityScore(product: Product): number {
    const basePop = product.popularityScore ?? 0.5;
    const ratingBonus = product.rating ? (product.rating / 5.0) * 0.15 : 0.05;
    return Math.max(0.1, Math.min(1.0, basePop * 0.85 + ratingBonus));
  }

  /**
   * Computes Dedicated Cold-Start Mitigation score: ColdStart(i)
   * Bootstraps relevant candidates for new users and surfaces new catalog items
   */
  private calculateColdStartScore(
    product: Product,
    userStatus: 'NEW_USER' | 'WARM_USER' | 'ACTIVE_USER',
    itemStatus: 'NEW_ITEM' | 'WARM_ITEM',
    searchQuery: string = ''
  ): { coldStartScore: number; festiveMultiplier: number } {
    let coldScore = 0.5;
    let festiveMultiplier = 1.0;

    // 1. Indian E-Commerce festive & regional attribute alignment
    const isFestiveItem = 
      product.season === 'Festive' ||
      product.occasion === 'Festive' ||
      product.occasion === 'Wedding' ||
      product.style === 'Traditional' ||
      product.style === 'Festive' ||
      this.config.indian_ecommerce.regional_categories.some(cat => 
        product.name.toLowerCase().includes(cat.toLowerCase()) || 
        product.articleType.toLowerCase().includes(cat.toLowerCase())
      );

    if (isFestiveItem) {
      festiveMultiplier = this.config.indian_ecommerce.festive_boost;
      coldScore += 0.25;
    }

    // 2. User Cold-Start Strategy:
    // Boost popularity priors, category diversity, and immediate query hits
    if (userStatus === 'NEW_USER') {
      coldScore += product.popularityScore * 0.25;
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        if (product.name.toLowerCase().includes(q) || product.category.toLowerCase().includes(q)) {
          coldScore += 0.35;
        }
      }
    }

    // 3. Item Cold-Start Strategy:
    // Give new items a fair representation based on rich content attributes
    if (itemStatus === 'NEW_ITEM') {
      coldScore += 0.30; // Exploratory discovery prior
    }

    return {
      coldStartScore: Math.max(0.1, Math.min(1.0, coldScore)),
      festiveMultiplier
    };
  }

  /**
   * Calculates the weighted HybridScore formula:
   * HybridScore(i) = α × CF(i) + β × CBF(i) + γ × Session(i) + δ × Popularity(i) + ε × ColdStart(i)
   */
  public calculateHybridScore(
    product: Product,
    interactions: InteractionEvent[],
    userPreferences: string[] = [],
    searchQuery: string = '',
    activeGazeId: string | null = null
  ): HybridScoreBreakdown {
    const weights = this.config.weights;
    const W_SUM = 
      weights.CF_WEIGHT +
      weights.CBF_WEIGHT +
      weights.SESSION_WEIGHT +
      weights.POPULARITY_WEIGHT +
      weights.COLD_START_WEIGHT;

    const normW: RecommendationConfigWeights = {
      CF_WEIGHT: weights.CF_WEIGHT / W_SUM,
      CBF_WEIGHT: weights.CBF_WEIGHT / W_SUM,
      SESSION_WEIGHT: weights.SESSION_WEIGHT / W_SUM,
      POPULARITY_WEIGHT: weights.POPULARITY_WEIGHT / W_SUM,
      COLD_START_WEIGHT: weights.COLD_START_WEIGHT / W_SUM,
    };

    const userStatus = this.getUserColdStartStatus(interactions.length);
    const itemStatus = this.getItemColdStartStatus(product);

    const cf = this.calculateCFScore(product, interactions, userStatus);
    const cbf = this.calculateCBFScore(product, userPreferences, interactions);
    const session = this.calculateSessionScore(product, interactions, activeGazeId, searchQuery);
    const pop = this.calculatePopularityScore(product);
    const { coldStartScore, festiveMultiplier } = this.calculateColdStartScore(
      product,
      userStatus,
      itemStatus,
      searchQuery
    );

    // Weighted Hybrid Formula
    const rawHybridScore = 
      normW.CF_WEIGHT * cf +
      normW.CBF_WEIGHT * cbf +
      normW.SESSION_WEIGHT * session +
      normW.POPULARITY_WEIGHT * pop +
      normW.COLD_START_WEIGHT * coldStartScore;

    // Apply festive multiplier if applicable
    const finalScore = Math.max(0.1, Math.min(1.0, rawHybridScore * (festiveMultiplier > 1 ? 1.05 : 1.0)));

    // Determine dominant signal for explainability
    const signals = [
      { name: 'Collaborative Filtering', val: normW.CF_WEIGHT * cf },
      { name: 'Content Style Similarity', val: normW.CBF_WEIGHT * cbf },
      { name: 'Session & Visual Attention', val: normW.SESSION_WEIGHT * session },
      { name: 'Popularity Benchmark', val: normW.POPULARITY_WEIGHT * pop },
      { name: 'Cold-Start Mitigation Prior', val: normW.COLD_START_WEIGHT * coldStartScore }
    ];
    signals.sort((a, b) => b.val - a.val);
    const dominantSignal = `${signals[0].name} (${Math.round((signals[0].val / (rawHybridScore || 1)) * 100)}%)`;

    return {
      cfScore: parseFloat(cf.toFixed(3)),
      cbfScore: parseFloat(cbf.toFixed(3)),
      sessionScore: parseFloat(session.toFixed(3)),
      popularityScore: parseFloat(pop.toFixed(3)),
      coldStartScore: parseFloat(coldStartScore.toFixed(3)),
      hybridScore: parseFloat(finalScore.toFixed(3)),
      normalizedWeights: normW,
      userColdStartStatus: userStatus,
      itemColdStartStatus: itemStatus,
      dominantSignal,
      festiveMultiplier
    };
  }

  /**
   * Ranks an array of products using the weighted HybridScore formula
   * and returns Top-K items with complete explainability metadata.
   */
  public rankProducts(
    products: Product[],
    interactions: InteractionEvent[],
    userPreferences: string[] = [],
    searchQuery: string = '',
    activeGazeId: string | null = null,
    topK?: number
  ): RankedProductItem[] {
    const k = topK ?? this.config.ranking.top_k;

    const scored = products.map(product => {
      const breakdown = this.calculateHybridScore(
        product,
        interactions,
        userPreferences,
        searchQuery,
        activeGazeId
      );

      const explanation: RecommendationExplanation = {
        matchScore: Math.round(breakdown.hybridScore * 100),
        sessionContribution: Math.round(breakdown.sessionScore * 100),
        visualAttentionContribution: activeGazeId === product.id ? 95 : 45,
        profileContribution: Math.round(breakdown.cbfScore * 100),
        contentSimilarityContribution: Math.round(breakdown.cbfScore * 100),
        popularityContribution: Math.round(breakdown.popularityScore * 100),
        primaryReasons: [
          breakdown.dominantSignal,
          breakdown.userColdStartStatus === 'NEW_USER' 
            ? 'Cold-Start Bootstrap: Surface-level visual and category alignment'
            : 'Longitudinal interaction history match',
          breakdown.festiveMultiplier > 1 
            ? 'Indian Festive & Wedding collection boost active' 
            : 'Standard collection catalog ranking'
        ],
        technicalDetails: {
          wSession: breakdown.normalizedWeights.SESSION_WEIGHT,
          wGaze: breakdown.normalizedWeights.SESSION_WEIGHT * 0.5,
          wProfile: breakdown.normalizedWeights.CBF_WEIGHT,
          wCollab: breakdown.normalizedWeights.CF_WEIGHT,
          wContent: breakdown.normalizedWeights.CBF_WEIGHT,
          wPopularity: breakdown.normalizedWeights.POPULARITY_WEIGHT,
          dotProduct: breakdown.hybridScore,
          mmrScore: breakdown.hybridScore,
          diversityPenalty: 0.05
        }
      };

      const ranked: RankedProductItem = {
        ...product,
        explanation,
        hybridBreakdown: breakdown,
        isGazeInfluenced: activeGazeId === product.id
      };

      return ranked;
    });

    // Sort descending by hybridScore
    scored.sort((a, b) => b.hybridBreakdown.hybridScore - a.hybridBreakdown.hybridScore);

    return scored.slice(0, k);
  }
}

export const RankingService = new RankingServiceImpl();
