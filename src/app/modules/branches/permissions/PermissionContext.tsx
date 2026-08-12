/**
 * Multi-Branch Module — permission context + hooks.
 *
 * Provides the active PermissionConfig, the current user's role and branch, and
 * pre-bound checks so components never import the raw matrix. Fully
 * configurable: pass a custom `config` (e.g. from `definePermissions(...)`) to
 * the provider to change the rules app-wide.
 *
 * Auth is untouched — role/branch default to the current signed-in user via the
 * routing resolver, but can be overridden by props for previews/tests.
 */
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { BranchAction } from './actions';
import type { AnyRole, PermissionRole } from './roles';
import { resolveRole, ROLE_DEFINITIONS } from './roles';
import type { PermissionConfig } from './config';
import { DEFAULT_PERMISSION_CONFIG } from './config';
import { canWith, canInBranchWith, actionsForWith } from './can';
import { resolveCurrentBranchUser } from '../routes/useCurrentBranchUser';
import { SHOWROOM_SLUG } from '../mock/branches.mock';

interface PermissionContextValue {
  config: PermissionConfig;
  /** Effective permission role (front desk resolved to showroom/branch). */
  role: PermissionRole | undefined;
  /** The user's own branch (scope anchor for own-branch roles). */
  userBranch?: string;
  /** Has the action at all. */
  can: (action: BranchAction) => boolean;
  /** Has the action for a specific target branch (honours scope). */
  canInBranch: (action: BranchAction, targetBranch?: string) => boolean;
  /** All actions the current role holds. */
  actions: () => BranchAction[];
}

const PermissionContext = createContext<PermissionContextValue | null>(null);

export function PermissionProvider({
  children,
  config = DEFAULT_PERMISSION_CONFIG,
  role: roleProp,
  userBranch: branchProp,
  showroomSlug = SHOWROOM_SLUG,
}: {
  children: ReactNode;
  /** Override the rule set (e.g. definePermissions({...})). */
  config?: PermissionConfig;
  /** Override the current role (defaults to signed-in user). */
  role?: AnyRole;
  /** Override the current user's branch (defaults to signed-in user). */
  userBranch?: string;
  /** Which branch counts as "the showroom" for front-desk resolution. */
  showroomSlug?: string;
}) {
  const value = useMemo<PermissionContextValue>(() => {
    const current = resolveCurrentBranchUser();
    const rawRole = roleProp ?? current.role;
    const userBranch = branchProp ?? current.branchId;
    const role = resolveRole(rawRole, { userBranch, showroomSlug });

    return {
      config,
      role,
      userBranch,
      can: (action) => canWith(config, role, action),
      canInBranch: (action, targetBranch) =>
        canInBranchWith(config, role, action, { userBranch, targetBranch }),
      actions: () => actionsForWith(config, role),
    };
  }, [config, roleProp, branchProp, showroomSlug]);

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
}

/** Access the full permission context (throws outside a provider). */
export function usePermissions(): PermissionContextValue {
  const ctx = useContext(PermissionContext);
  if (!ctx) throw new Error('usePermissions must be used within a PermissionProvider');
  return ctx;
}

/** Convenience: boolean check for a single action (optionally per branch). */
export function useCan(action: BranchAction, targetBranch?: string): boolean {
  const { can, canInBranch } = usePermissions();
  return targetBranch === undefined ? can(action) : canInBranch(action, targetBranch);
}

/** The metadata (label/description/scope) for the current role, if any. */
export function useRoleDefinition() {
  const { role } = usePermissions();
  return role ? ROLE_DEFINITIONS[role] : undefined;
}
