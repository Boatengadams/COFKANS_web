import { doc, getDoc, onSnapshot, setDoc, serverTimestamp, type Unsubscribe } from 'firebase/firestore';
import { db } from './firebase';

export interface BlackFridayTier { minQuantity: number; maxQuantity?: number; discountPercent: number }
export interface BlackFridayProduct {
  id: string; name: string; originalPrice: number; category: string; stock: number; image?: string; description?: string; discountTiers: BlackFridayTier[];
}
export interface BlackFridayCampaign {
  enabled: boolean; title: string; subtitle: string; startAt: string; endAt: string; products: BlackFridayProduct[]; updatedAt?: string;
}

const tiers: BlackFridayTier[] = [
  { minQuantity: 1, maxQuantity: 2, discountPercent: 0 },
  { minQuantity: 3, maxQuantity: 5, discountPercent: 10 },
  { minQuantity: 6, maxQuantity: 10, discountPercent: 20 },
  { minQuantity: 11, discountPercent: 30 },
];
const product = (id: string, name: string, originalPrice: number, category: string, stock: number): BlackFridayProduct => ({ id, name, originalPrice, category, stock, discountTiers: tiers.map(t => ({ ...t })) });

export const BLACK_FRIDAY_DEFAULTS: BlackFridayCampaign = {
  enabled: true,
  title: 'Black Friday savings',
  subtitle: 'Buy more, save more. Up to 30% off selected products.',
  startAt: '',
  endAt: '',
  products: [
    product('cfk_1001', '100W FLOODLIGHT GN TYPE (High Matrix)', 250, 'Outdoor Lighting', 10),
    product('cfk_1002', '100W FLOODLIGHT GN TYPE (Slim SMD)', 250, 'Outdoor Lighting', 10),
    product('cfk_1003', '100W FLOODLIGHT GN TYPE', 250, 'Outdoor Lighting', 10),
    product('cfk_1006', '150W LED FLOODLIGHT', 350, 'Outdoor Lighting', 10),
    product('cfk_1007', '150W STREET LIGHT (GRID PATTERN)', 350, 'Outdoor Lighting', 10),
    product('cfk_1008', '150W STREET LIGHT (POLE MOUNT)', 350, 'Outdoor Lighting', 10),
    product('cfk_1009', '150W STREET LIGHT', 350, 'Outdoor Lighting', 10),
    product('cfk_1025', '300W LED FLOODLIGHT (400W Variant)', 1500, 'Outdoor Lighting', 10),
    product('cfk_1037', '50W FLOODLIGHT GN TYPE (Slim SMD)', 180, 'Outdoor Lighting', 10),
  ],
};

function merge(value?: Partial<BlackFridayCampaign>): BlackFridayCampaign {
  return { ...BLACK_FRIDAY_DEFAULTS, ...(value ?? {}), products: Array.isArray(value?.products) ? value.products : BLACK_FRIDAY_DEFAULTS.products };
}

const ref = doc(db, 'siteContent', 'blackFriday');
export async function fetchBlackFriday(): Promise<BlackFridayCampaign> {
  try { const snap = await getDoc(ref); return merge(snap.exists() ? snap.data() as Partial<BlackFridayCampaign> : undefined); }
  catch { return BLACK_FRIDAY_DEFAULTS; }
}
export function subscribeBlackFriday(onChange: (campaign: BlackFridayCampaign) => void): Unsubscribe {
  return onSnapshot(ref, snap => onChange(merge(snap.exists() ? snap.data() as Partial<BlackFridayCampaign> : undefined)), () => onChange(BLACK_FRIDAY_DEFAULTS));
}
export async function saveBlackFriday(campaign: BlackFridayCampaign): Promise<void> {
  await setDoc(ref, { ...campaign, updatedAt: new Date().toISOString(), _updatedAt: serverTimestamp() }, { merge: true });
}
