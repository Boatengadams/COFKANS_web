/**
 * Thin wrappers around the developer-portal callable Cloud Functions.
 * The functions themselves enforce the developer claim — this file just
 * shapes the request/response so the UI doesn't depend on Firebase types.
 */
import {getFunctions, httpsCallable} from 'firebase/functions';
import {getApp} from 'firebase/app';
import {getAuth} from 'firebase/auth';
import {
  addDoc, collection, doc, getFirestore, serverTimestamp, setDoc,
} from 'firebase/firestore';

function fns() {
  return getFunctions(getApp(), 'us-central1');
}

export interface EnrollResult {
  otpauthUrl: string;
  qrPng: string;          // data:image/png;base64,...
  recoveryCodes: string[]; // shown once at enrollment
}

export async function enrollTotp(): Promise<EnrollResult> {
  const call = httpsCallable<unknown, EnrollResult>(fns(), 'enrollTotp');
  const res = await call({});
  return res.data;
}

export async function verifyTotp(code: string): Promise<void> {
  const call = httpsCallable<{code: string}, {ok: true}>(fns(), 'verifyTotp');
  await call({code: code.trim()});
}

export async function setDeveloperClaim(targetUid: string, grant: boolean): Promise<void> {
  const call = httpsCallable<{targetUid: string; grant: boolean}, {ok: true}>(
    fns(), 'setDeveloperClaim'
  );
  await call({targetUid, grant});
}

export interface AuditPayload {
  action: string;
  target?: string;
  meta?: Record<string, unknown>;
}

export async function writeAuditLog(payload: AuditPayload): Promise<string> {
  const user = getAuth().currentUser;
  const ref = await addDoc(collection(getFirestore(), 'auditLogs'), {
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
  await setDoc(
    doc(getFirestore(), 'featureFlags/global'),
    {[key]: value, _updatedAt: serverTimestamp()},
    {merge: true}
  );
}

export async function forceSignOut(targetUid: string): Promise<void> {
  const call = httpsCallable<{targetUid: string}, {ok: true}>(fns(), 'forceSignOut');
  await call({targetUid});
}
