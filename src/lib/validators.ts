import { z } from 'zod';

// OWASP A03 (Injection) + A04 (Insecure Design): every Firestore write must
// pass through a zod schema before touching the network. Schemas enforce
// type, length, range, and pattern — defense in depth alongside Firestore
// security rules.

const MAX_PRICE = 1_000_000; // GH₵ — must match firestore-security.rules isValidPrice()
const MAX_QTY = 99;

const ctrlChars = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;
const htmlEscapes: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
};

/** Strip control chars, normalize unicode, collapse whitespace, cap length. */
export function sanitizeString(input: unknown, maxLen = 500): string {
  if (typeof input !== 'string') return '';
  return input
    .normalize('NFKC')
    .replace(ctrlChars, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

/** Escape every HTML-significant character. Use before injecting user text into the DOM. */
export function escapeHtml(input: unknown): string {
  const s = sanitizeString(input, 5000);
  return s.replace(/[&<>"'`/]/g, (c) => htmlEscapes[c]);
}

/** Strict numeric coercion that rejects NaN/Infinity. */
const safeNumber = z.preprocess(
  (v) => (typeof v === 'string' ? Number(v) : v),
  z.number().finite().safe(),
);

const sanitizedString = (max = 200) =>
  z.preprocess((v) => sanitizeString(v, max), z.string().min(1).max(max));

const optionalSanitizedString = (max = 200) =>
  z.preprocess((v) => (v == null ? '' : sanitizeString(v, max)), z.string().max(max));

export const priceOverrideSchema = z.object({
  sku: z.string().regex(/^[A-Z0-9._+\-/]{1,64}$/i, 'Invalid SKU format'),
  price: safeNumber.pipe(z.number().min(0).max(MAX_PRICE)),
});

export const cartItemSchema = z.object({
  productId: z.string().min(1).max(128),
  variantId: z.string().max(128).nullable(),
  sku: z.string().regex(/^[A-Z0-9._+\-/ ]{1,64}$/i),
  name: sanitizedString(200),
  image: z.string().url().max(2048).or(z.literal('')),
  price: safeNumber.pipe(z.number().min(0).max(MAX_PRICE)),
  quantity: z.number().int().min(1).max(MAX_QTY),
  customization: z.unknown().nullable(),
  isAvailable: z.boolean(),
  stockLevel: z.number().int().min(0).max(100_000),
});

export const reviewSchema = z.object({
  productId: z.string().min(1).max(128),
  rating: z.number().int().min(1).max(5),
  comment: sanitizedString(2000),
  title: optionalSanitizedString(120),
});

const ghPhone = z.preprocess(
  (v) => (typeof v === 'string' ? v.replace(/\s+/g, '') : v),
  z.string().regex(/^(\+233|0)[2-5]\d{8}$/, 'Invalid Ghana phone number'),
);

export const addressSchema = z.object({
  fullName: sanitizedString(120),
  phone: ghPhone,
  street: sanitizedString(200),
  city: sanitizedString(80),
  region: optionalSanitizedString(80),
  landmark: optionalSanitizedString(120),
  isDefault: z.boolean().optional(),
});

export const profileUpdateSchema = z.object({
  displayName: optionalSanitizedString(80),
  phone: ghPhone.optional(),
  photoURL: z.string().url().max(2048).optional(),
});

/** Numeric value coming from public Firestore data. Use to defend against tampered reads. */
export function isSafePublicPrice(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= MAX_PRICE;
}

/** Convenience: parse + return user-facing error message, never the raw zod issue. */
export function safeParse<T>(schema: z.ZodType<T>, value: unknown): { ok: true; data: T } | { ok: false; error: string } {
  const result = schema.safeParse(value);
  if (result.success) return { ok: true, data: result.data };
  const first = result.error.issues[0];
  return { ok: false, error: first?.message ?? 'Invalid input' };
}
