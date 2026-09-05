/**
 * Multi-Branch Module — core permission checks.
 *
 * All checks read from a PermissionConfig (defaults to DEFAULT_PERMISSION_CONFIG
 * so callers can stay simple). Two layers:
 *   1. `canWith` / `can` — does the role have the action at all?
 *   2. `canInBranchWith` / `canInBranch` — plus a data-scope check for a target
 *      branch ("own-branch" roles may only act on their own branch).
 */
import type { BranchAction } from './actions';
import type { AnyRole, PermissionRole } from './roles';
import { normalizeRole } from './roles';
import type { PermissionConfig } from './config';
import { DEFAULT_PERMISSION_CONFIG } from './config';

/** True if the role is granted the action in the given config. */
export function canWith(
  config: PermissionConfig,
  role: AnyRole | undefined,
  action: BranchAction,
): boolean {
  const r = normalizeRole(role);
  if (!r) return false;
  return config.roles[r]?.actions.includes(action) ?? false;
}

/** All actions a role has in the given config. */
export function actionsForWith(
  config: PermissionConfig,
  role: AnyRole | undefined,
): BranchAction[] {
  const r = normalizeRole(role);
  if (!r) return [];
  return config.roles[r]?.actions ?? [];
}

/** The data scope of a role in the given config. */
export function scopeForWith(
  config: PermissionConfig,
  role: AnyRole | undefined,
): 'all' | 'own-branch' | undefined {
  const r = normalizeRole(role);
  if (!r) return undefined;
  return config.roles[r]?.scope;
}

/**
 * Action check plus a branch-scope check. `all`-scoped roles may act on any
 * branch; `own-branch` roles only when target === user's branch (or no target).
 */
export function canInBranchWith(
  config: PermissionConfig,
  role: AnyRole | undefined,
  action: BranchAction,
  ctx: { userBranch?: string; targetBranch?: string } = {},
): boolean {
  if (!canWith(config, role, action)) return false;
  const scope = scopeForWith(config, role);
  if (scope === 'all') return true;
  // own-branch: must have a known user branch and match (or no specific target)
  if (!ctx.targetBranch) return true;
  return !!ctx.userBranch && ctx.userBranch === ctx.targetBranch;
}

/* ------------------------------------------------------------------ */
/* Convenience wrappers bound to the DEFAULT config (backward compatible). */

/** Does the role have the action? (default config) */
export function can(role: AnyRole | undefined, action: BranchAction): boolean {
  return canWith(DEFAULT_PERMISSION_CONFIG, role, action);
}

/** All actions for a role. (default config) */
export function actionsFor(role: AnyRole | undefined): BranchAction[] {
  return actionsForWith(DEFAULT_PERMISSION_CONFIG, role);
}

/** Action + branch-scope check. (default config) */
export function canInBranch(
  role: AnyRole | undefined,
  action: BranchAction,
  ctx: { userBranch?: string; targetBranch?: string } = {},
): boolean {
  return canInBranchWith(DEFAULT_PERMISSION_CONFIG, role, action, ctx);
}

/** Back-compat: role → actions map for the default config. */
export const BRANCH_PERMISSIONS: Record<PermissionRole, BranchAction[]> = Object.fromEntries(
  (Object.keys(DEFAULT_PERMISSION_CONFIG.roles) as PermissionRole[]).map((r) => [
    r, DEFAULT_PERMISSION_CONFIG.roles[r].actions,
  ]),
) as Record<PermissionRole, BranchAction[]>;
