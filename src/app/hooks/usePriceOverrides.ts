import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DEMO_MODE } from '@/lib/demo-mode';
import { isSafePublicPrice } from '@/lib/validators';

export function usePriceOverrides() {
  const [overrides, setOverrides] = useState<Record<string, number>>({});

  useEffect(() => {
    if (DEMO_MODE) return;
    const unsub = onSnapshot(
      collection(db, 'productPriceOverrides'),
      (snap) => {
        const map: Record<string, number> = {};
        snap.docs.forEach((d) => {
          const data = d.data() as { price?: unknown };
          // Defense in depth: even though admin-only writes enforce isValidPrice,
          // validate again on read so a compromised override can't crash the UI.
          if (isSafePublicPrice(data.price) && /^[A-Za-z0-9._+\-/ ]{1,64}$/.test(d.id)) {
            map[d.id] = data.price;
          }
        });
        setOverrides(map);
      },
      (err) => {
        if ((err as { code?: string }).code === 'permission-denied') {
          // Rules not yet deployed — silently fall back to no overrides.
          return;
        }
        console.error('Price overrides subscription error:', err);
      },
    );
    return () => unsub();
  }, []);

  return overrides;
}
