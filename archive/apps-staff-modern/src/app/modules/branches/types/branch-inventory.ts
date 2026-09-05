/**
 * Multi-Branch Module — BranchInventory model.
 *
 * The full inventory snapshot for a single branch: the collection of
 * per-product stock states plus roll-up totals. Types only.
 */
import type { ProductInventory } from './product-inventory';

/** Aggregate counts describing the health of a branch's stock. */
export interface InventoryTotals {
  /** Distinct products carried. */
  skuCount: number;
  /** Sum of all units on hand. */
  unitsOnHand: number;
  /** Products at or below their reorder level (but not zero). */
  lowStockCount: number;
  /** Products with zero units. */
  outOfStockCount: number;
  /** Total retail value of stock on hand, in GH₵. */
  stockValue: number;
}

/** Complete inventory state for one branch. */
export interface BranchInventory {
  branchSlug: string;
  items: ProductInventory[];
  totals: InventoryTotals;
  updatedAt?: string;
}

/** A single manual stock adjustment (audit trail entry). */
export interface InventoryAdjustment {
  id: string;
  branchSlug: string;
  productId: string;
  sku: string;
  /** Positive to add stock, negative to remove. */
  delta: number;
  reason: 'restock' | 'sale' | 'transfer' | 'damage' | 'correction';
  note?: string;
  by: string;
  at: string;
}
