/**
 * Multi-Branch Module — active-branch context.
 *
 * Holds the currently selected branch for the module's screens plus the
 * signed-in user's branch role, and exposes a permission check bound to that
 * role. No UI — provider + hook only.
 */
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { BranchDetail } from '../types/branch';
import type { BranchRole } from '../types/user-branch';
import { listBranches } from '../services/branchService';
import { can as canDo, type BranchAction } from '../permissions';
import { SHOWROOM_SLUG } from '../mock/branches.mock';

interface BranchContextValue {
  /** All branches (operational detail). */
  branches: BranchDetail[];
  /** Currently selected branch slug. */
  activeSlug: string;
  /** Currently selected branch record, if resolvable. */
  activeBranch: BranchDetail | undefined;
  /** Change the active branch. */
  setActiveSlug: (slug: string) => void;
  /** The signed-in user's role at the active branch. */
  role: BranchRole | undefined;
  setRole: (role: BranchRole | undefined) => void;
  /** Permission check bound to the current role. */
  can: (action: BranchAction) => boolean;
}

const BranchContext = createContext<BranchContextValue | null>(null);

export function BranchProvider({
  children,
  initialSlug = SHOWROOM_SLUG,
  initialRole,
}: {
  children: ReactNode;
  initialSlug?: string;
  initialRole?: BranchRole;
}) {
  const branches = useMemo(() => listBranches(), []);
  const [activeSlug, setActiveSlug] = useState(initialSlug);
  const [role, setRole] = useState<BranchRole | undefined>(initialRole);

  const value = useMemo<BranchContextValue>(() => {
    const activeBranch = branches.find((b) => b.slug === activeSlug);
    return {
      branches,
      activeSlug,
      activeBranch,
      setActiveSlug,
      role,
      setRole,
      can: (action: BranchAction) => canDo(role, action),
    };
  }, [branches, activeSlug, role]);

  return <BranchContext.Provider value={value}>{children}</BranchContext.Provider>;
}

/** Access the branch context; throws if used outside a BranchProvider. */
export function useBranchContext(): BranchContextValue {
  const ctx = useContext(BranchContext);
  if (!ctx) throw new Error('useBranchContext must be used within a BranchProvider');
  return ctx;
}
