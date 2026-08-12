export type PaymentProvider = 'mtn-momo' | 'telecel-cash' | 'google-pay' | 'apple-pay' | 'cash';

export interface PaymentMethodMeta {
  id: PaymentProvider;
  label: string;
  short: string;
  region: 'local' | 'global';
  description: string;
}

export interface SavedPaymentMethod {
  id: string;
  provider: PaymentProvider;
  label: string;
  /** Last-4 digits for mobile money, "auto" for Google/Apple Pay billing */
  hint: string;
  isDefault: boolean;
  addedAt: number;
}

export const PAYMENT_METHODS: PaymentMethodMeta[] = [
  { id: 'mtn-momo', label: 'MTN Mobile Money', short: 'MTN MoMo', region: 'local', description: 'Pay with your MTN number — receive a prompt on your phone.' },
  { id: 'telecel-cash', label: 'Telecel Cash', short: 'Telecel', region: 'local', description: 'Pay with your Telecel number — approve on USSD prompt.' },
  { id: 'google-pay', label: 'Google Pay', short: 'G Pay', region: 'global', description: 'One-tap pay using your Google billing account.' },
  { id: 'apple-pay', label: 'Apple Pay', short: ' Pay', region: 'global', description: 'One-tap pay using your Apple billing account (Face ID / Touch ID).' },
];

export const detectPreferredGlobal = (): 'google-pay' | 'apple-pay' => {
  if (typeof window === 'undefined') return 'google-pay';
  const ua = navigator.userAgent || '';
  return /iPad|iPhone|iPod|Macintosh/.test(ua) ? 'apple-pay' : 'google-pay';
};
