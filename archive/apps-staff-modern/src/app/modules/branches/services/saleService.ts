/**
 * Multi-Branch Module — sale & receipt service.
 * Persists completed counter sales and derives printable receipts (DEMO_MODE).
 */
import type { Sale } from '../types/sale';
import type { Cart } from '../types/cart';
import type { Receipt } from '../types/receipt';
import { MOCK_SALES } from '../mock/sales.mock';
import { genId, genReference } from '../utils/id';
import { getBranch } from './branchService';
import { STORE_KEYS, readStore, writeStore } from './storage';

export function listSales(): Sale[] {
  return readStore<Sale>(STORE_KEYS.sales, MOCK_SALES);
}

export function listBranchSales(branchSlug: string): Sale[] {
  return listSales().filter((s) => s.branchSlug === branchSlug);
}

export function getSale(id: string): Sale | undefined {
  return listSales().find((s) => s.id === id);
}

/**
 * Convert a checked-out cart into a persisted Sale. Totals come straight from
 * the cart (already computed by the POS via computeCartTotals).
 */
export function createSaleFromCart(
  cart: Cart,
  opts: {
    paymentMethod: Sale['paymentMethod'];
    channel: Sale['channel'];
    amountPaid: number;
  },
): Sale {
  const all = listSales();
  const seq = all.filter((s) => s.branchSlug === cart.branchSlug).length + 1;
  const sale: Sale = {
    id: genId('sale'),
    reference: genReference(cart.branchSlug, seq),
    branchSlug: cart.branchSlug,
    cashierId: cart.cashierId,
    items: cart.items,
    totals: cart.totals,
    customer: cart.customer,
    paymentMethod: opts.paymentMethod,
    channel: opts.channel,
    status: opts.amountPaid >= cart.totals.total ? 'paid' : opts.amountPaid > 0 ? 'partial' : 'unpaid',
    amountPaid: opts.amountPaid,
    soldAt: new Date().toISOString(),
  };
  writeStore(STORE_KEYS.sales, [sale, ...all]);
  return sale;
}

/** Build a printable receipt from a persisted sale. */
export function buildReceipt(
  saleId: string,
  opts: { cashierName?: string; footerNote?: string; deliveryChannel?: Receipt['deliveryChannel'] } = {},
): Receipt | undefined {
  const sale = getSale(saleId);
  if (!sale) return undefined;
  const branch = getBranch(sale.branchSlug);
  return {
    id: genId('rcpt'),
    reference: sale.reference,
    saleId: sale.id,
    branch: {
      name: branch?.name ?? sale.branchSlug,
      address: branch?.address ?? '',
      phone: branch?.phone,
      city: branch?.city,
      region: branch?.region,
    },
    cashierName: opts.cashierName,
    customer: sale.customer,
    items: sale.items,
    totals: sale.totals,
    paymentMethod: sale.paymentMethod,
    footerNote: opts.footerNote ?? 'Thank you for shopping with Cofkans Electricals.',
    issuedAt: new Date().toISOString(),
    deliveryChannel: opts.deliveryChannel ?? 'print',
  };
}
