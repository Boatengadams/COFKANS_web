import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X } from 'lucide-react';
import { SupportChat } from './SupportChat';
import { useFirebaseAuth as useDemoAuth } from '@/app/contexts/FirebaseAuthContext';
import { useSupportStore } from '@/stores/support-store';

export function SupportWidget() {
  const [open, setOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const { user } = useDemoAuth();
  const unread = useSupportStore(s => {
    const sess = s.sessions[0];
    if (!sess || !open) return 0;
    // unread messages = ai/agent messages newer than last user message
    const lastUser = [...sess.messages].reverse().find(m => m.role === 'user')?.at ?? 0;
    return sess.messages.filter(m => (m.role === 'ai' || m.role === 'agent') && m.at > lastUser).length;
  });

  return (
    <>
      {/* Side tab trigger — mid-right edge, never overlaps bottom nav */}
      <motion.button
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.8, type: 'spring', stiffness: 260, damping: 24 }}
        whileHover={{ x: -4 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setOpen(o => !o)}
        className="fixed top-1/2 right-0 -translate-y-1/2 z-[140] flex flex-col items-center justify-center gap-2 bg-primary/95 hover:bg-primary text-primary-foreground shadow-[0_12px_32px_rgba(15,23,42,.18)] rounded-l-2xl px-2.5 py-5 cursor-pointer transition-colors"
        aria-label="Get help from Cofkans support"
      >
        {!open && (
          <span className="absolute inset-0 rounded-l-2xl ring-2 ring-primary/40 animate-ping pointer-events-none" />
        )}
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="x" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <X className="w-5 h-5" strokeWidth={2.5} />
            </motion.span>
          ) : (
            <motion.span key="m" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-2">
              <MessageCircle className="w-5 h-5 fill-white" strokeWidth={2} />
              <span className="text-[9px] font-bold tracking-widest uppercase -rotate-90 whitespace-nowrap">Chat</span>
            </motion.span>
          )}
        </AnimatePresence>
        {unread > 0 && !open && (
          <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-rose-500 text-[10px] font-bold flex items-center justify-center border-2 border-background">{unread}</span>
        )}
      </motion.button>

      {/* Popover — opens to the left of the tab */}
      <AnimatePresence>
        {open && !fullscreen && (
          <motion.div
            initial={{ x: 40, opacity: 0, scale: 0.96 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: 40, opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="fixed top-1/2 -translate-y-1/2 right-10 z-[140] w-[360px] max-w-[calc(100vw-4rem)] rounded-2xl overflow-hidden shadow-[0_24px_80px_rgba(2,6,23,.28)] border border-border/80 bg-card dark:bg-[#151326]"
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
              className="fixed inset-4 md:inset-10 z-[190] rounded-2xl overflow-hidden shadow-2xl border border-border bg-card"
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
