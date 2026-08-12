/**
 * Multi-Branch Module — mock per-branch inventory (DEMO_MODE).
 *
 * Builds a ProductInventory row for every catalog product at every one of the
 * nine branches, with deterministic-but-realistic stock levels and prices
 * (price seeded from the products mock; the showroom carries deeper stock).
 */
import type { ProductInventory } from '../types/product-inventory';
import { MOCK_PRODUCTS } from './products.mock';
import { MOCK_BRANCH_DETAILS, SHOWROOM_SLUG } from './branches.mock';

/** Deterministic pseudo-random in [0,1) from a string seed. */
function seededUnit(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

const nowIso = new Date().toISOString();

/** Full inventory matrix: one row per (branch, product). */
export const MOCK_INVENTORY: ProductInventory[] = MOCK_BRANCH_DETAILS.flatMap((branch) => {
  const isShowroom = branch.slug === SHOWROOM_SLUG;
  const cap = isShowroom ? 120 : 45; // showroom holds the deepest stock
  return MOCK_PRODUCTS.map((p) => {
    const r = seededUnit(`${branch.slug}:${p.sku}`);
    // ~8% of lines out of stock, rest spread up to the branch cap.
    const quantity = r < 0.08 ? 0 : Math.round(r * cap);
    return {
      productId: p.id,
      sku: p.sku,
      branchSlug: branch.slug,
      price: p.price,
      quantity,
      reorderLevel: isShowroom ? 15 : 5,
      name: p.name,
      image: p.image,
      category: p.category,
      updatedAt: nowIso,
      updatedBy: 'demo-seed',
    } satisfies ProductInventory;
  });
});

/** Inventory rows for a single branch. */
export function mockInventoryForBranch(branchSlug: string): ProductInventory[] {
  return MOCK_INVENTORY.filter((row) => row.branchSlug === branchSlug);
}
