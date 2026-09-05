/**
 * Multi-Branch Module — portal launcher.
 *
 * A small, additive link bar dropped into the existing role portals so staff can
 * jump into the branch module (workspace, company dashboard, catalog, reports)
 * without touching those portals' own features. Pure navigation — react-router
 * links only, no backend.
 */
import { Link } from 'react-router-dom';
import { Building2, Store, Package, FileBarChart, Truck, ArrowRight } from 'lucide-react';

interface LauncherLink {
  to: string;
  label: string;
  desc: string;
  icon: React.ReactNode;
}

/** Links shown for a manager (full company access). */
const MANAGER_LINKS: LauncherLink[] = [
  { to: '/showroom', label: 'Superior Showroom', desc: 'Company-wide dashboard', icon: <Store className="w-5 h-5" /> },
  { to: '/branches', label: 'Branch Workspace', desc: 'Per-branch operations', icon: <Building2 className="w-5 h-5" /> },
  { to: '/catalog', label: 'Master Catalog', desc: 'Products & pricing', icon: <Package className="w-5 h-5" /> },
  { to: '/reports', label: 'Report Center', desc: 'Sales reports & exports', icon: <FileBarChart className="w-5 h-5" /> },
];

/** Links shown for front-desk staff (branch workspace + catalog). */
const FRONTDESK_LINKS: LauncherLink[] = [
  { to: '/branches', label: 'Branch Workspace', desc: 'Sales, inventory, transfers', icon: <Building2 className="w-5 h-5" /> },
  { to: '/catalog', label: 'Master Catalog', desc: 'Products & pricing', icon: <Package className="w-5 h-5" /> },
];

/** Links shown for a driver (stock-transfer runs live in the branch workspace). */
const DRIVER_LINKS: LauncherLink[] = [
  { to: '/branches', label: 'Stock Transfers', desc: 'Claim & deliver runs', icon: <Truck className="w-5 h-5" /> },
];

const LINKS_BY_VARIANT = {
  manager: MANAGER_LINKS,
  frontdesk: FRONTDESK_LINKS,
  driver: DRIVER_LINKS,
} as const;

export function BranchModuleLauncher({ variant = 'manager' }: { variant?: 'manager' | 'frontdesk' | 'driver' }) {
  const links = LINKS_BY_VARIANT[variant] ?? MANAGER_LINKS;
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {links.map((l) => (
        <Link
          key={l.to}
          to={l.to}
          className="group bg-card border-2 border-border rounded-2xl p-4 flex items-center gap-3 hover:border-primary transition-colors"
        >
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">{l.icon}</div>
          <div className="min-w-0 flex-1">
            <p className="truncate">{l.label}</p>
            <p className="text-sm text-muted-foreground truncate">{l.desc}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
        </Link>
      ))}
    </section>
  );
}

export default BranchModuleLauncher;
