import { motion } from 'motion/react';
import { Tag, Zap, TrendingDown, ShoppingCart, Percent } from 'lucide-react';
import { useState, useEffect } from 'react';

export function PromotionalBanner() {
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 15,
    minutes: 42,
    seconds: 30
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { days, hours, minutes, seconds } = prev;

        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours--;
            } else {
              hours = 23;
              if (days > 0) {
                days--;
              }
            }
          }
        }

        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-orange-600 to-red-600 rounded-2xl p-8 mb-8">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left side - Promo info */}
          <div className="flex-1 text-center md:text-left">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-yellow-400 text-black px-4 py-2 rounded-full font-bold text-sm mb-4"
            >
              <Zap className="w-4 h-4 fill-current" />
              MEGA SALE - LIMITED TIME
            </motion.div>

            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              🔥 Black Friday Deals!
            </h2>
            <p className="text-white/90 text-lg mb-4">
              Buy more, save more! Up to <span className="font-bold text-yellow-300">30% OFF</span>
            </p>

            {/* Discount tiers */}
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <p className="text-white font-bold text-sm">Buy 3-5 items</p>
                <p className="text-yellow-300 font-bold text-xl">Save 10%</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <p className="text-white font-bold text-sm">Buy 6-10 items</p>
                <p className="text-yellow-300 font-bold text-xl">Save 20%</p>
              </div>
              <div className="bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg border-2 border-yellow-400">
                <p className="text-white font-bold text-sm">Buy 11+ items</p>
                <p className="text-yellow-300 font-bold text-xl">Save 30%</p>
              </div>
            </div>
          </div>

          {/* Right side - Countdown */}
          <div className="text-center">
            <p className="text-white/90 font-bold mb-3 text-sm">SALE ENDS IN</p>
            <div className="flex gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 min-w-[70px]">
                <p className="text-3xl font-bold text-white">{timeLeft.days}</p>
                <p className="text-white/80 text-xs font-bold">DAYS</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 min-w-[70px]">
                <p className="text-3xl font-bold text-white">{timeLeft.hours}</p>
                <p className="text-white/80 text-xs font-bold">HOURS</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 min-w-[70px]">
                <p className="text-3xl font-bold text-white">{timeLeft.minutes}</p>
                <p className="text-white/80 text-xs font-bold">MINS</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 min-w-[70px]">
                <p className="text-3xl font-bold text-white">{timeLeft.seconds}</p>
                <p className="text-white/80 text-xs font-bold">SECS</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
