import React, { useEffect, useRef } from 'react';
import { useSiteContent } from '../pages/site/SiteShell';

// Named constants for any hardcoded copy/stats so they're easy to update later.
export const LEGACY_STATS_DEFAULT = {
  products: '5,000+',
  projects: '500+',
  clients: '1,000+',
};

export type EraImageMap = Record<
  string,
  { src?: string; alt?: string }
>;

export default function LegacyTimeline({
  images,
}: {
  images?: EraImageMap; // keyed by year e.g. { '1989': {src, alt}, '1995': {...} }
}) {
  const { about, landing } = useSiteContent();
  const foundedYear = about?.foundedYear ?? 1989;
  const yearsActive = new Date().getFullYear() - foundedYear;

  // Respect prefers-reduced-motion where the app already does.
  const reducedMotionRef = useRef(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      reducedMotionRef.current = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    }
  }, []);

  const copper = '#b87333';

  const eras = [
    { year: String(foundedYear), title: 'Founding & early days', key: String(foundedYear) },
    { year: '1995', title: 'Expansion & certifications', key: '1995' },
    { year: '2025', title: 'Modernisation & scale', key: '2025' },
  ];

  const stats = [
    { label: `${yearsActive}+ years`, value: `${yearsActive}+` },
    { label: 'Products', value: LEGACY_STATS_DEFAULT.products },
    { label: 'Projects', value: LEGACY_STATS_DEFAULT.projects },
    { label: 'Clients', value: LEGACY_STATS_DEFAULT.clients },
  ];

  return (
    <section aria-labelledby="legacy-heading" className="mt-12">
      <div className="relative overflow-hidden">
        {/* Ghost numeral behind the headline */}
        <div className="pointer-events-none absolute inset-0 flex items-start justify-center select-none">
          <span
            aria-hidden
            className="hidden md:block font-extrabold text-[220px] leading-none text-black/5 dark:text-white/4"
            style={{ fontFamily: "Fraunces, Playfair Display, serif" }}
          >
            {String(foundedYear)}
          </span>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-wider text-muted-foreground">{landing?.legacyBadge ?? 'Established'}</p>
            <h2 id="legacy-heading" className="mt-2 font-bold text-3xl md:text-4xl" style={{ fontFamily: 'Fraunces, Playfair Display, serif' }}>
              {landing?.legacyTitle ?? 'A Legacy of Excellence'}
            </h2>
            <p className="mt-4 text-muted-foreground">{landing?.legacySubtitle ?? ''}</p>
          </div>

          {/* Timeline */}
          <div className="relative mt-10 grid grid-cols-1 items-start gap-8 md:grid-cols-3">
            {/* Decorative trace sits behind the cards instead of consuming a grid column. */}
            <div className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-0.5 -translate-x-1/2 md:block" style={{ background: copper, opacity: 0.35 }} />
            {eras.map((era, idx) => (
              <article key={era.key} className="col-span-1">
                <div className="relative z-10 flex flex-col gap-4">
                  <div className="flex min-w-0 flex-col gap-4">
                    <div className="w-full">
                      <div
                        className="relative h-52 w-full overflow-hidden rounded-lg border border-border bg-gray-100"
                        style={{ boxShadow: '0 8px 20px rgba(0,0,0,0.06)' }}
                      >
                        {images?.[era.key]?.src ? (
                          <img
                            src={images[era.key]!.src}
                            alt={images[era.key]!.alt ?? `${era.year} image`}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full text-sm text-muted-foreground">
                            Photo placeholder
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">{era.year}</div>
                      <h3 className="mt-1 text-lg font-semibold">{era.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{
                        era.key === String(foundedYear)
                          ? `Cofkans began in ${foundedYear}, building a reputation for reliable products and careful installation.`
                          : era.key === '1995'
                          ? 'Growth phase: dealer partnerships, first accredited installers and first formal certifications.'
                          : 'Recent era: modern catalogue, showroom upgrades, and scaled distribution and services.'
                      }</p>

                      <div className="mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs" style={{ borderColor: copper }}>
                        <span className="text-[10px] font-medium text-[#5b3924]">Certified</span>
                        <span className="text-[10px] text-muted-foreground">ISO / Installer</span>
                      </div>
                    </div>
                  </div>

                  {/* small mobile connector */}
                  {idx < eras.length - 1 && (
                    <div className="md:hidden h-6 flex items-center">
                      <div className="w-full h-0.5" style={{ background: copper }} />
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>

          {/* Trusted Excellence stats band */}
          <div className="mt-10 bg-gradient-to-r from-white to-white/95 border border-border rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-2xl font-bold" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Closing pull-quote */}
          <blockquote className="mt-8 border-l-4 pl-4 border-border text-muted-foreground italic">
            “Honest pricing, real warranties, certified installation, and a phone that gets picked up.”
          </blockquote>
        </div>
      </div>
    </section>
  );
}
