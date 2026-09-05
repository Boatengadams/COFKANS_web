/**
 * Multi-Branch Module — types barrel.
 *
 * Single import surface for every model in the module:
 *   import type { Branch, Sale, Transfer } from '@/app/modules/branches/types';
 *
 * Types only — no runtime exports.
 */
export type {
  Branch,
  BranchStatus,
  BranchGeo,
  BranchDetail,
  BranchRef,
} from './branch';

export type {
  ProductStockState,
  ProductInventory,
  ProductInventoryView,
  StockLevel,
} from './product-inventory';

export type {
  InventoryTotals,
  BranchInventory,
  InventoryAdjustment,
} from './branch-inventory';

export type {
  CartItem,
  CartTotals,
  CartCustomer,
  Cart,
} from './cart';

export type {
  PaymentMethod,
  SaleChannel,
  SaleStatus,
  Sale,
} from './sale';

export type {
  ReceiptBranchInfo,
  Receipt,
} from './receipt';

export type {
  TransferStatus,
  TransferItem,
  Transfer,
  StockAlert,
} from './transfer';

export type {
  StatPeriod,
  StatPoint,
  TopProductStat,
  BranchStatistics,
} from './branch-statistics';

export type {
  ReportType,
  ReportFormat,
  ReportMetric,
  Report,
} from './report';

export type {
  BranchRole,
  UserBranch,
  UserBranchProfile,
} from './user-branch';
