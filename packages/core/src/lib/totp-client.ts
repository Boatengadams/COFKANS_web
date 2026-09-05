/**
 * Client boundary for the developer-portal callable functions.
 *
 * Keeping these calls in the root lib layer lets the Expo web route use the
 * live Cloud Functions implementation without importing the former Vite
 * application's Firebase singleton or router APIs.
 */
import { httpsCallable } from 'firebase/functions';
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db, functions } from './firebase';

export interface EnrollResult {
  otpauthUrl: string;
  qrPng: string;
  recoveryCodes: string[];
}

export async function enrollTotp(): Promise<EnrollResult> {
  const call = httpsCallable<unknown, EnrollResult>(functions, 'enrollTotp');
  return (await call({})).data;
}

export async function verifyTotp(code: string): Promise<void> {
  const call = httpsCallable<{ code: string }, { ok: true }>(functions, 'verifyTotp');
  await call({ code: code.trim() });
}

export async function setDeveloperClaim(targetUid: string, grant: boolean): Promise<void> {
  const call = httpsCallable<{ targetUid: string; grant: boolean }, { ok: true }>(
    functions,
    'setDeveloperClaim',
  );
  await call({ targetUid, grant });
}

export interface AuditPayload {
  action: string;
  target?: string;
  meta?: Record<string, unknown>;
}

export async function writeAuditLog(payload: AuditPayload): Promise<string> {
  const user = auth.currentUser;
  const ref = await addDoc(collection(db, 'auditLogs'), {
    action: payload.action,
    target: payload.target ?? null,
    meta: payload.meta ?? {},
    actorUid: user?.uid ?? null,
    actorEmail: user?.email ?? null,
    at: serverTimestamp(),
  });
  return ref.id;
}

export async function setFeatureFlag(key: string, value: boolean): Promise<void> {
  await setDoc(doc(db, 'featureFlags/global'), {
    [key]: value,
    _updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function forceSignOut(targetUid: string): Promise<void> {
  const call = httpsCallable<{ targetUid: string }, { ok: true }>(functions, 'forceSignOut');
  await call({ targetUid });
}

export async function setUserRole(
  targetUid: string,
  role: 'customer' | 'technician' | 'driver' | 'admin' | 'manager',
  branchSlug?: string | null
): Promise<void> {
  const call = httpsCallable<
    { targetUid: string; role: string; branchSlug?: string | null },
    { ok: true }
  >(functions, 'setUserRole');
  await call({ targetUid, role, branchSlug: branchSlug ?? null });
}

export async function updateStockTransfer(
  transferId: string,
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled'
): Promise<void> {
  const call = httpsCallable<
    { transferId: string; status: string },
    { ok: true }
  >(functions, 'updateStockTransfer');
  await call({ transferId, status });
}

export async function resolveStockRequest(
  requestId: string,
  decision: 'approved' | 'declined'
): Promise<{ ok: true; transferId?: string | null }> {
  const call = httpsCallable<
    { requestId: string; decision: string },
    { ok: true; transferId?: string | null }
  >(functions, 'resolveStockRequest');
  return (await call({ requestId, decision })).data;
}
