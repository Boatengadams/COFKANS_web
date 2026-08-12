import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const admin = require('../functions/node_modules/firebase-admin');

const projectId = 'cofkans-staging';
const rtdbInstance = 'cofkans-staging-default-rtdb';
const databaseURL = `https://${rtdbInstance}.firebaseio.com`;
const serviceAccountPath = '/home/kali/.config/cofkans-firebase-keys/staging.json';
const password = '123456';
const mainBranch = 'kumasi-asuoyeboa';

const accounts = [
  {
    email: 'boatengadams4@gmail.com',
    displayName: 'Boateng Adams',
    userRole: 'admin',
    staffRole: 'developer',
    branchSlug: null,
    isDeveloper: true,
    claims: {
      developer: true,
      staff: true,
      admin: true,
      role: 'developer',
      isDeveloper: true,
    },
  },
  {
    email: 'angela@gmail.com',
    displayName: 'Angela',
    userRole: 'manager',
    staffRole: 'branch_manager',
    branchSlug: mainBranch,
    isDeveloper: false,
    claims: {
      staff: true,
      role: 'branch_manager',
      staffRole: 'branch_manager',
      branchSlug: mainBranch,
    },
  },
  {
    email: 'isaac@gmail.com',
    displayName: 'Isaac',
    userRole: 'front_desk',
    staffRole: 'front_desk',
    branchSlug: mainBranch,
    isDeveloper: false,
    claims: {
      staff: true,
      role: 'front_desk',
      staffRole: 'front_desk',
      branchSlug: mainBranch,
    },
  },
  {
    email: 'yaa@gmail.com',
    displayName: 'Yaa',
    userRole: 'customer',
    staffRole: null,
    branchSlug: null,
    isDeveloper: false,
    claims: {
      staff: false,
      role: 'customer',
    },
  },
];

if (!fs.existsSync(serviceAccountPath)) {
  throw new Error(`Missing staging service account: ${serviceAccountPath}`);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
if (serviceAccount.project_id !== projectId) {
  throw new Error(`Service account project_id ${serviceAccount.project_id} does not match ${projectId}`);
}

async function applyGoogleClockSkew() {
  try {
    const res = await fetch('https://www.google.com', { method: 'HEAD' });
    const dateHeader = res.headers.get('date');
    if (!dateHeader) return;

    const googleNow = Date.parse(dateHeader);
    if (!Number.isFinite(googleNow)) return;

    const localNow = globalThis.Date.now();
    const skewMs = googleNow - localNow;
    if (Math.abs(skewMs) < 5 * 60 * 1000) return;

    const RealDate = globalThis.Date;
    class SkewedDate extends RealDate {
      constructor(...args) {
        super(...(args.length === 0 ? [RealDate.now() + skewMs] : args));
      }

      static now() {
        return RealDate.now() + skewMs;
      }
    }
    Object.setPrototypeOf(SkewedDate, RealDate);
    globalThis.Date = SkewedDate;

    console.log(`Applied Google API clock skew for this process: ${Math.round(skewMs / 1000)}s`);
  } catch (error) {
    console.warn(`Could not check Google API clock skew; continuing with local clock: ${error.message}`);
  }
}

await applyGoogleClockSkew();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId,
  databaseURL,
});

const auth = admin.auth();
const firestore = admin.firestore();
const rtdb = admin.database();
const now = new Date();
const nowIso = now.toISOString();

function compact(value) {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined));
}

function userPayload(account, uid, existingCreatedAt) {
  return compact({
    uid,
    email: account.email,
    displayName: account.displayName,
    phoneNumber: null,
    photoURL: null,
    role: account.userRole,
    provider: 'email',
    emailVerified: true,
    phoneVerified: false,
    addresses: [],
    defaultAddressId: null,
    preferences: {
      newsletter: true,
      smsNotifications: true,
      emailNotifications: true,
      currency: 'GHS',
      language: 'en',
    },
    stats: {
      totalOrders: 0,
      totalSpent: 0,
      lifetimeValue: 0,
    },
    twoFactorEnabled: false,
    lastPasswordChange: null,
    isDeveloper: account.isDeveloper === true,
    isActive: true,
    isBanned: false,
    banReason: null,
    mustChangePassword: false,
    createdAt: existingCreatedAt ?? now,
    lastLogin: now,
    updatedAt: now,
  });
}

function staffPayload(account, uid, existingCreatedAt) {
  return compact({
    uid,
    email: account.email,
    role: account.staffRole,
    branchSlug: account.branchSlug ?? null,
    displayName: account.displayName,
    active: true,
    mustResetPassword: false,
    createdAt: existingCreatedAt ?? now,
    updatedAt: now,
  });
}

async function upsertAuthUser(account) {
  try {
    const user = await auth.getUserByEmail(account.email);
    await auth.updateUser(user.uid, {
      emailVerified: true,
      disabled: false,
      displayName: account.displayName,
      password,
    });
    return { user: await auth.getUser(user.uid), created: false };
  } catch (error) {
    if (error.code !== 'auth/user-not-found') throw error;
    const user = await auth.createUser({
      email: account.email,
      password,
      displayName: account.displayName,
      emailVerified: true,
      disabled: false,
    });
    return { user, created: true };
  }
}

const provisioned = [];

for (const account of accounts) {
  const { user, created } = await upsertAuthUser(account);
  await auth.setCustomUserClaims(user.uid, account.claims);

  const userRef = firestore.collection('users').doc(user.uid);
  const userSnap = await userRef.get();
  await userRef.set(
    userPayload(account, user.uid, userSnap.exists ? userSnap.get('createdAt') : undefined),
    { merge: true },
  );

  if (account.staffRole) {
    const staffRef = firestore.collection('staffAccounts').doc(user.uid);
    const staffSnap = await staffRef.get();
    await staffRef.set(
      staffPayload(account, user.uid, staffSnap.exists ? staffSnap.get('createdAt') : undefined),
      { merge: true },
    );
  } else {
    await firestore.collection('staffAccounts').doc(user.uid).delete();
  }

  provisioned.push({
    email: account.email,
    uid: user.uid,
    authCreated: created,
    userRole: account.userRole,
    staffRole: account.staffRole,
    branchSlug: account.branchSlug,
    isDeveloper: account.isDeveloper,
    claims: account.claims,
  });

  console.log(`${account.email} -> ${user.uid} (${account.staffRole || account.userRole})`);
}

await firestore.collection('integrations').doc('staging').set({
  appCheck: {
    webAppId: '1:285961078595:web:ac95e2180bebb7e2a211f6',
    provider: 'recaptcha_v3',
    clientConfigured: true,
  },
  realtimeDatabase: {
    instance: rtdbInstance,
    databaseURL,
    configured: true,
  },
  auth: {
    provider: 'firebase',
    demoMode: false,
  },
  demoMode: false,
  updatedAt: now,
}, { merge: true });

await rtdb.ref('staging').set({
  status: {
    configured: true,
    demoMode: false,
    projectId,
    rtdbInstance,
    updatedAt: nowIso,
  },
  config: {
    appEnvironment: 'development',
    liveBackendEnabled: true,
    demoMode: false,
  },
  branches: {
    [mainBranch]: {
      slug: mainBranch,
      active: true,
      label: 'Asuoyeboa Main',
      updatedAt: nowIso,
    },
  },
  users: Object.fromEntries(
    provisioned.map(account => [
      account.uid,
      {
        email: account.email,
        userRole: account.userRole,
        staffRole: account.staffRole,
        branchSlug: account.branchSlug ?? null,
        isDeveloper: account.isDeveloper,
      },
    ]),
  ),
});

console.log('\nProvisioning summary');
console.log(JSON.stringify({
  projectId,
  databaseURL,
  serviceAccount: serviceAccount.client_email,
  defaultPassword: password,
  accounts: provisioned.map(({ email, uid, userRole, staffRole, branchSlug, isDeveloper, authCreated }) => ({
    email,
    uid,
    authCreated,
    userRole,
    staffRole,
    branchSlug,
    isDeveloper,
  })),
  firestore: [
    'users/{uid}',
    'staffAccounts/{uid} for staff only',
    'integrations/staging',
  ],
  rtdb: 'staging',
}, null, 2));

await admin.app().delete();
