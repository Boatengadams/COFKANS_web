/**
 * Top-level chrome for /developer-portal. Cmd-K (or Ctrl-K) opens the
 * command palette to switch panels. Phase 2 ships Audit log, Kill switches,
 * Staff provisioning. Phase 3 adds the rest.
 */
import {useEffect, useState, type JSX} from 'react';
import {getAuth, signOut} from 'firebase/auth';
import {CommandPalette, type PaletteAction} from './CommandPalette';
import {AuditLogPanel} from './panels/AuditLogPanel';
import {KillSwitchesPanel} from './panels/KillSwitchesPanel';
import {StaffPanel} from './panels/StaffPanel';
import {StatsPanel} from './panels/StatsPanel';
import {ActivityPanel} from './panels/ActivityPanel';
import {SupportPanel} from './panels/SupportPanel';
import {ErrorLogsPanel} from './panels/ErrorLogsPanel';
import {VersionPanel} from './panels/VersionPanel';
import {AwardsPanel} from './panels/AwardsPanel';
import {CertificationsPanel} from './panels/CertificationsPanel';
import {SiteContentPanel} from './panels/SiteContentPanel';
import {LandingPanel} from './panels/LandingPanel';

type PanelId = 'stats' | 'activity' | 'audit' | 'kill' | 'staff' | 'support' | 'errors' | 'version' | 'awards' | 'certifications' | 'siteContent' | 'landing';
const PANELS: {id: PanelId; label: string; render: () => JSX.Element}[] = [
  {id: 'stats', label: 'Stats', render: () => <StatsPanel />},
  {id: 'activity', label: 'Activity', render: () => <ActivityPanel />},
  {id: 'audit', label: 'Audit log', render: () => <AuditLogPanel />},
  {id: 'kill', label: 'Kill switches', render: () => <KillSwitchesPanel />},
  {id: 'staff', label: 'Staff & sessions', render: () => <StaffPanel />},
  {id: 'support', label: 'Support inbox', render: () => <SupportPanel />},
  {id: 'awards', label: 'Awards', render: () => <AwardsPanel />},
  {id: 'certifications', label: 'Certifications', render: () => <CertificationsPanel />},
  {id: 'landing', label: 'Landing page', render: () => <LandingPanel />},
  {id: 'siteContent', label: 'Site pages', render: () => <SiteContentPanel />},
  {id: 'errors', label: 'Client errors', render: () => <ErrorLogsPanel />},
  {id: 'version', label: 'Build info', render: () => <VersionPanel />},
];

export function PortalShell() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [active, setActive] = useState<PanelId>('stats');

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
      if (e.key === 'Escape') setPaletteOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const actions: PaletteAction[] = [
    ...PANELS.map((p) => ({
      id: `goto-${p.id}`,
      label: `Go to ${p.label}`,
      run: () => setActive(p.id),
    })),
    {
      id: 'signout',
      label: 'Sign out',
      run: () => signOut(getAuth()).then(() => (window.location.href = '/')),
    },
    {id: 'go-home', label: 'Open customer site', run: () => (window.location.href = '/')},
  ];

  const user = getAuth().currentUser;
  const ActivePanel = PANELS.find((p) => p.id === active)!.render;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="truncate">Developer Portal</span>
        </div>
        <button
          onClick={() => setPaletteOpen(true)}
          className="bg-muted border border-border rounded-md px-3 py-1.5 text-muted-foreground hover:text-foreground"
        >
          <span className="hidden sm:inline">Search · </span>⌘K
        </button>
      </header>

      <nav className="border-b border-border px-4 sm:px-6 flex gap-1 overflow-x-auto">
        {PANELS.map((p) => (
          <button
            key={p.id}
            onClick={() => setActive(p.id)}
            className={`px-3 py-2 border-b-2 -mb-px shrink-0 ${
              active === p.id ? 'border-primary' : 'border-transparent text-muted-foreground'
            }`}
          >
            {p.label}
          </button>
        ))}
      </nav>

      <main className="px-4 sm:px-6 py-6 max-w-6xl mx-auto">
        <ActivePanel />
        <div className="mt-10 text-muted-foreground">
          Signed in as <span className="text-foreground">{user?.email ?? user?.uid}</span> · MFA
          verified for this session.
        </div>
      </main>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        actions={actions}
      />
    </div>
  );
}
