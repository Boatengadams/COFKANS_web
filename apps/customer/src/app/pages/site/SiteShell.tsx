import { useEffect, useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { subscribeSiteContent, SITE_CONTENT_DEFAULTS, type SiteContent } from '@/lib/site-content';
import { SOCIAL_LINKS, SocialLinks } from '../../components/SocialLinks';

const BREADCRUMB_LABELS: Record<string, string> = {
  about: 'About', careers: 'Careers', contact: 'Contact', faq: 'FAQ', installation: 'Installation',
  privacy: 'Privacy', shipping: 'Shipping', support: 'Support', terms: 'Terms', warranty: 'Warranty', branches: 'Branches',
};

export function MobileContactCta() {
  const { contact } = useSiteContent();
  return (
    <div className="fixed inset-x-3 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex gap-2 sm:hidden">
      <a href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`} className="flex min-h-12 flex-1 items-center justify-center rounded-full bg-primary px-4 text-sm font-bold text-white shadow-lg">Call now</a>
      <a href="/contact" className="flex min-h-12 flex-1 items-center justify-center rounded-full border border-primary bg-background/95 px-4 text-sm font-bold text-primary shadow-lg backdrop-blur">Get a quote</a>
    </div>
  );
}

function Breadcrumbs() {
  const segment = window.location.pathname.replace(/^\//, '').replace(/\/$/, '');
  const label = BREADCRUMB_LABELS[segment];
  if (!label) return null;
  return (
    <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
      <a href="/" className="hover:text-foreground">Home</a><span aria-hidden="true">/</span><span aria-current="page" className="font-semibold text-foreground">{label}</span>
    </nav>
  );
}

/** Shared chrome for the six public marketing/legal pages. */
export function SiteShell({
  eyebrow, title, subtitle, children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <a href="/" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Back to shop
          </a>
          <div className="flex items-center gap-3">
            <a href="/contact" className="hidden min-h-11 items-center rounded-full bg-primary px-4 text-xs font-bold text-white sm:inline-flex">Get a quote</a>
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">Cofkans Electricals</span>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <Breadcrumbs />
        <motion.header initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary mb-3">{eyebrow}</p>}
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-3 text-base text-muted-foreground max-w-2xl">{subtitle}</p>}
        </motion.header>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          {children}
        </motion.div>
      </main>
      <footer className="border-t border-border mt-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 text-xs text-muted-foreground space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span>© {new Date().getFullYear()} Cofkans Electricals. All rights reserved.</span>
            <SocialLinks links={SOCIAL_LINKS} />
          </div>
          <nav className="flex flex-wrap gap-x-4 gap-y-2">
            <a href="/about" className="hover:text-foreground">About Cofkans</a>
            <a href="/faq" className="hover:text-foreground">FAQ</a>
            <a href="/shipping" className="hover:text-foreground">Delivery</a>
            <a href="/warranty" className="hover:text-foreground">Warranty</a>
            <a href="/installation" className="hover:text-foreground">Installation</a>
            <a href="/support" className="hover:text-foreground">Support</a>
            <a href="/terms" className="hover:text-foreground">Terms</a>
            <a href="/contact" className="hover:text-foreground">Contact</a>
          </nav>
        </div>
      </footer>
      <MobileContactCta />
    </div>
  );
}

/** Hook for any site page that needs the live editable content. */
export function useSiteContent(): SiteContent {
  const [content, setContent] = useState<SiteContent>(SITE_CONTENT_DEFAULTS);
  useEffect(() => subscribeSiteContent(setContent), []);
  return content;
}

/**
 * Tiny markdown renderer for the body copy: blank lines split paragraphs,
 * `## ` opens an h2, `**bold**` becomes <strong>. No HTML is interpolated.
 */
export function RichBody({ source }: { source: string }) {
  const blocks = source.split(/\n{2,}/).map(b => b.trim()).filter(Boolean);
  return (
    <div className="prose-cofkans space-y-5 text-[15px] leading-relaxed text-foreground/90">
      {blocks.map((block, i) => {
        if (block.startsWith('## ')) {
          return <h2 key={i} className="text-xl font-bold mt-8 mb-1 text-foreground">{block.slice(3)}</h2>;
        }
        return (
          <p key={i}>
            {renderInline(block)}
          </p>
        );
      })}
    </div>
  );
}

function renderInline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(<strong key={`b-${key++}`} className="font-bold text-foreground">{m[1]}</strong>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}
