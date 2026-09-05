import type { PaymentProvider } from './types';

export interface ChargeRequest {
  provider: PaymentProvider;
  amount: number;
  orderId: string;
  phone?: string;
  customerName?: string;
  customerEmail?: string;
}

export interface ChargeResult {
  ok: boolean;
  transactionId?: string;
  provider: PaymentProvider;
  failureReason?: string;
  receipt?: { method: string; reference: string; at: number };
}

// ── MTN Mobile Money (MoMo) ─────────────────────────────────────────────
// Real integration entry point: https://momodeveloper.mtn.com/api-documentation
// To go live: replace simulate() with POST {base}/collection/v1_0/requesttopay
// using subscription key + access token from sandbox/prod portal.
async function chargeMtnMomo(req: ChargeRequest): Promise<ChargeResult> {
  if (!req.phone) return { ok: false, provider: req.provider, failureReason: 'Phone number required for MTN MoMo' };
  await simulate(1800);
  // 5% simulated failure to make the UX honest
  if (Math.random() < 0.05) return { ok: false, provider: req.provider, failureReason: 'Customer declined the prompt' };
  return success(req, 'MTN MoMo');
}

// ── Telecel Cash (formerly Vodafone Cash) ───────────────────────────────
// Real integration via Hubtel aggregator or Telecel direct API.
async function chargeTelecelCash(req: ChargeRequest): Promise<ChargeResult> {
  if (!req.phone) return { ok: false, provider: req.provider, failureReason: 'Phone number required for Telecel Cash' };
  await simulate(1600);
  if (Math.random() < 0.05) return { ok: false, provider: req.provider, failureReason: 'USSD timeout — please try again' };
  return success(req, 'Telecel Cash');
}

// ── Google Pay (simulated) ──────────────────────────────────────────────
// Real: Google Pay JS API (pay.google.com/gp/p/js/pay.js) + Stripe/Adyen
async function chargeGooglePay(req: ChargeRequest): Promise<ChargeResult> {
  await simulate(900);
  return success(req, 'Google Pay');
}

// ── Apple Pay (simulated) ───────────────────────────────────────────────
// Real: window.ApplePaySession + merchant ID + payment processor.
async function chargeApplePay(req: ChargeRequest): Promise<ChargeResult> {
  await simulate(900);
  return success(req, 'Apple Pay');
}

async function chargeCash(req: ChargeRequest): Promise<ChargeResult> {
  await simulate(200);
  return success(req, 'Cash on Delivery');
}

export async function charge(req: ChargeRequest): Promise<ChargeResult> {
  switch (req.provider) {
    case 'mtn-momo': return chargeMtnMomo(req);
    case 'telecel-cash': return chargeTelecelCash(req);
    case 'google-pay': return chargeGooglePay(req);
    case 'apple-pay': return chargeApplePay(req);
    case 'cash': return chargeCash(req);
  }
}

function simulate(ms: number) { return new Promise(r => setTimeout(r, ms)); }

function success(req: ChargeRequest, method: string): ChargeResult {
  const ref = `${req.provider.toUpperCase()}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  return {
    ok: true,
    provider: req.provider,
    transactionId: ref,
    receipt: { method, reference: ref, at: Date.now() },
  };
}
