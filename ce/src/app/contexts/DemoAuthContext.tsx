/**
 * Demo auth provider — drop-in replacement for FirebaseAuthProvider while the
 * backend is paused. No network calls; state in localStorage. Same useAuth()
 * surface so existing consumers compile unchanged.
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import type { FirestoreUser } from '../../lib/firestore-schema';
import type { UserRole } from '../types';
import { DEMO_USERS, DEMO_STORAGE_KEY, type DemoUser } from '../../lib/demo-mode';

interface AuthContextType {
  user: FirestoreUser | null;
  firebaseUser: { uid: string; email: string | null; emailVerified: boolean } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isEmailVerified: boolean;
  signInWithProvider: (provider: 'google' | 'apple') => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string, role?: UserRole) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  reloadUser: () => Promise<void>;
  updateUserProfile: (updates: Partial<FirestoreUser>) => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  error: string | null;
  setDemoRole: (role: UserRole | null) => void;
  demoRole: UserRole | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

export function DemoAuthProvider({ children }: { children: ReactNode }) {
  const [demoRole, setDemoRoleState] = useState<UserRole | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(DEMO_STORAGE_KEY);
    return stored && stored in DEMO_USERS ? (stored as UserRole) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const user: FirestoreUser | null = demoRole ? makeFirestoreUser(DEMO_USERS[demoRole]) : null;
  const firebaseUser = user
    ? { uid: user.uid, email: user.email, emailVerified: true }
    : null;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (demoRole) localStorage.setItem(DEMO_STORAGE_KEY, demoRole);
    else localStorage.removeItem(DEMO_STORAGE_KEY);
  }, [demoRole]);

  const setDemoRole = (role: UserRole | null) => {
    setDemoRoleState(role);
    if (role) toast.success(`Demo: signed in as ${DEMO_USERS[role].displayName}`);
    else toast.success('Demo: signed out');
  };

  const fakeDelay = () => new Promise(r => setTimeout(r, 200));

  const signInWithProvider = async (provider: 'google' | 'apple') => {
    setIsLoading(true); await fakeDelay();
    setDemoRole('customer');
    toast.success(`(Demo) ${provider} sign-in — using Demo Customer`);
    setIsLoading(false);
  };

  const signUpWithEmail = async (_email: string, _password: string, displayName: string, role: UserRole = 'customer') => {
    setIsLoading(true); await fakeDelay();
    setDemoRole(role);
    toast.success(`(Demo) Account created for ${displayName}`);
    setIsLoading(false);
  };

  const signInWithEmail = async (email: string) => {
    setIsLoading(true); await fakeDelay();
    const prefix = email.split('@')[0].toLowerCase();
    const role: UserRole =
      prefix.includes('admin') ? 'admin' :
      prefix.includes('tech') ? 'technician' :
      prefix.includes('driver') ? 'driver' : 'customer';
    setDemoRole(role);
    setIsLoading(false);
  };

  const resetPassword = async () => { await fakeDelay(); toast.success('(Demo) Reset email sent'); };
  const signOut = async () => { await fakeDelay(); setDemoRole(null); };
  const sendVerificationEmail = async () => { toast.success('(Demo) Verification email sent'); };
  const reloadUser = async () => {};
  const updateUserProfile = async (updates: Partial<FirestoreUser>) => {
    toast.success('(Demo) Profile updated — not persisted');
    console.info('Demo profile update payload:', updates);
  };
  const hasRole = (role: UserRole) => {
    if (!user) return false;
    return user.role === role || user.role === 'admin';
  };

  const value: AuthContextType = {
    user,
    firebaseUser: firebaseUser as never,
    isAuthenticated: !!user,
    isLoading,
    isEmailVerified: true,
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
    setDemoRole,
    demoRole,
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
