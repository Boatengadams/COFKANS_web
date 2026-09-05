/**
 * Multi-Branch Module — inventory hook.
 */
import { useCallback } from 'react';
import type { BranchInventory } from '../types/branch-inventory';
import { getBranchInventory } from '../services/inventoryService';
import { useStoreSync } from './useStoreSync';

/** Live inventory snapshot (items + totals) for a branch. */
export function useBranchInventory(branchSlug: string): BranchInventory {
  const [inventory] = useStoreSync(
    useCallback(() => getBranchInventory(branchSlug), [branchSlug]),
  );
  return inventory;
}
