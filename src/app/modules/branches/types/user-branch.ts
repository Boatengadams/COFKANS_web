/**
 * Multi-Branch Module — UserBranch model.
 *
 * The assignment linking a staff user to a branch, with the role they hold at
 * that branch. A user may be assigned to more than one branch. Types only.
 */

/** Roles a user can hold at a branch (Technician deferred but reserved). */
export type BranchRole =
  | 'manager' | 'front_desk' | 'driver' | 'technician' | 'developer'
  | 'warehouse' | 'accountant' | 'hr'
  | 'procurement' | 'marketing';

/** A single user↔branch assignment. */
export interface UserBranch {
  id: string;
  userId: string;
  branchSlug: string;
  role: BranchRole;
  /** True for the user's default/home branch when assigned to several. */
  isPrimary?: boolean;
  /** Whether the assignment is currently active. */
  isActive: boolean;
  assignedBy?: string;
  assignedAt: string;
  revokedAt?: string;
}

/** Denormalized view of a user with all their branch assignments. */
export interface UserBranchProfile {
  userId: string;
  displayName?: string;
  email?: string;
  assignments: UserBranch[];
  /** Slug of the primary branch, if any. */
  primaryBranch?: string;
}
