# Cofkans application split

The repository now contains two deployable web applications backed by the
same staging Firebase project:

| App | Production host | Local path | Responsibility |
| --- | --- | --- | --- |
| Customer | `cofkans.com` | `apps/customer` | Storefront, accounts, cart, checkout, orders, wishlist, support, public pages |
| Staff | `staff.cofkans.com` | `../COFKANS_Staff ` | The single canonical staff portal: branch operations, staff, developer, audit, and role workflows |

Both apps use the shared operational collections `products`, `orders`,
`inventory`, and `branches`. Customer-owned data uses `users`, `carts`,
`wishlists`, and `customerPreferences`. Staff-only data uses `staffAccounts`,
`employees`, `approvals`, `reports`, `spreadsheet`, and `auditLogs`.

`packages/core` is the shared-core boundary. Backend initialization, schemas,
validation, and service functions should be extracted there as they are
updated; new cross-app contracts should not be duplicated in either app.

## Commands

From the repository root:

```bash
npm run dev:customer
npm run build:customer
npm run dev:staff
npm run build:staff
```

Copy each app's `.env.example` to `.env.local`. Development currently points
to the existing staging Firebase project. Production environment values should
be configured separately at the hosting provider before deployment.
