import { useEffect, useRef, useState } from 'react';
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { PhoneInputGH } from '../common/PhoneInputGH';

const RESEND_COOLDOWN_S = 60;

function mapPhoneError(code?: string): string {
  switch (code) {
    case 'auth/operation-not-allowed':
      return 'Phone sign-in is not enabled for this app yet. Please contact support.';
    case 'auth/invalid-phone-number':
      return 'Enter a valid Ghana mobile number, for example 024 123 4567.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a few minutes and try again.';
    case 'auth/quota-exceeded':
      return 'SMS limit reached for today. Try again tomorrow.';
    case 'auth/captcha-check-failed':
      return 'Security check failed. Refresh the page and try again.';
    case 'auth/missing-phone-number':
      return 'Enter your phone number first.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    case 'auth/invalid-verification-code':
      return 'Wrong code. Double-check and try again.';
    case 'auth/code-expired':
      return 'Code expired. Tap resend to get a new one.';
    default:
      return 'Could not send code. Please try again.';
  }
}

export function PhoneSignIn({ onDone }: { onDone?: () => void }) {
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    if (recaptchaRef.current) return;
    try {
      recaptchaRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
    } catch (e) {
      console.warn('reCAPTCHA init failed', e);
    }
    return () => { recaptchaRef.current?.clear(); recaptchaRef.current = null; };
  }, []);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const normalised = (() => {
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('233')) return `+${digits}`;
    if (digits.startsWith('0')) return `+233${digits.slice(1)}`;
    return `+233${digits}`;
  })();

  const sendCode = async () => {
    if (!/^\+233[2-9]\d{8}$/.test(normalised)) {
      toast.error('Enter a valid Ghana number (e.g. 024 123 4567).');
      return;
    }
    if (!recaptchaRef.current) {
      toast.error('Security check not ready. Refresh and try again.');
      return;
    }
    setBusy(true);
    try {
      confirmationRef.current = await signInWithPhoneNumber(auth, normalised, recaptchaRef.current);
      setStep('code');
      setResendIn(RESEND_COOLDOWN_S);
      toast.success(`Code sent to ${normalised}`);
    } catch (e: any) {
      toast.error(mapPhoneError(e?.code));
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    if (!confirmationRef.current) return;
    if (!/^\d{6}$/.test(code)) { toast.error('Code must be 6 digits.'); return; }
    setBusy(true);
    try {
      await confirmationRef.current.confirm(code);
      try { localStorage.setItem('cofkans_known_device', '1'); } catch { /* ignore */ }
      toast.success('Signed in.');
      onDone?.();
    } catch (e: any) {
      toast.error(mapPhoneError(e?.code));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {step === 'phone' ? (
        <>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Phone number</span>
            <PhoneInputGH value={phone} onChange={setPhone} placeholder="24 123 4567" />
          </label>
          <button
            onClick={sendCode}
            disabled={busy}
            className="w-full py-3 rounded-xl bg-foreground text-background font-bold disabled:opacity-50"
          >
            {busy ? 'Sending…' : 'Send code'}
          </button>
        </>
      ) : (
        <>
          <button onClick={() => { setStep('phone'); setCode(''); }} className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Change number
          </button>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">6-digit code</span>
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="••••••"
              className="mt-1 w-full text-center text-2xl tracking-[0.5em] font-mono font-bold px-4 py-3 bg-muted rounded-xl border-2 border-border focus:border-primary focus:outline-none"
            />
          </label>
          <button
            onClick={verify}
            disabled={busy || code.length !== 6}
            className="w-full py-3 rounded-xl bg-foreground text-background font-bold disabled:opacity-50"
          >
            {busy ? 'Verifying…' : 'Verify & sign in'}
          </button>
          <button
            onClick={sendCode}
            disabled={busy || resendIn > 0}
            className="w-full text-xs font-bold text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 disabled:opacity-50"
          >
            <RefreshCw className="w-3 h-3" />
            {resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend code'}
          </button>
        </>
      )}

      <div id="recaptcha-container" />
    </div>
  );
}
