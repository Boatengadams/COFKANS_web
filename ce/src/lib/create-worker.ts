import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';
import { canHaveRole } from './admin-service';

const COMPANY_DOMAIN = '@cofkanselectricals.com';

export function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let out = '';
  const arr = new Uint32Array(12);
  crypto.getRandomValues(arr);
  for (const n of arr) out += chars[n % chars.length];
  return out + '!9';
}

function normaliseUsername(input: string): string {
  return input.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
}

/**
 * Create a worker account from the developer UI.
 *
 * The server creates the Auth user, Firestore rows, custom claims, and
 * temporary password. The browser only receives the one-time credentials
 * for manual handoff.
 */
export async function createWorkerAccount(opts: {
  creatorUserId: string;
  username: string;
  displayName: string;
  role: 'manager' | 'technician' | 'driver';
  password?: string;
  phone?: string;
  branchSlug?: string | null;
}): Promise<{ success: boolean; email?: string; password?: string; uid?: string; resetLink?: string; error?: string }> {
  const username = normaliseUsername(opts.username);
  if (!username) return { success: false, error: 'Username is required.' };
  if (!opts.displayName.trim()) return { success: false, error: 'Display name is required.' };

  const email = `${username}${COMPANY_DOMAIN}`;
  if (!canHaveRole(email, opts.role)) {
    return { success: false, error: 'Role not permitted for this email.' };
  }

  try {
    const call = httpsCallable<{
      name: string;
      email: string;
      role: 'manager' | 'technician' | 'driver';
      branchSlug: string | null;
      phone?: string;
    }, {
      ok: boolean;
      uid: string;
      email: string;
      tempPassword: string;
      resetLink: string;
    }>(functions, 'provisionStaffAccount');

    const res = await call({
      name: opts.displayName,
      email,
      role: opts.role,
      branchSlug: opts.branchSlug || null,
      phone: opts.phone?.trim() || undefined,
    });

    return {
      success: true,
      email: res.data.email,
      password: res.data.tempPassword,
      uid: res.data.uid,
      resetLink: res.data.resetLink,
    };
  } catch (e: any) {
    if (e?.code === 'functions/already-exists') {
      return { success: false, error: 'That username is already taken.' };
    }
    console.error('createWorkerAccount failed:', e);
    return { success: false, error: e?.message || 'Failed to create worker account.' };
  }
}
