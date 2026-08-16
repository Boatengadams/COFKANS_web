import type { UserRole } from '@/app/types';
import { Platform } from 'react-native';
import {
  APP_ENV,
  APP_ENV_WARNING,
  getPublicEnv,
  LIVE_BACKEND_ENABLED,
  type AppEnvironment,
} from '../../lib/environment';

/**
 * Backend mode helpers.
 *
 * Demo identities have been removed from the application. Keep
 * EXPO_PUBLIC_APP_ENV set to development or production and create real
 * Firebase Auth users plus Firestore staff records instead.
 */
export type { AppEnvironment } from '../../lib/environment';
export { APP_ENV, APP_ENV_WARNING, getPublicEnv } from '../../lib/environment';

export const IS_WEB = Platform.OS === 'web';
export const USE_LIVE_BACKEND = true;
export const DEMO_MODE = false;

/** Browser storage is deliberately unavailable to native bundles. */
export function getBrowserStorage(): Storage | null {
  if (!IS_WEB || typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Dispatch a browser-only event without leaking DOM globals into native. */
export function dispatchBrowserEvent(name: string, detail?: unknown): void {
  if (!IS_WEB || typeof window === 'undefined') return;
  try {
    window.dispatchEvent(new CustomEvent(name, { detail }));
  } catch {
    // Storage/event access can be denied by an embedded browser sandbox.
  }
}

/** Compatibility role names used by older portal code. Real access is resolved
 *  from Firebase Auth custom claims and Firestore staff records. */
export type DemoRole =
  | 'guest'
  | 'customer'
  | 'manager'
  | 'technician'
  | 'driver'
  | 'developer'         // testing hub — links to every portal & page
  | 'warehouse'         // warehouse / stock controller
  | 'accountant'        // finance & accounts
  | 'hr'                // human resources
  | 'procurement'       // supply / procurement officer
  | 'marketing'         // marketing manager
  | 'front_desk'   // showroom front desk — unified desk (POS + catalog + support)
  | 'branch_desk'; // branch-level front desk — unified desk for one branch

export interface DemoUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole | 'admin';
  photoURL: string;
  isDeveloper: boolean;
  /** For staff-portal roles that live in `staffAccounts`. */
  staffRole?: 'branch_manager' | 'rider' | 'front_desk' | 'developer';
  branchSlug?: string;
}

/** Demo identities were removed. Use Firebase Auth + Firestore records. */
export const DEMO_USERS: Partial<Record<Exclude<DemoRole, 'guest'>, DemoUser>> = {};

/** Named demo login accounts were removed. */
export const DEMO_NAMED_ACCOUNTS: Record<string, Exclude<DemoRole, 'guest'>> = {};

/** No shared demo password is supported. */
export const DEMO_PASSWORD = '';

export const DEMO_STORAGE_KEY = 'cofkans:demo-role';
export const DEMO_ROLE_EVENT = 'cofkans:demo-role-change';

/**
 * Signed-in session (real credential login).
 *
 * When a user signs in with a username/email + password (validated against the
 * codebase account store), the resolved account is persisted here so routing
 * and branch scoping read the *actual individual* — not a generic per-role demo
 * identity. `SESSION_ID_KEY` holds the account id for restore-on-reload.
 */
export const SESSION_USER_KEY = 'cofkans:session-user';
export const SESSION_ID_KEY = 'cofkans:session-id';

export function setSessionUser(u: DemoUser | null): void {
  const storage = getBrowserStorage();
  if (!storage) return;
  try {
    if (u) storage.setItem(SESSION_USER_KEY, JSON.stringify(u));
    else storage.removeItem(SESSION_USER_KEY);
  } catch { /* ignore */ }
}

export function getSessionUser(): DemoUser | null {
  const storage = getBrowserStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(SESSION_USER_KEY);
    return raw ? (JSON.parse(raw) as DemoUser) : null;
  } catch {
    return null;
  }
}

/** Current signed-in role (defaults to guest = signed out). */
export function getDemoRole(): DemoRole {
  const storage = getBrowserStorage();
  if (!storage) return 'guest';
  const r = storage.getItem(DEMO_STORAGE_KEY) as DemoRole | null;
  return r ?? 'guest';
}

/** Set the active role and notify listeners (auth provider re-reads on the event). */
export function setDemoRole(role: DemoRole): void {
  const storage = getBrowserStorage();
  if (!storage) return;
  try { storage.setItem(DEMO_STORAGE_KEY, role); } catch { /* ignore */ }
  dispatchBrowserEvent(DEMO_ROLE_EVENT, role);
}

/**
 * The signed-in user for the current role. Demo templates were removed, so
 * this only returns a real persisted session user.
 */
export function getDemoUser(role: DemoRole = getDemoRole()): DemoUser | null {
  const session = getSessionUser();
  if (session) return session;
  return null;
}
