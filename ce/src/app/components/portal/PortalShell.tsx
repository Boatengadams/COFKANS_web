import { ReactNode } from 'react';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import { useStaffRole } from '../../hooks/useStaffRole';
import { LogOut } from 'lucide-react';

interface Props {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

/**
 * Shared chrome for every staff portal. Shows who's signed in + a sign-out
 * button. Phase B fills in the per-role dashboards.
 */
export function PortalShell({ title, subtitle, children }: Props) {
  const { signOut } = useFirebaseAuth();
  const { staff } = useStaffRole();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-zinc-500">Cofkans</div>
            <h1 className="text-lg font-semibold">{title}</h1>
            {subtitle && <p className="text-xs text-zinc-400">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end text-xs">
              <span className="text-zinc-400">{staff?.email}</span>
              <span className="text-zinc-500 capitalize">{staff?.role.replace('_', ' ')}</span>
            </div>
            <button
              onClick={() => signOut().then(() => (window.location.href = '/'))}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">
        {children ?? (
          <div className="border border-dashed border-zinc-800 rounded-2xl p-12 text-center text-zinc-500">
            <p className="text-lg">Dashboard coming next.</p>
            <p className="text-sm mt-2">You are signed in correctly and role-gated. Phase B will wire in orders, inventory, and ops tooling.</p>
          </div>
        )}
      </main>
    </div>
  );
}
