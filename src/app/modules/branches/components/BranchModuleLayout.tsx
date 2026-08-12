/**
 * Multi-Branch Module — premium navigation shell ("Gold City" design).
 *
 * Wraps every branch segment screen in a consistent, role-aware chrome:
 *   • a fixed, collapsible sidebar on desktop (gold branding, role card, nav)
 *   • a glass sticky top bar (section title, branch + role, exit)
 *   • a slide-over drawer on mobile
 *
 * Nav items are filtered through the permission system, so each role only sees
 * the screens it may use. Self-contained: provides its own PermissionProvider
 * so both the nav and the wrapped screen share the resolved role. Routing via
 * react-router; no backend.
 */
import { useState, useEffect, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, Boxes, Package, ShoppingCart, Receipt, ArrowLeftRight,
  FileBarChart, Settings, LogOut, Building2, Menu, X, Gem, ChevronRight,
  MoreHorizontal, Download, KeyRound,
} from 'lucide-react';
import { canInstall, promptInstall, PWA_INSTALLABLE_EVENT } from '../../../utils/pwa';
import { PermissionProvider, usePermissions } from '../permissions';
import type { BranchAction } from '../permissions';
import { useBranch } from '../hooks/useBranches';
import { branchPath, type BranchSegment } from '../routes/paths';
import { setDemoRole } from '../../../../lib/demo-mode';
import { CommandPalette, NotificationsBell } from './CommandBar';
import cofkansLogo from '../../../../imports/cofkans.png';
import { ThemeToggle } from '../../../components/ThemeToggle';
import { ChangePasswordModal } from '../../../components/staff/ChangePasswordModal';
import { useFirebaseAuth } from '../../../contexts/FirebaseAuthContext';

interface NavItem {
  segment: BranchSegment;
  label: string;
  icon: ReactNode;
  action?: BranchAction;
}

const NAV: NavItem[] = [
  { segment: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-[18px] w-[18px]" /> },
  { segment: 'inventory', label: 'Inventory', icon: <Boxes className="h-[18px] w-[18px]" />, action: 'inventory.view' },
  { segment: 'products', label: 'Catalog', icon: <Package className="h-[18px] w-[18px]" />, action: 'product.view' },
  { segment: 'sales', label: 'Point of Sale', icon: <ShoppingCart className="h-[18px] w-[18px]" />, action: 'sale.create' },
  { segment: 'receipts', label: 'Receipts', icon: <Receipt className="h-[18px] w-[18px]" />, action: 'receipt.issue' },
  { segment: 'transfers', label: 'Transfers', icon: <ArrowLeftRight className="h-[18px] w-[18px]" />, action: 'alert.raise' },
  { segment: 'reports', label: 'Reports', icon: <FileBarChart className="h-[18px] w-[18px]" />, action: 'report.view' },
  { segment: 'settings', label: 'Settings', icon: <Settings className="h-[18px] w-[18px]" />, action: 'settings.edit' },
];

const SEGMENT_TITLE: Record<BranchSegment, string> = {
  dashboard: 'Dashboard', inventory: 'Inventory', products: 'Master Catalog',
  sales: 'Point of Sale', receipts: 'Receipts', transfers: 'Stock Transfers',
  reports: 'Reports & Analytics', settings: 'Settings',
};

export function BranchModuleLayout({
  branchId, segment, children,
}: {
  branchId: string;
  segment: BranchSegment;
  children: ReactNode;
}) {
  return (
    <PermissionProvider>
      <Shell branchId={branchId} segment={segment}>{children}</Shell>
    </PermissionProvider>
  );
}

function Shell({ branchId, segment, children }: { branchId: string; segment: BranchSegment; children: ReactNode }) {
  const { can, role } = usePermissions();
  const { mustChangePassword } = useFirebaseAuth() as { mustChangePassword?: boolean };
  const branch = useBranch(branchId);
  const [drawer, setDrawer] = useState(false);
  const [changePw, setChangePw] = useState(false);

  const items = NAV.filter((n) => !n.action || can(n.action));
  const roleLabel = role ? role.replace(/_/g, ' ') : 'staff';
  const exit = () => setDemoRole('guest');
  const openChangePw = () => { setChangePw(true); setDrawer(false); };

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[276px_1fr]">
      {/* ---------------------------------------------------------- Sidebar */}
      <aside className="erp-glass sticky top-0 hidden h-screen flex-col border-r lg:flex">
        <Brand />
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-5 scrollbar-hide">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">Workspace</p>
          {items.map((n) => (
            <NavLink key={n.segment} item={n} branchId={branchId} active={n.segment === segment} />
          ))}
        </nav>
        <RoleCard branch={branch?.name ?? branchId} role={roleLabel} onExit={exit} onChangePassword={openChangePw} />
      </aside>

      {/* ------------------------------------------------------ Mobile drawer */}
      <AnimatePresence>
        {drawer && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDrawer(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col border-r border-border bg-card lg:hidden"
              style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <div className="flex items-center justify-between pr-3">
                <Brand />
                <button onClick={() => setDrawer(false)} className="rounded-lg p-2 text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 scrollbar-hide">
                {items.map((n) => (
                  <NavLink key={n.segment} item={n} branchId={branchId} active={n.segment === segment} onClick={() => setDrawer(false)} />
                ))}
              </nav>
              <RoleCard branch={branch?.name ?? branchId} role={roleLabel} onExit={exit} onChangePassword={openChangePw} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------ Content */}
      <div className="min-w-0">
        {/* Glass top bar */}
        <header
          className="erp-glass sticky top-0 z-30 border-b"
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setDrawer(true)}
                className="rounded-xl border border-border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  <span className="truncate">{branch?.name ?? branchId}</span>
                  <ChevronRight className="h-3 w-3 shrink-0" />
                  <span className="truncate text-primary">{SEGMENT_TITLE[segment]}</span>
                </div>
                <h4 className="truncate" style={{ lineHeight: 1.15, letterSpacing: '-0.01em' }}>{SEGMENT_TITLE[segment]}</h4>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <InstallButton />
              <CommandPalette branchId={branchId} items={items} />
              <NotificationsBell branchId={branchId} />
              <ThemeToggle className="!p-2" />
              <span className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 sm:inline-flex">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-xs capitalize text-muted-foreground">{roleLabel}</span>
              </span>
              <button
                onClick={exit}
                className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
              >
                <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Exit</span>
              </button>
            </div>
          </div>
        </header>

        {/* Extra bottom padding on phones so the fixed tab bar never covers content */}
        <main className="pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:pb-0">{children}</main>
      </div>

      {/* ------------------------------------------------- Mobile bottom tab bar */}
      <BottomTabBar
        items={items}
        branchId={branchId}
        active={segment}
        onMore={() => setDrawer(true)}
      />

      {mustChangePassword && <ChangePasswordModal forced onClose={() => {}} />}
      {changePw && !mustChangePassword && <ChangePasswordModal onClose={() => setChangePw(false)} />}
    </div>
  );
}

/**
 * Phone-only bottom navigation. Shows the first four permitted destinations plus
 * a "More" button that opens the full drawer. Honours the safe-area inset so it
 * sits above the iOS/Android home indicator.
 */
function BottomTabBar({
  items, branchId, active, onMore,
}: { items: NavItem[]; branchId: string; active: BranchSegment; onMore: () => void }) {
  const primary = items.slice(0, 4);
  const hasMore = items.length > primary.length;
  return (
    <nav
      className="erp-glass fixed inset-x-0 bottom-0 z-40 border-t lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex max-w-lg items-stretch">
        {primary.map((n) => {
          const isActive = n.segment === active;
          return (
            <Link
              key={n.segment}
              to={branchPath(branchId, n.segment)}
              className={`relative flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="tab-active"
                  className="absolute -top-px h-0.5 w-8 rounded-full bg-primary shadow-[0_0_10px_var(--primary)]"
                />
              )}
              <span className={`transition-transform duration-300 ${isActive ? 'scale-110 text-primary' : 'text-muted-foreground'}`}>{n.icon}</span>
              <span className="max-w-[68px] truncate">{n.label}</span>
            </Link>
          );
        })}
        {hasMore && (
          <button
            onClick={onMore}
            className="flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium text-muted-foreground"
            aria-label="More"
          >
            <MoreHorizontal className="h-[18px] w-[18px]" />
            <span>More</span>
          </button>
        )}
      </div>
    </nav>
  );
}

/* --------------------------------------------------------------- pieces */

/** "Install app" pill — only visible when the browser offers installation. */
function InstallButton() {
  const [show, setShow] = useState(() => canInstall());
  useEffect(() => {
    const onChange = (e: Event) => setShow(Boolean((e as CustomEvent).detail?.installable));
    window.addEventListener(PWA_INSTALLABLE_EVENT, onChange);
    return () => window.removeEventListener(PWA_INSTALLABLE_EVENT, onChange);
  }, []);
  if (!show) return null;
  return (
    <button
      onClick={() => promptInstall()}
      className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-sm text-primary transition-colors hover:bg-primary/20"
    >
      <Download className="h-4 w-4" /> <span className="hidden sm:inline">Install app</span>
    </button>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3 border-b border-[var(--erp-hairline)] px-5 py-5">
      <div className="erp-sheen inline-flex items-center justify-center rounded-2xl px-3.5 py-2.5 shadow-md ring-1 ring-white/10" style={{ background: '#f2f3f7' }}>
        <img 
  src={cofkansLogo} 
  alt="Cofkans Electricals" 
  className="h-10 w-auto object-contain filter contrast-125 drop-shadow-[0_4px_10px_rgba(46,16,101,0.55)]"
/>
      </div>
      <div className="leading-tight border-l border-[var(--erp-hairline)] pl-3">
        <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Branch Suite</p>
      </div>
    </div>
  );
}

function NavLink({
  item, branchId, active, onClick,
}: { item: NavItem; branchId: string; active: boolean; onClick?: () => void }) {
  return (
    <Link
      to={branchPath(branchId, item.segment)}
      onClick={onClick}
      className={`group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-all duration-300 ${
        active
          ? 'text-foreground shadow-sm ring-1 ring-primary/15'
          : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
      }`}
      style={active ? { background: 'var(--gradient-gold-subtle)' } : undefined}
    >
      {active && (
        <motion.span
          layoutId="nav-active"
          className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_12px_var(--primary)]"
        />
      )}
      <span className={`transition-transform duration-300 group-hover:scale-110 ${active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>{item.icon}</span>
      <span className={active ? 'font-medium' : ''}>{item.label}</span>
    </Link>
  );
}

function RoleCard({ branch, role, onExit, onChangePassword }: { branch: string; role: string; onExit: () => void; onChangePassword: () => void }) {
  return (
    <div className="border-t border-[var(--erp-hairline)] p-3">
      <div className="relative overflow-hidden rounded-2xl border border-[var(--erp-hairline)] bg-gradient-gold-subtle p-3.5 erp-elevate">
        <div className="erp-ambient" />
        <div className="relative flex items-center gap-2.5">
          <span className="rounded-xl bg-primary/15 p-2 text-primary ring-1 ring-primary/15">
            <Building2 className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium" style={{ lineHeight: 1.2 }}>{branch}</p>
            <p className="truncate text-[11px] capitalize text-muted-foreground">{role}</p>
          </div>
        </div>
        <button
          onClick={onChangePassword}
          className="relative mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--erp-hairline)] bg-card px-3 py-2 text-sm text-muted-foreground transition-all hover:border-primary/40 hover:text-foreground hover:shadow-sm"
        >
          <KeyRound className="h-4 w-4" /> Change password
        </button>
        <button
          onClick={onExit}
          className="relative mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--erp-hairline)] bg-card px-3 py-2 text-sm text-muted-foreground transition-all hover:border-primary/40 hover:text-foreground hover:shadow-sm"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </div>
  );
}

export default BranchModuleLayout;
