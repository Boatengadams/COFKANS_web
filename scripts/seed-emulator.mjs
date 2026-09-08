#!/usr/bin/env node
/**
 * Seed Auth + Firestore emulators for local Staff / checkout demos.
 *
 * Prerequisites: `firebase emulators:start --only auth,firestore,functions,storage,database`
 * (or `pnpm emulators`) must already be running.
 *
 * Usage (from COFKANS_WEB root):
 *   node scripts/seed-emulator.mjs
 *
 * Creates:
 *   - Verified customer: demo.customer@example.com / DemoPass123!
 *   - Developer (company-wide) + GM + main-showroom front desk + Adum front desk
 *   - One demo product + priced storefront catalog
 *   - Branch inventory: FULL catalog stocked at main showroom (kumasi-asuoyeboa);
 *     Adum keeps a small demo-product qty for isolation tests
 *   - Full branch catalog (all storefront branches)
 *
 * Note: use a real-looking email domain — Paystack rejects addresses like *.local.
 * Important: if Firestore has ANY branch docs, the client uses those instead of the
 * in-memory seed — so emulator demos must seed the full branch list (not one).
 * POS stock comes from `inventory` rows (branch-scoped), not products.totalStock alone.
 */
import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

process.env.FIRESTORE_EMULATOR_HOST ||= '127.0.0.1:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST ||= '127.0.0.1:9099';
process.env.FIREBASE_STORAGE_EMULATOR_HOST ||= '127.0.0.1:9199';
process.env.FIREBASE_DATABASE_EMULATOR_HOST ||= '127.0.0.1:9000';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ID = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || 'cofkans-staging';

const DEMO_EMAIL = 'demo.customer@example.com';
const DEMO_PASSWORD = 'DemoPass123!';
const PRODUCT_ID = 'emulator-demo-product';
/** Main / showroom branch — default stock fill + default front-desk assignment. */
const MAIN_BRANCH = 'kumasi-asuoyeboa';
const MAIN_BRANCH_DEFAULT_QTY = 12;

/** Staff accounts for the Staff portal against the same emulator Firestore. */
const STAFF_SEEDS = [
  {
    email: 'demo.developer@cofkans.com',
    password: DEMO_PASSWORD,
    displayName: 'Emulator Developer',
    role: 'developer',
    branchSlug: null,
  },
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
    displayName: 'Emulator Front Desk (Asuoyeboa Showroom)',
    role: 'front_desk',
    branchSlug: MAIN_BRANCH,
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

  const isDeveloper = seed.role === 'developer';
  await auth.setCustomUserClaims(user.uid, {
    role: seed.role,
    branchSlug: seed.branchSlug,
    staff: true,
    ...(isDeveloper ? { developer: true } : { developer: false }),
  });

  const now = FieldValue.serverTimestamp();
  await db.doc(`users/${user.uid}`).set(
    {
      uid: user.uid,
      email: seed.email,
      displayName: seed.displayName,
      role: seed.role,
      isDeveloper,
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
      branchIds: seed.branchSlug ? [seed.branchSlug] : [],
      active: true,
      status: 'active',
      isSeedAccount: true,
      createdBy: 'emulator-seed',
      createdAt: now,
      updatedAt: now,
      ...(isDeveloper ? { developerClaimGrantedAt: now } : {}),
    },
    { merge: true },
  );

  return user;
}

function inventoryDocId(productId, branchSlug) {
  return `${productId}__${branchSlug}`;
}

async function writeInventoryRow({ productId, sku, name, branchSlug, quantity, unitPrice, image }) {
  const qty = Math.max(0, Number(quantity) || 0);
  const threshold = 2;
  const id = inventoryDocId(productId, branchSlug);
  await db.doc(`inventory/${id}`).set(
    {
      id,
      productId,
      sku: sku || '',
      name: name || productId,
      branchSlug,
      branchId: branchSlug,
      quantity: qty,
      qty,
      unitPrice: Number(unitPrice) || 0,
      image: image || '',
      reorderLevel: threshold,
      lowStockThreshold: threshold,
      status: qty <= 0 ? 'out' : qty <= threshold ? 'low' : 'ok',
      soldThisMonth: 0,
      updatedAt: Timestamp.now(),
      createdAt: Timestamp.now(),
    },
    { merge: true },
  );
  return { id, branchSlug, productId, quantity: qty };
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

/**
 * Demo-product inventory: main showroom + Adum (isolation tests).
 * Other branches stay empty until a developer assigns stock-fill work.
 */
async function seedDemoInventory() {
  const rows = [
    await writeInventoryRow({
      productId: PRODUCT_ID,
      sku: 'EMU-DEMO-001',
      name: 'Emulator Demo Floodlight',
      branchSlug: MAIN_BRANCH,
      quantity: 15,
      unitPrice: 150,
    }),
    await writeInventoryRow({
      productId: PRODUCT_ID,
      sku: 'EMU-DEMO-001',
      name: 'Emulator Demo Floodlight',
      branchSlug: 'kumasi-adum',
      quantity: 8,
      unitPrice: 150,
    }),
  ];
  await db.doc(`products/${PRODUCT_ID}`).set(
    {
      totalStock: rows.reduce((s, r) => s + r.quantity, 0),
      isAvailable: true,
      status: 'active',
      updatedAt: Timestamp.now(),
    },
    { merge: true },
  );
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
    return [];
  }

  const written = [];
  const batchSize = 400;
  for (let i = 0; i < catalog.length; i += batchSize) {
    const batch = db.batch();
    const slice = catalog.slice(i, i + batchSize);
    for (const p of slice) {
      const price = Number(p.price);
      if (!p.id || !Number.isFinite(price) || price < 0.01) continue;
      const stock = Math.max(MAIN_BRANCH_DEFAULT_QTY, Number(p.stock) || MAIN_BRANCH_DEFAULT_QTY);
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
      written.push({
        id: p.id,
        sku: p.sku || String(p.id).toUpperCase(),
        name: p.name || p.id,
        price,
        stock,
        image: p.image || '',
      });
    }
    await batch.commit();
  }
  return written;
}

/**
 * Stock the main showroom with every catalog SKU so POS is sellable there.
 * Other branches intentionally stay empty (OOS) until inventory is assigned —
 * developer can reassign / provision front desk to those branches for fill work.
 */
async function seedMainBranchCatalogInventory(catalogProducts) {
  const rows = [];
  // Firestore batches max 500 ops; keep comfortable headroom.
  const chunk = 200;
  for (let i = 0; i < catalogProducts.length; i += chunk) {
    const slice = catalogProducts.slice(i, i + chunk);
    const batch = db.batch();
    const now = Timestamp.now();
    for (const p of slice) {
      const qty = Math.max(MAIN_BRANCH_DEFAULT_QTY, Number(p.stock) || MAIN_BRANCH_DEFAULT_QTY);
      const id = inventoryDocId(p.id, MAIN_BRANCH);
      const threshold = 2;
      batch.set(
        db.doc(`inventory/${id}`),
        {
          id,
          productId: p.id,
          sku: p.sku,
          name: p.name,
          branchSlug: MAIN_BRANCH,
          branchId: MAIN_BRANCH,
          quantity: qty,
          qty,
          unitPrice: p.price,
          image: p.image || '',
          reorderLevel: threshold,
          lowStockThreshold: threshold,
          status: qty <= 0 ? 'out' : qty <= threshold ? 'low' : 'ok',
          soldThisMonth: 0,
          updatedAt: now,
          createdAt: now,
        },
        { merge: true },
      );
      // Company totalStock matches main-branch seed (other branches empty).
      batch.set(
        db.doc(`products/${p.id}`),
        {
          totalStock: qty,
          isAvailable: qty > 0,
          status: 'active',
          updatedAt: now,
        },
        { merge: true },
      );
      rows.push({ productId: p.id, branchSlug: MAIN_BRANCH, quantity: qty });
    }
    await batch.commit();
  }
  return rows;
}

async function seedBranches() {
  for (const b of BRANCHES) {
    await db.doc(`branches/${b.slug}`).set(b, { merge: true });
  }
}

const user = await ensureDemoUser();
const staffUsers = [];
for (const seed of STAFF_SEEDS) {
  staffUsers.push({
    email: seed.email,
    role: seed.role,
    branchSlug: seed.branchSlug,
    uid: (await ensureStaffUser(seed)).uid,
  });
}
await seedProduct();
const demoInv = await seedDemoInventory();
const catalogProducts = await seedCatalogProducts();
const mainInv = await seedMainBranchCatalogInventory(catalogProducts);
await seedBranches();

console.log('Emulator seed complete.');
console.log(`  Auth user:  ${DEMO_EMAIL} / ${DEMO_PASSWORD} (emailVerified=true)`);
console.log(`  uid:        ${user.uid}`);
for (const s of staffUsers) {
  const branch = s.branchSlug || 'company-wide';
  console.log(`  Staff:      ${s.email} / ${DEMO_PASSWORD} (role=${s.role}, branch=${branch}, uid=${s.uid})`);
}
console.log(`  Default FD: demo.frontdesk@cofkans.com → ${MAIN_BRANCH} (main showroom)`);
console.log(`  Product:    products/${PRODUCT_ID} (GHS 150)`);
console.log(`  Demo inv:   ${demoInv.map((r) => `${r.branchSlug}=${r.quantity}`).join(', ')}`);
console.log(`  Catalog:    ${catalogProducts.length} products`);
console.log(`  Main stock: ${mainInv.length} inventory rows at ${MAIN_BRANCH} (default fill branch)`);
console.log(`  Branches:   ${BRANCHES.length} docs (${BRANCHES.map((b) => b.slug).join(', ')})`);
console.log('Open Emulator UI: http://127.0.0.1:4000');
console.log('Customer app:   pnpm dev:customer:emulators  → https://localhost:8443');
console.log('Staff app:      pnpm dev:staff:emulators     → https://localhost:8444');
console.log('Developer:      demo.developer@cofkans.com — assign FD via Staff Accounts / updateStaffAccount');
console.log('Note: Storage + RTDB emulators enabled for local media / realtime tests.');
