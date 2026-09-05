import { useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface DashboardOverlayProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function DashboardOverlay({ open, onClose, title, children }: DashboardOverlayProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-stretch justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-xl"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Panel */}
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            className="relative w-full max-w-7xl mx-4 md:mx-8 my-6 md:my-10 rounded-3xl bg-background border border-border shadow-2xl overflow-hidden flex flex-col"
            style={{ maxHeight: 'calc(100vh - 3rem)' }}
            role="dialog"
            aria-modal="true"
            aria-label={title || 'Dashboard'}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-card/80 border border-border backdrop-blur hover:bg-card hover:scale-105 active:scale-95 transition-all flex items-center justify-center shadow-lg"
            >
              <X className="w-5 h-5" strokeWidth={2.5} />
            </button>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
