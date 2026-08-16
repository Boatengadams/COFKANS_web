import { describe, expect, it, vi } from 'vitest';

vi.mock('../firebase', () => ({ db: {} }));
vi.mock('../security-service', () => ({ logAuditEvent: vi.fn() }));
vi.mock('../demo-mode', () => ({
  getPublicEnv: (name: string) =>
    name === 'DEVELOPER_EMAIL' ? 'dev@cofkanselectricals.com' : '',
}));

describe('admin-service authorization helpers', async () => {
  const mod = await import('../admin-service');

  it('recognizes the configured developer email case-insensitively', () => {
    expect(mod.isDeveloper('DEV@cofkanselectricals.com')).toBe(true);
    expect(mod.isDeveloper('other@cofkanselectricals.com')).toBe(false);
  });

  it('recognizes company email addresses', () => {
    expect(mod.isCompanyEmail('staff@cofkanselectricals.com')).toBe(true);
    expect(mod.isCompanyEmail('staff@example.com')).toBe(false);
  });
});
