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
import { lookupProductImage } from '../../lib/product-image-map';

interface UseProductsOpts {
  status?: FirestoreProduct['status'];
  categoryId?: string;
  featured?: boolean;
  max?: number;
  /**
   * When true, products without a CSV-mapped image AND without an explicit
   * `approvedToLive === true` flag are INCLUDED in the result (used by the
   * developer portal's Pending Approval tab). Defaults to false — customer
   * surfaces hide them.
   */
  includePending?: boolean;
}

/** Decide whether a product is allowed to show on customer surfaces. */
export function isProductLive(p: FirestoreProduct): boolean {
  if ((p as any).approvedToLive === true) return true;
  return lookupProductImage(p.name) !== null;
}

/**
 * When the CSV map has an authoritative image for this product name, use it —
 * it overrides any placeholder/stale URL stored in Firestore.
 */
function withResolvedImage(p: FirestoreProduct): FirestoreProduct {
  const mapped = lookupProductImage(p.name);
  if (!mapped) return p;
  const cleanUrl = mapped.trim();
  return {
    ...p,
    images: [{ url: cleanUrl, alt: p.name, isPrimary: true, order: 0 } as any],
  };
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
        rows = rows.map(withResolvedImage);
        if (!opts.includePending) rows = rows.filter(isProductLive);
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
  }, [opts.status, opts.categoryId, opts.featured, opts.max, opts.includePending]);

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
