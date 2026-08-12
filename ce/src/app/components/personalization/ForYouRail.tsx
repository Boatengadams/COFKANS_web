import { useMemo } from 'react';
import { motion } from 'motion/react';
import { Sparkles, TrendingUp } from 'lucide-react';
import { usePersonalizationStore, topCategories } from '@/stores/personalization-store';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description?: string;
}

interface Props {
  products: Product[];
  onSelect?: (id: string) => void;
}

export function ForYouRail({ products, onSelect }: Props) {
  const consent = usePersonalizationStore(s => s.consent);
  const categoryScores = usePersonalizationStore(s => s.categoryScores);
  const productScores = usePersonalizationStore(s => s.productScores);

  const recommendations = useMemo(() => {
    if (!consent.analytics) return [];
    const topCats = new Set(topCategories(categoryScores, 4));
    if (topCats.size === 0 && Object.keys(productScores).length === 0) return [];

    return products
      .map(p => {
        const productBoost = productScores[p.id] ?? 0;
        const categoryBoost = topCats.has(p.category) ? 5 : 0;
        return { p, score: productBoost + categoryBoost };
      })
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(x => x.p);
  }, [consent.analytics, categoryScores, productScores, products]);

  if (!consent.analytics || recommendations.length === 0) return null;

  return (
    <div className="mb-10">
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" /> Picked for you
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold leading-tight">Based on what you've been browsing</h2>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
          <TrendingUp className="w-3.5 h-3.5" /> Updated live
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {recommendations.map((p, i) => (
          <motion.button
            key={p.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            whileHover={{ y: -4 }}
            onClick={() => onSelect?.(p.id)}
            className="group bg-card border-2 border-border rounded-2xl overflow-hidden text-left hover:border-primary hover:shadow-xl transition-all"
          >
            <div className="aspect-square bg-muted overflow-hidden">
              <img src={p.image} alt={p.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">{p.category}</p>
              <p className="text-sm font-bold line-clamp-2 leading-tight mb-1.5">{p.name}</p>
              <p className="text-sm font-bold text-primary">GH₵{p.price.toLocaleString()}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
