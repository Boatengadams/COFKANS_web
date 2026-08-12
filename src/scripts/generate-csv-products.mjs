// One-shot generator: reads cofkans_items_A_plus_B.csv and writes
// src/app/data/csvProducts.ts with deduped, categorised product entries.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..', '..');
const csvPath = path.join(root, 'src', 'imports', 'cofkans_items_A_plus_B.csv');
const catalogPath = path.join(root, 'src', 'app', 'components', 'ProductCatalog.tsx');
const outPath = path.join(root, 'src', 'app', 'data', 'csvProducts.ts');

const raw = fs.readFileSync(csvPath, 'utf8');
const lines = raw.split(/\r?\n/).filter(Boolean);
lines.shift(); // header

const existing = fs.readFileSync(catalogPath, 'utf8');
const existingSkus = new Set(
  [...existing.matchAll(/sku:\s*['"]([^'"]+)['"]/g)].map(m => m[1].toLowerCase()),
);
const existingNames = new Set(
  [...existing.matchAll(/name:\s*['"]([^'"]+)['"]/g)].map(m => m[1].toLowerCase()),
);

// Curated Unsplash image pools per subcategory (real product photography)
const imagePools = {
  'Switches & Sockets': [
    'https://images.unsplash.com/photo-1610056494071-9373f12bf769?w=600',
    'https://images.unsplash.com/photo-1565049981953-379c9c2a5d48?w=600',
    'https://images.unsplash.com/photo-1610056494052-6a4f83a8368c?w=600',
    'https://images.unsplash.com/photo-1610056494249-5d7f111cf78f?w=600',
    'https://images.unsplash.com/photo-1484024091473-858a1e7ece52?w=600',
    'https://images.unsplash.com/photo-1587534012737-1fd8a84b519e?w=600',
    'https://images.unsplash.com/photo-1529111316-da2e2a1e625d?w=600',
    'https://images.unsplash.com/photo-1556217994-22de7face210?w=600',
    'https://images.unsplash.com/photo-1505049590664-32c45c900585?w=600',
    'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600',
    'https://images.unsplash.com/photo-1586254116951-5263e2cdb44c?w=600',
    'https://images.unsplash.com/photo-1517320069935-381614f8c1e5?w=600',
    'https://images.unsplash.com/photo-1627886107121-b7daaede3974?w=600',
    'https://images.unsplash.com/photo-1508920291026-c344bbfca1ab?w=600',
    'https://images.unsplash.com/photo-1601467450590-8c3d11cde2fd?w=600',
    'https://images.unsplash.com/photo-1581558775369-0fe7925f0035?w=600',
    'https://images.unsplash.com/photo-1548486354-1b48379fd7a7?w=600',
    'https://images.unsplash.com/photo-1607407224983-344ce8ad5f88?w=600',
  ],
  'Lighting Fixtures': [
    'https://images.unsplash.com/photo-1627306411131-358d6d0fd2cb?w=600',
    'https://images.unsplash.com/photo-1532951842694-e22cbcf22ae0?w=600',
    'https://images.unsplash.com/photo-1544125488-1bd845a0d0c5?w=600',
    'https://images.unsplash.com/photo-1588436199489-ac376a0b3884?w=600',
    'https://images.unsplash.com/photo-1476886188504-fd741bfc8e8a?w=600',
    'https://images.unsplash.com/photo-1546379045-bfd4808b24d0?w=600',
    'https://images.unsplash.com/photo-1676103391619-8de758b28b53?w=600',
    'https://images.unsplash.com/photo-1584537330618-5aa40b45e43d?w=600',
    'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=600',
    'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=600',
    'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600',
    'https://images.unsplash.com/photo-1592622515232-6e3e2a0d3d9a?w=600',
    'https://images.unsplash.com/photo-1604610728890-6f4b631ed081?w=600',
    'https://images.unsplash.com/photo-1512418408532-5445158b1445?w=600',
    'https://images.unsplash.com/photo-1568102106687-13401de952dc?w=600',
    'https://images.unsplash.com/photo-1526116638181-d787e552d669?w=600',
    'https://images.unsplash.com/photo-1623049764132-988ddda3bbff?w=600',
    'https://images.unsplash.com/photo-1762631817831-c3e7ee1b1467?w=600',
    'https://images.unsplash.com/photo-1760977817633-86910d0dfe3d?w=600',
    'https://images.unsplash.com/photo-1775660922989-f0c624413269?w=600',
  ],
  'Bulbs & Lamps': [
    'https://images.unsplash.com/photo-1529310399831-ed472b81d589?w=600',
    'https://images.unsplash.com/photo-1532007271951-c487760934ae?w=600',
    'https://images.unsplash.com/photo-1485119502162-016e4409beab?w=600',
    'https://images.unsplash.com/photo-1495291916458-c12f594151e7?w=600',
    'https://images.unsplash.com/photo-1556401615-c909c3d67480?w=600',
    'https://images.unsplash.com/photo-1552529232-9e6cb081de19?w=600',
    'https://images.unsplash.com/photo-1674659719067-8735479ba10c?w=600',
    'https://images.unsplash.com/photo-1590845947698-8924d7409b56?w=600',
    'https://images.unsplash.com/photo-1590845947670-c009801ffa74?w=600',
    'https://images.unsplash.com/photo-1516715573475-908ea40e5c9a?w=600',
    'https://images.unsplash.com/photo-1775876201255-509501deb444?w=600',
  ],
  'Solar & Outdoor': [
    'https://images.unsplash.com/photo-1775646239349-49a01e01e203?w=600',
    'https://images.unsplash.com/photo-1778855400423-b8208c9ed9df?w=600',
    'https://images.unsplash.com/photo-1708603993198-19a9ac60aeff?w=600',
    'https://images.unsplash.com/photo-1722538689384-b315c812a194?w=600',
    'https://images.unsplash.com/photo-1774534577225-0306df42aef0?w=600',
    'https://images.unsplash.com/photo-1770775574703-74bb78e8d796?w=600',
    'https://images.unsplash.com/photo-1769924107887-7e12b5f60692?w=600',
    'https://images.unsplash.com/photo-1777720810485-1651f4c7653a?w=600',
    'https://images.unsplash.com/photo-1777720810432-edbc23b0cd8a?w=600',
    'https://images.unsplash.com/photo-1773166358539-645044ce37b5?w=600',
    'https://images.unsplash.com/photo-1764760764956-d3ad5f37150b?w=600',
    'https://images.unsplash.com/photo-1770708211131-a8fa6de2b105?w=600',
    'https://images.unsplash.com/photo-1777565528593-39e84718c738?w=600',
    'https://images.unsplash.com/photo-1512076462737-1c7e21a00b1c?w=600',
  ],
  'Cables & Wiring': [
    'https://images.unsplash.com/photo-1518181835702-6eef8b4b2113?w=600',
    'https://images.unsplash.com/photo-1584774354932-62ceb99e6053?w=600',
    'https://images.unsplash.com/photo-1717667745852-a5bd6876c1de?w=600',
    'https://images.unsplash.com/photo-1687038520579-8d8f24721267?w=600',
    'https://images.unsplash.com/photo-1687038520563-2310e8b06ed2?w=600',
    'https://images.unsplash.com/photo-1687038520693-e528c10e450a?w=600',
    'https://images.unsplash.com/photo-1584809923235-fabdba83d1df?w=600',
    'https://images.unsplash.com/photo-1614903756535-8a6863184e02?w=600',
    'https://images.unsplash.com/photo-1635335874521-7987db781153?w=600',
    'https://images.unsplash.com/photo-1566417110090-6b15a06ec800?w=600',
    'https://images.unsplash.com/photo-1576446470246-499c738d1c8e?w=600',
    'https://images.unsplash.com/photo-1607631697491-61972eecf928?w=600',
    'https://images.unsplash.com/photo-1652715648725-c84d5035e9a2?w=600',
    'https://images.unsplash.com/photo-1761064039597-908570d50c23?w=600',
    'https://images.unsplash.com/photo-1761251947512-a293e482919f?w=600',
    'https://images.unsplash.com/photo-1769013649427-31c0d746bd7b?w=600',
    'https://images.unsplash.com/photo-1601955431290-3c57f6871bef?w=600',
  ],
  'Appliances': [
    'https://images.unsplash.com/photo-1643114786355-ff9e52736eab?w=600',
    'https://images.unsplash.com/photo-1738520420652-0c47cea3922b?w=600',
    'https://images.unsplash.com/photo-1618506408870-64d8bec48248?w=600',
    'https://images.unsplash.com/photo-1738520420636-a1591b84723e?w=600',
    'https://images.unsplash.com/photo-1643114938504-370d9376e946?w=600',
    'https://images.unsplash.com/photo-1630617867674-3905ea203152?w=600',
    'https://images.unsplash.com/photo-1597439651585-2f5b7e314e8f?w=600',
    'https://images.unsplash.com/photo-1748408082799-94daff13e792?w=600',
    'https://images.unsplash.com/photo-1603437077199-463272de17c6?w=600',
    'https://images.unsplash.com/photo-1649083048819-3fcd37423f45?w=600',
    'https://images.unsplash.com/photo-1659720879195-d5a108231648?w=600',
    'https://images.unsplash.com/photo-1776348065117-02285a905b0b?w=600',
    'https://images.unsplash.com/photo-1777880305920-e542f575f4e9?w=600',
    'https://images.unsplash.com/photo-1634344656611-0773d8dbbe2c?w=600',
  ],
  'General': [
    'https://images.unsplash.com/photo-1558002038-1055907df827?w=600',
    'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=600',
    'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600',
  ],
};

// LED strip / specialty sub-pool
const ledStripPool = [
  'https://images.unsplash.com/photo-1618403323851-ac3d38029495?w=600',
  'https://images.unsplash.com/photo-1572249930263-64fc5bbdb14b?w=600',
  'https://images.unsplash.com/photo-1659066019874-7a15628cea60?w=600',
  'https://images.unsplash.com/photo-1518656291-ba160b5554e9?w=600',
  'https://images.unsplash.com/photo-1581818645268-e82785053961?w=600',
  'https://images.unsplash.com/photo-1559642147-97be7782c7b3?w=600',
  'https://images.unsplash.com/photo-1601698014913-5be33dd3ebee?w=600',
  'https://images.unsplash.com/photo-1607028309125-07ae7e22b7e9?w=600',
];

function categorise(text) {
  const t = text.toLowerCase();
  if (/\b(socket|switch|usb|gang|dp|adapter|adaptor|surge|lampholder|holder|plug|extension)\b/.test(t)) return ['wiring', 'Switches & Sockets'];
  if (/\b(strip|rgb|neon)\b/.test(t)) return ['luxury', 'LED Strip'];
  if (/\b(chandelier|pendant|crystal|gold|wall light|sconce|down light|downlight|spot|panel|ceiling)\b/.test(t)) return ['luxury', 'Lighting Fixtures'];
  if (/\b(bulb|lamp|led|emergency|halogen|tube)\b/.test(t)) return ['luxury', 'Bulbs & Lamps'];
  if (/\b(solar|floodlight|flood light|street|high bay|highbay)\b/.test(t)) return ['solar', 'Solar & Outdoor'];
  if (/\b(cable|wire|earth|breaker|mcb|fuse|distribution|board|conduit)\b/.test(t)) return ['industrial', 'Cables & Wiring'];
  if (/\b(fan|cooler|kettle|iron|blender|appliance)\b/.test(t)) return ['appliances', 'Appliances'];
  return ['wiring', 'General'];
}

function clean(s) {
  return (s ?? '').trim().replace(/\s+/g, ' ').replace(/['"\\]/g, '');
}

function pickImage(sku, subcategory) {
  const pool = subcategory === 'LED Strip' ? ledStripPool : (imagePools[subcategory] || imagePools.General);
  const h = crypto.createHash('md5').update(sku).digest();
  const idx = h.readUInt32BE(0) % pool.length;
  return pool[idx];
}

const items = [];
const seen = new Set();

for (const line of lines) {
  const parts = line.split(',');
  if (parts.length < 4) continue;
  const a = clean(parts[1]);
  const b = clean(parts.slice(2, parts.length - 1).join(','));
  if (!a && !b) continue;

  const sku = (a || b.slice(0, 24)).toUpperCase();
  const name = b || a;
  const dedupKey = (sku + '|' + name).toLowerCase();

  if (seen.has(dedupKey)) continue;
  if (existingSkus.has(sku.toLowerCase())) continue;
  if (existingNames.has(name.toLowerCase())) continue;
  seen.add(dedupKey);

  const [category, subcategory] = categorise(`${a} ${b}`);
  // Normalise LED Strip back into Lighting Fixtures category label for storefront,
  // but use the strip-specific image pool.
  const displaySubcategory = subcategory === 'LED Strip' ? 'Lighting Fixtures' : subcategory;

  items.push({
    id: `csv${String(items.length + 1).padStart(4, '0')}`,
    sku,
    name,
    price: 0,
    category,
    subcategory: displaySubcategory,
    image: pickImage(sku, subcategory),
    stock: 100,
  });
}

const header = `// AUTO-GENERATED from src/imports/cofkans_items_A_plus_B.csv
// Run: node src/scripts/generate-csv-products.mjs
// Items here have price=0 (display as "Contact for Pricing") until edited via admin.

export interface CsvProduct {
  id: string;
  sku: string;
  name: string;
  price: number;
  category: string;
  subcategory: string;
  image: string;
  stock: number;
}

export const csvProducts: CsvProduct[] = ${JSON.stringify(items, null, 2)};
`;

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, header);
console.log(`Wrote ${items.length} new products to ${outPath}`);
