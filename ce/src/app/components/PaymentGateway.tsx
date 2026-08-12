import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, Smartphone, X, CheckCircle, AlertCircle, Lock, Shield } from 'lucide-react';
import { sanitizeInput, isValidPhone, AuditLogger } from '../utils/security';

interface PaymentGatewayProps {
  amount: number;
  orderId: string;
  onSuccess: (paymentId: string, method: string) => void;
  onCancel: () => void;
}

type PaymentMethod = 'paypal' | 'mtn-momo' | 'vodafone-cash' | 'airteltigo-money';

export function PaymentGateway({ amount, orderId, onSuccess, onCancel }: PaymentGatewayProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const paymentMethods = [
    { id: 'mtn-momo' as PaymentMethod, name: 'MTN Mobile Money', logo: '🟡', description: 'Pay with MTN MoMo', color: 'from-yellow-400 to-yellow-600' },
    { id: 'vodafone-cash' as PaymentMethod, name: 'Vodafone Cash', logo: '🔴', description: 'Pay with Vodafone Cash', color: 'from-red-500 to-red-700' },
    { id: 'airteltigo-money' as PaymentMethod, name: 'AirtelTigo Money', logo: '🔵', description: 'Pay with AirtelTigo', color: 'from-blue-500 to-blue-700' },
    { id: 'paypal' as PaymentMethod, name: 'PayPal', logo: '💳', description: 'Pay with PayPal', color: 'from-blue-600 to-blue-800' }
  ];

  const handlePayment = async () => {
    if (!selectedMethod) {
      setError('Please select a payment method');
      return;
    }

    if (selectedMethod !== 'paypal') {
      const sanitizedPhone = sanitizeInput(phoneNumber);
      if (!isValidPhone(sanitizedPhone)) {
        setError('Please enter a valid Ghana phone number');
        return;
      }
    }

    setProcessing(true);
    setError('');

    try {
      AuditLogger.log('payment_initiated', 'payment', { orderId, amount, method: selectedMethod });
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing

      const paymentId = `PAY_${Date.now()}_${Math.random().toString(36).substring(7).toUpperCase()}`;
      AuditLogger.log('payment_completed', 'payment', { orderId, paymentId, amount, method: selectedMethod });

      setSuccess(true);
      setTimeout(() => onSuccess(paymentId, selectedMethod!), 2000);
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
      AuditLogger.log('payment_failed', 'payment', { orderId, error: err.message });
    } finally {
      setProcessing(false);
    }
  };

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-24 h-24 mx-auto mb-6 rounded-full bg-secondary/20 flex items-center justify-center"
        >
          <CheckCircle className="w-16 h-16 text-secondary" strokeWidth={2} />
        </motion.div>
        <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: 'var(--font-luxury)' }}>Payment Successful!</h2>
        <p className="text-muted-foreground text-lg">Your order has been confirmed.</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center gap-2 p-4 bg-secondary/10 rounded-xl border border-secondary/20">
        <Shield className="w-5 h-5 text-secondary" strokeWidth={2.5} />
        <span className="text-sm font-bold text-secondary">256-bit Encrypted Secure Payment</span>
        <Lock className="w-4 h-4 text-secondary" strokeWidth={2.5} />
      </div>

      <div className="text-center p-6 bg-muted rounded-2xl">
        <p className="text-sm text-muted-foreground mb-2">Total Amount</p>
        <p className="text-4xl font-bold" style={{ fontFamily: 'var(--font-luxury)' }}>
          GH₵ {amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
        <p className="text-xs text-muted-foreground mt-2">Order ID: {orderId}</p>
      </div>

      <div>
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5" strokeWidth={2.5} />
          Select Payment Method
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {paymentMethods.map((method) => (
            <motion.button
              key={method.id}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedMethod(method.id)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                selectedMethod === method.id ? 'border-primary bg-primary/10 shadow-lg' : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-3xl">{method.logo}</div>
                <div className="flex-1">
                  <p className="font-bold text-sm">{method.name}</p>
                  <p className="text-xs text-muted-foreground">{method.description}</p>
                </div>
                {selectedMethod === method.id && <CheckCircle className="w-5 h-5 text-primary" strokeWidth={2.5} />}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {selectedMethod && selectedMethod !== 'paypal' && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <label className="block font-semibold mb-2">Mobile Money Number</label>
          <div className="relative">
            <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" strokeWidth={2} />
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(sanitizeInput(e.target.value))}
              placeholder="0XX XXX XXXX"
              className="w-full pl-12 pr-4 py-4 bg-muted rounded-xl border-2 border-border focus:border-primary focus:outline-none font-medium"
              maxLength={10}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">You will receive a prompt on your phone to authorize payment</p>
        </motion.div>
      )}

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" strokeWidth={2.5} />
            <p className="text-sm text-red-900 dark:text-red-100 font-medium">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-3 pt-4">
        <button onClick={onCancel} disabled={processing}
          className="flex-1 py-4 px-6 bg-muted hover:bg-muted/70 rounded-xl font-bold transition-colors disabled:opacity-50">
          Cancel
        </button>
        <motion.button whileHover={{ scale: processing ? 1 : 1.02 }} whileTap={{ scale: processing ? 1 : 0.98 }}
          onClick={handlePayment} disabled={!selectedMethod || processing}
          className="flex-1 py-4 px-6 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2">
          {processing ? (
            <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Processing...</>
          ) : (
            <><Lock className="w-5 h-5" strokeWidth={2.5} />Pay GH₵ {amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</>
          )}
        </motion.button>
      </div>

      <div className="flex items-center justify-center gap-6 pt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1"><Shield className="w-3 h-3" /><span>PCI Compliant</span></div>
        <div className="flex items-center gap-1"><Lock className="w-3 h-3" /><span>SSL Encrypted</span></div>
        <div className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /><span>Secure</span></div>
      </div>
    </div>
  );
}
