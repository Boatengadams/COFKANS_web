import { motion } from 'motion/react';
import { Tag, Zap, X } from 'lucide-react';
import { useState } from 'react';

interface FloatingPromoButtonProps {
  onClick: () => void;
}

export function FloatingPromoButton({ onClick }: FloatingPromoButtonProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 2, type: 'spring', stiffness: 200, damping: 15 }}
      className="fixed bottom-8 right-8 z-40"
    >
      <motion.div
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          y: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
        className="relative group"
      >
        {/* Dismiss button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsDismissed(true);
          }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-black/80 text-white rounded-full flex items-center justify-center hover:bg-black transition-colors z-10"
        >
          <X className="w-4 h-4" strokeWidth={2} />
        </button>

        {/* Main button */}
        <motion.button
          onClick={onClick}
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
          className="relative bg-gradient-to-r from-red-600 via-orange-600 to-red-600 rounded-full p-6 shadow-2xl overflow-hidden cursor-pointer"
        >
          {/* Animated pulse rings */}
          <motion.div
            animate={{
              scale: [1, 1.5, 1.5],
              opacity: [0.8, 0, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut"
            }}
            className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 rounded-full"
          />
          <motion.div
            animate={{
              scale: [1, 1.5, 1.5],
              opacity: [0.8, 0, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut",
              delay: 0.5
            }}
            className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 rounded-full"
          />

          {/* Icon */}
          <div className="relative z-10">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
            >
              <Tag className="w-8 h-8 text-white fill-current" strokeWidth={2} />
            </motion.div>
          </div>

          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
        </motion.button>

        {/* Label */}
        <div className="absolute -left-4 top-1/2 -translate-y-1/2 -translate-x-full mr-4 bg-black/90 text-white px-4 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <p className="font-bold flex items-center gap-2">
            <Zap className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            Black Friday Deals!
          </p>
          <p className="text-xs text-yellow-400">Save up to 30% OFF</p>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full w-0 h-0 border-8 border-transparent border-l-black/90" />
        </div>

        {/* Badge */}
        <div className="absolute -top-1 -left-1 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
          30% OFF
        </div>
      </motion.div>
    </motion.div>
  );
}
