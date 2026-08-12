/**
 * Multi-Branch Module — Sale model.
 *
 * A completed transaction at a branch (the persisted result of checking out a
 * Cart). Types only.
 */
import type { CartItem, CartTotals, CartCustomer } from './cart';

/** How the sale was paid for. */
export type PaymentMethod = 'cash' | 'mobile-money' | 'card' | 'bank-transfer' | 'credit';

/** Where the goods go after the sale. */
export type SaleChannel = 'walk-in' | 'phone-order' | 'delivery' | 'online-pickup';

/** Payment status of a sale. */
export type SaleStatus = 'paid' | 'partial' | 'unpaid' | 'refunded' | 'voided';

/** A completed branch sale. Line items snapshot the cart at checkout time. */
export interface Sale {
  id: string;
  /** Human-facing receipt/sale number, e.g. "KA-2026-000123". */
  reference: string;
  branchSlug: string;
  cashierId: string;
  items: CartItem[];
  totals: CartTotals;
  customer?: CartCustomer;
  paymentMethod: PaymentMethod;
  channel: SaleChannel;
  status: SaleStatus;
  /** Amount actually received (for partial/credit sales). */
  amountPaid: number;
  soldAt: string;
  /** Set when a sale is later reversed. */
  refundedAt?: string;
}
