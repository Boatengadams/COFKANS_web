/**
 * Multi-Branch Module — id / reference generators.
 */

/** Random id with an optional prefix, e.g. genId('trf') → "trf_l8x2k9a1". */
export function genId(prefix = 'id'): string {
  const rand = Math.random().toString(36).slice(2, 10);
  const time = Date.now().toString(36).slice(-4);
  return `${prefix}_${time}${rand}`;
}

/**
 * Human-facing sale/receipt reference, e.g. "KA-2026-000123".
 * `branchSlug` is reduced to initials, `seq` is zero-padded.
 */
export function genReference(branchSlug: string, seq: number): string {
  const initials = branchSlug
    .split('-')
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 3);
  const year = new Date().getFullYear();
  return `${initials}-${year}-${String(seq).padStart(6, '0')}`;
}
