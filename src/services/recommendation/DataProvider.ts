import { Product } from '../../types';
import { INITIAL_PRODUCTS } from '../../data/products';
import { SessionEvent, SessionStage } from './types';

export interface DataProvider {
  getProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | undefined>;
  getProductsByCategory(category: string): Promise<Product[]>;
}

export class DemoDataProvider implements DataProvider {
  private products: Product[];

  constructor(products: Product[] = INITIAL_PRODUCTS) {
    this.products = products;
  }

  public async getProducts(): Promise<Product[]> {
    return [...this.products];
  }

  public async getProductById(id: string): Promise<Product | undefined> {
    return this.products.find(p => p.id === id);
  }

  public async getProductsByCategory(category: string): Promise<Product[]> {
    if (category === 'All') return [...this.products];
    return this.products.filter(p => p.category === category);
  }
}

export const defaultDataProvider = new DemoDataProvider();

/**
 * Standardized Benchmark Evaluation Dataset Split
 * Represents realistic fashion shopping trajectories with ground-truth held-out target items
 * partitioned across Cold-Start stages (Group A, B, C, D).
 */
export interface EvaluationSessionCase {
  sessionId: string;
  stage: SessionStage;
  historyEvents: SessionEvent[];
  groundTruthRelevantIds: string[]; // held-out items the user would legitimately accept/buy
}

export const BENCHMARK_EVALUATION_DATASET: EvaluationSessionCase[] = [
  // --- GROUP A: Stage 0 (0 interactions - pure cold start) ---
  {
    sessionId: 'eval-stage0-01',
    stage: 0,
    historyEvents: [],
    groundTruthRelevantIds: ['prod-01', 'prod-03', 'prod-06'] // Popular contemporary staples
  },
  {
    sessionId: 'eval-stage0-02',
    stage: 0,
    historyEvents: [],
    groundTruthRelevantIds: ['prod-02', 'prod-04', 'prod-10']
  },
  {
    sessionId: 'eval-stage0-03',
    stage: 0,
    historyEvents: [],
    groundTruthRelevantIds: ['prod-05', 'prod-07', 'prod-12']
  },
  {
    sessionId: 'eval-stage0-04',
    stage: 0,
    historyEvents: [],
    groundTruthRelevantIds: ['prod-01', 'prod-08', 'prod-14']
  },

  // --- GROUP B: Stage 1 (1 interaction - first signal cold start) ---
  {
    sessionId: 'eval-stage1-01',
    stage: 1,
    historyEvents: [
      { id: 'e1', sessionId: 'eval-stage1-01', eventType: 'product_view', productId: 'prod-01', category: 'Outerwear', dwellMs: 2400, timestamp: 1000 }
    ],
    groundTruthRelevantIds: ['prod-02', 'prod-03', 'prod-11'] // Complementary & similar outerwear/knitwear
  },
  {
    sessionId: 'eval-stage1-02',
    stage: 1,
    historyEvents: [
      { id: 'e2', sessionId: 'eval-stage1-02', eventType: 'product_view', productId: 'prod-07', category: 'Tailoring', dwellMs: 3100, timestamp: 1000 }
    ],
    groundTruthRelevantIds: ['prod-08', 'prod-09', 'prod-13']
  },
  {
    sessionId: 'eval-stage1-03',
    stage: 1,
    historyEvents: [
      { id: 'e3', sessionId: 'eval-stage1-03', eventType: 'product_click', productId: 'prod-04', category: 'Dresses', dwellMs: 4200, timestamp: 1000 }
    ],
    groundTruthRelevantIds: ['prod-05', 'prod-15', 'prod-16']
  },
  {
    sessionId: 'eval-stage1-04',
    stage: 1,
    historyEvents: [
      { id: 'e4', sessionId: 'eval-stage1-04', eventType: 'product_view', productId: 'prod-10', category: 'Footwear', dwellMs: 1800, timestamp: 1000 }
    ],
    groundTruthRelevantIds: ['prod-11', 'prod-12', 'prod-17']
  },

  // --- GROUP C: Stage 2 (2-4 interactions - early session adaptation) ---
  {
    sessionId: 'eval-stage2-01',
    stage: 2,
    historyEvents: [
      { id: 'e5', sessionId: 'eval-stage2-01', eventType: 'product_view', productId: 'prod-01', category: 'Outerwear', dwellMs: 2500, timestamp: 1000 },
      { id: 'e6', sessionId: 'eval-stage2-01', eventType: 'product_click', productId: 'prod-02', category: 'Outerwear', dwellMs: 3800, timestamp: 2000 },
      { id: 'e7', sessionId: 'eval-stage2-01', eventType: 'category_view', category: 'Knitwear', timestamp: 3000 }
    ],
    groundTruthRelevantIds: ['prod-03', 'prod-06', 'prod-18']
  },
  {
    sessionId: 'eval-stage2-02',
    stage: 2,
    historyEvents: [
      { id: 'e8', sessionId: 'eval-stage2-02', eventType: 'product_view', productId: 'prod-07', category: 'Tailoring', dwellMs: 1900, timestamp: 1000 },
      { id: 'e9', sessionId: 'eval-stage2-02', eventType: 'product_click', productId: 'prod-08', category: 'Trousers', dwellMs: 2800, timestamp: 2000 }
    ],
    groundTruthRelevantIds: ['prod-09', 'prod-13', 'prod-14']
  },
  {
    sessionId: 'eval-stage2-03',
    stage: 2,
    historyEvents: [
      { id: 'e10', sessionId: 'eval-stage2-03', eventType: 'product_view', productId: 'prod-04', category: 'Dresses', dwellMs: 3400, timestamp: 1000 },
      { id: 'e11', sessionId: 'eval-stage2-03', eventType: 'product_open', productId: 'prod-05', category: 'Dresses', dwellMs: 4500, timestamp: 2000 },
      { id: 'e12', sessionId: 'eval-stage2-03', eventType: 'wishlist_add', productId: 'prod-05', category: 'Dresses', timestamp: 2500 }
    ],
    groundTruthRelevantIds: ['prod-15', 'prod-16', 'prod-20']
  },

  // --- GROUP D: Stage 3 (5+ interactions - mature session) ---
  {
    sessionId: 'eval-stage3-01',
    stage: 3,
    historyEvents: [
      { id: 'e13', sessionId: 'eval-stage3-01', eventType: 'product_view', productId: 'prod-01', category: 'Outerwear', dwellMs: 2000, timestamp: 1000 },
      { id: 'e14', sessionId: 'eval-stage3-01', eventType: 'product_click', productId: 'prod-02', category: 'Outerwear', dwellMs: 2400, timestamp: 2000 },
      { id: 'e15', sessionId: 'eval-stage3-01', eventType: 'product_open', productId: 'prod-03', category: 'Knitwear', dwellMs: 3900, timestamp: 3000 },
      { id: 'e16', sessionId: 'eval-stage3-01', eventType: 'product_view', productId: 'prod-06', category: 'Trousers', dwellMs: 1700, timestamp: 4000 },
      { id: 'e17', sessionId: 'eval-stage3-01', eventType: 'add_to_cart', productId: 'prod-01', category: 'Outerwear', timestamp: 5000 },
      { id: 'e18', sessionId: 'eval-stage3-01', eventType: 'search', searchQuery: 'cashmere trench', timestamp: 6000 }
    ],
    groundTruthRelevantIds: ['prod-02', 'prod-18', 'prod-19']
  },
  {
    sessionId: 'eval-stage3-02',
    stage: 3,
    historyEvents: [
      { id: 'e19', sessionId: 'eval-stage3-02', eventType: 'product_view', productId: 'prod-07', category: 'Tailoring', dwellMs: 2100, timestamp: 1000 },
      { id: 'e20', sessionId: 'eval-stage3-02', eventType: 'product_click', productId: 'prod-08', category: 'Trousers', dwellMs: 2500, timestamp: 2000 },
      { id: 'e21', sessionId: 'eval-stage3-02', eventType: 'product_view', productId: 'prod-09', category: 'Tailoring', dwellMs: 3100, timestamp: 3000 },
      { id: 'e22', sessionId: 'eval-stage3-02', eventType: 'product_open', productId: 'prod-13', category: 'Footwear', dwellMs: 4000, timestamp: 4000 },
      { id: 'e23', sessionId: 'eval-stage3-02', eventType: 'wishlist_add', productId: 'prod-07', category: 'Tailoring', timestamp: 4500 }
    ],
    groundTruthRelevantIds: ['prod-14', 'prod-21', 'prod-22']
  }
];
