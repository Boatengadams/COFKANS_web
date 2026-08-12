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
import { DEMO_MODE } from './demo-mode';

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
  body: string; // markdown-lite (paragraphs separated by blank lines, '## ' headings)
  updatedAt?: string;
}

export interface SiteCareers {
  intro: string;
  openings: { title: string; location: string; type: string; description: string }[];
  applyHowTo: string;
}

/**
 * Editable copy for the public landing page. Hero *slides* (image + title +
 * subtitle) live in their own `heroSlides` collection (see hero-slides.ts);
 * this block covers the surrounding text the page renders around them.
 */
export interface SiteLanding {
  heroEyebrow: string;
  heroDescription: string;
  heroPrimaryCta: string;
  heroSecondaryCta: string;
  /** Short labels shown under the hero CTAs (max 4 — icons are fixed by position). */
  trustSignals: string[];
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
  faq: SitePage;
  warranty: SitePage;
  shipping: SitePage;
  installation: SitePage;
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
    heroEyebrow: "Ghana's Premier Electrical Brand · Since February 1989",
    heroDescription: 'Premium lighting, solar & smart-home — genuine, warranty-backed, and expertly installed across Ghana.',
    heroPrimaryCta: 'Shop Now',
    heroSecondaryCta: 'Explore Collections',
    trustSignals: ['Genuine warranty', 'Certified installers', 'Nationwide delivery', '40+ years of trust'],
    collectionsEyebrow: 'Shop by Category',
    collectionsTitle: 'Premium Collections',
    collectionsSubtitle: 'Curated categories for every space',
    legacyBadge: 'Established February 1989',
    legacyTitle: 'A Legacy of Excellence',
    legacySubtitle: "Since February 1989, we have helped homes, hotels, and businesses across Ghana create safer, better-lit spaces with dependable products and careful workmanship",
  },
  faq: {
    title: 'Frequently Asked Questions',
    subtitle: 'Quick answers to what customers ask us most',
    body: [
      '## Do you ship nationwide?',
      "Yes. We deliver from your nearest branch to anywhere in Ghana. Delivery timing depends on your city — typically same-day within Kumasi and 1–3 working days elsewhere. See the **Delivery & shipping** page for zone details.",
      '## Are the products genuine and warranty-backed?',
      "Every product we sell is sourced through the manufacturer or the authorised distributor. Each item carries its full manufacturer warranty — see the **Warranty & Returns** page for the specifics.",
      '## Can I pay on delivery?',
      "For now, all online orders are prepaid via Paystack (cards, mobile money, bank transfer). Cash on delivery is not offered. Trade credit is available for approved wholesale accounts — see the Contact page.",
      '## Can I collect from a branch instead of getting it delivered?',
      "Yes. Choose **Pickup at branch** at checkout and pick from any of our 7 branches (Asuoyeboa Showroom, Adum, Pampaso, Abuakwa, Nkawie, Accra Opera Square, Obuasi). Orders are usually ready within 2 hours during business hours.",
      '## Do you offer installation?',
      "Yes — certified electricians for lighting, solar, inverters, and industrial control. Book an install from the **Installation** page or from your order confirmation.",
      '## What if I got the wrong product or a fault?',
      "Bring it back within 14 days with the original packaging and your receipt to any branch — we'll replace, repair, or refund. Details on the **Warranty & Returns** page.",
      '## Are prices in Cedis?',
      "All prices are in Ghana Cedis (GH₵) and include VAT where applicable.",
      '## How do I track my order?',
      "Sign in and open **My Orders** for a live status. You'll also receive an SMS at each stage — order confirmed, ready, out for delivery, delivered.",
    ].join('\n\n'),
  },
  warranty: {
    title: 'Warranty & Returns',
    subtitle: 'What you get, how it works, and how we make it right',
    body: [
      "Every product we sell is covered by its full manufacturer warranty. Our own workmanship on installation carries an additional 12-month guarantee. This page tells you exactly what that means for you.",
      '## The warranty at a glance',
      "**Lighting fittings** carry 1 to 5 years depending on the manufacturer. **LED bulbs** carry 12 months (24 months on Kans-branded LEDs). **Solar panels** are covered by the panel maker's performance warranty (typically 25 years). **Inverters and batteries** carry 12 to 24 months. **Switchgear, breakers and sockets** carry 12 months minimum. **Cabling and accessories** carry the manufacturer terms marked on the box.",
      "The exact terms for your item are on the box / spec sheet inside; keep them, along with your Cofkans receipt.",
      '## Returns — the simple version',
      "Bring the item and your receipt to **any** Cofkans branch within **14 days** of delivery or collection. Original packaging preferred but not required if we can confirm the product is unused.",
      "You can choose a **refund** in the original payment method (usually within 3 working days for card and mobile money), an **exchange** on the spot if we have stock, or **store credit** to use later.",
      '## Installation warranty',
      "Anything installed by a Cofkans-certified technician carries **12 months workmanship warranty**. If it stops working because of the way it was fitted, we come back and put it right at no cost.",
      "## What isn't covered",
      "Physical damage from dropping or water immersion (unless the product is IP-rated for it), power surges without a functioning stabiliser or surge protector, modification of the product, consumables beyond their rated hours or cycles, and cosmetic issues after installation.",
      '## How to start a claim',
      "Fastest is **WhatsApp** — send your order number and a short video of the issue and we'll usually reply within an hour during business hours. You can also walk into any branch or call the branch you bought from (see the Contact page). We aim to resolve every genuine claim within 5 working days.",
    ].join('\n\n'),
  },
  shipping: {
    title: 'Delivery & Shipping',
    subtitle: 'Zones, timing, fees, and the small print',
    body: [
      "We deliver from your nearest Cofkans branch. Fees and timing depend on your zone — the rates below are the current card. Bulky items (large lighting fixtures, solar arrays, industrial panels) may need custom pricing which we'll agree with you before dispatch.",
      '## Standard delivery rates',
      "**Within Kumasi metro** — GH₵ 30, same-day if ordered before 2pm. **Ashanti Region outside Kumasi** — GH₵ 50, next working day. **Greater Accra** — GH₵ 80, 1–2 working days from our Accra branch. **Other regions** — from GH₵ 100, 2–5 working days by courier. **Pickup at any branch is FREE.**",
      '## When we dispatch',
      "Orders placed and paid for **before 2pm** on a working day are typically dispatched the same day. Orders after 2pm, weekends and public holidays dispatch the next working day. We SMS you at each stage: confirmed → packed → out for delivery → delivered.",
      '## Bulky and industrial items',
      "Solar panel arrays, distribution boards, industrial control cabinets and large chandeliers usually need a dedicated vehicle. Our team will call you within 24 hours of your order with a firm delivery time and any special-handling fee. You can always cancel and take a full refund if the quote doesn't work.",
      "## What if I'm not home?",
      "Our rider calls you 15 minutes before arrival. If we can't reach you or the address is unreachable, we return the parcel to the branch and re-schedule the next working day at no extra charge for the first re-attempt.",
      '## Damaged or missing on arrival',
      "Please open and inspect at the door. If anything is damaged or missing, refuse the delivery or note it with the rider on the spot — we'll replace it at our cost. Damage reported more than 24 hours after delivery may be treated as a warranty case.",
      '## International shipping',
      "We don't currently ship outside Ghana. For projects in neighbouring West-African countries, contact our wholesale desk from the Contact page.",
    ].join('\n\n'),
  },
  installation: {
    title: 'Book an Installation',
    subtitle: 'Certified electricians. Real warranty on the work.',
    body: [
      "Every product we sell can be installed by a Cofkans-certified technician. Our team has 40 years of on-the-ground Ghana experience — real conditions, real power quality, real safety.",
      '## What we install',
      "**Lighting** — chandeliers, downlights, outdoor and garden fixtures, industrial high-bays. **Solar and inverters** — panel arrays, hybrid inverters, battery banks, changeover switches. **Electrical infrastructure** — distribution boards, sub-mains, industrial control panels, motor starters. **Smart home** — smart lighting, automation, network cabinets, CCTV.",
      '## How booking works',
      "Step 1 — Add your products to the cart or tell us what you have. Step 2 — WhatsApp or call us and describe the space (room count, ceiling type, existing wiring, single or three-phase supply). Photos help enormously. Step 3 — We quote a fixed installation price and a scheduled date. Nothing is due until we've agreed both. Step 4 — Our technician arrives with the parts, installs, tests, and hands over. You sign a completion certificate.",
      '## Guarantee on our work',
      "**12 months workmanship warranty** on everything we install. If it fails because of the way it was fitted, we return and fix it — parts included where the failure is on us.",
      '## Typical rates',
      "Chandeliers and large fixtures from **GH₵ 150** per unit. Down-lights and panel lights from **GH₵ 40** per fitting (minimum 5). Residential solar systems are quoted per system, typically **GH₵ 1,500 – GH₵ 6,000**. Distribution board and re-wiring work is quoted after a site visit. Site visits within Kumasi metro are **free**; a small travel fee applies elsewhere.",
      "The exact price depends on complexity, height, and access. We never charge extra on the day.",
      '## Book now',
      "The fastest route is **WhatsApp** — send a picture of the space and the products you'd like fitted. See the **Contact** page for numbers.",
    ].join('\n\n'),
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
    faq: { ...SITE_CONTENT_DEFAULTS.faq, ...(remote.faq ?? {}) },
    warranty: { ...SITE_CONTENT_DEFAULTS.warranty, ...(remote.warranty ?? {}) },
    shipping: { ...SITE_CONTENT_DEFAULTS.shipping, ...(remote.shipping ?? {}) },
    installation: { ...SITE_CONTENT_DEFAULTS.installation, ...(remote.installation ?? {}) },
  };
}

/** One-shot fetch (falls back to defaults on any failure). */
export async function fetchSiteContent(): Promise<SiteContent> {
  try {
    const snap = await getDoc(doc(db, DOC_PATH, DOC_ID));
    return merge(snap.exists() ? (snap.data() as Partial<SiteContent>) : undefined);
  } catch {
    return SITE_CONTENT_DEFAULTS;
  }
}

/** Live subscription used by the public pages. */
export function subscribeSiteContent(
  onChange: (content: SiteContent) => void,
): Unsubscribe {
  if (DEMO_MODE) {
    onChange(SITE_CONTENT_DEFAULTS);
    return () => {};
  }
  return onSnapshot(
    doc(db, DOC_PATH, DOC_ID),
    snap => onChange(merge(snap.exists() ? (snap.data() as Partial<SiteContent>) : undefined)),
    () => onChange(SITE_CONTENT_DEFAULTS),
  );
}

/** Save (developer-portal editor). Stamps `updatedAt` on each section. */
export async function saveSiteContent(patch: Partial<SiteContent>): Promise<void> {
  const stamped: Record<string, unknown> = { ...patch, _updatedAt: serverTimestamp() };
  for (const key of ['privacy', 'terms', 'about', 'support', 'faq', 'warranty', 'shipping', 'installation'] as const) {
    if ((patch as any)[key]) {
      stamped[key] = { ...(patch as any)[key], updatedAt: new Date().toISOString() };
    }
  }
  await setDoc(doc(db, DOC_PATH, DOC_ID), stamped, { merge: true });
}
