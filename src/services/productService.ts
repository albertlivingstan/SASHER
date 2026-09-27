import { Product } from '../types';

export interface ProductResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

/**
 * Normalizes raw DummyJSON product into internal standardized Product schema
 */
export function normalizeProduct(raw: any): Product {
  const id = `dummy-${raw.id}`;
  const priceINR = Math.round((raw.price || 50) * 83); // Convert USD to INR approx
  const originalPriceINR = raw.discountPercentage ? Math.round(priceINR / (1 - raw.discountPercentage / 100)) : undefined;

  // Determine gender/category mapping
  let gender: 'Unisex' | 'Men' | 'Women' = 'Unisex';
  const catLower = (raw.category || '').toLowerCase();
  const titleLower = (raw.title || '').toLowerCase();

  if (catLower.includes('women') || titleLower.includes('women') || titleLower.includes('dress') || titleLower.includes('skirt')) {
    gender = 'Women';
  } else if (catLower.includes('men') || titleLower.includes('men') || titleLower.includes('shirt') || titleLower.includes('suit')) {
    gender = 'Men';
  }

  return {
    id,
    product_id: id,
    name: raw.title || 'Curated Garment',
    brand: raw.brand || 'ATELIER SASHER',
    category: mapCategory(raw.category),
    subcategory: raw.category || 'Apparel',
    articleType: raw.category || 'Garment',
    price: priceINR,
    originalPrice: originalPriceINR,
    currency: '₹',
    imageUrl: raw.thumbnail || (raw.images && raw.images[0]) || 'https://images.unsplash.com/photo-1539533018447-63fcce667883?auto=format&fit=crop&w=800&q=80',
    imageFallbackGradient: 'linear-gradient(145deg, #18191d, #27272a)',
    gender,
    color: raw.color || 'Monochrome',
    season: 'All-Season',
    style: 'Tailored',
    description: raw.description || 'Premium crafted piece designed for adaptive luxury styling.',
    material: '100% Premium Cotton Blend',
    fit: 'Tailored Fit',
    rating: typeof raw.rating === 'number' ? raw.rating : null,
    reviewCount: raw.stock ? Math.min(raw.stock * 3, 120) : null,
    stock: raw.stock || 10,
    availableSizes: ['S', 'M', 'L', 'XL'],
    attributes: {
      sku: `SKU-${raw.id}`,
      discount: raw.discountPercentage ? `${Math.round(raw.discountPercentage)}% OFF` : ''
    },
    popularityScore: (raw.rating || 4.0) / 5.0,
    recommendationScore: null,
    featureVector: {
      outerwear: 0.5,
      tailoring: 0.5,
      knitwear: 0.5,
      minimalism: 0.8,
      formal: 0.5,
      casual: 0.5,
      warmth: 0.5
    },
    collaborativeScore: 0.85
  };
}

function mapCategory(cat: string): any {
  if (!cat) return 'Outerwear';
  const c = cat.toLowerCase();
  if (c.includes('dress')) return 'Dresses';
  if (c.includes('shirt') || c.includes('top')) return 'Tops';
  if (c.includes('trouser') || c.includes('pant')) return 'Trousers';
  if (c.includes('shoe') || c.includes('boot')) return 'Footwear';
  if (c.includes('watch') || c.includes('jewel') || c.includes('accessor')) return 'Accessories';
  return 'Outerwear';
}

export const productService = {
  async getProducts(limit = 20, skip = 0): Promise<ProductResponse> {
    try {
      const res = await fetch(`https://dummyjson.com/products?limit=${limit}&skip=${skip}`);
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      return {
        products: (data.products || []).map(normalizeProduct),
        total: data.total || 0,
        skip: data.skip || 0,
        limit: data.limit || limit
      };
    } catch (err) {
      console.error('ProductService fetch error:', err);
      return { products: [], total: 0, skip, limit };
    }
  },

  async searchProducts(query: string): Promise<Product[]> {
    try {
      const res = await fetch(`https://dummyjson.com/products/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('Failed to search products');
      const data = await res.json();
      return (data.products || []).map(normalizeProduct);
    } catch (err) {
      console.error('ProductService search error:', err);
      return [];
    }
  },

  async getCategories(): Promise<string[]> {
    try {
      const res = await fetch('https://dummyjson.com/products/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      if (Array.isArray(data)) {
        return data.map((c: any) => typeof c === 'string' ? c : c.name || c.slug);
      }
      return [];
    } catch (err) {
      console.error('ProductService categories error:', err);
      return [];
    }
  },

  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const res = await fetch(`https://dummyjson.com/products/category/${encodeURIComponent(category)}`);
      if (!res.ok) throw new Error('Failed to fetch category products');
      const data = await res.json();
      return (data.products || []).map(normalizeProduct);
    } catch (err) {
      console.error('ProductService category products error:', err);
      return [];
    }
  }
};
