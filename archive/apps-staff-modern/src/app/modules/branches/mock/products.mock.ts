/**
 * Multi-Branch Module — mock product catalog (DEMO_MODE).
 *
 * Wraps the REAL Cofkans catalog (`csvProducts`) so demos show genuine product
 * names/images/categories. The seed catalog lists price 0 (price is owned by
 * staff), so here we apply a stable, realistic demo price per SKU. This keeps a
 * single source of truth for the catalog while giving the module priced data.
 */
import { csvProducts } from '../../../data/csvProducts';
import type { Product } from '../../../data/products-full';

/** Deterministic pseudo-random in [0,1) from a string seed. */
function seededUnit(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

/** Category-aware base price band (GH₵) so prices feel plausible. */
function priceBand(category: string): [number, number] {
  const c = category.toLowerCase();
  if (c.includes('inverter') || c.includes('solar') || c.includes('battery')) return [1200, 6500];
  if (c.includes('switchgear') || c.includes('industrial') || c.includes('cable')) return [250, 3200];
  if (c.includes('fan') || c.includes('outdoor') || c.includes('flood')) return [180, 1400];
  if (c.includes('accessor') || c.includes('socket') || c.includes('switch')) return [20, 260];
  return [60, 900]; // general lighting
}

/** Stable demo price for a product. */
export function demoPrice(p: Pick<Product, 'sku' | 'category'>): number {
  const [lo, hi] = priceBand(p.category);
  const raw = lo + seededUnit(p.sku) * (hi - lo);
  return Math.round(raw / 5) * 5; // round to nearest GH₵ 5
}

/** Full catalog with realistic demo prices applied. */
export const MOCK_PRODUCTS: Product[] = csvProducts.map((p) => ({
  ...p,
  price: demoPrice(p),
}));

/** A compact curated subset (first N per category) for lighter demo views. */
export const MOCK_FEATURED_PRODUCTS: Product[] = (() => {
  const perCategory = new Map<string, number>();
  const out: Product[] = [];
  for (const p of MOCK_PRODUCTS) {
    const n = perCategory.get(p.category) ?? 0;
    if (n < 4) {
      out.push(p);
      perCategory.set(p.category, n + 1);
    }
  }
  return out;
})();

/** Distinct categories present in the catalog. */
export const MOCK_CATEGORIES: string[] = [...new Set(MOCK_PRODUCTS.map((p) => p.category))].sort();

/** Look up a mock product by SKU. */
export function mockProduct(sku: string): Product | undefined {
  return MOCK_PRODUCTS.find((p) => p.sku === sku);
}
