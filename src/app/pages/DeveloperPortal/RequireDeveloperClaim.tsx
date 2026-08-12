import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { hasDeveloperClaim } from '../../../lib/auth-claims';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';

export function RequireDeveloperClaim({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { firebaseUser } = useFirebaseAuth();
  const [status, setStatus] = useState<'checking' | 'ok' | 'deny'>('checking');
  useEffect(() => {
    if (!firebaseUser) { setStatus('deny'); return; }
    let alive = true;
    hasDeveloperClaim(true).then(ok => { if (alive) setStatus(ok ? 'ok' : 'deny'); });
    return () => { alive = false; };
  }, [firebaseUser]);
  useEffect(() => { if (status === 'deny') router.replace('/'); }, [router, status]);
  if (status === 'ok') return <>{children}</>;
  return <div className="flex min-h-screen items-center justify-center bg-background"><div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
}
