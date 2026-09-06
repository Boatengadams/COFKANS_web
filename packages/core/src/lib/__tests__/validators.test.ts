import { describe, expect, it } from 'vitest';
import {
  addressSchema,
  cartItemSchema,
  escapeHtml,
  reviewSchema,
  safeParse,
  sanitizeString,
} from '../validators';

describe('validators', () => {
  it('sanitizes control characters and collapses whitespace', () => {
    expect(sanitizeString('  Hello\u0000   Cofkans\n\nTeam  ')).toBe('Hello Cofkans Team');
  });

  it('escapes HTML-sensitive characters for DOM injection boundaries', () => {
    expect(escapeHtml('<script>alert("x")</script>')).toContain('&lt;script&gt;');
    expect(escapeHtml('<script>alert("x")</script>')).not.toContain('<script>');
  });

  it('rejects invalid cart quantities and unsafe image URLs', () => {
    const result = safeParse(cartItemSchema, {
      productId: 'p-1',
      variantId: null,
      sku: 'SKU-1',
      name: 'Cable',
      image: 'javascript:alert(1)',
      price: 25,
      quantity: 100,
      customization: null,
      isAvailable: true,
      stockLevel: 20,
    });

    expect(result.ok).toBe(false);
  });

  it('accepts local product image paths, empty image, and https URLs', () => {
    const base = {
      productId: 'p-1',
      variantId: null,
      sku: 'SKU-1',
      name: 'Floodlight',
      price: 25,
      quantity: 1,
      customization: null,
      isAvailable: true,
      stockLevel: 20,
    };
    expect(safeParse(cartItemSchema, { ...base, image: '/product-images/100W FLOODLIGHT GN TYPE.png' }).ok).toBe(true);
    expect(safeParse(cartItemSchema, { ...base, image: '/images/products/300W LED FLOODLIGHT.png' }).ok).toBe(true);
    expect(safeParse(cartItemSchema, { ...base, image: '' }).ok).toBe(true);
    expect(safeParse(cartItemSchema, { ...base, image: 'https://cdn.example.com/p.png' }).ok).toBe(true);
    expect(safeParse(cartItemSchema, { ...base, image: '//evil.com/x.png' }).ok).toBe(false);
    expect(safeParse(cartItemSchema, { ...base, image: '/etc/passwd' }).ok).toBe(false);
  });

  it('accepts a valid Ghana delivery address', () => {
    const result = safeParse(addressSchema, {
      fullName: 'Ama Boateng',
      phone: '+233241234567',
      street: 'Asuoyeboa Road',
      city: 'Kumasi',
      region: 'Ashanti',
    });

    expect(result.ok).toBe(true);
  });

  it('rejects out-of-range review ratings', () => {
    const result = safeParse(reviewSchema, {
      productId: 'p-1',
      rating: 6,
      comment: 'Great',
    });

    expect(result.ok).toBe(false);
  });
});
