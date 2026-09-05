/**
 * Developer Console — dedicated login screen.
 *
 * This is a SEPARATE login from the staff portal (`/login`). It renders
 * only on the console host/subdomain and gates access to the Developer Portal.
 * Auth goes through the swappable seam in `src/lib/developer-host.ts`
 * (`verifyDeveloperCredentials`) so it can be re-wired to Firebase later.
 */

import { useState } from 'react';
import { Shield, Loader2, Eye, EyeOff, Terminal } from 'lucide-react';
import { verifyDeveloperCredentials, setDevSession, type DevSession } from '@/lib/developer-host';

interface Props {
  onSuccess: (session: DevSession) => void;
}

export function DeveloperLoginPage({ onSuccess }: Props) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    // Simulate a short auth round-trip so the UX matches a real backend.
    setTimeout(() => {
      const res = verifyDeveloperCredentials(login, password);
      if (res.ok && res.session) {
        setDevSession(res.session);
        onSuccess(res.session);
      } else {
        setError(res.error ?? 'Sign in failed.');
        setBusy(false);
      }
    }, 350);
  };

  return (
    <div className="erp-theme min-h-screen w-full flex items-center justify-center bg-background text-foreground px-4">
      <div className="w-full max-w-md">
        {/* Brand / header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/15 border border-primary/30 mb-4">
            <Terminal className="w-8 h-8 text-primary" strokeWidth={1.75} />
          </div>
          <h1 className="tracking-tight">Developer Console</h1>
          <p className="text-muted-foreground mt-1">Cofkans Electricals — restricted access</p>
        </div>

        {/* Card */}
        <form
          onSubmit={submit}
          className="bg-card border border-border rounded-2xl shadow-xl p-6 sm:p-8 space-y-5"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm">Sign in with your developer account</span>
          </div>

          <div className="space-y-2">
            <label htmlFor="dev-login" className="block text-sm text-muted-foreground">Email or username</label>
            <input
              id="dev-login"
              type="text"
              autoComplete="username"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition"
              placeholder="dev@cofkanselectricals.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="dev-password" className="block text-sm text-muted-foreground">Password</label>
            <div className="relative">
              <input
                id="dev-password"
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-11 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-60 transition"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
            {busy ? 'Verifying…' : 'Enter console'}
          </button>

          <p className="text-xs text-muted-foreground text-center pt-1">
            Access is logged. Unauthorized use is prohibited.
          </p>
        </form>
      </div>
    </div>
  );
}

export default DeveloperLoginPage;
