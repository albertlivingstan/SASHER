import { 
  AdaptiveWeights, 
  AblationConfig, 
  FusionStrategy, 
  StructuredSessionState 
} from './types';

export const DEFAULT_ABLATION_CONFIG: AblationConfig = {
  useAdaptiveWeighting: true,
  useSessionIntent: true,
  useDwellSignal: true,
  useContentModel: true,
  useCollaborativeModel: true,
  usePopularityPrior: true
};

/**
 * Normalizes weight vector to guarantee strict simplex constraint:
 * sum(w_i) = 1.0, w_i >= 0
 */
export function normalizeWeights(weights: AdaptiveWeights): AdaptiveWeights {
  const sum = 
    Math.max(0, weights.alpha_session) +
    Math.max(0, weights.beta_content) +
    Math.max(0, weights.gamma_collab) +
    Math.max(0, weights.delta_popularity);

  if (sum === 0) {
    return {
      alpha_session: 0.25,
      beta_content: 0.25,
      gamma_collab: 0.25,
      delta_popularity: 0.25
    };
  }

  return {
    alpha_session: parseFloat((weights.alpha_session / sum).toFixed(4)),
    beta_content: parseFloat((weights.beta_content / sum).toFixed(4)),
    gamma_collab: parseFloat((weights.gamma_collab / sum).toFixed(4)),
    delta_popularity: parseFloat((weights.delta_popularity / sum).toFixed(4))
  };
}

export class AdaptiveFusionEngine {
  /**
   * Computes the mathematical adaptive weights based on Session State, Fusion Strategy,
   * and optional Ablation Experiment configuration.
   */
  public static getAdaptiveWeights(
    session: StructuredSessionState,
    strategy: FusionStrategy = 'sasher_adaptive',
    ablation: AblationConfig = DEFAULT_ABLATION_CONFIG
  ): AdaptiveWeights {
    const n = session.interactionCount;
    let raw: AdaptiveWeights;

    // If adaptive weighting is ablated, force static weighting
    if (!ablation.useAdaptiveWeighting) {
      strategy = 'static_weighted';
    }

    switch (strategy) {
      case 'static_50_50': {
        // Simple 50/50 baseline
        raw = {
          alpha_session: 0.0,
          beta_content: 0.50,
          gamma_collab: 0.0,
          delta_popularity: 0.50
        };
        break;
      }

      case 'static_weighted': {
        // Fixed standard weighted hybrid
        raw = {
          alpha_session: 0.30,
          beta_content: 0.30,
          gamma_collab: 0.25,
          delta_popularity: 0.15
        };
        break;
      }

      case 'linear_adaptive': {
        // Linearly transitions from cold-start to session-dominant (n from 0 to 6)
        const progress = Math.min(1.0, n / 6.0);
        raw = {
          alpha_session: 0.05 + 0.50 * progress,
          beta_content: 0.45 - 0.25 * progress,
          gamma_collab: 0.10 + 0.15 * progress,
          delta_popularity: 0.40 - 0.40 * progress
        };
        break;
      }

      case 'sigmoid_adaptive': {
        // Logistic sigmoid transition centered at n0 = 2.5
        const k = 0.9;
        const sigmoid = 1.0 / (1.0 + Math.exp(-k * (n - 2.5)));
        raw = {
          alpha_session: 0.05 + 0.55 * sigmoid,
          beta_content: 0.45 * (1.0 - 0.5 * sigmoid),
          gamma_collab: 0.10 + 0.15 * sigmoid,
          delta_popularity: 0.40 * (1.0 - sigmoid)
        };
        break;
      }

      case 'sasher_adaptive':
      default: {
        // SASHER multi-stage cold-start schedule modulated by intent confidence
        const conf = session.sessionIntent.confidence;

        switch (session.stage) {
          case 0: // n = 0 (Pure Cold-Start)
            raw = {
              alpha_session: 0.05,
              beta_content: 0.45,
              gamma_collab: 0.10,
              delta_popularity: 0.40
            };
            break;

          case 1: // n = 1 (First Touch)
            raw = {
              alpha_session: 0.20 + 0.05 * conf,
              beta_content: 0.40 - 0.05 * conf,
              gamma_collab: 0.15,
              delta_popularity: 0.25
            };
            break;

          case 2: // n = 2-4 (Early Exploration)
            raw = {
              alpha_session: 0.40 + 0.10 * conf,
              beta_content: 0.30 - 0.05 * conf,
              gamma_collab: 0.20,
              delta_popularity: 0.10
            };
            break;

          case 3: // n >= 5 (Mature Context)
          default:
            raw = {
              alpha_session: 0.50 + 0.10 * conf,
              beta_content: 0.20,
              gamma_collab: 0.25,
              delta_popularity: 0.05
            };
            break;
        }
        break;
      }
    }

    // Apply Ablation study masks
    if (!ablation.useContentModel) {
      raw.beta_content = 0.0;
    }
    if (!ablation.useCollaborativeModel) {
      raw.gamma_collab = 0.0;
    }
    if (!ablation.usePopularityPrior) {
      raw.delta_popularity = 0.0;
    }
    if (!ablation.useSessionIntent) {
      raw.alpha_session = 0.10;
    }

    return normalizeWeights(raw);
  }
}
