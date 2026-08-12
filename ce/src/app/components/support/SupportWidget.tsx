import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X } from 'lucide-react';
import { SupportChat } from './SupportChat';
import { useFirebaseAuth as useDemoAuth } from '@/app/contexts/FirebaseAuthContext';
import { useSupportStore } from '@/stores/support-store';

export function SupportWidget() {
  const [open, setOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const { user } = useDemoAuth();

  useEffect(() => {
    const handler = () => {
      const isPhone = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;
      if (isPhone) {
        setFullscreen(true);
      } else {
        setOpen(true);
      }
    };
    window.addEventListener('cofkans:openSupport', handler);
    return () => window.removeEventListener('cofkans:openSupport', handler);
  }, []);
  const unread = useSupportStore(s => {
    const sess = s.sessions[0];
    if (!sess || !open) return 0;
    // unread messages = ai/agent messages newer than last user message
    const lastUser = [...sess.messages].reverse().find(m => m.role === 'user')?.at ?? 0;
    return sess.messages.filter(m => (m.role === 'ai' || m.role === 'agent') && m.at > lastUser).length;
  });

  return (
    <>
      {/* Floating bubble */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          const isPhone = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;
          if (isPhone) { setFullscreen(f => !f); return; }
          setOpen(o => !o);
        }}
        className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-[140] w-14 h-14 rounded-full bg-gradient-to-br from-primary to-amber-600 text-white shadow-2xl shadow-amber-500/30 flex items-center justify-center hidden md:flex"
        aria-label="Open support chat"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6" strokeWidth={2.5} />
            </motion.span>
          ) : (
            <motion.span key="m" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle className="w-6 h-6 fill-white" strokeWidth={2} />
            </motion.span>
          )}
        </AnimatePresence>
        {unread > 0 && !open && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-[10px] font-bold flex items-center justify-center border-2 border-background">{unread}</span>
        )}
      </motion.button>

      {/* Popover */}
      <AnimatePresence>
        {open && !fullscreen && (
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="fixed bottom-24 right-6 z-[140] w-[380px] max-w-[calc(100vw-2rem)] rounded-2xl overflow-hidden shadow-2xl border border-border bg-card"
          >
            <SupportChat
              user={user}
              variant="widget"
              onExpand={() => setFullscreen(true)}
              onClose={() => setOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen */}
      <AnimatePresence>
        {fullscreen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[180] bg-black/60 backdrop-blur-sm" onClick={() => setFullscreen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              className="fixed inset-0 md:inset-10 z-[190] rounded-none md:rounded-2xl overflow-hidden shadow-2xl border-0 md:border md:border-border bg-card"
            >
              <SupportChat
                user={user}
                variant="fullscreen"
                onClose={() => setFullscreen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
