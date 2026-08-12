import { SiteShell, useSiteContent, RichBody } from './SiteShell';

export function TermsPage() {
  const { terms } = useSiteContent();
  return (
    <SiteShell eyebrow="Legal" title={terms.title} subtitle={terms.subtitle}>
      <RichBody source={terms.body} />
      {terms.updatedAt && (
        <p className="mt-10 text-xs text-muted-foreground">Last updated {new Date(terms.updatedAt).toLocaleDateString()}</p>
      )}
    </SiteShell>
  );
}
export default TermsPage;
