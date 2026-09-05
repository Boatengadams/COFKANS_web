import { Shield, Trash2, Download, Cookie } from 'lucide-react';
import { usePersonalizationStore } from '@/stores/personalization-store';
import toast from 'react-hot-toast';

export function PrivacySettings() {
  const consent = usePersonalizationStore(s => s.consent);
  const setConsent = usePersonalizationStore(s => s.setConsent);
  const reopenConsent = usePersonalizationStore(s => s.reopenConsent);
  const events = usePersonalizationStore(s => s.events);
  const categoryScores = usePersonalizationStore(s => s.categoryScores);
  const productScores = usePersonalizationStore(s => s.productScores);
  const recentQueries = usePersonalizationStore(s => s.recentQueries);
  const clearHistory = usePersonalizationStore(s => s.clearHistory);

  const exportData = () => {
    const blob = new Blob(
      [JSON.stringify({ consent, events, categoryScores, productScores, recentQueries }, null, 2)],
      { type: 'application/json' },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cofkans-privacy-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported.');
  };

  const wipe = () => {
    clearHistory();
    toast.success('Personalisation history cleared.');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" /> Privacy & personalisation
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Control what we collect and how we personalise your experience. Changes apply immediately.
        </p>
      </div>

      <div className="space-y-3">
        <Toggle
          title="Analytics"
          desc="Aggregate, anonymous page-view and performance data."
          value={consent.analytics}
          onChange={v => setConsent({ analytics: v })}
        />
        <Toggle
          title="Personalisation"
          desc="Recommend products based on your views, dwell time and purchases."
          value={consent.personalization}
          onChange={v => setConsent({ personalization: v })}
        />
        <Toggle
          title="In-app marketing"
          desc="Show targeted promo banners and 'just for you' deals."
          value={consent.marketing}
          onChange={v => setConsent({ marketing: v })}
        />
        <Toggle
          title="SMS marketing"
          desc="Receive occasional promotional SMS from Cofkans (sent via Hubtel)."
          value={consent.sms}
          onChange={v => setConsent({ sms: v })}
        />
      </div>

      <button
        onClick={reopenConsent}
        className="w-full p-4 rounded-2xl border-2 border-dashed border-border hover:border-primary hover:bg-muted/30 transition-colors text-left flex items-center gap-3"
      >
        <Cookie className="w-5 h-5 text-primary" />
        <div className="flex-1">
          <p className="font-bold text-sm">Open full cookie centre</p>
          <p className="text-xs text-muted-foreground">See every cookie, vendor and your rights in detail.</p>
        </div>
      </button>

      <div className="bg-muted/40 border-2 border-border rounded-2xl p-5 space-y-3">
        <h3 className="font-bold">Your data on this device</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <Stat label="Events tracked" value={events.length} />
          <Stat label="Top categories" value={Object.keys(categoryScores).length} />
          <Stat label="Products scored" value={Object.keys(productScores).length} />
          <Stat label="Recent searches" value={recentQueries.length} />
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <button onClick={exportData} className="px-3 py-2 rounded-xl bg-card border-2 border-border hover:bg-muted text-xs font-bold flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" /> Export my data
          </button>
          <button onClick={wipe} className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/15 text-red-600 text-xs font-bold flex items-center gap-1.5">
            <Trash2 className="w-3.5 h-3.5" /> Clear personalisation history
          </button>
        </div>
      </div>
    </div>
  );
}

function Toggle({ title, desc, value, onChange }: { title: string; desc: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-start gap-4 p-4 rounded-2xl bg-card border-2 border-border hover:bg-muted/30 cursor-pointer">
      <div className="flex-1">
        <p className="font-bold text-sm">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full flex-shrink-0 transition-colors ${value ? 'bg-primary' : 'bg-muted'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-5' : ''}`} />
      </button>
    </label>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-card rounded-xl border border-border p-3">
      <p className="font-bold text-lg leading-tight">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}
