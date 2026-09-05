/**
 * RequireStaffRole — RBAC guard for dedicated staff portal routes.
 *
 * Uses Expo Router so dedicated staff portal route files share one router.
 *
 *   Not signed in  → /login
 *   Wrong role     → /login  (Q3: force re-auth with correct account)
 *   Right role     → renders children
 *   Still loading  → spinner
 */
import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import { getDemoRole } from '@/lib/demo-mode';
import { type StaffKind, portalRoute } from '@/lib/staff-auth';

interface Props {
  allow: StaffKind[];
  children: ReactNode;
}

/** Map the raw demo role string to a StaffKind. */
function demoRoleToKind(role: string): StaffKind {
  switch (role) {
    case 'manager':    return 'manager';
    case 'technician': return 'technician';
    case 'driver':     return 'transport_driver';
    case 'front_desk': return 'front_desk';
    case 'branch_desk':return 'front_desk';
    case 'developer':  return 'developer';
    default:           return 'none';
  }
}

export function RequireStaffRole({ allow, children }: Props) {
  const { firebaseUser, isLoading: loading } = useFirebaseAuth();
  const router = useRouter();

  const role = getDemoRole();
  const kind = demoRoleToKind(role);

  useEffect(() => {
    if (loading) return;
    if (!firebaseUser || role === 'guest') {
      router.replace('/login' as never);
      return;
    }
    if (!allow.includes(kind)) {
      router.replace('/login' as never);
    }
  }, [firebaseUser, loading, role, kind, allow, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!firebaseUser || role === 'guest' || !allow.includes(kind)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
