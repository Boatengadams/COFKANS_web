import { motion } from 'motion/react';
import { Tag, Zap, TrendingDown, ShoppingCart, Percent } from 'lucide-react';
import { useState, useEffect } from 'react';

export function PromotionalBanner({ title = 'Black Friday savings', subtitle = 'Buy more, save more. Up to 30% off selected products.' }: { title?: string; subtitle?: string }) {
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
    <div className="relative overflow-hidden rounded-2xl border border-[#c9a84c]/45 bg-[linear-gradient(135deg,#202226_0%,#111315_54%,#0a0b0d_100%)] p-6 shadow-[0_18px_50px_rgba(0,0,0,.22)] sm:p-8 mb-8">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-24 -right-16 h-64 w-64 rounded-full bg-[#c9a84c]/[.08] blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-[#7f1d1d]/[.14] blur-3xl"
        />
      </div>

      <div className="relative z-10">
        <div className="mb-5 inline-flex items-center rounded-xl border border-white/15 bg-[#090a0c] px-3 py-2 shadow-[0_8px_20px_rgba(0,0,0,.28)]">
          <img src="/images/brand/cofkans.png" alt="Cofkans Electricals" className="h-9 w-auto object-contain" />
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left side - Promo info */}
          <div className="flex-1 text-center md:text-left">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-[#c9a84c]/60 bg-[#c9a84c]/[.14] px-4 py-2 text-xs font-bold tracking-[.12em] text-[#f1d58a] mb-4"
            >
              <Zap className="w-4 h-4 fill-current" />
              BLACK FRIDAY · LIMITED RELEASE
            </motion.div>

            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">
              {title}
            </h2>
            <p className="text-white/90 text-lg mb-4">
              {subtitle}
            </p>

            {/* Discount tiers */}
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <div className="rounded-lg border border-white/10 bg-white/[.06] px-4 py-2">
                <p className="text-white font-bold text-sm">Buy 3-5 items</p>
                <p className="text-[#f1d58a] font-bold text-xl">Save 10%</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[.06] px-4 py-2">
                <p className="text-white font-bold text-sm">Buy 6-10 items</p>
                <p className="text-[#f1d58a] font-bold text-xl">Save 20%</p>
              </div>
              <div className="rounded-lg border border-[#c9a84c] bg-[#c9a84c]/[.14] px-4 py-2">
                <p className="text-white font-bold text-sm">Buy 11+ items</p>
                <p className="text-[#f1d58a] font-bold text-xl">Save 30%</p>
              </div>
            </div>
          </div>

          {/* Right side - Countdown */}
          <div className="text-center">
            <p className="text-white/90 font-bold mb-3 text-sm">SALE ENDS IN</p>
            <div className="flex gap-3">
              <div className="min-w-[70px] rounded-xl border border-white/10 bg-white/[.06] p-3">
                <p className="text-3xl font-bold text-white">{timeLeft.days}</p>
                <p className="text-white/80 text-xs font-bold">DAYS</p>
              </div>
              <div className="min-w-[70px] rounded-xl border border-white/10 bg-white/[.06] p-3">
                <p className="text-3xl font-bold text-white">{timeLeft.hours}</p>
                <p className="text-white/80 text-xs font-bold">HOURS</p>
              </div>
              <div className="min-w-[70px] rounded-xl border border-white/10 bg-white/[.06] p-3">
                <p className="text-3xl font-bold text-white">{timeLeft.minutes}</p>
                <p className="text-white/80 text-xs font-bold">MINS</p>
              </div>
              <div className="min-w-[70px] rounded-xl border border-white/10 bg-white/[.06] p-3">
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
