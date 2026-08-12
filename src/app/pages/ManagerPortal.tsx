/**
 * Manager Portal — cross-branch command centre for Cofkans Electricals.
 *
 * Renders a dedicated home dashboard with KPIs, then tabbed access to all
 * management panels. Composes existing components; nothing is rebuilt.
 */
import { lazy, Suspense, useState } from 'react';
import { motion } from 'motion/react';
import {
  BarChart3, Building2, Users, ShoppingBag, Package, Star,
  Store, ChevronLeft, TrendingUp, Truck, CheckCircle2,
  AlertTriangle, ArrowRight, MapPin, Phone, Globe2,
} from 'lucide-react';
import { useBranches } from '@/lib/branches';
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext';
import cofkansLogo from '../../imports/cofkans.png';
import { ThemeToggle } from '../components/ThemeToggle';
import { AnalyticsDashboard } from '../components/admin/AnalyticsDashboard';
import { BulkPriceEditor } from '../components/admin/BulkPriceEditor';
import { OrderManagement } from '../components/admin/OrderManagement';
import { ProductManagementPanel } from '../components/products/ProductManagementPanel';
import { ReviewModeration } from '../components/admin/ReviewModeration';
import { BranchModuleLauncher } from '../modules/branches/components/BranchModuleLauncher';
import { StaffAndSessionsPanel } from '../components/developer/StaffAndSessionsPanel';
import { StaffManagementPanel } from '../components/staff/StaffManagementPanel';
import { UserManagementPanel } from '../components/admin/UserManagementPanel';
import { CustomerDemographics } from '../components/admin/CustomerDemographics';

const PointOfSale = lazy(() =>
  import('../components/portal/branch/PointOfSale').then(m => ({ default: m.PointOfSale })),
);

type Tab = 'home' | 'analytics' | 'demographics' | 'branches' | 'staff' | 'customers' | 'orders' | 'inventory' | 'products' | 'reviews';

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: 'home',         label: 'Dashboard',    icon: BarChart3  },
  { id: 'analytics',    label: 'Analytics',    icon: TrendingUp },
  { id: 'demographics', label: 'Demographics', icon: Globe2     },
  { id: 'branches',     label: 'Branches',     icon: Building2  },
  { id: 'staff',        label: 'Staff',        icon: Users      },
  { id: 'customers',    label: 'Customers',    icon: Users      },
  { id: 'orders',    label: 'Orders',     icon: ShoppingBag },
  { id: 'inventory', label: 'Inventory',  icon: Package    },
  { id: 'products',  label: 'Products',  icon: Package    },
  { id: 'reviews',   label: 'Reviews',   icon: Star       },
];

// ─── KPI card ──────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string | number; sub?: string;
  icon: any; color: string;
}) {
  return (
    <div className="bg-card border-2 border-border rounded-2xl p-5 flex items-start gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-5 h-5" strokeWidth={2.5} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Branch card in home tab ────────────────────────────────────────────────
function BranchCard({ b, onOpen }: { b: any; onOpen: () => void }) {
  const phones = b.phones?.length ? b.phones : b.phone ? [b.phone] : [];
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onOpen}
      className="text-left p-4 rounded-2xl border-2 border-border bg-card hover:border-primary hover:shadow-md transition-all w-full"
    >
      <div className="flex items-start justify-between mb-2">
        <div className={`p-2 rounded-lg ${b.isActive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>
          <Store className="w-4 h-4" />
        </div>
        {b.isMain && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">Main</span>
        )}
        {!b.isActive && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-600">Offline</span>
        )}
      </div>
      <h4 className="font-bold text-sm truncate">{b.name}</h4>
      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
        <MapPin className="w-3 h-3 flex-shrink-0" /> {b.city}
      </p>
      {phones[0] && (
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
          <Phone className="w-3 h-3 flex-shrink-0" /> {phones[0]}
        </p>
      )}
      <div className="mt-3 flex items-center gap-1 text-xs font-bold text-primary">
        Open POS <ArrowRight className="w-3 h-3" />
      </div>
    </motion.button>
  );
}

// ─── Home dashboard ─────────────────────────────────────────────────────────
function HomeDashboard({ onOpenBranch, onOpenTab }: { onOpenBranch: () => void; onOpenTab: (tab: Tab) => void }) {
  const branches = useBranches(false);
  const { user } = useFirebaseAuth();
  const activeBranches = branches.filter(b => b.isActive);

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold">
          Welcome back{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''} 👋
        </h2>
        <p className="text-muted-foreground mt-1">
          Here's your Cofkans Electricals overview across all branches.
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Orders Today" value="0" sub="Live orders appear here" icon={ShoppingBag} color="bg-primary/10 text-primary" />
        <KpiCard label="Pending Deliveries" value="0" sub="Awaiting driver action" icon={Truck} color="bg-blue-500/10 text-blue-600" />
        <KpiCard label="Active Staff" value="3" sub="Manager, Front Desk, Driver" icon={Users} color="bg-emerald-500/10 text-emerald-600" />
        <KpiCard label="Low Stock Alerts" value="4" sub={`${activeBranches.length} active branches monitored`} icon={AlertTriangle} color="bg-amber-500/10 text-amber-600" />
      </div>

      {/* Status pills */}
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
          <CheckCircle2 className="w-3.5 h-3.5" /> {activeBranches.length} branches active
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
          <TrendingUp className="w-3.5 h-3.5" /> 274 products catalogued
        </span>
        {branches.find(b => !b.isActive) && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-bold">
            <AlertTriangle className="w-3.5 h-3.5" /> {branches.filter(b => !b.isActive).length} branch offline
          </span>
        )}
      </div>

      {/* Branch grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Branch Network</h3>
          <span className="text-xs text-muted-foreground">{branches.length} branches — click to open POS</span>
        </div>
        {branches.length === 0 ? (
          <div className="text-center py-10 text-sm text-muted-foreground border-2 border-dashed border-border rounded-2xl">
            No branches loaded. Sync defaults from the Branches tab.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {branches.map(b => (
              <BranchCard key={b.slug} b={b} onOpen={onOpenBranch} />
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-3">
        {[
          { label: 'Create Staff Account', sub: 'Open staff management', icon: Users, color: 'bg-purple-500/10 text-purple-600', tab: 'staff' as Tab },
          { label: 'Adjust Prices', sub: 'Open inventory pricing', icon: Package, color: 'bg-cyan-500/10 text-cyan-600', tab: 'inventory' as Tab },
          { label: 'Stock Transfer', sub: 'Open branch controls', icon: Truck, color: 'bg-orange-500/10 text-orange-600', tab: 'branches' as Tab },
        ].map(({ label, sub, icon: Icon, color, tab }) => (
          <button
            key={label}
            type="button"
            onClick={() => onOpenTab(tab)}
            className="p-4 rounded-2xl border-2 border-border bg-card hover:border-primary text-left flex items-center gap-3 transition-colors"
          >
            <div className={`p-2.5 rounded-xl ${color}`}>
              <Icon className="w-5 h-5" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-sm">{label}</div>
              <div className="text-xs text-muted-foreground">{sub}</div>
            </div>
            <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Branch POS drill-down ───────────────────────────────────────────────────
function BranchPortalView({ onBack }: { onBack: () => void }) {
  const branches = useBranches(true);
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  if (openSlug) {
    const b = branches.find(x => x.slug === openSlug);
    return (
      <div className="space-y-4">
        <button onClick={() => setOpenSlug(null)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 border-border hover:bg-muted font-bold text-sm">
          <ChevronLeft className="w-4 h-4" /> All branches
        </button>
        <p className="text-sm text-muted-foreground">
          Viewing <span className="font-bold text-foreground">{b?.name}</span> — {b?.city}
        </p>
        <Suspense fallback={<div className="text-muted-foreground py-10 text-center">Loading…</div>}>
          <PointOfSale branchSlug={openSlug} />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Branch Portals</h2>
        <p className="text-sm text-muted-foreground">Open any branch's point-of-sale. Manager-only cross-branch access.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {branches.map(b => (
          <BranchCard key={b.slug} b={b} onOpen={() => setOpenSlug(b.slug)} />
        ))}
      </div>
    </div>
  );
}

// ─── Main portal ─────────────────────────────────────────────────────────────
export function ManagerPortal() {
  const [tab, setTab] = useState<Tab>('home');

  const openBranchFromHome = () => {
    setTab('branches');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header + tabs */}
      <div className="bg-card border-b-2 border-border sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="lux-sheen inline-flex items-center justify-center rounded-2xl px-3.5 py-2.5 shadow-md ring-1 ring-white/10" style={{ background: '#F5DEB3' }}>
              <img src={cofkansLogo} alt="Cofkans Electricals" className="h-7 w-auto object-contain" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Manager Portal</p>
              <p className="font-bold text-sm">All branches · full access</p>
            </div>
            <div className="ml-auto">
              <ThemeToggle />
            </div>
          </div>
          <div className="flex gap-1 overflow-x-auto pb-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-xs whitespace-nowrap transition-colors ${
                  tab === id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Suspense fallback={<div className="text-muted-foreground py-12 text-center">Loading…</div>}>
            {tab === 'home'      && (
              <div className="space-y-6">
                <BranchModuleLauncher variant="manager" />
                <HomeDashboard onOpenBranch={openBranchFromHome} onOpenTab={setTab} />
              </div>
            )}
            {tab === 'analytics' && <AnalyticsDashboard />}
            {tab === 'demographics' && <CustomerDemographics />}
            {tab === 'branches'  && <BranchPortalView onBack={() => setTab('home')} />}
            {tab === 'staff'     && (
              <div className="erp-theme space-y-8">
                <StaffManagementPanel actor="manager" title="Staff & Accounts" subtitle="Create, suspend for a period, or remove any staff account" />
                <StaffAndSessionsPanel />
              </div>
            )}
            {tab === 'customers' && <UserManagementPanel />}
            {tab === 'orders'    && <OrderManagement />}
            {tab === 'inventory' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold">Inventory & Pricing</h2>
                  <p className="text-sm text-muted-foreground">Manage stock levels and prices across all branches.</p>
                </div>
                <BulkPriceEditor />
              </div>
            )}
            {tab === 'products'  && (
              <div className="erp-theme">
                <ProductManagementPanel
                  role="manager"
                  title="Products & Pricing"
                  subtitle="Add products and keep prices current — removals are handled by the Developer."
                />
              </div>
            )}
            {tab === 'reviews'   && <ReviewModeration />}
          </Suspense>
        </motion.div>
      </div>
    </div>
  );
}

export default ManagerPortal;
