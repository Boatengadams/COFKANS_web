/**
 * Multi-Branch Module — ProductInventory model.
 *
 * A single product's stock/price state at ONE branch. This is the per-branch
 * join between a catalog `Product` (owned by the codebase) and the live
 * price/stock (owned by staff). Types only.
 */
import type { Product } from '../../../data/products-full';

/** Live, editable fields staff control per branch (vs. static catalog data). */
export interface ProductStockState {
  /** Selling price at this branch, in GH₵. */
  price: number;
  /** Units on hand at this branch. */
  quantity: number;
  /** Threshold that triggers a low-stock alert. */
  reorderLevel?: number;
}

/**
 * One product's inventory at a specific branch. `productId` / `sku` reference
 * the catalog; the branch is identified by `branchSlug`.
 */
export interface ProductInventory extends ProductStockState {
  productId: string;
  sku: string;
  branchSlug: string;
  /** Denormalized catalog fields for display without a second lookup. */
  name?: string;
  image?: string;
  category?: string;
  updatedAt?: string;
  updatedBy?: string;
}

/** Convenience view pairing the full catalog product with its branch state. */
export interface ProductInventoryView {
  product: Product;
  inventory: ProductInventory;
}

/** Coarse stock-level classification derived from quantity vs. reorderLevel. */
export type StockLevel = 'out' | 'low' | 'ok';
