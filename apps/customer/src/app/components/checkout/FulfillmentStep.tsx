import { useEffect, useMemo, useRef, useState } from 'react';
import { MapPin, Truck, ShieldCheck, Store, Navigation, Loader2 } from 'lucide-react';
import {
  useBranches,
  distanceKm,
  branchHasCoords,
  type CustomerCoords,
} from '@/lib/branches';

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

type LocationStatus = 'idle' | 'prompting' | 'granted' | 'denied' | 'unavailable';

export function FulfillmentStep({ value, onChange, onContinue }: Props) {
  const [origin, setOrigin] = useState<CustomerCoords | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle');
  const branches = useBranches(true, origin);

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
  const prevLocationStatus = useRef(locationStatus);

  // If the selected branch is missing or removed, default to the first one
  // (nearest when location is granted; otherwise catalog order).
  useEffect(() => {
    if (!firstSlug || hasSelected) return;
    onChangeRef.current({ ...valueRef.current, branchSlug: firstSlug });
  }, [firstSlug, hasSelected, branchesKey]);

  // Only auto-pick nearest once, when location permission is newly granted —
  // do not re-force firstSlug on later list reorders (that made manual selection
  // feel broken).
  useEffect(() => {
    const justGranted =
      locationStatus === 'granted' && prevLocationStatus.current !== 'granted';
    prevLocationStatus.current = locationStatus;
    if (!justGranted || !firstSlug) return;
    onChangeRef.current({ ...valueRef.current, branchSlug: firstSlug });
  }, [locationStatus, firstSlug]);

  // Default the scheduled date the first time the user lands here / switches type.
  useEffect(() => {
    if (valueRef.current.scheduledDate) return;
    onChangeRef.current({
      ...valueRef.current,
      scheduledDate: todayISO(value.type === 'delivery' ? 1 : 0),
    });
  }, [value.type]);

  const requestNearestBranch = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocationStatus('unavailable');
      return;
    }
    setLocationStatus('prompting');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setOrigin({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus('granted');
      },
      () => {
        setOrigin(null);
        setLocationStatus('denied');
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 60_000 },
    );
  };

  const selected = useMemo(
    () => branches.find((b) => b.slug === value.branchSlug),
    [branches, value.branchSlug],
  );

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
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <label className="block text-sm font-bold">
            {value.type === 'pickup' ? 'Pickup branch' : 'Dispatching branch'}
          </label>
          {locationStatus !== 'granted' && (
            <button
              type="button"
              onClick={requestNearestBranch}
              disabled={locationStatus === 'prompting'}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline disabled:opacity-60"
            >
              {locationStatus === 'prompting' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Navigation className="w-3.5 h-3.5" />
              )}
              Use my location — show nearest branch
            </button>
          )}
        </div>
        <p className="text-xs text-muted-foreground mb-2">
          Location is only used to sort branches by distance so you can pick up closer to you.
          You can still choose any branch from the list.
        </p>
        {locationStatus === 'denied' && (
          <p className="text-xs text-amber-700 dark:text-amber-300 mb-2">
            Location permission denied — showing the usual branch order. You can still pick any branch.
          </p>
        )}
        {locationStatus === 'unavailable' && (
          <p className="text-xs text-amber-700 dark:text-amber-300 mb-2">
            Location is not available on this device — showing the usual branch order.
          </p>
        )}
        {locationStatus === 'granted' && (
          <p className="text-xs text-emerald-700 dark:text-emerald-400 mb-2">
            Branches sorted nearest first based on your location.
          </p>
        )}
        <div className="relative">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <select
            value={value.branchSlug}
            onChange={(e) => onChange({ ...value, branchSlug: e.target.value })}
            className="w-full pl-10 pr-4 py-3 bg-background border-2 border-border rounded-xl focus:outline-none focus:border-primary appearance-none"
          >
            {branches.length === 0 && <option value="">No branches available</option>}
            {branches.map((b) => {
              const dist =
                origin && branchHasCoords(b)
                  ? distanceKm(origin, { lat: b.lat, lng: b.lng })
                  : null;
              const distLabel = dist != null
                ? ` · ${dist < 10 ? dist.toFixed(1) : Math.round(dist)} km`
                : '';
              return (
                <option key={b.slug} value={b.slug}>
                  {b.name} — {b.city}{distLabel}
                </option>
              );
            })}
          </select>
        </div>
        {selected?.address && (
          <p className="text-xs text-muted-foreground mt-1.5">
            {selected.address}
            {selected.hours ? ' • ' + selected.hours : ''}
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
