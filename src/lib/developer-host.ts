/**
 * Developer Console host + gate.
 *
 * The Developer Console is a SEPARATE app surface with its OWN login, meant to
 * be served from a dedicated subdomain (e.g. https://developer.cofkanselectricals.com).
 * When the app boots on that host, ONLY the console renders — the storefront and
 * the staff branch portals are never mounted. This isolates the most privileged
 * surface so it can be locked down independently (Cloudflare Access, separate
 * DNS, separate deploy target).
 *
 * Everything here is intentionally backend-free and SWAPPABLE:
 *   • `isDeveloperHost()`  — decide whether this origin is the console.
 *   • `verifyDeveloperCredentials()` — the single auth seam. Today it validates
 *     against the codebase account store (`dp:staff`, role === 'developer').
 *     Later, point it at Firebase (`src/lib/developer-auth-service.ts`) without
 *     touching any UI.
 *   • dev session helpers — a console-only session, separate from the staff
 *     session, so signing into the console never signs you into the storefront.
 */

import { store, type StaffMember } from '../app/pages/developer-portal/store';

/** Subdomain label that identifies the console host. Override with VITE_DEVELOPER_SUBDOMAIN. */
const SUBDOMAIN =
  import.meta.env.VITE_DEVELOPER_SUBDOMAIN?.trim?.() || 'developer';

/** Extra accepted labels so `dev.` works too. */
const CONSOLE_LABELS = new Set([SUBDOMAIN, 'dev', 'developer', 'console']);

/** localStorage flag so you can test the console on localhost/Kali without DNS. */
const FORCE_KEY = 'dp:force-dev-console';
const DEV_SESSION_KEY = 'dp:dev-session';

function hostname(): string {
  try { return window.location.hostname || ''; } catch { return ''; }
}

/**
 * True when this origin should render the Developer Console instead of the
 * storefront. Triggers on:
 *   • a `developer.*` / `dev.*` / `console.*` subdomain (production), or
 *   • VITE_FORCE_DEVELOPER_CONSOLE === 'true' (build-time), or
 *   • a local override toggled via `?console=developer` (persisted) — handy for
 *     testing on `localhost` / `127.0.0.1` where you have no subdomain.
 */
export function isDeveloperHost(): boolean {
  // Build-time force (e.g. a dedicated console deploy target).
  if (import.meta.env.VITE_FORCE_DEVELOPER_CONSOLE === 'true') return true;

  // Query-string override for local testing: ?console=developer / ?console=off
  try {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('console');
    if (q === 'developer' || q === 'on') { window.localStorage.setItem(FORCE_KEY, '1'); }
    else if (q === 'off') { window.localStorage.removeItem(FORCE_KEY); }
    if (window.localStorage.getItem(FORCE_KEY) === '1') return true;
  } catch { /* ignore */ }

  // Subdomain match (production): first label of the hostname.
  const host = hostname();
  const first = host.split('.')[0]?.toLowerCase();
  return !!first && CONSOLE_LABELS.has(first) && host.includes('.');
}

// ---------------------------------------------------------------------------
// Console session (separate from the staff/storefront session)
// ---------------------------------------------------------------------------

export interface DevSession {
  id: string;
  email: string;
  name: string;
  at: number;
}

export function getDevSession(): DevSession | null {
  try {
    const raw = window.localStorage.getItem(DEV_SESSION_KEY);
    return raw ? (JSON.parse(raw) as DevSession) : null;
  } catch { return null; }
}

export function setDevSession(s: DevSession | null): void {
  try {
    if (s) window.localStorage.setItem(DEV_SESSION_KEY, JSON.stringify(s));
    else window.localStorage.removeItem(DEV_SESSION_KEY);
  } catch { /* ignore */ }
}

export function clearDevSession(): void {
  setDevSession(null);
}

// ---------------------------------------------------------------------------
// Auth seam — swap this for Firebase later without changing the UI.
// ---------------------------------------------------------------------------

export interface DevLoginResult {
  ok: boolean;
  session?: DevSession;
  error?: string;
}

/**
 * Validate console credentials. Backend-free: checks the codebase account store
 * and requires the `developer` role. Returns a console session on success.
 *
 * To wire real auth: replace the body with a call to your identity provider
 * (Firebase Auth + TOTP via `developer-auth-service.ts`) and return the same
 * shape. Nothing else needs to change.
 */
export function verifyDeveloperCredentials(login: string, password: string): DevLoginResult {
  const id = (login || '').trim();
  if (!id || !password) return { ok: false, error: 'Enter your email and password.' };

  const member: StaffMember | null = store.verifyLogin(id, password);
  if (!member) return { ok: false, error: 'Incorrect email or password.' };
  if (member.role !== 'developer') {
    return { ok: false, error: 'This console is restricted to developer accounts.' };
  }
  if (member.status === 'suspended') {
    return { ok: false, error: 'This account is suspended.' };
  }

  return {
    ok: true,
    session: { id: member.id, email: member.email, name: member.name, at: Date.now() },
  };
}
