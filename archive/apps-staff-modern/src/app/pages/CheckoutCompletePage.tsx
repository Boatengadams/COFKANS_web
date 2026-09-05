/**
 * /checkout/complete — fallback landing page for edge cases where the customer
 * lands here after paying (e.g. Paystack callback URL, or the customer closed
 * the popup mid-payment and wants to verify their charge did go through).
 *
 * Reads the Paystack reference from any of `?ref=`, `?reference=`, or
 * `?trxref=` (Paystack's convention), looks up the matching order by
 * `paymentReference`, and subscribes so the page flips from "checking…" to
 * "confirmed" the instant the webhook lands.
 */
import { useEffect, useMemo, useState } from 'react';
import { collection, limit, onSnapshot, query, where } from 'firebase/firestore';
import { CheckCircle2, Loader2, AlertTriangle, ArrowRight } from 'lucide-react';
import { db } from '@/lib/firebase';
import { verifyPaystackPayment } from '@/lib/paystack-service';

type OrderDoc = {
  id: string;
  paymentStatus?: string;
  status?: string;
  total?: number;
  paymentReference?: string;
};

function getReferenceFromURL(): string | null {
  if (typeof window === 'undefined') return null;
  const p = new URLSearchParams(window.location.search);
  return p.get('reference') || p.get('ref') || p.get('trxref') || null;
}

export default function CheckoutCompletePage() {
  const reference = useMemo(getReferenceFromURL, []);
  const [order, setOrder] = useState<OrderDoc | null>(null);
  const [state, setState] = useState<'loading' | 'not_found' | 'found' | 'error'>('loading');

  useEffect(() => {
    if (!reference) { setState('not_found'); return; }
    let cancelled = false;

    verifyPaystackPayment(reference).catch((err) => {
      console.warn('[checkout/complete] payment verification call failed', err);
    });

    const q = query(
      collection(db, 'orders'),
      where('paymentReference', '==', reference),
      limit(1),
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        if (cancelled) return;
        if (snap.empty) {
          // Not found yet — order might still be flushing to Firestore. Keep
          // the subscription open so we flip automatically when it lands.
          setState((s) => (s === 'loading' ? 'loading' : 'not_found'));
          return;
        }
        const doc0 = snap.docs[0];
        const data = doc0.data() as Omit<OrderDoc, 'id'>;
        setOrder({ ...data, id: doc0.id });
        setState('found');
      },
      (err) => {
        console.error('[checkout/complete] snapshot error', err);
        if (!cancelled) setState('error');
      },
    );

    // After 12s, if we still haven't seen the order, flip to not_found so the
    // customer gets a support hint instead of an eternal spinner.
    const t = setTimeout(() => {
      if (!cancelled) setState((s) => (s === 'loading' ? 'not_found' : s));
    }, 12000);

    return () => { cancelled = true; clearTimeout(t); unsub(); };
  }, [reference]);

  const paid = order?.paymentStatus === 'paid';

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-card border-2 border-border rounded-2xl p-8 text-center space-y-5">
        {state === 'loading' && (
          <>
            <div className="w-14 h-14 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
              <Loader2 className="w-7 h-7 text-primary animate-spin" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Confirming your payment…</h1>
              <p className="text-sm text-muted-foreground mt-1">
                We're checking with Paystack. This usually takes a few seconds.
              </p>
            </div>
            {reference && (
              <p className="text-[11px] font-mono text-muted-foreground break-all">
                Reference: {reference}
              </p>
            )}
          </>
        )}

        {state === 'found' && paid && (
          <>
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-emerald-600" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Payment confirmed</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Thank you — your order is now processing.
                {typeof order?.total === 'number' && ` Total charged: GH₵ ${order.total.toFixed(2)}.`}
              </p>
            </div>
            <p className="text-[11px] font-mono text-muted-foreground break-all">
              Order #{order?.id.slice(-6).toUpperCase()} · Ref {reference}
            </p>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold hover:opacity-90"
            >
              Back to shop <ArrowRight className="w-4 h-4" />
            </a>
          </>
        )}

        {state === 'found' && !paid && (
          <>
            <div className="w-14 h-14 rounded-full bg-amber-500/10 mx-auto flex items-center justify-center">
              <Loader2 className="w-7 h-7 text-amber-600 animate-spin" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Payment still processing</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Your order is saved. As soon as Paystack confirms the charge (usually seconds),
                this page will update. Safe to close this window — we'll SMS/email you.
              </p>
            </div>
            <p className="text-[11px] font-mono text-muted-foreground break-all">
              Order #{order?.id.slice(-6).toUpperCase()} · Ref {reference}
            </p>
          </>
        )}

        {state === 'not_found' && (
          <>
            <div className="w-14 h-14 rounded-full bg-amber-500/10 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-amber-600" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-bold">We couldn't find that payment</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {reference
                  ? "Your card may not have been charged, or the confirmation is delayed. Check your SMS/email for a Paystack receipt, then contact us if you were charged but see no order."
                  : "This page needs a payment reference (`?reference=…`)."}
              </p>
            </div>
            {reference && (
              <p className="text-[11px] font-mono text-muted-foreground break-all">
                Reference: {reference}
              </p>
            )}
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="/support"
                className="px-4 py-2 border-2 border-border rounded-xl font-bold hover:bg-muted text-sm"
              >
                Contact support
              </a>
              <a
                href="/"
                className="px-4 py-2 bg-primary text-white rounded-xl font-bold hover:opacity-90 text-sm inline-flex items-center gap-1.5"
              >
                Back to shop <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </>
        )}

        {state === 'error' && (
          <>
            <div className="w-14 h-14 rounded-full bg-rose-500/10 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-rose-600" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Couldn't check payment status</h1>
              <p className="text-sm text-muted-foreground mt-1">
                We hit a network problem verifying your payment. If you were charged, please
                contact support with the reference below and we'll sort it within the day.
              </p>
            </div>
            {reference && (
              <p className="text-[11px] font-mono text-muted-foreground break-all">
                Reference: {reference}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
