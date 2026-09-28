import { Product, CategoryType } from '../types';
import { INITIAL_PRODUCTS } from '../data/products';

export interface DataIngestionValidationReport {
  totalProcessed: number;
  validCount: number;
  invalidCount: number;
  duplicateCount: number;
  missingValuesFixedCount: number;
  categoriesFound: string[];
  priceRange: { min: number; max: number; average: number };
  warnings: string[];
  timestamp: string;
}

export class DataIngestionService {
  /**
   * Normalizes raw input product records (from CSV/JSON/API) into unified Product schema
   */
  public normalizeProductRecord(raw: any, index = 0): { product: Product | null; warning?: string } {
    if (!raw) return { product: null, warning: 'Null or undefined record' };

    const id = String(raw.id || raw.product_id || `item-gen-${index + 1}`).trim();
    const name = String(raw.name || raw.title || 'Contemporary Garment').trim();
    const brand = String(raw.brand || 'ATELIER SASHER').trim();
    
    // Validate price in INR
    let price = typeof raw.price === 'number' ? raw.price : parseFloat(raw.price);
    if (isNaN(price) || price <= 0) {
      price = 2999; // Default fallback accessible tier
    }
    price = Math.round(price);

    // Validate Category
    const allowedCategories: CategoryType[] = [
      'Outerwear', 'Tailoring', 'Knitwear', 'Tops', 'Dresses', 'Trousers', 'Footwear', 'Accessories'
    ];
    let category: CategoryType = 'Tops';
    const rawCat = String(raw.category || '').toLowerCase();
    const matched = allowedCategories.find(c => c.toLowerCase() === rawCat);
    if (matched) {
      category = matched;
    } else if (rawCat.includes('coat') || rawCat.includes('jacket')) {
      category = 'Outerwear';
    } else if (rawCat.includes('suit') || rawCat.includes('blazer') || rawCat.includes('kurta') || rawCat.includes('sherwani')) {
      category = 'Tailoring';
    } else if (rawCat.includes('knit') || rawCat.includes('sweater') || rawCat.includes('shawl')) {
      category = 'Knitwear';
    } else if (rawCat.includes('dress') || rawCat.includes('saree')) {
      category = 'Dresses';
    } else if (rawCat.includes('pant') || rawCat.includes('trouser') || rawCat.includes('chino')) {
      category = 'Trousers';
    } else if (rawCat.includes('shoe') || rawCat.includes('boot') || rawCat.includes('sneaker') || rawCat.includes('mojri')) {
      category = 'Footwear';
    } else if (rawCat.includes('bag') || rawCat.includes('watch') || rawCat.includes('accessory')) {
      category = 'Accessories';
    }

    // Image fallback
    const imageUrl = (raw.imageUrl || raw.image_url || raw.thumbnail || '')
      || 'https://images.unsplash.com/photo-1539533018447-63fcce667883?auto=format&fit=crop&w=800&q=80';

    // Feature vector extraction
    const rawFv = raw.featureVector || {};
    const featureVector = {
      outerwear: typeof rawFv.outerwear === 'number' ? rawFv.outerwear : (category === 'Outerwear' ? 0.9 : 0.2),
      tailoring: typeof rawFv.tailoring === 'number' ? rawFv.tailoring : (category === 'Tailoring' ? 0.9 : 0.3),
      knitwear: typeof rawFv.knitwear === 'number' ? rawFv.knitwear : (category === 'Knitwear' ? 0.9 : 0.1),
      minimalism: typeof rawFv.minimalism === 'number' ? rawFv.minimalism : 0.7,
      formal: typeof rawFv.formal === 'number' ? rawFv.formal : (raw.occasion === 'Formal' || raw.occasion === 'Wedding' ? 0.85 : 0.4),
      casual: typeof rawFv.casual === 'number' ? rawFv.casual : (raw.occasion === 'Casual' || raw.occasion === 'College' ? 0.85 : 0.3),
      warmth: typeof rawFv.warmth === 'number' ? rawFv.warmth : (category === 'Outerwear' || category === 'Knitwear' ? 0.85 : 0.25),
      traditional: raw.style === 'Traditional' || raw.style === 'Festive' ? 0.9 : 0.1
    };

    const isColdStartItem = Boolean(raw.isColdStartItem ?? raw.is_cold_start ?? false);
    const historicalInteractionsCount = typeof raw.historicalInteractionsCount === 'number' 
      ? raw.historicalInteractionsCount 
      : (isColdStartItem ? 0 : Math.floor(Math.random() * 20 + 8));

    const normalized: Product = {
      id,
      product_id: id,
      name,
      brand,
      category,
      subcategory: raw.subcategory || 'Artisanal Collection',
      articleType: raw.articleType || raw.article_type || 'Garment',
      price,
      price_inr: price,
      originalPrice: raw.originalPrice || (raw.discount ? Math.round(price / (1 - (raw.discount / 100))) : undefined),
      currency: '₹',
      imageUrl,
      imageFallbackGradient: 'linear-gradient(145deg, #18191d, #27272a)',
      gender: raw.gender === 'Men' || raw.gender === 'Women' ? raw.gender : 'Unisex',
      color: raw.color || 'Monochrome',
      season: raw.season || 'All-Season',
      style: raw.style || 'Tailored',
      occasion: raw.occasion || 'Festive',
      description: raw.description || 'Premium curated apparel designed for session-aware personalization.',
      material: raw.material || 'Organic Indian Textile',
      fit: raw.fit || 'Regular Tailored',
      rating: typeof raw.rating === 'number' ? raw.rating : 4.6,
      reviewCount: typeof raw.reviewCount === 'number' ? raw.reviewCount : (isColdStartItem ? 0 : 34),
      stock: raw.stock || 12,
      availableSizes: raw.availableSizes || (typeof raw.size === 'string' ? raw.size.split(';') : ['S', 'M', 'L', 'XL']),
      popularityScore: typeof raw.popularityScore === 'number' ? raw.popularityScore : (isColdStartItem ? 0.1 : 0.8),
      featureVector,
      isColdStartItem,
      historicalInteractionsCount
    };

    return { product: normalized };
  }

  /**
   * Ingests a raw product list and generates an audited validation report
   */
  public ingestAndValidateCatalog(rawCatalog: any[]): { products: Product[]; report: DataIngestionValidationReport } {
    const validProducts: Product[] = [];
    const seenIds = new Set<string>();
    const warnings: string[] = [];
    const categoriesFound = new Set<string>();
    let duplicateCount = 0;
    let missingValuesFixedCount = 0;
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let sumPrice = 0;

    rawCatalog.forEach((item, index) => {
      const { product, warning } = this.normalizeProductRecord(item, index);
      if (!product) {
        warnings.push(`Record index ${index} dropped: ${warning}`);
        return;
      }

      if (seenIds.has(product.id)) {
        duplicateCount++;
        warnings.push(`Duplicate product ID detected: ${product.id}. Appending unique hash.`);
        product.id = `${product.id}-dup-${index}`;
      }
      seenIds.add(product.id);

      categoriesFound.add(product.category);
      minPrice = Math.min(minPrice, product.price);
      maxPrice = Math.max(maxPrice, product.price);
      sumPrice += product.price;

      if (!item.material || !item.color) {
        missingValuesFixedCount++;
      }

      validProducts.push(product);
    });

    const report: DataIngestionValidationReport = {
      totalProcessed: rawCatalog.length,
      validCount: validProducts.length,
      invalidCount: rawCatalog.length - validProducts.length,
      duplicateCount,
      missingValuesFixedCount,
      categoriesFound: Array.from(categoriesFound),
      priceRange: {
        min: minPrice === Infinity ? 0 : minPrice,
        max: maxPrice === -Infinity ? 0 : maxPrice,
        average: validProducts.length > 0 ? Math.round(sumPrice / validProducts.length) : 0
      },
      warnings: warnings.slice(0, 10),
      timestamp: new Date().toISOString()
    };

    return { products: validProducts, report };
  }
}

export const dataIngestionService = new DataIngestionService();
