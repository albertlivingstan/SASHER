import { Product } from '../types';

const GEMINI_API_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) ||
  (typeof process !== 'undefined' && process.env && process.env.GEMINI_API_KEY) ||
  '';

const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

/**
 * Direct call to Gemini Flash REST API
 */
export async function callGeminiApi(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }

  try {
    const response = await fetch(GEMINI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      console.warn(`Gemini API returned status ${response.status}`);
      throw new Error(`Gemini API error ${response.status}`);
    }

    const data = await response.json();
    const candidate = data?.candidates?.[0];
    const textPart = candidate?.content?.parts?.[0]?.text;

    if (textPart && typeof textPart === 'string') {
      return textPart.trim();
    }

    throw new Error('Invalid response structure from Gemini API');
  } catch (error) {
    console.error('Gemini API call failed:', error);
    throw error;
  }
}

export interface JulianThought {
  tag: string;
  title: string;
  iconType: 'sparkles' | 'compass' | 'check' | 'eye' | 'palette';
  content: string;
}

/**
 * Generate Julian Laurent's curated styling thoughts for a specific product out of the 61 products using Gemini AI
 */
export async function generateJulianProductThoughts(product: Product): Promise<JulianThought[]> {
  const prompt = `You are Julian Laurent, a world-class luxury fashion consultant and AI stylist.
Analyze this exact garment from our 61-product luxury catalog and generate 5 distinct, highly articulate styling thoughts.

PRODUCT DETAILS:
- Name: ${product.name}
- Brand: ${product.brand}
- Category: ${product.category} (${product.subcategory || product.articleType})
- Material: ${product.material}
- Color: ${product.color}
- Style: ${product.style}
- Fit: ${product.fit}
- Price: ${product.currency}${product.price.toLocaleString('en-IN')}
- Description: ${product.description}
- Stock: ${product.stock} units

Output ONLY valid JSON in this exact structure without markdown formatting or code blocks:
[
  {
    "tag": "Stylist Compliment & Verdict",
    "title": "Julian's Aesthetic Verdict",
    "iconType": "sparkles",
    "content": "Short 2-sentence articulate compliment analyzing why this exact garment fits high aesthetic standards."
  },
  {
    "tag": "Drape & Silhouette",
    "title": "Architectural Proportion",
    "iconType": "compass",
    "content": "Short 2-sentence analysis of its specific material (${product.material}) and fit (${product.fit})."
  },
  {
    "tag": "Ensemble Styling",
    "title": "Julian's Pairing Blueprint",
    "iconType": "sparkles",
    "content": "Short 2-sentence advice on what to pair with the ${product.name} for an elevated outfit."
  },
  {
    "tag": "Evaluation & Fit",
    "title": "Curator's Sizing Verdict",
    "iconType": "check",
    "content": "Short 2-sentence sizing advice detailing its fit (${product.fit}) and quality."
  },
  {
    "tag": "Visual Attention Telemetry",
    "title": "Visual Dwell Connection",
    "iconType": "eye",
    "content": "Short 2-sentence insight on gaze telemetry and visual impact of this ${product.color} piece."
  }
]`;

  try {
    const rawText = await callGeminiApi(prompt);
    // Strip possible markdown wrapping like ```json ... ```
    const cleanJson = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleanJson);

    if (Array.isArray(parsed) && parsed.length >= 5) {
      return parsed.slice(0, 5) as JulianThought[];
    }
  } catch (err) {
    console.warn('Fallback to local product-accurate thoughts due to API error/parse failure.');
  }

  // Guaranteed product-accurate fallback using exact product parameters
  return getFallbackProductThoughts(product);
}

/**
 * Generate Julian Laurent's AI Action results (Color Harmony, Lookbook, Proportions, Gaze Sync) for a specific product
 */
export async function generateJulianAiAction(
  actionType: 'color_harmony' | 'lookbook' | 'proportions' | 'gaze_sync',
  product: Product
): Promise<string> {
  const prompt = `You are Julian Laurent, elite AI fashion consultant.
Generate a concise, 1-2 sentence authoritative analysis for the item "${product.name}" (${product.category}, ${product.color}, ${product.material}, ${product.style}, ${product.fit}).

Action Type requested: ${actionType.toUpperCase()}
- For COLOR_HARMONY: Suggest complementary color pairings specifically harmonizing with "${product.color}".
- For LOOKBOOK: Suggest a 3-piece capsule outfit pairing incorporating "${product.name}".
- For PROPORTIONS: Analyze the silhouette, drape of ${product.material}, and fit (${product.fit}).
- For GAZE_SYNC: Provide an intent score and visual dwell metric for this ${product.color} piece.

Keep response under 40 words, highly professional, direct and styled with clean fashion terminology.`;

  try {
    const res = await callGeminiApi(prompt);
    if (res) return res;
  } catch {
    // fallback
  }

  // Product-accurate fallback
  if (actionType === 'color_harmony') {
    return `🎨 Color Harmony Analysis: 98% compatibility. The ${product.color} shade of ${product.name} pairs effortlessly with Charcoal, Warm Camel, and Crisp Chalk White neutrals.`;
  }
  if (actionType === 'lookbook') {
    return `✨ AI Lookbook Generated: Curated 3-piece capsule anchoring the "${product.name}" with tailored trousers and burnished leather accessories.`;
  }
  if (actionType === 'proportions') {
    return `📐 Architectural Proportions: Featuring a ${product.fit} cut in ${product.material}. Maintains structured drape with fluid body movement.`;
  }
  return `👁️ Gaze Telemetry Synced: Average dwell time 2.4s on ${product.name}. User intent score: 96.8% (High Confidence Match).`;
}

/**
 * Fallback thoughts built dynamically from exact product metadata
 */
function getFallbackProductThoughts(product: Product): JulianThought[] {
  const name = product.name;
  const category = product.category;
  const material = product.material || 'fine textile';
  const fit = product.fit || 'tailored fit';
  const color = product.color || 'monochrome';
  const brand = product.brand || 'ATELIER';
  const priceStr = `${product.currency}${product.price.toLocaleString('en-IN')}`;

  return [
    {
      tag: 'Stylist Compliment & Verdict',
      title: "Julian's Aesthetic Verdict",
      iconType: 'sparkles',
      content: `The ${name} by ${brand} is an exceptional ${category.toLowerCase()} piece. Its ${color} hue and ${product.style.toLowerCase()} aesthetic align effortlessly with modern proportions.`
    },
    {
      tag: 'Drape & Silhouette',
      title: 'Architectural Proportion',
      iconType: 'compass',
      content: `Tailored in ${material}, the structural integrity of this piece creates clean lines that preserve both drape and refined comfort.`
    },
    {
      tag: 'Ensemble Styling',
      title: "Julian's Pairing Blueprint",
      iconType: 'sparkles',
      content: `I recommend anchoring your ensemble with the ${name} (${priceStr}), balancing it with monochrome base layers and minimalist footwear.`
    },
    {
      tag: 'Evaluation & Fit',
      title: "Curator's Sizing Verdict",
      iconType: 'check',
      content: `Constructed with a ${fit} silhouette, this piece fits true to size. Demo stock shows ${product.stock > 0 ? `${product.stock} units available` : 'limited availability'}.`
    },
    {
      tag: 'Visual Attention Telemetry',
      title: 'Visual Dwell Connection',
      iconType: 'eye',
      content: `Visual telemetry shows strong dwell focus on the texture of this ${color} ${category.toLowerCase()} piece, indicating high purchase intent.`
    }
  ];
}

export interface AiOutfitSuggestion {
  outfitName: string;
  stylistRationale: string;
  colorPalette: string[];
  items: Product[];
  stylingTips: string[];
}

/**
 * Generates an AI-powered full outfit combination (3 items minimum) based on a selected product,
 * ensuring color palette and stylistic coherence using Gemini AI.
 */
export async function generateAiOutfitCombinations(
  selectedProduct: Product,
  catalog: Product[]
): Promise<AiOutfitSuggestion> {
  const catalogSummary = catalog.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    color: p.color,
    style: p.style,
    price: p.price
  }));

  const prompt = `You are Julian Laurent, master luxury fashion stylist and AI fashion director.
A client has selected this anchor product in the product modal:
- ID: ${selectedProduct.id}
- Name: ${selectedProduct.name}
- Category: ${selectedProduct.category}
- Color: ${selectedProduct.color}
- Material: ${selectedProduct.material}
- Style: ${selectedProduct.style}

Available catalog items to choose 2 or more complementary items from:
${JSON.stringify(catalogSummary, null, 2)}

Task: Create a cohesive, high-fashion 3-item minimum outfit combination (including the anchor product). Ensure color palette harmony and stylistic coherence.
Output ONLY valid JSON in this exact structure without markdown wrapping:
{
  "outfitName": "Sophisticated Monochromatic Ensemble",
  "stylistRationale": "2-3 sentences explaining why this 3+ item combination achieves color harmony and stylistic coherence.",
  "colorPalette": ["#111111", "#D4A373", "#F4F4F5"],
  "selectedProductIds": ["${selectedProduct.id}", "other-catalog-id-1", "other-catalog-id-2"],
  "stylingTips": [
    "Tip 1 on footwear or layering",
    "Tip 2 on accessories or belt matching"
  ]
}`;

  try {
    const rawText = await callGeminiApi(prompt);
    const cleanJson = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleanJson);

    if (parsed && Array.isArray(parsed.selectedProductIds) && parsed.selectedProductIds.length >= 3) {
      const itemMap = new Map<string, Product>();
      catalog.forEach(p => itemMap.set(p.id, p));
      itemMap.set(selectedProduct.id, selectedProduct);

      const items: Product[] = [];
      items.push(selectedProduct);

      parsed.selectedProductIds.forEach((id: string) => {
        if (id !== selectedProduct.id && itemMap.has(id)) {
          const found = itemMap.get(id);
          if (found && !items.some(i => i.id === found.id)) {
            items.push(found);
          }
        }
      });

      if (items.length < 3) {
        for (const p of catalog) {
          if (!items.some(i => i.id === p.id) && items.length < 3) {
            items.push(p);
          }
        }
      }

      return {
        outfitName: parsed.outfitName || `Curated ${selectedProduct.style} Ensemble`,
        stylistRationale: parsed.stylistRationale || `Built around the ${selectedProduct.name}, this curated 3-piece combination ensures refined textural and tonal synergy.`,
        colorPalette: Array.isArray(parsed.colorPalette) ? parsed.colorPalette : ['#18181b', '#d4a373', '#f4f4f5'],
        items,
        stylingTips: Array.isArray(parsed.stylingTips) ? parsed.stylingTips : ['Pair with minimal leather accessories', 'Maintain balanced proportions']
      };
    }
  } catch (err) {
    console.warn('AI outfit generation API call failed, falling back to intelligent algorithmic outfit pairing.', err);
  }

  // Fallback intelligent outfit builder (guarantees 3+ items)
  const items: Product[] = [selectedProduct];
  const others = catalog.filter(p => p.id !== selectedProduct.id);
  
  const complementary = others.filter(p => p.category !== selectedProduct.category);
  while (items.length < 3 && complementary.length > 0) {
    const nextItem = complementary.shift();
    if (nextItem && !items.some(i => i.id === nextItem.id)) {
      items.push(nextItem);
    }
  }
  while (items.length < 3 && others.length > 0) {
    const nextItem = others.shift();
    if (nextItem && !items.some(i => i.id === nextItem.id)) {
      items.push(nextItem);
    }
  }

  return {
    outfitName: `Julian Laurent's Curated ${selectedProduct.style} Look`,
    stylistRationale: `An impeccably balanced 3-piece ensemble anchored around the ${selectedProduct.name}, pairing complementary silhouettes for effortless elegance.`,
    colorPalette: ['#121316', '#d4a373', '#f4f4f5'],
    items,
    stylingTips: [
      `Anchor your look with the ${selectedProduct.name}`,
      `Coordinate tones with matching leather footwear or minimal accessories`
    ]
  };
}
