import type { StatusBadgeProps } from './StatusBadge';

const toneClasses = {
  success: 'bg-[var(--brand-success-bg)] text-[var(--brand-success)]',
  warning: 'bg-[var(--brand-warning-bg)] text-[var(--brand-warning)]',
  danger: 'bg-[var(--brand-danger-bg)] text-[var(--brand-danger)]',
  info: 'bg-[var(--brand-info-bg)] text-[var(--brand-info)]',
} as const;

export function StatusBadge({ tone, children, className = '' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex max-w-full items-center rounded-[var(--brand-radius-full)] px-[var(--brand-space-sm)] py-[var(--brand-space-xs)] text-[var(--brand-font-xs)] font-semibold leading-none ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
