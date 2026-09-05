/**
 * Multi-Branch Module — Cart model.
 *
 * An in-progress point-of-sale basket at a branch (front-desk / counter sale),
 * distinct from the customer web cart. Types only.
 */

/** A single line in a branch POS cart. */
export interface CartItem {
  productId: string;
  sku: string;
  name: string;
  image?: string;
  /** Unit price at time of adding, in GH₵. */
  unitPrice: number;
  quantity: number;
  /** Per-line discount in GH₵ (absolute, applied before tax). */
  discount?: number;
  /** unitPrice * quantity - discount. */
  lineTotal: number;
}

/** Monetary breakdown for a cart. */
export interface CartTotals {
  subtotal: number;
  discount: number;
  tax: number;
  /** Delivery / transport fee if applicable. */
  fee: number;
  total: number;
}

/** Optional customer attached to a counter sale. */
export interface CartCustomer {
  name?: string;
  phone?: string;
  email?: string;
}

/** A live POS cart bound to a branch and cashier. */
export interface Cart {
  id: string;
  branchSlug: string;
  cashierId: string;
  items: CartItem[];
  totals: CartTotals;
  customer?: CartCustomer;
  status: 'active' | 'held' | 'checked-out' | 'voided';
  createdAt: string;
  updatedAt?: string;
}
