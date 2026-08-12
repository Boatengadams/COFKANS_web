/**
 * Staff account registry — completely separate from the public `users` collection.
 *
 * A row exists in `staffAccounts` keyed by the user's Firebase UID.
 * Only developers can write to this collection (see firestore.rules).
 * Customers signing in through the main app can never reach a staff portal
 * even if they guess a URL — RequireStaffRole checks this collection.
 */

import { db, functions } from './firebase';
import { doc, getDoc, collection, query, where, getDocs, setDoc, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';

export type StaffRole = 'branch_manager' | 'rider' | 'front_desk' | 'developer';

export interface StaffAccount {
  uid: string;
  email: string;
  role: StaffRole;
  /** Required when role === 'branch_manager' or 'rider'; identifies which branch. */
  branchSlug?: string;
  displayName?: string;
  phone?: string;
  active: boolean;
  createdAt?: unknown;
  createdBy?: string; // developer uid who provisioned this account
}

const COLL = 'staffAccounts';

export async function getStaffAccount(uid: string): Promise<StaffAccount | null> {
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
  await setDoc(
    doc(db, COLL, account.uid),
    { ...account, email: account.email.toLowerCase().trim(), createdAt: serverTimestamp() },
    { merge: true },
  );
}

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

export function roleHasPortalAccess(role: StaffRole, portal: StaffRole, branchSlug?: string, accountBranchSlug?: string): boolean {
  if (role !== portal) return false;
  if (portal === 'branch_manager' || portal === 'rider') {
    return !!branchSlug && branchSlug === accountBranchSlug;
  }
  return true;
}
