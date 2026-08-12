/**
 * Staff account registry — completely separate from the public `users` collection.
 *
 * A row exists in `staffAccounts` keyed by the user's Firebase UID.
 * Only developers can write to this collection (see firestore.rules).
 */

import { db } from './firebase';
import {
  doc, getDoc, collection, query, where, getDocs, setDoc, serverTimestamp,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';
import { DEMO_MODE, getDemoUser } from './demo-mode';

export type StaffRole =
  | 'branch_manager'
  | 'manager'
  | 'rider'
  | 'driver'
  | 'front_desk'
  | 'branch_desk'
  | 'technician'
  | 'warehouse'
  | 'accountant'
  | 'hr'
  | 'procurement'
  | 'marketing'
  | 'developer';

export interface StaffAccount {
  uid: string;
  email: string;
  role: StaffRole;
  /** Required when role === 'branch_manager' or 'rider'. */
  branchSlug?: string;
  displayName?: string;
  phone?: string;
  active: boolean;
  mustResetPassword?: boolean;
  createdAt?: unknown;
  createdBy?: string;
}

const COLL = 'staffAccounts';

export async function getStaffAccount(uid: string): Promise<StaffAccount | null> {
  // DEMO MODE: derive the staff account from the current demo role so the
  // /staff portal resolves the matching dashboard without touching Firestore.
  if (DEMO_MODE) {
    const du = getDemoUser();
    if (du && du.staffRole && du.uid === uid) {
      return {
        uid: du.uid,
        email: du.email,
        role: du.staffRole,
        branchSlug: du.branchSlug,
        displayName: du.displayName,
        active: true,
      } as StaffAccount;
    }
    return null;
  }
  const snap = await getDoc(doc(db, COLL, uid));
  if (!snap.exists()) return null;
  const data = snap.data() as StaffAccount;
  return data.active === false ? null : data;
}

export async function findStaffByEmail(email: string): Promise<StaffAccount | null> {
  const q = query(collection(db, COLL), where('email', '==', email.toLowerCase().trim()));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const data = snap.docs[0].data() as StaffAccount;
  return data.active === false ? null : data;
}

/** Developer-only: provision a new staff account (or update existing). */
export async function upsertStaffAccount(account: StaffAccount): Promise<void> {
  const payload: Record<string, unknown> = {
    ...account,
    email: account.email.toLowerCase().trim(),
    createdAt: serverTimestamp(),
  };
  // Strip undefineds — Firestore rejects them.
  Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);
  await setDoc(doc(db, COLL, account.uid), payload, { merge: true });
}

/**
 * Create a staff account through the server-side callable. Client code must
 * never create Auth users or staffAccounts directly.
 */
export async function provisionStaffUser(input: {
  email: string;
  role: StaffRole;
  branchSlug?: string;
  displayName?: string;
  phone?: string;
  createdBy: string;
}): Promise<{ uid: string; tempPassword: string; resetLink: string }> {
  const call = httpsCallable<{
    name: string;
    email: string;
    role: StaffRole;
    branchSlug?: string;
    phone?: string;
  }, {
    ok: boolean;
    uid: string;
    tempPassword: string;
    resetLink: string;
  }>(functions, 'provisionStaffAccount');
  const res = await call({
    name: input.displayName || input.email,
    email: input.email,
    role: input.role,
    branchSlug: input.branchSlug,
    phone: input.phone,
  });
  return {
    uid: res.data.uid,
    tempPassword: res.data.tempPassword,
    resetLink: res.data.resetLink,
  };
}
