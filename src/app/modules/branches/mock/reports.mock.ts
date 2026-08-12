/**
 * Multi-Branch Module — mock reports & branch statistics (DEMO_MODE).
 *
 * Precomputed snapshots so report views have something to render before the
 * live reportService recomputes from sales/inventory. Numbers are derived from
 * the mock sales where possible to stay consistent.
 */
import type { Report } from '../types/report';
import type { BranchStatistics, StatPoint, TopProductStat } from '../types/branch-statistics';
import { MOCK_SALES } from './sales.mock';
import { MOCK_PRODUCTS } from './products.mock';
import { MOCK_BRANCH_DETAILS } from './branches.mock';
import { MOCK_TRANSFERS } from './transfers.mock';

const nowIso = new Date().toISOString();
const dayIso = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);

/** Deterministic pseudo-random in [0,1) from a string seed. */
function seededUnit(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

/** A 14-day revenue trend for a branch (stable per slug). */
function revenueSeries(slug: string, base: number): StatPoint[] {
  return Array.from({ length: 14 }, (_, i) => {
    const day = 13 - i;
    const jitter = 0.6 + seededUnit(`${slug}:${day}`) * 0.8;
    return { date: dayIso(day), value: Math.round(base * jitter) };
  });
}

function topProductsFor(slug: string): TopProductStat[] {
  return Array.from({ length: 5 }, (_, i) => {
    const p = MOCK_PRODUCTS[(i * 37 + slug.length) % MOCK_PRODUCTS.length];
    const units = 8 + Math.round(seededUnit(`${slug}:${p.sku}`) * 40);
    return { productId: p.id, sku: p.sku, name: p.name, unitsSold: units, revenue: units * p.price };
  }).sort((a, b) => b.revenue - a.revenue);
}

/** Per-branch monthly statistics snapshot for all nine branches. */
export const MOCK_BRANCH_STATISTICS: BranchStatistics[] = MOCK_BRANCH_DETAILS.map((b) => {
  const branchSales = MOCK_SALES.filter((s) => s.branchSlug === b.slug);
  const revenue = branchSales.reduce((sum, s) => sum + s.totals.total, 0);
  const itemsSold = branchSales.reduce((sum, s) => sum + s.items.reduce((n, i) => n + i.quantity, 0), 0);
  const baseDaily = b.isMain ? 4200 : 900 + Math.round(seededUnit(b.slug) * 1500);
  return {
    branchSlug: b.slug,
    period: 'month',
    from: dayIso(30),
    to: nowIso,
    salesCount: branchSales.length,
    revenue: revenue || baseDaily * 26,
    averageSaleValue: branchSales.length ? revenue / branchSales.length : baseDaily,
    itemsSold: itemsSold || Math.round(baseDaily / 30),
    transfersIn: MOCK_TRANSFERS.filter((t) => t.toBranch === b.slug).length,
    transfersOut: MOCK_TRANSFERS.filter((t) => t.fromBranch === b.slug).length,
    lowStockCount: 3 + Math.round(seededUnit(`low:${b.slug}`) * 12),
    outOfStockCount: Math.round(seededUnit(`out:${b.slug}`) * 8),
    revenueSeries: revenueSeries(b.slug, baseDaily),
    topProducts: topProductsFor(b.slug),
  } satisfies BranchStatistics;
});

/** A company-wide sales report snapshot. */
export const MOCK_COMPANY_SALES_REPORT: Report = {
  id: 'rpt_company_sales',
  type: 'sales',
  title: 'Company sales — last 30 days',
  scope: 'all',
  period: 'month',
  from: dayIso(30),
  to: nowIso,
  metrics: [
    { label: 'Total sales', value: MOCK_SALES.length, changePct: 8.4 },
    { label: 'Revenue', value: MOCK_SALES.reduce((s, x) => s + x.totals.total, 0), changePct: 12.1 },
    { label: 'Branches reporting', value: MOCK_BRANCH_DETAILS.filter((b) => b.isActive).length },
    { label: 'Avg. sale value', value: Math.round(MOCK_SALES.reduce((s, x) => s + x.totals.total, 0) / (MOCK_SALES.length || 1)) },
  ],
  rows: MOCK_SALES as unknown as Record<string, unknown>[],
  format: 'table',
  generatedBy: 'usr-aban',
  generatedAt: nowIso,
};

/** A low-stock report snapshot across branches. */
export const MOCK_LOW_STOCK_REPORT: Report = {
  id: 'rpt_low_stock',
  type: 'low-stock',
  title: 'Low & out-of-stock — all branches',
  scope: 'all',
  period: 'today',
  from: dayIso(0),
  to: nowIso,
  metrics: [
    { label: 'Low-stock lines', value: MOCK_BRANCH_STATISTICS.reduce((s, x) => s + x.lowStockCount, 0) },
    { label: 'Out-of-stock lines', value: MOCK_BRANCH_STATISTICS.reduce((s, x) => s + x.outOfStockCount, 0) },
  ],
  rows: MOCK_BRANCH_STATISTICS.map((s) => ({
    branch: s.branchSlug, low: s.lowStockCount, out: s.outOfStockCount,
  })),
  format: 'table',
  generatedBy: 'usr-aban',
  generatedAt: nowIso,
};

/** All precomputed report snapshots. */
export const MOCK_REPORTS: Report[] = [MOCK_COMPANY_SALES_REPORT, MOCK_LOW_STOCK_REPORT];
