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

  const alreadyAllowed = !!firebaseUser && !!staff && staff.role === expectedRole &&
    (!expectedBranchSlug || staff.branchSlug === expectedBranchSlug);

  useEffect(() => {
    if (!staffLoading && alreadyAllowed) router.replace(successPath as never);
  }, [alreadyAllowed, router, staffLoading, successPath]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password) return;
    setSubmitting(true);
    try {
      await signInWithEmail(email.trim(), password);
      router.replace(successPath as never);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Sign-in failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-4">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/90 p-8 shadow-2xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-[132px] shrink-0 items-center justify-center rounded-xl bg-black px-3 py-1.5 ring-1 ring-white/10">
            <img src={cofkansLogoUrl} alt="Cofkans Electricals" className="h-9 w-auto object-contain" />
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/20 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-zinc-400">Cofkans Internal</div>
            <div className="text-lg font-semibold text-white">{portalTitle}</div>
          </div>
        </div>
        <label className="mb-1.5 block text-sm text-zinc-300">Email</label>
        <input
          type="email"
          autoComplete="username"
          value={email}
          onChange={event => setEmail(event.target.value)}
          required
          className="mb-4 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-white outline-none focus:border-primary"
        />
        <label className="mb-1.5 block text-sm text-zinc-300">Password</label>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={event => setPassword(event.target.value)}
          required
          className="mb-6 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-white outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={submitting || authLoading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 font-semibold text-white disabled:opacity-60"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
          Sign in
        </button>
        <p className="mt-6 text-center text-xs leading-relaxed text-zinc-500">
          Staff accounts are provisioned by a developer. Contact your administrator if you need access.
        </p>
      </form>
    </div>
  );
}
