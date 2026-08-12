import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Store, Truck, MapPin, Calendar, Navigation, Check } from 'lucide-react';
import { BRANCHES, distanceKm, nearestBranch, type Branch } from '../../../lib/branches';

export type FulfillmentType = 'pickup' | 'delivery';

export interface FulfillmentChoice {
  type: FulfillmentType;
  branchSlug: string;       // origin branch for both pickup and delivery
  scheduledDate: string;    // YYYY-MM-DD; either pickup day or delivery day
}

interface Props {
  value: FulfillmentChoice;
  onChange: (next: FulfillmentChoice) => void;
  onContinue: () => void;
}

function todayPlus(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function FulfillmentStep({ value, onChange, onContinue }: Props) {
  const [geo, setGeo] = useState<{ lat: number; lng: number } | null>(null);
  const [geoState, setGeoState] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');

  // Auto-pre-select nearest branch when geo arrives, only if user hasn't picked manually
  useEffect(() => {
    if (geo && !value.branchSlug) {
      onChange({ ...value, branchSlug: nearestBranch(geo.lat, geo.lng).slug });
    }
  }, [geo]); // eslint-disable-line

  const requestLocation = () => {
    if (!('geolocation' in navigator)) {
      setGeoState('denied');
      return;
    }
    setGeoState('requesting');
    navigator.geolocation.getCurrentPosition(
      pos => {
        setGeo({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoState('granted');
      },
      () => setGeoState('denied'),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
    );
  };

  const sortedBranches = useMemo<(Branch & { distance?: number })[]>(() => {
    if (!geo) return BRANCHES;
    return [...BRANCHES]
      .map(b => ({ ...b, distance: distanceKm(geo.lat, geo.lng, b.lat, b.lng) }))
      .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
  }, [geo]);

  const selectedBranch = sortedBranches.find(b => b.slug === value.branchSlug);
  const minDate = todayPlus(value.type === 'pickup' ? 0 : 1);
  const maxDate = todayPlus(30);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-1">How would you like to get your order?</h2>
        <p className="text-sm text-muted-foreground">Pickup is fastest. Delivery uses one of our riders.</p>
      </div>

      {/* Fulfillment type — Pickup first */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={() => onChange({ ...value, type: 'pickup' })}
          className={`relative text-left rounded-2xl border-2 p-4 transition-colors ${
            value.type === 'pickup'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/40'
          }`}
        >
          {value.type === 'pickup' && (
            <span className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center">
              <Check className="w-4 h-4" />
            </span>
          )}
          <Store className="w-6 h-6 text-primary mb-2" />
          <div className="font-bold">Pickup from branch</div>
          <div className="text-xs text-muted-foreground mt-1">Walk in, show your order, walk out. No delivery fee.</div>
        </motion.button>

        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={() => onChange({ ...value, type: 'delivery' })}
          className={`relative text-left rounded-2xl border-2 p-4 transition-colors ${
            value.type === 'delivery'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/40'
          }`}
        >
          {value.type === 'delivery' && (
            <span className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center">
              <Check className="w-4 h-4" />
            </span>
          )}
          <Truck className="w-6 h-6 text-primary mb-2" />
          <div className="font-bold">Delivery to address</div>
          <div className="text-xs text-muted-foreground mt-1">A rider from the nearest branch brings it to you.</div>
        </motion.button>
      </div>

      {/* Branch picker */}
      <div className="rounded-2xl border-2 border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <h3 className="font-bold">
              {value.type === 'pickup' ? 'Pickup branch' : 'Branch fulfilling your delivery'}
            </h3>
          </div>
          {geoState !== 'granted' && (
            <button
              type="button"
              onClick={requestLocation}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 font-semibold"
            >
              <Navigation className="w-3.5 h-3.5" />
              {geoState === 'requesting' ? 'Finding…' : 'Use my location'}
            </button>
          )}
        </div>

        {geoState === 'granted' && selectedBranch && (
          <p className="text-xs text-muted-foreground mb-3">
            Nearest to you: <span className="font-semibold text-foreground">{sortedBranches[0].name}</span>
            {sortedBranches[0].distance !== undefined && ` (${sortedBranches[0].distance.toFixed(1)} km)`}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto">
          {sortedBranches.map(b => {
            const active = b.slug === value.branchSlug;
            return (
              <button
                key={b.slug}
                type="button"
                onClick={() => onChange({ ...value, branchSlug: b.slug })}
                className={`text-left rounded-xl border p-3 transition-colors ${
                  active ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-semibold text-sm">{b.name}</div>
                  {b.distance !== undefined && (
                    <div className="text-[10px] text-muted-foreground whitespace-nowrap">{b.distance.toFixed(1)} km</div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{b.city} · {b.address}</div>
                <div className="text-[11px] text-muted-foreground mt-1">{b.hours}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scheduled date */}
      <div className="rounded-2xl border-2 border-border p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="font-bold">
            {value.type === 'pickup' ? 'Pickup day' : 'Delivery day'}
          </h3>
        </div>
        <input
          type="date"
          value={value.scheduledDate || minDate}
          min={minDate}
          max={maxDate}
          onChange={e => onChange({ ...value, scheduledDate: e.target.value })}
          className="w-full sm:w-auto px-3 py-2 rounded-lg border-2 border-border bg-background"
        />
        <p className="text-xs text-muted-foreground mt-2">
          {value.type === 'pickup'
            ? 'Pick any day within the next 30 days. You can come earlier — your order will be held.'
            : 'Choose your preferred delivery day. Riders deliver Mon–Sat.'}
        </p>
      </div>

      <button
        type="button"
        onClick={onContinue}
        disabled={!value.branchSlug}
        className="w-full py-3 bg-primary text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition"
      >
        Continue
      </button>
    </div>
  );
}
