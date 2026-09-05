/** Canonical Firestore collection ownership shared by both web apps. */
export const COLLECTIONS = {
  // Shared operational data: customers read these; staff manages them.
  products: 'products',
  orders: 'orders',
  inventory: 'inventory',
  branches: 'branches',

  // Customer-owned data.
  users: 'users',
  carts: 'carts',
  wishlists: 'wishlists',
  customerPreferences: 'customerPreferences',

  // Staff-owned data.
  staffAccounts: 'staffAccounts',
  employees: 'employees',
  approvals: 'approvals',
  reports: 'reports',
  spreadsheet: 'spreadsheet',
  auditLogs: 'auditLogs',
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];
