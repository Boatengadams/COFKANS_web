/**
 * Multi-Branch Module — action catalog.
 *
 * The full set of gated capabilities in the module, grouped by domain. Adding a
 * capability is a one-line change here; the config in `config.ts` then decides
 * which roles get it. Pure data — no logic.
 */

/** Every gated action the module exposes. */
export type BranchAction =
  // Branch records
  | 'branch.view'
  | 'branch.edit'
  // Inventory / stock
  | 'inventory.view'
  | 'inventory.viewAll'   // see stock across ALL branches (not just own)
  | 'inventory.adjust'
  // Products / pricing
  | 'product.view'
  | 'product.edit'
  | 'product.create'      // add a brand-new catalog product
  | 'product.delete'      // remove a product from the catalog
  | 'product.price'
  // Point of sale
  | 'sale.create'
  | 'sale.refund'
  | 'receipt.issue'
  | 'order.create'        // sales rep raises a customer order/invoice (no stock edit)
  | 'cashdrawer.view'     // cashier reconciles their own daily drawer
  // Finance
  | 'finance.view'        // read ledger / cash flow / expenses
  | 'finance.write'       // post financial records
  | 'expense.log'         // log an expense
  // Procurement
  | 'purchaseorder.view'
  | 'purchaseorder.create'
  | 'vendor.manage'       // supplier contracts & vendor records
  // Marketing / CMS
  | 'cms.edit'            // promo banners & public catalog content
  | 'discount.manage'     // discounts & promotions
  | 'pricing.tier'        // application pricing tiers
  // Stock transfers
  | 'transfer.create'
  | 'transfer.claim'
  | 'transfer.deliver'
  | 'transfer.receive'
  // Stock alerts / requests
  | 'alert.raise'
  | 'alert.resolve'
  // Reporting
  | 'report.view'
  | 'report.viewAll'      // company-wide reports across branches
  | 'report.export'
  // Administration
  | 'staff.assign'
  | 'settings.edit'
  | 'audit.view'          // executive audit log
  | 'user.manage';        // manage user accounts & permissions

/** Actions grouped by domain — handy for building settings/permission editors. */
export const ACTION_GROUPS: Record<string, BranchAction[]> = {
  Branch: ['branch.view', 'branch.edit'],
  Inventory: ['inventory.view', 'inventory.viewAll', 'inventory.adjust'],
  Products: ['product.view', 'product.edit', 'product.create', 'product.delete', 'product.price'],
  Sales: ['sale.create', 'sale.refund', 'receipt.issue', 'order.create', 'cashdrawer.view'],
  Finance: ['finance.view', 'finance.write', 'expense.log'],
  Procurement: ['purchaseorder.view', 'purchaseorder.create', 'vendor.manage'],
  Marketing: ['cms.edit', 'discount.manage', 'pricing.tier'],
  Transfers: ['transfer.create', 'transfer.claim', 'transfer.deliver', 'transfer.receive'],
  Alerts: ['alert.raise', 'alert.resolve'],
  Reports: ['report.view', 'report.viewAll', 'report.export'],
  Administration: ['staff.assign', 'settings.edit', 'audit.view', 'user.manage'],
};

/** Flat list of every action. */
export const ALL_ACTIONS: BranchAction[] = Object.values(ACTION_GROUPS).flat();
