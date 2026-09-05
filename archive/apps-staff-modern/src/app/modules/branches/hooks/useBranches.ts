/**
 * Multi-Branch Module — branch hooks.
 */
import { useCallback } from 'react';
import type { BranchDetail } from '../types/branch';
import { listBranches, getBranch } from '../services/branchService';
import { useStoreSync } from './useStoreSync';

/** Live list of all branches. */
export function useBranches(): BranchDetail[] {
  const [branches] = useStoreSync(useCallback(() => listBranches(), []));
  return branches;
}

/** Live single branch by slug. */
export function useBranch(slug: string): BranchDetail | undefined {
  const [branch] = useStoreSync(useCallback(() => getBranch(slug), [slug]));
  return branch;
}
