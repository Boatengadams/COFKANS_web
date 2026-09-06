import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  sendEmailVerification,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  User as FirebaseUser,
  AuthError,
} from 'firebase/auth';
import { auth, googleProvider, appleProvider, microsoftProvider, db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { UserService } from '@/lib/firestore-service';
import { useCartStore } from '../../stores/cart-store';
import type { UserRole } from '../types';
import type { FirestoreUser } from '@/lib/firestore-schema';
import toast from 'react-hot-toast';
import {
  recordFailedLogin,
  clearFailedLogins,
  checkAccountLocked,
  checkRateLimit,
} from '@/lib/security-service';
import {
  handleAuthError,
  formatErrorForToast,
  getUserFriendlyMessage,
} from '@/lib/error-handler';
import {
  recordSignInSuccess,
  isSessionExpired,
  clearSession,
  bumpSessionActivity,
  isSessionDeviceValid,
  isSessionRevoked,
} from '@/lib/session-service';
import { logSecurityEvent, SecurityEventType } from '@/lib/security-service';
import {
  startIdleAutoLock,
  stopIdleAutoLock,
  onRemoteSignOut,
  broadcastSignOut,
  hardSignOut,
} from '@/lib/auth-hardening';
import { getBrowserStorage, IS_WEB } from '@/lib/demo-mode';

interface AuthContextType {
  user: FirestoreUser | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isEmailVerified: boolean;
  signInWithProvider: (provider: 'google' | 'apple' | 'microsoft') => Promise<void>; // OAuth always creates customers
  signUpWithEmail: (email: string, password: string, displayName: string, role?: UserRole) => Promise<void>; // Staff only
  signInWithEmail: (email: string, password: string) => Promise<void>; // Staff only
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  reloadUser: () => Promise<void>;
  updateUserProfile: (updates: Partial<FirestoreUser>) => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AUTH_READY_EVENT = 'cofkans:auth-ready';

declare global {
  interface Window {
    __cofkansAuthBootPending?: boolean;
  }
}

function setWebAuthBootPending(pending: boolean) {
  if (!IS_WEB || typeof window === 'undefined') return;
  window.__cofkansAuthBootPending = pending;
  window.dispatchEvent(new Event(AUTH_READY_EVENT));
}

function RealAuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<FirestoreUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const bootRegistered = useRef(false);

  if (!bootRegistered.current) {
    bootRegistered.current = true;
    setWebAuthBootPending(true);
  }

  useEffect(() => {
    if (!isLoading) setWebAuthBootPending(false);
  }, [isLoading]);

  // Initialize auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      setError(null);

      if (firebaseUser) {
        try {
          // Fetch or create Firestore user profile
          let firestoreUser = await UserService.get(firebaseUser.uid);

          // Customers use the longer customer session policy. Staff sessions
          // are handled exclusively by the canonical COFKANS_Staff app.
          const isStaff = false;
          if (isSessionExpired(isStaff)) {
            clearSession();
            try { await firebaseSignOut(auth); } catch { /* ignore */ }
            toast.error('Your session has expired. Please sign in again.');
            setFirebaseUser(null);
            setUser(null);
            setIsLoading(false);
            return;
          }

          // Session-device binding: refuse a restored session if the
          // localStorage tokens were lifted and replayed on another device.
          const deviceOk = await isSessionDeviceValid(firebaseUser.uid);
          if (!deviceOk) {
            logSecurityEvent({
              type: SecurityEventType.SUSPICIOUS_ACTIVITY,
              userId: firebaseUser.uid,
              email: firebaseUser.email || '',
              metadata: { reason: 'session_device_mismatch' },
            });
            clearSession();
            try { await firebaseSignOut(auth); } catch { /* ignore */ }
            toast.error('Sign-in blocked: device mismatch. Please sign in again.');
            setFirebaseUser(null);
            setUser(null);
            setIsLoading(false);
            return;
          }
          // Global "sign out everywhere else" — refuse sessions older than the
          // server-side revocation timestamp.
          if (await isSessionRevoked(firebaseUser.uid)) {
            clearSession();
            try { await firebaseSignOut(auth); } catch { /* ignore */ }
            toast.error('You signed out of all devices. Please sign in again.');
            setFirebaseUser(null);
            setUser(null);
            setIsLoading(false);
            return;
          }
          bumpSessionActivity();

          // Idle auto-lock for this tab: 15 min staff / 60 min customer.
          startIdleAutoLock({
            isStaff,
            onLock: async () => {
              toast('Signed out due to inactivity.', { icon: '⏱️' });
              await hardSignOut('idle');
            },
          });

          if (!firestoreUser) {
            // Create new user in Firestore
            await UserService.create(firebaseUser.uid, {
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || '',
              phoneNumber: firebaseUser.phoneNumber,
              photoURL: firebaseUser.photoURL,
              provider: getProviderFromFirebase(firebaseUser.providerData[0]?.providerId),
              emailVerified: firebaseUser.emailVerified,
              role: 'customer', // Default role
            });

            firestoreUser = await UserService.get(firebaseUser.uid);
          } else {
            // Update last login
            await UserService.updateLastLogin(firebaseUser.uid);
          }

          setFirebaseUser(firebaseUser);
          setUser(firestoreUser);

          // Initialize cart for authenticated user
          const initializeCart = useCartStore.getState().initializeCart;
          await initializeCart(firebaseUser.uid);

        } catch (error) {
          console.error('Error loading user data:', error);
          setError('Failed to load user profile');
          toast.error('Failed to load your profile');
        }
      } else {
        useCartStore.getState().resetLocalCart();
        setFirebaseUser(null);
        setUser(null);
      }

      setIsLoading(false);
    });

    // Check for redirect result (for mobile OAuth flows)
    getRedirectResult(auth).then(async result => {
      if (result?.user) {
        toast.success('Successfully signed in!');
        try {
          const { isNew } = await recordSignInSuccess(result.user.uid, result.user.email || '');
          if (isNew) toast('New device detected — we logged this sign-in for your security.', { icon: '🔐' });
        } catch (e) { console.warn('session record failed:', e); }
      }
    }).catch(error => {
      console.error('Redirect sign-in error:', error);
      handleAuthError(error);
    });

    // Cross-tab sign-out sync: if another tab signs out, mirror it here.
    const unsubBroadcast = onRemoteSignOut(async () => {
      try { await firebaseSignOut(auth); } catch { /* ignore */ }
      clearSession();
      stopIdleAutoLock();
    });

    return () => {
      unsubscribe();
      unsubBroadcast();
      stopIdleAutoLock();
    };
  }, []);

  /**
   * Sign in with OAuth provider (Google or Apple only)
   * OAuth users are ALWAYS assigned customer role
   * Staff must use email/password with company domain
   */
  const signInWithProvider = async (
    providerType: 'google' | 'apple' | 'microsoft'
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const provider = getProvider(providerType);

      // Use popup for desktop, redirect for mobile
      const isMobile = IS_WEB && typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      let result;
      if (isMobile) {
        await signInWithRedirect(auth, provider);
        return; // Auth state will be handled by redirect result
      }
      try {
        result = await signInWithPopup(auth, provider);
      } catch (popupErr: any) {
        // Popup blocked / closed by COOP / third-party-cookie restrictions →
        // fall back to redirect so the user always gets a working flow.
        const fallbackCodes = [
          'auth/popup-blocked',
          'auth/popup-closed-by-user',
          'auth/cancelled-popup-request',
          'auth/operation-not-supported-in-this-environment',
          'auth/web-storage-unsupported',
        ];
        if (fallbackCodes.includes(popupErr?.code)) {
          await signInWithRedirect(auth, provider);
          return;
        }
        throw popupErr;
      }

      const firebaseUser = result.user;

      // Check if user exists in Firestore
      let firestoreUser = await UserService.get(firebaseUser.uid);

      if (!firestoreUser) {
        // OAuth sign-ups are ALWAYS customers — no exceptions, even for developer.
        // Staff (including developer) must use email/password with company email
        // to access admin/technician/driver roles.
        const userEmail = firebaseUser.email || '';

        await UserService.create(firebaseUser.uid, {
          email: userEmail,
          displayName: firebaseUser.displayName || '',
          phoneNumber: firebaseUser.phoneNumber,
          photoURL: firebaseUser.photoURL,
          provider: providerType,
          emailVerified: firebaseUser.emailVerified,
          role: 'customer',
        });

        toast.success('Welcome to Cofkans Electricals!');
      } else {
        toast.success(`Welcome back, ${firestoreUser.displayName}!`);
      }

      try { getBrowserStorage()?.setItem('cofkans_known_device', '1'); } catch { /* ignore */ }

      try {
        const { isNew } = await recordSignInSuccess(firebaseUser.uid, firebaseUser.email || '');
        if (isNew) toast('New device detected — we logged this sign-in for your security.', { icon: '🔐' });
      } catch (e) { console.warn('session record failed:', e); }

      // OAuth providers auto-verify email, no need to send verification

    } catch (error) {
      console.error('Sign-in error:', error);
      // Use secure error handler - never reveal technical details
      const safeMessage = formatErrorForToast(error as AuthError, 'oauth_signin');
      toast.error(safeMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /** Customer email signup. Staff accounts are provisioned in COFKANS_Staff. */
  const signUpWithEmail = async (
    email: string,
    password: string,
    displayName: string,
    role?: UserRole
  ) => {
    setIsLoading(true);
    setError(null);
    void role;
    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (displayName.trim()) {
        await updateProfile(credential.user, { displayName: displayName.trim() });
      }
      await UserService.create(credential.user.uid, {
        email: credential.user.email || email.trim(),
        displayName: displayName.trim(),
        phoneNumber: credential.user.phoneNumber,
        photoURL: credential.user.photoURL,
        provider: 'password',
        emailVerified: credential.user.emailVerified,
        role: 'customer',
      });
      toast.success('Welcome to Cofkans Electricals!');
    } catch (error) {
      console.error('Customer signup error:', error);
      const safeMessage = formatErrorForToast(error as AuthError, 'email_signup');
      toast.error(safeMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Sign in with email and password
   * For staff only - requires @cofkanselectricals.com email or developer email
   * OWASP A07: Implements account lockout and rate limiting
   */
  const signInWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // OWASP A07: Check if account is locked
      const isLocked = await checkAccountLocked(email);
      if (isLocked) {
        // Generic lockout message - don't reveal exact duration
        toast.error(getUserFriendlyMessage('ACCOUNT_LOCKED'));
        setIsLoading(false);
        return;
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // OWASP A07: Clear failed login attempts on successful login
      await clearFailedLogins(email);

      // Get Firestore user
      const firestoreUser = await UserService.get(firebaseUser.uid);

      if (firestoreUser) {
        toast.success(`Welcome back, ${firestoreUser.displayName}!`);
      }

      try { getBrowserStorage()?.setItem('cofkans_known_device', '1'); } catch { /* ignore */ }

      try {
        const { isNew } = await recordSignInSuccess(firebaseUser.uid, email);
        if (isNew) toast('New device detected — we logged this sign-in for your security.', { icon: '🔐' });
      } catch (e) { console.warn('session record failed:', e); }

      // Remind about email verification if not verified
      if (!firebaseUser.emailVerified) {
        toast.error('Please verify your email address to access all features');
      }

    } catch (error) {
      console.error('Sign-in error:', error);

      // OWASP A07: Record failed login attempt
      const failedAttempt = await recordFailedLogin(email);

      // Use secure error messages - don't reveal attempt counts or timing
      if (failedAttempt.isLocked) {
        toast.error(getUserFriendlyMessage('ACCOUNT_LOCKED'));
      } else if (failedAttempt.attemptsRemaining <= 3) {
        // Don't reveal exact attempts remaining - just show generic message
        toast.error(getUserFriendlyMessage('AUTH_GENERIC'));
      } else {
        // Generic error message - don't reveal details
        const safeMessage = formatErrorForToast(error as AuthError, 'email_signin');
        toast.error(safeMessage);
      }

      // OWASP A07: Apply progressive delay (don't reveal to user)
      if (failedAttempt.delayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, failedAttempt.delayMs));
      }

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Send password reset email
   * OWASP A07: Implements rate limiting for password reset
   */
  const resetPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Note: Rate limiting requires userId, which we don't have for password reset
      // In production, implement IP-based rate limiting via Cloud Functions
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent! Please check your inbox.');
    } catch (error) {
      console.error('Password reset error:', error);
      // Generic message - don't reveal if email exists
      const safeMessage = formatErrorForToast(error as AuthError, 'password_reset');
      toast.error(safeMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Sign out user
   */
  const signOut = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const uid = auth.currentUser?.uid;
      const email = auth.currentUser?.email || '';
      // Drop in-memory + persisted local cart so the next account on this
      // device never briefly sees the previous customer's items.
      useCartStore.getState().resetLocalCart();
      await firebaseSignOut(auth);
      clearSession();
      stopIdleAutoLock();
      broadcastSignOut();
      if (uid) {
        logSecurityEvent({ type: SecurityEventType.LOGIN_SUCCESS, userId: uid, email, metadata: { action: 'signout' } });
      }
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign-out error:', error);
      setError('Failed to sign out');
      toast.error('Failed to sign out');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Send email verification
   */
  const sendVerificationEmail = async () => {
    if (!firebaseUser) {
      toast.error('No user signed in');
      return;
    }

    if (firebaseUser.emailVerified) {
      toast.success('Email already verified!');
      return;
    }

    try {
      await sendEmailVerification(firebaseUser);
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error) {
      console.error('Email verification error:', error);
      toast.error('Failed to send verification email');
      throw error;
    }
  };

  /**
   * Reload user data (useful after email verification)
   */
  const reloadUser = async () => {
    if (!firebaseUser) return;

    try {
      await firebaseUser.reload();
      const updatedFirebaseUser = auth.currentUser;

      if (updatedFirebaseUser) {
        setFirebaseUser(updatedFirebaseUser);

        // Update Firestore user
        const firestoreUser = await UserService.get(updatedFirebaseUser.uid);
        setUser(firestoreUser);

        if (updatedFirebaseUser.emailVerified) {
          toast.success('Email verified successfully!');
        }
      }
    } catch (error) {
      console.error('Failed to reload user:', error);
      toast.error('Failed to refresh user data');
    }
  };

  /**
   * Update user profile in Firestore
   */
  const updateUserProfile = async (updates: Partial<FirestoreUser>) => {
    if (!user) {
      toast.error('No user signed in');
      return;
    }

    try {
      await UserService.update(user.uid, updates);

      // Refresh user data
      const updatedUser = await UserService.get(user.uid);
      setUser(updatedUser);

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
      throw error;
    }
  };

  /**
   * Check if user has specific role
   */
  const hasRole = (role: UserRole): boolean => {
    if (!user) return false;
    return user.role === role || user.role === 'admin';
  };

  const contextValue: AuthContextType = {
    user,
    firebaseUser,
    isAuthenticated: !!firebaseUser && !!user,
    isLoading,
    isEmailVerified: firebaseUser?.emailVerified || false,
    signInWithProvider,
    signUpWithEmail,
    signInWithEmail,
    resetPassword,
    signOut,
    sendVerificationEmail,
    reloadUser,
    updateUserProfile,
    hasRole,
    error,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

// ===== HELPER FUNCTIONS =====

function getProvider(providerType: 'google' | 'apple' | 'microsoft') {
  switch (providerType) {
    case 'google':
      return googleProvider;
    case 'apple':
      return appleProvider;
    case 'microsoft':
      return microsoftProvider;
    default:
      throw new Error(`Unknown provider: ${providerType}`);
  }
}

function getProviderFromFirebase(providerId: string | undefined): 'google' | 'apple' | 'microsoft' | 'email' | 'phone' {
  if (providerId?.includes('google')) return 'google';
  if (providerId?.includes('apple')) return 'apple';
  if (providerId?.includes('microsoft')) return 'microsoft';
  if (providerId?.includes('phone')) return 'phone';
  return 'email';
}

// Old handleAuthError function removed - now using secure error handler
// from /src/lib/error-handler.ts to prevent information disclosure

// ===== CUSTOM HOOK =====

function useRealAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useFirebaseAuth must be used within FirebaseAuthProvider');
  }
  return context;
}

// The customer app always uses the live Firebase provider. Demo/mock auth is
// not part of the customer production bundle; staff gets its own entrypoint.
export const FirebaseAuthProvider = RealAuthProvider;
export const useFirebaseAuth = useRealAuth;

// Export as default for backwards compatibility
export const useAuth = useFirebaseAuth;
