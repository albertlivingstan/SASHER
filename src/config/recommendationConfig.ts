import { RecommendationEngineConfig } from '../types';

export const DEFAULT_RECOMMENDATION_CONFIG: RecommendationEngineConfig = {
  CF_WEIGHT: 0.25,
  CBF_WEIGHT: 0.30,
  SESSION_WEIGHT: 0.30,
  POPULARITY_WEIGHT: 0.15,
  COLD_START_BOOST: 0.20,
  MMR_DIVERSITY_LAMBDA: 0.75,
  SESSION_DECAY_LAMBDA: 0.05,
  NEW_USER_THRESHOLD: 3,
  NEW_ITEM_THRESHOLD: 5,
  TOP_K: 10
};

export const INTERACTION_HYPERPARAM_WEIGHTS: Record<string, number> = {
  VIEW: 1.0,
  HOVER: 1.5,
  CLICK: 2.0,
  SEARCH: 2.5,
  EYE_GAZE: 3.0,
  FEEDBACK_LIKE: 3.0,
  WISHLIST: 4.0,
  CART: 5.0,
  FEEDBACK_MORE_LIKE_THIS: 4.5,
  PURCHASE: 8.0,
  FEEDBACK_DISLIKE: -4.0
};

class RecommendationConfigManager {
  private config: RecommendationEngineConfig = { ...DEFAULT_RECOMMENDATION_CONFIG };
  private listeners: Set<(config: RecommendationEngineConfig) => void> = new Set();

  public getConfig(): RecommendationEngineConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<RecommendationEngineConfig>): RecommendationEngineConfig {
    this.config = {
      ...this.config,
      ...newConfig
    };
    this.notify();
    return this.getConfig();
  }

  public resetToDefaults(): RecommendationEngineConfig {
    this.config = { ...DEFAULT_RECOMMENDATION_CONFIG };
    this.notify();
    return this.getConfig();
  }

  public subscribe(listener: (config: RecommendationEngineConfig) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(cb => cb(this.getConfig()));
  }
}

export const recommendationConfigManager = new RecommendationConfigManager();
