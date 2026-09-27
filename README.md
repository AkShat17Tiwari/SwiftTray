# SwiftTray

SwiftTray is a campus food pre-ordering application built with Next.js, Convex, Better Auth, and Razorpay. Students can browse live menus, place server-priced orders, pay online, and track pickup status. Vendor and administrator screens use role-based access enforced in both the interface and Convex functions.

## Local setup

1. Install dependencies with `npm install`.
2. Create `.env.local` with your Convex and site URLs:

   ```bash
   NEXT_PUBLIC_CONVEX_URL=https://<your-deployment>.convex.cloud
   NEXT_PUBLIC_CONVEX_SITE_URL=https://<your-deployment>.convex.site
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```
3. Create the authentication settings in Convex:

   ```bash
   npx convex env set BETTER_AUTH_SECRET "$(openssl rand -base64 32)"
   npx convex env set SITE_URL http://localhost:3000
   ```

4. Configure the administrator email allowlist and vendor-code hashing:

   ```bash
   npx convex env set ADMIN_EMAILS admin@example.com
   openssl rand -hex 32 | npx convex env set PORTAL_CODE_PEPPER
   ```

5. Start Convex with `npx convex dev`, then start the web app with `npm run dev`.

New accounts have the student role and use `/sign-in/student`. A signed-in user can request vendor access from `/vendor/access`; an administrator must approve the outlet assignment. Approval generates a one-time six-digit vendor login code that is shown to the administrator for secure delivery. Vendors use `/sign-in/vendor` with email, password, and their issued code. Administrators use `/sign-in/admin` with an email in the `ADMIN_EMAILS` allowlist and their Better Auth password. Vendor portal codes are server-verified, expire after eight hours, and lock for 15 minutes after five incorrect attempts.

## Razorpay test setup

Create test-mode credentials in Razorpay, then keep all secrets on the Convex deployment:

```bash
npx convex env set RAZORPAY_KEY_ID rzp_test_xxx
npx convex env set RAZORPAY_KEY_SECRET your_test_secret
npx convex env set RAZORPAY_WEBHOOK_SECRET your_webhook_secret
```

Configure Razorpay to send webhooks to:

```text
https://<your-convex-deployment>.convex.site/razorpay/webhook
```

Payment amounts are calculated from database menu prices. The browser never supplies the charge amount. SwiftTray verifies the Razorpay signature and then fetches the payment server-side to check the order ID, amount, currency, and captured state before marking an order paid. Webhook event IDs are stored for idempotency.

## Checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Production

Set `SITE_URL` to the exact production origin, use a new `BETTER_AUTH_SECRET`, configure a strict `ADMIN_EMAILS` allowlist, use a unique `PORTAL_CODE_PEPPER`, switch to Razorpay live credentials, and deploy Convex before building the web application. Never expose vendor codes, peppers, `BETTER_AUTH_SECRET`, `RAZORPAY_KEY_SECRET`, or `RAZORPAY_WEBHOOK_SECRET` as `NEXT_PUBLIC_` variables.
