import { Product } from '../types';

export interface CBFItemProfile {
  productId: string;
  denseVector: number[];
  tokenWeights: Record<string, number>;
  categoryVector: Record<string, number>;
  priceTier: number; // 0: <₹2000, 1: ₹2000-₹5000, 2: ₹5000-₹12000, 3: >₹12000
}

export class CBFEngine {
  private itemProfiles: Map<string, CBFItemProfile> = new Map();
  private vocabulary: Map<string, number> = new Map(); // token -> df
  private totalDocuments = 0;

  /**
   * Initializes or updates the vocabulary and precomputes TF-IDF dense profiles for all products
   */
  public fit(products: Product[]) {
    this.itemProfiles.clear();
    this.vocabulary.clear();
    this.totalDocuments = products.length;

    // 1. Build Document Frequency (DF) map
    products.forEach(p => {
      const tokens = this.extractTokens(p);
      const uniqueTokens = new Set(tokens);
      uniqueTokens.forEach(t => {
        this.vocabulary.set(t, (this.vocabulary.get(t) || 0) + 1);
      });
    });

    // 2. Precompute TF-IDF vector & dense attributes for each item
    products.forEach(p => {
      const tokens = this.extractTokens(p);
      const tf: Record<string, number> = {};
      tokens.forEach(t => {
        tf[t] = (tf[t] || 0) + 1;
      });

      const tokenWeights: Record<string, number> = {};
      let vectorNorm = 0;

      Object.entries(tf).forEach(([token, count]) => {
        const tfVal = count / tokens.length;
        const dfVal = this.vocabulary.get(token) || 1;
        const idfVal = Math.log((this.totalDocuments + 1) / (dfVal + 1)) + 1;
        const tfidf = tfVal * idfVal;
        tokenWeights[token] = tfidf;
        vectorNorm += tfidf * tfidf;
      });

      // Normalize TF-IDF weights
      const sqrtNorm = Math.sqrt(vectorNorm) || 1;
      Object.keys(tokenWeights).forEach(t => {
        tokenWeights[t] /= sqrtNorm;
      });

      // Dense feature vector (8 continuous aesthetic & silhouette dimensions)
      const fv = p.featureVector;
      const denseVector = [
        fv.outerwear || 0,
        fv.tailoring || 0,
        fv.knitwear || 0,
        fv.minimalism || 0,
        fv.formal || 0,
        fv.casual || 0,
        fv.warmth || 0,
        fv.traditional || (p.style === 'Traditional' ? 0.9 : 0.1)
      ];

      // Price tier
      let priceTier = 1;
      if (p.price < 2000) priceTier = 0;
      else if (p.price <= 5000) priceTier = 1;
      else if (p.price <= 15000) priceTier = 2;
      else priceTier = 3;

      this.itemProfiles.set(p.id, {
        productId: p.id,
        denseVector,
        tokenWeights,
        categoryVector: { [p.category]: 1.0 },
        priceTier
      });
    });
  }

  /**
   * Tokenizes text and structured attributes
   */
  private extractTokens(p: Product): string[] {
    const rawTokens: string[] = [
      p.category.toLowerCase(),
      (p.subcategory || '').toLowerCase(),
      p.brand.toLowerCase(),
      (p.style || '').toLowerCase(),
      (p.color || '').toLowerCase(),
      (p.material || '').toLowerCase(),
      (p.occasion || '').toLowerCase(),
      (p.season || '').toLowerCase(),
      p.gender.toLowerCase()
    ];

    if (p.tags) {
      p.tags.forEach(t => rawTokens.push(t.toLowerCase()));
    }

    // Add description words (letters only, length >= 3)
    const words = (p.description || '').toLowerCase().match(/[a-z]{3,}/g) || [];
    words.forEach(w => rawTokens.push(w));

    return rawTokens.filter(t => t.trim().length > 0);
  }

  /**
   * Computes Content-Based Similarity between two products (Item-to-Item)
   * Combines TF-IDF cosine similarity + feature vector cosine + price tier match
   */
  public computeItemSimilarity(itemAId: string, itemBId: string, catalog: Product[]): number {
    if (itemAId === itemBId) return 1.0;

    let profileA = this.itemProfiles.get(itemAId);
    let profileB = this.itemProfiles.get(itemBId);

    if (!profileA || !profileB) {
      this.fit(catalog);
      profileA = this.itemProfiles.get(itemAId);
      profileB = this.itemProfiles.get(itemBId);
      if (!profileA || !profileB) return 0.4;
    }

    // 1. TF-IDF Token Dot Product (sparse cosine similarity)
    let tfidfDot = 0;
    const tokensA = Object.keys(profileA.tokenWeights);
    for (const t of tokensA) {
      if (profileB.tokenWeights[t]) {
        tfidfDot += profileA.tokenWeights[t] * profileB.tokenWeights[t];
      }
    }

    // 2. Dense Feature Vector Cosine
    let denseDot = 0;
    let normDenseA = 0;
    let normDenseB = 0;
    for (let i = 0; i < profileA.denseVector.length; i++) {
      denseDot += profileA.denseVector[i] * profileB.denseVector[i];
      normDenseA += profileA.denseVector[i] * profileA.denseVector[i];
      normDenseB += profileB.denseVector[i] * profileB.denseVector[i];
    }
    const denseCos = (normDenseA > 0 && normDenseB > 0)
      ? denseDot / (Math.sqrt(normDenseA) * Math.sqrt(normDenseB))
      : 0.5;

    // 3. Price bracket compatibility
    const priceCompat = Math.max(0.4, 1.0 - Math.abs(profileA.priceTier - profileB.priceTier) * 0.25);

    // Weighted Content Similarity
    const combinedSim = 0.45 * denseCos + 0.40 * tfidfDot + 0.15 * priceCompat;
    return Math.min(1.0, Math.max(0.0, combinedSim));
  }

  /**
   * Computes CBF score of candidate product against a query vector or target preference profile
   */
  public computeCandidateCBFScore(
    candidate: Product,
    targetVector: number[],
    preferredCategories: string[] = []
  ): number {
    const profile = this.itemProfiles.get(candidate.id);
    const candidateDense = profile ? profile.denseVector : [
      candidate.featureVector.outerwear || 0,
      candidate.featureVector.tailoring || 0,
      candidate.featureVector.knitwear || 0,
      candidate.featureVector.minimalism || 0,
      candidate.featureVector.formal || 0,
      candidate.featureVector.casual || 0,
      candidate.featureVector.warmth || 0,
      candidate.featureVector.traditional || 0
    ];

    if (!targetVector || targetVector.length === 0) {
      return candidate.popularityScore || 0.5;
    }

    // Cosine similarity
    let dot = 0;
    let normA = 0;
    let normB = 0;
    const len = Math.min(targetVector.length, candidateDense.length);

    for (let i = 0; i < len; i++) {
      dot += targetVector[i] * candidateDense[i];
      normA += targetVector[i] * targetVector[i];
      normB += candidateDense[i] * candidateDense[i];
    }

    const baseSim = (normA > 0 && normB > 0) ? dot / (Math.sqrt(normA) * Math.sqrt(normB)) : 0.5;

    // Category bonus if in preferred set
    let catBonus = 0;
    if (preferredCategories.includes(candidate.category)) {
      catBonus = 0.12;
    }

    return Math.min(1.0, Math.max(0.0, baseSim + catBonus));
  }

  /**
   * Finds Top-K similar products using pure Content-Based signals (crucial for Item Cold-Start & 'Similar Products')
   */
  public getTopKSimilar(
    anchorProduct: Product, 
    catalog: Product[], 
    k = 5
  ): { product: Product; similarity: number }[] {
    this.fit(catalog);

    return catalog
      .filter(p => p.id !== anchorProduct.id)
      .map(p => ({
        product: p,
        similarity: this.computeItemSimilarity(anchorProduct.id, p.id, catalog)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, k);
  }
}

export const cbfEngine = new CBFEngine();
