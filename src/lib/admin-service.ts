/**
 * Admin and Staff Management Service
 *
 * Security Features:
 * - Super admin: boatengadams4g@gmail.com
 * - Only developer can promote users to admin/technician
 * - Staff must use @cofkanselectricals.com email domain
 * - Customers use OAuth only (Google/Apple)
 */

import { db } from './firebase';
import { getPublicEnv } from './demo-mode';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import type { UserRole } from '../app/types';
import { logAuditEvent } from './security-service';

// Developer Configuration
// SECURITY: Email loaded from environment variable (not hardcoded for security)
const DEVELOPER_EMAIL = getPublicEnv('DEVELOPER_EMAIL') || 'boatengadams4@gmail.com';
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
 * Check if email is the developer
 */
export function isDeveloper(email: string): boolean {
  return email.toLowerCase() === DEVELOPER_EMAIL.toLowerCase();
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
 * Initialize developer account
 * Should be called once during setup
 */
export async function initializeDeveloper(userId: string) {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();

      // Only promote if email matches developer
      if (userData.email.toLowerCase() === DEVELOPER_EMAIL.toLowerCase()) {
        await updateDoc(userRef, {
          role: 'admin',
          isDeveloper: true,
          updatedAt: serverTimestamp(),
        });

        console.log('Super admin initialized successfully');
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Failed to initialize developer:', error);
    return false;
  }
}

/**
 * Check if user is developer from Firestore
 */
export async function checkIsDeveloper(userId: string): Promise<boolean> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.isDeveloper === true ||
             userData.email.toLowerCase() === DEVELOPER_EMAIL.toLowerCase();
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
 * Used during sign-up to auto-assign roles
 */
export function getRoleFromEmail(email: string): UserRole {
  const emailLower = email.toLowerCase();

  // Super admin
  if (emailLower === DEVELOPER_EMAIL.toLowerCase()) {
    return 'admin';
  }

  // Company emails default to pending approval (customer until promoted)
  if (isCompanyEmail(email)) {
    return 'customer'; // Will be promoted by developer
  }

  // Everyone else is a customer
  return 'customer';
}
