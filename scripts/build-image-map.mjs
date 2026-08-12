#!/usr/bin/env node
// Regenerates src/lib/product-image-map.ts from src/imports/cofkans_electricals_urls.csv
import fs from 'node:fs';
import path from 'node:path';

const CSV = 'src/imports/cofkans_electricals_urls.csv';
const OUT = 'src/lib/product-image-map.ts';

const norm = (s) =>
  s.toLowerCase()
   .replace(/\.(png|jpg|jpeg|webp|gif|svg)$/i, '')
   .replace(/[^a-z0-9]+/g, ' ')
   .trim()
   .replace(/\s+/g, ' ');

const lines = fs.readFileSync(CSV, 'utf8').split('\n').slice(1).filter(Boolean);
const map = {};
let skipped = 0;
for (const line of lines) {
  const idx = line.indexOf(',');
  if (idx < 0) continue;
  const filename = line.slice(0, idx);
  const url = line.slice(idx + 1).trim();
  const key = norm(filename);
  // Skip UUID-named and timestamp-prefixed files — they don't map to product names.
  if (!key || /^[0-9a-f]{8} [0-9a-f]{4} [0-9a-f]{4}/.test(key) || /^2026/.test(key)) {
    skipped++;
    continue;
  }
  if (!map[key]) map[key] = url;
}

const out = `// AUTO-GENERATED from ${CSV}
// Do not edit by hand. Run \`npm run build:image-map\` to regenerate.

export const PRODUCT_IMAGE_URLS: Record<string, string> = ${JSON.stringify(map, null, 2)};

export function normalizeProductKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/\\.(png|jpg|jpeg|webp|gif|svg)$/i, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\\s+/g, ' ');
}

export function lookupProductImage(name: string | undefined | null): string | null {
  if (!name) return null;
  return PRODUCT_IMAGE_URLS[normalizeProductKey(name)] ?? null;
}
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, out);
console.log(`Wrote ${OUT} — ${Object.keys(map).length} mapped, ${skipped} skipped.`);
