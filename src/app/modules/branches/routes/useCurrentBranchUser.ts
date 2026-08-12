/**
 * Multi-Branch Module — current-user resolver for routing.
 *
 * Reads the signed-in user's role + branchId WITHOUT changing authentication.
 * In DEMO_MODE this comes from the demo role/user in localStorage; when the
 * real backend is reconnected only this hook changes (callers stay the same).
 *
 * Every logged-in staff user is assumed to have a branchId and role; when a
 * branch isn't set on the account we fall back to the main showroom.
 */
import { useEffect, useState } from 'react';
import {
  getDemoRole, getDemoUser, DEMO_ROLE_EVENT, IS_WEB, type DemoRole,
} from '../../../../lib/demo-mode';
import type { BranchRole } from '../types/user-branch';
import { SHOWROOM_SLUG } from '../mock/branches.mock';

export interface CurrentBranchUser {
  /** True when a staff user is signed in with a branch role. */
  isStaff: boolean;
  /** The user's branch role, or undefined for guests/customers/developers. */
  role?: BranchRole;
  /** The user's home branch slug (showroom fallback). */
  branchId: string;
  /** Managers may view any branch; others are scoped to their own. */
  canAccessAllBranches: boolean;
}

/** Map the raw demo role to a branch role (or undefined if not staff). */
export function demoRoleToBranchRole(role: DemoRole): BranchRole | undefined {
  switch (role) {
    case 'manager': return 'manager';
    case 'front_desk': return 'front_desk';
    case 'branch_desk': return 'front_desk'; // resolved to branch_front_desk by branch
    case 'driver': return 'driver';
    case 'technician': return 'technician';
    case 'developer': return 'developer';
    case 'warehouse': return 'warehouse';
    case 'accountant': return 'accountant';
    case 'hr': return 'hr';
    case 'procurement': return 'procurement';
    case 'marketing': return 'marketing';
    default: return undefined; // guest, customer
  }
}

/** Resolve the current user's routing context (pure, non-hook version). */
export function resolveCurrentBranchUser(): CurrentBranchUser {
  const demoRole = getDemoRole();
  const role = demoRoleToBranchRole(demoRole);
  const user = getDemoUser(demoRole);
  const branchId = user?.branchSlug ?? SHOWROOM_SLUG;
  return {
    isStaff: role != null,
    role,
    branchId,
    canAccessAllBranches:
      role === 'manager' || role === 'developer' ||
      role === 'warehouse' || role === 'accountant' || role === 'hr' ||
      role === 'procurement' || role === 'marketing',
  };
}

/** Live current-user routing context; re-reads on demo role changes. */
export function useCurrentBranchUser(): CurrentBranchUser {
  const [ctx, setCtx] = useState<CurrentBranchUser>(resolveCurrentBranchUser);

  useEffect(() => {
    if (!IS_WEB || typeof window === 'undefined') return;
    const update = () => setCtx(resolveCurrentBranchUser());
    window.addEventListener(DEMO_ROLE_EVENT, update);
    // storage event covers changes made in other tabs
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener(DEMO_ROLE_EVENT, update);
      window.removeEventListener('storage', update);
    };
  }, []);

  return ctx;
}
