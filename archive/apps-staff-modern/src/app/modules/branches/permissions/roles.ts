/**
 * Multi-Branch Module — permission roles.
 *
 * The permission system recognises the three requested roles — Manager,
 * Showroom Front Desk and Branch Front Desk — plus Driver and Technician which
 * already exist elsewhere in the app. Each role carries a data scope so guards
 * can enforce "own branch" vs "all branches" without hard-coded checks.
 *
 * A legacy generic `front_desk` role (used by the wider app) is normalised to
 * `branch_front_desk` by `normalizeRole()` so existing callers keep working.
 */
import type { BranchRole } from '../types/user-branch';

/** Roles the permission matrix is keyed by. */
export type PermissionRole =
  | 'manager'
  | 'showroom_front_desk'
  | 'branch_front_desk'
  | 'driver'
  | 'technician'
  | 'developer'
  | 'warehouse'
  | 'accountant'
  | 'hr'
  | 'procurement'
  | 'marketing';

/** Any role string a caller might pass, including the legacy generic desk. */
export type AnyRole = PermissionRole | BranchRole;

/** Data reach of a role. */
export type PermissionScope = 'all' | 'own-branch';

export interface RoleDefinition {
  id: PermissionRole;
  label: string;
  description: string;
  /** Default data scope; individual actions may widen via *.viewAll actions. */
  scope: PermissionScope;
}

/** Human-facing role metadata (configurable). */
export const ROLE_DEFINITIONS: Record<PermissionRole, RoleDefinition> = {
  manager: {
    id: 'manager',
    label: 'Manager',
    description: 'Company-wide authority across every branch. Full access.',
    scope: 'all',
  },
  showroom_front_desk: {
    id: 'showroom_front_desk',
    label: 'Showroom Front Desk',
    description: 'The unified showroom desk — does it all: POS/till, catalog & orders, customer service, plus controls all stock, sends transfers and resolves branch alerts.',
    scope: 'all',
  },
  branch_front_desk: {
    id: 'branch_front_desk',
    label: 'Branch Front Desk',
    description: 'The unified branch desk — does it all: POS/till, catalog & orders, customer service, manages own stock, receives transfers and raises stock requests.',
    scope: 'own-branch',
  },
  driver: {
    id: 'driver',
    label: 'Driver',
    description: 'Moves stock between branches and delivers to customers.',
    scope: 'all',
  },
  technician: {
    id: 'technician',
    label: 'Technician',
    description: 'Field/service role scoped to its home branch.',
    scope: 'own-branch',
  },
  developer: {
    id: 'developer',
    label: 'Developer',
    description: 'System owner. Full technical access across every branch plus platform diagnostics.',
    scope: 'all',
  },
  warehouse: {
    id: 'warehouse',
    label: 'Warehouse',
    description: 'Stock controller. Manages inventory, dispatches and receives transfers company-wide.',
    scope: 'all',
  },
  accountant: {
    id: 'accountant',
    label: 'Accountant',
    description: 'Finance role. Reads sales, receipts and reports across every branch.',
    scope: 'all',
  },
  hr: {
    id: 'hr',
    label: 'Human Resources',
    description: 'People operations. Company-wide visibility of staff and branches.',
    scope: 'all',
  },
  procurement: {
    id: 'procurement',
    label: 'Procurement / Supply',
    description: 'Supply chain. Views stock company-wide, generates purchase orders and manages vendor contracts.',
    scope: 'all',
  },
  marketing: {
    id: 'marketing',
    label: 'Marketing Manager',
    description: 'Growth. Manages promotional content, discounts, pricing tiers and the public catalog display.',
    scope: 'all',
  },
};

/**
 * Normalise any incoming role to a PermissionRole.
 * - legacy generic `front_desk` → `branch_front_desk` (safe default; the
 *   showroom desk is granted explicitly via `showroom_front_desk`).
 */
export function normalizeRole(role: AnyRole | undefined): PermissionRole | undefined {
  if (!role) return undefined;
  if (role === 'front_desk') return 'branch_front_desk';
  if (role in ROLE_DEFINITIONS) return role as PermissionRole;
  return undefined;
}

/**
 * Resolve the effective front-desk role from a generic assignment: a front desk
 * user AT the showroom is a Showroom Front Desk; anywhere else, Branch Front
 * Desk. Managers/drivers/technicians pass through unchanged.
 */
export function resolveRole(
  role: AnyRole | undefined,
  opts: { userBranch?: string; showroomSlug: string },
): PermissionRole | undefined {
  if (role === 'front_desk' || role === 'branch_front_desk' || role === 'showroom_front_desk') {
    return opts.userBranch === opts.showroomSlug ? 'showroom_front_desk' : 'branch_front_desk';
  }
  return normalizeRole(role);
}
