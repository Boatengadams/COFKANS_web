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

export interface CreateWorkerInput {
  creatorUserId: string;
  username: string;
  displayName: string;
  role: 'manager' | 'technician' | 'driver';
  password?: string;
  /** Full E.164 phone, e.g. "+233241234567". Required if you want SMS delivery. */
  phone?: string;
  branchSlug?: string | null;
  employeeId?: string;
  /** YYYY-MM-DD */
  startDate?: string;
  /** Free-form note visible only to developers/admins. */
  notes?: string;
  /** If true, ask the backend to email + SMS the temp credentials. */
  sendCredentials?: boolean;
}

export interface CreateWorkerResult {
  success: boolean;
  email?: string;
  password?: string;
  uid?: string;
  resetLink?: string;
  /** Channels the credentials were dispatched on (only set when sendCredentials=true). */
  delivery?: { email: boolean; sms: boolean; errors?: string[] };
  error?: string;
}

/**
 * Create a worker account from the developer UI.
 * Auth user creation, Firestore writes, and custom claims are server-side only.
 */
export async function createWorkerAccount(opts: CreateWorkerInput): Promise<CreateWorkerResult> {
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
      role: CreateWorkerInput['role'];
      branchSlug: string | null;
      phone?: string;
    }, {
      ok: boolean;
      uid: string;
      email: string;
      role: string;
      branchSlug: string | null;
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

    let delivery: CreateWorkerResult['delivery'];
    if (opts.sendCredentials) {
      delivery = {
        email: false,
        sms: false,
        errors: ['Automatic credential delivery is disabled. Copy the temporary password/reset link manually.'],
      };
    }

    return {
      success: true,
      email: res.data.email,
      password: res.data.tempPassword,
      uid: res.data.uid,
      resetLink: res.data.resetLink,
      delivery,
    };
  } catch (e: any) {
    if (e?.code === 'functions/already-exists') {
      return { success: false, error: 'That username is already taken.' };
    }
    console.error('createWorkerAccount failed:', e);
    return { success: false, error: e?.message || 'Failed to create worker account.' };
  }
}
