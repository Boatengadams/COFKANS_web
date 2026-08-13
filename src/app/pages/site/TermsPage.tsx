import { SiteShell, useSiteContent, RichBody } from './SiteShell';

export function TermsPage() {
  const { terms } = useSiteContent();
  return (
    <SiteShell eyebrow="Legal" title={terms.title} subtitle={terms.subtitle}>
      <div className="mb-4 p-4 bg-card border-2 border-border rounded-lg">
        <p className="text-sm">These terms govern use of Cofkans services and products. For account-related preferences, visit Settings in your dashboard.</p>
      </div>
      <RichBody source={terms.body} />
      {terms.updatedAt && (
        <p className="mt-10 text-xs text-muted-foreground">Last updated {new Date(terms.updatedAt).toLocaleDateString()}</p>
      )}
    </SiteShell>
  );
}
export default TermsPage;
