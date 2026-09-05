/**
 * Multi-Branch Module — localStorage-backed store (DEMO_MODE).
 *
 * A tiny persistence layer that seeds from mock data on first read and writes
 * back on every mutation. When the real backend is reconnected, only these
 * service files change — callers (hooks/context) keep the same API.
 */

/** Namespaced localStorage keys for the module. */
export const STORE_KEYS = {
  branches: 'cofkans:branches:details',
  inventory: 'cofkans:branches:inventory',
  transfers: 'cofkans:stock-transfers',
  alerts: 'cofkans:stock-alerts',
  sales: 'cofkans:branches:sales',
  catalog: 'cofkans:master-catalog',
} as const;

/** Fired after any store mutation so hooks can re-read. */
export const STORE_EVENT = 'cofkans:branches:store-change';

const canUse = typeof window !== 'undefined' && !!window.localStorage;

/**
 * Seed schema version. BUMP THIS whenever the seed/mock data changes in a way
 * that must reach existing users — e.g. product image URLs moving to a new
 * Supabase bucket. On load, if the persisted version differs, the cached
 * collections are cleared so they re-seed from the current mock data (otherwise
 * demo users keep stale localStorage, and moved images 404).
 */
const SEED_VERSION = '2025-07-bucket-migration';
const VERSION_KEY = 'cofkans:branches:seed-version';

(function ensureSeedVersion() {
  if (!canUse) return;
  try {
    if (window.localStorage.getItem(VERSION_KEY) === SEED_VERSION) return;
    Object.values(STORE_KEYS).forEach((k) => window.localStorage.removeItem(k));
    window.localStorage.setItem(VERSION_KEY, SEED_VERSION);
  } catch {
    /* ignore — demo persistence is best-effort */
  }
})();

/** Read a collection, seeding (and persisting) from `seed` if absent. */
export function readStore<T>(key: string, seed: T[]): T[] {
  if (!canUse) return seed;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) {
      window.localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw) as T[];
  } catch {
    return seed;
  }
}

/** Overwrite a collection and notify listeners. */
export function writeStore<T>(key: string, value: T[]): void {
  if (!canUse) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(STORE_EVENT, { detail: key }));
  } catch {
    /* quota / serialization errors are non-fatal in demo mode */
  }
}

/** Subscribe to store changes; returns an unsubscribe function. */
export function onStoreChange(fn: (key: string) => void): () => void {
  if (!canUse) return () => {};
  const handler = (e: Event) => fn((e as CustomEvent<string>).detail);
  window.addEventListener(STORE_EVENT, handler);
  return () => window.removeEventListener(STORE_EVENT, handler);
}
