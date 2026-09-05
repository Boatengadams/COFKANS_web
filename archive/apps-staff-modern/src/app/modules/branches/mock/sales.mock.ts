/**
 * Multi-Branch Module — mock completed sales (DEMO_MODE).
 *
 * A spread of counter sales across several branches, payment methods and
 * channels over the last two weeks. Totals are computed from line items via the
 * shared cart-totals helper so they stay internally consistent.
 */
import type { Sale, PaymentMethod, SaleChannel } from '../types/sale';
import type { CartItem, CartCustomer } from '../types/cart';
import { MOCK_PRODUCTS } from './products.mock';
import { computeCartTotals } from '../utils/inventory';

const hoursAgo = (n: number) => new Date(Date.now() - n * 3_600_000).toISOString();

/** Build a cart line from a catalog index at its demo price. */
function line(i: number, qty: number): CartItem {
  const p = MOCK_PRODUCTS[i % MOCK_PRODUCTS.length];
  return {
    productId: p.id, sku: p.sku, name: p.name, image: p.image,
    unitPrice: p.price, quantity: qty, lineTotal: p.price * qty,
  };
}

interface SaleSeed {
  id: string;
  reference: string;
  branchSlug: string;
  cashierId: string;
  items: CartItem[];
  payment: PaymentMethod;
  channel: SaleChannel;
  soldHoursAgo: number;
  customer?: CartCustomer;
}

const SEEDS: SaleSeed[] = [
  { id: 'sale_1001', reference: 'KA-2026-000201', branchSlug: 'kumasi-asuoyeboa', cashierId: 'usr-ama', items: [line(0, 2), line(20, 1)], payment: 'mobile-money', channel: 'walk-in', soldHoursAgo: 1, customer: { name: 'Kofi Asare', phone: '024-111 2233' } },
  { id: 'sale_1002', reference: 'KA-2026-000202', branchSlug: 'kumasi-asuoyeboa', cashierId: 'usr-ama', items: [line(30, 4)], payment: 'cash', channel: 'walk-in', soldHoursAgo: 3 },
  { id: 'sale_1003', reference: 'KA-2026-000203', branchSlug: 'kumasi-asuoyeboa', cashierId: 'usr-ama', items: [line(45, 1), line(46, 1)], payment: 'card', channel: 'phone-order', soldHoursAgo: 6, customer: { name: 'Adom Electricals Ltd', phone: '030-555 7788', email: 'orders@adom.gh' } },
  { id: 'sale_1004', reference: 'KAD-2026-000061', branchSlug: 'kumasi-adum', cashierId: 'usr-kwabena', items: [line(12, 3)], payment: 'mobile-money', channel: 'walk-in', soldHoursAgo: 20 },
  { id: 'sale_1005', reference: 'KAD-2026-000062', branchSlug: 'kumasi-adum', cashierId: 'usr-kwabena', items: [line(8, 6), line(9, 2)], payment: 'cash', channel: 'delivery', soldHoursAgo: 26, customer: { name: 'Mensah Nyarko', phone: '020-909 1212' } },
  { id: 'sale_1006', reference: 'AOS-2026-000018', branchSlug: 'accra-opera-square', cashierId: 'usr-kojo', items: [line(50, 5), line(52, 2)], payment: 'mobile-money', channel: 'walk-in', soldHoursAgo: 30 },
  { id: 'sale_1007', reference: 'AOS-2026-000019', branchSlug: 'accra-opera-square', cashierId: 'usr-kojo', items: [line(60, 1)], payment: 'bank-transfer', channel: 'online-pickup', soldHoursAgo: 48, customer: { name: 'Bright Homes Ltd', email: 'procure@brighthomes.gh' } },
  { id: 'sale_1008', reference: 'AWB-2026-000007', branchSlug: 'accra-weija-barrier', cashierId: 'usr-esi', items: [line(15, 10)], payment: 'cash', channel: 'walk-in', soldHoursAgo: 52 },
  { id: 'sale_1009', reference: 'OB-2026-000005', branchSlug: 'obuasi-bediem', cashierId: 'usr-nana', items: [line(3, 2), line(5, 3)], payment: 'mobile-money', channel: 'walk-in', soldHoursAgo: 72 },
  { id: 'sale_1010', reference: 'KP-2026-000003', branchSlug: 'kumasi-pampaso', cashierId: 'usr-yaa', items: [line(18, 4)], payment: 'cash', channel: 'walk-in', soldHoursAgo: 96 },
];

export const MOCK_SALES: Sale[] = SEEDS.map((s) => {
  const totals = computeCartTotals(s.items);
  return {
    id: s.id,
    reference: s.reference,
    branchSlug: s.branchSlug,
    cashierId: s.cashierId,
    items: s.items,
    totals,
    customer: s.customer,
    paymentMethod: s.payment,
    channel: s.channel,
    status: 'paid',
    amountPaid: totals.total,
    soldAt: hoursAgo(s.soldHoursAgo),
  } satisfies Sale;
});
