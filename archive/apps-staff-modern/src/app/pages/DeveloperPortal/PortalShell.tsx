import { useEffect, useState, type JSX } from 'react';
import { useRouter } from 'expo-router';
import { CommandPalette, type PaletteAction } from './CommandPalette';
import { AuditLogPanel } from './panels/AuditLogPanel';
import { KillSwitchesPanel } from './panels/KillSwitchesPanel';
import { StaffAndSessionsPanel } from '../../components/developer/StaffAndSessionsPanel';
import { StatsPanel } from './panels/StatsPanel';
import { ActivityPanel } from './panels/ActivityPanel';
import { SupportPanel } from './panels/SupportPanel';
import { ErrorLogsPanel } from './panels/ErrorLogsPanel';
import { VersionPanel } from './panels/VersionPanel';
import { AwardsPanel } from './panels/AwardsPanel';
import { CertificationsPanel } from './panels/CertificationsPanel';
import { SiteContentPanel } from './panels/SiteContentPanel';
import { LandingPanel } from './panels/LandingPanel';
import { BlackFridayPanel } from './panels/BlackFridayPanel';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import { FIREBASE_CONFIGURED } from '@/lib/firebase';
import { getPublicEnv } from '@/lib/demo-mode';
import { ThemeToggle } from '../../components/ThemeToggle';
import { Activity, BarChart3, ChevronLeft, ChevronRight, FileText, Flag, LayoutDashboard, LogOut, Megaphone, Menu, Package, PanelLeft, Settings, ShieldCheck, Users, X } from 'lucide-react';

type PanelId = 'stats' | 'activity' | 'audit' | 'kill' | 'staff' | 'support' | 'errors' | 'version' | 'awards' | 'certifications' | 'siteContent' | 'landing' | 'black-friday';
const PANELS: { id: PanelId; label: string; render: () => JSX.Element }[] = [
  { id: 'stats', label: 'Overview', render: () => <StatsPanel /> },
  { id: 'activity', label: 'Live activity', render: () => <ActivityPanel /> },
  { id: 'audit', label: 'Audit log', render: () => <AuditLogPanel /> },
  { id: 'kill', label: 'Safety controls', render: () => <KillSwitchesPanel /> },
  { id: 'staff', label: 'Users & sessions', render: () => <StaffAndSessionsPanel /> },
  { id: 'support', label: 'Support inbox', render: () => <SupportPanel /> },
  { id: 'black-friday', label: 'Black Friday', render: () => <BlackFridayPanel /> },
  { id: 'landing', label: 'Landing page', render: () => <LandingPanel /> },
  { id: 'siteContent', label: 'Site pages', render: () => <SiteContentPanel /> },
  { id: 'awards', label: 'Awards', render: () => <AwardsPanel /> },
  { id: 'certifications', label: 'Certifications', render: () => <CertificationsPanel /> },
  { id: 'errors', label: 'Client errors', render: () => <ErrorLogsPanel /> },
  { id: 'version', label: 'Build info', render: () => <VersionPanel /> },
];

const NAV_GROUPS: { label: string; ids: PanelId[] }[] = [
  { label: 'Monitor', ids: ['stats', 'activity', 'audit'] },
  { label: 'Operate', ids: ['staff', 'support', 'black-friday'] },
  { label: 'Configure', ids: ['landing', 'siteContent', 'awards', 'certifications'] },
  { label: 'System', ids: ['kill', 'errors', 'version'] },
];

const ICONS: Record<PanelId, typeof Activity> = {
  stats: LayoutDashboard, activity: Activity, audit: FileText, kill: ShieldCheck,
  staff: Users, support: Package, 'black-friday': Megaphone, landing: LayoutDashboard,
  siteContent: FileText, awards: Flag, certifications: ShieldCheck, errors: FileText, version: Settings,
};

export function PortalShell() {
  const router = useRouter();
  const { firebaseUser, signOut } = useFirebaseAuth();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [active, setActive] = useState<PanelId>('stats');
  const [navOpen, setNavOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

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

  const choose = (id: PanelId) => { setActive(id); setNavOpen(false); };
  const actions: PaletteAction[] = [
    ...PANELS.map(panel => ({ id: `goto-${panel.id}`, label: `Go to ${panel.label}`, run: () => choose(panel.id) })),
    { id: 'signout', label: 'Sign out', run: () => signOut().then(() => router.replace('/')) },
    { id: 'go-home', label: 'Open customer site', run: () => router.replace('/') },
  ];
  const activePanel = PANELS.find(panel => panel.id === active)!;
  const ActivePanel = activePanel.render;
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-xl sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button onClick={() => setNavOpen(true)} className="rounded-lg border border-border p-2 lg:hidden" aria-label="Open navigation"><Menu className="h-5 w-5" /></button>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20"><PanelLeft className="h-5 w-5" /></div>
          <div className="min-w-0"><p className="truncate text-sm font-bold tracking-tight">Cofkans Control Centre</p><p className="truncate text-[11px] text-muted-foreground">Developer operations</p></div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`hidden items-center gap-2 rounded-full border px-3 py-1.5 text-xs sm:flex ${FIREBASE_CONFIGURED ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-600' : 'border-amber-500/25 bg-amber-500/10 text-amber-600'}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{FIREBASE_CONFIGURED ? 'Backend connected' : 'Configuration needed'}</div>
          <button onClick={() => setPaletteOpen(true)} className="rounded-lg border border-border bg-muted px-3 py-2 text-xs text-muted-foreground hover:text-foreground" aria-label="Open command search"><span className="hidden sm:inline">Search · </span>⌘K</button>
          <ThemeToggle />
        </div>
      </header>
      <div className="flex min-h-[calc(100vh-4rem)]">
        {navOpen && <button className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setNavOpen(false)} aria-label="Close navigation" />}
        <aside className={`fixed inset-y-0 left-0 z-50 mt-16 flex w-72 flex-col border-r border-border bg-card px-3 py-4 transition-transform lg:sticky lg:top-16 lg:z-20 lg:mt-0 lg:h-[calc(100vh-4rem)] ${navOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} ${collapsed ? 'lg:w-[76px]' : ''}`}>
          <div className="mb-4 flex items-center justify-between px-2"><span className={`text-[10px] font-bold uppercase tracking-[.18em] text-muted-foreground ${collapsed ? 'lg:hidden' : ''}`}>Workspace</span><button onClick={() => setNavOpen(false)} className="rounded-lg p-2 hover:bg-muted lg:hidden" aria-label="Close navigation"><X className="h-4 w-4" /></button><button onClick={() => setCollapsed(value => !value)} className="hidden rounded-lg p-2 text-muted-foreground hover:bg-muted lg:block" aria-label="Collapse navigation">{collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}</button></div>
          <nav className="space-y-5 overflow-y-auto">
            {NAV_GROUPS.map(group => <div key={group.label}><p className={`mb-1 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-muted-foreground ${collapsed ? 'lg:hidden' : ''}`}>{group.label}</p>{group.ids.map(id => { const panel = PANELS.find(item => item.id === id)!; const Icon = ICONS[id]; return <button key={id} onClick={() => choose(id)} title={collapsed ? panel.label : undefined} className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${active === id ? 'bg-primary/10 font-bold text-primary ring-1 ring-primary/15' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}><Icon className="h-4 w-4 shrink-0" /><span className={collapsed ? 'lg:hidden' : ''}>{panel.label}</span>{active === id && !collapsed && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}</button> })}</div>)}
          </nav>
          <div className={`mt-auto border-t border-border pt-4 ${collapsed ? 'lg:px-0' : ''}`}><div className={`mb-3 rounded-xl bg-muted/60 p-3 ${collapsed ? 'lg:hidden' : ''}`}><p className="text-xs font-bold">{getPublicEnv('APP_ENV') || 'development'} environment</p><p className="mt-1 truncate text-[11px] text-muted-foreground">{firebaseUser?.email ?? firebaseUser?.uid ?? 'Authenticated developer'}</p></div><button onClick={() => signOut().then(() => router.replace('/'))} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground ${collapsed ? 'lg:justify-center' : ''}`} title="Sign out"><LogOut className="h-4 w-4" /><span className={collapsed ? 'lg:hidden' : ''}>Sign out</span></button></div>
        </aside>
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl"><div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-primary">{activePanel.label}</p><h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{activePanel.label === 'Overview' ? 'System overview' : activePanel.label}</h1><p className="mt-1 text-sm text-muted-foreground">Secure operational controls for the Cofkans platform.</p></div><div className="rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground">MFA session verified</div></div><ActivePanel /><div className="mt-10 border-t border-border pt-4 text-xs text-muted-foreground">Signed in as <span className="text-foreground">{firebaseUser?.email ?? firebaseUser?.uid}</span> · {getPublicEnv('APP_ENV') || 'development'} · protected developer access</div></div></main>
      </div>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} actions={actions} />
    </div>
  );
}
