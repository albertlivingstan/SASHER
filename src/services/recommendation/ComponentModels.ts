import { Product } from '../../types';
import { StructuredSessionState } from './types';

export class ComponentModels {
  // Learned Collaborative Filtering matrix (Item-Item Cosine Similarity)
  private static itemCoOccurrenceMatrix: Map<string, Map<string, number>> = new Map();
  private static itemInteractionFreq: Map<string, number> = new Map();
  private static maxItemFreq: number = 1;

  /**
   * Trains the Item-Item Collaborative Filtering model from raw session interaction logs.
   * Computes symmetric cosine similarity across sessions:
   * sim(i, j) = |S_i ∩ S_j| / sqrt(|S_i| * |S_j|)
   */
  public static trainCollaborativeMatrix(
    interactions: { sessionId: string; productId: string }[]
  ): void {
    this.itemCoOccurrenceMatrix.clear();
    this.itemInteractionFreq.clear();
    this.maxItemFreq = 1;

    // 1. Group products by session
    const sessionItemsMap = new Map<string, Set<string>>();
    interactions.forEach(({ sessionId, productId }) => {
      if (!productId) return;
      if (!sessionItemsMap.has(sessionId)) {
        sessionItemsMap.set(sessionId, new Set());
      }
      sessionItemsMap.get(sessionId)!.add(productId);
      
      const currCount = (this.itemInteractionFreq.get(productId) || 0) + 1;
      this.itemInteractionFreq.set(productId, currCount);
      if (currCount > this.maxItemFreq) {
        this.maxItemFreq = currCount;
      }
    });

    // 2. Count pairwise co-occurrences
    const rawCoOccurrence = new Map<string, Map<string, number>>();
    sessionItemsMap.forEach(itemsSet => {
      const items = Array.from(itemsSet);
      for (let i = 0; i < items.length; i++) {
        const itemA = items[i];
        if (!rawCoOccurrence.has(itemA)) rawCoOccurrence.set(itemA, new Map());

        for (let j = 0; j < items.length; j++) {
          const itemB = items[j];
          const currCooc = rawCoOccurrence.get(itemA)!.get(itemB) || 0;
          rawCoOccurrence.get(itemA)!.set(itemB, currCooc + 1);
        }
      }
    });

    // 3. Compute normalized cosine similarity matrix
    rawCoOccurrence.forEach((neighbors, itemA) => {
      const freqA = this.itemInteractionFreq.get(itemA) || 1;
      const simMap = new Map<string, number>();

      neighbors.forEach((coocCount, itemB) => {
        const freqB = this.itemInteractionFreq.get(itemB) || 1;
        const cosineSim = coocCount / Math.sqrt(freqA * freqB);
        simMap.set(itemB, parseFloat(cosineSim.toFixed(4)));
      });

      this.itemCoOccurrenceMatrix.set(itemA, simMap);
    });
  }

  /**
   * 1. Content-Based Score S_content(item)
   * Evaluates feature vector cosine similarity against the centroid of recently viewed/opened products,
   * plus categorical and aesthetic token overlap.
   */
  public static calculateContentScore(
    product: Product,
    session: StructuredSessionState,
    catalog: Map<string, Product>
  ): number {
    if (session.recentItems.length === 0) {
      // Unobserved content: baseline neutral score with subtle silhouette bonus
      return 0.45;
    }

    // Build recent interacted products list
    const recentProducts: Product[] = [];
    session.recentItems.slice(-5).forEach(id => {
      const p = catalog.get(id);
      if (p) recentProducts.push(p);
    });

    if (recentProducts.length === 0) return 0.50;

    // Feature centroid calculation across active dimensions
    let sumOut = 0, sumTail = 0, sumKnit = 0, sumMin = 0, sumForm = 0, sumCas = 0, sumWarm = 0;
    recentProducts.forEach(p => {
      const fv = p.featureVector;
      sumOut += fv.outerwear || 0;
      sumTail += fv.tailoring || 0;
      sumKnit += fv.knitwear || 0;
      sumMin += fv.minimalism || 0;
      sumForm += fv.formal || 0;
      sumCas += fv.casual || 0;
      sumWarm += fv.warmth || 0;
    });

    const m = recentProducts.length;
    const cVec = [
      sumOut / m,
      sumTail / m,
      sumKnit / m,
      sumMin / m,
      sumForm / m,
      sumCas / m,
      sumWarm / m
    ];

    const fv = product.featureVector;
    const iVec = [
      fv.outerwear || 0,
      fv.tailoring || 0,
      fv.knitwear || 0,
      fv.minimalism || 0,
      fv.formal || 0,
      fv.casual || 0,
      fv.warmth || 0
    ];

    // Cosine similarity
    let dot = 0, normC = 0, normI = 0;
    for (let i = 0; i < cVec.length; i++) {
      dot += cVec[i] * iVec[i];
      normC += cVec[i] * cVec[i];
      normI += iVec[i] * iVec[i];
    }
    const cosineSim = (normC > 0 && normI > 0) ? dot / (Math.sqrt(normC) * Math.sqrt(normI)) : 0.5;

    // Attribute overlap (Brand, Style, Material)
    let tokenBonus = 0;
    recentProducts.forEach(rp => {
      if (rp.brand === product.brand) tokenBonus += 0.08;
      if (rp.style === product.style) tokenBonus += 0.12;
      if (rp.color && product.color && rp.color.toLowerCase() === product.color.toLowerCase()) tokenBonus += 0.10;
    });
    tokenBonus = Math.min(0.25, tokenBonus / recentProducts.length);

    return Math.min(1.0, Math.max(0.05, parseFloat((cosineSim * 0.75 + tokenBonus + 0.1).toFixed(4))));
  }

  /**
   * 2. Session-Based Score S_session(item)
   * Computes affinity to recent chronological category sequence and inferred Session Intent.
   * Includes dwell-time boost if dwellSignalActive is true.
   */
  public static calculateSessionScore(
    product: Product,
    session: StructuredSessionState,
    useSessionIntent: boolean = true
  ): number {
    if (session.interactionCount === 0) {
      return 0.35;
    }

    const { primaryCategory, confidence } = session.sessionIntent;
    let score = 0.30;

    // Direct Category Intent match
    if (useSessionIntent && product.category === primaryCategory) {
      score += 0.35 * confidence;
    } else if (session.categoryDistribution[product.category]) {
      score += session.categoryDistribution[product.category] * 0.30;
    }

    // Recent items sequence proximity
    const recentItemIdx = session.recentItems.indexOf(product.id);
    if (recentItemIdx !== -1) {
      // Recency distance boost
      const positionFactor = (recentItemIdx + 1) / Math.max(1, session.recentItems.length);
      score += 0.20 * positionFactor;
    }

    // Dwell-time signal influence (Requirement 8)
    if (session.dwellSignalActive && session.totalDwellMs > 0) {
      // Find events specifically on this item
      const itemEvents = session.recentInteractionSequence.filter(e => e.productId === product.id);
      const itemDwell = itemEvents.reduce((acc, curr) => acc + (curr.dwellMs || 0), 0);
      if (itemDwell > 0) {
        // Bounded dwell influence
        const dwellFactor = Math.min(0.18, Math.log1p(itemDwell / 1000) * 0.07);
        score += dwellFactor;
      }
    }

    return Math.min(1.0, Math.max(0.10, parseFloat(score.toFixed(4))));
  }

  /**
   * 3. Collaborative Filtering / Co-Occurrence Score S_collab(item)
   * When trained from real session interactions, computes item-item collaborative cosine similarity.
   * On Stage 0 (0 interactions), collaborative evidence is unobserved -> 0.0 (cold-start baseline).
   */
  public static calculateCollaborativeScore(
    product: Product,
    session: StructuredSessionState,
    catalog: Map<string, Product>
  ): number {
    if (session.interactionCount === 0 || session.recentItems.length === 0) {
      // Unobserved session evidence: true Collaborative Filtering cold-start floor
      return 0.0;
    }

    // If Item-Item Collaborative Filtering matrix is populated from interaction data
    if (this.itemCoOccurrenceMatrix.size > 0) {
      const recentIds = session.recentItems.slice(-5);
      let simSum = 0;
      let count = 0;

      recentIds.forEach(histId => {
        const neighbors = this.itemCoOccurrenceMatrix.get(histId);
        if (neighbors && neighbors.has(product.id)) {
          simSum += neighbors.get(product.id)!;
          count++;
        }
      });

      if (count > 0) {
        return Math.min(1.0, parseFloat((simSum / recentIds.length).toFixed(4)));
      }
      return 0.05; // No collaborative co-occurrence observed between history and candidate
    }

    // Domain heuristic fallback when offline matrix is not yet initialized
    const ensembleGraph: Record<string, string[]> = {
      Tops: ['Trousers', 'Footwear', 'Outerwear'],
      Outerwear: ['Knitwear', 'Trousers', 'Tailoring'],
      Tailoring: ['Trousers', 'Footwear', 'Accessories'],
      Knitwear: ['Trousers', 'Outerwear'],
      Dresses: ['Footwear', 'Accessories', 'Outerwear'],
      Trousers: ['Footwear', 'Tops', 'Outerwear'],
      Footwear: ['Accessories', 'Tops'],
      Accessories: ['Outerwear', 'Tailoring']
    };

    let coOccurrenceSignal = 0.20;
    const viewedCategories = session.recentCategories;

    viewedCategories.forEach(vCat => {
      if (vCat === product.category) {
        coOccurrenceSignal += 0.15;
      }
      const complementary = ensembleGraph[vCat] || [];
      if (complementary.includes(product.category)) {
        coOccurrenceSignal += 0.25;
      }
    });

    const normalized = Math.min(1.0, coOccurrenceSignal / (1 + viewedCategories.length * 0.15));
    return parseFloat(normalized.toFixed(4));
  }

  /**
   * 4. Popularity Prior Score S_popularity(item)
   * Computed from empirical interaction frequency in training logs when available,
   * combined with verified ratings.
   */
  public static calculatePopularityScore(product: Product): number {
    if (this.itemInteractionFreq.size > 0) {
      const freq = this.itemInteractionFreq.get(product.id) || 0;
      const normFreq = freq / Math.max(1, this.maxItemFreq);
      const ratingBonus = product.rating ? (product.rating / 5.0) * 0.2 : 0.1;
      return Math.min(1.0, Math.max(0.05, parseFloat((normFreq * 0.8 + ratingBonus).toFixed(4))));
    }

    const rawPop = product.popularityScore || 0.65;
    const ratingBonus = product.rating ? (product.rating - 3.5) / 1.5 * 0.15 : 0.05;
    return Math.min(1.0, Math.max(0.10, parseFloat((rawPop * 0.85 + ratingBonus).toFixed(4))));
  }
}
