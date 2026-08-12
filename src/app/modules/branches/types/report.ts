/**
 * Multi-Branch Module — Report model.
 *
 * A generated report (sales, inventory, transfers, etc.) scoped to one or all
 * branches over a period. Types only.
 */
import type { StatPeriod } from './branch-statistics';

/** The kind of report being generated. */
export type ReportType =
  | 'sales'
  | 'inventory'
  | 'transfers'
  | 'low-stock'
  | 'revenue'
  | 'staff-performance';

/** Export/render formats a report can be produced in. */
export type ReportFormat = 'table' | 'csv' | 'pdf';

/** A single computed metric shown in a report summary. */
export interface ReportMetric {
  label: string;
  value: number | string;
  /** Optional delta vs. the previous period (percentage). */
  changePct?: number;
}

/** A generated report document. `rows` is left generic per report type. */
export interface Report<TRow = Record<string, unknown>> {
  id: string;
  type: ReportType;
  title: string;
  /** Branch slug, or 'all' for a company-wide report. */
  scope: string | 'all';
  period: StatPeriod;
  from: string;
  to: string;
  metrics: ReportMetric[];
  rows: TRow[];
  format: ReportFormat;
  generatedBy: string;
  generatedAt: string;
}
