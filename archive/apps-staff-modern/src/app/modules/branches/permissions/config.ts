/**
 * Multi-Branch Module — permission configuration (the single knob).
 *
 * `DEFAULT_PERMISSION_CONFIG` maps every role to its allowed actions and data
 * scope. This is the ONE place to change who-can-do-what. Nothing is hard-coded
 * elsewhere: consumers read this config (or an override) through the guards.
 *
 * Use `definePermissions()` to produce a customised config by overriding any
 * role's actions/scope while inheriting the rest — e.g. a deployment that lets
 * Branch Front Desk edit prices.
 */
import type { BranchAction } from './actions';
import { ALL_ACTIONS } from './actions';
import type { PermissionRole, PermissionScope } from './roles';
import { ROLE_DEFINITIONS } from './roles';

export interface RolePermission {
  actions: BranchAction[];
  scope: PermissionScope;
}

export interface PermissionConfig {
  roles: Record<PermissionRole, RolePermission>;
}

/** Default, editable role → capability matrix. */
export const DEFAULT_PERMISSION_CONFIG: PermissionConfig = {
  roles: {
    // Manager: everything, everywhere.
    manager: {
      scope: ROLE_DEFINITIONS.manager.scope,
      actions: ALL_ACTIONS,
    },

    // Showroom Front Desk: the unified customer-facing desk. Controls all stock,
    // ships to branches, resolves alerts, manages products/prices, AND does it
    // all — POS/cashier (sell + reconcile drawer), sales rep (catalog + orders)
    // and customer service. Company-wide reach for stock.
    showroom_front_desk: {
      scope: ROLE_DEFINITIONS.showroom_front_desk.scope,
      actions: [
        'branch.view',
        'inventory.view', 'inventory.viewAll', 'inventory.adjust',
        'product.view', 'product.edit', 'product.price',
        'sale.create', 'sale.refund', 'receipt.issue', 'order.create', 'cashdrawer.view',
        'transfer.create',
        'alert.resolve',
        'report.view', 'report.viewAll', 'report.export',
      ],
    },

    // Branch Front Desk: the unified desk for one branch — sell + reconcile the
    // till (cashier), browse catalog + raise orders (sales rep), handle customer
    // service, manage own stock, receive transfers and raise stock requests.
    branch_front_desk: {
      scope: ROLE_DEFINITIONS.branch_front_desk.scope,
      actions: [
        'branch.view',
        'inventory.view', 'inventory.adjust',
        'product.view',
        'sale.create', 'sale.refund', 'receipt.issue', 'order.create', 'cashdrawer.view',
        'transfer.receive',
        'alert.raise',
        'report.view',
      ],
    },

    // Driver: claim and deliver transfers between branches.
    driver: {
      scope: ROLE_DEFINITIONS.driver.scope,
      actions: ['branch.view', 'transfer.claim', 'transfer.deliver'],
    },

    // Technician: read-only stock at own branch + raise requests.
    technician: {
      scope: ROLE_DEFINITIONS.technician.scope,
      actions: ['branch.view', 'inventory.view', 'alert.raise'],
    },

    // Developer / system owner: everything, everywhere (same as manager).
    developer: {
      scope: ROLE_DEFINITIONS.developer.scope,
      actions: ALL_ACTIONS,
    },

    // Warehouse: full stock control company-wide — inventory, full catalog CRUD,
    // transfers, alerts.
    warehouse: {
      scope: ROLE_DEFINITIONS.warehouse.scope,
      actions: [
        'branch.view',
        'inventory.view', 'inventory.viewAll', 'inventory.adjust',
        'product.view', 'product.edit', 'product.create', 'product.delete',
        'transfer.create', 'transfer.receive',
        'alert.raise', 'alert.resolve',
        'report.view', 'report.viewAll',
      ],
    },

    // Accountant: read/write finance across every branch (ledger, cash flow,
    // expenses) + sales reports. Read-only on inventory.
    accountant: {
      scope: ROLE_DEFINITIONS.accountant.scope,
      actions: [
        'branch.view',
        'inventory.viewAll',
        'receipt.issue',
        'finance.view', 'finance.write', 'expense.log',
        'report.view', 'report.viewAll', 'report.export',
      ],
    },

    // HR: people ops — company-wide branch visibility + reports.
    hr: {
      scope: ROLE_DEFINITIONS.hr.scope,
      actions: ['branch.view', 'report.view', 'report.viewAll'],
    },

    // Procurement / Supply: company-wide stock visibility, purchase orders and
    // vendor management.
    procurement: {
      scope: ROLE_DEFINITIONS.procurement.scope,
      actions: [
        'branch.view',
        'inventory.view', 'inventory.viewAll',
        'product.view',
        'purchaseorder.view', 'purchaseorder.create', 'vendor.manage',
        'transfer.create',
        'report.view', 'report.viewAll',
      ],
    },

    // Marketing: content, discounts, pricing tiers and public catalog display.
    marketing: {
      scope: ROLE_DEFINITIONS.marketing.scope,
      actions: [
        'branch.view',
        'product.view', 'product.price',
        'cms.edit', 'discount.manage', 'pricing.tier',
        'report.view', 'report.viewAll',
      ],
    },
  },
};

/** Deep-ish merge helper: per-role override of actions/scope. */
export function definePermissions(
  overrides: Partial<Record<PermissionRole, Partial<RolePermission>>>,
  base: PermissionConfig = DEFAULT_PERMISSION_CONFIG,
): PermissionConfig {
  const roles = {} as Record<PermissionRole, RolePermission>;
  (Object.keys(base.roles) as PermissionRole[]).forEach((role) => {
    const b = base.roles[role];
    const o = overrides[role];
    roles[role] = {
      scope: o?.scope ?? b.scope,
      actions: o?.actions ?? b.actions,
    };
  });
  return { roles };
}
