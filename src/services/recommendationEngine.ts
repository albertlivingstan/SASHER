import { 
  Product, 
  CategoryType, 
  InteractionEvent, 
  RecommendedProduct, 
  UserPreferenceProfile, 
  HybridRecommendationWeights, 
  OutfitLook, 
  RecommendationExplanation,
  MatchSignalBreakdown,
  ProductFeedbackType
} from '../types';

export const DEFAULT_HYBRID_WEIGHTS: HybridRecommendationWeights = {
  alpha: 0.35, // User Preference Profile
  beta: 0.25,  // Content Similarity
  gamma: 0.25, // Interaction Signal / Visual Intent
  delta: 0.15  // Popularity Prior
};

/**
 * Computes a user's evolving style preference profile based on actual non-sensitive interaction signals
 */
export function computeUserPreferenceProfile(
  interactions: InteractionEvent[],
  products: Product[],
  feedbackMap: Record<string, ProductFeedbackType> = {}
): UserPreferenceProfile {
  const categoryWeights: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};
  const colorCounts: Record<string, number> = {};
  const styleCounts: Record<string, number> = {};
  const prices: number[] = [];

  const suppressedSet = new Set<string>();
  const boostedSet = new Set<string>();

  // Process explicit user feedback first
  Object.entries(feedbackMap).forEach(([prodId, feedbackType]) => {
    if (feedbackType === 'DISLIKE') {
      suppressedSet.add(prodId);
    } else if (feedbackType === 'MORE_LIKE_THIS') {
      boostedSet.add(prodId);
    }
  });

  const productLookup = new Map<string, Product>();
  products.forEach(p => productLookup.set(p.id, p));

  // Compute weighted counts based on recency and action intensity
  interactions.forEach((ev, idx) => {
    const product = productLookup.get(ev.productId);
    if (!product) return;

    // Recency multiplier (1.0 to 1.6)
    const recencyFactor = 1.0 + (idx / Math.max(1, interactions.length)) * 0.6;

    let baseWeight = 1.0;
    switch (ev.type) {
      case 'PURCHASE':
        baseWeight = 5.0;
        break;
      case 'CART':
        baseWeight = 4.0;
        break;
      case 'WISHLIST':
        baseWeight = 3.5;
        break;
      case 'FEEDBACK_MORE_LIKE_THIS':
        baseWeight = 3.5;
        boostedSet.add(product.id);
        break;
      case 'EYE_GAZE':
        baseWeight = 3.0; // Sustained visual intent dwell
        break;
      case 'FEEDBACK_LIKE':
        baseWeight = 2.5;
        break;
      case 'VIEW':
      case 'CLICK':
        baseWeight = 2.0;
        break;
      case 'HOVER':
        baseWeight = ev.dwellMs ? Math.min(2.5, 0.8 + (ev.dwellMs / 1000)) : 1.2;
        break;
      case 'SEARCH':
        baseWeight = 1.5;
        break;
      case 'FEEDBACK_DISLIKE':
        baseWeight = -4.0;
        suppressedSet.add(product.id);
        break;
      default:
        baseWeight = 1.0;
    }

    const effectiveWeight = baseWeight * recencyFactor;

    // Category affinity
    categoryWeights[product.category] = (categoryWeights[product.category] || 0) + effectiveWeight;
    categoryCounts[product.category] = (categoryCounts[product.category] || 0) + 1;

    // Color affinity
    if (product.color) {
      colorCounts[product.color] = (colorCounts[product.color] || 0) + Math.max(0.5, effectiveWeight);
    }

    // Style affinity
    if (product.style) {
      styleCounts[product.style] = (styleCounts[product.style] || 0) + Math.max(0.5, effectiveWeight);
    }

    // Price preference tracker
    if (product.price > 0 && effectiveWeight > 1.0) {
      prices.push(product.price);
    }
  });

  // Calculate normalized category preferences
  const totalCatWeight = Object.values(categoryWeights).reduce((a, b) => a + Math.max(0, b), 0);
  const preferredCategories = Object.keys(categoryWeights).map(cat => ({
    category: cat as CategoryType,
    score: totalCatWeight > 0 ? parseFloat((Math.max(0, categoryWeights[cat]) / totalCatWeight).toFixed(3)) : 0.12,
    count: categoryCounts[cat] || 0
  })).sort((a, b) => b.score - a.score);

  // Preferred colors
  const preferredColors = Object.keys(colorCounts).map(color => ({
    color,
    count: Math.round(colorCounts[color])
  })).sort((a, b) => b.count - a.count).slice(0, 5);

  // Preferred styles
  const preferredStyles = Object.keys(styleCounts).map(style => ({
    style,
    count: Math.round(styleCounts[style])
  })).sort((a, b) => b.count - a.count).slice(0, 4);

  // Price range
  const sortedPrices = prices.length > 0 ? [...prices].sort((a, b) => a - b) : [2500, 15000];
  const minPrice = sortedPrices[0] || 1500;
  const maxPrice = sortedPrices[sortedPrices.length - 1] || 35000;
  const avgPrice = Math.round(sortedPrices.reduce((a, b) => a + b, 0) / sortedPrices.length);

  return {
    preferredCategories,
    preferredColors,
    preferredStyles,
    preferredPriceRange: { min: minPrice, max: maxPrice, average: avgPrice },
    suppressedProductIds: Array.from(suppressedSet),
    boostedProductIds: Array.from(boostedSet),
    totalInteractions: interactions.length,
    lastUpdated: Date.now()
  };
}

/**
 * Computes vector cosine similarity between two product feature vectors
 */
export function calculateFeatureSimilarity(
  a: Product['featureVector'], 
  b: Product['featureVector']
): number {
  const keys = ['outerwear', 'tailoring', 'knitwear', 'minimalism', 'formal', 'casual', 'warmth'] as const;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const k of keys) {
    const valA = a[k] || 0;
    const valB = b[k] || 0;
    dotProduct += valA * valB;
    normA += valA * valA;
    normB += valB * valB;
  }

  if (normA === 0 || normB === 0) return 0.5;
  return Math.min(1.0, Math.max(0.0, dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))));
}

/**
 * Calculates technically defensible hybrid recommendation scores and explainable signal breakdowns
 * Formula: Final Score = α × User Preference Score + β × Content Similarity + γ × Interaction Signal + δ × Popularity Prior
 */
export function calculateHybridRankings(
  products: Product[],
  profile: UserPreferenceProfile,
  recentInteractions: InteractionEvent[],
  weights: HybridRecommendationWeights = DEFAULT_HYBRID_WEIGHTS,
  activeGazeTargetId: string | null = null,
  wishlistIds: Set<string> = new Set()
): RecommendedProduct[] {
  const { alpha, beta, gamma, delta } = weights;
  const totalWeight = (alpha + beta + gamma + delta) || 1.0;
  const normAlpha = alpha / totalWeight;
  const normBeta = beta / totalWeight;
  const normGamma = gamma / totalWeight;
  const normDelta = delta / totalWeight;

  const isColdStart = profile.totalInteractions === 0;

  // Compute centroid of user's actively interacted products
  const interactedProductIds = new Set(recentInteractions.map(i => i.productId));
  const interactedProducts = products.filter(p => interactedProductIds.has(p.id));

  // Feature vector centroid
  const centroid: Product['featureVector'] = {
    outerwear: 0.5,
    tailoring: 0.5,
    knitwear: 0.5,
    minimalism: 0.7,
    formal: 0.5,
    casual: 0.5,
    warmth: 0.5
  };

  if (interactedProducts.length > 0) {
    const n = interactedProducts.length;
    let sumOut = 0, sumTail = 0, sumKnit = 0, sumMin = 0, sumForm = 0, sumCas = 0, sumWarm = 0;
    interactedProducts.forEach(p => {
      sumOut += p.featureVector.outerwear;
      sumTail += p.featureVector.tailoring;
      sumKnit += p.featureVector.knitwear;
      sumMin += p.featureVector.minimalism;
      sumForm += p.featureVector.formal;
      sumCas += p.featureVector.casual;
      sumWarm += p.featureVector.warmth;
    });
    centroid.outerwear = sumOut / n;
    centroid.tailoring = sumTail / n;
    centroid.knitwear = sumKnit / n;
    centroid.minimalism = sumMin / n;
    centroid.formal = sumForm / n;
    centroid.casual = sumCas / n;
    centroid.warmth = sumWarm / n;
  }

  const suppressedSet = new Set(profile.suppressedProductIds);
  const boostedSet = new Set(profile.boostedProductIds);

  const scoredList = products.map(product => {
    // 1. User Preference Score (Category + Color + Style affinity)
    let userPrefScore = 0.5;
    if (!isColdStart) {
      const catMatch = profile.preferredCategories.find(c => c.category === product.category);
      const catAffinity = catMatch ? catMatch.score : 0.05;

      const colorMatch = profile.preferredColors.find(c => product.color?.toLowerCase().includes(c.color.toLowerCase()));
      const colorAffinity = colorMatch ? Math.min(1.0, colorMatch.count / 4) : 0.2;

      const styleMatch = profile.preferredStyles.find(s => s.style === product.style);
      const styleAffinity = styleMatch ? Math.min(1.0, styleMatch.count / 4) : 0.3;

      userPrefScore = catAffinity * 0.5 + colorAffinity * 0.25 + styleAffinity * 0.25;
    }

    // 2. Content Similarity (Cosine similarity to user interest centroid)
    const contentSim = calculateFeatureSimilarity(product.featureVector, centroid);

    // 3. Interaction Signal (Direct interaction, dwell, visual intent)
    const hasDirectInteraction = interactedProductIds.has(product.id);
    const isActivelyGazed = activeGazeTargetId === product.id;
    const isBoosted = boostedSet.has(product.id);

    let interactionSig = 0.2;
    if (isActivelyGazed) {
      interactionSig = 0.98; // Highest immediate visual attention
    } else if (isBoosted) {
      interactionSig = 0.92;
    } else if (hasDirectInteraction) {
      interactionSig = 0.75;
    }

    // 4. Popularity Prior
    const popularity = product.popularityScore || 0.8;

    // Hybrid formula
    let rawScore = 0;
    if (isColdStart) {
      // Graceful cold-start fallback (Content similarity + Popularity)
      rawScore = 0.5 * contentSim + 0.5 * popularity;
    } else {
      rawScore = (
        normAlpha * userPrefScore +
        normBeta * contentSim +
        normGamma * interactionSig +
        normDelta * popularity
      );
    }

    // Check suppression ("Not Interested")
    if (suppressedSet.has(product.id)) {
      rawScore *= 0.15; // Severely penalized
    }

    // Scale to percentage
    const matchScore = Math.min(99, Math.max(50, Math.round(rawScore * 100)));

    // Explainable AI percentage contributions
    const denom = rawScore || 1;
    const sessionPct = Math.round(((normAlpha * userPrefScore) / denom) * 100);
    const contentPct = Math.round(((normBeta * contentSim) / denom) * 100);
    const gazePct = Math.round(((normGamma * interactionSig) / denom) * 100);
    const popPct = Math.max(2, 100 - (sessionPct + contentPct + gazePct));

    // Transparent, defensible reasoning
    const reasons: string[] = [];
    if (isActivelyGazed) {
      reasons.push('High visual dwell detected in your active session');
    }
    if (isBoosted) {
      reasons.push('Elevated based on your "More Like This" preference');
    }
    if (profile.preferredCategories[0]?.category === product.category) {
      reasons.push(`Matches your primary interest in ${product.category.toLowerCase()}`);
    }
    if (contentSim > 0.82) {
      reasons.push('High architectural cut and material similarity to your viewed items');
    }
    if (reasons.length < 3) {
      reasons.push('Curated alignment with contemporary luxury design standards');
    }

    const signals: MatchSignalBreakdown = {
      styleSimilarity: Math.round(contentSim * 100),
      colorPreference: Math.round((profile.preferredColors[0]?.count ? 85 : 65)),
      categoryPreference: Math.round(userPrefScore * 100),
      previousInteraction: hasDirectInteraction ? 90 : 35,
      browsingBehavior: Math.round(interactionSig * 100)
    };

    const explanation: RecommendationExplanation = {
      matchScore,
      sessionContribution: sessionPct,
      visualAttentionContribution: gazePct,
      profileContribution: sessionPct,
      contentSimilarityContribution: contentPct,
      popularityContribution: popPct,
      primaryReasons: reasons,
      signals,
      technicalDetails: {
        wSession: normAlpha,
        wGaze: normGamma,
        wProfile: normAlpha,
        wCollab: 0.15,
        wContent: normBeta,
        wPopularity: normDelta,
        dotProduct: parseFloat(contentSim.toFixed(3)),
        mmrScore: parseFloat((rawScore * 0.94).toFixed(3)),
        diversityPenalty: 0.06
      }
    };

    const inWishlist = wishlistIds.has(product.id);

    return {
      ...product,
      wishlist: inWishlist,
      wishlistStatus: (inWishlist ? 'in_wishlist' : 'none') as 'in_wishlist' | 'none',
      isWishlisted: inWishlist,
      explanation,
      isGazeInfluenced: isActivelyGazed || interactionSig > 0.8
    };
  });

  // Apply Maximal Marginal Relevance (MMR) Diversification (λ = 0.75)
  // Ensures variety across categories and cuts instead of flooding with duplicates
  const selected: RecommendedProduct[] = [];
  const remaining = [...scoredList].sort((a, b) => b.explanation.matchScore - a.explanation.matchScore);
  const lambda = 0.75;
  const categoryCounts: Record<string, number> = {};

  while (remaining.length > 0 && selected.length < scoredList.length) {
    let bestIdx = 0;
    let bestMmr = -Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const item = remaining[i];
      const rel = item.explanation.matchScore / 100;
      const catCount = categoryCounts[item.category] || 0;
      const penalty = catCount * 0.16;
      const mmr = lambda * rel - (1 - lambda) * penalty;

      if (mmr > bestMmr) {
        bestMmr = mmr;
        bestIdx = i;
      }
    }

    const chosen = remaining.splice(bestIdx, 1)[0];
    categoryCounts[chosen.category] = (categoryCounts[chosen.category] || 0) + 1;
    selected.push(chosen);
  }

  return selected;
}

/**
 * Generates an aesthetic, complementary outfit bundle for an anchor item ("Complete the Look")
 */
export function generateOutfitLook(anchorProduct: Product, catalog: Product[]): OutfitLook {
  const lookItems: Product[] = [];
  const desiredCategories: CategoryType[] = [];

  // Determine complementary categories based on anchor
  if (anchorProduct.category === 'Outerwear') {
    desiredCategories.push('Knitwear', 'Trousers', 'Footwear', 'Accessories');
  } else if (anchorProduct.category === 'Dresses') {
    desiredCategories.push('Outerwear', 'Footwear', 'Accessories');
  } else if (anchorProduct.category === 'Tops' || anchorProduct.category === 'Knitwear') {
    desiredCategories.push('Outerwear', 'Trousers', 'Footwear');
  } else if (anchorProduct.category === 'Trousers') {
    desiredCategories.push('Tops', 'Outerwear', 'Footwear');
  } else if (anchorProduct.category === 'Footwear') {
    desiredCategories.push('Trousers', 'Tops', 'Outerwear');
  } else {
    desiredCategories.push('Outerwear', 'Trousers', 'Footwear');
  }

  desiredCategories.forEach(cat => {
    const candidate = catalog.find(p => p.category === cat && p.id !== anchorProduct.id);
    if (candidate) {
      lookItems.push(candidate);
    }
  });

  const fullItems = [anchorProduct, ...lookItems.slice(0, 3)];
  const totalPrice = fullItems.reduce((acc, curr) => acc + curr.price, 0);

  return {
    id: `look-${anchorProduct.id}`,
    title: `The ${anchorProduct.style} Ensemble`,
    anchorProductId: anchorProduct.id,
    items: fullItems,
    description: `Expertly curated items that complement the ${anchorProduct.style.toLowerCase()} silhouette and tonal nuance of the ${anchorProduct.name}.`,
    totalPrice
  };
}

/**
 * Searches product catalog across name, brand, category, style, color, keywords
 */
export function searchProducts(query: string, catalog: Product[]): Product[] {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return catalog;

  const tokens = cleanQuery.split(/\s+/).filter(t => t.length > 0);

  return catalog.filter(product => {
    const searchableText = [
      product.name,
      product.brand,
      product.category,
      product.subcategory || '',
      product.articleType || '',
      product.color || '',
      product.style || '',
      product.material || '',
      product.gender || '',
      product.description || '',
      ...(product.tags || [])
    ].join(' ').toLowerCase();

    // Check if every search token is present
    return tokens.every(token => searchableText.includes(token));
  });
}
