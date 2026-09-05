import { useMemo } from 'react';
import { Phone } from 'lucide-react';

/**
 * Ghana phone input — the +233 prefix is baked into the UI; the user types
 * only the nine subscriber digits. The very first digit cannot be 0
 * (Ghanaian mobile numbers begin with 2/3/5/6/7 after the country code).
 *
 * `value` is always the full E.164 number (e.g. "+233241234567") or "" when
 * blank. The component never lets a leading 0 stay in the local part.
 */
export interface PhoneInputGHProps {
  value: string;
  onChange: (e164: string) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

function digitsFromValue(value: string): string {
  // Strip everything except digits, drop a leading 233 if it slipped in.
  let d = (value || '').replace(/\D/g, '');
  if (d.startsWith('233')) d = d.slice(3);
  // Skip leading zeros — the user must enter the subscriber number directly.
  d = d.replace(/^0+/, '');
  return d.slice(0, 9);
}

export function PhoneInputGH({
  value,
  onChange,
  required,
  disabled,
  className,
  placeholder = '24 123 4567',
}: PhoneInputGHProps) {
  const local = useMemo(() => digitsFromValue(value), [value]);

  const display = useMemo(() => {
    // Pretty-format as "XX XXX XXXX" while typing.
    const parts = [local.slice(0, 2), local.slice(2, 5), local.slice(5, 9)].filter(Boolean);
    return parts.join(' ');
  }, [local]);

  const emit = (raw: string) => {
    const clean = digitsFromValue(raw);
    onChange(clean.length === 9 ? `+233${clean}` : clean.length === 0 ? '' : `+233${clean}`);
  };

  return (
    <div className={`flex items-stretch border-2 border-border rounded-xl bg-background focus-within:border-primary overflow-hidden ${className || ''}`}>
      <div className="flex items-center gap-2 px-3 bg-muted/50 border-r-2 border-border select-none">
        <Phone className="w-4 h-4 text-muted-foreground" />
        <span className="font-bold text-sm">+233</span>
      </div>
      <input
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        value={display}
        onChange={(e) => emit(e.target.value)}
        onKeyDown={(e) => {
          // Block typing a leading "0" when the field is empty.
          if (e.key === '0' && local.length === 0) e.preventDefault();
        }}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        maxLength={12}
        className="flex-1 px-3 py-3 bg-transparent outline-none text-sm tracking-wide"
      />
    </div>
  );
}
