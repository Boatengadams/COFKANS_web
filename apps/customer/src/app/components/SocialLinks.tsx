export const SOCIAL_LINKS = [
  { label: 'TikTok', url: 'https://www.tiktok.com/@cofkans_electricals' },
  { label: 'YouTube', url: 'https://www.youtube.com/@CofkansElectrical' },
  { label: 'Instagram', url: 'https://www.instagram.com/cofkans_electricals_limited/' },
  { label: 'Facebook', url: 'https://www.facebook.com/profile.php?id=61553916757510' },
] as const;

function TikTokMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
      <path d="M15.7 3c.3 2.6 1.7 4.1 4.3 4.3v3.1c-1.5.1-2.9-.4-4.3-1.2v6.1a5.7 5.7 0 1 1-4.9-5.6v3.2a2.6 2.6 0 1 0 1.8 2.4V3h3.1Z" />
    </svg>
  );
}

function InstagramMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" className="fill-current stroke-none" />
    </svg>
  );
}

function YouTubeMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
      <path d="M21.6 7.2a2.8 2.8 0 0 0-2-2C17.8 4.7 12 4.7 12 4.7s-5.8 0-7.6.5a2.8 2.8 0 0 0-2 2A29 29 0 0 0 2 12a29 29 0 0 0 .4 4.8 2.8 2.8 0 0 0 2 2c1.8.5 7.6.5 7.6.5s5.8 0 7.6-.5a2.8 2.8 0 0 0 2-2A29 29 0 0 0 22 12a29 29 0 0 0-.4-4.8ZM10 15.3V8.7l5.7 3.3-5.7 3.3Z" />
    </svg>
  );
}

function FacebookMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
      <path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V4a21 21 0 0 0-2.4-.1c-2.4 0-4 1.5-4 4.1V10H8v3h2.4v8h3.1Z" />
    </svg>
  );
}

const ICONS = {
  TikTok: TikTokMark,
  YouTube: YouTubeMark,
  Instagram: InstagramMark,
  Facebook: FacebookMark,
} as const;

export function SocialLinks({ links = SOCIAL_LINKS }: { links?: readonly { label: string; url: string }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Social media links">
      {links.map((social) => {
        const Icon = ICONS[social.label as keyof typeof ICONS];
        return (
          <a
            key={`${social.label}-${social.url}`}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Visit our ${social.label}`}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            {Icon ? <Icon /> : <span className="text-xs font-bold">{social.label.slice(0, 2).toUpperCase()}</span>}
          </a>
        );
      })}
    </div>
  );
}
