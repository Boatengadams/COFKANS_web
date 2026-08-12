/**
 * Product management — role-aware service class.
 *
 * A single source of truth for who may do what to the product catalogue,
 * layered on top of the backend-free developer-portal `store`.
 *
 * Permission matrix (per business rules):
 *
 *   Capability     | Manager | Front Desk | Developer
 *   ---------------|---------|------------|----------
 *   Add product    |   ✅    |    ✅      |   ✅
 *   Update price   |   ✅    |    ✅      |   ✅
 *   Edit details   |   ✅    |    ✅      |   ✅
 *   Remove product |   ❌    |    ❌      |   ✅  (take off)
 *
 * Manager and Front Desk (working from the showroom) stock the catalogue and
 * keep prices current, but only a Developer can permanently take a product off.
 */

import { store, type ID } from './store';
import type { Product } from '../../data/products-full';

export type ProductActorRole = 'manager' | 'front_desk' | 'developer';

export type ProductCapability = 'add' | 'updatePrice' | 'editDetails' | 'delete';

/** Static capability matrix — the authoritative rule table. */
const CAPABILITIES: Record<ProductActorRole, ProductCapability[]> = {
  manager: ['add', 'updatePrice', 'editDetails'],
  front_desk: ['add', 'updatePrice', 'editDetails'],
  developer: ['add', 'updatePrice', 'editDetails', 'delete'],
};

/** Thrown when an actor attempts an operation they are not permitted to do. */
export class ProductPermissionError extends Error {
  constructor(
    public readonly role: ProductActorRole,
    public readonly capability: ProductCapability,
  ) {
    super(`Role "${role}" is not permitted to ${capability} products.`);
    this.name = 'ProductPermissionError';
  }
}

export interface NewProductInput {
  name: string;
  price: number;
  category: string;
  subcategory?: string;
  image?: string;
  stock?: number;
  description?: string;
  sku?: string;
}

/**
 * Role-scoped product manager. Construct with the acting role, then call the
 * mutation methods — each is guarded by the capability matrix and throws a
 * `ProductPermissionError` if the role lacks the required capability.
 */
export class ProductManager {
  constructor(public readonly role: ProductActorRole) {}

  /** True if this role holds the given capability. */
  can(capability: ProductCapability): boolean {
    return CAPABILITIES[this.role]?.includes(capability) ?? false;
  }

  private assert(capability: ProductCapability): void {
    if (!this.can(capability)) throw new ProductPermissionError(this.role, capability);
  }

  /** Read the full catalogue (no permission required). */
  list(): Product[] {
    return store.getProducts();
  }

  /** Add a new product. Manager / Front Desk / Developer. */
  add(input: NewProductInput): Product {
    this.assert('add');
    const sku = input.sku?.trim() || autoSku(input.name);
    const created = store.addProduct({
      name: input.name.trim(),
      sku,
      price: Number(input.price) || 0,
      category: input.category.trim() || 'Uncategorised',
      subcategory: input.subcategory?.trim() || '',
      image: input.image?.trim() || '',
      stock: input.stock == null ? 0 : Number(input.stock),
      description: input.description?.trim() || '',
    });
    store.log('info', this.role, `${label(this.role)} added product “${created.name}”.`);
    return created;
  }

  /** Update only the price of a product. Manager / Front Desk / Developer. */
  updatePrice(id: ID, price: number): void {
    this.assert('updatePrice');
    const p = this.list().find((x) => x.id === id);
    const next = Number(price) || 0;
    store.updateProduct(id, { price: next });
    if (p) {
      store.recordPriceChange({ productId: p.id, sku: p.sku, name: p.name, oldPrice: p.price || 0, newPrice: next, actor: this.role });
      store.log('info', this.role, `${label(this.role)} set “${p.name}” price to GH₵ ${next}.`);
    }
  }

  /** Update descriptive fields (not deletion). */
  editDetails(id: ID, patch: Partial<Omit<Product, 'id'>>): void {
    this.assert('editDetails');
    store.updateProduct(id, patch);
  }

  /** Take a product off the catalogue. Developer only. */
  remove(id: ID): void {
    this.assert('delete');
    const p = this.list().find((x) => x.id === id);
    store.deleteProduct(id);
    if (p) store.log('warn', this.role, `Developer took product “${p.name}” off the catalogue.`);
  }
}

function label(role: ProductActorRole): string {
  return role === 'front_desk' ? 'Front desk' : role === 'developer' ? 'Developer' : 'Manager';
}

/** Derive a tidy CFK SKU from a product name when none is supplied. */
function autoSku(name: string): string {
  const slug = name.replace(/[^a-z0-9]+/gi, '').slice(0, 4).toUpperCase() || 'PROD';
  return `CFK-${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
}

/** Convenience factory. */
export function productManagerFor(role: ProductActorRole): ProductManager {
  return new ProductManager(role);
}
