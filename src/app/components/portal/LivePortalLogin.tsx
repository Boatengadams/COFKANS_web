import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'expo-router';
import { Image as NativeImage } from 'react-native';
import { Loader2, Lock, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import { useStaffRole } from '../../hooks/useStaffRole';
import type { StaffRole } from '../../../lib/staff';
import cofkansLogo from '../../../imports/cofkans.png';

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

export function LivePortalLogin({
  portalTitle,
  expectedRole,
  expectedBranchSlug,
  successPath,
}: {
  portalTitle: string;
  expectedRole: StaffRole;
  expectedBranchSlug?: string;
  successPath: string;
}) {
  const router = useRouter();
  const { signInWithEmail, isLoading: authLoading, firebaseUser } = useFirebaseAuth();
  const { loading: staffLoading, staff } = useStaffRole();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const alreadyAllowed = !!firebaseUser && !!staff && staff.role === expectedRole &&
    (!expectedBranchSlug || staff.branchSlug === expectedBranchSlug);

  useEffect(() => {
    if (!staffLoading && alreadyAllowed) router.replace(successPath as never);
  }, [alreadyAllowed, router, staffLoading, successPath]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password) return;
    setSubmitting(true);
    setError(null);
    try {
      await signInWithEmail(email.trim(), password);
      router.replace(successPath as never);
    } catch (err: any) {
      const errorMsg = err instanceof Error ? err.message : 'Sign-in failed';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="erp-theme flex min-h-screen items-center justify-center bg-background p-4">
      <form onSubmit={onSubmit} className="w-full max-w-md">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
          {/* Header */}
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-[132px] shrink-0 items-center justify-center rounded-xl bg-muted px-3 py-1.5 ring-1 ring-border">
              <img src={cofkansLogoUrl} alt="Cofkans Electricals" className="h-9 w-auto object-contain" />
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <ShieldCheck className="h-6 w-6" strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Cofkans Internal</div>
              <div className="text-lg font-semibold text-foreground">{portalTitle}</div>
            </div>
          </div>

          {/* Error alert */}
          {error && (
            <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Email field */}
          <div className="mb-4">
            <label htmlFor="portal-email" className="mb-2 block text-sm font-medium text-foreground">
              Email
            </label>
            <input
              id="portal-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              required
              disabled={submitting || authLoading}
              className="w-full rounded-lg border border-border bg-input px-3 py-2.5 text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
              placeholder="staff@cofkanselectricals.com"
            />
          </div>

          {/* Password field */}
          <div className="mb-6">
            <label htmlFor="portal-password" className="mb-2 block text-sm font-medium text-foreground">
              Password
            </label>
            <input
              id="portal-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              required
              disabled={submitting || authLoading}
              className="w-full rounded-lg border border-border bg-input px-3 py-2.5 text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
              placeholder="••••••••"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={submitting || authLoading || !email.trim() || !password}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in…
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                Sign in
              </>
            )}
          </button>

          {/* Footer text */}
          <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
            Staff accounts are provisioned by a manager. Contact your administrator if you need access.
          </p>
        </div>
      </form>
    </div>
  );
}
