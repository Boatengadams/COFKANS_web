import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  Package,
  CheckCircle,
  Truck,
  Phone,
  Mail,
  User,
  Lock,
  ShoppingBag,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext';
import { collection, addDoc, serverTimestamp, doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { openPaystackPopup, validatePaystackConfig, preloadPaystackScript, isPaystackReady } from '@/lib/use-paystack';
import { createCheckoutOrder, initializePaystackPayment, verifyPaystackPayment } from '@/lib/paystack-service';
import { DEMO_MODE } from '@/lib/demo-mode';
import toast from 'react-hot-toast';
import { sanitizeInput } from '@/lib/security-service';
import { validateOrder } from '@/lib/price-verification-service';
import { trackPurchase } from '@/services/recommendation-service';
import { isAuthFresh, requireFreshAuth } from '@/lib/session-service';
import { FulfillmentStep, type FulfillmentChoice } from '../components/checkout/FulfillmentStep';
import { useBranches } from '@/lib/branches';
import { GHANA_REGION_NAMES, getCitiesForRegion } from '@/lib/ghana-address-data';
import { PhoneInputGH } from '../components/common/PhoneInputGH';
import type { OrderItem } from '@/lib/firestore-schema';

interface CheckoutPageProps {
  onBack: () => void;
  onComplete: () => void;
}

type Step = 'fulfillment' | 'shipping' | 'payment' | 'review' | 'confirming' | 'complete';

interface ShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  region: string;
  city: string;
  street: string;
  postalCode: string;
  additionalInfo?: string;
}

export function CheckoutPage({ onBack, onComplete }: CheckoutPageProps) {
  const { user } = useFirebaseAuth();
  const { cart, clearCart } = useCartStore();
  const branches = useBranches(true);
  const items = cart?.items || [];
  const total = cart?.total || 0;
  const [currentStep, setCurrentStep] = useState<Step>('fulfillment');
  const [fulfillment, setFulfillment] = useState<FulfillmentChoice>({
    type: 'pickup',
    branchSlug: '',
    scheduledDate: '',
  });
  const [processing, setProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [confirmingReference, setConfirmingReference] = useState<string | null>(null);
  const [confirmingError, setConfirmingError] = useState<string | null>(null);

  // Shipping form state
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: user?.displayName || '',
    phone: user?.phoneNumber || '',
    email: user?.email || '',
    region: 'Greater Accra',
    city: '',
    street: '',
    postalCode: '',
    additionalInfo: '',
  });

  // Payment method state — Paystack only. We dispatch on confirmed payment;
  // cash on delivery is intentionally not offered.
  const paymentMethod: 'paystack' = 'paystack';
  const [paystackStatus, setPaystackStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>(
    () => (isPaystackReady() ? 'ready' : 'idle'),
  );

  useEffect(() => {
    if (currentStep !== 'payment') return;
    if (paystackStatus === 'ready' || paystackStatus === 'loading') return;
    setPaystackStatus('loading');
    preloadPaystackScript()
      .then(() => setPaystackStatus(isPaystackReady() ? 'ready' : 'error'))
      .catch(() => setPaystackStatus('error'));
  }, [currentStep, paystackStatus]);

  useEffect(() => {
    if (currentStep !== 'confirming' || !orderId || !user?.uid) return;

    const unsub = onSnapshot(
      doc(db, 'orders', orderId),
      async (snap) => {
        if (!snap.exists()) {
          setConfirmingError('We could not find your order. Contact support with the payment reference below.');
          return;
        }

        const order = snap.data() as { paymentStatus?: string; status?: string };
        if (order.paymentStatus === 'paid') {
          try {
            await clearCart(user.uid);
          } catch (err) {
            console.error('[checkout] paid order cart clear failed:', err);
          }
          setProcessing(false);
          setCurrentStep('complete');
          toast.success('Payment confirmed! Order #' + orderId.slice(-6).toUpperCase());
        } else if (order.paymentStatus === 'failed' || order.status === 'cancelled') {
          setProcessing(false);
          setConfirmingError('Payment was not confirmed. If you were charged, contact support with the reference below.');
        }
      },
      (err) => {
        console.error('[checkout] order confirmation snapshot failed:', err);
        setConfirmingError('We could not check your payment status. Keep this reference for support.');
        setProcessing(false);
      },
    );

    return () => unsub();
  }, [clearCart, currentStep, orderId, user?.uid]);

  // Calculate totals.
  // Pricing is intentionally simple: Product Total + a flat Delivery Fee.
  // No VAT line and no separate cost/handling fee. Pickup orders pay no
  // delivery fee. DEFAULT_DELIVERY_FEE is the configurable flat rate.
  const DEFAULT_DELIVERY_FEE = 50;
  const subtotal = total;
  const taxAmount = 0;
  const deliveryFee = fulfillment.type === 'pickup' ? 0 : DEFAULT_DELIVERY_FEE;
  const finalTotal = subtotal + deliveryFee;

  // Cities for the selected region
  const regionCities = useMemo(
    () => getCitiesForRegion(shippingAddress.region),
    [shippingAddress.region],
  );

  const validateShippingForm = (): boolean => {
    if (!shippingAddress.fullName.trim()) {
      toast.error('Please enter your full name');
      return false;
    }
    if (!shippingAddress.phone.trim()) {
      toast.error('Please enter your phone number');
      return false;
    }
    if (!shippingAddress.email.trim()) {
      toast.error('Please enter your email');
      return false;
    }
    if (!shippingAddress.street.trim()) {
      toast.error('Please enter your street address');
      return false;
    }
    if (!shippingAddress.city.trim()) {
      toast.error('Please select a city / district');
      return false;
    }
    if (!shippingAddress.street.trim()) {
      toast.error('Please enter your specific street / location');
      return false;
    }
    return true;
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateShippingForm()) {
      setCurrentStep('payment');
    }
  };

  const handleInputChange = (field: keyof ShippingAddress, value: string) => {
    const sanitized = sanitizeInput(value);
    setShippingAddress(prev => ({ ...prev, [field]: sanitized }));
  };


  const createOrder = async (paymentStatus: 'pending' | 'paid') => {
    // Server-authoritative order creation via callable function.
    // The client only sends product ids, quantities, fulfillment and contact info.
    if (!user) return null;
    try {
      const payload = {
        items: items.map((it) => ({ productId: it.productId, variantId: it.variantId || null, quantity: it.quantity })),
        shippingAddress: {
          fullName: shippingAddress.fullName,
          phone: shippingAddress.phone,
          email: shippingAddress.email,
          region: shippingAddress.region,
          city: shippingAddress.city,
          street: shippingAddress.street,
          postalCode: shippingAddress.postalCode,
          additionalInfo: shippingAddress.additionalInfo,
        },
        fulfillment: {
          type: fulfillment.type,
          branchSlug: fulfillment.branchSlug,
          scheduledDate: fulfillment.scheduledDate,
        },
      };

      // Optional local validation for UX only — server is authoritative
      try {
        const orderValidation = await validateOrder(user.uid, items.map(i => ({
          productId: i.productId,
          variantId: i.variantId || null,
          sku: i.sku || '',
          name: i.name || 'Product',
          image: i.image || '',
          price: i.price,
          quantity: i.quantity,
          subtotal: i.subtotal,
          taxAmount: 0,
        })), { subtotal, taxAmount, shippingAmount: deliveryFee, discountAmount: 0, total: finalTotal });
        if (!orderValidation.isValid) {
          // Show a friendly UX hint but continue — server will reject if invalid
          toast.error(orderValidation.errors?.[0] || 'Order validation issue detected');
        }
      } catch (e) {
        // ignore local validation errors; proceed to server
      }

      const result = await createCheckoutOrder(payload);
      // result includes orderId
      return result.orderId;
    } catch (error) {
      console.error('Failed to create order (server):', error);
      toast.error('Failed to create order. Please try again.');
      return null;
    }
  };

  const handlePaystackPayment = async () => {
    if (!user) { toast.error('Please sign in to continue.'); return; }

    // DEMO MODE: no Firestore / no Paystack. Simulate a confirmed payment so
    // the checkout flow can be demoed end-to-end. Nothing is persisted.
    if (DEMO_MODE) {
      setProcessing(true);
      const ref = `DEMO-${Date.now()}`;
      setOrderId(ref);
      await new Promise((r) => setTimeout(r, 700));
      try { if (user?.uid) await clearCart(user.uid); } catch { /* ignore */ }
      setCurrentStep('complete');
      toast.success('(Demo) Payment confirmed — order simulated');
      setProcessing(false);
      return;
    }

    // Step-up reauth for card payments
    if (!isAuthFresh()) {
      toast('For your security, please confirm it\'s you before paying.', { icon: '🔐' });
      const ok = await requireFreshAuth();
      if (!ok) { toast.error('Re-authentication required to complete payment.'); return; }
    }

    setProcessing(true);
    let newOrderId: string | null = null;
    try {
      newOrderId = await createOrder('pending');
      if (!newOrderId) { setProcessing(false); return; }
      setOrderId(newOrderId);

      const initialized = await initializePaystackPayment(newOrderId);
      const paystackConfig = {
        publicKey: initialized.publicKey,
        email: initialized.email,
        amount: initialized.amount,
        currency: initialized.currency,
        reference: initialized.reference,
        firstname: shippingAddress.fullName.trim().split(' ')[0] || undefined,
        lastname: shippingAddress.fullName.trim().split(' ').slice(1).join(' ') || undefined,
        phone: shippingAddress.phone.trim() || undefined,
        metadata: {
          custom_fields: [
            { display_name: 'Delivery Region', variable_name: 'region', value: shippingAddress.region },
            { display_name: 'City', variable_name: 'city', value: shippingAddress.city },
            { display_name: 'Street', variable_name: 'street', value: shippingAddress.street },
            { display_name: 'Order Total (GHS)', variable_name: 'total_ghs', value: finalTotal.toFixed(2) },
          ],
        },
      };

      const keyError = validatePaystackConfig(paystackConfig);
      if (keyError) { toast.error(keyError, { duration: 6000 }); setProcessing(false); return; }

      await openPaystackPopup(paystackConfig, {
        onSuccess: async (transaction) => {
          const reference = transaction.reference || initialized.reference;
          setConfirmingReference(reference);
          setConfirmingError(null);
          setCurrentStep('confirming');
          toast('Payment received by Paystack. Confirming your order now...', { icon: '⏳' });
          try {
            await verifyPaystackPayment(reference);
          } catch (err) {
            console.error('[checkout] Paystack verification call failed:', err);
          }
        },
        onClose: () => {
          // Order is in 'pending' state — user can resume later
          toast('Payment cancelled. Your order is saved with ref ' + initialized.reference, { icon: 'ℹ️' });
          setProcessing(false);
        },
      });
    } catch (error: any) {
      console.error('[checkout] Paystack error:', error);
      toast.error(error?.message || 'Could not start payment. Please try again.');
      setProcessing(false);
    }
  };

  const steps = [
    { id: 'fulfillment' as const, label: 'Fulfillment', icon: Truck },
    ...(fulfillment.type === 'delivery'
      ? [{ id: 'shipping' as const, label: 'Address', icon: MapPin }]
      : []),
    { id: 'payment' as const, label: 'Payment', icon: CreditCard },
    { id: 'review' as const, label: 'Review', icon: Package },
  ];

  const continueFromFulfillment = () => {
    if (!fulfillment.branchSlug) {
      toast.error('Please choose a branch');
      return;
    }
    if (!fulfillment.scheduledDate) {
      const d = new Date();
      if (fulfillment.type === 'delivery') d.setDate(d.getDate() + 1);
      setFulfillment(f => ({ ...f, scheduledDate: d.toISOString().slice(0, 10) }));
    }
    // For pickup we pre-fill shipping with branch contact so downstream logic
    // (which still references shippingAddress) keeps working.
    if (fulfillment.type === 'pickup') {
      const b = branches.find(branch => branch.slug === fulfillment.branchSlug);
      if (b) {
        setShippingAddress(prev => ({
          ...prev,
          street: b.address,
          city: b.city,
          region: b.region,
          postalCode: prev.postalCode || '00000',
        }));
      }
      setCurrentStep('payment');
    } else {
      setCurrentStep('shipping');
    }
  };

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  if (items.length === 0 && currentStep !== 'complete') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Add some products to continue shopping</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="px-6 py-3 bg-primary text-white rounded-xl font-bold cursor-pointer"
          >
            Continue Shopping
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b-2 border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <motion.button
              whileHover={{ scale: 1.05, x: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="p-2 sm:p-3 rounded-xl border-2 border-border hover:bg-muted transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
            </motion.button>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold">Checkout</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {currentStep === 'complete'
                  ? 'Order Confirmed'
                  : currentStep === 'confirming'
                  ? 'Confirming Payment'
                  : `Step ${currentStepIndex + 1} of ${steps.length}`}
              </p>
            </div>
            {currentStep !== 'complete' && currentStep !== 'confirming' && (
              <div className="ml-auto hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                <Lock className="w-3.5 h-3.5" strokeWidth={2.5} />
                <span className="text-xs font-bold">Secure &amp; encrypted checkout</span>
              </div>
            )}
          </div>

          {/* Progress Steps */}
          {currentStep !== 'complete' && currentStep !== 'confirming' && (
            <div className="flex items-center gap-2 sm:gap-4 mt-3 sm:mt-6">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = index < currentStepIndex;
                const isActive = step.id === currentStep;

                return (
                  <div key={step.id} className="flex items-center flex-1">
                    <div className={`flex items-center gap-2 flex-1 ${index > 0 ? 'ml-4' : ''}`}>
                      <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 ${
                          isCompleted
                            ? 'bg-green-500 border-green-500'
                            : isActive
                            ? 'bg-primary border-primary'
                            : 'bg-muted border-border'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-white" />
                        ) : (
                          <Icon
                            className={`w-5 h-5 ${isActive ? 'text-white' : 'text-muted-foreground'}`}
                          />
                        )}
                      </div>
                      <span
                        className={`text-sm font-bold hidden md:inline ${
                          isActive ? 'text-foreground' : 'text-muted-foreground'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="flex-1 h-[2px] bg-border mx-2" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-12">
        <AnimatePresence mode="wait">
          {/* Fulfillment Step (pickup or delivery + branch + date) */}
          {currentStep === 'fulfillment' && (
            <motion.div
              key="fulfillment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="bg-card border-2 border-border rounded-2xl p-4 sm:p-8">
                <FulfillmentStep
                  value={fulfillment}
                  onChange={setFulfillment}
                  onContinue={continueFromFulfillment}
                />
              </div>
            </motion.div>
          )}

          {/* Shipping Step */}
          {currentStep === 'shipping' && (
            <motion.div
              key="shipping"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="bg-card border-2 border-border rounded-2xl p-4 sm:p-8">
                <h2 className="text-xl font-bold mb-6">Shipping Address</h2>

                <form onSubmit={handleShippingSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-2">Full Name *</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type="text"
                          value={shippingAddress.fullName}
                          onChange={(e) => handleInputChange('fullName', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-background border-2 border-border rounded-xl focus:outline-none focus:border-primary"
                          placeholder="John Doe"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2">Phone Number *</label>
                      <PhoneInputGH
                        value={shippingAddress.phone}
                        onChange={(e164) => setShippingAddress((p) => ({ ...p, phone: e164 }))}
                        required
                      />
                    </div>
                  </div>

                  {/* Email — auto-filled from account, read-only */}
                  <div>
                    <label className="block text-sm font-bold mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="email"
                        value={shippingAddress.email}
                        readOnly
                        className="w-full pl-10 pr-4 py-3 bg-muted border-2 border-border rounded-xl text-muted-foreground cursor-default select-none"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">Order confirmation will be sent here.</p>
                  </div>

                  {/* Region — first, drives city list */}
                  <div>
                    <label className="block text-sm font-bold mb-2">Region *</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <select
                        value={shippingAddress.region}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, region: e.target.value, city: '' }))}
                        className="w-full pl-10 pr-10 py-3 bg-background border-2 border-border rounded-xl focus:outline-none focus:border-primary cursor-pointer appearance-none"
                        required
                      >
                        <option value="">— Select region —</option>
                        {GHANA_REGION_NAMES.map(r => (
                          <option key={r} value={r}>{r} Region</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* City / District — populated by region selection */}
                  <div>
                    <label className="block text-sm font-bold mb-2">City / District *</label>
                    <div className="relative">
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <select
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                        disabled={!shippingAddress.region}
                        className="w-full px-4 pr-10 py-3 bg-background border-2 border-border rounded-xl focus:outline-none focus:border-primary cursor-pointer appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                        required
                      >
                        <option value="">— Select city / district —</option>
                        {regionCities.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Specific location — typed by user */}
                  <div>
                    <label className="block text-sm font-bold mb-2">Street / Specific Location *</label>
                    <input
                      type="text"
                      value={shippingAddress.street}
                      onChange={(e) => handleInputChange('street', e.target.value)}
                      className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl focus:outline-none focus:border-primary"
                      placeholder="e.g. 5 Nkrumah Ave, near Total filling station"
                      required
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">Describe your exact location or nearest landmark.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Delivery Notes (Optional)
                    </label>
                    <textarea
                      value={shippingAddress.additionalInfo}
                      onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                      className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl focus:outline-none focus:border-primary resize-none"
                      rows={2}
                      placeholder="Gate colour, floor number, landmark, etc."
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition cursor-pointer"
                  >
                    Continue to Payment
                  </motion.button>
                </form>
              </div>
            </motion.div>
          )}

          {/* Payment Step */}
          {currentStep === 'payment' && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="bg-card border-2 border-border rounded-2xl p-6 sm:p-8 space-y-5">
                <div>
                  <h2 className="text-xl font-bold">Payment Method</h2>
                  <p className="text-sm text-muted-foreground mt-1">Total: GH₵{finalTotal.toFixed(2)}</p>
                </div>

                {paystackStatus === 'error' && (
                  <div className="border-2 border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300 rounded-xl p-4 text-sm">
                    <div className="font-bold mb-1">Couldn't load the Paystack payment script</div>
                    <p>
                      Your network or an extension may be blocking <code>js.paystack.co</code>.
                      Disable ad/script blockers and refresh, or try a different network or device.
                    </p>
                  </div>
                )}

                {/* Paystack — only payment method */}
                <div className="p-5 border-2 border-primary bg-primary/5 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center flex-shrink-0">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <CreditCard className="w-4 h-4" />
                        <span className="font-bold">Card / Mobile Money</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Pay securely via Paystack — card, MTN MoMo, Vodafone Cash, AirtelTigo.
                        We dispatch once payment is confirmed.
                      </p>
                    </div>
                    <Lock className="w-4 h-4 text-green-600 flex-shrink-0" />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setCurrentStep(fulfillment.type === 'delivery' ? 'shipping' : 'fulfillment')}
                    className="flex-1 py-3.5 bg-muted text-foreground rounded-xl font-bold"
                  >
                    Back
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setCurrentStep('review')}
                    className="flex-1 py-3.5 bg-primary text-white rounded-xl font-bold"
                  >
                    Review Order
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Review Step */}
          {currentStep === 'review' && (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="space-y-6">
                {/* Order Summary */}
                <div className="bg-card border-2 border-border rounded-2xl p-4 sm:p-8">
                  <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                  <div className="space-y-4 mb-6">
                    {items.map((item) => (
                      <div key={item.productId} className="flex gap-4">
                        <div className="w-20 h-20 bg-muted rounded-xl flex items-center justify-center flex-shrink-0">
                          <Package className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold">{item.name || 'Product'}</h4>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">GH₵ {item.subtotal.toFixed(2)}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t-2 border-border pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Product Total</span>
                      <span className="font-bold">GH₵ {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Delivery Fee{fulfillment.type === 'pickup' ? ' (pickup)' : ''}
                      </span>
                      <span className="font-bold">
                        {deliveryFee === 0 ? 'FREE' : `GH₵ ${deliveryFee.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg pt-2 border-t-2 border-border">
                      <span className="font-bold">Total</span>
                      <span className="font-bold text-primary">GH₵ {finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Shipping Address Review */}
                <div className="bg-card border-2 border-border rounded-2xl p-4 sm:p-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold">Shipping Address</h3>
                    <button
                      onClick={() => setCurrentStep('shipping')}
                      className="text-sm text-primary hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <p className="font-bold text-foreground">{shippingAddress.fullName}</p>
                    <p>{shippingAddress.street}</p>
                    <p>{shippingAddress.city}, {shippingAddress.region}</p>
                    {shippingAddress.postalCode && <p>{shippingAddress.postalCode}</p>}
                    <p className="pt-2">{shippingAddress.phone}</p>
                    <p>{shippingAddress.email}</p>
                  </div>
                </div>

                {/* Payment Method Review */}
                <div className="bg-card border-2 border-border rounded-2xl p-4 sm:p-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold">Payment Method</h3>
                    <button
                      onClick={() => setCurrentStep('payment')}
                      className="text-sm text-primary hover:underline"
                    >
                      Change
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <span>Card / Mobile Money (Paystack)</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCurrentStep('payment')}
                    disabled={processing}
                    className="flex-1 py-4 bg-muted text-foreground rounded-xl font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Back
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: processing ? 1 : 1.02 }}
                    whileTap={{ scale: processing ? 1 : 0.98 }}
                    onClick={handlePaystackPayment}
                    disabled={processing}
                    className="flex-1 py-4 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {processing
                      ? <><Loader2 className="w-5 h-5 animate-spin" />Processing…</>
                      : <><Lock className="w-4 h-4" />Pay GH₵ {finalTotal.toFixed(2)}</>
                    }
                  </motion.button>
                </div>

                {/* Security Badge */}
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Lock className="w-4 h-4" />
                  <span>Secure checkout - Your information is protected</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Confirming Step */}
          {currentStep === 'confirming' && (
            <motion.div
              key="confirming"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="bg-card border-2 border-border rounded-2xl p-8 sm:p-12 text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" strokeWidth={2.5} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">Confirming payment</h2>
                <p className="text-muted-foreground mb-4">
                  Paystack has returned your transaction. We are waiting for the secure server
                  verification before marking your order as paid.
                </p>
                {confirmingReference && (
                  <p className="text-xs font-mono text-muted-foreground break-all mb-4">
                    Reference: {confirmingReference}
                  </p>
                )}
                {confirmingError && (
                  <div className="border-2 border-amber-500/30 bg-amber-500/10 rounded-xl p-4 text-sm text-amber-700 dark:text-amber-300">
                    {confirmingError}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Complete Step */}
          {currentStep === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="bg-card border-2 border-border rounded-2xl p-12 text-center">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
                <h2 className="text-3xl font-bold mb-4">Order Confirmed!</h2>
                <p className="text-muted-foreground mb-2">
                  Thank you for your order. We've sent a confirmation to {shippingAddress.email}
                </p>
                {orderId && (
                  <p className="text-sm text-muted-foreground mb-8">
                    Order ID: <span className="font-mono font-bold">#{orderId.slice(-8).toUpperCase()}</span>
                  </p>
                )}

                <div className="bg-primary/5 border-2 border-primary/20 rounded-xl p-6 mb-8">
                  <h3 className="font-bold mb-2">What's Next?</h3>
                  <ul className="text-sm text-muted-foreground space-y-2 text-left">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>Order confirmation sent to your email</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <span>We'll prepare your items for shipment</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-purple-500 flex-shrink-0" />
                      <span>Track your delivery in "My Orders"</span>
                    </li>
                  </ul>
                </div>

                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onComplete}
                    className="flex-1 py-4 bg-muted text-foreground rounded-xl font-bold cursor-pointer"
                  >
                    View My Orders
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onBack}
                    className="flex-1 py-4 bg-primary text-white rounded-xl font-bold cursor-pointer"
                  >
                    Continue Shopping
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
