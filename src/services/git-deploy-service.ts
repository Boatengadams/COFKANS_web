/**
 * Git Deploy Service — DISABLED
 * --------------------------------------------------------------------------
 * Previous implementation stored a GitHub PAT in localStorage and even
 * fell back to a HARDCODED token shipped to every customer's browser. Both
 * are unacceptable — any XSS or even a curious user with devtools would
 * read it and gain repo write access.
 *
 * The "auto-commit products to GitHub from the dev console" pattern is
 * also redundant: products live in Firestore, which is the source of
 * truth at runtime. Regenerating a static `products-full.ts` file and
 * committing it adds nothing and creates a credential exposure path.
 *
 * All functions are kept as compile-stable stubs so existing callers
 * (UnifiedProductManager, ComprehensiveProductManager) still build. They
 * return `false` / failure so any UI tied to "deploy" simply reports it
 * as disabled.
 *
 * If you ever genuinely need CI-triggered redeploys from the dev console,
 * do it via a Cloud Function that calls the GitHub API with a token held
 * server-side in `firebase functions:secrets:set`. NEVER from the client.
 */

import type { FirestoreProduct } from '../lib/firestore-schema';

interface DeployResult {
  success: boolean;
  commitSha?: string;
  commitUrl?: string;
  error?: string;
}

export async function deployToGitHub(
  _products: FirestoreProduct[],
  _commitMessage?: string,
): Promise<DeployResult> {
  return {
    success: false,
    error: 'GitHub auto-deploy from the browser is disabled. Products are saved to Firestore directly.',
  };
}

export function isGitHubConfigured(): boolean {
  return false;
}

export function configureGitHub(_token: string, _owner: string, _repo: string): void {
  /* no-op; intentionally rejects — credentials must never live in the browser */
}

export function getGitHubConfig(): null {
  return null;
}

export function clearGitHubConfig(): void {
  try {
    localStorage.removeItem('github_token');
    localStorage.removeItem('github_owner');
    localStorage.removeItem('github_repo');
  } catch { /* ignore */ }
}

// Auto-purge any stale token left over from the previous implementation
// on every page load, so users who logged in once with the old code stop
// carrying a leaked PAT in their browser.
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('github_token');
    localStorage.removeItem('github_owner');
    localStorage.removeItem('github_repo');
  } catch { /* ignore */ }
}
