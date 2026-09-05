/**
 * Multi-Branch Module — automatic branch redirect.
 *
 * Drop this at the `/branches` index (or any entry point) and it sends the
 * signed-in user straight to THEIR branch dashboard, using their role to pick
 * the right landing view. Non-staff users are sent to a configurable fallback
 * (defaults to the staff login) - it never changes auth, only navigation.
 */
import { Navigate } from 'react-router-dom';
import { useCurrentBranchUser } from './useCurrentBranchUser';
import { branchLandingPath } from './paths';

export function BranchRedirect({
  fallback = '/login',
}: {
  /** Where to send users who aren't signed-in staff. */
  fallback?: string;
}) {
  const { isStaff, role, branchId } = useCurrentBranchUser();

  if (!isStaff || !role) {
    return <Navigate to={fallback} replace />;
  }

  return <Navigate to={branchLandingPath(branchId, role)} replace />;
}

export default BranchRedirect;
