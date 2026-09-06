/**
 * Branch directory.
 *
 * Seeded with the two real locations (Accra + Kumasi). Developers can add,
 * edit, or disable branches at runtime via the `branches` Firestore
 * collection (managed from the Developer Console → Staff & Sessions tab).
 *
 * The seed list is the cold-start fallback so checkout always has at least
 * one pickup option even if Firestore is briefly unreachable.
 */
import { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import { DEMO_MODE } from './demo-mode';

export interface Branch {
  slug: string;
  name: string;
  city: string;
  region: string;
  address: string;
  /** Primary phone (first entry in `phones` if present). Kept for backwards-
   *  compatibility with consumers that only read one number. */
  phone?: string;
  /** All public phone numbers for this branch in display form (e.g.
   *  "024-7603798"). First entry is primary. Stored alongside `phonesE164`. */
  phones?: string[];
  /** E.164 equivalents of `phones`, same order. Used for tel:/SMS links. */
  phonesE164?: string[];
  hours?: string;
  isActive: boolean;
  /** Flagship branch — surfaces a "Main Showroom" badge and sorts first. */
  isMain?: boolean;
  /** Sort key for storefront + checkout (lower = first). */
  displayOrder?: number;
  /** WGS84 latitude — from Firestore when present, else seed catalog. */
  lat?: number;
  /** WGS84 longitude — from Firestore when present, else seed catalog. */
  lng?: number;
}

export type CustomerCoords = { lat: number; lng: number };

/** Haversine distance in kilometres. */
export function distanceKm(a: CustomerCoords, b: CustomerCoords): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function branchHasCoords(b: Branch): b is Branch & { lat: number; lng: number } {
  return typeof b.lat === 'number' && Number.isFinite(b.lat)
    && typeof b.lng === 'number' && Number.isFinite(b.lng);
}

/** Default catalog order: displayOrder → main flag → name. */
export function sortBranchesCatalog(branches: Branch[]): Branch[] {
  return [...branches].sort((a, b) => {
    const ao = a.displayOrder ?? 9999;
    const bo = b.displayOrder ?? 9999;
    if (ao !== bo) return ao - bo;
    if (!!b.isMain !== !!a.isMain) return b.isMain ? 1 : -1;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Sort by distance from `origin` when both sides have coordinates.
 * Branches missing lat/lng keep relative catalog order at the end.
 */
export function sortBranchesByDistance(branches: Branch[], origin: CustomerCoords): Branch[] {
  const withDist: Array<{ branch: Branch; dist: number | null; idx: number }> = branches.map((branch, idx) => ({
    branch,
    dist: branchHasCoords(branch) ? distanceKm(origin, { lat: branch.lat, lng: branch.lng }) : null,
    idx,
  }));
  withDist.sort((a, b) => {
    if (a.dist == null && b.dist == null) return a.idx - b.idx;
    if (a.dist == null) return 1;
    if (b.dist == null) return -1;
    if (a.dist !== b.dist) return a.dist - b.dist;
    return a.idx - b.idx;
  });
  return withDist.map((row) => row.branch);
}

function parseCoord(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return undefined;
}

/** Read lat/lng from a Firestore branch doc (several historical field shapes). */
export function coordsFromBranchDoc(data: Record<string, unknown>): { lat?: number; lng?: number } {
  const lat = parseCoord(data.lat) ?? parseCoord(data.latitude);
  const lng = parseCoord(data.lng) ?? parseCoord(data.longitude);
  if (lat != null && lng != null) return { lat, lng };
  const location = data.location as { latitude?: number; longitude?: number } | undefined;
  if (location && typeof location.latitude === 'number' && typeof location.longitude === 'number') {
    return { lat: location.latitude, lng: location.longitude };
  }
  const geo = data.geo as { lat?: number; lng?: number } | undefined;
  if (geo && typeof geo.lat === 'number' && typeof geo.lng === 'number') {
    return { lat: geo.lat, lng: geo.lng };
  }
  return {};
}

const seedCoordsBySlug = (): Map<string, CustomerCoords> => {
  const map = new Map<string, CustomerCoords>();
  for (const b of SEED_BRANCHES) {
    if (branchHasCoords(b)) map.set(b.slug, { lat: b.lat, lng: b.lng });
  }
  return map;
};

/**
 * Convert a Ghana phone like "024-7603798" or "055 3298335" to E.164
 * "+233247603798". Returns the original if it doesn't look Ghanaian so we
 * never silently drop a number.
 */
function ghToE164(local: string): string {
  const digits = local.replace(/\D/g, '');
  if (digits.startsWith('233')) return '+' + digits;
  if (digits.startsWith('0') && digits.length === 10) return '+233' + digits.slice(1);
  return local;
}

function branch(b: Omit<Branch, 'phone' | 'phonesE164' | 'phones'> & { phones: string[] }): Branch {
  return {
    ...b,
    phones: b.phones,
    phonesE164: b.phones.map(ghToE164),
    phone: b.phones[0],
  };
}

/**
 * Real Cofkans Electricals branch network. Customers see these immediately
 * (no Firestore write required). Developers can override any field live by
 * syncing the seed into Firestore from the Branch portal.
 *
 * APPROXIMATION (client-only): lat/lng below are estimated area coordinates
 * for nearest-branch sorting. Live Firestore /branches docs currently omit
 * lat/lng — we merge these seed coords by slug in memory only and MUST NOT
 * write them into Firestore. Replace with real branch coordinates in
 * Firestore when available; seed fallback can then be removed.
 */
export const SEED_BRANCHES: Branch[] = [
  // Kumasi (Ashanti Region)
  branch({
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
    lat: 6.7004,
    lng: -1.6918,
  }),
  branch({
    slug: 'kumasi-adum',
    name: 'Cofkans Adum',
    city: 'Kumasi',
    region: 'Ashanti Region',
    address: 'Kataban Road, Adum, Kumasi',
    phones: ['055-3298335'],
    hours: 'Mon–Sat 8:00am – 5:00pm',
    isActive: true,
    displayOrder: 2,
    lat: 6.6885,
    lng: -1.6244,
  }),
  branch({
    slug: 'kumasi-pampaso',
    name: 'Cofkans Pampaso',
    city: 'Kumasi',
    region: 'Ashanti Region',
    address: 'Spare Parts Road, Pampaso, Kumasi',
    phones: ['024-4880484'],
    hours: 'Mon–Sat 8:00am – 5:00pm',
    isActive: true,
    displayOrder: 3,
    lat: 6.682,
    lng: -1.618,
  }),
  branch({
    slug: 'kumasi-abuakwa',
    name: 'Cofkans Abuakwa',
    city: 'Kumasi',
    region: 'Ashanti Region',
    address: 'Abuakwa, Opp. Shell Filling Station, Kumasi',
    phones: ['024-7603798'],
    hours: 'Mon–Sat 8:00am – 5:00pm',
    isActive: true,
    displayOrder: 4,
    lat: 6.712,
    lng: -1.65,
  }),
  branch({
    slug: 'kumasi-nkawie',
    name: 'Cofkans Nkawie',
    city: 'Nkawie',
    region: 'Ashanti Region',
    address: 'Nkawie, Opp. Nkawie Station',
    phones: ['025-7589662'],
    hours: 'Mon–Sat 8:00am – 5:00pm',
    isActive: true,
    displayOrder: 5,
    lat: 6.666,
    lng: -1.82,
  }),
  // Greater Accra Region
  branch({
    slug: 'accra-opera-square',
    name: 'Cofkans Opera Square',
    city: 'Accra',
    region: 'Greater Accra Region',
    address: 'Opera Square, near Melcom Weija Barrier (NIB Building), Accra',
    phones: ['024-8124728', '024-2443086'],
    hours: 'Mon–Sat 8:00am – 5:00pm',
    isActive: true,
    displayOrder: 6,
    lat: 5.5715,
    lng: -0.333,
  }),
  // Obuasi (Ashanti Region)
  branch({
    slug: 'obuasi-bediem',
    name: 'Cofkans Obuasi',
    city: 'Obuasi',
    region: 'Ashanti Region',
    address: 'Obuasi Bediem, Off Dunkwa Road (Star Oil Building)',
    phones: ['054-5226745'],
    hours: 'Mon–Sat 8:00am – 5:00pm',
    isActive: true,
    displayOrder: 7,
    lat: 6.202,
    lng: -1.683,
  }),
];

let cache: Branch[] = [...SEED_BRANCHES];

export function getBranchBySlug(slug: string): Branch | undefined {
  return cache.find((b) => b.slug === slug);
}

export function getActiveBranches(): Branch[] {
  return cache.filter((b) => b.isActive);
}

/** Live subscription to the `branches` Firestore collection. */
export function subscribeBranches(cb: (branches: Branch[]) => void): () => void {
  cb(cache);
  if (DEMO_MODE) return () => {};
  try {
    const unsub = onSnapshot(
      collection(db, 'branches'),
      (snap) => {
        const seedCoords = seedCoordsBySlug();
        const rows = snap.docs.map((d) => {
          const data = d.data() as Record<string, unknown>;
          const phones: string[] | undefined = Array.isArray(data.phones) && (data.phones as string[]).length
            ? (data.phones as string[])
            : data.phone ? [String(data.phone)] : undefined;
          const slug = String(data.slug || d.id);
          // Prefer real Firestore coords when present. Otherwise fall back to
          // seed estimates (client-side only — never persist fabricated coords).
          const fromDoc = coordsFromBranchDoc(data);
          const fromSeed = seedCoords.get(slug);
          const lat = fromDoc.lat ?? fromSeed?.lat;
          const lng = fromDoc.lng ?? fromSeed?.lng;
          return {
            slug,
            name: String(data.name || d.id),
            city: String(data.city || ''),
            region: String(data.region || ''),
            address: String(data.address || ''),
            phone: phones?.[0],
            phones,
            phonesE164: phones?.map(ghToE164),
            hours: typeof data.hours === 'string' ? data.hours : undefined,
            isActive: data.isActive !== false,
            isMain: data.isMain === true,
            displayOrder: typeof data.displayOrder === 'number' ? data.displayOrder : undefined,
            lat,
            lng,
          } as Branch;
        });
        // If Firestore is empty, keep the seed so checkout still works.
        cache = sortBranchesCatalog(rows.length ? rows : [...SEED_BRANCHES]);
        cb(cache);
      },
      (err) => {
        console.warn('[branches] subscription failed, using seed:', err?.message);
        cache = [...SEED_BRANCHES];
        cb(cache);
      },
    );
    return unsub;
  } catch (err) {
    console.warn('[branches] subscribe threw, using seed:', err);
    cb(cache);
    return () => {};
  }
}

/**
 * Subscribe to active branches. When `origin` is provided, sort by distance
 * (branches without coordinates stay at the end in catalog order).
 */
export function useBranches(activeOnly = true, origin: CustomerCoords | null = null): Branch[] {
  const [branches, setBranches] = useState<Branch[]>(
    activeOnly ? getActiveBranches() : cache,
  );
  useEffect(() => {
    return subscribeBranches((rows) => {
      const filtered = activeOnly ? rows.filter((b) => b.isActive) : rows;
      setBranches(origin ? sortBranchesByDistance(filtered, origin) : sortBranchesCatalog(filtered));
    });
  }, [activeOnly, origin?.lat, origin?.lng]);
  return branches;
}

/* ---------- Mutations (dev portal — passcode-gated at the call site) ---------- */

function stripUndefined<T extends Record<string, unknown>>(o: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(o)) if (v !== undefined) out[k] = v;
  return out as T;
}

export async function createBranch(b: Omit<Branch, 'slug'> & { slug?: string }) {
  const slug = (b.slug || b.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  await addDoc(collection(db, 'branches'), stripUndefined({
    ...b,
    slug,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));
}

export async function updateBranchDoc(docId: string, patch: Partial<Branch>) {
  await updateDoc(doc(db, 'branches', docId), stripUndefined({
    ...patch,
    updatedAt: serverTimestamp(),
  }));
}

export async function deleteBranchDoc(docId: string) {
  await deleteDoc(doc(db, 'branches', docId));
}

/** Useful for the dev panel — returns docs WITH their Firestore id. */
export function subscribeBranchesWithIds(
  cb: (rows: (Branch & { id: string })[]) => void,
): () => void {
  try {
    return onSnapshot(collection(db, 'branches'), (snap) => {
      cb(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as (Branch & {
          id: string;
        })[],
      );
    });
  } catch {
    cb([]);
    return () => {};
  }
}

// keep `query`/`where` imports used to avoid TS unused warnings if later trimmed
void query;
void where;
