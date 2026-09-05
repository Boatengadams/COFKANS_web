/**
 * Shared web entry for staff portal routes.
 *
 * /login signs into the web auth provider and persists the resolved staff role
 * in demo-mode storage. Dedicated Expo Router routes then render the same
 * branch workspace with the current user's role and branch context.
 */
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { FirebaseAuthProvider, useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import { BranchWorkspace } from '../BranchWorkspace';
import {
  DEMO_MODE,
  DEMO_ROLE_EVENT,
  getDemoRole,
  type DemoRole,
} from '@/lib/demo-mode';
import { useStaffRole } from '@/lib/staff-auth';
import { resolveCurrentBranchUser } from '../../modules/branches/routes/useCurrentBranchUser';
import { branchLandingPath } from '../../modules/branches/routes/paths';

const ROLE_ROUTE: Partial<Record<DemoRole, string>> = {
  manager: '/manager',
  front_desk: '/frontdesk',
  branch_desk: '/branchdesk',
  driver: '/driver',
  technician: '/technician',
  warehouse: '/warehouse',
  accountant: '/accountant',
  hr: '/hr',
  procurement: '/procurement',
  marketing: '/marketing',
  developer: '/developer-portal',
};

const isDemoRole = (role: string): role is DemoRole => role in ROLE_ROUTE || role === 'guest' || role === 'customer';

const toPortalDemoRole = (role: string | null): DemoRole => {
  if (role === 'transport_driver') return 'driver';
  return role && isDemoRole(role) ? role : 'guest';
};

const Spinner = () => (
  <div className="erp-theme flex min-h-screen items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="text-sm text-muted-foreground">Loading your portal…</p>
    </div>
  </div>
);

function StaffPortalEntryInner({
  allowedRoles,
  children,
}: {
  allowedRoles: DemoRole[];
  children?: ReactNode;
}) {
  const router = useRouter();
  const { firebaseUser, isLoading: authLoading } = useFirebaseAuth();
  const { kind: staffKind, loading: roleLoading } = useStaffRole();
  const [demoRole, setDemoRoleState] = useState<DemoRole>(() => getDemoRole());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const update = () => setDemoRoleState(getDemoRole());
    window.addEventListener(DEMO_ROLE_EVENT, update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener(DEMO_ROLE_EVENT, update);
      window.removeEventListener('storage', update);
    };
  }, []);

  const role: DemoRole = DEMO_MODE
    ? demoRole
    : toPortalDemoRole(staffKind);
  const isLoading = authLoading || (!DEMO_MODE && roleLoading);

  useEffect(() => {
    if (isLoading) return;
    if (!firebaseUser) {
      router.replace('/login' as never);
      return;
    }
    if (!allowedRoles.includes(role)) {
      router.replace((ROLE_ROUTE[role] ?? '/login') as never);
    }
  }, [allowedRoles, firebaseUser, isLoading, role, router]);

  const initialEntry = useMemo(() => {
    const current = resolveCurrentBranchUser();
    return current.role ? branchLandingPath(current.branchId, current.role) : '/branches';
  }, [role]);

  if (isLoading || !firebaseUser || !allowedRoles.includes(role)) return <Spinner />;

  return children ? <>{children}</> : <BranchWorkspace initialEntry={initialEntry} />;
}

export function StaffPortalEntry(props: { allowedRoles: DemoRole[]; children?: ReactNode }) {
  return (
    <FirebaseAuthProvider>
      <StaffPortalEntryInner {...props} />
    </FirebaseAuthProvider>
  );
}

export default StaffPortalEntry;
