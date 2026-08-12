/**
 * Cofkans business hours — Africa/Accra (UTC+0, no DST).
 * Mon–Fri 08:00–17:00, closed Sat & Sun.
 */

export const BUSINESS_HOURS_HUMAN = 'Mon–Fri · 08:00–17:00 GMT';

const OPEN_MIN = 8 * 60;    // 08:00
const CLOSE_MIN = 17 * 60;  // 17:00

export const PHONE_WORKING_HOURS = '+233 24 738 1412';
export const PHONE_AFTER_HOURS = '+1 417 424 5291';

export function nowInAccra(): { day: number; minutes: number } {
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
  if (day === 0 || day === 6) return false;
  return minutes >= OPEN_MIN && minutes < CLOSE_MIN;
}

export function statusLabel(): { open: boolean; label: string } {
  const open = isOpen();
  return { open, label: open ? 'Online now' : 'Outside hours' };
}

export function estimatedReplyMinutes(): number {
  return isOpen() ? 2 : 60;
}

export function supportPhone(): { display: string; tel: string; afterHours: boolean } {
  const afterHours = !isOpen();
  const display = afterHours ? PHONE_AFTER_HOURS : PHONE_WORKING_HOURS;
  return { display, tel: display.replace(/\s+/g, ''), afterHours };
}
