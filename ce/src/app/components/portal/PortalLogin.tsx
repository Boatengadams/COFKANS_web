import { FormEvent, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2, Lock, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import { useStaffRole } from '../../hooks/useStaffRole';
import type { StaffRole } from '../../../lib/staff';
import toast from 'react-hot-toast';

interface Props {
  portalTitle: string;        // "Adum Branch", "Rider Portal" etc.
  expectedRole: StaffRole;
  expectedBranchSlug?: string;
  successPath: string;        // where to redirect after login
}

/**
 * Login-only page for staff portals. There is no signup link — accounts are
 * provisioned by a developer in the dev console. If the signed-in user is
 * already a staff member with the right role, redirects to successPath.
 */
export function PortalLogin({ portalTitle, expectedRole, expectedBranchSlug, successPath }: Props) {
  const { signInWithEmail, isLoading: authLoading } = useFirebaseAuth();
  const { loading: staffLoading, staff } = useStaffRole();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Already signed in as the right kind of staff -> jump straight in
  if (!staffLoading && staff && staff.role === expectedRole) {
    if (
      expectedRole !== 'branch_manager' && expectedRole !== 'rider'
      || (expectedBranchSlug && staff.branchSlug === expectedBranchSlug)
    ) {
      const dest = (location.state as { from?: string } | null)?.from ?? successPath;
      return <Navigate to={dest} replace />;
    }
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setSubmitting(true);
    try {
      await signInWithEmail(email.trim(), password);
      // useStaffRole will re-check; if not staff, RequireStaffRole sends them home
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign-in failed';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-4">
      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onSubmit={onSubmit}
        className="w-full max-w-md bg-zinc-900/80 border border-zinc-800 rounded-2xl p-8 shadow-2xl backdrop-blur"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-zinc-400 text-xs uppercase tracking-widest">Cofkans Internal</div>
            <div className="text-white text-lg font-semibold">{portalTitle}</div>
          </div>
        </div>

        <label className="block text-zinc-300 text-sm mb-1.5">Email</label>
        <input
          type="email"
          autoComplete="username"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="w-full mb-4 px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/60"
          placeholder="you@cofkans.com"
        />

        <label className="block text-zinc-300 text-sm mb-1.5">Password</label>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="w-full mb-6 px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/60"
          placeholder="••••••••"
        />

        <button
          type="submit"
          disabled={submitting || authLoading}
          className="w-full py-2.5 bg-primary text-white rounded-lg font-semibold disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:bg-primary/90 transition"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
          Sign in
        </button>

        <p className="text-zinc-500 text-xs mt-6 text-center leading-relaxed">
          Staff accounts are provisioned by a developer. There is no sign-up.<br />
          If you don't have credentials, contact your administrator.
        </p>
      </motion.form>
    </div>
  );
}
