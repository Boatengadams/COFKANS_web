/**
 * Multi-Branch Module — Receipt model.
 *
 * The printable/shareable document generated from a Sale. Holds the branch and
 * business details needed to render a standalone receipt. Types only.
 */
import type { CartItem, CartTotals, CartCustomer } from './cart';
import type { PaymentMethod } from './sale';

/** Snapshot of the issuing branch as printed on the receipt. */
export interface ReceiptBranchInfo {
  name: string;
  address: string;
  phone?: string;
  city?: string;
  region?: string;
}

/** A single printable receipt tied to a sale. */
export interface Receipt {
  id: string;
  /** Matches the parent Sale's reference. */
  reference: string;
  saleId: string;
  branch: ReceiptBranchInfo;
  cashierName?: string;
  customer?: CartCustomer;
  items: CartItem[];
  totals: CartTotals;
  paymentMethod: PaymentMethod;
  /** Footer note (return policy, thank-you message, etc.). */
  footerNote?: string;
  issuedAt: string;
  /** Delivery format used for this copy. */
  deliveryChannel?: 'print' | 'sms' | 'email' | 'whatsapp';
}
