/**
 * Branch POS sale helpers.
 *
 * Minimal local-only implementation: the receipt counter generates a
 * branch-scoped, time-sortable number, and `recordLocalSale` writes the sale
 * to the `localSales` Firestore collection. When offline, the caller wraps
 * the write in `tryOnlineThenQueue` from `./offline-queue`.
 */
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export type PaymentMethod = 'cash' | 'momo' | 'card' | 'credit';

export interface LocalSaleItem {
  productId: string;
  sku: string;
  name: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface LocalSalePayload {
  branch: string;
  staffUid: string;
  staffName: string;
  items: LocalSaleItem[];
  paymentMethod: PaymentMethod;
  receiptNumber: string;
}

/** Branch-scoped receipt number: BRANCHPREFIX-YYYYMMDD-####. */
export function generateReceiptNumber(branchSlug: string, counter: number): string {
  const prefix = branchSlug.slice(0, 3).toUpperCase();
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return `${prefix}-${ymd}-${String(counter).padStart(4, '0')}`;
}

export async function recordLocalSale(payload: LocalSalePayload): Promise<void> {
  const total = payload.items.reduce((s, i) => s + i.lineTotal, 0);
  await addDoc(collection(db, 'localSales'), {
    ...payload,
    total,
    serverCreatedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  });
}
