import type { ProductMediaOverride, ProductUse, ProductVideo, UseIcon } from '@/stores/product-media-store';
import { useProductMediaStore } from '@/stores/product-media-store';
import { resolveImageUrl } from './product-image-map';

interface MinimalProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  subcategory: string;
  image: string;
  description?: string;
}

export interface ResolvedProductMedia {
  images: string[];
  videos: ProductVideo[];
  uses: ProductUse[];
  description: string;
}

// Deliberate branded state for products awaiting image upload. This keeps the
// catalogue honest instead of showing unrelated stock photography.
export const PRODUCT_IMAGE_PLACEHOLDER =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800"%3E%3Cdefs%3E%3CradialGradient id="g" cx="50%" cy="35%" r="75%"%3E%3Cstop stop-color="%23d7b65d" stop-opacity=".22"/%3E%3Cstop offset="1" stop-color="%230b1220" stop-opacity="0"/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width="800" height="800" fill="%230b1220"/%3E%3Crect width="800" height="800" fill="url(%23g)"/%3E%3Cpath d="M120 620h560M170 665h460" stroke="%23d7b65d" stroke-opacity=".35" stroke-width="2"/%3E%3Ccircle cx="400" cy="330" r="105" fill="none" stroke="%23d7b65d" stroke-opacity=".7" stroke-width="5"/%3E%3Cpath d="M345 330h110M400 275v110" stroke="%23d7b65d" stroke-opacity=".7" stroke-width="5"/%3E%3Ctext x="400" y="535" fill="%23f8f4e8" font-family="Arial,sans-serif" font-size="34" font-weight="700" letter-spacing="7" text-anchor="middle"%3ECOFKANS%3C/text%3E%3Ctext x="400" y="575" fill="%23d7b65d" font-family="Arial,sans-serif" font-size="16" letter-spacing="4" text-anchor="middle"%3EELECTRICALS%3C/text%3E%3C/svg%3E';

const subcategoryUses: Record<string, ProductUse[]> = {
  Chandeliers: [
    { id: 'u-c1', icon: 'home', title: 'Living rooms', text: 'Centrepiece lighting for high-ceiling lounges and dining halls.' },
    { id: 'u-c2', icon: 'building', title: 'Hotels & lobbies', text: 'Premium ambient lighting that creates a luxurious first impression.' },
    { id: 'u-c3', icon: 'sparkles', title: 'Event venues', text: 'Elegant statement piece for weddings and conference halls.' },
  ],
  Bulbs: [
    { id: 'u-b1', icon: 'home', title: 'Home lighting', text: 'Bright, energy-efficient illumination for any room in the house.' },
    { id: 'u-b2', icon: 'leaf', title: 'Energy saving', text: 'Up to 80% less power than incandescent bulbs with the same brightness.' },
    { id: 'u-b3', icon: 'bolt', title: 'Long life', text: 'Rated for 25,000+ hours — fewer replacements, lower running cost.' },
  ],
  Switches: [
    { id: 'u-s1', icon: 'home', title: 'Residential wiring', text: 'Reliable on/off control for lights and small appliances in homes.' },
    { id: 'u-s2', icon: 'building', title: 'Office fit-outs', text: 'Modern fascia and durable mechanism rated for high-traffic spaces.' },
    { id: 'u-s3', icon: 'shield', title: 'Safety certified', text: 'Built to international standards with anti-shock construction.' },
  ],
  Sockets: [
    { id: 'u-so1', icon: 'plug', title: 'Power points', text: 'Standard 13A power supply for everyday appliances and electronics.' },
    { id: 'u-so2', icon: 'home', title: 'Home & office', text: 'Suitable for kitchens, bedrooms, workshops and commercial spaces.' },
    { id: 'u-so3', icon: 'shield', title: 'Surge resilient', text: 'Robust contacts and shutter protection for safer everyday use.' },
  ],
  'Solar Panels': [
    { id: 'u-sp1', icon: 'sun', title: 'Off-grid power', text: 'Generate clean electricity for homes, farms and remote facilities.' },
    { id: 'u-sp2', icon: 'leaf', title: 'Lower bills', text: 'Cut grid dependency and save on ECG bills month after month.' },
    { id: 'u-sp3', icon: 'bolt', title: 'Backup ready', text: 'Pairs with inverters and batteries for uninterrupted supply.' },
  ],
  Inverters: [
    { id: 'u-iv1', icon: 'bolt', title: 'Backup power', text: 'Keeps lights, fans and electronics running during outages.' },
    { id: 'u-iv2', icon: 'home', title: 'Home & shops', text: 'Right-sized for residential apartments and small businesses.' },
    { id: 'u-iv3', icon: 'shield', title: 'Surge protection', text: 'Pure-sine output safe for sensitive electronics and TVs.' },
  ],
  'Ceiling Fans': [
    { id: 'u-cf1', icon: 'fan', title: 'Cool living spaces', text: 'Powerful airflow for bedrooms, living rooms and verandas.' },
    { id: 'u-cf2', icon: 'leaf', title: 'Low energy', text: 'Efficient motor draws minimal power for all-day comfort.' },
    { id: 'u-cf3', icon: 'home', title: 'Quiet operation', text: 'Balanced blades for whisper-quiet performance through the night.' },
  ],
  Cables: [
    { id: 'u-cb1', icon: 'home', title: 'House wiring', text: 'Approved for fixed installations in walls, conduits and trunking.' },
    { id: 'u-cb2', icon: 'shield', title: 'Heat resistant', text: 'PVC insulation rated for tropical climates and high-load circuits.' },
    { id: 'u-cb3', icon: 'wrench', title: 'Easy to install', text: 'Flexible copper conductors for clean terminations.' },
  ],
};

const defaultUses: ProductUse[] = [
  { id: 'u-d1', icon: 'home', title: 'Home use', text: 'Built for the demands of everyday Ghanaian households.' },
  { id: 'u-d2', icon: 'building', title: 'Commercial spaces', text: 'Suitable for shops, offices and small businesses.' },
  { id: 'u-d3', icon: 'shield', title: 'Quality assured', text: 'Genuine product from authorised distributors with full warranty.' },
];

function buildImages(p: MinimalProduct): string[] {
  return p.image ? [resolveImageUrl(p.image)] : [PRODUCT_IMAGE_PLACEHOLDER];
}

function buildDescription(p: MinimalProduct): string {
  if (p.description && p.description.trim()) return p.description;
  const sub = (p.subcategory || p.category || 'electrical').toLowerCase();
  return `${p.name ?? 'This product'} (SKU ${p.sku ?? '—'}) — a genuine ${sub} product from Cofkans Electricals. Designed for reliable performance in Ghanaian homes and businesses, backed by manufacturer warranty and our 12-month workmanship guarantee on installation.`;
}

function buildUses(p: MinimalProduct): ProductUse[] {
  return subcategoryUses[p.subcategory] ?? defaultUses;
}

export function getProductMedia(product: MinimalProduct): ResolvedProductMedia {
  try {
    const override: ProductMediaOverride | undefined =
      useProductMediaStore.getState().overrides[product.id];

    const rawImages = override?.images?.length ? override.images : buildImages(product);
    const resolvedImages = rawImages.map(img => resolveImageUrl(img));

    return {
      images: resolvedImages,
      videos: override?.videos ?? [],
      uses: override?.uses?.length ? override.uses : buildUses(product),
      description: override?.description?.trim() ? override.description : buildDescription(product),
    };
  } catch (err) {
    // Never let bad/partial product data blank the whole page — degrade gracefully.
    console.error('getProductMedia failed, using fallback', err);
    return {
      images: product?.image ? [resolveImageUrl(product.image)] : [PRODUCT_IMAGE_PLACEHOLDER],
      videos: [],
      uses: defaultUses,
      description: product?.description?.trim() || 'Genuine product from Cofkans Electricals.',
    };
  }
}

export const USE_ICON_OPTIONS: { value: UseIcon; label: string }[] = [
  { value: 'home', label: 'Home' },
  { value: 'building', label: 'Building' },
  { value: 'factory', label: 'Factory' },
  { value: 'sun', label: 'Sun' },
  { value: 'bolt', label: 'Bolt' },
  { value: 'shield', label: 'Shield' },
  { value: 'wrench', label: 'Wrench' },
  { value: 'leaf', label: 'Leaf' },
  { value: 'lightbulb', label: 'Lightbulb' },
  { value: 'plug', label: 'Plug' },
  { value: 'fan', label: 'Fan' },
  { value: 'sparkles', label: 'Sparkles' },
];

export function parseEmbedUrl(url: string): { kind: 'youtube' | 'vimeo' | 'unknown'; embed: string } {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
  if (yt) return { kind: 'youtube', embed: `https://www.youtube.com/embed/${yt[1]}` };
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return { kind: 'vimeo', embed: `https://player.vimeo.com/video/${vm[1]}` };
  return { kind: 'unknown', embed: url };
}
