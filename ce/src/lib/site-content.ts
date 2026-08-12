/**
 * Site-wide editable content for the public marketing/legal pages.
 *
 * All six footer pages (Privacy, Terms, About, Contact, Support, Careers) read
 * from a single Firestore doc `siteContent/main`. Anything missing falls back
 * to the seeded defaults below so the site is never blank, even before a
 * developer customises copy.
 */
import {
  doc, onSnapshot, setDoc, getDoc, serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';

export interface SiteContact {
  phone: string;
  whatsapp: string;
  email: string;
  supportEmail: string;
  careersEmail: string;
  address: string;
  hours: string;
  socials: { label: string; url: string }[];
}

export interface SitePage {
  title: string;
  subtitle?: string;
  body: string;
  updatedAt?: string;
}

export interface SiteCareers {
  intro: string;
  openings: { title: string; location: string; type: string; description: string }[];
  applyHowTo: string;
}

/**
 * Editable copy for the public landing page (hero text + section headers).
 * Hero slide images stay as bundled assets in App.tsx; this block covers the
 * text the page renders around them.
 */
export interface SiteLanding {
  heroDescription: string;
  heroPrimaryCta: string;
  collectionsEyebrow: string;
  collectionsTitle: string;
  collectionsSubtitle: string;
  legacyBadge: string;
  legacyTitle: string;
  legacySubtitle: string;
}

export interface SiteContent {
  contact: SiteContact;
  about: SitePage & { foundedYear: number; foundedDate: string };
  privacy: SitePage;
  terms: SitePage;
  support: SitePage;
  careers: SiteCareers;
  landing: SiteLanding;
}

export const SITE_CONTENT_DEFAULTS: SiteContent = {
  contact: {
    phone: '+233 24 738 1219',
    whatsapp: '+233 24 738 1219',
    email: 'company@cofkanselectricals.com',
    supportEmail: 'company@cofkanselectricals.com',
    careersEmail: 'company@cofkanselectricals.com',
    address: 'Asuoyeboa-IPT, Kumasi, Ashanti Region, Ghana',
    hours: 'Monday – Saturday · 8:00 am to 5:00 pm (Sunday closed)',
    socials: [
      { label: 'YouTube', url: 'https://www.youtube.com/@CofkansElectrical' },
      { label: 'TikTok', url: 'https://www.tiktok.com/@cofkans_electricals' },
    ],
  },
  about: {
    title: 'About Cofkans Electricals',
    subtitle: 'Powering Ghana since 1989',
    foundedYear: 1989,
    foundedDate: '23rd February 1989',
    body: [
      'Cofkans Electricals was founded on the 23rd of February, 1989, in Kumasi by a small team of electricians who believed the country deserved better than the choice between cheap-and-unsafe or expensive-and-imported. More than three decades on, that same belief still drives everything we do.',
      '## What we do',
      "We supply, install and service architectural lighting, industrial electrical solutions, inverters, switchgear and the everyday accessories that keep Ghanaian homes, sites and businesses powered. Our showroom in Asuoyeboa-IPT carries the full range; our branch network and rider fleet put quality stock within easy reach across the Ashanti region and beyond.",
      '## Why customers stay with us',
      "Engineers pick the products — not marketers. Every item on our shelves has been tested for the realities of Ghanaian power: heat, dust, surges, voltage swings. If we wouldn't fit it in our own homes, we don't sell it.",
      '## The promise',
      "Honest pricing, real warranties, certified installation, and a phone that gets picked up. That's it. That's the whole promise.",
    ].join('\n\n'),
  },
  privacy: {
    title: 'Privacy Policy',
    subtitle: 'How Cofkans Electricals collects, uses and protects your data',
    body: [
      'This Privacy Policy explains what personal information Cofkans Electricals ("we", "us") collects when you use our website, mobile experience and showroom services, why we collect it, and the choices you have. We comply with the Data Protection Act, 2012 (Act 843) of Ghana.',
      '## Information we collect',
      'We collect the information you give us directly — your name, phone number, email, delivery address and order history — when you create an account, place an order, request installation, or contact our team. We also collect basic device and usage data (browser, approximate location, pages viewed) to keep the service reliable and to improve it.',
      '## How we use it',
      "We use your information to fulfil orders and installations, to communicate with you about your purchases, to provide warranty and after-sales support, to detect fraud, and — only with your consent — to send promotional offers. We never sell your personal data to third parties.",
      '## Who we share it with',
      'Trusted service partners (payment processors, delivery riders, SMS/email providers, cloud backend providers) handle limited data on our behalf under written agreements. Law-enforcement requests are honoured only when legally compelled.',
      '## Your rights',
      'You can request a copy of your data, correct anything inaccurate, withdraw marketing consent, or close your account at any time. Email company@cofkanselectricals.com and we will respond within 30 days.',
      '## Cookies',
      'We use a small number of cookies to remember your cart, your branch, and your session. You can manage cookies from the banner at the bottom of the site.',
      '## Changes to this policy',
      "We update this policy from time to time. The 'Last updated' date below tells you when it was last changed.",
    ].join('\n\n'),
  },
  terms: {
    title: 'Terms of Service',
    subtitle: 'The rules of the road for using Cofkans Electricals',
    body: [
      'By using cofkanselectricals.com, our app or our showroom services, you agree to these Terms of Service. Please read them carefully — they cover ordering, payment, delivery, warranty, returns and acceptable use.',
      '## Orders & pricing',
      'All prices are quoted in Ghana Cedis (GH₵) and include VAT where applicable. We reserve the right to correct pricing errors and to limit quantities. An order is only confirmed once we have accepted it and received payment.',
      '## Payment',
      'We accept mobile money, bank cards and approved trade credit. Payments are processed by licensed third-party providers; we never store your full card details on our servers.',
      '## Delivery & pickup',
      'Delivery windows are our best estimate based on your branch and address; we will keep you updated by SMS. Pickup orders must be collected within 7 days of the "ready" notification, otherwise re-stocking may apply.',
      '## Warranty & returns',
      'All products carry their manufacturer warranty. Faulty or wrong items can be returned within 14 days of delivery in their original packaging. Installation services carry a 12-month workmanship guarantee.',
      '## Acceptable use',
      'You agree not to misuse the site — no scraping, no reselling without authorisation, no attempts to compromise security. Staff and developer portals are for authorised personnel only.',
      '## Liability',
      'To the fullest extent permitted by law, our liability for any claim arising from your use of our services is limited to the value of the relevant order.',
      '## Governing law',
      'These terms are governed by the laws of the Republic of Ghana. Disputes will be resolved in the courts of Kumasi.',
    ].join('\n\n'),
  },
  support: {
    title: 'Support',
    subtitle: 'Get help with an order, an installation or a product',
    body: [
      'Need a hand? Our support team is here Monday to Saturday, 8am to 5pm. Most questions are answered fastest on WhatsApp.',
      '## Common topics',
      "**Track your order** — sign in and visit *My Orders* for a live status. You'll also get an SMS at each stage.",
      "**Returns & warranty** — keep the original packaging and your receipt; bring the item to any branch within 14 days, or call us and we'll arrange collection.",
      "**Installation booking** — call or WhatsApp the team and we'll dispatch a certified technician.",
      "**Payment issues** — if a payment was debited but your order didn't confirm, message us the transaction ID and we'll resolve it the same day.",
      '## Reach us',
      'Use the **Call** or **WhatsApp** buttons on the Contact page, or email **company@cofkanselectricals.com**. Walk-ins are welcome at our Asuoyeboa-IPT showroom during business hours.',
    ].join('\n\n'),
  },
  careers: {
    intro: "We're always glad to hear from talented electricians, sales staff, riders and back-office professionals who share our standards. There are no formal openings right now, but strong CVs are kept on file and contacted as roles open up.",
    openings: [],
    applyHowTo: "Send your CV and a short note about the kind of role you're looking for to **company@cofkanselectricals.com** with the subject line *Career enquiry*. We acknowledge every application.",
  },
  landing: {
    heroDescription: 'Experience unparalleled luxury and innovation in every detail',
    heroPrimaryCta: 'Shop now',
    collectionsEyebrow: 'Featured',
    collectionsTitle: 'Our Collections',
    collectionsSubtitle: 'Discover our curated selection of luxury lighting and electrical solutions, meticulously crafted for discerning clients',
    legacyBadge: 'Since 1985',
    legacyTitle: 'A Legacy of Excellence',
    legacySubtitle: "Four decades of illuminating Ghana's most prestigious residences, hotels, and commercial spaces with uncompromising quality and craftsmanship",
  },
};

const DOC_PATH = 'siteContent';
const DOC_ID = 'main';

function merge(remote: Partial<SiteContent> | undefined): SiteContent {
  if (!remote) return SITE_CONTENT_DEFAULTS;
  return {
    contact: { ...SITE_CONTENT_DEFAULTS.contact, ...(remote.contact ?? {}) },
    about: { ...SITE_CONTENT_DEFAULTS.about, ...(remote.about ?? {}) },
    privacy: { ...SITE_CONTENT_DEFAULTS.privacy, ...(remote.privacy ?? {}) },
    terms: { ...SITE_CONTENT_DEFAULTS.terms, ...(remote.terms ?? {}) },
    support: { ...SITE_CONTENT_DEFAULTS.support, ...(remote.support ?? {}) },
    careers: { ...SITE_CONTENT_DEFAULTS.careers, ...(remote.careers ?? {}) },
    landing: { ...SITE_CONTENT_DEFAULTS.landing, ...(remote.landing ?? {}) },
  };
}

export async function fetchSiteContent(): Promise<SiteContent> {
  try {
    const snap = await getDoc(doc(db, DOC_PATH, DOC_ID));
    return merge(snap.exists() ? (snap.data() as Partial<SiteContent>) : undefined);
  } catch {
    return SITE_CONTENT_DEFAULTS;
  }
}

export function subscribeSiteContent(
  onChange: (content: SiteContent) => void,
): Unsubscribe {
  return onSnapshot(
    doc(db, DOC_PATH, DOC_ID),
    snap => onChange(merge(snap.exists() ? (snap.data() as Partial<SiteContent>) : undefined)),
    () => onChange(SITE_CONTENT_DEFAULTS),
  );
}

export async function saveSiteContent(patch: Partial<SiteContent>): Promise<void> {
  const stamped: Record<string, unknown> = { ...patch, _updatedAt: serverTimestamp() };
  for (const key of ['privacy', 'terms', 'about', 'support'] as const) {
    if ((patch as any)[key]) {
      stamped[key] = { ...(patch as any)[key], updatedAt: new Date().toISOString() };
    }
  }
  await setDoc(doc(db, DOC_PATH, DOC_ID), stamped, { merge: true });
}
