/**
 * Multi-Branch Module — transfer & stock-alert service.
 * Front Desk creates transfers; drivers claim/deliver them (DEMO_MODE).
 */
import type { Transfer, TransferItem, StockAlert } from '../types/transfer';
import { MOCK_TRANSFERS, MOCK_ALERTS } from '../mock/transfers.mock';
import { genId } from '../utils/id';
import { adjustStock, receiveStock } from './inventoryService';
import { STORE_KEYS, readStore, writeStore } from './storage';

/* ---------------------------------------------------------------- transfers */

export function listTransfers(): Transfer[] {
  return readStore<Transfer>(STORE_KEYS.transfers, MOCK_TRANSFERS);
}

/** Transfers a driver can act on: unclaimed (pending) or owned by them. */
export function listDriverTransfers(driverId: string): Transfer[] {
  return listTransfers().filter(
    (t) => t.status === 'pending' || t.driverId === driverId,
  );
}

/** Transfers originating from a branch (Front Desk view). */
export function listOutgoingTransfers(fromBranch: string): Transfer[] {
  return listTransfers().filter((t) => t.fromBranch === fromBranch);
}

export function createTransfer(input: {
  fromBranch: string;
  toBranch: string;
  items: TransferItem[];
  createdBy: string;
  alertId?: string;
  note?: string;
}): Transfer {
  const transfer: Transfer = {
    id: genId('trf'),
    status: 'pending',
    driverId: null,
    createdAt: new Date().toISOString(),
    ...input,
  };
  const all = listTransfers();
  writeStore(STORE_KEYS.transfers, [transfer, ...all]);
  // Physically reserve the stock from the source branch when the transfer is
  // created (DEMO_MODE). Destination receives it on delivery.
  for (const item of input.items) {
    adjustStock(input.fromBranch, item.sku, -item.quantity, 'transfer', input.createdBy);
  }
  return transfer;
}

function patchTransfer(id: string, patch: Partial<Transfer>): Transfer | undefined {
  const all = listTransfers();
  const idx = all.findIndex((t) => t.id === id);
  if (idx === -1) return undefined;
  const updated = { ...all[idx], ...patch };
  all[idx] = updated;
  writeStore(STORE_KEYS.transfers, all);
  return updated;
}

export function claimTransfer(id: string, driverId: string, driverName?: string) {
  return patchTransfer(id, {
    status: 'claimed', driverId, driverName, claimedAt: new Date().toISOString(),
  });
}

export function pickUpTransfer(id: string) {
  return patchTransfer(id, { status: 'in_transit', pickedUpAt: new Date().toISOString() });
}

export function deliverTransfer(id: string) {
  const transfer = listTransfers().find((t) => t.id === id);
  if (transfer && transfer.status !== 'delivered') {
    // Land the reserved stock at the destination branch (creates the row if the
    // branch didn't carry the product yet).
    for (const item of transfer.items) {
      receiveStock(
        transfer.toBranch,
        { productId: item.productId, sku: item.sku, name: item.name, quantity: item.quantity },
        transfer.driverId ?? 'unassigned-driver',
      );
    }
  }
  return patchTransfer(id, { status: 'delivered', deliveredAt: new Date().toISOString() });
}

export function cancelTransfer(id: string) {
  return patchTransfer(id, { status: 'cancelled' });
}

/* ------------------------------------------------------------------- alerts */

export function listAlerts(): StockAlert[] {
  return readStore<StockAlert>(STORE_KEYS.alerts, MOCK_ALERTS);
}

export function raiseAlert(input: {
  branchSlug: string;
  productId: string;
  sku: string;
  name: string;
  requestedQty: number;
  raisedBy: string;
}): StockAlert {
  const alert: StockAlert = {
    id: genId('alert'),
    status: 'pending',
    raisedAt: new Date().toISOString(),
    ...input,
  };
  writeStore(STORE_KEYS.alerts, [alert, ...listAlerts()]);
  return alert;
}

function patchAlert(id: string, patch: Partial<StockAlert>): StockAlert | undefined {
  const all = listAlerts();
  const idx = all.findIndex((a) => a.id === id);
  if (idx === -1) return undefined;
  const updated = { ...all[idx], ...patch };
  all[idx] = updated;
  writeStore(STORE_KEYS.alerts, all);
  return updated;
}

export function resolveAlert(id: string, status: 'approved' | 'declined') {
  return patchAlert(id, { status, resolvedAt: new Date().toISOString() });
}
