/**
 * Multi-Branch Module — master catalog service (DEMO_MODE, mock only).
 *
 * There is exactly ONE master product list for the whole company. Each entry
 * carries the single master selling price. Prices are owned centrally (by the
 * Showroom Front Desk) — branches read this list but never change prices; they
 * only manage their own stock quantities (see inventoryService).
 *
 * Backend-free: seeded from MOCK_PRODUCTS, persisted in localStorage.
 */
import type { Product } from '../../../data/products-full';
import { MOCK_PRODUCTS } from '../mock/products.mock';
import { STORE_KEYS, readStore, writeStore } from './storage';

/** A single master catalog entry (catalog fields + the master price). */
export interface MasterProduct {
  id: string;
  sku: string;
  name: string;
  category: string;
  subcategory?: string;
  image?: string;
  /** The one company-wide selling price, in GH₵. */
  price: number;
  updatedAt?: string;
  updatedBy?: string;
}

/** Seed the master list from the mock catalog. */
const SEED: MasterProduct[] = MOCK_PRODUCTS.map((p: Product) => ({
  id: p.id,
  sku: p.sku,
  name: p.name,
  category: p.category,
  subcategory: p.subcategory,
  image: p.image,
  price: p.price,
}));

/** The full master product list. */
export function listCatalog(): MasterProduct[] {
  return readStore<MasterProduct>(STORE_KEYS.catalog, SEED);
}

/** One master product by SKU. */
export function getCatalogProduct(sku: string): MasterProduct | undefined {
  return listCatalog().find((p) => p.sku === sku);
}

/** Distinct categories in the master list. */
export function listCatalogCategories(): string[] {
  return [...new Set(listCatalog().map((p) => p.category))].sort();
}

/**
 * Set the master price for a product. Intended for Showroom Front Desk only —
 * callers must gate this behind the appropriate permission/role.
 */
export function setMasterPrice(sku: string, price: number, by = 'showroom-front-desk'): MasterProduct | undefined {
  if (!Number.isFinite(price) || price < 0) return undefined;
  const all = listCatalog();
  const idx = all.findIndex((p) => p.sku === sku);
  if (idx === -1) return undefined;
  const updated: MasterProduct = { ...all[idx], price, updatedAt: new Date().toISOString(), updatedBy: by };
  all[idx] = updated;
  writeStore(STORE_KEYS.catalog, all);
  return updated;
}
