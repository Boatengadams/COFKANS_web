import { useEffect, useState, type ReactNode } from 'react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../../lib/firebase';
import { enrollTotp, verifyTotp, type EnrollResult } from '../../../lib/totp-client';

const MFA_WINDOW_MS = 8 * 60 * 60 * 1000;
type Phase = 'loading' | 'enroll' | 'verify' | 'passed';

export function TotpGate({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>('loading');
  const [enrolled, setEnrolled] = useState<EnrollResult | null>(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    let alive = true;
    let unsubscribe = () => {};
    (async () => {
      try {
        const account = await getDoc(doc(db, 'staffAccounts', uid));
        if (!alive) return;
        if (account.data()?.mfaEnrolled !== true) { setPhase('enroll'); return; }
        unsubscribe = onSnapshot(doc(db, 'staffSessions', uid), snapshot => {
          const verifiedAt = snapshot.data()?.mfaVerifiedAt?.toMillis?.();
          setPhase(verifiedAt && Date.now() - verifiedAt < MFA_WINDOW_MS ? 'passed' : 'verify');
        }, () => setPhase('verify'));
      } catch { if (alive) setPhase('verify'); }
    })();
    return () => { alive = false; unsubscribe(); };
  }, []);
  const handleEnroll = async () => { setBusy(true); setError(null); try { setEnrolled(await enrollTotp()); } catch (e) { setError(e instanceof Error ? e.message : 'Enrollment failed.'); } finally { setBusy(false); } };
  const handleVerify = async () => { setBusy(true); setError(null); try { await verifyTotp(code); setCode(''); setPhase('passed'); } catch (e) { setError(e instanceof Error ? e.message : 'Invalid code.'); } finally { setBusy(false); } };
  if (phase === 'passed') return <>{children}</>;
  if (phase === 'loading') return <div className="flex min-h-screen items-center justify-center bg-background"><div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl sm:p-8">
        {phase === 'enroll' && !enrolled && <><h1 className="text-xl font-bold">Set up two-factor</h1><p className="mt-2 text-muted-foreground">Use an authenticator app to secure the developer console.</p><button onClick={handleEnroll} disabled={busy} className="mt-6 w-full rounded-lg bg-primary py-3 text-primary-foreground disabled:opacity-50">{busy ? 'Generating…' : 'Generate secret'}</button></>}
        {phase === 'enroll' && enrolled && <><h1 className="text-xl font-bold">Scan, then verify</h1><img src={enrolled.qrPng} alt="TOTP QR" className="mx-auto mt-4 h-56 w-56 rounded bg-white p-2" /><p className="mt-4 text-sm text-muted-foreground">Save the recovery codes somewhere safe.</p><ul className="mt-3 grid grid-cols-2 gap-2 font-mono text-sm">{enrolled.recoveryCodes.map(recoveryCode => <li key={recoveryCode} className="rounded bg-muted px-3 py-2 text-center">{recoveryCode}</li>)}</ul><button onClick={() => { setEnrolled(null); setPhase('verify'); }} className="mt-6 w-full rounded-lg bg-primary py-3 text-primary-foreground">I’ve saved them — verify</button></>}
        {phase === 'verify' && <><h1 className="text-xl font-bold">Enter your 6-digit code</h1><p className="mt-2 text-muted-foreground">You may also use a recovery code.</p><input autoFocus value={code} onChange={event => setCode(event.target.value)} placeholder="123456" className="mt-4 w-full rounded-lg border border-border bg-background px-4 py-3 text-center font-mono tracking-widest" /><button onClick={handleVerify} disabled={busy || code.length < 6} className="mt-4 w-full rounded-lg bg-primary py-3 text-primary-foreground disabled:opacity-50">{busy ? 'Verifying…' : 'Verify'}</button></>}
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      </div>
    </div>
  );
}
