import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useStaffRole } from '../../hooks/useStaffRole';
import type { StaffRole } from '../../../lib/staff';

interface Props {
  role: StaffRole;
  branchSlug?: string; // required for branch_manager + rider
  loginPath: string;   // where to send unauthenticated users
  children: ReactNode;
}

/**
 * Route guard for staff portals. Renders children only when the signed-in
 * user has a matching `staffAccounts` row. Otherwise redirects to loginPath.
 * Customers without a staff row are sent home so they can't even tell the
 * portal exists.
 */
export function RequireStaffRole({ role, branchSlug, loginPath, children }: Props) {
  const { loading, staff } = useStaffRole();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!staff) {
    return <Navigate to={loginPath} replace state={{ from: location.pathname }} />;
  }

  const roleOk = staff.role === role;
  const branchOk =
    !branchSlug ||
    (staff.branchSlug && staff.branchSlug.toLowerCase() === branchSlug.toLowerCase());

  if (!roleOk || !branchOk) {
    // Looks like a generic 404 — don't leak that the portal exists
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
