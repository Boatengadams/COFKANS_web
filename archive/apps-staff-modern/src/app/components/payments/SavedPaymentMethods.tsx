import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, Plus, Trash2, Star, Check, Smartphone, Globe } from 'lucide-react';
import { usePaymentMethodsStore } from '@/stores/payment-methods-store';
import { PAYMENT_METHODS, detectPreferredGlobal, type PaymentProvider } from '@/lib/payments/types';

export function SavedPaymentMethods() {
  const methods = usePaymentMethodsStore(s => s.methods);
  const add = usePaymentMethodsStore(s => s.add);
  const remove = usePaymentMethodsStore(s => s.remove);
  const setDefault = usePaymentMethodsStore(s => s.setDefault);

  const [showAdd, setShowAdd] = useState(false);
  const [draftProvider, setDraftProvider] = useState<PaymentProvider>('mtn-momo');
  const [draftPhone, setDraftPhone] = useState('');

  const preferredGlobal = detectPreferredGlobal();
  const choices = PAYMENT_METHODS.filter(m => m.region === 'local' || m.id === preferredGlobal);

  const submitAdd = () => {
    const isMomo = draftProvider === 'mtn-momo' || draftProvider === 'telecel-cash';
    if (isMomo && !/^0\d{9}$/.test(draftPhone.replace(/\s/g, ''))) return;
    add(draftProvider, isMomo ? draftPhone.replace(/\s/g, '') : 'auto');
    setShowAdd(false);
    setDraftPhone('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" /> Payment methods
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Save your preferred ways to pay for one-tap checkout.</p>
        </div>
        <button
          onClick={() => setShowAdd(v => !v)}
          className="px-4 py-2 bg-foreground text-background rounded-xl font-bold text-sm flex items-center gap-2 hover:opacity-90"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-muted/40 border-2 border-border rounded-2xl space-y-4">
              <div>
                <label className="block text-xs font-bold mb-2 uppercase tracking-wide text-muted-foreground">Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {choices.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setDraftProvider(m.id)}
                      className={`p-3 rounded-xl border-2 text-left text-sm font-semibold ${draftProvider === m.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {(draftProvider === 'mtn-momo' || draftProvider === 'telecel-cash') && (
                <div>
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wide text-muted-foreground">Phone number</label>
                  <input
                    type="tel"
                    value={draftPhone}
                    onChange={e => setDraftPhone(e.target.value.replace(/[^\d\s]/g, ''))}
                    placeholder="024 123 4567"
                    maxLength={13}
                    className="w-full px-4 py-3 bg-card rounded-xl border-2 border-border focus:border-primary focus:outline-none font-semibold"
                  />
                </div>
              )}

              {(draftProvider === 'google-pay' || draftProvider === 'apple-pay') && (
                <p className="text-xs text-muted-foreground bg-card border border-border rounded-lg p-3">
                  Your billing details will be fetched automatically when you sign in on your device.
                </p>
              )}

              <div className="flex gap-2">
                <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 bg-muted hover:bg-muted/70 rounded-xl font-bold text-sm">Cancel</button>
                <button onClick={submitAdd} className="flex-1 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90">Save method</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {methods.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl">
          <CreditCard className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="font-semibold">No saved methods yet</p>
          <p className="text-sm text-muted-foreground">Add MTN, Telecel, Google Pay or Apple Pay for one-tap checkout.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {methods.map(m => {
            const isWallet = m.provider === 'google-pay' || m.provider === 'apple-pay';
            return (
              <div key={m.id} className="flex items-center gap-4 p-4 bg-card border-2 border-border rounded-2xl">
                <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                  {isWallet ? <Globe className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold truncate">{m.label}</p>
                    {m.isDefault && (
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wide flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-primary" /> Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {isWallet ? 'Auto-billing on sign-in' : `•••• ${m.hint.slice(-4)}`}
                  </p>
                </div>
                {!m.isDefault && (
                  <button
                    onClick={() => setDefault(m.id)}
                    title="Set as default"
                    className="p-2 rounded-lg hover:bg-muted text-muted-foreground"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => remove(m.id)}
                  title="Remove"
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
