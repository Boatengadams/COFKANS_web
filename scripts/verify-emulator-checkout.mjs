#!/usr/bin/env node
/**
 * Smoke-test checkout callables against the local emulator suite.
 *
 * Prerequisites:
 *   1. pnpm emulators   (auth + firestore + functions)
 *   2. node scripts/seed-emulator.mjs
 *
 * Usage:
 *   node scripts/verify-emulator-checkout.mjs
 *
 * Confirms createCheckoutOrder writes an order, and initializePaystackPayment
 * returns a Paystack test-mode initialization (uses sk_test_ from functions/.env).
 */
import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

process.env.FIRESTORE_EMULATOR_HOST ||= '127.0.0.1:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST ||= '127.0.0.1:9099';

const PROJECT_ID = process.env.GCLOUD_PROJECT || 'cofkans-staging';
const API_KEY = process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'fake-api-key';
const DEMO_EMAIL = 'demo.customer@example.com';
const DEMO_PASSWORD = 'DemoPass123!';
const PRODUCT_ID = 'emulator-demo-product';
const BRANCH_SLUG = 'kumasi-asuoyeboa';
const FUNCTIONS_BASE = `http://127.0.0.1:5001/${PROJECT_ID}/us-central1`;

if (!getApps().length) {
  initializeApp({ projectId: PROJECT_ID });
}

async function signInIdToken() {
  const url = `http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      returnSecureToken: true,
    }),
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(`Auth sign-in failed: ${JSON.stringify(body)}`);
  }
  return body.idToken;
}

async function callCallable(name, data, idToken) {
  const res = await fetch(`${FUNCTIONS_BASE}/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ data }),
  });
  const body = await res.json();
  if (!res.ok || body.error) {
    throw new Error(`${name} failed: ${JSON.stringify(body)}`);
  }
  return body.result ?? body.data ?? body;
}

const idToken = await signInIdToken();
console.log('✓ Signed in via Auth emulator');

const order = await callCallable(
  'createCheckoutOrder',
  {
    items: [{ productId: PRODUCT_ID, quantity: 1 }],
    shippingAddress: {
      fullName: 'Emulator Demo Customer',
      phone: '0240000000',
      email: DEMO_EMAIL,
      region: 'Ashanti Region',
      city: 'Kumasi',
      street: 'Asuoyeboa',
    },
    fulfillment: {
      type: 'pickup',
      branchSlug: BRANCH_SLUG,
      scheduledDate: new Date().toISOString().slice(0, 10),
    },
  },
  idToken,
);
console.log('✓ createCheckoutOrder →', order);

const db = getFirestore();
const orderSnap = await db.doc(`orders/${order.orderId}`).get();
if (!orderSnap.exists) {
  throw new Error(`Order ${order.orderId} not found in emulated Firestore`);
}
console.log('✓ Order document present in Firestore emulator', {
  orderNumber: orderSnap.data()?.orderNumber,
  paymentStatus: orderSnap.data()?.paymentStatus,
  total: orderSnap.data()?.total,
});

const paystack = await callCallable(
  'initializePaystackPayment',
  { orderId: order.orderId, callbackUrl: 'http://127.0.0.1:8443/checkout/complete' },
  idToken,
);
console.log('✓ initializePaystackPayment →', {
  reference: paystack.reference,
  publicKeyPrefix: String(paystack.publicKey || '').slice(0, 8),
  amount: paystack.amount,
  hasAuthUrl: Boolean(paystack.authorizationUrl),
});

if (!String(paystack.publicKey || '').startsWith('pk_test_')) {
  throw new Error('Expected Paystack TEST public key (pk_test_*) from emulator functions');
}

console.log('\nEmulator checkout smoke test PASSED.');
console.log('Note: Paystack webhooks cannot reach localhost without a tunnel (ngrok).');
console.log('For a live demo, complete payment in the Paystack popup then call verifyPaystackPayment.');
