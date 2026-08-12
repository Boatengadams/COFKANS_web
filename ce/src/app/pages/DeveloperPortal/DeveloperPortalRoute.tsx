/**
 * Composition root for /developer-portal. Stacks the three application-level
 * auth layers in order — sign-in → developer claim → TOTP — then renders the
 * shell. Cloudflare WAF sits above all of this at the edge.
 */
import { useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import { Navigate } from 'react-router-dom';
import { FirebaseAuthProvider } from '../../contexts/FirebaseAuthContext';
import { getPublicEnv } from '../../../lib/demo-mode';
import { PortalLogin } from '../../components/portal/PortalLogin';
import { RequireDeveloperClaim } from './RequireDeveloperClaim';
import { TotpGate } from './TotpGate';
import { PortalShell } from './PortalShell';

const SKIP_TOTP_IN_STAGING = getPublicEnv('APP_ENV') === 'development';

function RequireSignIn({ children }: { children: ReactNode }) {
  const [state, setState] = useState<'loading' | 'in' | 'out'>('loading');
  useEffect(() => {
    return onAuthStateChanged(getAuth(), (u) => setState(u ? 'in' : 'out'));
  }, []);
  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (state === 'out') {
    return (
      <PortalLogin
        portalTitle="Developer Portal"
        expectedRole="developer"
        successPath="/developer-portal"
      />
    );
  }
  return <>{children}</>;
}

export function DeveloperPortalRoute() {
  return (
    <FirebaseAuthProvider>
      <RequireSignIn>
        <RequireDeveloperClaim>
          {SKIP_TOTP_IN_STAGING ? (
            <PortalShell />
          ) : (
            <TotpGate>
              <PortalShell />
            </TotpGate>
          )}
        </RequireDeveloperClaim>
      </RequireSignIn>
    </FirebaseAuthProvider>
  );
}

// Defensive re-export so an outsider hitting /developer-portal/anything still
// resolves to the same gated component rather than a stray 404.
export function DeveloperPortalCatchAll() {
  return <Navigate to="/developer-portal" replace />;
}
