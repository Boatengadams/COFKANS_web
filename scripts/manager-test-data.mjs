import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const admin = require('../functions/node_modules/firebase-admin');

const PROJECT_ID = 'cofkans-staging';
const PREFIX = '__test_manager__';
const COLLECTIONS = [
  'branches',
  'products',
  'orders',
  'staffAccounts',
  'inventory',
  'approvals',
  'reports',
  'spreadsheet',
];

const command = process.argv[2] ?? 'seed';

if (!['seed', 'delete'].includes(command)) {
  throw new Error('Usage: node scripts/manager-test-data.mjs [seed|delete]');
}

const app = admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: PROJECT_ID,
});

const actualProjectId = app.options.projectId;
if (actualProjectId !== PROJECT_ID) {
  throw new Error(
    `Refusing to run against ${actualProjectId ?? 'unknown project'}; expected ${PROJECT_ID}`,
  );
}

const db = admin.firestore(app);
const now = admin.firestore.Timestamp.now();

const records = {
  branches: {
    [`${PREFIX}branch`]: {
      name: 'Test Branch',
      slug: `${PREFIX}branch`,
      city: 'Kumasi',
      region: 'Ashanti',
      phone: '+233200000001',
      managerName: 'Test Manager',
      status: 'active',
      isTestData: true,
    },
  },
  products: {
    [`${PREFIX}product`]: {
      name: 'Test Manager Product',
      sku: 'TEST-MGR-001',
      category: 'Electrical Accessories',
      price: 1250,
      stock: 24,
      status: 'active',
      imageUrl: '',
      isTestData: true,
    },
  },
  orders: {
    [`${PREFIX}order`]: {
      orderNumber: 'TEST-ORD-001',
      customerName: 'Test Customer',
      customerPhone: '+233200000002',
      branchSlug: `${PREFIX}branch`,
      status: 'processing',
      paymentStatus: 'paid',
      total: 1250,
      currency: 'GHS',
      items: [{ productId: `${PREFIX}product`, quantity: 1, unitPrice: 1250 }],
      createdAt: now,
      isTestData: true,
    },
  },
  staffAccounts: {
    [`${PREFIX}staff`]: {
      email: 'test.manager@example.invalid',
      displayName: 'Test Manager',
      role: 'branch_manager',
      branchSlug: `${PREFIX}branch`,
      active: true,
      isTestData: true,
    },
  },
  inventory: {
    [`${PREFIX}inventory`]: {
      productId: `${PREFIX}product`,
      productName: 'Test Manager Product',
      branchSlug: `${PREFIX}branch`,
      quantity: 24,
      reorderLevel: 5,
      status: 'in_stock',
      isTestData: true,
    },
  },
  approvals: {
    [`${PREFIX}approval`]: {
      type: 'stock_transfer',
      title: 'Test stock transfer approval',
      requestedBy: 'Test Manager',
      status: 'pending',
      branchSlug: `${PREFIX}branch`,
      createdAt: now,
      isTestData: true,
    },
  },
  reports: {
    [`${PREFIX}report`]: {
      name: 'Test weekly operations report',
      type: 'operations',
      period: '2026-W33',
      status: 'ready',
      summary: 'Staging-only report for manager portal walkthroughs.',
      createdAt: now,
      isTestData: true,
    },
  },
  spreadsheet: {
    [`${PREFIX}row`]: {
      rowType: 'inventory_adjustment',
      reference: 'TEST-SHEET-001',
      description: 'Test spreadsheet row',
      quantity: 3,
      branchSlug: `${PREFIX}branch`,
      createdAt: now,
      isTestData: true,
    },
  },
};

async function seed() {
  const batch = db.batch();
  for (const collection of COLLECTIONS) {
    for (const [id, value] of Object.entries(records[collection])) {
      batch.set(
        db.collection(collection).doc(id),
        {
          ...value,
          updatedAt: now,
        },
        { merge: true },
      );
    }
  }
  await batch.commit();
  console.log(`Seeded ${COLLECTIONS.length} manager test records in ${PROJECT_ID}.`);
}

async function remove() {
  let deleted = 0;
  for (const collection of COLLECTIONS) {
    const snapshot = await db.collection(collection).where('isTestData', '==', true).get();
    const batch = db.batch();
    for (const document of snapshot.docs) {
      if (!document.id.startsWith(PREFIX)) continue;
      batch.delete(document.ref);
      deleted += 1;
    }
    if (deleted > 0) await batch.commit();
  }
  console.log(`Deleted ${deleted} manager test records from ${PROJECT_ID}.`);
}

try {
  if (command === 'seed') await seed();
  else await remove();
} finally {
  await app.delete();
}
