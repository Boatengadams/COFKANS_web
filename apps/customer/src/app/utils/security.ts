// Client-side security utilities. Server-side enforcement lives in
// firestore-security.rules and src/lib/validators.ts. Treat this file as
// best-effort defense in depth, never as the sole control.
import { sanitizeString as canonicalSanitize, escapeHtml as canonicalEscape } from '@/lib/validators';

/**
 * Sanitize user input. Strips control chars, HTML-significant chars,
 * common XSS vectors, normalizes unicode, and caps length.
 */
export function sanitizeInput(input: string, maxLen = 1000): string {
  if (!input) return '';
  return canonicalSanitize(input, maxLen)
    .replace(/javascript:/gi, '')
    .replace(/data:text\/html/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/[<>]/g, '');
}

/** HTML-escape for safe DOM injection (prefer React's default escaping over this). */
export const escapeHtml = canonicalEscape;

/**
 * Validate email format (RFC-5322 subset, length-capped to prevent ReDoS).
 */
export function isValidEmail(email: string): boolean {
  if (typeof email !== 'string' || email.length > 254) return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (Ghana format).
 */
export function isValidPhone(phone: string): boolean {
  if (typeof phone !== 'string' || phone.length > 20) return false;
  const phoneRegex = /^(\+233|0)[2-5][0-9]{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Cryptographically strong random token (32 bytes / 64 hex chars).
 */
export function generateSecureToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Constant-time string comparison (use for CSRF / token validation).
 * JS doesn't expose true constant-time primitives in the browser, but
 * looping over both inputs prevents the obvious early-exit timing leak.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Session metadata held in sessionStorage (cleared on tab close, never
 * stored in localStorage to limit XSS/CSRF blast radius). Server-side
 * Firebase auth tokens remain the source of truth for authn.
 */
export class SessionManager {
  private static SESSION_KEY = 'cofkans_session';
  private static SESSION_EXPIRY = 24 * 60 * 60 * 1000;

  static createSession(userId: string): string {
    const sessionId = generateSecureToken();
    const session = {
      id: sessionId,
      userId,
      createdAt: Date.now(),
      expiresAt: Date.now() + this.SESSION_EXPIRY,
      lastActivity: Date.now(),
    };
    try {
      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    } catch {
      // Storage may be disabled (private browsing, quota); fall through.
    }
    return sessionId;
  }

  static getSession(): { id: string; userId: string; expiresAt: number } | null {
    try {
      const raw = sessionStorage.getItem(this.SESSION_KEY);
      if (!raw) return null;
      const session = JSON.parse(raw);
      if (!session || Date.now() > session.expiresAt) {
        this.clearSession();
        return null;
      }
      session.lastActivity = Date.now();
      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      return session;
    } catch {
      this.clearSession();
      return null;
    }
  }

  static clearSession(): void {
    try {
      sessionStorage.removeItem(this.SESSION_KEY);
    } catch {
      /* noop */
    }
  }
}

/**
 * Lightweight audit logger that emits to the server-side Firestore
 * `auditLogs` collection via security-service. This module intentionally
 * does NOT persist logs in localStorage — that would leak PII to any XSS
 * attacker and survive across sessions.
 */
export const AuditLogger = {
  log(action: string, resource: string, details?: Record<string, unknown>): void {
    try {
      Promise.all([import('@/lib/demo-mode'), import('@/lib/security-service')])
        .then(([{ DEMO_MODE }, m]) => {
          if (DEMO_MODE) return;
          const userId = (details?.userId ?? details?.technicianId ?? details?.driverId ?? 'anonymous') as string;
          const resourceId = (details?.resourceId ?? details?.requestId ?? '') as string;
          m.logAuditEvent?.(action, userId, resource, resourceId, details);
        })
        .catch(() => {});
    } catch {
      /* noop */
    }
  },
};
