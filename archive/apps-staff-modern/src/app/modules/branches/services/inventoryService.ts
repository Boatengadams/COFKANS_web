/**
 * Multi-Branch Module — inventory service.
 * Per-branch stock/price reads and adjustments (DEMO_MODE = localStorage).
 */
import type { ProductInventory } from '../types/product-inventory';
import type { BranchInventory, InventoryAdjustment } from '../types/branch-inventory';
import { MOCK_INVENTORY } from '../mock/inventory.mock';
import { computeInventoryTotals } from '../utils/inventory';
import { genId } from '../utils/id';
import { getCatalogProduct } from './catalogService';
import { STORE_KEYS, readStore, writeStore } from './storage';

function allRows(): ProductInventory[] {
  return readStore<ProductInventory>(STORE_KEYS.inventory, MOCK_INVENTORY);
}

/** All inventory rows for a branch. */
export function listInventory(branchSlug: string): ProductInventory[] {
  return allRows().filter((r) => r.branchSlug === branchSlug);
}

/** Full branch inventory snapshot with roll-up totals. */
export function getBranchInventory(branchSlug: string): BranchInventory {
  const items = listInventory(branchSlug);
  return {
    branchSlug,
    items,
    totals: computeInventoryTotals(items),
    updatedAt: new Date().toISOString(),
  };
}

/** One product's row at a branch. */
export function getInventoryRow(branchSlug: string, sku: string): ProductInventory | undefined {
  return allRows().find((r) => r.branchSlug === branchSlug && r.sku === sku);
}

/** Set absolute price and/or quantity for a product at a branch. */
export function setInventory(
  branchSlug: string,
  sku: string,
  patch: Partial<Pick<ProductInventory, 'price' | 'quantity' | 'reorderLevel'>>,
  by = 'demo-user',
): ProductInventory | undefined {
  const rows = allRows();
  const idx = rows.findIndex((r) => r.branchSlug === branchSlug && r.sku === sku);
  if (idx === -1) return undefined;
  const updated: ProductInventory = {
    ...rows[idx], ...patch, updatedAt: new Date().toISOString(), updatedBy: by,
  };
  rows[idx] = updated;
  writeStore(STORE_KEYS.inventory, rows);
  return updated;
}

/**
 * Add received stock to a branch, creating the inventory row if the branch
 * doesn't carry the product yet. Price is inherited from an existing row or the
 * master catalog (branches never set price). Used when a transfer is delivered.
 */
export function receiveStock(
  branchSlug: string,
  item: { productId: string; sku: string; name?: string; quantity: number },
  by = 'demo-user',
): ProductInventory {
  const rows = allRows();
  const idx = rows.findIndex((r) => r.branchSlug === branchSlug && r.sku === item.sku);
  if (idx !== -1) {
    const updated: ProductInventory = {
      ...rows[idx],
      quantity: rows[idx].quantity + item.quantity,
      updatedAt: new Date().toISOString(),
      updatedBy: by,
    };
    rows[idx] = updated;
    writeStore(STORE_KEYS.inventory, rows);
    return updated;
  }
  // New product for this branch — seed price from the master catalog.
  const master = getCatalogProduct(item.sku);
  const created: ProductInventory = {
    productId: item.productId,
    sku: item.sku,
    branchSlug,
    name: item.name ?? master?.name ?? item.sku,
    image: master?.image,
    category: master?.category,
    price: master?.price ?? 0,
    quantity: item.quantity,
    reorderLevel: 5,
    updatedAt: new Date().toISOString(),
    updatedBy: by,
  };
  rows.push(created);
  writeStore(STORE_KEYS.inventory, rows);
  return created;
}

/** Apply a relative stock delta (clamped at 0) and return an audit record. */
export function adjustStock(
  branchSlug: string,
  sku: string,
  delta: number,
  reason: InventoryAdjustment['reason'],
  by = 'demo-user',
  note?: string,
): InventoryAdjustment | undefined {
  const row = getInventoryRow(branchSlug, sku);
  if (!row) return undefined;
  const nextQty = Math.max(0, row.quantity + delta);
  setInventory(branchSlug, sku, { quantity: nextQty }, by);
  return {
    id: genId('adj'),
    branchSlug,
    productId: row.productId,
    sku,
    delta,
    reason,
    note,
    by,
    at: new Date().toISOString(),
  };
}
