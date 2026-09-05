import { useEffect } from 'react';
import { SEED_BRANCHES } from '@/lib/branches';
import { csvProducts } from '../data/csvProducts';

export const CUSTOMER_SITE_NAME = 'Cofkans Electricals';
export const CUSTOMER_SITE_URL = (import.meta.env.VITE_PUBLIC_SITE_URL || '').replace(/\/$/, '');
export const CUSTOMER_IS_PRODUCTION = Boolean(CUSTOMER_SITE_URL);

const MAIN_SHOWROOM = SEED_BRANCHES.find((branch) => branch.isMain) ?? SEED_BRANCHES[0];

const SOCIAL_LINKS = [
  'https://www.tiktok.com/@cofkans_electricals',
  'https://www.youtube.com/@CofkansElectrical',
  'https://www.instagram.com/cofkans_electricals_limited/',
  'https://www.facebook.com/profile.php?id=61553916757510',
];

const PAGE_META: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'Cofkans Electricals | Lighting and Electrical Products in Ghana',
    description: 'Shop lighting, switches, sockets, cables, solar products, and electrical supplies from Cofkans Electricals in Ghana.',
  },
  '/about': {
    title: 'About Cofkans Electricals',
    description: 'Learn about Cofkans Electricals and the electrical products and services available to customers in Ghana.',
  },
  '/branches': {
    title: 'Cofkans Electricals Showrooms and Branches',
    description: 'Find Cofkans Electricals showrooms and branches, including the main Asuoyeboa Showroom in Kumasi.',
  },
  '/contact': {
    title: 'Contact Cofkans Electricals',
    description: 'Contact Cofkans Electricals for product enquiries, delivery support, installation, and branch information.',
  },
  '/faq': {
    title: 'Frequently Asked Questions | Cofkans Electricals',
    description: 'Answers about Cofkans Electricals products, delivery, payment, installation, and customer support.',
  },
  '/installation': {
    title: 'Electrical Product Installation | Cofkans Electricals',
    description: 'Learn about installation support for selected lighting, solar, inverter, and smart electrical products.',
  },
  '/shipping': {
    title: 'Delivery Information | Cofkans Electricals',
    description: 'Review delivery and collection information for Cofkans Electricals orders in Ghana.',
  },
  '/support': {
    title: 'Customer Support | Cofkans Electricals',
    description: 'Get help with Cofkans Electricals products, orders, delivery, installation, and account questions.',
  },
  '/terms': {
    title: 'Terms and Conditions | Cofkans Electricals',
    description: 'Read the terms and conditions for using the Cofkans Electricals customer portal and ordering products.',
  },
  '/privacy': {
    title: 'Privacy Policy | Cofkans Electricals',
    description: 'Read how Cofkans Electricals handles customer account, order, and support information.',
  },
  '/warranty': {
    title: 'Warranty Information | Cofkans Electricals',
    description: 'Review warranty information for eligible Cofkans Electricals products and services.',
  },
  '/careers': {
    title: 'Careers | Cofkans Electricals',
    description: 'View career opportunities and recruitment information from Cofkans Electricals.',
  },
  '/thank-you': {
    title: 'Thank You | Cofkans Electricals',
    description: 'Thank you for contacting Cofkans Electricals. Review the next steps for your enquiry or service request.',
  },
  '/checkout/complete': {
    title: 'Order Confirmation | Cofkans Electricals',
    description: 'Check the status of your Cofkans Electricals order and review the next steps.',
  },
};

function upsertMeta(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

function upsertLink(rel: string, href: string) {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.rel = rel;
    document.head.appendChild(element);
  }
  element.href = href;
}

function setJsonLd(id: string, value: unknown) {
  let script = document.head.querySelector<HTMLScriptElement>(`script[data-seo-id="${id}"]`);
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset.seoId = id;
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(value);
}

function getPathMeta(pathname: string) {
  if (pathname.startsWith('/branches/')) {
    const slug = pathname.split('/')[2] || '';
    const branch = SEED_BRANCHES.find((item) => item.slug === slug);
    if (branch) {
      return {
        title: `${branch.name} | Cofkans Electricals`,
        description: `Visit ${branch.name} in ${branch.city}. See branch address, opening hours, and contact details from Cofkans Electricals.`,
      };
    }
  }
  if (pathname.startsWith('/product/')) {
    const productId = decodeURIComponent(pathname.slice('/product/'.length));
    const product = csvProducts.find((item) => item.id === productId || item.sku === productId);
    if (product) {
      return {
        title: `${product.name} | Cofkans Electricals`,
        description: product.description || `View ${product.name}, availability, delivery options, and support from Cofkans Electricals.`,
      };
    }
    return {
      title: 'Electrical Product Details | Cofkans Electricals',
      description: 'View product details, availability, delivery options, and support from Cofkans Electricals.',
    };
  }
  return PAGE_META[pathname] ?? {
    title: 'Page Not Found | Cofkans Electricals',
    description: 'The Cofkans Electricals page you requested could not be found.',
  };
}

export default function Seo() {
  useEffect(() => {
    const path = window.location.pathname.replace(/\/$/, '') || '/';
    const meta = getPathMeta(path);
    const canonical = CUSTOMER_SITE_URL ? `${CUSTOMER_SITE_URL}${path}` : '';
    const isKnownPage = Boolean(PAGE_META[path]) || path.startsWith('/branches/') || path.startsWith('/product/');

    document.title = meta.title;
    upsertMeta('name', 'description', meta.description);
    upsertMeta('name', 'robots', CUSTOMER_IS_PRODUCTION && isKnownPage ? 'index, follow' : 'noindex, nofollow');
    upsertMeta('property', 'og:type', path.startsWith('/product/') ? 'product' : 'website');
    upsertMeta('property', 'og:site_name', CUSTOMER_SITE_NAME);
    upsertMeta('property', 'og:title', meta.title);
    upsertMeta('property', 'og:description', meta.description);
    upsertMeta('property', 'og:image', `${window.location.origin}/images/about/cofkans3.png`);
    upsertMeta('name', 'twitter:card', 'summary');
    upsertMeta('name', 'twitter:title', meta.title);
    upsertMeta('name', 'twitter:description', meta.description);
    upsertMeta('name', 'twitter:image', `${window.location.origin}/images/about/cofkans3.png`);

    const canonicalLink = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) upsertLink('canonical', canonical);
    else canonicalLink?.remove();

    setJsonLd('organization', {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: CUSTOMER_SITE_NAME,
      url: CUSTOMER_SITE_URL || undefined,
      sameAs: SOCIAL_LINKS,
    });
    setJsonLd('website', {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: CUSTOMER_SITE_NAME,
      url: CUSTOMER_SITE_URL || undefined,
      potentialAction: CUSTOMER_SITE_URL ? {
        '@type': 'SearchAction',
        target: `${CUSTOMER_SITE_URL}/?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      } : undefined,
    });
    if (path === '/' || path === '/branches') {
      setJsonLd('main-showroom', {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: MAIN_SHOWROOM.name,
        address: {
          '@type': 'PostalAddress',
          addressLocality: MAIN_SHOWROOM.city,
          addressRegion: MAIN_SHOWROOM.region,
          streetAddress: MAIN_SHOWROOM.address,
          addressCountry: 'GH',
        },
        telephone: MAIN_SHOWROOM.phone,
        openingHoursSpecification: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          opens: '08:00',
          closes: '17:00',
        },
        ...(CUSTOMER_SITE_URL ? { url: `${CUSTOMER_SITE_URL}/branches/${MAIN_SHOWROOM.slug}` } : {}),
        sameAs: SOCIAL_LINKS,
      });
    }
    if (path === '/faq') {
      const faqItems = [
        ['Do you deliver across Ghana?', 'Yes. Delivery is available from the nearest branch, with timing depending on the destination.'],
        ['Are your products genuine and warranty-backed?', 'Products are supplied through the manufacturer or an authorised distributor and carry the applicable manufacturer warranty.'],
        ['Can I collect my order from a branch?', 'Yes. Customers can choose branch pickup during checkout where stock is available.'],
        ['Do you offer electrical installation services?', 'Yes. Cofkans offers installation support for lighting, solar, inverters, and industrial electrical systems.'],
        ['How can I get a price for an installation?', 'Contact Cofkans with the products and project details so the team can review the work and provide a quote.'],
      ];
      setJsonLd('faq', {
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: faqItems.map(([name, text]) => ({ '@type': 'Question', name, acceptedAnswer: { '@type': 'Answer', text } })),
      });
    }
  }, []);

  return null;
}
