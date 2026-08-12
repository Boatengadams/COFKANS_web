import type { ProductMediaOverride, ProductUse, ProductVideo, UseIcon } from '@/stores/product-media-store';
import { useProductMediaStore } from '@/stores/product-media-store';

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

const UNSPLASH_FALLBACKS: Record<string, string[]> = {
  luxury: [
    'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=1200',
    'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=1200',
    'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=1200',
  ],
  solar: [
    'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200',
    'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=1200',
    'https://images.unsplash.com/photo-1559302995-f1d7e5c4d3df?w=1200',
  ],
  wiring: [
    'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=1200',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200',
    'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=1200',
  ],
  industrial: [
    'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=1200',
    'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=1200',
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200',
  ],
  appliances: [
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200',
    'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=1200',
    'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=1200',
  ],
};

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
  const main = p.image;
  const cat = UNSPLASH_FALLBACKS[p.category] ?? UNSPLASH_FALLBACKS.wiring;
  return [main, ...cat].slice(0, 4);
}

function buildDescription(p: MinimalProduct): string {
  if (p.description && p.description.trim()) return p.description;
  return `${p.name} (SKU ${p.sku}) — a genuine ${p.subcategory.toLowerCase()} product from Cofkans Electricals. Designed for reliable performance in Ghanaian homes and businesses, backed by manufacturer warranty and our 12-month workmanship guarantee on installation.`;
}

function buildUses(p: MinimalProduct): ProductUse[] {
  return subcategoryUses[p.subcategory] ?? defaultUses;
}

export function getProductMedia(product: MinimalProduct): ResolvedProductMedia {
  const override: ProductMediaOverride | undefined =
    useProductMediaStore.getState().overrides[product.id];

  return {
    images: override?.images?.length ? override.images : buildImages(product),
    videos: override?.videos ?? [],
    uses: override?.uses?.length ? override.uses : buildUses(product),
    description: override?.description?.trim() ? override.description : buildDescription(product),
  };
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
