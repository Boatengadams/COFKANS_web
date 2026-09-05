import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import { useStaffRole } from '../../hooks/useStaffRole';
import type { StaffRole } from '@/lib/staff';

export function LiveStaffGate({
  role,
  branchSlug,
  loginPath,
  children,
}: {
  role: StaffRole;
  branchSlug?: string;
  loginPath: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const { firebaseUser, isLoading: authLoading } = useFirebaseAuth();
  const { loading: staffLoading, staff } = useStaffRole();
  const loading = authLoading || staffLoading;
  const allowed = !!staff && staff.role === role &&
    (!branchSlug || staff.branchSlug === branchSlug);

  useEffect(() => {
    if (!loading && (!firebaseUser || !allowed)) {
      router.replace(loginPath as never);
    }
  }, [allowed, firebaseUser, loading, loginPath, router]);

  if (loading || !firebaseUser || !allowed) {
    return (
      <div className="erp-theme flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Verifying access…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
