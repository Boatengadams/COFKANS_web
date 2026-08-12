/**
 * Second layer of the /developer-portal gate. Cloudflare WAF blocks at the
 * edge; this verifies the signed-in Firebase user actually carries the
 * `developer:true` custom claim. Anything else silently redirects to `/` so
 * the route is indistinguishable from a 404 for outsiders.
 */
import { useEffect, useState, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import { hasDeveloperClaim } from '../../../lib/auth-claims';

type Status = 'checking' | 'ok' | 'deny';

export function RequireDeveloperClaim({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('checking');

  useEffect(() => {
    const unsub = onAuthStateChanged(getAuth(), async (user) => {
      if (!user) {
        setStatus('deny');
        return;
      }
      try {
        const ok = await hasDeveloperClaim(true);
        setStatus(ok ? 'ok' : 'deny');
      } catch {
        setStatus('deny');
      }
    });
    return unsub;
  }, []);

  if (status === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (status === 'deny') return <Navigate to="/" replace />;
  return <>{children}</>;
}
