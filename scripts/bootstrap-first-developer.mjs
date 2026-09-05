#!/usr/bin/env node
/**
 * One-time bootstrap: grant the first developer custom claim via Admin SDK.
 *
 * After this runs once, remove any hardcoded email fallbacks from firestore.rules
 * (already removed) and manage further developers via setDeveloperClaim.
 *
 * Usage (from COFKANS_WEB root, with GOOGLE_APPLICATION_CREDENTIALS set):
 *   node scripts/bootstrap-first-developer.mjs <firebaseUid> [email]
 *
 * Or with a service-account JSON:
 *   GOOGLE_APPLICATION_CREDENTIALS=~/.config/cofkans-firebase-keys/staging.json \
 *     node scripts/bootstrap-first-developer.mjs <uid>
 */
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve } from 'node:path';

const uid = process.argv[2];
const emailArg = process.argv[3];
if (!uid) {
  console.error('Usage: node scripts/bootstrap-first-developer.mjs <firebaseUid> [email]');
  process.exit(1);
}

function initAdmin() {
  if (getApps().length) return;
  const envPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (envPath) {
    const raw = readFileSync(resolve(envPath.replace(/^~/, homedir())), 'utf8');
    initializeApp({ credential: cert(JSON.parse(raw)) });
    return;
  }
  // Fall back to application default credentials if configured.
  initializeApp();
}

initAdmin();
const auth = getAuth();
const db = getFirestore();

const user = await auth.getUser(uid);
const existing = user.customClaims ?? {};
await auth.setCustomUserClaims(uid, { ...existing, developer: true, staff: true, role: 'developer' });

const email = emailArg || user.email || null;
await db.doc(`staffAccounts/${uid}`).set({
  uid,
  email,
  displayName: user.displayName || email || uid,
  role: 'developer',
  active: true,
  developerClaimGrantedAt: FieldValue.serverTimestamp(),
  updatedAt: FieldValue.serverTimestamp(),
  bootstrappedAt: FieldValue.serverTimestamp(),
}, { merge: true });

await db.doc(`users/${uid}`).set({
  uid,
  email,
  isDeveloper: true,
  role: 'developer',
  updatedAt: FieldValue.serverTimestamp(),
}, { merge: true });

await db.collection('auditLogs').add({
  action: 'bootstrap_first_developer',
  actorUid: 'cli-bootstrap',
  targetUid: uid,
  at: FieldValue.serverTimestamp(),
});

console.log(`Granted developer claim to ${uid}${email ? ` (${email})` : ''}.`);
console.log('Sign out and back in (or refresh ID token) before using developer-only rules.');
