import { SiteShell, useSiteContent, RichBody } from './SiteShell';

export function FaqPage() {
  const { faq } = useSiteContent();
  return (
    <SiteShell eyebrow="Questions" title={faq.title} subtitle={faq.subtitle}>
      <section className="mb-10 space-y-3" aria-labelledby="service-faq-title">
        <h2 id="service-faq-title" className="text-2xl font-bold tracking-tight">Electrical service FAQs</h2>
        {[
          ['Do you deliver across Ghana?', 'Yes. Delivery is available from the nearest branch, with timing depending on the destination.'],
          ['Are your products genuine and warranty-backed?', 'Products are supplied through the manufacturer or an authorised distributor and carry the applicable manufacturer warranty.'],
          ['Can I collect my order from a branch?', 'Yes. Customers can choose branch pickup during checkout where stock is available.'],
          ['Do you offer electrical installation services?', 'Yes. Cofkans offers installation support for lighting, solar, inverters, and industrial electrical systems.'],
          ['How can I get a price for an installation?', 'Contact Cofkans with the products and project details so the team can review the work and provide a quote.'],
        ].map(([question, answer]) => (
          <details key={question} className="rounded-2xl border-2 border-border bg-card p-4">
            <summary className="cursor-pointer font-bold">{question}</summary>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{answer}</p>
          </details>
        ))}
      </section>
      <RichBody source={faq.body} />
    </SiteShell>
  );
}
export default FaqPage;
