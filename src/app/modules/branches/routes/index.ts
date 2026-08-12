/** Multi-Branch Module — routes barrel. */
export {
  BRANCH_BASE, BRANCH_SEGMENTS, ROLE_LANDING, BRANCH_ROUTE_PATTERNS,
  branchPath, branchLandingPath,
  type BranchSegment,
} from './paths';
export {
  useCurrentBranchUser, resolveCurrentBranchUser, demoRoleToBranchRole,
  type CurrentBranchUser,
} from './useCurrentBranchUser';
export { BranchRedirect } from './BranchRedirect';
export { BranchRouteGuard } from './BranchRouteGuard';
export { BranchModuleRoutes, type RenderBranchSegment } from './BranchModuleRoutes';
