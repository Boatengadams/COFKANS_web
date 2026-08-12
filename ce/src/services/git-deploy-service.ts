/**
 * Git Deploy Service
 * Automatically commits product changes to GitHub repository
 * Triggers GitHub Actions deployment pipeline
 */

import type { FirestoreProduct } from '../lib/firestore-schema';

interface GitHubConfig {
  owner: string;
  repo: string;
  branch: string;
  token: string;
}

interface DeployResult {
  success: boolean;
  commitSha?: string;
  commitUrl?: string;
  error?: string;
}

/**
 * Generate products-full.ts file content from Firebase products
 */
function generateProductsFile(products: FirestoreProduct[]): string {
  // Convert Firebase products back to the simple Product interface format
  const simpleProducts = products.map(p => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    price: p.price,
    tradePrice: p.tradePrice || undefined,
    category: p.categoryId,
    subcategory: p.subcategory,
    image: p.images[0]?.url || '',
    featured: p.isFeatured || undefined,
    badge: p.badges[0] || undefined,
    rating: p.rating || undefined,
    reviews: p.reviewCount || undefined,
    stock: p.totalStock || undefined,
    description: p.description || undefined,
    specs: p.technicalSpecs || undefined,
  }));

  const fileContent = `// Complete Cofkans Product Catalog - Auto-generated from Firebase
// Last updated: ${new Date().toISOString()}
// DO NOT EDIT MANUALLY - Use Developer Console to manage products

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  tradePrice?: number;
  category: string;
  subcategory: string;
  image: string;
  featured?: boolean;
  badge?: string;
  rating?: number;
  reviews?: number;
  stock?: number;
  description?: string;
  specs?: string[];
}

export const fullProductCatalog: Product[] = ${JSON.stringify(simpleProducts, null, 2)};
`;

  return fileContent;
}

/**
 * Get current file SHA from GitHub (required for updates)
 */
async function getFileSha(config: GitHubConfig, filePath: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}?ref=${config.branch}`,
      {
        headers: {
          'Authorization': `Bearer ${config.token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.sha;
  } catch (error) {
    console.error('Error getting file SHA:', error);
    return null;
  }
}

/**
 * Commit and push changes to GitHub repository
 */
export async function deployToGitHub(
  products: FirestoreProduct[],
  commitMessage: string = 'Update products from Developer Console'
): Promise<DeployResult> {
  try {
    // Get GitHub config from localStorage
    const config = getGitHubConfig();

    if (!config) {
      return {
        success: false,
        error: 'GitHub token not configured. Please set up GitHub integration in settings.',
      };
    }

    const filePath = 'src/app/data/products-full.ts';

    // Step 1: Generate new file content
    console.log('[GitDeploy] Generating products file...');
    const newContent = generateProductsFile(products);
    const contentBase64 = btoa(unescape(encodeURIComponent(newContent)));

    // Step 2: Get current file SHA (required for update)
    console.log('[GitDeploy] Getting current file SHA...');
    const currentSha = await getFileSha(config, filePath);

    if (!currentSha) {
      return {
        success: false,
        error: 'Could not find products file in repository. Please check repository configuration.',
      };
    }

    // Step 3: Create commit via GitHub API
    console.log('[GitDeploy] Creating commit...');
    const response = await fetch(
      `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${config.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `${commitMessage}\n\nUpdated ${products.length} products\nPushed from Developer Console`,
          content: contentBase64,
          sha: currentSha,
          branch: config.branch,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to commit to GitHub');
    }

    const data = await response.json();

    console.log('[GitDeploy] ✅ Commit successful!', data);

    return {
      success: true,
      commitSha: data.commit.sha,
      commitUrl: data.commit.html_url,
    };
  } catch (error) {
    console.error('[GitDeploy] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Check if GitHub integration is configured
 */
export function isGitHubConfigured(): boolean {
  // GitHub is always configured now (either from localStorage or defaults)
  return true;
}

/**
 * Configure GitHub integration
 */
export function configureGitHub(token: string, owner: string, repo: string): void {
  localStorage.setItem('github_token', token);
  localStorage.setItem('github_owner', owner);
  localStorage.setItem('github_repo', repo);
}

/**
 * Get GitHub configuration
 */
export function getGitHubConfig(): GitHubConfig | null {
  // Try to get from localStorage first
  let token = localStorage.getItem('github_token');
  let owner = localStorage.getItem('github_owner');
  let repo = localStorage.getItem('github_repo');

  // If not in localStorage, use default credentials and save them
  if (!token || !owner || !repo) {
    // Default GitHub credentials
    const defaultOwner = 'Boatengadams';
    const defaultRepo = 'cofkans-electricals';
    const defaultToken = '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';

    // Save defaults to localStorage for future use
    localStorage.setItem('github_owner', defaultOwner);
    localStorage.setItem('github_repo', defaultRepo);
    localStorage.setItem('github_token', defaultToken);

    owner = defaultOwner;
    repo = defaultRepo;
    token = defaultToken;
  }

  return {
    owner,
    repo,
    branch: 'main',
    token,
  };
}

/**
 * Clear GitHub configuration
 */
export function clearGitHubConfig(): void {
  localStorage.removeItem('github_token');
  localStorage.removeItem('github_owner');
  localStorage.removeItem('github_repo');
}
