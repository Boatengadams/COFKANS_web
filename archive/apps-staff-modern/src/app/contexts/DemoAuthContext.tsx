/**
 * Codebase-managed credential auth provider.
 *
 * Accounts and passwords live in the codebase account store
 * (`src/app/pages/developer-portal/store.ts`, key `dp:staff`). A user signs in
 * with their username/email + password; on success we resolve their assigned
 * role and open the matching portal. No generic "demo role switcher" — you must
 * authenticate. Only managers and developers may create/delete accounts.
 *
 * This still runs fully in the browser (no Firebase yet). When the real backend
 * is connected, flip DEMO_MODE and only this layer changes — the useAuth()
 * surface stays identical so every consumer compiles unchanged.
 */
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import type { FirestoreUser } from '@/lib/firestore-schema';
import type { UserRole } from '../types';
import {
  DEMO_USERS,
  DEMO_STORAGE_KEY,
  DEMO_ROLE_EVENT,
  SESSION_ID_KEY,
  setSessionUser,
  getBrowserStorage,
  dispatchBrowserEvent,
  type DemoUser,
} from '@/lib/demo-mode';
import {
  store,
  isCurrentlySuspended,
  canManageUsers as roleCanManageUsers,
  type StaffMember,
} from '../pages/developer-portal/store';

interface AuthContextType {
  user: FirestoreUser | null;
  firebaseUser: { uid: string; email: string | null; emailVerified: boolean } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loading: boolean;
  isEmailVerified: boolean;
  /** True when the signed-in user may create/delete accounts (manager/developer). */
  canManageUsers: boolean;
  /** Change the signed-in user's own password (re-confirms the current one). */
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  /** True when the signed-in user must set a new password before continuing (after a manager reset). */
  mustChangePassword: boolean;
  signInWithProvider: (provider: 'google' | 'apple') => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string, role?: UserRole) => Promise<void>;
  signInWithEmail: (login: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  reloadUser: () => Promise<void>;
  updateUserProfile: (updates: Partial<FirestoreUser>) => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  error: string | null;
  /** Legacy compat — no-op in credential mode. */
  setDemoRole: (role: UserRole | null) => void;
  demoRole: UserRole | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AUTH_READY_EVENT = 'cofkans:auth-ready';

function setWebAuthBootPending(pending: boolean) {
  if (typeof window === 'undefined') return;
  window.__cofkansAuthBootPending = pending;
  window.dispatchEvent(new Event(AUTH_READY_EVENT));
}

const avatar = (seed: string) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;

/** Map a store StaffRole → the DemoUser.staffRole the /staff portal understands. */
function toStaffRole(role: StaffMember['role']): DemoUser['staffRole'] {
  switch (role) {
    case 'front_desk':
    case 'branch_desk': return 'front_desk';
    case 'driver':      return 'rider';
    case 'developer':   return 'developer';
    case 'manager':     return 'branch_manager';
    default:            return undefined;
  }
}

/** Build the persisted DemoUser shape from a store account. */
function toDemoUser(m: StaffMember): DemoUser {
  return {
    uid: m.id,
    email: m.email,
    displayName: m.name,
    role: (m.role === 'manager' ? 'manager' : 'admin') as never,
    photoURL: avatar(m.email),
    isDeveloper: m.role === 'developer',
    staffRole: toStaffRole(m.role),
    branchSlug: m.branchSlug,
  };
}

function makeFirestoreUser(d: DemoUser): FirestoreUser {
  const now = { toMillis: () => Date.now(), toDate: () => new Date() } as never;
  return {
    uid: d.uid,
    email: d.email,
    displayName: d.displayName,
    phoneNumber: '+233200000000',
    photoURL: d.photoURL,
    role: d.role,
    provider: 'email',
    emailVerified: true,
    phoneVerified: true,
    createdAt: now,
    lastLogin: now,
    addresses: [],
    defaultAddressId: null,
    preferences: {
      newsletter: true,
      smsNotifications: true,
      emailNotifications: true,
      currency: 'GHS',
      language: 'en',
    },
    stats: { totalOrders: 0, totalSpent: 0, lifetimeValue: 0 },
    twoFactorEnabled: false,
    lastPasswordChange: null,
    isDeveloper: d.isDeveloper,
    isActive: true,
    isBanned: false,
    banReason: null,
  };
}

/** Persist the active session across reloads + notify routing listeners. */
function persistSession(demoUser: DemoUser, role: string) {
  const storage = getBrowserStorage();
  try {
    storage?.setItem(DEMO_STORAGE_KEY, role);
    storage?.setItem(SESSION_ID_KEY, demoUser.uid);
  } catch { /* ignore */ }
  setSessionUser(demoUser);
  dispatchBrowserEvent(DEMO_ROLE_EVENT, role);
}

function clearSession() {
  const storage = getBrowserStorage();
  try {
    storage?.removeItem(DEMO_STORAGE_KEY);
    storage?.removeItem(SESSION_ID_KEY);
  } catch { /* ignore */ }
  setSessionUser(null);
  dispatchBrowserEvent(DEMO_ROLE_EVENT, 'guest');
}

export function DemoAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirestoreUser | null>(null);
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mustChange, setMustChange] = useState(false);
  const bootRegistered = useRef(false);

  if (!bootRegistered.current) {
    bootRegistered.current = true;
    setWebAuthBootPending(true);
  }

  useEffect(() => {
    if (!isLoading) setWebAuthBootPending(false);
  }, [isLoading]);

  // Restore the signed-in account on first load / reload.
  useEffect(() => {
    const storage = getBrowserStorage();
    if (!storage) {
      setIsLoading(false);
      return;
    }
    try {
      const id = storage.getItem(SESSION_ID_KEY);
      if (id) {
        const member = store.getStaffById(id);
        if (member && !isCurrentlySuspended(member)) {
          const d = toDemoUser(member);
          setUser(makeFirestoreUser(d));
          setCurrentRole(member.role);
          setMustChange(!!member.mustChangePassword);
          return;
        }
        clearSession();
      } else if (storage.getItem(DEMO_STORAGE_KEY) === 'customer') {
        const d = DEMO_USERS.customer;
        if (d) {
          setUser(makeFirestoreUser(d));
          setCurrentRole('customer');
        }
      }
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const firebaseUser = user
    ? { uid: user.uid, email: user.email, emailVerified: true }
    : null;

  const canManage = roleCanManageUsers(currentRole);

  const fakeDelay = () => new Promise((r) => setTimeout(r, 150));

  const signInWithProvider = async (provider: 'google' | 'apple') => {
    setIsLoading(true); await fakeDelay();
    const d = DEMO_USERS.customer;
    if (!d) {
      setIsLoading(false);
      throw Object.assign(new Error('Demo customer account is not configured.'), { code: 'auth/demo-user-missing' });
    }
    persistSession(d, 'customer');
    setUser(makeFirestoreUser(d));
    setCurrentRole('customer');
    toast.success(`Signed in with ${provider}`);
    setIsLoading(false);
  };

  const signInWithEmail = async (login: string, password: string) => {
    setIsLoading(true); await fakeDelay();

    const member = store.verifyLogin(login, password);
    if (!member) {
      setIsLoading(false);
      throw Object.assign(new Error('Email or password is incorrect.'), { code: 'auth/invalid-credential' });
    }
    if (isCurrentlySuspended(member)) {
      setIsLoading(false);
      throw Object.assign(new Error('This account is suspended. Contact a manager.'), { code: 'auth/user-disabled' });
    }

    const d = toDemoUser(member);
    persistSession(d, member.role);
    setUser(makeFirestoreUser(d));
    setCurrentRole(member.role);
    setMustChange(!!member.mustChangePassword);
    store.log('info', member.email, `Signed in (${member.role}).`);
    setIsLoading(false);
  };

  /**
   * Create a new staff account. Gated to managers/developers. Used by the
   * account-management panels; also exposed via the auth surface for symmetry.
   */
  const signUpWithEmail = async (email: string, password: string, displayName: string, role: UserRole = 'front_desk' as UserRole) => {
    if (!canManage) {
      toast.error('Only a manager or developer can create accounts.');
      throw Object.assign(new Error('Not authorized to create accounts.'), { code: 'auth/insufficient-permission' });
    }
    setIsLoading(true); await fakeDelay();
    store.addStaff(
      { name: displayName, email, role: role as StaffMember['role'], branch: 'Asuoyeboa (Main)', status: 'active', password },
      user?.email ?? 'system',
    );
    toast.success(`Account created for ${displayName}`);
    setIsLoading(false);
  };

  const resetPassword = async () => { await fakeDelay(); toast.success('Contact a manager to reset your password.'); };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) throw Object.assign(new Error('You must be signed in.'), { code: 'auth/no-user' });
    if (newPassword.trim().length < 6) {
      throw Object.assign(new Error('New password must be at least 6 characters.'), { code: 'auth/weak-password' });
    }
    setIsLoading(true); await fakeDelay();
    const result = store.changePassword(user.uid, currentPassword, newPassword);
    setIsLoading(false);
    if (result === 'wrong-current') {
      throw Object.assign(new Error('Your current password is incorrect.'), { code: 'auth/wrong-password' });
    }
    if (result === 'not-found') {
      throw Object.assign(new Error('Account not found.'), { code: 'auth/user-not-found' });
    }
    setMustChange(false);
  };

  const signOut = async () => {
    await fakeDelay();
    clearSession();
    setUser(null);
    setCurrentRole(null);
    setMustChange(false);
    toast.success('Signed out');
  };

  const sendVerificationEmail = async () => { toast.success('Email already verified.'); };
  const reloadUser = async () => {};
  const updateUserProfile = async (updates: Partial<FirestoreUser>) => {
    if (user) setUser({ ...user, ...updates });
    toast.success('Profile updated');
  };
  const hasRole = (role: UserRole) => {
    if (!user) return false;
    return currentRole === role || currentRole === 'manager' || currentRole === 'developer';
  };

  const value: AuthContextType = {
    user,
    firebaseUser: firebaseUser as never,
    isAuthenticated: !!user,
    isLoading,
    loading: isLoading,
    isEmailVerified: true,
    canManageUsers: canManage,
    changePassword,
    mustChangePassword: mustChange,
    signInWithProvider,
    signUpWithEmail,
    signInWithEmail,
    resetPassword,
    signOut,
    sendVerificationEmail,
    reloadUser,
    updateUserProfile,
    hasRole,
    error: null,
    setDemoRole: () => { /* demo switcher removed — login required */ },
    demoRole: (currentRole as UserRole) ?? null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useDemoAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useDemoAuth must be used within DemoAuthProvider');
  return ctx;
}

// Aliases so legacy imports keep working without churn.
export const useAuth = useDemoAuth;
export const useFirebaseAuth = useDemoAuth;
export const FirebaseAuthProvider = DemoAuthProvider;
