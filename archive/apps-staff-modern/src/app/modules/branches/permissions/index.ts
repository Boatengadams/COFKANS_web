/**
 * Multi-Branch Module — permissions barrel.
 *
 * Public surface of the configurable permission architecture:
 *   - actions:  BranchAction catalog + groups
 *   - roles:    PermissionRole definitions + normalisation/resolution
 *   - config:   DEFAULT_PERMISSION_CONFIG + definePermissions() override
 *   - checks:   can / canInBranch (default) and *With variants (custom config)
 *   - runtime:  PermissionProvider, usePermissions, useCan, guards
 */
export {
  type BranchAction,
  ACTION_GROUPS,
  ALL_ACTIONS,
} from './actions';

export {
  type PermissionRole,
  type AnyRole,
  type PermissionScope,
  type RoleDefinition,
  ROLE_DEFINITIONS,
  normalizeRole,
  resolveRole,
} from './roles';

export {
  type RolePermission,
  type PermissionConfig,
  DEFAULT_PERMISSION_CONFIG,
  definePermissions,
} from './config';

export {
  canWith,
  actionsForWith,
  scopeForWith,
  canInBranchWith,
  can,
  actionsFor,
  canInBranch,
  BRANCH_PERMISSIONS,
} from './can';

export {
  PermissionProvider,
  usePermissions,
  useCan,
  useRoleDefinition,
} from './PermissionContext';

export {
  Can,
  Cannot,
  RequirePermission,
} from './PermissionGuards';
