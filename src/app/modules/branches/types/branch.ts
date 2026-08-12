/**
 * Multi-Branch Module — Branch model.
 *
 * Re-exports the canonical `Branch` type from the shared lib so the module has
 * a single import surface, and adds branch-scoped extensions used only inside
 * the module (operational status, contact roles, geo).
 *
 * Types only — no runtime logic.
 */
import type { Branch as CoreBranch } from '../../../../lib/branches';

/** Canonical branch record (slug, name, city, region, address, phones…). */
export type Branch = CoreBranch;

/** Operational state of a branch beyond the simple `isActive` flag. */
export type BranchStatus = 'open' | 'closed' | 'maintenance' | 'archived';

/** Geographic coordinates for map / routing features. */
export interface BranchGeo {
  lat: number;
  lng: number;
}

/**
 * Extended branch view used by the module's dashboards. Wraps the core branch
 * with operational metadata that is not part of the public storefront shape.
 */
export interface BranchDetail extends Branch {
  status: BranchStatus;
  geo?: BranchGeo;
  /** UID of the manager responsible for this branch. */
  managerId?: string;
  /** Number of staff currently assigned to this branch. */
  staffCount?: number;
  /** ISO timestamp of the last inventory reconciliation. */
  lastStockCountAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Minimal reference used when a full branch record is not needed. */
export interface BranchRef {
  slug: string;
  name: string;
}
