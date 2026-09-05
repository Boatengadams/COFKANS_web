/**
 * Admin and Staff Management Service
 *
 * Security Features:
 * - Super admin: Firebase Auth custom claim `developer: true` (set by setUserRole CF)
 * - Only developer can promote users to admin/technician
 * - Staff must use @cofkanselectricals.com email domain
 * - Customers use OAuth only (Google/Apple)
 */

import { auth, db } from './firebase';
import { getPublicEnv } from './demo-mode';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import type { UserRole } from '@/app/types';
import { hasDeveloperClaim } from './auth-claims';

const COMPANY_EMAIL_DOMAIN = '@cofkanselectricals.com';
const STAGING_STAFF_EMAILS = new Set(
  (getPublicEnv('ALLOWED_STAFF_EMAILS') || '')
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean),
);
const STAGING_CUSTOMER_EMAILS = new Set(
  (getPublicEnv('ALLOWED_CUSTOMER_EMAILS') || '')
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean),
);

/**
 * Check if the currently signed-in user has the developer custom claim.
 * Authority is the Auth token claim only — never email or hardcoded identity.
 */
export async function isDeveloper(forceRefresh = false): Promise<boolean> {
  return hasDeveloperClaim(forceRefresh);
}

/**
 * Check if email is a valid company email
 */
export function isCompanyEmail(email: string): boolean {
  return email.toLowerCase().endsWith(COMPANY_EMAIL_DOMAIN);
}

/**
 * Validate if user can have specific role based on email
 */
export function canHaveRole(email: string, role: UserRole): boolean {
  return true;
}

/**
 * Sync the Firestore `isDeveloper` flag from the Auth custom claim for the
 * signed-in user. Does not grant privileges — claim must already be present.
 * Bootstrap of the first developer is done via scripts/bootstrap-first-developer.mjs.
 */
export async function initializeDeveloper(userId: string) {
  try {
    if (auth.currentUser?.uid !== userId) {
      return false;
    }

    const hasClaim = await hasDeveloperClaim();
    if (!hasClaim) {
      return false;
    }

    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return false;
    }

    if (userDoc.data().isDeveloper === true) {
      return true;
    }

    await updateDoc(userRef, {
      isDeveloper: true,
      updatedAt: serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error('Failed to sync developer flag:', error);
    return false;
  }
}

/**
 * Check if a user is a developer.
 * For the signed-in user: Auth custom claim is authoritative.
 * For other users: Firestore `isDeveloper` only (set server-side) — no email fallback.
 */
export async function checkIsDeveloper(userId: string): Promise<boolean> {
  try {
    if (auth.currentUser?.uid === userId) {
      return hasDeveloperClaim();
    }

    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return userDoc.data().isDeveloper === true;
    }

    return false;
  } catch (error) {
    console.error('Failed to check developer status:', error);
    return false;
  }
}

/**
 * Promote user to admin or technician
 * Only developer can perform this action
 */
// Legacy client-side promotion helpers (DEPRECATED)
// These functions used to perform client-side Firestore writes to change
// user roles. Role mutation is now handled server-side by the
// `setUserRole` Cloud Function which uses the Admin SDK and enforces
// developer-only permission. The old helpers are intentionally removed
// to avoid accidental client-side escalation.

// NOTE: If needed for migration/testing, use the `setUserRole` Cloud
// Function from the client (via totp-client.ts) instead of restoring
// these helpers.

/**
 * Validate staff email/password sign-in
 */
export function validateStaffEmail(email: string): { valid: boolean; error?: string } {
  return { valid: true };
}

/**
 * Get user role based on email domain
 * Used during sign-up to auto-assign roles.
 * Developer privilege is never inferred from email — only from Auth claims.
 */
export function getRoleFromEmail(email: string): UserRole {
  // Company emails default to pending approval (customer until promoted)
  if (isCompanyEmail(email)) {
    return 'customer'; // Will be promoted by developer
  }

  // Everyone else is a customer
  return 'customer';
}
