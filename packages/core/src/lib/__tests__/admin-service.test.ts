import { describe, expect, it, vi } from 'vitest';

vi.mock('../firebase', () => ({ db: {}, auth: { currentUser: null } }));
vi.mock('../security-service', () => ({ logAuditEvent: vi.fn() }));
vi.mock('../demo-mode', () => ({
  getPublicEnv: () => '',
}));
vi.mock('../auth-claims', () => ({
  hasDeveloperClaim: vi.fn(async () => false),
}));

describe('admin-service authorization helpers', async () => {
  const mod = await import('../admin-service');
  const { hasDeveloperClaim } = await import('../auth-claims');

  it('delegates isDeveloper to the Auth custom claim', async () => {
    vi.mocked(hasDeveloperClaim).mockResolvedValueOnce(true);
    expect(await mod.isDeveloper()).toBe(true);

    vi.mocked(hasDeveloperClaim).mockResolvedValueOnce(false);
    expect(await mod.isDeveloper()).toBe(false);
  });

  it('recognizes company email addresses', () => {
    expect(mod.isCompanyEmail('staff@cofkanselectricals.com')).toBe(true);
    expect(mod.isCompanyEmail('staff@example.com')).toBe(false);
  });

  it('never assigns developer role from email alone', () => {
    expect(mod.getRoleFromEmail('anyone@example.com')).toBe('customer');
    expect(mod.getRoleFromEmail('staff@cofkanselectricals.com')).toBe('customer');
  });
});
