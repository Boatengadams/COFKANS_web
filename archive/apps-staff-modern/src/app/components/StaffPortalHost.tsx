/**
 * Staff Portal Host.
 *
 * The Figma preview mounts `App.tsx` directly (see __figma__entrypoint__.ts) —
 * there is no BrowserRouter and the routes in AppRouter.tsx never render here.
 * So when a staff demo role is selected we render the full Branch Module
 * workspace in-place. The workspace is role-aware: its nav is
 * permission-filtered, and each role lands on its dashboard with access to
 * Inventory, the Sales point-of-sale, Transfers, Reports, etc.
 *
 * The heavy branch module is loaded IMPERATIVELY via dynamic import inside an
 * effect (not React.lazy). Loading in an effect means the component never
 * suspends during a synchronous render/state-update — which is what triggers
 * React's "A component suspended while responding to synchronous input" error
 * when the role is switched. We simply show a spinner until the module resolves.
 *
 * Returns null for guest/customer so the normal storefront shows through.
 */
import { useEffect, useMemo, useState, type ComponentType } from 'react';
import { getDemoRole, setDemoRole, DEMO_ROLE_EVENT, IS_WEB, type DemoRole } from '@/lib/demo-mode';
import { resolveCurrentBranchUser } from '../modules/branches/routes/useCurrentBranchUser';
import { branchLandingPath } from '../modules/branches/routes/paths';
import { PortalErrorBoundary } from './PortalErrorBoundary';

type WorkspaceComponent = ComponentType<{ initialEntry: string }>;

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

/** Roles that have a branch portal to render here. */
const STAFF_ROLES: DemoRole[] = [
  'manager', 'front_desk', 'branch_desk', 'driver', 'technician', 'developer',
  'warehouse', 'accountant', 'hr',
  'procurement', 'marketing',
];

export function StaffPortalHost() {
  const [role, setRole] = useState<DemoRole>(() => getDemoRole());
  const [Workspace, setWorkspace] = useState<WorkspaceComponent | null>(null);

  // Manager has a dedicated canonical route (/manager). The storefront used
  // to mount the legacy branch workspace in-place, so browser Back could
  // expose a second, outdated manager portal. Keep the legacy host available
  // for the other staff previews, but always send managers to the canonical
  // portal.
  useEffect(() => {
    if (!IS_WEB || role !== 'manager' || typeof window === 'undefined') return;
    if (!window.location.pathname.replace(/\/$/, '').endsWith('/manager')) {
      window.location.replace('/manager');
    }
  }, [role]);

  // React to demo role changes (no startTransition needed — we never mount a
  // suspending component synchronously; the workspace is loaded in an effect).
  useEffect(() => {
    if (!IS_WEB || typeof window === 'undefined') return;
    const update = () => setRole(getDemoRole());
    window.addEventListener(DEMO_ROLE_EVENT, update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener(DEMO_ROLE_EVENT, update);
      window.removeEventListener('storage', update);
    };
  }, []);

  const isStaff = STAFF_ROLES.includes(role);
  const isDeveloper = role === 'developer';

  // Load the (heavy) branch workspace module the first time a non-developer
  // staff role is active. Imperative import → resolves asynchronously, never
  // suspends render. The developer role renders its own testing hub instead.
  useEffect(() => {
    if (!isStaff || isDeveloper || Workspace) return;
    let cancelled = false;
    import('./BranchWorkspace').then((m) => {
      if (!cancelled) setWorkspace(() => m.BranchWorkspace);
    });
    return () => { cancelled = true; };
  }, [isStaff, isDeveloper, Workspace]);

  // Developer testing hub — self-contained, backend-free. Loaded imperatively
  // so it never suspends during a synchronous render.
  const [DevPortal, setDevPortal] = useState<ComponentType<{ onBack?: () => void }> | null>(null);
  useEffect(() => {
    if (!isDeveloper || DevPortal) return;
    let cancelled = false;
    import('../pages/DeveloperPortal').then((m) => {
      if (!cancelled) setDevPortal(() => m.DeveloperPortal);
    });
    return () => { cancelled = true; };
  }, [isDeveloper, DevPortal]);

  // Seed the in-memory router at the current user's branch landing.
  const initialEntry = useMemo(() => {
    const u = resolveCurrentBranchUser();
    return u.role ? branchLandingPath(u.branchId, u.role) : '/branches';
  }, [role]);

  if (!isStaff || isManagerRole(role)) return null;

  return (
    <div className="erp-theme fixed inset-0 z-[9000] overflow-auto bg-background">
      <PortalErrorBoundary key={role} onDismiss={() => setDemoRole('guest')}>
        {isDeveloper
          ? (DevPortal ? <DevPortal key="developer" onBack={() => setDemoRole('guest')} /> : <Spinner />)
          : (Workspace ? <Workspace key={role} initialEntry={initialEntry} /> : <Spinner />)}
      </PortalErrorBoundary>
    </div>
  );
}

function isManagerRole(role: DemoRole): boolean {
  return role === 'manager';
}

export default StaffPortalHost;
