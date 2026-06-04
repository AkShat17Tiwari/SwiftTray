This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Live Demo

SwiftTray is deployed at [https://swifttray.vercel.app](https://swifttray.vercel.app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

SwiftTray now uses Convex for live outlet, menu, order, notification, and vendor/admin operations. Make sure `.env.local` includes `NEXT_PUBLIC_CONVEX_URL`, `CONVEX_DEPLOYMENT`, Clerk keys, `ADMIN_PORTAL_EMAIL`, `ADMIN_PORTAL_PASSWORD_SHA256`, and `PORTAL_COOKIE_SECRET` before using the full stack flows.

To seed a fresh Convex deployment with demo outlets and menus, open `/outlets` and click **Seed demo data** when the database is empty. The checkout flow writes real orders to Convex, and order status updates from the vendor board are reflected back into student order tracking.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.


