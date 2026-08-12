/**
 * Third (and final) auth layer. Every developer-portal session must present
 * a fresh TOTP code — even if Cloudflare passed and the custom claim is
 * present. On first run for a user, we enroll: show QR + one-time recovery
 * codes. Subsequent visits show the 6-digit verify form.
 *
 * "Fresh" = the verifyTotp Cloud Function stamps mfaVerifiedAt on the
 * staffSessions doc; we treat anything <8h old as still valid.
 */
import { useEffect, useState, type ReactNode } from 'react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
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
    const uid = getAuth().currentUser?.uid;
    if (!uid) return;
    const db = getFirestore();
    const accountRef = doc(db, 'staffAccounts', uid);
    const sessionRef = doc(db, 'staffSessions', uid);

    let cancelled = false;
    (async () => {
      const acct = await getDoc(accountRef);
      const mfaEnrolled = acct.exists() && acct.data()?.mfaEnrolled === true;
      if (!mfaEnrolled) {
        if (!cancelled) setPhase('enroll');
        return;
      }
      // Subscribe to session for live mfaVerifiedAt updates.
      const unsub = onSnapshot(sessionRef, (snap) => {
        const ts = snap.data()?.mfaVerifiedAt?.toMillis?.();
        if (ts && Date.now() - ts < MFA_WINDOW_MS) {
          setPhase('passed');
        } else if (phase !== 'verify') {
          setPhase('verify');
        }
      });
      return () => unsub();
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleEnroll() {
    setBusy(true);
    setError(null);
    try {
      const res = await enrollTotp();
      setEnrolled(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Enroll failed.');
    } finally {
      setBusy(false);
    }
  }

  async function handleVerify() {
    setBusy(true);
    setError(null);
    try {
      await verifyTotp(code);
      setCode('');
      setPhase('passed');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid code.');
    } finally {
      setBusy(false);
    }
  }

  if (phase === 'passed') return <>{children}</>;

  if (phase === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-xl">
        {phase === 'enroll' && !enrolled && (
          <>
            <h1>Set up two-factor</h1>
            <p className="text-muted-foreground mt-2">
              You'll need an authenticator app (1Password, Authy, Google Authenticator) to
              continue.
            </p>
            <button
              onClick={handleEnroll}
              disabled={busy}
              className="mt-6 w-full bg-primary text-primary-foreground rounded-lg py-3 disabled:opacity-50"
            >
              {busy ? 'Generating…' : 'Generate secret'}
            </button>
            {error && <p className="text-destructive mt-3">{error}</p>}
          </>
        )}

        {phase === 'enroll' && enrolled && (
          <>
            <h1>Scan, then verify</h1>
            <img
              src={enrolled.qrPng}
              alt="TOTP QR"
              className="w-56 h-56 mx-auto mt-4 rounded bg-white p-2"
            />
            <p className="text-muted-foreground mt-4">
              Save these recovery codes somewhere safe — they let you back in if you lose
              your authenticator. They will not be shown again.
            </p>
            <ul className="mt-3 grid grid-cols-2 gap-2 font-mono">
              {enrolled.recoveryCodes.map((c) => (
                <li key={c} className="bg-muted rounded px-3 py-2 text-center">
                  {c}
                </li>
              ))}
            </ul>
            <button
              onClick={() => {
                setEnrolled(null);
                setPhase('verify');
              }}
              className="mt-6 w-full bg-primary text-primary-foreground rounded-lg py-3"
            >
              I've saved them — verify
            </button>
          </>
        )}

        {phase === 'verify' && (
          <>
            <h1>Enter your 6-digit code</h1>
            <p className="text-muted-foreground mt-2">
              Or paste a recovery code if your authenticator isn't available.
            </p>
            <input
              autoFocus
              inputMode="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              className="mt-4 w-full bg-input-background border border-border rounded-lg px-4 py-3 font-mono tracking-widest text-center"
            />
            <button
              onClick={handleVerify}
              disabled={busy || code.length < 6}
              className="mt-4 w-full bg-primary text-primary-foreground rounded-lg py-3 disabled:opacity-50"
            >
              {busy ? 'Verifying…' : 'Verify'}
            </button>
            {error && <p className="text-destructive mt-3">{error}</p>}
          </>
        )}
      </div>
    </div>
  );
}
