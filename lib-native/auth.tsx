/**
 * Auth Provider for Cofkans Mobile.
 * Uses live Firebase/Supabase credentials only.
 */
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadConfig } from './config';
import { getSupabaseClient } from './supabase';
import { getFirebaseAuth } from './firebase';

export type Role =
  | 'manager'
  | 'front_desk'
  | 'branch_desk'
  | 'driver'
  | 'technician'
  | 'warehouse'
  | 'accountant'
  | 'hr'
  | 'procurement'
  | 'marketing'
  | 'developer';

export interface StaffUser {
  uid: string;
  email: string;
  displayName: string;
  role: Role;
  branchSlug?: string;
}

export const DEMO_PASSWORD = '';

export const DEMO_USERS: Record<string, StaffUser> = {};

const STORAGE_KEY = 'cofkans:staff-user';

interface AuthState {
  user: StaffUser | null;
  loading: boolean;
  mode: 'live';
  signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshMode: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StaffUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'live'>('live');

  const initAuth = async () => {
    setLoading(true);
    try {
      const config = await loadConfig();
      setMode('live');

      const firebaseAuth = await getFirebaseAuth();
      const supabase = await getSupabaseClient();
      
      if (firebaseAuth && firebaseAuth.currentUser) {
        const fbUser = firebaseAuth.currentUser;
        const tokenResult = await fbUser.getIdTokenResult(true);
        const role = (tokenResult.claims.role as Role) || 'developer';
        const branchSlug = (tokenResult.claims.branchSlug as string) || 'kumasi-asuoyeboa';
        
        if (supabase) {
          await supabase.auth.setSession({
            access_token: tokenResult.token,
            refresh_token: '',
          });
        }

        setUser({
          uid: fbUser.uid,
          email: fbUser.email || '',
          displayName: fbUser.displayName || fbUser.email || 'Staff Member',
          role,
          branchSlug,
        });
      } else {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setUser(JSON.parse(raw));
      }
    } catch (e) {
      console.error('Error initializing auth:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const config = await loadConfig();
      const { signInWithEmailAndPassword } = require('firebase/auth');
      const firebaseAuth = await getFirebaseAuth();
      const supabase = await getSupabaseClient();

      if (!firebaseAuth) {
        throw new Error('Firebase Auth client not configured. Complete ReaquireBackendSetUp.md.');
      }

      const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const fbUser = credential.user;
      const tokenResult = await fbUser.getIdTokenResult(true);
      const role = (tokenResult.claims.role as Role) || 'developer';
      const branchSlug = (tokenResult.claims.branchSlug as string) || 'kumasi-asuoyeboa';

      if (supabase) {
        await supabase.auth.setSession({
          access_token: tokenResult.token,
          refresh_token: '',
        });
      }

      const liveUser: StaffUser = {
        uid: fbUser.uid,
        email: fbUser.email || '',
        displayName: fbUser.displayName || fbUser.email || 'Staff Member',
        role,
        branchSlug,
      };

      setUser(liveUser);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(liveUser));
      return { ok: true };
    } catch (e: any) {
      console.error('Sign in error:', e);
      return { ok: false, error: e.message || 'Authentication failed.' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const firebaseAuth = await getFirebaseAuth();
      if (firebaseAuth) {
        await firebaseAuth.signOut();
      }
      const supabase = await getSupabaseClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.error('Sign out error:', e);
    } finally {
      setUser(null);
      await AsyncStorage.removeItem(STORAGE_KEY);
      setLoading(false);
    }
  };

  const refreshMode = async () => {
    await initAuth();
  };

  return (
    <AuthContext.Provider value={{ user, loading, mode, signIn, signOut, refreshMode }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function landingFor(role: Role): string {
  switch (role) {
    case 'driver':
      return '/driver';
    case 'front_desk':
      return '/frontdesk';
    case 'branch_desk':
      return '/branchdesk';
    case 'technician':
      return '/technician';
    case 'warehouse':
      return '/warehouse';
    case 'accountant':
      return '/accountant';
    case 'hr':
      return '/hr';
    case 'procurement':
      return '/procurement';
    case 'marketing':
      return '/marketing';
    case 'developer':
      return '/developer';
    case 'manager':
    default:
      return '/manager';
  }
}
