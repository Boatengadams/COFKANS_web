import { SiteShell, useSiteContent, RichBody } from './SiteShell';

export function FaqPage() {
  const { faq } = useSiteContent();
  return (
    <SiteShell eyebrow="Questions" title={faq.title} subtitle={faq.subtitle}>
      <RichBody source={faq.body} />
    </SiteShell>
  );
}
export default FaqPage;
