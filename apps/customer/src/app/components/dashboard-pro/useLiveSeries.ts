import { useEffect, useState } from 'react';

/** Mock realtime: emits new values every `tick` ms, keeps last `length`. */
export function useLiveSeries(length = 24, tick = 2500, base = 100, jitter = 20) {
  const [data, setData] = useState<number[]>(() =>
    Array.from({ length }, (_, i) => base + Math.sin(i / 2) * jitter + (Math.random() - 0.5) * jitter),
  );
  useEffect(() => {
    const id = setInterval(() => {
      setData(prev => {
        const last = prev[prev.length - 1] ?? base;
        const next = Math.max(0, last + (Math.random() - 0.5) * jitter);
        return [...prev.slice(1), next];
      });
    }, tick);
    return () => clearInterval(id);
  }, [length, tick, base, jitter]);
  return data;
}
