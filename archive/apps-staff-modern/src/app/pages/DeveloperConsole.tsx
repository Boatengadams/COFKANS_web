/**
 * Developer Console shell.
 *
 * Renders the console as an isolated app surface: a dedicated login gate, then
 * the full Developer Portal once authenticated. Used both for the `/developer`
 * route and — via `isDeveloperHost()` — as the ONLY thing that renders on the
 * developer subdomain (storefront + staff portals are never mounted there).
 *
 * The console session is separate from the staff/storefront session
 * (see `developer-host.ts`), so this login never leaks into the shopfront.
 */

import { Suspense, lazy, useState } from 'react';
import { getDevSession, clearDevSession, type DevSession } from '@/lib/developer-host';
import { DeveloperLoginPage } from './DeveloperLoginPage';

const DeveloperPortal = lazy(() =>
  import('./DeveloperPortal').then((m) => ({ default: m.DeveloperPortal }))
);

const Spinner = () => (
  <div className="erp-theme min-h-screen flex items-center justify-center bg-background">
    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

export function DeveloperConsole() {
  const [session, setSession] = useState<DevSession | null>(() => getDevSession());

  if (!session) {
    return <DeveloperLoginPage onSuccess={setSession} />;
  }

  const signOut = () => {
    clearDevSession();
    setSession(null);
  };

  return (
    <div className="erp-theme fixed inset-0 z-[9000] overflow-auto bg-background">
      <Suspense fallback={<Spinner />}>
        <DeveloperPortal onBack={signOut} />
      </Suspense>
    </div>
  );
}

export default DeveloperConsole;
