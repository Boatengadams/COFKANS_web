import { describe, expect, it } from 'vitest';
import { validatePaystackConfig } from '../use-paystack';

const validConfig = {
  publicKey: 'pk_test_123',
  email: 'customer@example.com',
  amount: 10_000,
  reference: 'CFK-TEST-123',
} as const;

describe('validatePaystackConfig', () => {
  it('accepts a structurally valid Paystack config', () => {
    expect(validatePaystackConfig(validConfig)).toBeNull();
  });

  it('rejects secret keys at the client boundary', () => {
    expect(validatePaystackConfig({ ...validConfig, publicKey: 'sk_test_123' })).toMatch(
      /public key looks invalid/i,
    );
  });

  it('requires a valid email and whole-pesewa amount', () => {
    expect(validatePaystackConfig({ ...validConfig, email: 'not-email' })).toMatch(
      /valid customer email/i,
    );
    expect(validatePaystackConfig({ ...validConfig, amount: 100.5 })).toMatch(/whole number/i);
  });
});
