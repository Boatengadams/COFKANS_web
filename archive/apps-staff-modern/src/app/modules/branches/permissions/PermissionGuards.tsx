/**
 * Multi-Branch Module — reusable permission guards (UI-agnostic).
 *
 *   <Can action="transfer.create"> ...only rendered if permitted... </Can>
 *   <Can action="inventory.adjust" branch={slug} fallback={<Denied/>}> ... </Can>
 *   <RequirePermission action="settings.edit" redirectTo="/branches">...</RequirePermission>
 *
 * These render nothing of their own — no styling, no layout — they only gate
 * their children based on the PermissionProvider's config.
 */
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import type { BranchAction } from './actions';
import { usePermissions } from './PermissionContext';

/** Renders `children` only when the current role may perform `action`. */
export function Can({
  action,
  branch,
  children,
  fallback = null,
}: {
  action: BranchAction;
  /** Optional target branch for a scope-aware check. */
  branch?: string;
  children: ReactNode;
  /** Rendered when not permitted (defaults to nothing). */
  fallback?: ReactNode;
}) {
  const { can, canInBranch } = usePermissions();
  const allowed = branch === undefined ? can(action) : canInBranch(action, branch);
  return <>{allowed ? children : fallback}</>;
}

/** Inverse of <Can> — renders children only when NOT permitted. */
export function Cannot({
  action,
  branch,
  children,
}: {
  action: BranchAction;
  branch?: string;
  children: ReactNode;
}) {
  const { can, canInBranch } = usePermissions();
  const allowed = branch === undefined ? can(action) : canInBranch(action, branch);
  return <>{allowed ? null : children}</>;
}

/**
 * Route/section guard: renders children when permitted, otherwise redirects.
 * Use for whole pages/segments that require a capability.
 */
export function RequirePermission({
  action,
  branch,
  redirectTo = '/branches',
  children,
}: {
  action: BranchAction;
  branch?: string;
  redirectTo?: string;
  children: ReactNode;
}) {
  const { can, canInBranch } = usePermissions();
  const allowed = branch === undefined ? can(action) : canInBranch(action, branch);
  if (!allowed) return <Navigate to={redirectTo} replace />;
  return <>{children}</>;
}
