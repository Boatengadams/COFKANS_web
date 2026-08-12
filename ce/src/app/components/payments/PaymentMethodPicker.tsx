import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, Shield, CheckCircle, AlertCircle, Lock, Globe, MapPin } from 'lucide-react';
import { PAYMENT_METHODS, detectPreferredGlobal, type PaymentProvider } from '@/lib/payments/types';
import { charge, type ChargeResult } from '@/lib/payments/providers';
import { usePaymentMethodsStore } from '@/stores/payment-methods-store';

interface Props {
  amount: number;
  orderId: string;
  customerName?: string;
  customerEmail?: string;
  onSuccess: (result: ChargeResult) => void;
  onCancel?: () => void;
}

export function PaymentMethodPicker({ amount, orderId, customerName, customerEmail, onSuccess, onCancel }: Props) {
  const saved = usePaymentMethodsStore(s => s.methods);
  const addMethod = usePaymentMethodsStore(s => s.add);

  const preferredGlobal = useMemo(() => detectPreferredGlobal(), []);
  const visibleMethods = useMemo(
    () => PAYMENT_METHODS.filter(m => m.region === 'local' || m.id === preferredGlobal),
    [preferredGlobal],
  );

  const [selected, setSelected] = useState<PaymentProvider | null>(null);
  const [phone, setPhone] = useState('');
  const [savePref, setSavePref] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  // Pre-select user's default saved method if it matches a visible option
  useEffect(() => {
    const def = saved.find(m => m.isDefault);
    if (def && visibleMethods.some(v => v.id === def.provider)) {
      setSelected(def.provider);
      if (def.provider === 'mtn-momo' || def.provider === 'telecel-cash') setPhone(def.hint);
    }
  }, [saved, visibleMethods]);

  const needsPhone = selected === 'mtn-momo' || selected === 'telecel-cash';

  const handlePay = async () => {
    if (!selected) { setError('Choose a payment method.'); return; }
    if (needsPhone && !/^0\d{9}$/.test(phone.replace(/\s/g, ''))) {
      setError('Enter a valid 10-digit Ghana phone number (e.g. 024XXXXXXX).');
      return;
    }
    setError('');
    setProcessing(true);
    const res = await charge({ provider: selected, amount, orderId, phone, customerName, customerEmail });
    setProcessing(false);
    if (!res.ok) {
      setError(res.failureReason || 'Payment failed. Please try again.');
      return;
    }
    if (savePref) {
      const hint = needsPhone ? phone.replace(/\s/g, '') : 'auto';
      addMethod(selected, hint);
    }
    onSuccess(res);
  };

  return (
    <div className="space-y-5">
      {/* Trust strip */}
      <div className="flex items-center justify-center gap-2 p-3 bg-secondary/10 rounded-xl border border-secondary/20">
        <Shield className="w-4 h-4 text-secondary" strokeWidth={2.5} />
        <span className="text-xs font-bold text-secondary">256-bit Encrypted · PCI Compliant</span>
        <Lock className="w-3.5 h-3.5 text-secondary" strokeWidth={2.5} />
      </div>

      {/* Local methods */}
      <Section title="Pay with Mobile Money" icon={<MapPin className="w-4 h-4" />}>
        <div className="grid grid-cols-2 gap-2">
          {visibleMethods.filter(m => m.region === 'local').map(m => (
            <MethodButton
              key={m.id}
              meta={m}
              active={selected === m.id}
              onSelect={() => setSelected(m.id)}
            />
          ))}
        </div>
      </Section>

      {/* Global methods (auto-detected) */}
      <Section title="One-tap wallet" icon={<Globe className="w-4 h-4" />}>
        <div className="grid grid-cols-1 gap-2">
          {visibleMethods.filter(m => m.region === 'global').map(m => (
            <MethodButton
              key={m.id}
              meta={m}
              active={selected === m.id}
              onSelect={() => setSelected(m.id)}
              highlight
            />
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">
          We detected {preferredGlobal === 'apple-pay' ? 'Apple Pay' : 'Google Pay'} on your device. Sign-in billing details are fetched automatically.
        </p>
      </Section>

      {/* Phone for mobile money */}
      <AnimatePresence>
        {needsPhone && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <label className="block text-sm font-semibold mb-2">{selected === 'mtn-momo' ? 'MTN' : 'Telecel'} number</label>
            <div className="relative">
              <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/[^\d\s]/g, ''))}
                placeholder="024 123 4567"
                maxLength={13}
                className="w-full pl-10 pr-4 py-3 bg-muted rounded-xl border-2 border-border focus:border-primary focus:outline-none text-sm font-semibold"
              />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5">You'll receive a prompt on your phone to authorise GH₵{amount.toLocaleString()}.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save preference */}
      {selected && (
        <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none">
          <input
            type="checkbox"
            checked={savePref}
            onChange={e => setSavePref(e.target.checked)}
            className="w-4 h-4 rounded accent-primary"
          />
          Save this method to my account for faster checkout
        </label>
      )}

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-900 dark:text-red-100 font-medium">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        {onCancel && (
          <button onClick={onCancel} disabled={processing}
            className="flex-1 py-3 px-4 bg-muted hover:bg-muted/70 rounded-xl font-bold text-sm disabled:opacity-50">
            Cancel
          </button>
        )}
        <motion.button
          whileTap={{ scale: processing ? 1 : 0.98 }}
          onClick={handlePay}
          disabled={!selected || processing}
          className="flex-1 py-3 px-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {processing ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Processing…</>
          ) : (
            <><Lock className="w-4 h-4" />Pay GH₵{amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</>
          )}
        </motion.button>
      </div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-muted-foreground uppercase tracking-wide">
        {icon}{title}
      </div>
      {children}
    </div>
  );
}

function MethodButton({ meta, active, onSelect, highlight }: {
  meta: typeof PAYMENT_METHODS[number]; active: boolean; onSelect: () => void; highlight?: boolean;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={`p-3 rounded-xl border-2 text-left transition-all ${
        active ? 'border-primary bg-primary/10 shadow-md' : highlight ? 'border-border bg-gradient-to-br from-muted/50 to-background hover:border-primary/50' : 'border-border hover:border-primary/50'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold ${badgeBg(meta.id)}`}>
          {iconFor(meta.id)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-xs leading-tight truncate">{meta.label}</p>
          <p className="text-[10px] text-muted-foreground truncate">{meta.short}</p>
        </div>
        {active && <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />}
      </div>
    </motion.button>
  );
}

function badgeBg(id: PaymentProvider): string {
  switch (id) {
    case 'mtn-momo': return 'bg-yellow-500';
    case 'telecel-cash': return 'bg-red-500';
    case 'google-pay': return 'bg-gradient-to-br from-blue-500 via-red-500 to-yellow-500';
    case 'apple-pay': return 'bg-black';
    default: return 'bg-muted-foreground';
  }
}

function iconFor(id: PaymentProvider): string {
  switch (id) {
    case 'mtn-momo': return 'M';
    case 'telecel-cash': return 'T';
    case 'google-pay': return 'G';
    case 'apple-pay': return '';
    default: return '$';
  }
}
