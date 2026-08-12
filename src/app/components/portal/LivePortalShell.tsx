import type { ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { Image as NativeImage } from 'react-native';
import { Bell, Building2, LogOut, ShieldCheck } from 'lucide-react';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import { useStaffRole } from '../../hooks/useStaffRole';
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

export function LivePortalShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const { signOut } = useFirebaseAuth();
  const { staff } = useStaffRole();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  const roleLabel = staff?.role?.replace(/_/g, ' ') ?? 'staff';

  return (
    <div className="min-h-screen bg-[#f7f8fb] text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="hidden h-11 w-[118px] items-center justify-center rounded-xl bg-slate-950 px-3 py-1.5 sm:flex">
              <img src={cofkansLogoUrl} alt="Cofkans" className="h-8 w-auto object-contain" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                <Building2 className="h-3.5 w-3.5" />
                Cofkans Staff Operations
              </div>
              <h1 className="truncate text-base font-bold leading-tight sm:text-xl">{title}</h1>
              {subtitle && <p className="truncate text-xs text-slate-500">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 md:flex">
              <ShieldCheck className="h-3.5 w-3.5" />
              Live access
            </div>
            <button
              type="button"
              aria-label="Notifications"
              className="hidden h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 sm:flex"
            >
              <Bell className="h-4 w-4" />
            </button>
            <div className="hidden min-w-0 text-right text-xs lg:block">
              <div className="truncate font-semibold text-slate-700">{staff?.email}</div>
              <div className="capitalize text-slate-500">{roleLabel}</div>
            </div>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-sm font-bold text-white hover:bg-slate-800"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
