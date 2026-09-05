import type { AnchorHTMLAttributes, ReactNode } from 'react';

type Router = {
  push: (href: string) => void;
  replace: (href: string) => void;
  back: () => void;
};

export function useRouter(): Router {
  return {
    push: (href) => { window.location.href = href; },
    replace: (href) => { window.location.replace(href); },
    back: () => { window.history.back(); },
  };
}

export function useLocalSearchParams<T extends Record<string, string | string[] | undefined> = Record<string, string | string[] | undefined>>(): T {
  const params = new URLSearchParams(window.location.search);
  const values = Object.fromEntries(params.entries()) as Record<string, string>;
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  if (pathParts[0] === 'branches' && pathParts[1] && !values.slug) values.slug = pathParts[1];
  return values as T;
}

export function Link({ href, children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children?: ReactNode }) {
  return <a href={href} {...props}>{children}</a>;
}

export function Redirect({ href }: { href: string }) {
  window.location.replace(href);
  return null;
}
