/**
 * OWASP Security Service
 * Implements A07 (Authentication Failures) and A09 (Logging & Monitoring)
 *
 * Features:
 * - Failed login attempt tracking
 * - Account lockout after 10 failed attempts
 * - Progressive delays (exponential backoff)
 * - Rate limiting for sensitive operations
 * - Security event logging
 */

import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

// ===== RATE LIMITING CONFIGURATION =====
const RATE_LIMITS = {
  LOGIN_ATTEMPTS: {
    MAX_ATTEMPTS: 10,
    LOCKOUT_DURATION_MS: 15 * 60 * 1000, // 15 minutes
    PROGRESSIVE_DELAYS: [0, 1000, 2000, 4000, 8000, 16000, 32000, 60000], // Progressive delays in ms
  },
  CART_UPDATES: {
    MAX_PER_MINUTE: 10,
    WINDOW_MS: 60 * 1000,
  },
  ORDER_CREATION: {
    MAX_PER_HOUR: 5,
    WINDOW_MS: 60 * 60 * 1000,
  },
  PASSWORD_RESET: {
    MAX_PER_HOUR: 3,
    WINDOW_MS: 60 * 60 * 1000,
  },
};

// ===== SECURITY EVENT TYPES =====
export enum SecurityEventType {
  LOGIN_FAILED = 'login_failed',
  LOGIN_SUCCESS = 'login_success',
  ACCOUNT_LOCKED = 'account_locked',
  ACCOUNT_UNLOCKED = 'account_unlocked',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  INVALID_INPUT = 'invalid_input',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  PRICE_MANIPULATION_ATTEMPT = 'price_manipulation_attempt',
  XSS_ATTEMPT = 'xss_attempt',
}

interface SecurityEvent {
  type: SecurityEventType;
  userId?: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  timestamp: Timestamp;
}

interface FailedLoginAttempt {
  email: string;
  attempts: number;
  lastAttemptAt: Timestamp;
  lockedUntil?: Timestamp;
  ipAddresses: string[];
}

interface RateLimitTracker {
  userId: string;
  operation: string;
  count: number;
  windowStart: Timestamp;
}

// ===== SECURITY EVENT LOGGING =====

export async function logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>) {
  try {
    await addDoc(collection(db, 'securityEvents'), {
      ...event,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
    // Don't throw - logging failures shouldn't break the app
  }
}

// ===== FAILED LOGIN TRACKING =====

export async function recordFailedLogin(email: string, ipAddress?: string): Promise<{
  isLocked: boolean;
  attemptsRemaining: number;
  lockedUntil?: Date;
  delayMs: number;
}> {
  const trackerId = `login_${email.toLowerCase()}`;
  const trackerRef = doc(db, 'loginAttempts', trackerId);

  try {
    const trackerDoc = await getDoc(trackerRef);
    const now = new Date();

    if (trackerDoc.exists()) {
      const data = trackerDoc.data() as FailedLoginAttempt;

      // Check if account is currently locked
      if (data.lockedUntil && data.lockedUntil.toDate() > now) {
        await logSecurityEvent({
          type: SecurityEventType.ACCOUNT_LOCKED,
          email,
          ipAddress,
          metadata: {
            attempts: data.attempts,
            lockedUntil: data.lockedUntil.toDate(),
          },
        });

        return {
          isLocked: true,
          attemptsRemaining: 0,
          lockedUntil: data.lockedUntil.toDate(),
          delayMs: 0,
        };
      }

      // Increment failed attempts
      const newAttempts = data.attempts + 1;
      const ipAddresses = [...new Set([...data.ipAddresses, ipAddress || 'unknown'])];

      // Check if we should lock the account
      if (newAttempts >= RATE_LIMITS.LOGIN_ATTEMPTS.MAX_ATTEMPTS) {
        const lockedUntil = new Date(now.getTime() + RATE_LIMITS.LOGIN_ATTEMPTS.LOCKOUT_DURATION_MS);

        await updateDoc(trackerRef, {
          attempts: newAttempts,
          lastAttemptAt: serverTimestamp(),
          lockedUntil: Timestamp.fromDate(lockedUntil),
          ipAddresses,
        });

        await logSecurityEvent({
          type: SecurityEventType.ACCOUNT_LOCKED,
          email,
          ipAddress,
          metadata: {
            attempts: newAttempts,
            lockedUntil,
          },
        });

        return {
          isLocked: true,
          attemptsRemaining: 0,
          lockedUntil,
          delayMs: 0,
        };
      }

      // Update attempts
      await updateDoc(trackerRef, {
        attempts: newAttempts,
        lastAttemptAt: serverTimestamp(),
        ipAddresses,
      });

      // Calculate progressive delay
      const delayIndex = Math.min(newAttempts - 1, RATE_LIMITS.LOGIN_ATTEMPTS.PROGRESSIVE_DELAYS.length - 1);
      const delayMs = RATE_LIMITS.LOGIN_ATTEMPTS.PROGRESSIVE_DELAYS[delayIndex];

      await logSecurityEvent({
        type: SecurityEventType.LOGIN_FAILED,
        email,
        ipAddress,
        metadata: {
          attempts: newAttempts,
          delayMs,
        },
      });

      return {
        isLocked: false,
        attemptsRemaining: RATE_LIMITS.LOGIN_ATTEMPTS.MAX_ATTEMPTS - newAttempts,
        delayMs,
      };
    } else {
      // First failed attempt
      await setDoc(trackerRef, {
        email: email.toLowerCase(),
        attempts: 1,
        lastAttemptAt: serverTimestamp(),
        ipAddresses: [ipAddress || 'unknown'],
      });

      await logSecurityEvent({
        type: SecurityEventType.LOGIN_FAILED,
        email,
        ipAddress,
        metadata: { attempts: 1 },
      });

      return {
        isLocked: false,
        attemptsRemaining: RATE_LIMITS.LOGIN_ATTEMPTS.MAX_ATTEMPTS - 1,
        delayMs: 0,
      };
    }
  } catch (error) {
    console.error('Failed to record login attempt:', error);
    // In case of error, allow the login attempt
    return {
      isLocked: false,
      attemptsRemaining: 10,
      delayMs: 0,
    };
  }
}

export async function clearFailedLogins(email: string) {
  const trackerId = `login_${email.toLowerCase()}`;
  const trackerRef = doc(db, 'loginAttempts', trackerId);

  try {
    await updateDoc(trackerRef, {
      attempts: 0,
      lockedUntil: null,
    });

    await logSecurityEvent({
      type: SecurityEventType.LOGIN_SUCCESS,
      email,
    });
  } catch (error) {
    console.error('Failed to clear login attempts:', error);
  }
}

export async function checkAccountLocked(email: string): Promise<boolean> {
  const trackerId = `login_${email.toLowerCase()}`;
  const trackerRef = doc(db, 'loginAttempts', trackerId);

  try {
    const trackerDoc = await getDoc(trackerRef);

    if (trackerDoc.exists()) {
      const data = trackerDoc.data() as FailedLoginAttempt;
      const now = new Date();

      if (data.lockedUntil && data.lockedUntil.toDate() > now) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Failed to check account lock status:', error);
    return false;
  }
}

// ===== RATE LIMITING =====

export async function checkRateLimit(
  userId: string,
  operation: 'cart_update' | 'order_creation' | 'password_reset'
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const trackerId = `ratelimit_${operation}_${userId}`;
  const trackerRef = doc(db, 'rateLimits', trackerId);

  try {
    const trackerDoc = await getDoc(trackerRef);
    const now = new Date();

    const config = {
      cart_update: RATE_LIMITS.CART_UPDATES,
      order_creation: RATE_LIMITS.ORDER_CREATION,
      password_reset: RATE_LIMITS.PASSWORD_RESET,
    }[operation];

    if (trackerDoc.exists()) {
      const data = trackerDoc.data() as RateLimitTracker;
      const windowStart = data.windowStart.toDate();
      const windowEnd = new Date(windowStart.getTime() + config.WINDOW_MS);

      // Check if we're still in the same window
      if (now < windowEnd) {
        // Check if limit exceeded
        const maxCount = operation === 'cart_update' ? config.MAX_PER_MINUTE : config.MAX_PER_HOUR;

        if (data.count >= maxCount) {
          const retryAfter = Math.ceil((windowEnd.getTime() - now.getTime()) / 1000);

          await logSecurityEvent({
            type: SecurityEventType.RATE_LIMIT_EXCEEDED,
            userId,
            metadata: {
              operation,
              count: data.count,
              limit: maxCount,
              retryAfter,
            },
          });

          return { allowed: false, retryAfter };
        }

        // Increment count
        await updateDoc(trackerRef, {
          count: data.count + 1,
        });

        return { allowed: true };
      } else {
        // Start new window
        await setDoc(trackerRef, {
          userId,
          operation,
          count: 1,
          windowStart: serverTimestamp(),
        });

        return { allowed: true };
      }
    } else {
      // First request
      await setDoc(trackerRef, {
        userId,
        operation,
        count: 1,
        windowStart: serverTimestamp(),
      });

      return { allowed: true };
    }
  } catch (error) {
    console.error('Failed to check rate limit:', error);
    // In case of error, allow the operation
    return { allowed: true };
  }
}

// ===== INPUT VALIDATION & XSS PROTECTION (OWASP A03) =====

export function sanitizeInput(input: string, maxLength: number = 1000): string {
  if (!input) return '';

  // Remove potential XSS patterns
  let sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframes
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove inline event handlers
    .trim();

  // Truncate to max length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
}

export function validatePhoneNumber(phone: string): boolean {
  // E.164 format validation
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
}

export function detectXSSAttempt(input: string): boolean {
  const xssPatterns = [
    /<script/i,
    /<iframe/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<embed/i,
    /<object/i,
    /eval\(/i,
    /expression\(/i,
  ];

  return xssPatterns.some((pattern) => pattern.test(input));
}

// ===== PRICE VALIDATION (OWASP A08) =====

export function validatePrice(price: number): boolean {
  return typeof price === 'number' && price > 0 && price <= 1000000 && !isNaN(price);
}

export function validateQuantity(quantity: number): boolean {
  return Number.isInteger(quantity) && quantity > 0 && quantity <= 99;
}

export function validateCartTotal(total: number): boolean {
  return typeof total === 'number' && total >= 0 && total <= 10000000 && !isNaN(total);
}

export async function logPriceManipulationAttempt(
  userId: string,
  productId: string,
  expectedPrice: number,
  receivedPrice: number
) {
  await logSecurityEvent({
    type: SecurityEventType.PRICE_MANIPULATION_ATTEMPT,
    userId,
    metadata: {
      productId,
      expectedPrice,
      receivedPrice,
      difference: receivedPrice - expectedPrice,
    },
  });
}

// ===== AUDIT LOGGING (OWASP A09) =====

export async function logAuditEvent(
  action: string,
  userId: string,
  resourceType: string,
  resourceId: string,
  changes?: Record<string, any>
) {
  // Skip audit logging entirely while the backend is paused.
  // Avoids both 'Could not reach Firestore' warnings and undefined-field crashes.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { DEMO_MODE } = await import('./demo-mode');
  if (DEMO_MODE) return;

  const stripUndefined = (obj: unknown): unknown => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(stripUndefined);
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, stripUndefined(v)]),
    );
  };

  try {
    await addDoc(collection(db, 'auditLogs'), {
      action,
      userId: userId ?? 'anonymous',
      resourceType,
      resourceId: resourceId ?? '',
      ...(changes ? { changes: stripUndefined(changes) } : {}),
      timestamp: serverTimestamp(),
      userAgent: navigator.userAgent,
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}
