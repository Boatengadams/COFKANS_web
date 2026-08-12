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
}

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
        const rows = snap.docs.map((d) => {
          const data = d.data() as any;
          const phones: string[] | undefined = Array.isArray(data.phones) && data.phones.length
            ? data.phones
            : data.phone ? [data.phone] : undefined;
          return {
            slug: data.slug || d.id,
            name: data.name || d.id,
            city: data.city || '',
            region: data.region || '',
            address: data.address || '',
            phone: phones?.[0],
            phones,
            phonesE164: phones?.map(ghToE164),
            hours: data.hours,
            isActive: data.isActive !== false,
            isMain: data.isMain === true,
            displayOrder: typeof data.displayOrder === 'number' ? data.displayOrder : undefined,
          } as Branch;
        });
        // Sort: explicit displayOrder first, then main flag, then name.
        rows.sort((a, b) => {
          const ao = a.displayOrder ?? 9999;
          const bo = b.displayOrder ?? 9999;
          if (ao !== bo) return ao - bo;
          if (!!b.isMain !== !!a.isMain) return b.isMain ? 1 : -1;
          return a.name.localeCompare(b.name);
        });
        // If Firestore is empty, keep the seed so checkout still works.
        cache = rows.length ? rows : [...SEED_BRANCHES];
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

export function useBranches(activeOnly = true): Branch[] {
  const [branches, setBranches] = useState<Branch[]>(
    activeOnly ? getActiveBranches() : cache,
  );
  useEffect(() => {
    return subscribeBranches((rows) => {
      setBranches(activeOnly ? rows.filter((b) => b.isActive) : rows);
    });
  }, [activeOnly]);
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
