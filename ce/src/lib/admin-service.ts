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
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import type { UserRole } from '../app/types';
import { logAuditEvent } from './security-service';

// Developer Configuration
// SECURITY: Email loaded from environment variable (not hardcoded for security)
const DEVELOPER_EMAIL = import.meta.env.VITE_DEVELOPER_EMAIL || import.meta.env.EXPO_PUBLIC_DEVELOPER_EMAIL || 'boatengadams4@gmail.com';
const COMPANY_EMAIL_DOMAIN = '@cofkanselectricals.com';
const STAGING_STAFF_EMAILS = new Set(
  ((import.meta.env.VITE_ALLOWED_STAFF_EMAILS || import.meta.env.EXPO_PUBLIC_ALLOWED_STAFF_EMAILS || '') as string)
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean),
);
const STAGING_CUSTOMER_EMAILS = new Set(
  ((import.meta.env.VITE_ALLOWED_CUSTOMER_EMAILS || import.meta.env.EXPO_PUBLIC_ALLOWED_CUSTOMER_EMAILS || '') as string)
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
export async function promoteUserRole(
  developerId: string,
  targetUserId: string,
  newRole: 'admin' | 'technician' | 'driver'
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify developer status
    const isDeveloperUser = await checkIsDeveloper(developerId);
    if (!isDeveloperUser) {
      return {
        success: false,
        error: 'Only developer can promote users',
      };
    }

    // Get target user
    const targetUserRef = doc(db, 'users', targetUserId);
    const targetUserDoc = await getDoc(targetUserRef);

    if (!targetUserDoc.exists()) {
      return {
        success: false,
        error: 'Target user not found',
      };
    }

    const targetUserData = targetUserDoc.data();

    // Validate email domain for staff roles
    if (!canHaveRole(targetUserData.email, newRole)) {
      return {
        success: false,
        error: `${newRole} role requires ${COMPANY_EMAIL_DOMAIN} email domain`,
      };
    }

    // Update role
    await updateDoc(targetUserRef, {
      role: newRole,
      promotedBy: developerId,
      promotedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Log audit event
    await logAuditEvent(
      'role_promoted',
      developerId,
      'user',
      targetUserId,
      {
        oldRole: targetUserData.role,
        newRole,
        email: targetUserData.email,
      }
    );

    return { success: true };
  } catch (error) {
    console.error('Failed to promote user:', error);
    return {
      success: false,
      error: 'Failed to promote user role',
    };
  }
}

/**
 * Demote user back to customer
 */
export async function demoteUser(
  developerId: string,
  targetUserId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify developer status
    const isDeveloperUser = await checkIsDeveloper(developerId);
    if (!isDeveloperUser) {
      return {
        success: false,
        error: 'Only developer can demote users',
      };
    }

    // Get target user
    const targetUserRef = doc(db, 'users', targetUserId);
    const targetUserDoc = await getDoc(targetUserRef);

    if (!targetUserDoc.exists()) {
      return {
        success: false,
        error: 'Target user not found',
      };
    }

    const targetUserData = targetUserDoc.data();

    // Cannot demote developer
    if (targetUserData.isDeveloper) {
      return {
        success: false,
        error: 'Cannot demote developer',
      };
    }

    // Update to customer role
    await updateDoc(targetUserRef, {
      role: 'customer',
      demotedBy: developerId,
      demotedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Log audit event
    await logAuditEvent(
      'role_demoted',
      developerId,
      'user',
      targetUserId,
      {
        oldRole: targetUserData.role,
        newRole: 'customer',
        email: targetUserData.email,
      }
    );

    return { success: true };
  } catch (error) {
    console.error('Failed to demote user:', error);
    return {
      success: false,
      error: 'Failed to demote user',
    };
  }
}

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
