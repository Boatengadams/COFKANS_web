import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, X, Lock, Eye, EyeOff } from 'lucide-react';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import toast from 'react-hot-toast';

function strengthScore(pw: string): { score: 0 | 1 | 2 | 3; label: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ['Too weak', 'Weak', 'Good', 'Strong'] as const;
  return { score: score as 0 | 1 | 2 | 3, label: labels[score] };
}

export function MustChangePasswordBanner() {
  const { user, firebaseUser, reloadUser } = useFirebaseAuth();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!user?.mustChangePassword || !firebaseUser) return null;

  const strength = strengthScore(next);

  const handleSubmit = async () => {
    if (next !== confirm) { toast.error('Passwords do not match.'); return; }
    if (strength.score < 2) { toast.error('Pick a stronger password.'); return; }
    if (next === current) { toast.error('New password must differ from temporary one.'); return; }
    if (!firebaseUser.email) { toast.error('Account email missing.'); return; }

    setBusy(true);
    try {
      const cred = EmailAuthProvider.credential(firebaseUser.email, current);
      await reauthenticateWithCredential(firebaseUser, cred);
      await updatePassword(firebaseUser, next);
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        mustChangePassword: false,
        lastPasswordChange: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await reloadUser();
      toast.success('Password updated. Your account is now secured.');
      setOpen(false);
      setCurrent(''); setNext(''); setConfirm('');
    } catch (e: any) {
      if (e?.code === 'auth/wrong-password' || e?.code === 'auth/invalid-credential') {
        toast.error('Current password is incorrect.');
      } else if (e?.code === 'auth/weak-password') {
        toast.error('Password too weak. Use 8+ chars with letters and numbers.');
      } else {
        toast.error(e?.message || 'Could not update password.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="sticky top-0 z-[80] bg-amber-500 text-amber-950 border-b-2 border-amber-600 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2 min-w-0">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} />
            <span className="font-semibold truncate">
              For your security, please change the temporary password your admin gave you.
            </span>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="flex-shrink-0 px-3 py-1.5 bg-amber-950 text-amber-50 rounded-lg font-bold text-xs hover:bg-amber-900 transition-colors"
          >
            Change now
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => !busy && setOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[200] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-card rounded-3xl p-8 max-w-md w-full border-2 border-border shadow-2xl relative"
            >
              <button
                onClick={() => !busy && setOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Lock className="w-6 h-6 text-primary" strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Set your password</h3>
                  <p className="text-xs text-muted-foreground">Only you should know this.</p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Current (temporary) password</span>
                  <input
                    type={show ? 'text' : 'password'}
                    value={current}
                    onChange={e => setCurrent(e.target.value)}
                    autoComplete="current-password"
                    className="mt-1 w-full px-3 py-2.5 bg-muted rounded-lg border-2 border-border focus:border-primary focus:outline-none font-mono"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">New password</span>
                  <input
                    type={show ? 'text' : 'password'}
                    value={next}
                    onChange={e => setNext(e.target.value)}
                    autoComplete="new-password"
                    className="mt-1 w-full px-3 py-2.5 bg-muted rounded-lg border-2 border-border focus:border-primary focus:outline-none font-mono"
                  />
                  {next.length > 0 && (
                    <div className="mt-1 flex items-center gap-2 text-xs">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            strength.score === 0 ? 'w-1/4 bg-red-500' :
                            strength.score === 1 ? 'w-2/4 bg-orange-500' :
                            strength.score === 2 ? 'w-3/4 bg-yellow-500' :
                            'w-full bg-green-500'
                          }`}
                        />
                      </div>
                      <span className="font-bold text-muted-foreground">{strength.label}</span>
                    </div>
                  )}
                </label>

                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Confirm new password</span>
                  <input
                    type={show ? 'text' : 'password'}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    autoComplete="new-password"
                    className="mt-1 w-full px-3 py-2.5 bg-muted rounded-lg border-2 border-border focus:border-primary focus:outline-none font-mono"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => setShow(s => !s)}
                  className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  {show ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {show ? 'Hide' : 'Show'} passwords
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={busy || !current || !next || !confirm}
                  className="w-full py-3 rounded-xl bg-foreground text-background font-bold disabled:opacity-50"
                >
                  {busy ? 'Updating…' : 'Update password'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
