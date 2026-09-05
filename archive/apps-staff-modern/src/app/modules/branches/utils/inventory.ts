/**
 * Multi-Branch Module — inventory calculation helpers.
 * Pure functions over the module's inventory/cart models.
 */
import type { ProductInventory, StockLevel, InventoryTotals } from '../types/product-inventory';
import type { CartItem, CartTotals } from '../types/cart';

/** Default VAT-style rate applied to counter sales (12.5%). */
export const DEFAULT_TAX_RATE = 0.125;

/** Classify a product's stock level from quantity vs. reorder threshold. */
export function stockLevel(item: Pick<ProductInventory, 'quantity' | 'reorderLevel'>): StockLevel {
  if (item.quantity <= 0) return 'out';
  if (item.reorderLevel != null && item.quantity <= item.reorderLevel) return 'low';
  return 'ok';
}

/** Roll up a list of per-product inventory rows into branch totals. */
export function computeInventoryTotals(items: ProductInventory[]): InventoryTotals {
  let unitsOnHand = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;
  let stockValue = 0;

  for (const item of items) {
    unitsOnHand += item.quantity;
    stockValue += item.quantity * item.price;
    const level = stockLevel(item);
    if (level === 'out') outOfStockCount += 1;
    else if (level === 'low') lowStockCount += 1;
  }

  return {
    skuCount: items.length,
    unitsOnHand,
    lowStockCount,
    outOfStockCount,
    stockValue,
  };
}

/** Compute a single cart line total: unitPrice * qty - discount (never < 0). */
export function computeLineTotal(item: Pick<CartItem, 'unitPrice' | 'quantity' | 'discount'>): number {
  const gross = item.unitPrice * item.quantity;
  const net = gross - (item.discount ?? 0);
  return net > 0 ? net : 0;
}

/** Compute cart totals from its line items plus an optional fee. */
export function computeCartTotals(
  items: CartItem[],
  opts: { taxRate?: number; fee?: number } = {},
): CartTotals {
  const taxRate = opts.taxRate ?? DEFAULT_TAX_RATE;
  const fee = opts.fee ?? 0;

  let subtotal = 0;
  let discount = 0;
  for (const item of items) {
    subtotal += item.unitPrice * item.quantity;
    discount += item.discount ?? 0;
  }

  const taxable = subtotal - discount;
  const tax = (taxable > 0 ? taxable : 0) * taxRate;
  const total = (taxable > 0 ? taxable : 0) + tax + fee;

  return { subtotal, discount, tax, fee, total };
}
