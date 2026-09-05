# Cofkans Customer Portal

Public storefront for `cofkans.com`.

This app owns product discovery, customer accounts, cart, checkout, orders,
wishlist, support, and public marketing pages. It shares Firebase with the
staff portal but does not expose staff routes.

For staging, leave `VITE_PUBLIC_SITE_URL` blank. The build then emits
`noindex, nofollow` robots directives and omits the sitemap because no real
canonical domain exists yet. Set it to the real HTTPS customer domain before
production deployment.

```bash
npm run dev:customer
npm run build:customer
```
