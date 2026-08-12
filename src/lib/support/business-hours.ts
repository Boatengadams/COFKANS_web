/**
 * Cofkans business hours — Africa/Accra (UTC+0, no DST).
 * Mon–Sat 07:30–16:30, closed Sunday.
 */

export const BUSINESS_HOURS_HUMAN = 'Mon–Sat · 07:30–16:30 GMT';

const OPEN_MIN = 7 * 60 + 30;   // 07:30
const CLOSE_MIN = 16 * 60 + 30; // 16:30

export function nowInAccra(): { day: number; minutes: number } {
  // Intl gives us Accra local components regardless of host TZ.
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Accra',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = fmt.formatToParts(new Date());
  const wd = parts.find(p => p.type === 'weekday')?.value ?? 'Mon';
  const hh = Number(parts.find(p => p.type === 'hour')?.value ?? '0');
  const mm = Number(parts.find(p => p.type === 'minute')?.value ?? '0');
  const dayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return { day: dayMap[wd] ?? 1, minutes: hh * 60 + mm };
}

export function isOpen(): boolean {
  const { day, minutes } = nowInAccra();
  if (day === 0) return false;
  return minutes >= OPEN_MIN && minutes < CLOSE_MIN;
}

export function statusLabel(): { open: boolean; label: string } {
  const open = isOpen();
  return { open, label: open ? 'Online now' : 'Outside hours' };
}

export function estimatedReplyMinutes(): number {
  return isOpen() ? 2 : 60;
}
