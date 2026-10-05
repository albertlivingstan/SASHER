import { CategoryType, Product } from '../../types';
import { 
  SessionEvent, 
  SessionEventType, 
  SessionStage, 
  StructuredSessionState 
} from './types';

export class SessionTracker {
  private sessionId: string;
  private events: SessionEvent[] = [];
  private useDwellSignal: boolean = true;
  private productCatalog: Map<string, Product> = new Map();

  constructor(products: Product[] = []) {
    this.sessionId = this.generateSessionId();
    this.setCatalog(products);
    this.recordEvent('session_start');
  }

  public setCatalog(products: Product[]) {
    this.productCatalog.clear();
    products.forEach(p => this.productCatalog.set(p.id, p));
  }

  public setUseDwellSignal(enabled: boolean) {
    this.useDwellSignal = enabled;
  }

  public isDwellSignalActive(): boolean {
    return this.useDwellSignal;
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  public resetSession(newSessionId?: string) {
    this.sessionId = newSessionId || this.generateSessionId();
    this.events = [];
    this.recordEvent('session_start');
  }

  public recordEvent(
    eventType: SessionEventType,
    payload: {
      productId?: string;
      category?: CategoryType;
      dwellMs?: number;
      searchQuery?: string;
    } = {}
  ): SessionEvent {
    // If category not explicitly passed but productId is, resolve from catalog
    let resolvedCategory = payload.category;
    if (!resolvedCategory && payload.productId) {
      const prod = this.productCatalog.get(payload.productId);
      if (prod) resolvedCategory = prod.category;
    }

    const event: SessionEvent = {
      id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sessionId: this.sessionId,
      eventType,
      productId: payload.productId,
      category: resolvedCategory,
      dwellMs: payload.dwellMs,
      searchQuery: payload.searchQuery,
      timestamp: Date.now()
    };

    this.events.push(event);
    return event;
  }

  /**
   * Derives Session Maturity Stage (Requirement 4)
   * Stage 0: 0 interactions (Pure cold-start)
   * Stage 1: 1 interaction (First-touch signal)
   * Stage 2: 2–4 interactions (Early exploration)
   * Stage 3: 5+ interactions (Mature session)
   */
  public getStage(interactionCount: number): SessionStage {
    if (interactionCount === 0) return 0;
    if (interactionCount === 1) return 1;
    if (interactionCount <= 4) return 2;
    return 3;
  }

  public getStageDescription(stage: SessionStage): string {
    switch (stage) {
      case 0: return 'Stage 0 · Unobserved Cold-Start (0 actions)';
      case 1: return 'Stage 1 · First-Touch Orientation (1 action)';
      case 2: return 'Stage 2 · Early Trajectory Convergence (2-4 actions)';
      case 3: return 'Stage 3 · Established Session Context (5+ actions)';
    }
  }

  /**
   * Compiles the comprehensive StructuredSessionState (Requirement 3 & 7)
   */
  public getSessionState(): StructuredSessionState {
    // Meaningful interaction events exclude session_start
    const meaningfulEvents = this.events.filter(e => e.eventType !== 'session_start');
    const interactionCount = meaningfulEvents.length;
    const stage = this.getStage(interactionCount);
    const stageDescription = this.getStageDescription(stage);

    const recentItems: string[] = [];
    const recentCategories: CategoryType[] = [];
    const categoryCounts: Record<string, number> = {};
    const categoryWeights: Record<string, number> = {};
    let totalDwellMs = 0;
    let dwellCount = 0;

    // Temporal decay hyperparameter λ = 0.05 min^-1
    const now = Date.now();
    const lambda = 0.05;

    meaningfulEvents.forEach((ev, idx) => {
      if (ev.productId && !recentItems.includes(ev.productId)) {
        recentItems.push(ev.productId);
      }
      if (ev.category && ev.category !== 'All') {
        recentCategories.push(ev.category);
        categoryCounts[ev.category] = (categoryCounts[ev.category] || 0) + 1;

        // Weight calculation with recency decay
        const deltaMin = Math.max(0, (now - ev.timestamp) / 60000);
        const timeDecay = Math.exp(-lambda * deltaMin);

        // Event action multiplier
        let actionMultiplier = 1.0;
        if (ev.eventType === 'add_to_cart') actionMultiplier = 3.5;
        else if (ev.eventType === 'wishlist_add') actionMultiplier = 2.8;
        else if (ev.eventType === 'product_open') actionMultiplier = 2.0;
        else if (ev.eventType === 'product_click') actionMultiplier = 1.5;

        // Bounded dwell time signal (Requirement 8)
        let dwellMultiplier = 1.0;
        if (this.useDwellSignal && ev.dwellMs && ev.dwellMs > 0) {
          totalDwellMs += ev.dwellMs;
          dwellCount++;
          // Bounded logarithmic dwell influence: min 1.0, max 2.2
          dwellMultiplier = Math.min(2.2, 1.0 + Math.log1p(ev.dwellMs / 1000) * 0.4);
        }

        const effectiveEvWeight = timeDecay * actionMultiplier * dwellMultiplier;
        categoryWeights[ev.category] = (categoryWeights[ev.category] || 0) + effectiveEvWeight;
      }
    });

    // Normalized category distribution
    const totalCatWeight = Object.values(categoryWeights).reduce((a, b) => a + b, 0);
    const categoryDistribution: Record<CategoryType, number> = {
      All: 0,
      Tops: 0,
      Outerwear: 0,
      Tailoring: 0,
      Knitwear: 0,
      Dresses: 0,
      Trousers: 0,
      Footwear: 0,
      Accessories: 0
    };

    if (totalCatWeight > 0) {
      Object.entries(categoryWeights).forEach(([cat, w]) => {
        if (cat in categoryDistribution) {
          categoryDistribution[cat as CategoryType] = parseFloat((w / totalCatWeight).toFixed(3));
        }
      });
    } else {
      categoryDistribution.Outerwear = 0.25;
      categoryDistribution.Tailoring = 0.20;
      categoryDistribution.Tops = 0.20;
      categoryDistribution.Trousers = 0.15;
      categoryDistribution.Knitwear = 0.10;
      categoryDistribution.Footwear = 0.10;
    }

    // Infer dominant intent (Requirement 7)
    let dominantCategory: CategoryType = 'All';
    let maxWeight = -1;
    Object.entries(categoryWeights).forEach(([cat, w]) => {
      if (w > maxWeight) {
        maxWeight = w;
        dominantCategory = cat as CategoryType;
      }
    });

    if (dominantCategory === 'All' && recentCategories.length > 0) {
      dominantCategory = recentCategories[recentCategories.length - 1];
    } else if (dominantCategory === 'All') {
      dominantCategory = 'Outerwear';
    }

    // Mathematically grounded intent confidence:
    // C = (w_dominant / sum(w_i)) * min(1.0, sqrt(interactionCount) / 2)
    let confidence = 0.35; // base unobserved confidence
    if (interactionCount > 0 && totalCatWeight > 0 && maxWeight > 0) {
      const concentration = maxWeight / totalCatWeight;
      const maturityFactor = Math.min(1.0, Math.sqrt(interactionCount) / 2.2);
      confidence = Math.min(0.96, Math.max(0.40, parseFloat((concentration * maturityFactor + 0.15).toFixed(3))));
    }

    // Keywords extracted from recently viewed items
    const keywordsSet = new Set<string>();
    recentItems.slice(-4).forEach(id => {
      const prod = this.productCatalog.get(id);
      if (prod) {
        if (prod.style) keywordsSet.add(prod.style);
        if (prod.material) keywordsSet.add(prod.material);
        if (prod.silhouette) keywordsSet.add(prod.silhouette);
      }
    });

    return {
      sessionId: this.sessionId,
      interactionCount,
      stage,
      stageDescription,
      recentItems: recentItems.slice(-10),
      recentCategories: recentCategories.slice(-10),
      categoryDistribution,
      recentInteractionSequence: meaningfulEvents.slice(-15),
      averageDwellTimeMs: dwellCount > 0 ? Math.round(totalDwellMs / dwellCount) : 0,
      lastInteractionTime: meaningfulEvents.length > 0 
        ? meaningfulEvents[meaningfulEvents.length - 1].timestamp 
        : now,
      sessionIntent: {
        primaryCategory: dominantCategory,
        dominantStyle: Array.from(keywordsSet)[0] || 'Contemporary Tailoring',
        confidence,
        inferredKeywords: Array.from(keywordsSet),
        evidenceCount: categoryCounts[dominantCategory] || 0
      },
      dwellSignalActive: this.useDwellSignal,
      totalDwellMs
    };
  }

  private generateSessionId(): string {
    return `sess-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}
