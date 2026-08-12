/**
 * Branch Workspace — the full role-aware branch module rendered in-place.
 *
 * Split out from StaffPortalHost and lazy-loaded so the (heavy) branch module
 * graph is NOT part of the app's startup chunk — it only loads once a staff
 * role is actually selected. Uses MemoryRouter because the Figma preview iframe
 * restricts the History API, so URL-based routing never matches.
 */
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { BranchModuleRoutes } from '../modules/branches/routes/BranchModuleRoutes';
import { BranchModuleLayout } from '../modules/branches/components/BranchModuleLayout';
import { RoleDashboard } from '../modules/branches/dashboard/RoleDashboard';
import { BranchInventory } from '../modules/branches/inventory/BranchInventory';
import { PosTerminal } from '../modules/branches/sales/PosTerminal';
import { MasterProductCatalog } from '../modules/branches/catalog/MasterProductCatalog';
import { BranchReceipts } from '../modules/branches/receipts/BranchReceipts';
import { BranchTransfers } from '../modules/branches/transfers/BranchTransfers';
import { ReportCenter } from '../modules/branches/reports/ReportCenter';
import type { BranchSegment } from '../modules/branches/routes/paths';

/** Resolve a branch segment to its screen (mirrors AppRouter.renderBranchScreen). */
function renderBranchScreen(branchId: string, segment: BranchSegment) {
  switch (segment) {
    case 'dashboard': return <RoleDashboard branchId={branchId} />;
    case 'inventory': return <BranchInventory branchId={branchId} />;
    case 'sales': return <PosTerminal branchId={branchId} />;
    case 'products': return <MasterProductCatalog />;
    case 'receipts': return <BranchReceipts branchId={branchId} />;
    case 'transfers': return <BranchTransfers branchId={branchId} />;
    case 'reports': return <ReportCenter />;
    default: return <RoleDashboard branchId={branchId} />;
  }
}

export function BranchWorkspace({ initialEntry }: { initialEntry: string }) {
  return (
    <MemoryRouter initialEntries={[initialEntry]}>
      {/* The module's internal routes are relative, and both branchLandingPath
          and the nav links produce `/branches/...` URLs — so the module MUST be
          mounted under `/branches/*` (mirroring AppRouter) or nothing matches
          and the workspace renders blank. */}
      <Routes>
        <Route
          path="/branches/*"
          element={
            <BranchModuleRoutes
              renderSegment={(branchId, segment) => (
                <BranchModuleLayout branchId={branchId} segment={segment}>
                  {renderBranchScreen(branchId, segment)}
                </BranchModuleLayout>
              )}
            />
          }
        />
        <Route path="*" element={<Navigate to={initialEntry} replace />} />
      </Routes>
    </MemoryRouter>
  );
}

export default BranchWorkspace;
