/**
 * Multi-Branch Module — mock stock transfers and alerts (DEMO_MODE).
 *
 * Transfers flow mostly from the showroom out to branches, plus a couple of
 * branch-to-branch moves. Alerts are low-stock requests branches raise for the
 * front desk to fulfil. Products are pulled from the priced catalog mock.
 */
import type { Transfer, TransferItem, StockAlert } from '../types/transfer';
import { MOCK_PRODUCTS } from './products.mock';
import { SHOWROOM_SLUG } from './branches.mock';

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();
const hoursAgo = (n: number) => new Date(Date.now() - n * 3_600_000).toISOString();

/** Build a transfer line from a catalog index. */
function line(i: number, quantity: number): TransferItem {
  const p = MOCK_PRODUCTS[i % MOCK_PRODUCTS.length];
  return { productId: p.id, sku: p.sku, name: p.name, quantity };
}

export const MOCK_TRANSFERS: Transfer[] = [
  {
    id: 'trf_1001',
    fromBranch: SHOWROOM_SLUG, toBranch: 'kumasi-adum',
    items: [line(0, 10), line(1, 6)],
    status: 'pending', driverId: null,
    createdBy: 'usr-ama', createdAt: hoursAgo(2),
    note: 'Restock LED floodlights for weekend demand.',
  },
  {
    id: 'trf_1002',
    fromBranch: SHOWROOM_SLUG, toBranch: 'accra-opera-square',
    items: [line(12, 20)],
    status: 'pending', driverId: null,
    createdBy: 'usr-ama', createdAt: hoursAgo(5),
  },
  {
    id: 'trf_1003',
    fromBranch: SHOWROOM_SLUG, toBranch: 'kumasi-abuakwa',
    items: [line(3, 8), line(5, 4)],
    status: 'claimed', driverId: 'usr-yaw', driverName: 'Yaw Mensah',
    createdBy: 'usr-ama', createdAt: daysAgo(1), claimedAt: hoursAgo(20),
  },
  {
    id: 'trf_1004',
    fromBranch: SHOWROOM_SLUG, toBranch: 'accra-weija-barrier',
    items: [line(8, 12), line(9, 6), line(11, 10)],
    status: 'in_transit', driverId: 'usr-fiifi', driverName: 'Fiifi Owusu',
    createdBy: 'usr-ama', createdAt: daysAgo(2), claimedAt: daysAgo(2), pickedUpAt: hoursAgo(9),
    note: 'Long-haul Accra run — batch with Opera Square drop.',
  },
  {
    id: 'trf_1005',
    fromBranch: SHOWROOM_SLUG, toBranch: 'obuasi-bediem',
    items: [line(15, 15)],
    status: 'delivered', driverId: 'usr-yaw', driverName: 'Yaw Mensah',
    createdBy: 'usr-ama', createdAt: daysAgo(5), claimedAt: daysAgo(5),
    pickedUpAt: daysAgo(4), deliveredAt: daysAgo(3),
  },
  {
    id: 'trf_1006',
    fromBranch: 'kumasi-adum', toBranch: 'kumasi-pampaso',
    items: [line(18, 5)],
    status: 'delivered', driverId: 'usr-yaw', driverName: 'Yaw Mensah',
    createdBy: 'usr-kwabena', createdAt: daysAgo(7), claimedAt: daysAgo(7),
    pickedUpAt: daysAgo(7), deliveredAt: daysAgo(6),
    note: 'Branch-to-branch balancing of ceiling fans.',
  },
];

export const MOCK_ALERTS: StockAlert[] = [
  {
    id: 'alert_1001',
    branchSlug: 'kumasi-nkawie',
    ...({ productId: MOCK_PRODUCTS[2].id, sku: MOCK_PRODUCTS[2].sku, name: MOCK_PRODUCTS[2].name }),
    requestedQty: 15, status: 'pending', raisedBy: 'usr-adjoa', raisedAt: hoursAgo(3),
  },
  {
    id: 'alert_1002',
    branchSlug: 'obuasi-central',
    ...({ productId: MOCK_PRODUCTS[6].id, sku: MOCK_PRODUCTS[6].sku, name: MOCK_PRODUCTS[6].name }),
    requestedQty: 8, status: 'pending', raisedBy: 'usr-yaw-b', raisedAt: hoursAgo(8),
  },
  {
    id: 'alert_1003',
    branchSlug: 'accra-weija-barrier',
    ...({ productId: MOCK_PRODUCTS[10].id, sku: MOCK_PRODUCTS[10].sku, name: MOCK_PRODUCTS[10].name }),
    requestedQty: 20, status: 'approved', raisedBy: 'usr-esi', raisedAt: daysAgo(2), resolvedAt: daysAgo(1),
  },
  {
    id: 'alert_1004',
    branchSlug: 'kumasi-pampaso',
    ...({ productId: MOCK_PRODUCTS[14].id, sku: MOCK_PRODUCTS[14].sku, name: MOCK_PRODUCTS[14].name }),
    requestedQty: 6, status: 'declined', raisedBy: 'usr-yaa', raisedAt: daysAgo(3), resolvedAt: daysAgo(2),
  },
];
