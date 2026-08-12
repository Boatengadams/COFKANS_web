/**
 * Real-time product reads. The whole storefront subscribes through these
 * hooks so any edit from the developer console (or directly in Firebase)
 * propagates instantly to every signed-in browser.
 */
import { useEffect, useState } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { FirestoreProduct } from '../../lib/firestore-schema';

interface UseProductsOpts {
  status?: FirestoreProduct['status'];
  categoryId?: string;
  featured?: boolean;
  max?: number;
}

export function useProducts(opts: UseProductsOpts = {}) {
  const [products, setProducts] = useState<FirestoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const constraints: QueryConstraint[] = [];
    if (opts.status)     constraints.push(where('status', '==', opts.status));
    if (opts.categoryId) constraints.push(where('categoryId', '==', opts.categoryId));
    if (opts.featured)   constraints.push(where('isFeatured', '==', true));
    constraints.push(orderBy('name'));

    const q = query(collection(db, 'products'), ...constraints);

    const unsub = onSnapshot(
      q,
      (snap) => {
        let rows = snap.docs.map(d => ({ id: d.id, ...d.data() } as FirestoreProduct));
        if (opts.max) rows = rows.slice(0, opts.max);
        setProducts(rows);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.warn('useProducts failed:', err);
        setError(err.message);
        setLoading(false);
      },
    );
    return () => unsub();
  }, [opts.status, opts.categoryId, opts.featured, opts.max]);

  return { products, loading, error };
}

export function useProduct(productId: string | undefined) {
  const [product, setProduct] = useState<FirestoreProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) { setProduct(null); setLoading(false); return; }
    const unsub = onSnapshot(
      doc(db, 'products', productId),
      (snap) => {
        setProduct(snap.exists() ? ({ id: snap.id, ...snap.data() } as FirestoreProduct) : null);
        setLoading(false);
      },
      (err) => { console.warn('useProduct failed:', err); setLoading(false); },
    );
    return () => unsub();
  }, [productId]);

  return { product, loading };
}
