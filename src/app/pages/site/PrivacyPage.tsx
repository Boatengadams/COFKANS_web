import { SiteShell, useSiteContent, RichBody } from './SiteShell';

export function PrivacyPage() {
  const { privacy } = useSiteContent();
  return (
    <SiteShell eyebrow="Legal" title={privacy.title} subtitle={privacy.subtitle}>
      <RichBody source={privacy.body} />
      {privacy.updatedAt && (
        <p className="mt-10 text-xs text-muted-foreground">Last updated {new Date(privacy.updatedAt).toLocaleDateString()}</p>
      )}
    </SiteShell>
  );
}
export default PrivacyPage;
