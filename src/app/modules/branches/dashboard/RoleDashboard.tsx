/**
 * Multi-Branch Module — Role Dashboard dispatcher.
 *
 * The `dashboard` segment renders a DIFFERENT dashboard per role, so every
 * staff member lands on a workspace tailored to what they actually do:
 *
 *   manager             → Superior Showroom (company-wide)
 *   front desk          → Unified Front Desk hub (till + catalog + support)
 *   driver              → Driver runs (claim / pickup / deliver)
 *   technician          → Technician jobs + branch parts
 *   warehouse/…         → role-specific cockpits
 *
 * The Front Desk now absorbs the former Cashier, Sales Rep and Customer Service
 * portals — one desk does it all (POS, catalog/orders and support). Both the
 * showroom and branch front desks land on the same unified hub.
 *
 * Role comes from the surrounding PermissionProvider (supplied by
 * BranchModuleLayout), which resolves showroom vs branch front desk by branch.
 */
import { usePermissions } from '../permissions';
import { ExecutiveDashboard } from './ExecutiveDashboard';
import { FrontDeskDashboard } from './FrontDeskDashboard';
import { BranchDashboard } from './BranchDashboard';
import { DriverDashboard } from './DriverDashboard';
import { TechnicianDashboard } from './TechnicianDashboard';
import { DeveloperDashboard } from './DeveloperDashboard';
import { WarehouseDashboard } from './WarehouseDashboard';
import { AccountantDashboard } from './AccountantDashboard';
import { HRDashboard } from './HRDashboard';
import { ProcurementDashboard } from './ProcurementDashboard';
import { MarketingDashboard } from './MarketingDashboard';

export function RoleDashboard({ branchId }: { branchId: string }) {
  const { role } = usePermissions();

  switch (role) {
    case 'manager':
      return <ExecutiveDashboard />;
    case 'developer':
      return <DeveloperDashboard />;
    case 'warehouse':
      return <WarehouseDashboard />;
    case 'accountant':
      return <AccountantDashboard />;
    case 'hr':
      return <HRDashboard />;
    case 'procurement':
      return <ProcurementDashboard />;
    case 'marketing':
      return <MarketingDashboard />;
    // Unified Front Desk — POS, catalog/orders and customer service in one.
    case 'showroom_front_desk':
    case 'branch_front_desk':
      return <FrontDeskDashboard branchId={branchId} />;
    case 'driver':
      return <DriverDashboard />;
    case 'technician':
      return <TechnicianDashboard branchId={branchId} />;
    default:
      return <BranchDashboard branchId={branchId} />;
  }
}

export default RoleDashboard;
