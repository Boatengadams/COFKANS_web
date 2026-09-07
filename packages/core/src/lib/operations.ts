/**
 * Branch POS sale helpers.
 *
 * `recordLocalSale` delegates to the `createLocalSale` Cloud Function so
 * inventory + products.totalStock decrement atomically with the receipt.
 * Prefer calling createLocalSale from staff backend for typed errors.
 */
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

export type PaymentMethod = 'cash' | 'momo' | 'card' | 'credit' | 'transfer';

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
  discountPct?: number;
  amountPaid?: number;
  customerName?: string;
  customerPhone?: string;
  momoRef?: string;
}

/** Branch-scoped receipt number: BRANCHPREFIX-YYYYMMDD-####. */
export function generateReceiptNumber(branchSlug: string, counter: number): string {
  const prefix = branchSlug.slice(0, 3).toUpperCase();
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return `${prefix}-${ymd}-${String(counter).padStart(4, '0')}`;
}

export async function recordLocalSale(payload: LocalSalePayload): Promise<{ saleId: string; receiptNumber: string; total: number }> {
  const method = payload.paymentMethod === 'credit' ? 'transfer' : payload.paymentMethod;
  const callable = httpsCallable(functions, 'createLocalSale');
  const result = await callable({
    items: payload.items.map(i => ({ productId: i.productId, quantity: i.quantity })),
    paymentMethod: method === 'momo' ? 'momo' : method,
    amountPaid: payload.amountPaid,
    customerName: payload.customerName,
    customerPhone: payload.customerPhone,
    discountPct: payload.discountPct,
    momoRef: payload.momoRef,
    staffName: payload.staffName,
    branchId: payload.branch,
  });
  return result.data as { saleId: string; receiptNumber: string; total: number };
}
