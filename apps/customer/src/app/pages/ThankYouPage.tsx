import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { SiteShell } from './site/SiteShell';

export default function ThankYouPage() {
  return (
    <SiteShell eyebrow="Request received" title="Thank you" subtitle="Your enquiry has been received.">
      <section className="rounded-2xl border-2 border-border bg-card p-6 sm:p-8" aria-labelledby="thank-you-title">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary"><CheckCircle2 className="h-6 w-6" aria-hidden="true" /></div>
        <h2 id="thank-you-title" className="text-xl font-bold">We have your request</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">A Cofkans team member will review the details you sent and follow up using the contact information provided.</p>
        <a href="/contact" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 font-bold text-white">Contact Cofkans <ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
      </section>
    </SiteShell>
  );
}
