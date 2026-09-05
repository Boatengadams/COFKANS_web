/**
 * Multi-Branch Module — BranchStatistics model.
 *
 * Aggregated performance metrics for a branch over a time window. Feeds the
 * dashboard and reports. Types only.
 */

/** The period a statistics snapshot covers. */
export type StatPeriod = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

/** A single dated data point for time-series charts. */
export interface StatPoint {
  /** ISO date (YYYY-MM-DD). */
  date: string;
  value: number;
}

/** Top-selling product entry within a period. */
export interface TopProductStat {
  productId: string;
  sku: string;
  name: string;
  unitsSold: number;
  revenue: number;
}

/** Performance metrics for one branch over a window. */
export interface BranchStatistics {
  branchSlug: string;
  period: StatPeriod;
  /** ISO range this snapshot covers. */
  from: string;
  to: string;
  salesCount: number;
  revenue: number;
  averageSaleValue: number;
  itemsSold: number;
  transfersIn: number;
  transfersOut: number;
  lowStockCount: number;
  outOfStockCount: number;
  revenueSeries?: StatPoint[];
  topProducts?: TopProductStat[];
}
