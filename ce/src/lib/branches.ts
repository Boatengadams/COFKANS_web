/**
 * Cofkans Electricals — physical branch directory.
 * Coordinates are approximate; the developer portal lets staff fine-tune them.
 */

export interface Branch {
  slug: string;          // url-safe; used in /branch/:slug/login
  name: string;          // display name
  city: string;
  region: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  hours: string;         // human-readable for now; per-day map comes later
}

export const BRANCHES: Branch[] = [
  {
    slug: 'adum',
    name: 'Adum Branch',
    city: 'Kumasi',
    region: 'Ashanti',
    address: 'Adum, Kumasi',
    phone: '+233 30 000 0001',
    lat: 6.6925,
    lng: -1.6244,
    hours: 'Mon–Sat 08:00–18:00',
  },
  {
    slug: 'prempeh-ii',
    name: 'Prempeh II Street Branch',
    city: 'Kumasi',
    region: 'Ashanti',
    address: 'Prempeh II Street, Kumasi',
    phone: '+233 30 000 0002',
    lat: 6.6889,
    lng: -1.6213,
    hours: 'Mon–Sat 08:00–18:00',
  },
  {
    slug: 'pz',
    name: 'PZ Branch',
    city: 'Kumasi',
    region: 'Ashanti',
    address: 'PZ Area, Kumasi',
    phone: '+233 30 000 0003',
    lat: 6.6948,
    lng: -1.6175,
    hours: 'Mon–Sat 08:00–18:00',
  },
  {
    slug: 'abuakwa',
    name: 'Abuakwa Branch',
    city: 'Kumasi',
    region: 'Ashanti',
    address: 'Abuakwa, Kumasi',
    phone: '+233 30 000 0004',
    lat: 6.7090,
    lng: -1.7186,
    hours: 'Mon–Sat 08:00–18:00',
  },
  {
    slug: 'nkawie',
    name: 'Nkawie Branch',
    city: 'Nkawie',
    region: 'Ashanti',
    address: 'Nkawie Town',
    phone: '+233 30 000 0005',
    lat: 6.5847,
    lng: -1.8011,
    hours: 'Mon–Sat 08:00–18:00',
  },
  {
    slug: 'accra',
    name: 'Accra Branch',
    city: 'Accra',
    region: 'Greater Accra',
    address: 'Accra',
    phone: '+233 30 000 0006',
    lat: 5.6037,
    lng: -0.1870,
    hours: 'Mon–Sat 08:00–18:00',
  },
  {
    slug: 'obuasi',
    name: 'Obuasi Branch',
    city: 'Obuasi',
    region: 'Ashanti',
    address: 'Obuasi',
    phone: '+233 30 000 0007',
    lat: 6.2027,
    lng: -1.6700,
    hours: 'Mon–Sat 08:00–18:00',
  },
];

export function getBranchBySlug(slug: string): Branch | undefined {
  return BRANCHES.find(b => b.slug === slug.toLowerCase());
}

/** Haversine distance in kilometres. */
export function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function nearestBranch(lat: number, lng: number): Branch {
  return [...BRANCHES].sort(
    (a, b) => distanceKm(lat, lng, a.lat, a.lng) - distanceKm(lat, lng, b.lat, b.lng),
  )[0];
}
