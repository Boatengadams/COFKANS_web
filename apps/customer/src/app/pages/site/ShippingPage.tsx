import { Truck, MapPin } from 'lucide-react';
import { SiteShell, useSiteContent, RichBody } from './SiteShell';

export function ShippingPage() {
  const { shipping } = useSiteContent();
  return (
    <SiteShell eyebrow="Delivery" title={shipping.title} subtitle={shipping.subtitle}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        <div className="rounded-2xl border-2 border-border bg-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm">Nationwide delivery</div>
            <div className="text-xs text-muted-foreground">Same-day within Kumasi metro</div>
          </div>
        </div>
        <a href="/branches" className="rounded-2xl border-2 border-border bg-card p-4 flex items-center gap-3 hover:border-primary transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm">Free branch pickup</div>
            <div className="text-xs text-muted-foreground">7 branches · view all</div>
          </div>
        </a>
      </div>
      <RichBody source={shipping.body} />
    </SiteShell>
  );
}
export default ShippingPage;
