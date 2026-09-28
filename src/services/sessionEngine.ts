import { Product, CategoryType, InteractionEvent, SessionContextRepresentation } from '../types';
import { INTERACTION_HYPERPARAM_WEIGHTS } from '../config/recommendationConfig';

export class SessionEngine {
  /**
   * Computes the mathematical session embedding vector with exponential time decay:
   * w_t = exp(-lambda * delta_t) * action_weight
   * Session Vector s = sum(w_t * v_{i_t}) / sum(w_t)
   */
  public computeSessionRepresentation(
    sessionId: string,
    interactions: InteractionEvent[],
    products: Product[],
    lambdaDecay = 0.05,
    visualIntentEnabled = true
  ): SessionContextRepresentation {
    const productLookup = new Map<string, Product>();
    products.forEach(p => productLookup.set(p.id, p));

    const now = Date.now();
    const vectorDim = 8; // outerwear, tailoring, knitwear, minimalism, formal, casual, warmth, traditional
    const accumulatedVector = new Array(vectorDim).fill(0);
    let totalWeightSum = 0;

    const categoryWeights: Record<string, number> = {};
    const styleWeights: Record<string, number> = {};
    const colorWeights: Record<string, number> = {};
    let visualIntentDwellSum = 0;
    let visualIntentCount = 0;

    // Filter to interactions belonging to current active session
    // If not stamped with session, takes recent 30 events
    const sessionInteractions = interactions.slice(-30);

    sessionInteractions.forEach((event, idx) => {
      const product = productLookup.get(event.productId);
      if (!product) return;

      // 1. Calculate time delta in minutes
      const deltaMinutes = Math.max(0, (now - event.timestamp) / 60000);
      
      // 2. Exponential decay: exp(-lambda * delta_t)
      const temporalDecay = Math.exp(-lambdaDecay * deltaMinutes);

      // 3. Action weight
      let actionWeight = INTERACTION_HYPERPARAM_WEIGHTS[event.type] || 1.0;

      // Interaction-based Visual Intent signal modulation
      if (event.type === 'EYE_GAZE' || event.type === 'HOVER') {
        const dwellSec = event.dwellMs ? event.dwellMs / 1000 : 1.2;
        visualIntentDwellSum += dwellSec;
        visualIntentCount++;
        
        if (visualIntentEnabled) {
          // Continuous dwell intent boost: scales with fixation dwell
          actionWeight = Math.min(4.5, 1.5 + dwellSec * 1.5);
        } else {
          actionWeight = 1.0; // Baseline when visual intent is toggled OFF
        }
      }

      const effectiveWeight = temporalDecay * actionWeight;
      totalWeightSum += effectiveWeight;

      // Accumulate dense feature vector
      const fv = product.featureVector;
      accumulatedVector[0] += effectiveWeight * (fv.outerwear || 0);
      accumulatedVector[1] += effectiveWeight * (fv.tailoring || 0);
      accumulatedVector[2] += effectiveWeight * (fv.knitwear || 0);
      accumulatedVector[3] += effectiveWeight * (fv.minimalism || 0);
      accumulatedVector[4] += effectiveWeight * (fv.formal || 0);
      accumulatedVector[5] += effectiveWeight * (fv.casual || 0);
      accumulatedVector[6] += effectiveWeight * (fv.warmth || 0);
      accumulatedVector[7] += effectiveWeight * (fv.traditional || (product.style === 'Traditional' ? 0.9 : 0.1));

      // Category, Style & Color distributions
      categoryWeights[product.category] = (categoryWeights[product.category] || 0) + effectiveWeight;
      if (product.style) {
        styleWeights[product.style] = (styleWeights[product.style] || 0) + effectiveWeight;
      }
      if (product.color) {
        colorWeights[product.color] = (colorWeights[product.color] || 0) + effectiveWeight;
      }
    });

    // Normalize session vector
    const sessionVector = accumulatedVector.map(val => 
      totalWeightSum > 0 ? parseFloat((val / totalWeightSum).toFixed(4)) : 0.5
    );

    // Infer dominant Category Intent
    let dominantCategory: CategoryType = 'All';
    let maxCatWeight = -1;
    Object.entries(categoryWeights).forEach(([cat, w]) => {
      if (w > maxCatWeight) {
        maxCatWeight = w;
        dominantCategory = cat as CategoryType;
      }
    });

    // Infer dominant Style Intent
    let dominantStyle = 'Minimalist Tailored';
    let maxStyleWeight = -1;
    Object.entries(styleWeights).forEach(([style, w]) => {
      if (w > maxStyleWeight) {
        maxStyleWeight = w;
        dominantStyle = style;
      }
    });

    // Infer dominant Color Intent
    let dominantColor = 'Monochrome';
    let maxColorWeight = -1;
    Object.entries(colorWeights).forEach(([col, w]) => {
      if (w > maxColorWeight) {
        maxColorWeight = w;
        dominantColor = col;
      }
    });

    // Intent confidence calculation based on event concentration
    const totalCatWeight = Object.values(categoryWeights).reduce((a, b) => a + b, 0);
    const intentConfidence = totalCatWeight > 0 && maxCatWeight > 0
      ? Math.min(0.98, parseFloat((maxCatWeight / totalCatWeight).toFixed(3)))
      : 0.50;

    const avgVisualDwell = visualIntentCount > 0 ? visualIntentDwellSum / visualIntentCount : 0;
    const visualIntentScore = Math.min(1.0, parseFloat((avgVisualDwell / 3.0).toFixed(2)));

    return {
      sessionId,
      sessionVector,
      inferredCategoryIntent: dominantCategory,
      inferredStyleIntent: dominantStyle,
      inferredColorIntent: dominantColor,
      intentConfidence,
      eventSequenceCount: sessionInteractions.length,
      latestEventTimestamp: sessionInteractions.length > 0 
        ? sessionInteractions[sessionInteractions.length - 1].timestamp 
        : now,
      timeDecayApplied: true,
      visualIntentActive: visualIntentEnabled,
      visualIntentScore,
      recentInteractions: sessionInteractions
    };
  }

  /**
   * Computes session relevance score for candidate item against active session vector
   */
  public computeSessionRelevanceScore(
    candidate: Product,
    sessionRepresentation: SessionContextRepresentation
  ): number {
    if (sessionRepresentation.eventSequenceCount === 0) {
      return candidate.popularityScore || 0.5;
    }

    const sVec = sessionRepresentation.sessionVector;
    const fv = candidate.featureVector;
    const itemVec = [
      fv.outerwear || 0,
      fv.tailoring || 0,
      fv.knitwear || 0,
      fv.minimalism || 0,
      fv.formal || 0,
      fv.casual || 0,
      fv.warmth || 0,
      fv.traditional || 0
    ];

    // Cosine similarity between session vector and item vector
    let dot = 0;
    let normS = 0;
    let normI = 0;
    for (let i = 0; i < sVec.length; i++) {
      dot += sVec[i] * itemVec[i];
      normS += sVec[i] * sVec[i];
      normI += itemVec[i] * itemVec[i];
    }
    const cosineSim = (normS > 0 && normI > 0) ? dot / (Math.sqrt(normS) * Math.sqrt(normI)) : 0.5;

    // Category intent match bonus
    const isCategoryMatch = candidate.category === sessionRepresentation.inferredCategoryIntent;
    const categoryFactor = isCategoryMatch ? 1.25 : 0.90;

    return Math.min(1.0, Math.max(0.0, parseFloat((cosineSim * categoryFactor).toFixed(3))));
  }
}

export const sessionEngine = new SessionEngine();
