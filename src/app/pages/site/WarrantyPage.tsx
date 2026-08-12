import { ShieldCheck } from 'lucide-react';
import { SiteShell, useSiteContent, RichBody } from './SiteShell';

export function WarrantyPage() {
  const { warranty } = useSiteContent();
  return (
    <SiteShell eyebrow="Warranty & Returns" title={warranty.title} subtitle={warranty.subtitle}>
      <div className="mb-6 flex items-start gap-3 rounded-2xl border-2 border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-emerald-900 dark:text-emerald-100">
          Every product carries its full manufacturer warranty. Installation done by our team adds a 12-month workmanship guarantee.
        </p>
      </div>
      <RichBody source={warranty.body} />
    </SiteShell>
  );
}
export default WarrantyPage;
