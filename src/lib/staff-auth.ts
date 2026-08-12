/**
 * Staff authentication shared utilities.
 *
 * resolvePortalRoute — maps a resolved staff role to its dedicated URL.
 * useStaffRole       — resolves the signed-in user's role from staffAccounts
 *                      (or user.role fallback), identical logic to what was
 *                      inline in StaffPortal but now shared.
 */
import { useEffect, useState } from 'react';
import { getStaffAccount } from './staff';
import { useFirebaseAuth } from '../app/contexts/FirebaseAuthContext';

export type StaffKind =
  | 'manager'
  | 'front_desk'
  | 'transport_driver'
  | 'technician'
  | 'developer'
  | 'warehouse'
  | 'accountant'
  | 'hr'
  | 'procurement'
  | 'marketing'
  | 'none';

/** Map a staff kind to the dedicated portal URL. */
export function portalRoute(kind: StaffKind): string {
  switch (kind) {
    case 'manager':          return '/manager';
    case 'front_desk':       return '/frontdesk';
    case 'transport_driver': return '/driver';
    case 'technician':       return '/technician';
    case 'developer':        return '/developer-portal';
    case 'warehouse':        return '/warehouse';
    case 'accountant':       return '/accountant';
    case 'hr':               return '/hr';
    case 'procurement':      return '/procurement';
    case 'marketing':        return '/marketing';
    default:                 return '/staff/unauthorized';
  }
}

export interface StaffRoleState {
  kind: StaffKind | null; // null = still resolving
  loading: boolean;
}

export function useStaffRole(): StaffRoleState {
  const { user, firebaseUser, isLoading } = useFirebaseAuth();
  const [kind, setKind] = useState<StaffKind | null>(null);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!firebaseUser) { setKind(null); return; }
    (async () => {
      setResolving(true);
      try {
        const staff = await getStaffAccount(firebaseUser.uid);
        if (cancelled) return;
        if (staff) {
          setKind(resolveKind(staff.role as string, undefined));
          return;
        }
        const r = user?.role as string | undefined;
        const isDev = (user as any)?.isDeveloper === true;
        setKind(resolveKind(r, isDev));
      } finally {
        if (!cancelled) setResolving(false);
      }
    })();
    return () => { cancelled = true; };
  }, [firebaseUser, user]);

  return { kind: isLoading || resolving ? null : kind, loading: isLoading || resolving };
}

function resolveKind(role: string | undefined, isDev: boolean | undefined): StaffKind {
  if (isDev) return 'developer';
  switch (role) {
    case 'manager':
    case 'branch_manager':   // legacy
    case 'management_support':
      return 'manager';
    case 'front_desk':       return 'front_desk';
    case 'rider':            // legacy
    case 'driver':
    case 'transport_driver': return 'transport_driver';
    case 'technician':       return 'technician';
    case 'admin':            return 'manager'; // admin maps to manager — no separate admin portal
    case 'developer':        return 'developer';
    default:                 return 'none';
  }
}
