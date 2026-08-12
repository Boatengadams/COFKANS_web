import { useEffect, useState, type JSX } from 'react';
import { useRouter } from 'expo-router';
import { CommandPalette, type PaletteAction } from './CommandPalette';
import { AuditLogPanel } from './panels/AuditLogPanel';
import { KillSwitchesPanel } from './panels/KillSwitchesPanel';
import { StaffPanel } from './panels/StaffPanel';
import { StatsPanel } from './panels/StatsPanel';
import { ActivityPanel } from './panels/ActivityPanel';
import { SupportPanel } from './panels/SupportPanel';
import { ErrorLogsPanel } from './panels/ErrorLogsPanel';
import { VersionPanel } from './panels/VersionPanel';
import { AwardsPanel } from './panels/AwardsPanel';
import { CertificationsPanel } from './panels/CertificationsPanel';
import { SiteContentPanel } from './panels/SiteContentPanel';
import { LandingPanel } from './panels/LandingPanel';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';

type PanelId = 'stats' | 'activity' | 'audit' | 'kill' | 'staff' | 'support' | 'errors' | 'version' | 'awards' | 'certifications' | 'siteContent' | 'landing';
const PANELS: { id: PanelId; label: string; render: () => JSX.Element }[] = [
  { id: 'stats', label: 'Stats', render: () => <StatsPanel /> },
  { id: 'activity', label: 'Activity', render: () => <ActivityPanel /> },
  { id: 'audit', label: 'Audit log', render: () => <AuditLogPanel /> },
  { id: 'kill', label: 'Kill switches', render: () => <KillSwitchesPanel /> },
  { id: 'staff', label: 'Staff & sessions', render: () => <StaffPanel /> },
  { id: 'support', label: 'Support inbox', render: () => <SupportPanel /> },
  { id: 'awards', label: 'Awards', render: () => <AwardsPanel /> },
  { id: 'certifications', label: 'Certifications', render: () => <CertificationsPanel /> },
  { id: 'landing', label: 'Landing page', render: () => <LandingPanel /> },
  { id: 'siteContent', label: 'Site pages', render: () => <SiteContentPanel /> },
  { id: 'errors', label: 'Client errors', render: () => <ErrorLogsPanel /> },
  { id: 'version', label: 'Build info', render: () => <VersionPanel /> },
];

export function PortalShell() {
  const router = useRouter();
  const { firebaseUser, signOut } = useFirebaseAuth();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [active, setActive] = useState<PanelId>('stats');

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen(value => !value);
      }
      if (event.key === 'Escape') setPaletteOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const actions: PaletteAction[] = [
    ...PANELS.map(panel => ({ id: `goto-${panel.id}`, label: `Go to ${panel.label}`, run: () => setActive(panel.id) })),
    { id: 'signout', label: 'Sign out', run: () => signOut().then(() => router.replace('/')) },
    { id: 'go-home', label: 'Open customer site', run: () => router.replace('/') },
  ];
  const ActivePanel = PANELS.find(panel => panel.id === active)!.render;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3"><span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" /><span className="truncate">Developer Portal</span></div>
        <button onClick={() => setPaletteOpen(true)} className="rounded-md border border-border bg-muted px-3 py-1.5 text-muted-foreground hover:text-foreground"><span className="hidden sm:inline">Search · </span>⌘K</button>
      </header>
      <nav className="flex gap-1 overflow-x-auto border-b border-border px-4 sm:px-6">
        {PANELS.map(panel => <button key={panel.id} onClick={() => setActive(panel.id)} className={`-mb-px shrink-0 border-b-2 px-3 py-2 ${active === panel.id ? 'border-primary' : 'border-transparent text-muted-foreground'}`}>{panel.label}</button>)}
      </nav>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6"><ActivePanel /><div className="mt-10 text-muted-foreground">Signed in as <span className="text-foreground">{firebaseUser?.email ?? firebaseUser?.uid}</span> · MFA verified for this session.</div></main>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} actions={actions} />
    </div>
  );
}
