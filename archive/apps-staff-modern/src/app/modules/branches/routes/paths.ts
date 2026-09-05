/**
 * Multi-Branch Module — route paths & builders.
 *
 * All module screens live under `/branches/:branchId/...`. These helpers are
 * the single source of truth for building those URLs so links and redirects
 * never hard-code strings. Pure functions — no React, no side effects.
 *
 * This is ADDITIVE: it introduces the `/branches` namespace and does not touch
 * the existing `/manager`, `/frontdesk`, `/driver`, `/technician` portals.
 */
import type { BranchRole } from '../types/user-branch';

/** Root of the module's route namespace. */
export const BRANCH_BASE = '/branches';

/** The sub-views a branch exposes (mirrors the module folder structure). */
export type BranchSegment =
  | 'dashboard'
  | 'inventory'
  | 'products'
  | 'sales'
  | 'receipts'
  | 'transfers'
  | 'reports'
  | 'settings';

/** Ordered list of segments (useful for nav / tab rendering later). */
export const BRANCH_SEGMENTS: BranchSegment[] = [
  'dashboard', 'inventory', 'products', 'sales', 'receipts', 'transfers', 'reports', 'settings',
];

/** The landing segment each role should see first at a branch. */
export const ROLE_LANDING: Record<BranchRole, BranchSegment> = {
  manager: 'dashboard',
  front_desk: 'dashboard',
  driver: 'dashboard',
  technician: 'dashboard',
  developer: 'dashboard',
  warehouse: 'dashboard',
  accountant: 'dashboard',
  hr: 'dashboard',
  procurement: 'dashboard',
  marketing: 'dashboard',
};

/** Build a path to a branch (optionally a specific segment). */
export function branchPath(branchId: string, segment?: BranchSegment): string {
  const base = `${BRANCH_BASE}/${encodeURIComponent(branchId)}`;
  return segment ? `${base}/${segment}` : base;
}

/** The default landing path for a role at a given branch. */
export function branchLandingPath(branchId: string, role: BranchRole): string {
  return branchPath(branchId, ROLE_LANDING[role] ?? 'dashboard');
}

/** React-Router pattern strings for declaring the module's nested routes. */
export const BRANCH_ROUTE_PATTERNS = {
  /** Mount point, e.g. <Route path={BRANCH_ROUTE_PATTERNS.root}> */
  root: `${BRANCH_BASE}/*`,
  /** Relative child patterns under the mount point. */
  branchRoot: ':branchId',
  segment: ':branchId/:segment',
} as const;
