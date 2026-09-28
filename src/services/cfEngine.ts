import { Product, CFModelArtifacts } from '../types';
import { INTERACTION_HYPERPARAM_WEIGHTS } from '../config/recommendationConfig';

export interface RawInteractionRecord {
  userId: string;
  productId: string;
  eventType: string;
  dwellMs?: number;
  timestamp: number;
}

export class CollaborativeFilteringEngine {
  private latentDimensions = 8;
  private learningRate = 0.015;
  private regularization = 0.05;
  private epochs = 25;

  private userEmbeddings: Map<string, number[]> = new Map();
  private itemEmbeddings: Map<string, number[]> = new Map();
  private userBiases: Map<string, number> = new Map();
  private itemBiases: Map<string, number> = new Map();
  private globalMean = 2.5;
  private isTrained = false;
  private trainingRMSE = 0.42;

  /**
   * Builds the interaction matrix and trains Latent Factor Matrix Factorization
   */
  public fit(interactions: RawInteractionRecord[], products: Product[]): CFModelArtifacts {
    const userItemPairs: Map<string, Map<string, number>> = new Map();
    let sumWeight = 0;
    let count = 0;

    // 1. Construct implicit interaction matrix with configurable weights
    interactions.forEach(ev => {
      const typeKey = (ev.eventType || '').toUpperCase();
      const weight = INTERACTION_HYPERPARAM_WEIGHTS[typeKey] || 1.0;

      if (!userItemPairs.has(ev.userId)) {
        userItemPairs.set(ev.userId, new Map());
      }
      const uMap = userItemPairs.get(ev.userId)!;
      uMap.set(ev.productId, (uMap.get(ev.productId) || 0) + weight);
      sumWeight += weight;
      count++;
    });

    this.globalMean = count > 0 ? sumWeight / count : 2.5;

    // 2. Initialize latent factor vectors (Gaussian random init)
    const userIds = Array.from(userItemPairs.keys());
    const itemIds = products.map(p => p.id);

    userIds.forEach(uid => {
      const vec = Array.from({ length: this.latentDimensions }, () => (Math.random() - 0.5) * 0.2);
      this.userEmbeddings.set(uid, vec);
      this.userBiases.set(uid, 0);
    });

    itemIds.forEach(iid => {
      const vec = Array.from({ length: this.latentDimensions }, () => (Math.random() - 0.5) * 0.2);
      this.itemEmbeddings.set(iid, vec);
      this.itemBiases.set(iid, 0);
    });

    // 3. Stochastic Gradient Descent (SGD) Matrix Factorization
    let finalLoss = 0;
    for (let epoch = 0; epoch < this.epochs; epoch++) {
      let epochLoss = 0;
      let samples = 0;

      userIds.forEach(uid => {
        const uMap = userItemPairs.get(uid)!;
        const p_u = this.userEmbeddings.get(uid)!;
        let b_u = this.userBiases.get(uid)!;

        uMap.forEach((rating, iid) => {
          let q_i = this.itemEmbeddings.get(iid);
          if (!q_i) {
            q_i = Array.from({ length: this.latentDimensions }, () => (Math.random() - 0.5) * 0.2);
            this.itemEmbeddings.set(iid, q_i);
            this.itemBiases.set(iid, 0);
          }
          let b_i = this.itemBiases.get(iid) || 0;

          // Prediction: r_hat = globalMean + b_u + b_i + dot(p_u, q_i)
          let dot = 0;
          for (let f = 0; f < this.latentDimensions; f++) {
            dot += p_u[f] * q_i[f];
          }
          const pred = this.globalMean + b_u + b_i + dot;
          const err = rating - pred;
          epochLoss += err * err;
          samples++;

          // Bias gradient updates
          b_u += this.learningRate * (err - this.regularization * b_u);
          b_i += this.learningRate * (err - this.regularization * b_i);
          this.userBiases.set(uid, b_u);
          this.itemBiases.set(iid, b_i);

          // Latent vector updates
          for (let f = 0; f < this.latentDimensions; f++) {
            const pOld = p_u[f];
            const qOld = q_i[f];
            p_u[f] += this.learningRate * (err * qOld - this.regularization * pOld);
            q_i[f] += this.learningRate * (err * pOld - this.regularization * qOld);
          }
        });
      });

      finalLoss = samples > 0 ? Math.sqrt(epochLoss / samples) : 0;
    }

    this.trainingRMSE = parseFloat(finalLoss.toFixed(4));
    this.isTrained = true;

    // Convert Map to plain Record for serialization/research inspection
    const userEmbRecord: Record<string, number[]> = {};
    this.userEmbeddings.forEach((v, k) => { userEmbRecord[k] = v.map(n => parseFloat(n.toFixed(4))); });

    const itemEmbRecord: Record<string, number[]> = {};
    this.itemEmbeddings.forEach((v, k) => { itemEmbRecord[k] = v.map(n => parseFloat(n.toFixed(4))); });

    const userBiasesRecord: Record<string, number> = {};
    this.userBiases.forEach((v, k) => { userBiasesRecord[k] = parseFloat(v.toFixed(4)); });

    const itemBiasesRecord: Record<string, number> = {};
    this.itemBiases.forEach((v, k) => { itemBiasesRecord[k] = parseFloat(v.toFixed(4)); });

    return {
      latentDimensions: this.latentDimensions,
      userEmbeddings: userEmbRecord,
      itemEmbeddings: itemEmbRecord,
      globalMean: parseFloat(this.globalMean.toFixed(3)),
      userBiases: userBiasesRecord,
      itemBiases: itemBiasesRecord,
      trainedEpochs: this.epochs,
      rmse: this.trainingRMSE
    };
  }

  /**
   * Predicts Collaborative Filtering relevance score for user and item
   * Returns normalized score between 0.0 and 1.0
   */
  public predict(userId: string | null | undefined, productId: string): number {
    const q_i = this.itemEmbeddings.get(productId);
    if (!q_i) {
      // Item Cold-Start: no CF item embedding exists
      return 0.35;
    }

    if (!userId || !this.userEmbeddings.has(userId)) {
      // User Cold-Start: fall back to item bias + normalized global baseline
      const b_i = this.itemBiases.get(productId) || 0;
      const raw = (this.globalMean + b_i) / 10.0;
      return Math.min(1.0, Math.max(0.1, raw));
    }

    const p_u = this.userEmbeddings.get(userId)!;
    const b_u = this.userBiases.get(userId) || 0;
    const b_i = this.itemBiases.get(productId) || 0;

    let dot = 0;
    for (let f = 0; f < this.latentDimensions; f++) {
      dot += p_u[f] * q_i[f];
    }

    const rawScore = this.globalMean + b_u + b_i + dot;
    // Sigmoid / scaled normalization to [0, 1]
    const normalized = 1 / (1 + Math.exp(-0.35 * (rawScore - 3.0)));
    return Math.min(1.0, Math.max(0.0, parseFloat(normalized.toFixed(3))));
  }

  public getUserEmbedding(userId: string): number[] | null {
    return this.userEmbeddings.get(userId) || null;
  }

  public getItemEmbedding(productId: string): number[] | null {
    return this.itemEmbeddings.get(productId) || null;
  }

  public getModelStatus(): { isTrained: boolean; rmse: number; latentDimensions: number; userCount: number; itemCount: number } {
    return {
      isTrained: this.isTrained,
      rmse: this.trainingRMSE,
      latentDimensions: this.latentDimensions,
      userCount: this.userEmbeddings.size,
      itemCount: this.itemEmbeddings.size
    };
  }
}

export const cfEngine = new CollaborativeFilteringEngine();
