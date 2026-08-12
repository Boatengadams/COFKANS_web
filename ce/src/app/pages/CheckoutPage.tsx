import { useState } from 'react';
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
} from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FlutterWaveButton, closePaymentModal } from 'flutterwave-react-v3';
import toast from 'react-hot-toast';
import { sanitizeInput } from '@/lib/security-service';
import { validateOrder } from '@/lib/price-verification-service';
import { trackPurchase } from '@/services/recommendation-service';
import { PaymentMethodPicker } from '../components/payments/PaymentMethodPicker';
import { isAuthFresh, requireFreshAuth } from '@/lib/session-service';
import { FulfillmentStep, type FulfillmentChoice } from '../components/checkout/FulfillmentStep';
import { getBranchBySlug, nearestBranch } from '@/lib/branches';

interface CheckoutPageProps {
  onBack: () => void;
  onComplete: () => void;
}

type Step = 'fulfillment' | 'shipping' | 'payment' | 'review' | 'complete';

interface ShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  additionalInfo?: string;
}

export function CheckoutPage({ onBack, onComplete }: CheckoutPageProps) {
  const { user } = useFirebaseAuth();
  const { cart, clearCart } = useCartStore();
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

  // Shipping form state
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: user?.displayName || '',
    phone: user?.phoneNumber || '',
    email: user?.email || '',
    street: '',
    city: '',
    state: 'Greater Accra',
    postalCode: '',
    additionalInfo: '',
  });

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState<'flutterwave' | 'cash'>('flutterwave');

  // Calculate totals
  const subtotal = total;
  const taxRate = 0.125; // 12.5% VAT in Ghana
  const taxAmount = subtotal * taxRate;
  const shippingCost = subtotal >= 500 ? 0 : 25; // Free shipping over GH₵ 500
  const finalTotal = subtotal + taxAmount + shippingCost;

  const ghanaRegions = [
    'Greater Accra',
    'Ashanti',
    'Western',
    'Eastern',
    'Central',
    'Northern',
    'Upper East',
    'Upper West',
    'Volta',
    'Bono',
    'Bono East',
    'Ahafo',
    'Savannah',
    'North East',
    'Oti',
  ];

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
      toast.error('Please enter your city');
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

  const createOrder = async (paymentStatus: 'pending' | 'paid' | 'cash_on_delivery') => {
    if (!user) return null;

    try {
      // Validate order prices
      const orderItems = items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal,
      }));

      const validation = await validateOrder(
        user.uid,
        orderItems,
        {
          subtotal,
          taxAmount,
          shippingAmount: shippingCost,
          discountAmount: 0,
          total: finalTotal,
        }
      );

      if (!validation.isValid) {
        toast.error(validation.error || 'Order validation failed');
        return null;
      }

      // Create order in Firestore
      const orderRef = await addDoc(collection(db, 'orders'), {
        userId: user.uid,
        userEmail: user.email,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal,
          productSnapshot: {
            name: item.productName || 'Unknown Product',
            price: item.price,
          },
        })),
        shippingAddress: {
          fullName: shippingAddress.fullName,
          phone: shippingAddress.phone,
          email: shippingAddress.email,
          street: shippingAddress.street,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postalCode: shippingAddress.postalCode,
          additionalInfo: shippingAddress.additionalInfo,
        },
        subtotal,
        taxAmount,
        shippingAmount: fulfillment.type === 'pickup' ? 0 : shippingCost,
        total: fulfillment.type === 'pickup' ? finalTotal - shippingCost : finalTotal,
        paymentMethod,
        paymentStatus,
        status: 'processing',
        // Fulfillment routing — what the branch portal listens to
        fulfillmentType: fulfillment.type,            // 'pickup' | 'delivery'
        branchSlug: fulfillment.branchSlug,           // origin branch for either flow
        scheduledDate: fulfillment.scheduledDate,    // YYYY-MM-DD chosen day
        deliveryMethod: fulfillment.type === 'pickup' ? 'pickup' : 'standard',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Track purchase for personalization
      const purchaseItems = items.map(item => {
        // Determine category from product ID prefix
        let category = 'general';
        if (item.productId.startsWith('lux')) category = 'luxury';
        else if (item.productId.startsWith('sol')) category = 'solar';
        else if (item.productId.startsWith('wire')) category = 'wiring';
        else if (item.productId.startsWith('ind')) category = 'industrial';
        else if (item.productId.startsWith('fan') || item.productId.startsWith('bulb')) category = 'appliances';

        return {
          productId: item.productId,
          productName: item.productName || item.name || 'Unknown Product',
          category,
          quantity: item.quantity,
          price: item.price,
        };
      });

      trackPurchase(user.uid, purchaseItems);

      return orderRef.id;
    } catch (error) {
      console.error('Failed to create order:', error);
      toast.error('Failed to create order. Please try again.');
      return null;
    }
  };

  const handleFlutterwavePayment = async () => {
    if (!user) return;

    // Step-up reauth: card payments require auth ≤ 5 min old.
    if (!isAuthFresh()) {
      toast('For your security, please confirm it\'s you before paying.', { icon: '🔐' });
      const ok = await requireFreshAuth();
      if (!ok) {
        toast.error('Re-authentication required to complete payment.');
        return;
      }
    }

    setProcessing(true);
    try {
      const newOrderId = await createOrder('pending');
      if (!newOrderId) {
        setProcessing(false);
        return;
      }
      setOrderId(newOrderId);
      // Payment will be handled by FlutterWaveButton
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment initialization failed');
      setProcessing(false);
    }
  };

  const handleCashOnDelivery = async () => {
    setProcessing(true);
    try {
      const newOrderId = await createOrder('cash_on_delivery');
      if (!newOrderId) {
        setProcessing(false);
        return;
      }

      setOrderId(newOrderId);
      if (user?.uid) {
        await clearCart(user.uid);
      }
      setCurrentStep('complete');
      toast.success('Order placed successfully!');
    } catch (error) {
      console.error('Order error:', error);
      toast.error('Failed to place order');
    } finally {
      setProcessing(false);
    }
  };

  const flutterwaveConfig = {
    public_key: (import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY as string | undefined) ?? '',
    tx_ref: `TXN-${Date.now()}`,
    amount: finalTotal,
    currency: 'GHS',
    payment_options: 'card,mobilemoney,ussd',
    customer: {
      email: shippingAddress.email,
      phone_number: shippingAddress.phone,
      name: shippingAddress.fullName,
    },
    customizations: {
      title: 'Cofkans Electricals',
      description: 'Payment for your order',
      logo: 'https://cofkanselectricals.com/logo.png',
    },
  };

  const fwCallback = async (response: any) => {
    console.log('Flutterwave response:', response);
    closePaymentModal();

    if (response.status === 'successful') {
      try {
        // Update order status
        if (orderId && user?.uid) {
          // You would update the order in Firestore here
          await clearCart(user.uid);
          setCurrentStep('complete');
          toast.success('Payment successful! Your order is confirmed.');
        }
      } catch (error) {
        console.error('Post-payment error:', error);
        toast.error('Payment successful but order update failed');
      }
    } else {
      toast.error('Payment failed or was cancelled');
    }
    setProcessing(false);
  };

  const fwClose = () => {
    setProcessing(false);
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
      const b = getBranchBySlug(fulfillment.branchSlug);
      if (b) {
        setShippingAddress(prev => ({
          ...prev,
          street: b.address,
          city: b.city,
          state: b.region,
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
                  : `Step ${currentStepIndex + 1} of ${steps.length}`}
              </p>
            </div>
          </div>

          {/* Progress Steps */}
          {currentStep !== 'complete' && (
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
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type="tel"
                          value={shippingAddress.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-background border-2 border-border rounded-xl focus:outline-none focus:border-primary"
                          placeholder="+233 XX XXX XXXX"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">Email Address *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="email"
                        value={shippingAddress.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-background border-2 border-border rounded-xl focus:outline-none focus:border-primary"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">Street Address *</label>
                    <input
                      type="text"
                      value={shippingAddress.street}
                      onChange={(e) => handleInputChange('street', e.target.value)}
                      className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl focus:outline-none focus:border-primary"
                      placeholder="123 Main Street, House Number"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-2">City *</label>
                      <input
                        type="text"
                        value={shippingAddress.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl focus:outline-none focus:border-primary"
                        placeholder="Accra"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2">Region *</label>
                      <select
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, state: e.target.value }))}
                        className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl focus:outline-none focus:border-primary cursor-pointer"
                        required
                      >
                        {ghanaRegions.map(region => (
                          <option key={region} value={region}>{region}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">Postal Code (Optional)</label>
                    <input
                      type="text"
                      value={shippingAddress.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl focus:outline-none focus:border-primary"
                      placeholder="GA-123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Additional Information (Optional)
                    </label>
                    <textarea
                      value={shippingAddress.additionalInfo}
                      onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                      className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl focus:outline-none focus:border-primary resize-none"
                      rows={3}
                      placeholder="Delivery instructions, landmarks, etc."
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

          {/* Payment Step — unified picker (MTN, Telecel, Google/Apple Pay) */}
          {currentStep === 'payment' && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="bg-card border-2 border-border rounded-2xl p-6 sm:p-8 space-y-6">
                <div>
                  <h2 className="text-xl font-bold">Payment</h2>
                  <p className="text-sm text-muted-foreground mt-1">Pay GH₵{finalTotal.toFixed(2)} — choose your preferred method.</p>
                </div>
                <PaymentMethodPicker
                  amount={finalTotal}
                  orderId={`TXN-${Date.now()}`}
                  customerName={shippingAddress.fullName}
                  customerEmail={shippingAddress.email}
                  onCancel={() => setCurrentStep('shipping')}
                  onSuccess={async (res) => {
                    setProcessing(true);
                    const newOrderId = await createOrder('paid');
                    if (newOrderId) {
                      setOrderId(newOrderId);
                      if (user?.uid) await clearCart(user.uid);
                      setCurrentStep('complete');
                      toast.success(`Paid with ${res.receipt?.method}. Order confirmed!`);
                    }
                    setProcessing(false);
                  }}
                />
                <p className="text-[11px] text-center text-muted-foreground">
                  Prefer cash? <button onClick={handleCashOnDelivery} disabled={processing} className="text-primary font-bold hover:underline">Pay on delivery instead</button>
                </p>
              </div>
            </motion.div>
          )}

          {/* Legacy (hidden) payment block — kept for type-checker only */}
          {false && currentStep === 'payment' && (
            <motion.div
              key="payment-legacy"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="bg-card border-2 border-border rounded-2xl p-4 sm:p-8">
                <h2 className="text-xl font-bold mb-6">Payment Method</h2>

                <div className="space-y-4 mb-6">
                  {/* Flutterwave */}
                  <div
                    onClick={() => setPaymentMethod('flutterwave')}
                    className={`p-6 border-2 rounded-xl cursor-pointer transition ${
                      paymentMethod === 'flutterwave'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === 'flutterwave' ? 'border-primary' : 'border-muted-foreground'
                        }`}
                      >
                        {paymentMethod === 'flutterwave' && (
                          <div className="w-3 h-3 rounded-full bg-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CreditCard className="w-5 h-5" />
                          <h3 className="font-bold">Card / Mobile Money</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Pay securely with card, MTN Mobile Money, Vodafone Cash, or AirtelTigo Money
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Cash on Delivery */}
                  <div
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-6 border-2 rounded-xl cursor-pointer transition ${
                      paymentMethod === 'cash'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === 'cash' ? 'border-primary' : 'border-muted-foreground'
                        }`}
                      >
                        {paymentMethod === 'cash' && (
                          <div className="w-3 h-3 rounded-full bg-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Truck className="w-5 h-5" />
                          <h3 className="font-bold">Cash on Delivery</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Pay with cash when your order is delivered
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCurrentStep('shipping')}
                    className="flex-1 py-4 bg-muted text-foreground rounded-xl font-bold cursor-pointer"
                  >
                    Back
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCurrentStep('review')}
                    className="flex-1 py-4 bg-primary text-white rounded-xl font-bold cursor-pointer"
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
                          <h4 className="font-bold">{item.productName || 'Product'}</h4>
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
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-bold">GH₵ {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax (12.5% VAT)</span>
                      <span className="font-bold">GH₵ {taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-bold">
                        {shippingCost === 0 ? 'FREE' : `GH₵ ${shippingCost.toFixed(2)}`}
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
                    <p>{shippingAddress.city}, {shippingAddress.state}</p>
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
                    {paymentMethod === 'flutterwave' ? (
                      <>
                        <CreditCard className="w-5 h-5 text-primary" />
                        <span>Card / Mobile Money</span>
                      </>
                    ) : (
                      <>
                        <Truck className="w-5 h-5 text-primary" />
                        <span>Cash on Delivery</span>
                      </>
                    )}
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

                  {paymentMethod === 'flutterwave' ? (
                    <FlutterWaveButton
                      {...flutterwaveConfig}
                      callback={fwCallback}
                      onClose={fwClose}
                      text={processing ? 'Processing...' : `Pay GH₵ ${finalTotal.toFixed(2)}`}
                      className="flex-1 py-4 bg-primary text-white rounded-xl font-bold cursor-pointer hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={processing}
                      onClick={handleFlutterwavePayment}
                    />
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCashOnDelivery}
                      disabled={processing}
                      className="flex-1 py-4 bg-primary text-white rounded-xl font-bold cursor-pointer hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing ? 'Processing...' : 'Place Order'}
                    </motion.button>
                  )}
                </div>

                {/* Security Badge */}
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Lock className="w-4 h-4" />
                  <span>Secure checkout - Your information is protected</span>
                </div>
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
