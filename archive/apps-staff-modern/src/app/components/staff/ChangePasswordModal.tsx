/**
 * Change-password screen for any signed-in staff member.
 *
 * A self-contained modal that re-confirms the user's CURRENT password, then
 * sets a new one via the auth layer (`changePassword`, backed by the codebase
 * account store). Works for every role — no backend required.
 */
import { useState } from 'react';
import { motion } from 'motion/react';
import { KeyRound, Lock, Eye, EyeOff, X, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';

const inputCls = 'w-full pl-10 pr-11 py-2.5 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm';

export function ChangePasswordModal({ onClose, forced = false }: { onClose: () => void; forced?: boolean }) {
  const { changePassword } = useFirebaseAuth() as { changePassword: (c: string, n: string) => Promise<void> };
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async () => {
    setError(null);
    if (!current || !next) { setError('Fill in your current and new password.'); return; }
    if (next.length < 6) { setError('New password must be at least 6 characters.'); return; }
    if (next !== confirm) { setError('New password and confirmation do not match.'); return; }
    if (next === current) { setError('New password must be different from your current one.'); return; }
    setBusy(true);
    try {
      await changePassword(current, next);
      setDone(true);
      setTimeout(onClose, 1200);
    } catch (err: any) {
      setError(err?.message || 'Could not change your password.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9600] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={forced ? undefined : onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="erp-card erp-elevate-lg rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <span className="erp-sheen inline-flex items-center justify-center rounded-xl bg-primary/10 p-2 ring-1 ring-primary/20 text-primary"><KeyRound className="w-5 h-5" /></span>
            <h3 style={{ fontSize: '1.15rem' }}>{forced ? 'Set a new password' : 'Change password'}</h3>
          </div>
          {!forced && <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>}
        </div>

        {forced && !done && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-700 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>A manager reset your password. Choose a new one to continue — enter the temporary password as your current password.</span>
          </div>
        )}

        {done ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            <p className="text-sm">Your password has been updated.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-700 dark:text-red-300">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" /><span>{error}</span>
              </div>
            )}

            <Field icon={<Lock className="w-4 h-4" />} label="Current password" value={current} onChange={setCurrent} type={show ? 'text' : 'password'} onToggle={() => setShow((s) => !s)} showToggle={show} />
            <Field icon={<KeyRound className="w-4 h-4" />} label="New password" value={next} onChange={setNext} type={show ? 'text' : 'password'} />
            <Field icon={<KeyRound className="w-4 h-4" />} label="Confirm new password" value={confirm} onChange={setConfirm} type={show ? 'text' : 'password'} />
            <p className="text-[11px] text-muted-foreground">Use at least 6 characters. You'll sign in with this new password next time.</p>

            <div className="flex justify-end gap-2 pt-1">
              {!forced && <button onClick={onClose} className="px-3 py-2 rounded-lg border border-border hover:bg-muted text-sm">Cancel</button>}
              <button onClick={submit} disabled={busy} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground erp-glow hover:opacity-90 disabled:opacity-60 text-sm">
                {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</> : <><KeyRound className="w-4 h-4" /> Update password</>}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function Field({ icon, label, value, onChange, type, onToggle, showToggle }: {
  icon: React.ReactNode; label: string; value: string; onChange: (v: string) => void;
  type: string; onToggle?: () => void; showToggle?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wide text-muted-foreground block mb-1.5">{label}</span>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
        <input className={inputCls} type={type} value={value} onChange={(e) => onChange(e.target.value)} autoComplete="off" />
        {onToggle && (
          <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            {showToggle ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </label>
  );
}

export default ChangePasswordModal;
