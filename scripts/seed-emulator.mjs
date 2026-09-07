#!/usr/bin/env node
/**
 * Seed Auth + Firestore emulators for a local checkout demo.
 *
 * Prerequisites: `firebase emulators:start --only auth,firestore,functions`
 * (or `pnpm emulators`) must already be running.
 *
 * Usage (from COFKANS_WEB root):
 *   node scripts/seed-emulator.mjs
 *
 * Creates:
 *   - Verified customer: demo.customer@example.com / DemoPass123!
 *   - Staff GM + front desk (same password) so COFKANS_Staff can process orders
 *   - One in-stock product: emulator-demo-product
 *   - Priced storefront catalog products (scripts/emulator-catalog-products.json)
 *   - Full branch catalog (all storefront branches)
 *
 * Note: use a real-looking email domain — Paystack rejects addresses like *.local.
 * Important: if Firestore has ANY branch docs, the client uses those instead of the
 * in-memory seed — so emulator demos must seed the full branch list (not one).
 */
import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

process.env.FIRESTORE_EMULATOR_HOST ||= '127.0.0.1:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST ||= '127.0.0.1:9099';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ID = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || 'cofkans-staging';

const DEMO_EMAIL = 'demo.customer@example.com';
const DEMO_PASSWORD = 'DemoPass123!';
const PRODUCT_ID = 'emulator-demo-product';

/** Staff accounts for the Staff portal against the same emulator Firestore. */
const STAFF_SEEDS = [
  {
    email: 'demo.manager@cofkans.com',
    password: DEMO_PASSWORD,
    displayName: 'Emulator General Manager',
    role: 'manager',
    branchSlug: null,
  },
  {
    email: 'demo.frontdesk@cofkans.com',
    password: DEMO_PASSWORD,
    displayName: 'Emulator Front Desk (Asuoyeboa)',
    role: 'front_desk',
    branchSlug: 'kumasi-asuoyeboa',
  },
  {
    email: 'demo.frontdesk.adum@cofkans.com',
    password: DEMO_PASSWORD,
    displayName: 'Emulator Front Desk (Adum)',
    role: 'front_desk',
    branchSlug: 'kumasi-adum',
  },
];

/** Mirrors packages/core/src/lib/branches.ts SEED_BRANCHES (no lat/lng written). */
const BRANCHES = [
  {
    slug: 'kumasi-asuoyeboa',
    name: 'Cofkans Asuoyeboa Showroom',
    city: 'Kumasi',
    region: 'Ashanti Region',
    address: 'Asuoyeboa, Kumasi',
    phones: ['053-6622095'],
    hours: 'Mon–Sat 8:00am – 5:00pm',
    isActive: true,
    isMain: true,
    displayOrder: 1,
  },
  {
    slug: 'kumasi-adum',
    name: 'Cofkans Adum',
    city: 'Kumasi',
    region: 'Ashanti Region',
    address: 'Kataban Road, Adum, Kumasi',
    phones: ['055-3298335'],
    hours: 'Mon–Sat 8:00am – 5:00pm',
    isActive: true,
    displayOrder: 2,
  },
  {
    slug: 'kumasi-pampaso',
    name: 'Cofkans Pampaso',
    city: 'Kumasi',
    region: 'Ashanti Region',
    address: 'Spare Parts Road, Pampaso, Kumasi',
    phones: ['024-4880484'],
    hours: 'Mon–Sat 8:00am – 5:00pm',
    isActive: true,
    displayOrder: 3,
  },
  {
    slug: 'kumasi-abuakwa',
    name: 'Cofkans Abuakwa',
    city: 'Kumasi',
    region: 'Ashanti Region',
    address: 'Abuakwa, Opp. Shell Filling Station, Kumasi',
    phones: ['024-7603798'],
    hours: 'Mon–Sat 8:00am – 5:00pm',
    isActive: true,
    displayOrder: 4,
  },
  {
    slug: 'kumasi-nkawie',
    name: 'Cofkans Nkawie',
    city: 'Nkawie',
    region: 'Ashanti Region',
    address: 'Nkawie, Opp. Nkawie Station',
    phones: ['025-7589662'],
    hours: 'Mon–Sat 8:00am – 5:00pm',
    isActive: true,
    displayOrder: 5,
  },
  {
    slug: 'accra-opera-square',
    name: 'Cofkans Opera Square',
    city: 'Accra',
    region: 'Greater Accra Region',
    address: 'Opera Square, near Melcom Weija Barrier (NIB Building), Accra',
    phones: ['024-8124728', '024-2443086'],
    hours: 'Mon–Sat 8:00am – 5:00pm',
    isActive: true,
    displayOrder: 6,
  },
  {
    slug: 'obuasi-bediem',
    name: 'Cofkans Obuasi',
    city: 'Obuasi',
    region: 'Ashanti Region',
    address: 'Obuasi Bediem, Off Dunkwa Road (Star Oil Building)',
    phones: ['054-5226745'],
    hours: 'Mon–Sat 8:00am – 5:00pm',
    isActive: true,
    displayOrder: 7,
  },
];

if (!getApps().length) {
  initializeApp({ projectId: PROJECT_ID });
}

const auth = getAuth();
const db = getFirestore();

async function ensureDemoUser() {
  let user;
  try {
    user = await auth.getUserByEmail(DEMO_EMAIL);
    // Always reset password so seed/verify stay in sync after emulator restarts
    // or manual password changes in the Auth emulator UI.
    await auth.updateUser(user.uid, {
      password: DEMO_PASSWORD,
      emailVerified: true,
      displayName: 'Emulator Demo Customer',
    });
    user = await auth.getUser(user.uid);
  } catch {
    user = await auth.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      emailVerified: true,
      displayName: 'Emulator Demo Customer',
    });
  }
  await db.doc(`users/${user.uid}`).set(
    {
      uid: user.uid,
      email: DEMO_EMAIL,
      displayName: 'Emulator Demo Customer',
      role: 'customer',
      status: 'active',
      isActive: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
  return user;
}

async function ensureStaffUser(seed) {
  let user;
  try {
    user = await auth.getUserByEmail(seed.email);
    await auth.updateUser(user.uid, {
      password: seed.password,
      emailVerified: true,
      displayName: seed.displayName,
      disabled: false,
    });
    user = await auth.getUser(user.uid);
  } catch {
    user = await auth.createUser({
      email: seed.email,
      password: seed.password,
      emailVerified: true,
      displayName: seed.displayName,
      disabled: false,
    });
  }

  await auth.setCustomUserClaims(user.uid, {
    role: seed.role,
    branchSlug: seed.branchSlug,
    staff: true,
  });

  const now = FieldValue.serverTimestamp();
  await db.doc(`users/${user.uid}`).set(
    {
      uid: user.uid,
      email: seed.email,
      displayName: seed.displayName,
      role: seed.role,
      isDeveloper: seed.role === 'developer',
      emailVerified: true,
      provider: 'email',
      createdAt: now,
      updatedAt: now,
    },
    { merge: true },
  );

  await db.doc(`staffAccounts/${user.uid}`).set(
    {
      uid: user.uid,
      email: seed.email,
      displayName: seed.displayName,
      role: seed.role,
      branchSlug: seed.branchSlug,
      active: true,
      status: 'active',
      isSeedAccount: true,
      createdBy: 'emulator-seed',
      createdAt: now,
      updatedAt: now,
    },
    { merge: true },
  );

  return user;
}

async function seedProduct() {
  await db.doc(`products/${PRODUCT_ID}`).set(
    {
      id: PRODUCT_ID,
      sku: 'EMU-DEMO-001',
      name: 'Emulator Demo Floodlight',
      slug: PRODUCT_ID,
      description: 'Local-emulator seed product for checkout demos.',
      categoryId: 'lighting',
      categoryName: 'Lighting',
      price: 150,
      currency: 'GHS',
      image: '',
      images: [],
      status: 'active',
      isAvailable: true,
      totalStock: 25,
      trackInventory: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
    { merge: true },
  );
}

/** Branch inventory rows required by createLocalSale (branch-scoped qty). */
async function seedDemoInventory() {
  const rows = [
    {
      id: `${PRODUCT_ID}__kumasi-asuoyeboa`,
      branchSlug: 'kumasi-asuoyeboa',
      quantity: 10,
    },
    {
      id: `${PRODUCT_ID}__kumasi-adum`,
      branchSlug: 'kumasi-adum',
      quantity: 8,
    },
  ];
  for (const row of rows) {
    await db.doc(`inventory/${row.id}`).set(
      {
        id: row.id,
        productId: PRODUCT_ID,
        sku: 'EMU-DEMO-001',
        name: 'Emulator Demo Floodlight',
        branchSlug: row.branchSlug,
        branchId: row.branchSlug,
        quantity: row.quantity,
        qty: row.quantity,
        unitPrice: 150,
        reorderLevel: 2,
        lowStockThreshold: 2,
        status: row.quantity <= 0 ? 'out' : row.quantity <= 2 ? 'low' : 'ok',
        soldThisMonth: 0,
        updatedAt: Timestamp.now(),
        createdAt: Timestamp.now(),
      },
      { merge: true },
    );
  }
  return rows;
}

/**
 * Upsert the priced catalog SKUs so local checkout works for products users
 * actually click in the static storefront (csvProducts). Zero-price / quote-only
 * SKUs are omitted because createCheckoutOrder rejects price < 0.01.
 */
async function seedCatalogProducts() {
  const catalogPath = join(__dirname, 'emulator-catalog-products.json');
  const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
  if (!Array.isArray(catalog) || catalog.length === 0) {
    console.warn('No catalog products found at', catalogPath);
    return 0;
  }

  let written = 0;
  const batchSize = 400;
  for (let i = 0; i < catalog.length; i += batchSize) {
    const batch = db.batch();
    const slice = catalog.slice(i, i + batchSize);
    for (const p of slice) {
      const price = Number(p.price);
      if (!p.id || !Number.isFinite(price) || price < 0.01) continue;
      const stock = Math.max(1, Number(p.stock) || 10);
      batch.set(
        db.doc(`products/${p.id}`),
        {
          id: p.id,
          sku: p.sku || String(p.id).toUpperCase(),
          name: p.name || p.id,
          slug: p.id,
          description: p.description || '',
          categoryId: String(p.category || 'general').toLowerCase().replace(/\s+/g, '-'),
          categoryName: p.category || 'General',
          subcategory: p.subcategory || '',
          price,
          currency: 'GHS',
          image: p.image || '',
          images: p.image ? [{ url: p.image }] : [],
          status: 'active',
          isAvailable: true,
          totalStock: stock,
          trackInventory: true,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        },
        { merge: true },
      );
      written += 1;
    }
    await batch.commit();
  }
  return written;
}

async function seedBranches() {
  for (const b of BRANCHES) {
    await db.doc(`branches/${b.slug}`).set(b, { merge: true });
  }
}

const user = await ensureDemoUser();
const staffUsers = [];
for (const seed of STAFF_SEEDS) {
  staffUsers.push({ email: seed.email, role: seed.role, uid: (await ensureStaffUser(seed)).uid });
}
await seedProduct();
const inventoryRows = await seedDemoInventory();
const catalogCount = await seedCatalogProducts();
await seedBranches();

console.log('Emulator seed complete.');
console.log(`  Auth user:  ${DEMO_EMAIL} / ${DEMO_PASSWORD} (emailVerified=true)`);
console.log(`  uid:        ${user.uid}`);
for (const s of staffUsers) {
  console.log(`  Staff:      ${s.email} / ${DEMO_PASSWORD} (role=${s.role}, uid=${s.uid})`);
}
console.log(`  Product:    products/${PRODUCT_ID} (GHS 150, stock 25)`);
console.log(`  Inventory:  ${inventoryRows.map((r) => `${r.branchSlug}=${r.quantity}`).join(', ')}`);
console.log(`  Catalog:    ${catalogCount} priced storefront products seeded`);
console.log(`  Branches:   ${BRANCHES.length} docs (${BRANCHES.map((b) => b.slug).join(', ')})`);
console.log('Open Emulator UI: http://127.0.0.1:4000');
console.log('Customer app:   pnpm dev:customer:emulators  → https://localhost:8443');
console.log('Staff app:      pnpm dev:staff:emulators     → https://localhost:8444');
console.log('Note: RTDB + Storage emulators are not required for checkout.');
