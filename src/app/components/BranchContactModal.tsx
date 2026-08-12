/**
 * Branch Contact modal.
 *
 * Shown to customers when a product has no public price — clicking "Enquire
 * for price" opens this sheet listing every Cofkans branch with tap-to-call
 * numbers, address and opening hours, so a shopper can reach the nearest shop
 * for a quote.
 */
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Phone, MapPin, Clock, Star } from 'lucide-react';
import { useBranches } from '../../lib/branches';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Optional product name for context in the header. */
  productName?: string;
}

export function BranchContactModal({ open, onClose, productName }: Props) {
  const branches = useBranches(true);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9700] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="relative w-full sm:max-w-lg max-h-[88vh] overflow-hidden rounded-t-3xl sm:rounded-3xl bg-card shadow-[0_-8px_40px_rgba(0,0,0,0.25),0_40px_80px_-20px_rgba(122,90,22,0.35)] border border-border-light"
            onClick={(e) => e.stopPropagation()}
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            {/* Header */}
            <div className="relative px-6 pt-6 pb-5 bg-gradient-gold-subtle border-b border-border-light">
              <button
                onClick={onClose}
                aria-label="Close"
                className="absolute top-4 right-4 p-2 rounded-full bg-card/70 backdrop-blur-md hover:bg-card transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_4px_12px_-4px_rgba(0,0,0,0.2)]"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-xl sm:text-2xl font-bold pr-10" style={{ fontFamily: 'var(--font-luxury)' }}>
                Enquire for price
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {productName
                  ? <>Call any branch for the best price on <span className="font-semibold text-foreground">{productName}</span>.</>
                  : 'Reach any of our showrooms for a quote and availability.'}
              </p>
            </div>

            {/* Branch list */}
            <div className="overflow-y-auto px-4 sm:px-5 py-4 space-y-3" style={{ maxHeight: 'calc(88vh - 7.5rem)' }}>
              {branches.map((b) => {
                const primary = b.phonesE164?.[0] ?? b.phone;
                return (
                  <div
                    key={b.slug}
                    className="rounded-2xl border border-border-light bg-background/60 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_6px_18px_-12px_rgba(122,90,22,0.35)] transition-shadow hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_14px_30px_-14px_rgba(122,90,22,0.45)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold leading-tight truncate">{b.name}</h3>
                          {b.isMain && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex-shrink-0">
                              <Star className="w-3 h-3 fill-primary" /> Main
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" /> {b.address}
                        </p>
                        {b.hours && (
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 flex-shrink-0" /> {b.hours}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Phone chips — tap to call */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {(b.phones ?? (b.phone ? [b.phone] : [])).map((num, i) => {
                        const e164 = b.phonesE164?.[i] ?? num;
                        return (
                          <a
                            key={num}
                            href={`tel:${e164}`}
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-gradient-gold text-foreground font-bold text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.5),inset_0_-1px_0_rgba(122,90,22,0.35),0_2px_6px_rgba(60,44,8,0.18),0_10px_24px_-10px_rgba(160,118,30,0.6)] hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_4px_10px_rgba(60,44,8,0.2),0_18px_40px_-12px_rgba(160,118,30,0.75)] transition-all duration-300"
                          >
                            <Phone className="w-4 h-4" strokeWidth={2.4} /> {num}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {branches.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-8">Branch information is loading…</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export default BranchContactModal;
