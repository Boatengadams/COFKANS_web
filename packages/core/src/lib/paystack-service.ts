import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

export interface PaystackInitialization {
  publicKey: string;
  reference: string;
  accessCode: string | null;
  authorizationUrl: string | null;
  amount: number;
  currency: 'GHS';
  email: string;
}

export interface CheckoutOrderInput {
  items: Array<{
    productId: string;
    variantId?: string | null;
    quantity: number;
  }>;
  shippingAddress: {
    fullName: string;
    phone: string;
    email: string;
    region: string;
    city: string;
    street: string;
    postalCode?: string;
    additionalInfo?: string;
  };
  fulfillment: {
    type: 'pickup' | 'delivery';
    branchSlug: string;
    scheduledDate?: string;
  };
}

export interface CheckoutOrderResult {
  orderId: string;
  orderNumber: string;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  total: number;
}

export async function createCheckoutOrder(input: CheckoutOrderInput): Promise<CheckoutOrderResult> {
  const call = httpsCallable<CheckoutOrderInput, CheckoutOrderResult>(functions, 'createCheckoutOrder');
  return (await call(input)).data;
}

export async function initializePaystackPayment(orderId: string): Promise<PaystackInitialization> {
  const callbackUrl =
    typeof window === 'undefined'
      ? undefined
      : `${window.location.origin}/checkout/complete`;
  const call = httpsCallable<
    { orderId: string; callbackUrl?: string },
    PaystackInitialization
  >(functions, 'initializePaystackPayment');
  return (await call({ orderId, callbackUrl })).data;
}

export async function verifyPaystackPayment(reference: string): Promise<{
  ok: true;
  processed: boolean;
  result: string;
}> {
  const call = httpsCallable<
    { reference: string },
    { ok: true; processed: boolean; result: string }
  >(functions, 'verifyPaystackPayment');
  return (await call({ reference })).data;
}
