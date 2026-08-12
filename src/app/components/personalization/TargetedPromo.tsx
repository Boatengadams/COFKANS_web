import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { usePersonalizationStore, topCategories } from '@/stores/personalization-store';

const COPY: Record<string, { headline: string; sub: string; cta: string }> = {
  luxury:      { headline: 'Curated chandeliers for you',  sub: 'New luxury arrivals in your favourite category.', cta: 'Shop luxury' },
  solar:       { headline: 'Off-grid setups, 15% off',     sub: 'Solar kits matched to your recent searches.',     cta: 'See solar deals' },
  wiring:      { headline: 'Bulk wiring savings',          sub: 'Free delivery on rolls over 100m this week.',     cta: 'Browse wiring' },
  industrial:  { headline: 'Industrial gear restocked',    sub: 'Items you viewed are now back in stock.',         cta: 'Continue browsing' },
  appliances:  { headline: 'Smart appliances for you',     sub: 'Trending models based on your activity.',         cta: 'Explore appliances' },
  lighting:    { headline: 'Lighting just for you',        sub: 'Hand-picked from your browsing history.',         cta: 'Shop lighting' },
};

interface Props {
  onCtaClick?: () => void;
}

export function TargetedPromo({ onCtaClick }: Props) {
  const consent = usePersonalizationStore(s => s.consent);
  const categoryScores = usePersonalizationStore(s => s.categoryScores);
  const [dismissed, setDismissed] = useState(false);

  const top = useMemo(() => topCategories(categoryScores, 1)[0], [categoryScores]);
  const copy = top ? COPY[top] : undefined;

  useEffect(() => {
    if (sessionStorage.getItem('cofkans:promo-dismissed') === '1') setDismissed(true);
  }, []);

  if (!consent.marketing || !copy || dismissed) return null;

  const close = () => {
    sessionStorage.setItem('cofkans:promo-dismissed', '1');
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-40"
      >
        <div className="relative bg-gradient-to-br from-primary to-amber-600 text-white rounded-2xl shadow-2xl p-4 pr-10">
          <button onClick={close} aria-label="Dismiss" className="absolute top-2 right-2 w-7 h-7 rounded-lg hover:bg-white/15 flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest mb-1.5 opacity-90">
            <Sparkles className="w-3.5 h-3.5" /> Just for you
          </div>
          <p className="font-bold text-base leading-tight mb-1">{copy.headline}</p>
          <p className="text-xs opacity-90 mb-3">{copy.sub}</p>
          <button
            onClick={() => { onCtaClick?.(); close(); }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-foreground text-xs font-bold hover:bg-white/90"
          >
            {copy.cta} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
