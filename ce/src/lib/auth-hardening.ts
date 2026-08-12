/**
 * Modern auth-threat hardening:
 *  - Idle auto-lock (visibility-aware activity tracking)
 *  - HaveIBeenPwned password check (k-anonymity, no full password leaves browser)
 *  - Cross-tab sign-out sync (BroadcastChannel)
 */
import { signOut } from 'firebase/auth';
import { auth } from './firebase';
import { CUSTOMER_AUTOLOCK_MS, STAFF_AUTOLOCK_MS, clearSession } from './session-service';

/* ============ Cross-tab sign-out sync ============ */

const CHANNEL_NAME = 'cofkans-auth';

type AuthBroadcast = { type: 'signout' };

let _channel: BroadcastChannel | null = null;
function getChannel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === 'undefined') return null;
  if (_channel) return _channel;
  try { _channel = new BroadcastChannel(CHANNEL_NAME); } catch { _channel = null; }
  return _channel;
}

/** Tell every other tab to sign out. Call right after a user-initiated signOut. */
export function broadcastSignOut() {
  const ch = getChannel();
  ch?.postMessage({ type: 'signout' } satisfies AuthBroadcast);
}

/** Listen for sign-outs from other tabs. Returns an unsubscribe fn. */
export function onRemoteSignOut(handler: () => void): () => void {
  const ch = getChannel();
  if (!ch) return () => {};
  const listener = (e: MessageEvent<AuthBroadcast>) => {
    if (e.data?.type === 'signout') handler();
  };
  ch.addEventListener('message', listener);
  return () => ch.removeEventListener('message', listener);
}

/* ============ Idle auto-lock ============ */

type AutoLockOpts = { isStaff: boolean; onLock: () => void };

let _lockTimer: ReturnType<typeof setTimeout> | null = null;
let _lockCleanup: (() => void) | null = null;

/**
 * Start idle-auto-lock for the current session. Resets the timer on
 * mouse/keyboard/touch/visibility-change. Calls `onLock` once the user has been
 * idle in this tab for the configured window. Returns a stop function.
 */
export function startIdleAutoLock({ isStaff, onLock }: AutoLockOpts): () => void {
  if (typeof window === 'undefined') return () => {};
  stopIdleAutoLock();
  const timeoutMs = isStaff ? STAFF_AUTOLOCK_MS : CUSTOMER_AUTOLOCK_MS;

  const reset = () => {
    if (_lockTimer) clearTimeout(_lockTimer);
    _lockTimer = setTimeout(() => {
      // Only fire if the tab is currently visible — otherwise let the next
      // visibility-change tick re-evaluate, so a backgrounded tab on a long
      // timer doesn't sign the user out mid-task in another tab.
      if (document.visibilityState === 'visible') onLock();
    }, timeoutMs);
  };

  const events: (keyof WindowEventMap)[] = ['mousemove', 'keydown', 'touchstart', 'scroll', 'visibilitychange'];
  events.forEach(ev => window.addEventListener(ev, reset, { passive: true }));
  reset();

  _lockCleanup = () => {
    if (_lockTimer) { clearTimeout(_lockTimer); _lockTimer = null; }
    events.forEach(ev => window.removeEventListener(ev, reset));
  };
  return stopIdleAutoLock;
}

export function stopIdleAutoLock() {
  if (_lockCleanup) { _lockCleanup(); _lockCleanup = null; }
}

/** One-call helper for sign-out paths: clears session, signs out Firebase, broadcasts. */
export async function hardSignOut(reason?: string) {
  try { await signOut(auth); } catch { /* ignore */ }
  clearSession();
  stopIdleAutoLock();
  broadcastSignOut();
  if (reason && typeof window !== 'undefined') {
    try { sessionStorage.setItem('cofkans_signout_reason', reason); } catch { /* ignore */ }
  }
}

/* ============ HaveIBeenPwned password check ============ */

async function sha1Hex(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest('SHA-1', buf);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

/**
 * Check a password against HaveIBeenPwned's range API using k-anonymity:
 * only the first 5 chars of the SHA-1 are sent, the API returns ~800 hashes
 * with that prefix, and we match the suffix locally. The full password never
 * leaves the browser.
 *
 * Returns the number of times the password appears in known breaches (0 = safe).
 * Falls back to 0 on network/API errors so a HIBP outage doesn't block users.
 */
export async function checkPasswordPwned(password: string): Promise<number> {
  if (!password) return 0;
  try {
    const hash = await sha1Hex(password);
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);
    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { 'Add-Padding': 'true' }, // hides true response size
    });
    if (!res.ok) return 0;
    const body = await res.text();
    for (const line of body.split('\n')) {
      const [suf, count] = line.trim().split(':');
      if (suf === suffix) return parseInt(count, 10) || 0;
    }
    return 0;
  } catch {
    return 0; // fail-open
  }
}
