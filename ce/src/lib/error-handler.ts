/**
 * OWASP A09: Security Logging and Monitoring
 * Secure Error Handler
 *
 * Features:
 * - User-friendly error messages
 * - No technical details exposed
 * - No system information leaked
 * - Consistent error responses
 * - Server-side detailed logging
 */

import { AuthError } from 'firebase/auth';
import { FirestoreError } from 'firebase/firestore';
import { logSecurityEvent, SecurityEventType } from './security-service';

// User-friendly error messages (safe for display)
const USER_FRIENDLY_ERRORS = {
  // Authentication Errors
  AUTH_GENERIC: 'Unable to sign in. Please check your credentials and try again.',
  AUTH_NETWORK: 'Connection issue. Please check your internet and try again.',
  AUTH_TIMEOUT: 'Request timed out. Please try again.',
  AUTH_ACCOUNT_ISSUE: 'There was an issue with your account. Please contact support if this persists.',

  // Account Status
  ACCOUNT_LOCKED: 'Your account has been temporarily locked for security reasons. Please try again later.',
  ACCOUNT_DISABLED: 'This account is currently unavailable. Please contact support for assistance.',

  // Input Validation
  INVALID_INPUT: 'Please check your information and try again.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PASSWORD: 'Password does not meet requirements. Please try again.',

  // Rate Limiting
  TOO_MANY_REQUESTS: 'Too many attempts. Please wait a moment and try again.',

  // Payment Errors
  PAYMENT_FAILED: 'Payment could not be processed. Please try again or use a different payment method.',
  PAYMENT_DECLINED: 'Payment was declined. Please check your payment details.',

  // Cart/Order Errors
  CART_ERROR: 'Unable to update your cart. Please refresh and try again.',
  ORDER_ERROR: 'Unable to place your order. Please try again.',
  INVENTORY_ERROR: 'Some items may no longer be available. Please review your cart.',

  // General Errors
  GENERAL_ERROR: 'Something went wrong. Please try again.',
  TEMPORARY_ERROR: 'We\'re experiencing temporary issues. Please try again shortly.',
  MAINTENANCE: 'The system is currently undergoing maintenance. Please check back soon.',

  // Success Messages (safe to show)
  SUCCESS_GENERIC: 'Success!',
  SUCCESS_UPDATED: 'Updated successfully.',
  SUCCESS_CREATED: 'Created successfully.',
  SUCCESS_DELETED: 'Deleted successfully.',
};

// Error categories for logging (internal only)
export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  NETWORK = 'network',
  DATABASE = 'database',
  PAYMENT = 'payment',
  RATE_LIMIT = 'rate_limit',
  UNKNOWN = 'unknown',
}

interface SecureErrorResponse {
  userMessage: string; // Safe message to display to user
  shouldLog: boolean; // Whether to log this error
  category: ErrorCategory;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Handle Firebase Authentication errors securely
 */
export function handleAuthError(error: AuthError, context?: string): SecureErrorResponse {
  const errorCode = error.code;

  // Log all auth errors for security monitoring
  let response: SecureErrorResponse;

  switch (errorCode) {
    // Network errors - safe to show
    case 'auth/network-request-failed':
      response = {
        userMessage: USER_FRIENDLY_ERRORS.AUTH_NETWORK,
        shouldLog: false,
        category: ErrorCategory.NETWORK,
        severity: 'low',
      };
      break;

    // Invalid credentials - DON'T reveal which part is wrong
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-email':
      response = {
        userMessage: USER_FRIENDLY_ERRORS.AUTH_GENERIC,
        shouldLog: true,
        category: ErrorCategory.AUTHENTICATION,
        severity: 'medium',
      };
      break;

    // Account status - generic message
    case 'auth/user-disabled':
      response = {
        userMessage: USER_FRIENDLY_ERRORS.ACCOUNT_DISABLED,
        shouldLog: true,
        category: ErrorCategory.AUTHORIZATION,
        severity: 'high',
      };
      break;

    // Rate limiting - don't reveal details
    case 'auth/too-many-requests':
      response = {
        userMessage: USER_FRIENDLY_ERRORS.TOO_MANY_REQUESTS,
        shouldLog: true,
        category: ErrorCategory.RATE_LIMIT,
        severity: 'medium',
      };
      break;

    // Popup/redirect issues - user action needed
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      response = {
        userMessage: 'Sign-in was cancelled. Please try again if you wish to continue.',
        shouldLog: false,
        category: ErrorCategory.AUTHENTICATION,
        severity: 'low',
      };
      break;

    case 'auth/popup-blocked':
      response = {
        userMessage: 'Pop-up was blocked by your browser. Please allow pop-ups and try again.',
        shouldLog: false,
        category: ErrorCategory.AUTHENTICATION,
        severity: 'low',
      };
      break;

    // Email already in use - DON'T confirm email exists
    case 'auth/email-already-in-use':
      response = {
        userMessage: USER_FRIENDLY_ERRORS.AUTH_GENERIC,
        shouldLog: true,
        category: ErrorCategory.AUTHENTICATION,
        severity: 'medium',
      };
      break;

    // Account exists with different credential - DON'T reveal details
    case 'auth/account-exists-with-different-credential':
      response = {
        userMessage: USER_FRIENDLY_ERRORS.AUTH_ACCOUNT_ISSUE,
        shouldLog: true,
        category: ErrorCategory.AUTHENTICATION,
        severity: 'medium',
      };
      break;

    // Weak password - safe to show (helps user)
    case 'auth/weak-password':
      response = {
        userMessage: USER_FRIENDLY_ERRORS.INVALID_PASSWORD,
        shouldLog: false,
        category: ErrorCategory.VALIDATION,
        severity: 'low',
      };
      break;

    // Operation not allowed - don't reveal configuration
    case 'auth/operation-not-allowed':
      response = {
        userMessage: USER_FRIENDLY_ERRORS.TEMPORARY_ERROR,
        shouldLog: true,
        category: ErrorCategory.AUTHORIZATION,
        severity: 'high',
      };
      break;

    // Default fallback
    default:
      response = {
        userMessage: USER_FRIENDLY_ERRORS.AUTH_GENERIC,
        shouldLog: true,
        category: ErrorCategory.UNKNOWN,
        severity: 'medium',
      };
  }

  // Log security-relevant errors
  if (response.shouldLog) {
    logSecurityErrorDetails(error, context, response);
  }

  return response;
}

/**
 * Handle Firestore errors securely
 */
export function handleFirestoreError(error: FirestoreError, context?: string): SecureErrorResponse {
  const errorCode = error.code;

  let response: SecureErrorResponse;

  switch (errorCode) {
    // Permission denied - don't reveal rules structure
    case 'permission-denied':
      response = {
        userMessage: 'You don\'t have permission to perform this action.',
        shouldLog: true,
        category: ErrorCategory.AUTHORIZATION,
        severity: 'high',
      };
      break;

    // Not found - don't confirm existence
    case 'not-found':
      response = {
        userMessage: USER_FRIENDLY_ERRORS.GENERAL_ERROR,
        shouldLog: false,
        category: ErrorCategory.DATABASE,
        severity: 'low',
      };
      break;

    // Already exists - don't confirm
    case 'already-exists':
      response = {
        userMessage: USER_FRIENDLY_ERRORS.GENERAL_ERROR,
        shouldLog: true,
        category: ErrorCategory.DATABASE,
        severity: 'low',
      };
      break;

    // Resource exhausted - rate limiting
    case 'resource-exhausted':
      response = {
        userMessage: USER_FRIENDLY_ERRORS.TOO_MANY_REQUESTS,
        shouldLog: true,
        category: ErrorCategory.RATE_LIMIT,
        severity: 'medium',
      };
      break;

    // Network errors
    case 'unavailable':
    case 'deadline-exceeded':
      response = {
        userMessage: USER_FRIENDLY_ERRORS.AUTH_NETWORK,
        shouldLog: false,
        category: ErrorCategory.NETWORK,
        severity: 'low',
      };
      break;

    // Invalid argument - validation error
    case 'invalid-argument':
      response = {
        userMessage: USER_FRIENDLY_ERRORS.INVALID_INPUT,
        shouldLog: true,
        category: ErrorCategory.VALIDATION,
        severity: 'low',
      };
      break;

    // Default
    default:
      response = {
        userMessage: USER_FRIENDLY_ERRORS.GENERAL_ERROR,
        shouldLog: true,
        category: ErrorCategory.UNKNOWN,
        severity: 'medium',
      };
  }

  // Log database errors for monitoring
  if (response.shouldLog) {
    logSecurityErrorDetails(error, context, response);
  }

  return response;
}

/**
 * Handle generic errors securely
 */
export function handleGenericError(error: Error, context?: string): SecureErrorResponse {
  // Never show stack traces or technical details to users
  const response: SecureErrorResponse = {
    userMessage: USER_FRIENDLY_ERRORS.GENERAL_ERROR,
    shouldLog: true,
    category: ErrorCategory.UNKNOWN,
    severity: 'medium',
  };

  // Log for developers/admins only
  logSecurityErrorDetails(error, context, response);

  return response;
}

/**
 * Handle validation errors
 */
export function handleValidationError(field: string, message?: string): SecureErrorResponse {
  // Safe validation messages (don't reveal system internals)
  const safeMessages: Record<string, string> = {
    email: USER_FRIENDLY_ERRORS.INVALID_EMAIL,
    password: USER_FRIENDLY_ERRORS.INVALID_PASSWORD,
    phone: 'Please enter a valid phone number.',
    address: 'Please check your address information.',
    card: 'Please check your payment information.',
    default: USER_FRIENDLY_ERRORS.INVALID_INPUT,
  };

  return {
    userMessage: safeMessages[field] || safeMessages.default,
    shouldLog: false,
    category: ErrorCategory.VALIDATION,
    severity: 'low',
  };
}

/**
 * Handle payment errors
 */
export function handlePaymentError(errorCode: string, context?: string): SecureErrorResponse {
  // Don't reveal payment provider details or error codes
  let response: SecureErrorResponse;

  // Generic categorization
  const isDeclined = errorCode.includes('decline') || errorCode.includes('insufficient');
  const isInvalid = errorCode.includes('invalid') || errorCode.includes('incorrect');

  if (isDeclined) {
    response = {
      userMessage: USER_FRIENDLY_ERRORS.PAYMENT_DECLINED,
      shouldLog: true,
      category: ErrorCategory.PAYMENT,
      severity: 'low',
    };
  } else if (isInvalid) {
    response = {
      userMessage: 'Please check your payment information and try again.',
      shouldLog: false,
      category: ErrorCategory.PAYMENT,
      severity: 'low',
    };
  } else {
    response = {
      userMessage: USER_FRIENDLY_ERRORS.PAYMENT_FAILED,
      shouldLog: true,
      category: ErrorCategory.PAYMENT,
      severity: 'medium',
    };
  }

  if (response.shouldLog) {
    console.error('[PAYMENT ERROR]', {
      code: errorCode,
      context,
      timestamp: new Date().toISOString(),
    });
  }

  return response;
}

/**
 * Log error details securely (server-side only)
 */
async function logSecurityErrorDetails(
  error: Error | AuthError | FirestoreError,
  context: string | undefined,
  response: SecureErrorResponse
) {
  // Console log for developers (not shown to users)
  console.error('[SECURE ERROR HANDLER]', {
    context,
    category: response.category,
    severity: response.severity,
    errorType: error.constructor.name,
    // Only log error code, not full message
    errorCode: 'code' in error ? error.code : 'N/A',
    timestamp: new Date().toISOString(),
    // NEVER log: stack traces, user data, credentials, tokens
  });

  // Log to security events if critical
  if (response.severity === 'critical' || response.severity === 'high') {
    try {
      await logSecurityEvent({
        type: SecurityEventType.SUSPICIOUS_ACTIVITY,
        metadata: {
          category: response.category,
          severity: response.severity,
          context,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (logError) {
      // Fail silently - don't block user flow due to logging failure
      console.error('[LOGGING ERROR]', logError);
    }
  }
}

/**
 * Sanitize error messages before display
 */
export function sanitizeErrorMessage(message: string): string {
  // Remove any technical details that might slip through
  const sanitized = message
    .replace(/firebase/gi, 'system')
    .replace(/firestore/gi, 'database')
    .replace(/auth\//gi, '')
    .replace(/\[.*?\]/g, '') // Remove bracketed codes
    .replace(/Error:/gi, '')
    .replace(/Exception:/gi, '')
    .replace(/\b\d{3,}\b/g, '') // Remove error codes
    .trim();

  // If sanitization removed too much, return generic message
  return sanitized.length > 10 ? sanitized : USER_FRIENDLY_ERRORS.GENERAL_ERROR;
}

/**
 * Check if error should trigger security alert
 */
export function shouldTriggerSecurityAlert(
  errorCode: string,
  attemptCount: number = 1
): boolean {
  // Patterns that indicate potential attacks
  const suspiciousPatterns = [
    'permission-denied',
    'invalid-credential',
    'user-not-found',
    'too-many-requests',
  ];

  // Alert if multiple suspicious errors
  return suspiciousPatterns.some(pattern => errorCode.includes(pattern)) && attemptCount >= 3;
}

/**
 * Get user-friendly message for common scenarios
 */
export function getUserFriendlyMessage(scenario: keyof typeof USER_FRIENDLY_ERRORS): string {
  return USER_FRIENDLY_ERRORS[scenario] || USER_FRIENDLY_ERRORS.GENERAL_ERROR;
}

/**
 * Format error for toast notification
 */
export function formatErrorForToast(error: Error | AuthError | FirestoreError, context?: string): string {
  let response: SecureErrorResponse;

  if ('code' in error && error.code.startsWith('auth/')) {
    response = handleAuthError(error as AuthError, context);
  } else if ('code' in error && error.code) {
    response = handleFirestoreError(error as FirestoreError, context);
  } else {
    response = handleGenericError(error, context);
  }

  return response.userMessage;
}
