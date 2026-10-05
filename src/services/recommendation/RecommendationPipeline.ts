import { Product } from '../../types';
import { 
  StructuredSessionState, 
  RecommendationModelType, 
  ScoredRecommendationItem, 
  FusionStrategy, 
  AblationConfig,
  ComponentScores,
  AdaptiveWeights
} from './types';
import { AdaptiveFusionEngine, DEFAULT_ABLATION_CONFIG } from './AdaptiveFusionEngine';
import { ComponentModels } from './ComponentModels';

export interface RecommendationOptions {
  fusionStrategy?: FusionStrategy;
  ablation?: AblationConfig;
  catalog?: Product[];
  categoryFilter?: string;
  excludeIds?: Set<string>;
}

export class RecommendationPipeline {
  private catalogMap: Map<string, Product> = new Map();
  private catalogList: Product[] = [];

  constructor(initialProducts: Product[] = []) {
    this.setCatalog(initialProducts);
  }

  public setCatalog(products: Product[]) {
    this.catalogList = products;
    this.catalogMap.clear();
    products.forEach(p => this.catalogMap.set(p.id, p));
  }

  /**
   * Universal Recommendation Interface (Requirement 11)
   * recommend(session, modelType, topK, options): ScoredRecommendationItem[]
   */
  public recommend(
    session: StructuredSessionState,
    modelType: RecommendationModelType = 'sasher_adaptive',
    topK: number = 12,
    options: RecommendationOptions = {}
  ): ScoredRecommendationItem[] {
    const products = options.catalog || this.catalogList;
    const strategy = options.fusionStrategy || 'sasher_adaptive';
    const ablation = options.ablation || DEFAULT_ABLATION_CONFIG;
    const categoryFilter = options.categoryFilter;
    const excludeIds = options.excludeIds || new Set<string>();

    // 1. Determine active weights based on model type
    let weights: AdaptiveWeights;
    switch (modelType) {
      case 'popularity':
        weights = { alpha_session: 0, beta_content: 0, gamma_collab: 0, delta_popularity: 1.0 };
        break;
      case 'content_based':
        weights = { alpha_session: 0, beta_content: 1.0, gamma_collab: 0, delta_popularity: 0 };
        break;
      case 'collaborative':
        weights = { alpha_session: 0, beta_content: 0, gamma_collab: 1.0, delta_popularity: 0 };
        break;
      case 'session_based':
        weights = { alpha_session: 1.0, beta_content: 0, gamma_collab: 0, delta_popularity: 0 };
        break;
      case 'static_hybrid':
        weights = AdaptiveFusionEngine.getAdaptiveWeights(session, 'static_weighted', ablation);
        break;
      case 'sasher_adaptive':
      default:
        weights = AdaptiveFusionEngine.getAdaptiveWeights(session, strategy, ablation);
        break;
    }

    // 2. Score candidate items across all individual component models
    const scoredCandidates: ScoredRecommendationItem[] = [];

    for (const product of products) {
      if (excludeIds.has(product.id)) continue;
      if (categoryFilter && categoryFilter !== 'All' && product.category !== categoryFilter) continue;

      const s_content = ComponentModels.calculateContentScore(product, session, this.catalogMap);
      const s_session = ComponentModels.calculateSessionScore(product, session, ablation.useSessionIntent);
      const s_collab = ComponentModels.calculateCollaborativeScore(product, session, this.catalogMap);
      const s_popularity = ComponentModels.calculatePopularityScore(product);

      // Composite Adaptive Fusion (Requirement 5)
      const composite_score = parseFloat((
        weights.alpha_session * s_session +
        weights.beta_content * s_content +
        weights.gamma_collab * s_collab +
        weights.delta_popularity * s_popularity
      ).toFixed(4));

      const componentScores: ComponentScores = {
        s_session,
        s_content,
        s_collab,
        s_popularity,
        composite_score
      };

      // 3. Signal contribution percentages
      const totalSig = 
        weights.alpha_session * s_session +
        weights.beta_content * s_content +
        weights.gamma_collab * s_collab +
        weights.delta_popularity * s_popularity || 1;

      const sessionPct = Math.round(((weights.alpha_session * s_session) / totalSig) * 100);
      const contentPct = Math.round(((weights.beta_content * s_content) / totalSig) * 100);
      const collabPct = Math.round(((weights.gamma_collab * s_collab) / totalSig) * 100);
      const popPct = Math.max(0, 100 - (sessionPct + contentPct + collabPct));

      // 4. Identify dominant signal for explainability (Requirement 9)
      const sigPairs = [
        { name: 'session' as const, val: weights.alpha_session * s_session },
        { name: 'content' as const, val: weights.beta_content * s_content },
        { name: 'collaborative' as const, val: weights.gamma_collab * s_collab },
        { name: 'popularity' as const, val: weights.delta_popularity * s_popularity }
      ];
      sigPairs.sort((a, b) => b.val - a.val);
      const dominantSignal = sigPairs[0].name;

      // Genuine natural language explanation corresponding to actual ranking signals
      let primaryReason = '';
      const supportingReasons: string[] = [];

      switch (dominantSignal) {
        case 'session':
          primaryReason = `Matches your active exploration in ${product.category} (${session.sessionIntent.confidence ? Math.round(session.sessionIntent.confidence * 100) : 75}% confidence)`;
          supportingReasons.push('Recent clickstream trajectory points toward this category');
          break;
        case 'content':
          primaryReason = `Aesthetic silhouette and textile match with items you explored`;
          supportingReasons.push(`High attribute alignment with your recent style centroid`);
          break;
        case 'collaborative':
          primaryReason = `Frequently coordinated together in curated fashion ensembles`;
          supportingReasons.push(`Complementary outfit pairing for your current selections`);
          break;
        case 'popularity':
        default:
          primaryReason = `Trending staple with verified client satisfaction`;
          supportingReasons.push(`Strong cold-start baseline prior for unobserved sessions`);
          break;
      }

      const matchPercentage = Math.min(99, Math.max(50, Math.round(composite_score * 100)));

      scoredCandidates.push({
        product,
        score: composite_score,
        matchPercentage,
        model: modelType,
        componentScores,
        weightsApplied: weights,
        explanation: {
          primaryReason,
          supportingReasons,
          dominantSignal,
          signalContributions: {
            session: sessionPct,
            content: contentPct,
            collaborative: collabPct,
            popularity: popPct
          }
        }
      });
    }

    // 5. Rank descending by composite score with deterministic ID tie-breaking
    scoredCandidates.sort((a, b) => (b.score - a.score) || a.product.id.localeCompare(b.product.id));

    return scoredCandidates.slice(0, topK);
  }
}

export const recommendationPipeline = new RecommendationPipeline();
