/**
 * Multi-Branch Module — sales & statistics hooks.
 */
import { useCallback } from 'react';
import type { Sale } from '../types/sale';
import type { BranchStatistics, StatPeriod } from '../types/branch-statistics';
import { listSales, listBranchSales } from '../services/saleService';
import { getBranchStatistics } from '../services/reportService';
import { useStoreSync } from './useStoreSync';

/** Live list of all sales. */
export function useSales(): Sale[] {
  const [sales] = useStoreSync(useCallback(() => listSales(), []));
  return sales;
}

/** Live sales for a single branch. */
export function useBranchSales(branchSlug: string): Sale[] {
  const [sales] = useStoreSync(
    useCallback(() => listBranchSales(branchSlug), [branchSlug]),
  );
  return sales;
}

/** Live performance statistics for a branch over a period. */
export function useBranchStatistics(branchSlug: string, period: StatPeriod = 'month'): BranchStatistics {
  const [stats] = useStoreSync(
    useCallback(() => getBranchStatistics(branchSlug, period), [branchSlug, period]),
  );
  return stats;
}
