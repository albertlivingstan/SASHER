import React from 'react';
import { useSasher } from '../../context/SasherContext';
import { RecommendedProduct } from '../../types';
import { ProductCard } from '../product/ProductCard';
import { Sparkles, ArrowRight } from 'lucide-react';

interface RecommendationsSectionProps {
  onSelectProduct: (product: RecommendedProduct) => void;
  onExplainProduct: (product: RecommendedProduct) => void;
  onSeeAll?: () => void;
}

export const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({
  onSelectProduct,
  onExplainProduct,
  onSeeAll
}) => {
  const { recommendedProducts } = useSasher();
  const topRecommendations = recommendedProducts.slice(0, 5);

  return (
    <section className="py-12 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/[0.06]">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="font-editorial text-2xl sm:text-3xl text-[#f4f4f5] tracking-tight">
            Recommendations
          </h2>
          <p className="text-xs sm:text-sm text-[#a1a1aa] mt-1">
            Curated for your evolving style
          </p>
        </div>

        <button
          onClick={onSeeAll}
          className="group flex items-center gap-1.5 text-xs font-medium text-[#d4a373] hover:text-[#e0b487] transition-colors cursor-pointer"
        >
          <span>See All</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {topRecommendations.map((product) => (
          <ProductCard
            key={`rec-${product.id}`}
            product={product}
            onSelect={onSelectProduct}
            onExplain={onExplainProduct}
          />
        ))}
      </div>
    </section>
  );
};
