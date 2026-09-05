/**
 * One-shot product seeder. Reads csvProducts (your local catalogue) and writes
 * them as FirestoreProduct documents if the `products` collection is empty.
 *
 * Triggered automatically the first time an admin signs in.
 */
import { collection, getDocs, limit, query, writeBatch, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { csvProducts } from '@/app/data/csvProducts';
import { lookupProductImage } from './product-image-map';
import type { FirestoreProduct } from './firestore-schema';

const COLLECTION = 'products';

/**
 * Delete every document in the products collection.
 * Processes in batches of 400 to stay within Firestore limits.
 */
export async function clearAllProducts(): Promise<{ deleted: number }> {
  let deleted = 0;
  let snap = await getDocs(collection(db, COLLECTION));
  while (!snap.empty) {
    const batch = writeBatch(db);
    snap.docs.slice(0, 400).forEach(d => batch.delete(d.ref));
    await batch.commit();
    deleted += snap.docs.slice(0, 400).length;
    snap = await getDocs(collection(db, COLLECTION));
  }
  return { deleted };
}

/** Returns true if a seed was performed. */
export async function seedProductsIfEmpty(adminUid: string): Promise<{ seeded: number } | null> {
  const snap = await getDocs(query(collection(db, COLLECTION), limit(1)));
  if (!snap.empty) return null;
  return seedProductsAlways(adminUid);
}

/**
 * Force a fresh seed regardless of whether products exist. Use from the
 * developer console "Reseed catalogue" action. Caller should clear the
 * collection first if a clean rebuild is wanted.
 */
export async function seedProductsAlways(adminUid: string): Promise<{ seeded: number }> {

  // Firestore caps batches at 500 writes — chunk for safety.
  const CHUNK = 400;
  let total = 0;
  for (let i = 0; i < csvProducts.length; i += CHUNK) {
    const chunk = csvProducts.slice(i, i + CHUNK);
    const batch = writeBatch(db);
    for (const p of chunk) {
      const ref = doc(collection(db, COLLECTION), p.id);
      const resolvedImage =
        lookupProductImage(p.name) ??
        lookupProductImage(p.sku) ??
        p.image;
      const productDoc: Partial<FirestoreProduct> & { seededBy: string } = {
        id: p.id,
        sku: p.sku,
        name: p.name,
        slug: p.id,
        description: '',
        longDescription: '',
        categoryId: p.category,
        categoryName: p.category,
        subcategory: p.subcategory,
        tags: [],
        price: p.price,
        tradePrice: null,
        costPrice: 0,
        currency: 'GHS',
        compareAtPrice: null,
        images: [{ url: resolvedImage, alt: p.name, isPrimary: true, order: 0 }],
        videos: [],
        hasVariants: false,
        variants: [],
        specs: {},
        technicalSpecs: [],
        trackInventory: true,
        totalStock: p.stock,
        warehouseStock: { accra: p.stock, kumasi: 0, takoradi: 0 },
        lowStockThreshold: 5,
        status: p.price > 0 ? 'active' : 'draft',
        isAvailable: p.stock > 0,
        isFeatured: false,
        isOnSale: false,
        rating: 0,
        reviewCount: 0,
        metaTitle: p.name,
        metaDescription: '',
        keywords: [],
        badges: [],
        weight: 0,
        dimensions: { length: 0, width: 0, height: 0 },
        createdAt: serverTimestamp() as unknown as Timestamp,
        updatedAt: serverTimestamp() as unknown as Timestamp,
        publishedAt: p.price > 0 ? (serverTimestamp() as unknown as Timestamp) : null,
        viewCount: 0,
        purchaseCount: 0,
        cartAddCount: 0,
        seededBy: adminUid,
      };
      batch.set(ref, productDoc);
    }
    await batch.commit();
    total += chunk.length;
  }
  return { seeded: total };
}

/**
 * Delete every document in the products collection. Used by the "Fresh
 * launch" action in the developer console before a clean reseed.
 */
export async function wipeProducts(): Promise<{ deleted: number }> {
  let total = 0;
  while (true) {
    const snap = await getDocs(query(collection(db, COLLECTION), limit(400)));
    if (snap.empty) break;
    const batch = writeBatch(db);
    snap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
    total += snap.size;
  }
  return { deleted: total };
}
