/**
 * Multi-Branch Module — report & statistics service.
 * Derives BranchStatistics and Report documents from sales/inventory/transfers.
 */
import type { BranchStatistics, TopProductStat, StatPeriod } from '../types/branch-statistics';
import type { Report, ReportType } from '../types/report';
import type { Sale } from '../types/sale';
import { listSales, listBranchSales } from './saleService';
import { getBranchInventory } from './inventoryService';
import { listTransfers } from './transferService';
import { genId } from '../utils/id';

/** Inclusive lower bound (ISO) for a named period, relative to now. */
function periodStart(period: StatPeriod): string {
  const now = new Date();
  const d = new Date(now);
  switch (period) {
    case 'today': d.setHours(0, 0, 0, 0); break;
    case 'week': d.setDate(now.getDate() - 7); break;
    case 'month': d.setMonth(now.getMonth() - 1); break;
    case 'quarter': d.setMonth(now.getMonth() - 3); break;
    case 'year': d.setFullYear(now.getFullYear() - 1); break;
    default: d.setFullYear(now.getFullYear() - 5); break; // 'custom' → wide default
  }
  return d.toISOString();
}

function topProducts(sales: Sale[], limit = 5): TopProductStat[] {
  const map = new Map<string, TopProductStat>();
  for (const sale of sales) {
    for (const item of sale.items) {
      const cur = map.get(item.sku) ?? {
        productId: item.productId, sku: item.sku, name: item.name, unitsSold: 0, revenue: 0,
      };
      cur.unitsSold += item.quantity;
      cur.revenue += item.lineTotal;
      map.set(item.sku, cur);
    }
  }
  return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, limit);
}

/** Compute performance statistics for a branch over a period. */
export function getBranchStatistics(branchSlug: string, period: StatPeriod = 'month'): BranchStatistics {
  const from = periodStart(period);
  const to = new Date().toISOString();
  const sales = listBranchSales(branchSlug).filter((s) => s.soldAt >= from);
  const revenue = sales.reduce((sum, s) => sum + s.totals.total, 0);
  const itemsSold = sales.reduce((sum, s) => sum + s.items.reduce((n, i) => n + i.quantity, 0), 0);
  const transfers = listTransfers();
  const inv = getBranchInventory(branchSlug);

  return {
    branchSlug,
    period,
    from,
    to,
    salesCount: sales.length,
    revenue,
    averageSaleValue: sales.length ? revenue / sales.length : 0,
    itemsSold,
    transfersIn: transfers.filter((t) => t.toBranch === branchSlug).length,
    transfersOut: transfers.filter((t) => t.fromBranch === branchSlug).length,
    lowStockCount: inv.totals.lowStockCount,
    outOfStockCount: inv.totals.outOfStockCount,
    topProducts: topProducts(sales),
  };
}

/** Generate a report document for one branch or the whole company. */
export function generateReport(
  type: ReportType,
  scope: string | 'all',
  period: StatPeriod = 'month',
  generatedBy = 'demo-user',
): Report {
  const from = periodStart(period);
  const to = new Date().toISOString();
  const sales = (scope === 'all' ? listSales() : listBranchSales(scope)).filter((s) => s.soldAt >= from);
  const revenue = sales.reduce((sum, s) => sum + s.totals.total, 0);

  return {
    id: genId('rpt'),
    type,
    title: `${type[0].toUpperCase()}${type.slice(1)} report — ${scope}`,
    scope,
    period,
    from,
    to,
    metrics: [
      { label: 'Sales', value: sales.length },
      { label: 'Revenue', value: revenue },
      { label: 'Avg. sale', value: sales.length ? revenue / sales.length : 0 },
    ],
    rows: sales as unknown as Record<string, unknown>[],
    format: 'table',
    generatedBy,
    generatedAt: new Date().toISOString(),
  };
}
