/**
 * Multi-Branch Module — branch service.
 * Read/update branch operational details (DEMO_MODE = localStorage).
 */
import type { BranchDetail } from '../types/branch';
import { MOCK_BRANCH_DETAILS } from '../mock/branches.mock';
import { STORE_KEYS, readStore, writeStore } from './storage';

/** All branches with operational metadata. */
export function listBranches(): BranchDetail[] {
  return readStore<BranchDetail>(STORE_KEYS.branches, MOCK_BRANCH_DETAILS);
}

/** One branch by slug, or undefined. */
export function getBranch(slug: string): BranchDetail | undefined {
  return listBranches().find((b) => b.slug === slug);
}

/** Patch a branch's fields; returns the updated branch or undefined. */
export function updateBranch(slug: string, patch: Partial<BranchDetail>): BranchDetail | undefined {
  const all = listBranches();
  const idx = all.findIndex((b) => b.slug === slug);
  if (idx === -1) return undefined;
  const updated: BranchDetail = { ...all[idx], ...patch, updatedAt: new Date().toISOString() };
  all[idx] = updated;
  writeStore(STORE_KEYS.branches, all);
  return updated;
}
