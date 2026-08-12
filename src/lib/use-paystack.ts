/**
 * usePaystack — production-grade Paystack inline-popup hook.
 *
 * Why not react-paystack's `usePaystackPayment`?
 * That hook bakes the config (including `publicKey`) into the hook call at
 * component-mount time. If the key is empty on first render (e.g. env var
 * injected after hydration, or form email not yet filled), Paystack's inline
 * script throws "invalid key" immediately. This hook defers all validation
 * to the moment the user actually clicks "Pay", building the payload fresh
 * each time and loading the Paystack script lazily on first use.
 */

const PAYSTACK_SCRIPT_URL = 'https://js.paystack.co/v1/inline.js';

let scriptLoaded = false;
let scriptLoading: Promise<void> | null = null;

function loadPaystackScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (scriptLoaded || (window as any).PaystackPop) { scriptLoaded = true; return Promise.resolve(); }
  if (scriptLoading) return scriptLoading;

  scriptLoading = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${PAYSTACK_SCRIPT_URL}"]`) as HTMLScriptElement | null;
    if (existing) {
      if ((window as any).PaystackPop) { scriptLoaded = true; resolve(); return; }
      existing.addEventListener('load', () => { scriptLoaded = true; resolve(); });
      existing.addEventListener('error', () => {
        scriptLoading = null;
        reject(new Error('Paystack script failed to load (network/CSP blocked js.paystack.co).'));
      });
      return;
    }

    const script = document.createElement('script');
    script.src = PAYSTACK_SCRIPT_URL;
    script.async = true;
    // Do NOT set `crossOrigin = 'anonymous'`. Paystack's CDN does not return
    // Access-Control-Allow-Origin on inline.js, so a CORS-enabled request is
    // blocked by the browser (Firefox then logs a misleading CSP "source URI
    // not allowed" follow-on). Plain <script> loads work and match Paystack's
    // own docs.
    script.onload = () => { scriptLoaded = true; resolve(); };
    script.onerror = () => {
      scriptLoading = null;
      reject(new Error('Paystack script failed to load (network/CSP blocked js.paystack.co).'));
    };
    document.head.appendChild(script);
  });

  return scriptLoading;
}

/** Eagerly prefetch the Paystack script (e.g. when the payment step opens). */
export function preloadPaystackScript(): Promise<void> {
  return loadPaystackScript().catch(() => {});
}

/** True once the inline script has loaded and `PaystackPop` is on window. */
export function isPaystackReady(): boolean {
  return typeof window !== 'undefined' && !!(window as any).PaystackPop;
}

export interface PaystackConfig {
  /** Live public key: pk_live_… (never the secret key) */
  publicKey: string;
  email: string;
  /** Amount in GHS pesewas (GHS × 100, must be a positive integer) */
  amount: number;
  currency?: 'GHS';
  reference: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  metadata?: Record<string, unknown>;
}

export interface PaystackCallbacks {
  onSuccess: (transaction: { reference: string; status: string; [k: string]: any }) => void;
  onClose: () => void;
}

/**
 * Validates the Paystack config before calling the API.
 * Returns an error string or null if valid.
 */
export function validatePaystackConfig(cfg: PaystackConfig): string | null {
  if (!cfg.publicKey || cfg.publicKey.trim() === '') {
    return 'Paystack public key is not configured on the payment backend.';
  }
  if (!cfg.publicKey.startsWith('pk_')) {
    return 'Paystack public key looks invalid — it should start with "pk_live_" or "pk_test_".';
  }
  if (!cfg.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cfg.email)) {
    return 'A valid customer email address is required for payment.';
  }
  if (!cfg.amount || cfg.amount < 100) {
    return 'Payment amount must be at least GH₵ 1.00 (100 pesewas).';
  }
  if (!Number.isInteger(cfg.amount)) {
    return 'Payment amount must be a whole number of pesewas (GHS × 100).';
  }
  if (!cfg.reference) {
    return 'A unique payment reference is required.';
  }
  return null;
}

/**
 * Opens the Paystack inline popup. Loads the Paystack JS script on first call.
 * Resolves after the popup closes (either success or cancel).
 */
export async function openPaystackPopup(
  cfg: PaystackConfig,
  callbacks: PaystackCallbacks,
): Promise<void> {
  const validationError = validatePaystackConfig(cfg);
  if (validationError) throw new Error(validationError);

  await loadPaystackScript();

  const PaystackPop = (window as any).PaystackPop;
  if (!PaystackPop || typeof PaystackPop.setup !== 'function') {
    throw new Error('Paystack inline script failed to load. Please refresh and try again.');
  }

  const handler = PaystackPop.setup({
    key: cfg.publicKey,
    email: cfg.email,
    amount: cfg.amount,
    currency: cfg.currency ?? 'GHS',
    ref: cfg.reference,
    firstname: cfg.firstname,
    lastname: cfg.lastname,
    phone: cfg.phone,
    metadata: cfg.metadata,
    callback: (transaction: any) => {
      callbacks.onSuccess(transaction);
    },
    onClose: () => {
      callbacks.onClose();
    },
  });

  handler.openIframe();
}
