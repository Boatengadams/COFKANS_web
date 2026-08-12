/**
 * Single staff entry point at /staff.
 *
 * One sign-in form → after auth, we look up the user's staff role (from
 * `staffAccounts` first, then `users.role` for admin/technician/driver) and
 * auto-mount the matching dashboard inside one shell. Customers who land here
 * get an explicit "not authorized" screen.
 */

import { lazy, Suspense, useEffect, useState } from 'react';
import { Image as NativeImage } from 'react-native';
import { motion } from 'motion/react';
import {
  Building2, ShieldCheck, Truck, Wrench, Store,
  LogOut, Loader2, AlertTriangle, ArrowLeft, KeyRound,
  Eye, EyeOff, Lock, Mail, Package, MapPin,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext';
import { getStaffAccount, type StaffAccount } from '../../lib/staff';
import { FrontDeskDashboard } from '../components/portal/FrontDeskDashboard';
import cofkansLogo from '../../imports/cofkans.png';
import { ThemeToggle } from '../components/ThemeToggle';

function assetUrl(asset: unknown): string {
  if (typeof asset === 'string') return asset;
  if (typeof asset === 'object' && asset !== null && 'uri' in asset) {
    const uri = (asset as { uri?: unknown }).uri;
    if (typeof uri === 'string') return uri;
  }
  const imageApi = NativeImage as unknown as {
    resolveAssetSource?: (source: number | { uri: string }) => { uri?: string } | null;
  };
  try {
    return imageApi.resolveAssetSource?.(asset as number | { uri: string })?.uri ?? '';
  } catch {
    return '';
  }
}

const cofkansLogoUrl = assetUrl(cofkansLogo);

const DriverPortal = lazy(() =>
  import('./DriverPortal').then(m => ({ default: m.DriverPortal }))
);
const TechnicianPortal = lazy(() =>
  import('./TechnicianPortal').then(m => ({ default: m.TechnicianPortal }))
);
const ManagerPortal = lazy(() =>
  import('./ManagerPortal').then(m => ({ default: m.ManagerPortal }))
);

type ResolvedRole =
  | { kind: 'manager' }
  | { kind: 'front_desk' }
  | { kind: 'transport_driver' }
  | { kind: 'technician' }
  | { kind: 'developer' }
  | { kind: 'none' };

const ROLE_META: Record<Exclude<ResolvedRole['kind'], 'none'>, { label: string; icon: any }> = {
  manager:          { label: 'Manager',         icon: Building2 },
  front_desk:       { label: 'Front Desk',      icon: Store },
  transport_driver: { label: 'Driver',          icon: Truck },
  technician:       { label: 'Technician',      icon: Wrench },
  developer:        { label: 'Developer',       icon: KeyRound },
};

export default function StaffPortal() {
  const { user, firebaseUser, isLoading, signInWithEmail, signOut, resetPassword } = useFirebaseAuth();
  const [role, setRole] = useState<ResolvedRole | null>(null);
  const [resolving, setResolving] = useState(false);

  // Resolve role whenever the signed-in user changes.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!firebaseUser) { setRole(null); return; }
      setResolving(true);
      try {
        const staff = await getStaffAccount(firebaseUser.uid);
        if (cancelled) return;
        if (staff) {
          setRole(resolveStaffRole(staff));
          return;
        }
        // Fall back to user.role for admin/technician/driver flows.
        const r = user?.role;
        const isDev = (user as any)?.isDeveloper === true;
        if (isDev)                 setRole({ kind: 'developer' });
        else if (r === 'manager' || r === 'management_support' || r === 'admin') setRole({ kind: 'manager' });
        else if (r === 'technician') setRole({ kind: 'technician' });
        else if (r === 'driver')   setRole({ kind: 'transport_driver' });
        else                       setRole({ kind: 'none' });
      } finally {
        if (!cancelled) setResolving(false);
      }
    })();
    return () => { cancelled = true; };
  }, [firebaseUser, user]);

  if (isLoading || (firebaseUser && resolving)) return <FullScreenSpinner />;
  if (!firebaseUser) return <StaffLogin signIn={signInWithEmail} resetPassword={resetPassword} />;
  if (!role || role.kind === 'none') return <NotAuthorized onSignOut={signOut} email={firebaseUser.email || ''} />;
  if (role.kind === 'developer') return <DeveloperHint onSignOut={signOut} />;

  return (
    <PortalShell
      role={role}
      email={firebaseUser.email || ''}
      uid={firebaseUser.uid}
      displayName={firebaseUser.displayName || user?.displayName || firebaseUser.email || 'Rider'}
      onSignOut={signOut}
    />
  );
}

function resolveStaffRole(staff: StaffAccount): ResolvedRole {
  switch (staff.role as string) {
    // branch_manager is folded into the unified Manager role.
    case 'branch_manager':
    case 'manager':
      return { kind: 'manager' };
    // rider is folded into the unified Driver role.
    case 'rider':
    case 'driver':
      return { kind: 'transport_driver' };
    case 'front_desk':
      return { kind: 'front_desk' };
    case 'developer':
      return { kind: 'developer' };
    default:
      return { kind: 'none' };
  }
}

/* -------------------------------------------------- */

function PortalShell({
  role, email, uid, displayName, onSignOut,
}: {
  role: Exclude<ResolvedRole, { kind: 'none' } | { kind: 'developer' }>;
  email: string;
  uid: string;
  displayName: string;
  onSignOut: () => Promise<void> | void;
}) {
  const meta = ROLE_META[role.kind];
  const Icon = meta.icon;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b-2 border-border sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="hidden h-10 w-[112px] items-center justify-center rounded-xl bg-slate-950 px-3 py-1.5 sm:flex">
              <img src={cofkansLogoUrl} alt="Cofkans" className="h-7 w-auto object-contain" />
            </span>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Staff Portal</p>
              <p className="font-bold truncate">
                {meta.label}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="hidden sm:inline text-muted-foreground truncate max-w-[180px]">{email}</span>
            <ThemeToggle className="!p-2" />
            <button
              onClick={() => onSignOut()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-border hover:bg-muted font-bold"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main>
        <Suspense fallback={<FullScreenSpinner />}>
          {role.kind === 'manager' && <ManagerPortal />}
          {role.kind === 'front_desk' && <FrontDeskDashboard />}
          {role.kind === 'transport_driver' && <DriverPortal onBack={() => onSignOut()} />}
          {role.kind === 'technician' && <TechnicianPortal onBack={() => onSignOut()} />}
        </Suspense>
      </main>
    </div>
  );
}

/* -------------------------------------------------- */

function StaffLogin({
  signIn, resetPassword,
}: {
  signIn: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const friendlyError = (err: any): string => {
    const code = err?.code || '';
    if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found'))
      return 'Email or password is incorrect.';
    if (code.includes('too-many-requests'))
      return 'Too many attempts. Please wait a moment and try again.';
    if (code.includes('network'))
      return 'Network problem. Check your connection and retry.';
    if (code.includes('user-disabled'))
      return 'This account has been disabled. Contact a developer.';
    return err?.message || 'Sign-in failed. Please try again.';
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setSubmitting(true);
    setError(null);
    try {
      await signIn(email.trim(), password);
      toast.success('Signed in');
    } catch (err: any) {
      setError(friendlyError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const onForgot = async () => {
    if (!email.trim()) {
      setError('Enter your email above first, then tap “Forgot password”.');
      return;
    }
    setResetting(true);
    setError(null);
    try {
      await resetPassword(email.trim());
      toast.success('Password reset link sent — check your email.');
    } catch (err: any) {
      setError(friendlyError(err));
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Brand panel (hidden on small screens) */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-primary via-primary to-amber-700 text-white">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="relative">
          <img
            src={cofkansLogoUrl}
            alt="Cofkans Electricals"
            className="h-14 w-auto object-contain brightness-0 invert"
          />
          <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-white/80">Staff Portal</p>
        </div>

        <div className="relative space-y-6 max-w-sm">
          <h2 className="text-3xl font-bold leading-tight" style={{ fontFamily: 'var(--font-luxury)' }}>
            One sign-in.<br />Your whole workspace.
          </h2>
          <p className="text-white/85 text-sm leading-relaxed">
            Sign in once and you're taken straight to the right tools for your role —
            branch sales, deliveries, front desk, or admin.
          </p>
          <ul className="space-y-3 text-sm">
            {[
              { icon: Store, label: 'Branch POS & stock' },
              { icon: Truck, label: 'Rider & driver deliveries' },
              { icon: Package, label: 'Order queue & fulfilment' },
              { icon: ShieldCheck, label: 'Secure, role-based access' },
            ].map(({ icon: I, label }) => (
              <li key={label} className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                  <I className="w-4 h-4" strokeWidth={2.5} />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center gap-2 text-xs text-white/70">
          <MapPin className="w-3.5 h-3.5" /> 7 branches · Ashanti & Greater Accra
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <span className="flex h-12 w-[130px] items-center justify-center rounded-xl bg-slate-950 px-3 py-1.5">
              <img src={cofkansLogoUrl} alt="Cofkans Electricals" className="h-9 w-auto object-contain" />
            </span>
            <div>
              <h1 className="font-bold leading-tight">Staff Portal</h1>
              <p className="text-[11px] text-muted-foreground">Cofkans Electricals</p>
            </div>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to open your dashboard.</p>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border-2 border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-700 dark:text-red-300">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1.5">Work email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email" required value={email}
                  onChange={e => { setEmail(e.target.value); setError(null); }}
                  className="w-full pl-10 pr-3 py-3 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-primary transition-colors"
                  placeholder="you@cofkanselectricals.com"
                  autoFocus autoComplete="username"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold">Password</label>
                <button
                  type="button" onClick={onForgot} disabled={resetting}
                  className="text-[11px] font-bold text-primary hover:underline disabled:opacity-60"
                >
                  {resetting ? 'Sending…' : 'Forgot password?'}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'} required value={password}
                  onChange={e => { setPassword(e.target.value); setError(null); }}
                  className="w-full pl-10 pr-11 py-3 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-primary transition-colors"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button" onClick={() => setShowPassword(s => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={submitting || !email || !password}
              className="w-full px-4 py-3 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</> : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Staff accounts are provisioned by a developer — there's no public sign-up.
              First-time users: use the temporary password you were given, then reset it above.
            </p>
          </div>

          <a href="/" className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to shop
          </a>
        </motion.div>
      </div>
    </div>
  );
}

function NotAuthorized({ email, onSignOut }: { email: string; onSignOut: () => Promise<void> | void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-card border-2 border-amber-500/40 rounded-3xl p-8 text-center">
        <div className="inline-flex p-3 bg-amber-500/10 rounded-xl mb-4">
          <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
        </div>
        <h1 className="text-xl font-bold mb-1">No staff access</h1>
        <p className="text-sm text-muted-foreground mb-1">{email}</p>
        <p className="text-sm text-muted-foreground mb-6">
          This account is not provisioned for any staff dashboard. Contact a
          developer to be added to a branch or role.
        </p>
        <div className="flex justify-center gap-2">
          <a href="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-border font-bold text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to shop
          </a>
          <button onClick={() => onSignOut()} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted font-bold text-sm">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

function DeveloperHint({ onSignOut }: { onSignOut: () => Promise<void> | void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-card border-2 border-border rounded-3xl p-8 text-center">
        <div className="inline-flex p-3 bg-primary/10 rounded-xl mb-4">
          <KeyRound className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-xl font-bold mb-2">Developer account</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Developers sign in through the Developer Console, not the staff portal.
        </p>
        <button onClick={() => onSignOut()} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted font-bold text-sm">
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>
    </div>
  );
}

function FullScreenSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export { StaffPortal };
