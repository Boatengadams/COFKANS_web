import { type ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { FirebaseAuthProvider, useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import { DEMO_MODE, getPublicEnv } from '@/lib/demo-mode';
import { DeveloperPortal } from '../DeveloperPortal';
import { LivePortalLogin } from '../../components/portal/LivePortalLogin';
import { RequireDeveloperClaim } from './RequireDeveloperClaim';
import { TotpGate } from './TotpGate';
import { PortalShell } from './PortalShell';

const SKIP_TOTP_IN_STAGING = getPublicEnv('APP_ENV') === 'development';

function RequireSignIn({ children }: { children: ReactNode }) {
  const { firebaseUser, isLoading } = useFirebaseAuth();
  if (isLoading) return <Loading />;
  if (!firebaseUser) return <LivePortalLogin portalTitle="Developer Portal" expectedRole="developer" successPath="/developer-portal" />;
  return <>{children}</>;
}

export function DeveloperPortalRoute() {
  const router = useRouter();
  return (
    <FirebaseAuthProvider>
      {DEMO_MODE ? <DeveloperPortal onBack={() => router.replace('/')} /> : <RequireSignIn><RequireDeveloperClaim>{SKIP_TOTP_IN_STAGING ? <PortalShell /> : <TotpGate><PortalShell /></TotpGate>}</RequireDeveloperClaim></RequireSignIn>}
    </FirebaseAuthProvider>
  );
}

function Loading() {
  return <div className="flex min-h-screen items-center justify-center bg-background"><div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
}
