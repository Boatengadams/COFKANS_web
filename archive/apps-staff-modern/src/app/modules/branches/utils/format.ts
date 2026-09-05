/**
 * Multi-Branch Module — formatting helpers.
 * Pure functions, no side effects.
 */

/** Format an amount in Ghana Cedis, e.g. 1250 → "GH₵ 1,250.00". */
export function formatCedis(amount: number): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  return `GH₵ ${safe.toLocaleString('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Short date, e.g. "10 Jul 2026". */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GH', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** Date + time, e.g. "10 Jul 2026, 14:30". */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-GH', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

/** Percentage with a sign, e.g. 12.5 → "+12.5%", -3 → "-3.0%". */
export function formatPct(pct: number): string {
  const safe = Number.isFinite(pct) ? pct : 0;
  const sign = safe > 0 ? '+' : '';
  return `${sign}${safe.toFixed(1)}%`;
}
