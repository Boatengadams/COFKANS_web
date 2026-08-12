# Plan: Restructure to 3-Role Portal System (Manager, Front Desk, Driver)

## Context

The user wants to simplify the staff portal system to exactly **3 roles**. Based on the voice description:

- **Manager** = overall boss, sees and controls everything across all branches (replaces "admin" entirely — no separate admin role)
- **Front Desk** = works at the main showroom (Asuoyeboa), manages all stock/items, handles inter-branch stock transfers, receives stock alerts from all branches, updates inventory
- **Driver** = moves stock from the main showroom to branches, or between branches

The **Technician** role is deferred ("let's focus on these three"). Admin is removed — Manager absorbs all admin capabilities.

---

## Changes Required

### 1. Remove `admin` from the role system

**Files to change:**
- `src/lib/demo-mode.ts` — Remove the `admin` DemoRole and `kofi@cofkanselectricals.com` from DEMO_USERS and DEMO_NAMED_ACCOUNTS. Remove `'admin'` from the `DemoRole` union type.
- `src/app/AppRouter.tsx` — Remove the `/admin` route. Remove `'admin'` from all `allow` arrays in PortalPage calls (manager absorbs admin). The `PortalPage` demoRoleToKind switch: remove `'admin'` → `'admin'` mapping.
- `src/lib/staff-auth.ts` — Remove `'admin'` from `StaffKind` union. Remove `admin` case from `resolveKind` and `portalRoute`.
- `src/app/pages/StaffPortal.tsx` — Remove `{ kind: 'admin' }` from `ResolvedRole` union and `ROLE_META`. Remove `setRole({ kind: 'admin' })` branch in role resolution (map `admin` role to `manager` instead). Remove `<AdminPage>` render case.
- `src/app/contexts/DemoAuthContext.tsx` — Remove admin entry from DEMO_USERS reference; `demoRoleToKind` no longer has admin case.

### 2. Manager Portal — absorb all admin capabilities

**File:** `src/app/pages/ManagerPortal.tsx`

Current tabs: home, branches, staff, customers, orders, products, reviews

**Add tabs:**
- `inventory` — Stock overview across all 7 branches. Use existing `BranchManagementPanel` + `BulkPriceEditor` already in `src/app/components/admin/`.
- `analytics` — Full `AnalyticsDashboard` from `src/app/components/admin/AnalyticsDashboard.tsx`
- `settings` — Stock alerts configuration, delivery fee setting (currently hardcoded at GH₵ 50)

**Update HomeDashboard KPIs** to show more useful live data:
- Replace static "Delivery Fee" and "Business Hours" cards with: **Total Orders Today**, **Pending Deliveries**, **Active Staff**, **Low Stock Alerts**
- Add a "Quick Actions" row: Create Staff Account (links to `staff` tab, opens `WorkerCreationWizard`), Adjust Prices (links to `inventory` tab), Stock Transfer (links to Front Desk's transfer feature)

**TAB structure after change:**
```
home | branches | orders | inventory | analytics | staff | customers | products | reviews
```

### 3. Front Desk Portal — stock management + inter-branch transfers

**File:** `src/app/components/portal/FrontDeskDashboard.tsx`

Current tabs: overview, queue, appointments, calls, walkin

Front Desk is described as:
- In charge of all items/stock at the showroom
- Sends stock from showroom to other branches
- Receives alerts from all branches about needed stock
- Confirms and forwards stock between locations

**Add tabs:**
- `stock` — Showroom inventory view: list of all products with stock counts. Use `csvProducts` for product list + live price/stock from Firestore. Show quantity available, allow "Send to Branch" action which creates a `stockTransfer` Firestore document.
- `transfers` — Active and completed inter-branch stock transfers. Shows: item, quantity, from-branch, to-branch, driver assigned, status. Allows Front Desk to mark transfers as "ready for pickup" (driver sees it).
- `alerts` — Stock-low notifications from all branches. Branches can raise a stock request; Front Desk reviews and approves/declines. Reads from `stockRequests` collection (already defined in Firestore rules).

**Keep existing tabs:** overview, queue, appointments, calls, walkin

**Updated tab structure:**
```
overview | queue | stock | transfers | alerts | appointments | calls | walkin
```

**New data flow for transfers:**
- Front Desk creates a `stockTransfer` doc: `{ fromBranch: 'kumasi-asuoyeboa', toBranch: slug, items: [...], status: 'pending', driverId: null, createdAt }`
- Driver portal listens for `stockTransfer` docs where `status === 'pending'` and claims them
- Driver marks as `in_transit` then `delivered`
- Front Desk `transfers` tab shows status live

### 4. Driver Portal — enhance for stock transfer use case

**File:** `src/app/pages/DriverPortal.tsx`

Current: handles `deliveries` collection (customer deliveries). The new use case is stock transfers between branches.

**Add a tab structure** (currently has no tabs — single view):
- `deliveries` — Existing customer delivery functionality (unchanged)
- `transfers` — Stock transfers assigned to this driver. Reads `stockTransfer` docs where `driverId === uid` OR `status === 'pending'` (available to claim). Shows: from-branch, to-branch, items list, status. Actions: "Claim" (pending → claimed, sets driverId), "Picked Up" (claimed → in_transit), "Delivered" (in_transit → delivered).

**Keep existing delivery feature completely intact.**

**Updated tab structure:**
```
deliveries | transfers
```

### 5. Update DemoBanner role list

**File:** `src/app/components/DemoBanner.tsx`

Remove `admin` from `ROLE_LABELS`. The banner will show: Customer, Manager, Driver, Front Desk, Developer.

### 6. Remove `/admin` route and AdminPage references

- `src/app/AppRouter.tsx`: Delete the `/admin` route block and its lazy import.
- Any navigation that previously said "go to admin" should now go to `/manager`.

---

## Files to Modify (summary)

| File | Change |
|------|--------|
| `src/lib/demo-mode.ts` | Remove admin role + kofi account |
| `src/lib/staff-auth.ts` | Remove admin from StaffKind and portalRoute |
| `src/app/AppRouter.tsx` | Remove /admin route, remove admin from allow lists |
| `src/app/pages/StaffPortal.tsx` | Remove admin kind, map admin→manager |
| `src/app/contexts/DemoAuthContext.tsx` | Remove admin mapping |
| `src/app/components/DemoBanner.tsx` | Remove admin from labels |
| `src/app/pages/ManagerPortal.tsx` | Add inventory + analytics tabs, improve KPIs |
| `src/app/components/portal/FrontDeskDashboard.tsx` | Add stock, transfers, alerts tabs |
| `src/app/pages/DriverPortal.tsx` | Add tabs: deliveries + transfers |

## Files to Create

| File | Purpose |
|------|---------|
| `src/app/components/portal/StockTransferPanel.tsx` | Reusable stock transfer view (shared by FrontDesk "transfers" tab and Driver "transfers" tab, filtered differently) |
| `src/app/components/portal/StockAlertsPanel.tsx` | Branch stock-request alerts for Front Desk |
| `src/app/components/portal/ShowroomInventoryPanel.tsx` | Showroom stock list with "Send to Branch" actions |

## Reusable components already available

- `src/app/components/admin/AnalyticsDashboard.tsx` — Mount directly in Manager analytics tab
- `src/app/components/admin/BulkPriceEditor.tsx` — Use in Manager inventory tab
- `src/app/components/admin/OrderManagement.tsx` — Already in Manager orders tab
- `src/app/components/developer/BranchManagementPanel.tsx` — Already in Manager branches tab
- `src/app/components/developer/StaffAndSessionsPanel.tsx` — Already in Manager staff tab
- `src/lib/branches.ts` → `useBranches()` hook — For branch selectors in transfers
- `src/app/data/csvProducts.ts` → `csvProducts` array — Product list for inventory panel

## Verification

1. Open Figma Make preview at `/staff/login`
2. Sign in as `aban@cofkanselectricals.com` (password: `123456`) → should land on `/manager` with new tabs including analytics and inventory
3. Sign in as `ama@cofkanselectricals.com` → `/frontdesk` with new stock, transfers, alerts tabs
4. Sign in as `yaw@cofkanselectricals.com` → `/driver` with two tabs: deliveries + transfers
5. Confirm no Admin role appears anywhere in the DemoBanner switcher
6. Try clicking "Manager" in DemoBanner → should go to `/manager`
7. Try `kofi@cofkanselectricals.com` — should NOT work (account removed), show "Email or password incorrect"
