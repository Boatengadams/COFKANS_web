import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PaymentProvider, SavedPaymentMethod } from '@/lib/payments/types';

interface State {
  methods: SavedPaymentMethod[];
  add: (provider: PaymentProvider, hint: string, label?: string) => void;
  remove: (id: string) => void;
  setDefault: (id: string) => void;
  defaultFor: (region: 'local' | 'global' | 'any') => SavedPaymentMethod | undefined;
}

const uid = () => Math.random().toString(36).slice(2, 10);

export const usePaymentMethodsStore = create<State>()(
  persist(
    (set, get) => ({
      methods: [],
      add: (provider, hint, label) => set(s => {
        // Dedupe by provider+hint
        const exists = s.methods.find(m => m.provider === provider && m.hint === hint);
        if (exists) return s;
        const isFirst = s.methods.length === 0;
        const m: SavedPaymentMethod = {
          id: uid(),
          provider,
          label: label ?? defaultLabel(provider),
          hint,
          isDefault: isFirst,
          addedAt: Date.now(),
        };
        return { methods: [...s.methods, m] };
      }),
      remove: id => set(s => {
        const next = s.methods.filter(m => m.id !== id);
        if (!next.some(m => m.isDefault) && next.length) next[0].isDefault = true;
        return { methods: next };
      }),
      setDefault: id => set(s => ({
        methods: s.methods.map(m => ({ ...m, isDefault: m.id === id })),
      })),
      defaultFor: region => {
        const all = get().methods;
        if (region === 'any') return all.find(m => m.isDefault) ?? all[0];
        const localProviders: PaymentProvider[] = ['mtn-momo', 'telecel-cash'];
        const match = (m: SavedPaymentMethod) =>
          region === 'local' ? localProviders.includes(m.provider) : !localProviders.includes(m.provider);
        const filtered = all.filter(match);
        return filtered.find(m => m.isDefault) ?? filtered[0];
      },
    }),
    { name: 'cofkans:payment-methods' },
  ),
);

function defaultLabel(p: PaymentProvider) {
  switch (p) {
    case 'mtn-momo': return 'MTN Mobile Money';
    case 'telecel-cash': return 'Telecel Cash';
    case 'google-pay': return 'Google Pay';
    case 'apple-pay': return 'Apple Pay';
    case 'cash': return 'Cash on Delivery';
  }
}
