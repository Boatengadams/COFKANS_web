import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DEMO_MODE } from '@/lib/demo-mode';

export interface ProductOverride {
  price?: number;
  stock?: number;
}

/**
 * Subscribes to Firestore `products` collection and returns a map of
 * SKU → { price, stock }.  All other product data (name, image, category,
 * description) lives in csvProducts.ts and never hits Firestore.
 */
export function useProductOverrides(): Record<string, ProductOverride> {
  const [overrides, setOverrides] = useState<Record<string, ProductOverride>>({});

  useEffect(() => {
    if (DEMO_MODE) return;
    const unsub = onSnapshot(
      collection(db, 'products'),
      (snap) => {
        const map: Record<string, ProductOverride> = {};
        snap.docs.forEach((d) => {
          const data = d.data() as { sku?: string; price?: unknown; stock?: unknown };
          const sku = data.sku || d.id;
          if (!sku) return;
          map[sku] = {
            price: typeof data.price === 'number' && data.price >= 0 ? data.price : undefined,
            stock: typeof data.stock === 'number' && data.stock >= 0 ? data.stock : undefined,
          };
        });
        setOverrides(map);
      },
      (err) => {
        if ((err as { code?: string }).code === 'permission-denied') return;
        console.error('Product overrides error:', err);
      },
    );
    return () => unsub();
  }, []);

  return overrides;
}
