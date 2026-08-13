import { SiteShell, useSiteContent, RichBody } from './SiteShell';

export function PrivacyPage() {
  const { privacy } = useSiteContent();
  return (
    <SiteShell eyebrow="Legal" title={privacy.title} subtitle={privacy.subtitle}>
      <div className="mb-4 p-4 bg-card border-2 border-border rounded-lg">
        <p className="text-sm">Manage your privacy preferences from your account Settings → Privacy. If you're signed in open your dashboard and go to Settings.</p>
      </div>
      <RichBody source={privacy.body} />
      {privacy.updatedAt && (
        <p className="mt-10 text-xs text-muted-foreground">Last updated {new Date(privacy.updatedAt).toLocaleDateString()}</p>
      )}
    </SiteShell>
  );
}
export default PrivacyPage;
