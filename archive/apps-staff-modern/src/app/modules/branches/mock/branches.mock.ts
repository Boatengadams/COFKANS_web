/**
 * Multi-Branch Module — mock branch network (DEMO_MODE).
 *
 * Self-contained realistic data for all nine Cofkans Electricals locations
 * across the Ashanti, Greater Accra and (Obuasi) Ashanti mining belt. This is
 * the source of truth the rest of the module's mock data is built on, so it
 * intentionally does NOT depend on the storefront `SEED_BRANCHES` (which is a
 * smaller list) — it can carry branches the public seed doesn't have yet.
 */
import type { BranchDetail } from '../types/branch';

/** Convert a Ghana local number to E.164, e.g. "024-760 3798" → "+233247603798". */
function ghToE164(local: string): string {
  const digits = local.replace(/\D/g, '');
  if (digits.startsWith('233')) return '+' + digits;
  if (digits.startsWith('0') && digits.length === 10) return '+233' + digits.slice(1);
  return local;
}

const nowIso = new Date().toISOString();
const HOURS = 'Mon – Sat · 8:00am – 5:00pm (Sun closed)';

interface Seed {
  slug: string;
  name: string;
  city: string;
  region: string;
  address: string;
  phones: string[];
  isMain?: boolean;
  isActive?: boolean;
  status?: BranchDetail['status'];
  geo: { lat: number; lng: number };
  managerId: string;
  staffCount: number;
}

const SEEDS: Seed[] = [
  {
    slug: 'kumasi-asuoyeboa',
    name: 'Cofkans Asuoyeboa Showroom',
    city: 'Kumasi', region: 'Ashanti Region',
    address: 'Asuoyeboa-IPT Junction, Kumasi',
    phones: ['024-760 3798', '055 329 8335'],
    isMain: true,
    geo: { lat: 6.6885, lng: -1.6720 },
    managerId: 'usr-aban', staffCount: 8,
  },
  {
    slug: 'kumasi-adum',
    name: 'Cofkans Adum',
    city: 'Kumasi', region: 'Ashanti Region',
    address: 'Prempeh II Street, Adum, Kumasi',
    phones: ['024-738 1219'],
    geo: { lat: 6.6931, lng: -1.6244 },
    managerId: 'usr-kwabena', staffCount: 4,
  },
  {
    slug: 'kumasi-pampaso',
    name: 'Cofkans Pampaso',
    city: 'Kumasi', region: 'Ashanti Region',
    address: 'Pampaso, Off Lake Road, Kumasi',
    phones: ['020-812 4471'],
    geo: { lat: 6.7018, lng: -1.6157 },
    managerId: 'usr-yaa', staffCount: 3,
  },
  {
    slug: 'kumasi-abuakwa',
    name: 'Cofkans Abuakwa',
    city: 'Kumasi', region: 'Ashanti Region',
    address: 'Abuakwa Maakro, Kumasi–Sunyani Road',
    phones: ['054-901 2288'],
    geo: { lat: 6.6997, lng: -1.7286 },
    managerId: 'usr-kofi', staffCount: 3,
  },
  {
    slug: 'kumasi-nkawie',
    name: 'Cofkans Nkawie',
    city: 'Nkawie', region: 'Ashanti Region',
    address: 'Nkawie Toase Main Road, Atwima Nwabiagya',
    phones: ['026-554 7130'],
    geo: { lat: 6.6483, lng: -1.7842 },
    managerId: 'usr-adjoa', staffCount: 2,
  },
  {
    slug: 'accra-opera-square',
    name: 'Cofkans Opera Square',
    city: 'Accra', region: 'Greater Accra Region',
    address: 'Opera Square, Kimberly Avenue, Accra Central',
    phones: ['030-266 1042', '024-419 0087'],
    geo: { lat: 5.5471, lng: -0.2109 },
    managerId: 'usr-mensah', staffCount: 5,
  },
  {
    slug: 'accra-weija-barrier',
    name: 'Cofkans Weija Barrier',
    city: 'Accra', region: 'Greater Accra Region',
    address: 'Weija Barrier, Winneba Road, Ga South',
    phones: ['055-712 6690'],
    geo: { lat: 5.5622, lng: -0.3411 },
    managerId: 'usr-esi', staffCount: 3,
  },
  {
    slug: 'obuasi-bediem',
    name: 'Cofkans Obuasi Bediem',
    city: 'Obuasi', region: 'Ashanti Region',
    address: 'Bediem, Obuasi Municipal',
    phones: ['024-880 5514'],
    geo: { lat: 6.2027, lng: -1.6690 },
    managerId: 'usr-nana', staffCount: 3,
  },
  {
    slug: 'obuasi-central',
    name: 'Cofkans Obuasi',
    city: 'Obuasi', region: 'Ashanti Region',
    address: 'Central Market Road, Obuasi',
    phones: ['020-334 7781'],
    status: 'maintenance',
    geo: { lat: 6.2020, lng: -1.6663 },
    managerId: 'usr-yaw-b', staffCount: 2,
  },
];

/** All nine branches as full BranchDetail records. */
export const MOCK_BRANCH_DETAILS: BranchDetail[] = SEEDS.map((s, i) => {
  const isActive = s.isActive ?? s.status !== 'archived';
  return {
    slug: s.slug,
    name: s.name,
    city: s.city,
    region: s.region,
    address: s.address,
    phones: s.phones,
    phonesE164: s.phones.map(ghToE164),
    phone: s.phones[0],
    hours: HOURS,
    isActive,
    isMain: s.isMain,
    displayOrder: i,
    status: s.status ?? (isActive ? 'open' : 'closed'),
    geo: s.geo,
    managerId: s.managerId,
    staffCount: s.staffCount,
    lastStockCountAt: nowIso,
    createdAt: nowIso,
    updatedAt: nowIso,
  } satisfies BranchDetail;
});

/** All branch slugs, in display order. */
export const MOCK_BRANCH_SLUGS: string[] = MOCK_BRANCH_DETAILS.map((b) => b.slug);

/** Slug of the flagship showroom (source of most stock transfers). */
export const SHOWROOM_SLUG = 'kumasi-asuoyeboa';
