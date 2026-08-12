/**
 * /login — shared staff login page.
 *
 * Signs in with email + password, resolves the role, then navigates to the
 * role's dedicated Expo Router portal URL.
 */
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Image as NativeImage } from 'react-native';
import { motion } from 'motion/react';
import {
  Eye, EyeOff, Lock, Mail, ShieldCheck,
  AlertTriangle, Loader2, ArrowLeft, MapPin,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext';
import { portalRoute, type StaffKind } from '../../lib/staff-auth';
import { DEMO_MODE, getDemoRole } from '../../lib/demo-mode';
import { findStaffByEmail, type StaffRole } from '../../lib/staff';
import { DEFAULT_HERO_SLIDES } from '../../lib/hero-slides';
import cofkansLogo from '../../imports/cofkans.png';
import loginMap from '../../imports/map.jpg';

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
const loginMapUrl = assetUrl(loginMap);

/** Map demo-mode role string or live staff role → StaffKind. */
function roleToKind(role: string): StaffKind {
  switch (role) {
    case 'manager':    return 'manager'          as const;
    case 'branch_manager': return 'manager'      as const;
    case 'technician': return 'technician'       as const;
    case 'rider':      return 'transport_driver' as const;
    case 'driver':     return 'transport_driver' as const;
    case 'transport_driver': return 'transport_driver' as const;
    case 'front_desk': return 'front_desk'       as const;
    case 'branch_desk':return 'front_desk'       as const;
    case 'developer':  return 'developer'        as const;
    case 'warehouse':  return 'warehouse'        as const;
    case 'accountant': return 'accountant'       as const;
    case 'hr':         return 'hr'               as const;
    case 'procurement':return 'procurement'      as const;
    case 'marketing':  return 'marketing'        as const;
    default:           return 'none'             as const;
  }
}

async function resolveLoginDestination(email: string): Promise<string | null> {
  if (DEMO_MODE) {
    const demoRole = getDemoRole();
    const kind = roleToKind(demoRole);
    if (kind === 'none') return null;
    if (demoRole === 'branch_desk') return '/branchdesk';
    return portalRoute(kind);
  }
  const staff = await findStaffByEmail(email);
  const kind = roleToKind((staff?.role ?? 'none') as StaffRole | 'none');
  return kind === 'none' ? null : portalRoute(kind);
}

export default function StaffLoginPage() {
  const { signInWithEmail, resetPassword } = useFirebaseAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noRole, setNoRole] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    setError(null);
    setNoRole(false);
    setSubmitting(true);
    try {
      await signInWithEmail(email.trim(), password);
      const destination = await resolveLoginDestination(email.trim());
      if (!destination) {
        setNoRole(true);
        setSubmitting(false);
        return;
      }
      router.replace(destination as never);
    } catch (err: any) {
      const code = err?.code || '';
      setError(
        code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')
          ? 'Email or password is incorrect.'
          : code.includes('too-many-requests')
          ? 'Too many attempts. Wait a moment and try again.'
          : code.includes('user-disabled')
          ? 'This account has been disabled. Contact a manager.'
          : err?.message || 'Sign-in failed. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (noRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md bg-card border-2 border-amber-500/40 rounded-3xl p-8 text-center">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No staff role assigned</h2>
          <p className="text-sm text-muted-foreground mb-6">
            This account is not provisioned for any staff portal. Contact a manager.
          </p>
          <button onClick={() => setNoRole(false)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-xl font-bold text-sm">
            Try a different account
          </button>
        </div>
      </div>
    );
  }

  return <LoginForm onSubmit={handleLogin} submitting={submitting} error={error} setError={setError} resetPassword={resetPassword} />;
}

function LoginForm({ onSubmit, submitting, error, setError, resetPassword }: {
  onSubmit: (email: string, password: string) => Promise<void>;
  submitting: boolean;
  error: string | null;
  setError: (e: string | null) => void;
  resetPassword: (email: string) => Promise<void>;
}) {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetting, setResetting]       = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (DEFAULT_HERO_SLIDES.length < 2) return;
    const timer = window.setInterval(() => {
      setCurrentSlide((slide) => (slide + 1) % DEFAULT_HERO_SLIDES.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, []);

  const onForgot = async () => {
    if (!email.trim()) { setError('Enter your work email first, then tap "Forgot password".'); return; }
    setResetting(true); setError(null);
    try {
      await resetPassword(email.trim());
      toast.success('Reset link sent — check your email.');
    } catch (err: any) {
      setError(err?.message || 'Reset failed.');
    } finally { setResetting(false); }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-[#0B1220] p-12 text-white">
        {DEFAULT_HERO_SLIDES.map((slide, index) => (
          <motion.div
            key={slide.img || index}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{
              opacity: currentSlide === index ? 1 : 0,
              scale: currentSlide === index ? 1 : 1.06,
            }}
            transition={{ duration: 1.6, ease: [0.19, 1, 0.22, 1] }}
            className="absolute inset-0"
          >
            <img
              src={slide.img}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover"
              loading={index === 0 ? 'eager' : 'lazy'}
              decoding="async"
            />
          </motion.div>
        ))}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,18,32,.88),rgba(11,18,32,.45)_58%,rgba(11,18,32,.78)),linear-gradient(180deg,rgba(11,18,32,.35),rgba(11,18,32,.08)_35%,rgba(11,18,32,.82))]" />
        <div className="absolute inset-x-0 top-0 h-1 bg-[#F5A524]" />
        <div className="absolute inset-y-0 right-0 w-1/3 bg-[#F5A524]/10" />
        <div className="relative">
          <div className="inline-flex h-[76px] w-[178px] items-center justify-center rounded-xl bg-slate-950 px-4 py-2 shadow-lg ring-1 ring-white/15">
            <img src={cofkansLogoUrl} alt="Cofkans Electricals" className="h-12 w-auto object-contain" />
          </div>
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-[#F5A524]">Staff Portal</p>
        </div>
        <div className="relative flex min-h-[21rem] max-w-sm items-center justify-center">
          <img
            src={loginMapUrl}
            alt=""
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 h-auto w-[min(92vw,36rem)] max-w-none -translate-x-1/2 -translate-y-1/2 object-contain opacity-30 mix-blend-screen saturate-150"
            loading="eager"
            decoding="async"
          />
          <div className="flex gap-2 pt-1">
            {DEFAULT_HERO_SLIDES.slice(0, 5).map((slide, index) => (
              <button
                key={`login-slide-${slide.img || index}`}
                type="button"
                aria-label={`Show staff login background ${index + 1}`}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  currentSlide === index ? 'w-10 bg-[#F5A524]' : 'w-2 bg-white/35 hover:bg-white/55'
                }`}
              />
            ))}
          </div>
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
            <p className="text-sm text-muted-foreground mt-1">
              Sign in with your work email — you'll be taken to your portal automatically.
            </p>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border-2 border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-700 dark:text-red-300">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form
            onSubmit={e => { e.preventDefault(); if (email && password && !submitting) onSubmit(email, password); }}
            className="space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold">Work email or username</span>
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text" required value={email} autoComplete="username"
                  onChange={e => { setEmail(e.target.value); setError(null); }}
                  placeholder="you@cofkanselectricals.com or username"
                  className="w-full pl-10 pr-3 py-3 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold">Password</span>
                <button type="button" onClick={onForgot} disabled={resetting}
                  className="text-[11px] font-bold text-primary hover:underline disabled:opacity-60">
                  {resetting ? 'Sending…' : 'Forgot password?'}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'} required value={password}
                  onChange={e => { setPassword(e.target.value); setError(null); }}
                  placeholder="••••••••" autoComplete="current-password"
                  className="w-full pl-10 pr-11 py-3 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-primary transition-colors"
                />
                <button type="button" onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
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

          <div className="mt-6 flex items-start gap-2 rounded-xl bg-muted/50 px-3 py-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Staff accounts are provisioned by management — no public sign-up.
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
