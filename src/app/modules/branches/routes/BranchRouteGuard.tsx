/**
 * Multi-Branch Module — branch route guard.
 *
 * Wraps a branch-scoped route and enforces two things WITHOUT touching auth:
 *   1. the user is signed-in staff (else → login fallback);
 *   2. the :branchId in the URL is one the user may view — managers may view
 *      any branch, everyone else is scoped to their own home branch (else they
 *      are redirected to their own branch landing).
 *
 * It also validates the branch actually exists.
 */
import { Navigate, useParams } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useCurrentBranchUser } from './useCurrentBranchUser';
import { branchLandingPath } from './paths';
import { getBranch } from '../services/branchService';

export function BranchRouteGuard({
  children,
  fallback = '/login',
}: {
  children: ReactNode;
  fallback?: string;
}) {
  const { isStaff, role, branchId, canAccessAllBranches } = useCurrentBranchUser();
  const { branchId: urlBranchId } = useParams();

  // Not signed-in staff → login.
  if (!isStaff || !role) {
    return <Navigate to={fallback} replace />;
  }

  // Missing/unknown branch in URL → send to the user's own branch.
  if (!urlBranchId || !getBranch(urlBranchId)) {
    return <Navigate to={branchLandingPath(branchId, role)} replace />;
  }

  // Non-managers may only view their own branch.
  if (!canAccessAllBranches && urlBranchId !== branchId) {
    return <Navigate to={branchLandingPath(branchId, role)} replace />;
  }

  return <>{children}</>;
}

export default BranchRouteGuard;
