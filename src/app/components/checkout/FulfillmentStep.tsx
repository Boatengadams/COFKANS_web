import { useEffect, useRef } from 'react';
import { MapPin, Truck, ShieldCheck, Store } from 'lucide-react';
import { useBranches } from '@/lib/branches';

export interface FulfillmentChoice {
  type: 'pickup' | 'delivery';
  branchSlug: string;
  scheduledDate: string;
}

interface Props {
  value: FulfillmentChoice;
  onChange: (next: FulfillmentChoice) => void;
  onContinue: () => void;
}

function todayISO(offset = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

export function FulfillmentStep({ value, onChange, onContinue }: Props) {
  const branches = useBranches(true);

  // Keep the latest `value` + `onChange` in refs so the sync effects below can
  // depend on primitives only (branch list length/first-slug, current slug,
  // fulfillment type). Depending on the whole `value` object here creates an
  // infinite loop: effect -> onChange({...value}) -> new value -> effect ...
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  useEffect(() => { valueRef.current = value; onChangeRef.current = onChange; });

  const firstSlug = branches[0]?.slug;
  const branchesKey = branches.map(b => b.slug).join(',');
  const hasSelected = !!value.branchSlug && branches.some(b => b.slug === value.branchSlug);

  // If the selected branch is missing or removed, default to the first one.
  useEffect(() => {
    if (!firstSlug || hasSelected) return;
    onChangeRef.current({ ...valueRef.current, branchSlug: firstSlug });
  }, [firstSlug, hasSelected, branchesKey]);

  // Default the scheduled date the first time the user lands here / switches type.
  useEffect(() => {
    if (valueRef.current.scheduledDate) return;
    onChangeRef.current({
      ...valueRef.current,
      scheduledDate: todayISO(value.type === 'delivery' ? 1 : 0),
    });
  }, [value.type]);

  const canContinue = !!value.branchSlug && !!value.scheduledDate;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">How would you like to receive your order?</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Choose pickup at a Cofkans branch or delivery to your address.
        </p>
      </div>

      {/* Type tiles */}
      <div className="grid sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange({ ...value, type: 'pickup' })}
          className={`text-left p-5 border-2 rounded-xl transition ${
            value.type === 'pickup'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/40'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <Store className="w-5 h-5 text-primary" />
            <span className="font-bold">Pickup at branch</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Collect your order from Accra or Kumasi. No delivery fee.
          </p>
        </button>

        <button
          type="button"
          onClick={() => onChange({ ...value, type: 'delivery' })}
          className={`text-left p-5 border-2 rounded-xl transition ${
            value.type === 'delivery'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/40'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <Truck className="w-5 h-5 text-primary" />
            <span className="font-bold">Home / business delivery</span>
          </div>
          <p className="text-xs text-muted-foreground">
            We dispatch from your chosen branch. Payment is required before delivery.
          </p>
        </button>
      </div>

      {/* Branch */}
      <div>
        <label className="block text-sm font-bold mb-2">
          {value.type === 'pickup' ? 'Pickup branch' : 'Dispatching branch'}
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <select
            value={value.branchSlug}
            onChange={(e) => onChange({ ...value, branchSlug: e.target.value })}
            className="w-full pl-10 pr-4 py-3 bg-background border-2 border-border rounded-xl focus:outline-none focus:border-primary appearance-none"
          >
            {branches.length === 0 && <option value="">No branches available</option>}
            {branches.map((b) => (
              <option key={b.slug} value={b.slug}>
                {b.name} — {b.city}
              </option>
            ))}
          </select>
        </div>
        {branches.find((b) => b.slug === value.branchSlug)?.address && (
          <p className="text-xs text-muted-foreground mt-1.5">
            {branches.find((b) => b.slug === value.branchSlug)?.address}
            {branches.find((b) => b.slug === value.branchSlug)?.hours
              ? ' • ' + branches.find((b) => b.slug === value.branchSlug)?.hours
              : ''}
          </p>
        )}
      </div>

      {/* Payment-before-fulfilment notice (applies to pickup AND delivery) */}
      <div className="flex items-start gap-3 p-4 border-2 border-amber-500/30 bg-amber-500/10 rounded-xl">
        <ShieldCheck className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <div className="font-bold text-amber-700 dark:text-amber-300">
            {value.type === 'pickup' ? 'Payment required before pickup' : 'Payment required before delivery'}
          </div>
          <p className="text-amber-700/80 dark:text-amber-300/80 mt-0.5">
            {value.type === 'pickup'
              ? 'Pay online now to reserve your items. Your order is prepared for collection once payment is confirmed.'
              : 'We dispatch once your payment is confirmed. Cash on delivery is not available.'}
          </p>
        </div>
      </div>

      <button
        type="button"
        disabled={!canContinue}
        onClick={onContinue}
        className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {value.type === 'pickup' ? 'Continue to Payment' : 'Continue to Address'}
      </button>
    </div>
  );
}
