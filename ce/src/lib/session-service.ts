/**
 * Session lifecycle + device tracking + step-up re-auth.
 *
 * - 7-day max session age (force re-login)
 * - Step-up re-auth: sensitive ops require auth ≤ 5 min old
 * - Device fingerprint hash → detect new-device sign-ins
 */
import { auth, db } from './firebase';
import {
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  EmailAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { logSecurityEvent, SecurityEventType } from './security-service';

// Sliding-session windows. Each visit "bumps" the last-active timestamp so a
// returning customer effectively never gets logged out as long as they keep
// using the app. Staff/developer accounts get a tighter window — they're
// higher-value targets and shouldn't be left signed-in on shared devices.
export const CUSTOMER_IDLE_MAX_MS = 30 * 24 * 60 * 60 * 1000; // 30 days idle
export const STAFF_IDLE_MAX_MS    = 7  * 24 * 60 * 60 * 1000; // 7 days idle
export const STEP_UP_MAX_AGE_MS   = 5  * 60 * 1000;            // 5 minutes

// In-tab idle auto-lock. Different from the sliding session window — this
// fires after true inactivity in this tab (no mouse/keyboard/visibility for X).
export const CUSTOMER_AUTOLOCK_MS = 60 * 60 * 1000; // 60 min
export const STAFF_AUTOLOCK_MS    = 15 * 60 * 1000; // 15 min

const SESSION_START_KEY  = 'cofkans_session_start';
const SESSION_ACTIVE_KEY = 'cofkans_session_last_active';
const SESSION_FP_KEY     = 'cofkans_session_fp';
const SESSION_UID_KEY    = 'cofkans_session_uid';
const DEVICE_ID_KEY      = 'cofkans_device_id';

/** Mark a fresh session start (call right after sign-in). */
export function markSessionStart() {
  try {
    const now = String(Date.now());
    localStorage.setItem(SESSION_START_KEY, now);
    localStorage.setItem(SESSION_ACTIVE_KEY, now);
  } catch { /* ignore */ }
}

/** Bump the sliding-window timestamp. Call on auth-state restore + activity. */
export function bumpSessionActivity() {
  try { localStorage.setItem(SESSION_ACTIVE_KEY, String(Date.now())); } catch { /* ignore */ }
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_START_KEY);
    localStorage.removeItem(SESSION_ACTIVE_KEY);
    localStorage.removeItem(SESSION_FP_KEY);
    localStorage.removeItem(SESSION_UID_KEY);
  } catch { /* ignore */ }
}

/**
 * Bind the active session to (uid, device fingerprint). When auth state
 * restores from persistence, we re-check this binding. If the fingerprint
 * doesn't match — token was stolen and replayed on another device — we
 * refuse the session and force a fresh sign-in.
 */
export async function bindSessionToDevice(uid: string) {
  try {
    const fp = await computeDeviceFingerprint();
    localStorage.setItem(SESSION_FP_KEY, fp);
    localStorage.setItem(SESSION_UID_KEY, uid);
  } catch { /* ignore */ }
}

/** Returns true if the restored session's fingerprint matches this device. */
export async function isSessionDeviceValid(uid: string): Promise<boolean> {
  try {
    const storedUid = localStorage.getItem(SESSION_UID_KEY);
    const storedFp  = localStorage.getItem(SESSION_FP_KEY);
    // Legacy session without binding → accept once, then bind.
    if (!storedFp || !storedUid) {
      await bindSessionToDevice(uid);
      return true;
    }
    if (storedUid !== uid) return false;
    const fp = await computeDeviceFingerprint();
    return fp === storedFp;
  } catch {
    return true; // fail-open on storage errors to avoid locking users out
  }
}

/**
 * True once the session has been idle longer than the allowed window.
 * Customers: 90 days. Staff/developer: 7 days. If no timestamp exists,
 * treat as not-expired so legacy sessions aren't kicked out on first load.
 */
export function isSessionExpired(isStaff = false): boolean {
  try {
    const raw = localStorage.getItem(SESSION_ACTIVE_KEY) || localStorage.getItem(SESSION_START_KEY);
    if (!raw) return false;
    const last = Number(raw);
    if (!Number.isFinite(last)) return false;
    const limit = isStaff ? STAFF_IDLE_MAX_MS : CUSTOMER_IDLE_MAX_MS;
    return Date.now() - last > limit;
  } catch {
    return false;
  }
}

/**
 * Step-up: returns true if Firebase's current user authenticated within
 * STEP_UP_MAX_AGE_MS. Use before password/email change, payment, etc.
 */
export function isAuthFresh(maxAgeMs = STEP_UP_MAX_AGE_MS): boolean {
  const u = auth.currentUser;
  if (!u) return false;
  const lastSignInStr = u.metadata.lastSignInTime;
  if (!lastSignInStr) return false;
  const last = Date.parse(lastSignInStr);
  if (!Number.isFinite(last)) return false;
  return Date.now() - last < maxAgeMs;
}

/**
 * Re-authenticate the current user. For email/password supply password.
 * For OAuth users, pops the provider window.
 */
export async function requireFreshAuth(opts?: { password?: string }): Promise<boolean> {
  if (isAuthFresh()) return true;
  const u = auth.currentUser;
  if (!u) return false;
  const providerId = u.providerData[0]?.providerId || '';
  try {
    if (providerId === 'password' && opts?.password && u.email) {
      const cred = EmailAuthProvider.credential(u.email, opts.password);
      await reauthenticateWithCredential(u, cred);
    } else if (providerId.includes('google')) {
      await reauthenticateWithPopup(u, new GoogleAuthProvider());
    } else if (providerId.includes('apple')) {
      await reauthenticateWithPopup(u, new OAuthProvider('apple.com'));
    } else if (providerId.includes('microsoft')) {
      await reauthenticateWithPopup(u, new OAuthProvider('microsoft.com'));
    } else {
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Step-up reauth failed:', err);
    return false;
  }
}

/* ===== Device fingerprinting ===== */

async function sha256(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function getOrCreateDeviceId(): string {
  try {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = (crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`);
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  } catch {
    return 'unknown';
  }
}

/** Stable per-browser fingerprint hash. Coarse — UA + lang + tz + persistent id. */
export async function computeDeviceFingerprint(): Promise<string> {
  const parts = [
    navigator.userAgent || '',
    navigator.language || '',
    String(screen.width) + 'x' + String(screen.height),
    Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    getOrCreateDeviceId(),
  ];
  return sha256(parts.join('|'));
}

interface KnownDeviceDoc {
  fingerprints: string[];
  lastSeenAt: Timestamp | ReturnType<typeof serverTimestamp>;
}

/**
 * Record this device for the user. Returns `{ isNew }` so the caller can
 * surface a security banner / log an event when a new device appears.
 */
export async function registerDevice(uid: string): Promise<{ isNew: boolean; fingerprint: string }> {
  const fingerprint = await computeDeviceFingerprint();
  const ref = doc(db, 'knownDevices', uid);
  try {
    const snap = await getDoc(ref);
    const existing = (snap.exists() ? (snap.data() as KnownDeviceDoc) : null);
    const fingerprints = existing?.fingerprints || [];
    const isNew = !fingerprints.includes(fingerprint);
    const next = isNew ? [...fingerprints, fingerprint].slice(-10) : fingerprints;
    await setDoc(ref, { fingerprints: next, lastSeenAt: serverTimestamp() }, { merge: true });
    return { isNew, fingerprint };
  } catch (err) {
    console.warn('registerDevice failed:', err);
    return { isNew: false, fingerprint };
  }
}

/**
 * Global "sign out everywhere else" — writes a server-side revocation
 * timestamp. Any session whose local SESSION_START_KEY predates this
 * timestamp will be refused on its next auth-state restore.
 *
 * The calling tab refreshes its own SESSION_START_KEY first so it survives.
 */
export async function revokeAllOtherSessions(uid: string): Promise<void> {
  markSessionStart();
  await setDoc(
    doc(db, 'userSessions', uid),
    { revokedAt: serverTimestamp() },
    { merge: true },
  );
}

/** True if this tab's session predates a global revocation. */
export async function isSessionRevoked(uid: string): Promise<boolean> {
  try {
    const snap = await getDoc(doc(db, 'userSessions', uid));
    if (!snap.exists()) return false;
    const revokedAt = snap.data().revokedAt as Timestamp | undefined;
    if (!revokedAt) return false;
    const startRaw = localStorage.getItem(SESSION_START_KEY);
    const startedAt = startRaw ? Number(startRaw) : 0;
    if (!Number.isFinite(startedAt) || startedAt === 0) return false;
    return revokedAt.toMillis() > startedAt;
  } catch {
    return false;
  }
}

/** Convenience: log + register on a successful sign-in. */
export async function recordSignInSuccess(uid: string, email: string) {
  markSessionStart();
  await bindSessionToDevice(uid);
  const { isNew, fingerprint } = await registerDevice(uid);
  await logSecurityEvent({
    type: SecurityEventType.LOGIN_SUCCESS,
    userId: uid,
    email,
    userAgent: navigator.userAgent,
    metadata: { fingerprint, newDevice: isNew },
  });
  return { isNew };
}
