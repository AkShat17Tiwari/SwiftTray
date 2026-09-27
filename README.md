<div align="center">

# 🍱 SwiftTray

**A Modern, Real-Time Campus Food Pre-Ordering & Management Platform**

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Convex](https://img.shields.io/badge/Convex-1.44-FF4B4B?style=for-the-badge&logo=convex&logoColor=white)](https://convex.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Integrated-0C2340?style=for-the-badge&logo=razorpay&logoColor=3395FF)](https://razorpay.com/)
[![Tests](https://img.shields.io/badge/Tests-Vitest_Passing-22c55e?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)

<p align="center">
  Skip the lines. SwiftTray bridges students, campus food outlets, and university administrators through live menus, zero-trust server-priced checkout, instant Razorpay payments, and real-time reactive order tracking.
</p>

</div>

---

## ⚡ Overview

Campus dining during peak hours is notoriously chaotic—long queues, delayed orders, and manual cash handling. **SwiftTray** re-engineers the campus dining experience into an integrated, real-time ecosystem:

- **Students** browse live menus, apply coupons, pay securely via Razorpay, and track their meal's preparation in real time.
- **Vendors** receive orders instantly on a live reactive kitchen dashboard, manage inventory and stock levels on the fly, and view sales performance.
- **Administrators** control the platform via role-based access, onboard new outlets, broadcast announcements, oversee system audit logs, and approve vendor keys.

---

## 🎯 Key Features

### 🎓 Student Experience
- **Live Campus Menus**: Real-time outlet catalog with dietary filters (Veg / Non-Veg), search, and meal categories.
- **Interactive Cart & Fly-to-Cart Animations**: Intuitive tray drawer with smooth micro-interactions powered by Framer Motion.
- **Zero-Trust Pricing**: Cart amounts are calculated strictly server-side from database prices to eliminate client-side price tampering.
- **Secure Online Payments**: Integrated Razorpay checkout with webhook verification and automatic refund handling.
- **Real-Time Order Tracking**: Dynamic status updates (`Placed` ➔ `Preparing` ➔ `Ready for Pickup` ➔ `Completed`) powered by Convex live reactive subscriptions.
- **Order History & Receipts**: Itemized breakdowns of past orders with timestamps and payment identifiers.
- **Campus Support Tickets**: Built-in ticketing system for order queries and resolution.

### 👨‍🍳 Vendor Portal
- **Live Kitchen Kanban**: Instant WebSocket-driven incoming orders with sound alerts and one-click status transitions.
- **Menu & Inventory Control**: Toggle dish availability, update item prices, and adjust daily stock levels in real time.
- **Performance Analytics**: Visual charts showing daily gross revenue, order volume trends, and peak dining hours via Recharts.
- **Secure Dual-Factor Portal Access**: Vendors authenticate using credentials plus an admin-issued 6-digit peppered verification code with rate limiting (locks after 5 failed attempts).

### 🛡️ Administrator Suite
- **Granular Role-Based Access Control**: Strict email allowlist (`ADMIN_EMAILS`) coupled with server-side session checks.
- **Vendor Onboarding & Outlet Assignment**: Approve pending vendor requests and generate single-use, time-expiring (8-hour) portal keys.
- **Campus Analytics Dashboard**: High-level telemetry on total campus volume, platform revenue, and popular outlets.
- **Coupons & Promotions Engine**: Create percentage or fixed-amount discounts with usage quotas and minimum order rules.
- **Campus Announcements**: Broadcast emergency notices or campus alerts displayed prominently across student views.
- **Audit & Security Logging**: Full audit trail of role transitions, access grants, and administrative operations.

---

## 🔒 Security & Architecture Highlights

| Layer | Implementation Details |
|---|---|
| **Server-Priced Checkout** | Client never transmits charge amounts. The server reconstructs items from database pricing and active coupon limits. |
| **Payment Verification** | Multi-tier validation: Razorpay cryptographic HMAC-SHA256 signature verification + server-to-server payment state fetch. |
| **Idempotent Webhooks** | Unique payment event tracking prevents double-fulfillment or replay attacks. |
| **Brute-Force Guard** | Vendor access codes are hashed using SHA-256 with a unique server pepper. 5 incorrect attempts trigger a 15-minute lockout. |
| **Real-Time Reactivity** | Zero polling overhead. Convex's reactive sync layer updates orders and inventory across all connected clients via WebSockets. |

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack, React Server Components)
- **UI Library**: [React 19](https://react.dev/)
- **Backend & Database**: [Convex](https://convex.dev/) (Reactive ACID Database & Serverless Functions)
- **Authentication**: [Better Auth](https://better-auth.com/) + Custom RBAC (Student / Vendor / Admin)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + CSS Variables
- **Components**: [shadcn/ui](https://ui.shadcn.com/) primitives + [Lucide Icons](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/) & Canvas Confetti
- **Charts**: [Recharts](https://recharts.org/)
- **Payments**: [Razorpay API](https://razorpay.com/docs/) & Webhooks
- **Test Suite**: [Vitest](https://vitest.dev/)

---

## 📁 Project Structure

```text
SwiftTray/
├── convex/                   # Convex backend functions & database schema
│   ├── auth.ts               # Better Auth integration & credentials handling
│   ├── schema.ts             # Strongly typed database tables & indexes
│   ├── orders.ts             # Order state machine & placement mutations
│   ├── payments.ts           # Razorpay order generation & verification
│   ├── portalAccess.ts       # Vendor portal keys & brute-force security
│   ├── dashboards.ts         # Vendor & Admin statistical queries
│   ├── http.ts               # HTTP actions & webhook endpoints
│   └── lib/                  # Shared backend utilities (money, state, auth)
├── src/
│   ├── app/                  # Next.js App Router pages & route handlers
│   │   ├── admin/            # Administrator dashboard & management views
│   │   ├── vendor/           # Vendor kitchen dashboard & inventory views
│   │   ├── student/          # Student dashboard & order tracking
│   │   ├── outlets/          # Campus outlet browsing & dish catalogs
│   │   ├── checkout/         # Server-verified order checkout
│   │   └── payment/          # Razorpay payment callbacks & verification
│   ├── components/           # Modular UI components (shadcn, layout, cards)
│   ├── hooks/                # React hooks (cart state, auth role guards)
│   ├── lib/                  # Client utilities (formatting, animations, api)
│   └── types/                # TypeScript type definitions
└── tests/                    # Vitest unit & integration test suites
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20.x or v22.x+ recommended)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
- A free [Convex](https://convex.dev/) account
- A [Razorpay](https://razorpay.com/) account (Test mode)

### 1. Clone & Install

```bash
git clone https://github.com/AkShat17Tiwari/SwiftTray.git
cd SwiftTray
npm install
```

### 2. Configure Environment

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_CONVEX_URL=https://<your-deployment>.convex.cloud
NEXT_PUBLIC_CONVEX_SITE_URL=https://<your-deployment>.convex.site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Initialize Convex Backend & Secrets

In a separate terminal, start the Convex development environment:

```bash
npx convex dev
```

Configure your server environment variables on your Convex deployment:

```bash
# Authentication & Site
npx convex env set BETTER_AUTH_SECRET "$(openssl rand -base64 32)"
npx convex env set SITE_URL http://localhost:3000

# Administrator allowlist (comma-separated emails)
npx convex env set ADMIN_EMAILS admin@example.com

# Vendor portal security pepper
openssl rand -hex 32 | npx convex env set PORTAL_CODE_PEPPER

# Razorpay credentials (keep in Convex, never expose to browser)
npx convex env set RAZORPAY_KEY_ID rzp_test_yourKeyId
npx convex env set RAZORPAY_KEY_SECRET yourKeySecret
npx convex env set RAZORPAY_WEBHOOK_SECRET yourWebhookSecret
```

### 4. Start the Application

```bash
npm run dev
```

Visit **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 💳 Razorpay Webhook Configuration

For automated payment reconciliation and refund handling:

1. Navigate to **Razorpay Dashboard ➔ Settings ➔ Webhooks**.
2. Add a new webhook endpoint with your Convex site URL:
   ```text
   https://<your-convex-deployment>.convex.site/razorpay/webhook
   ```
3. Subscribe to the following events:
   - `payment.authorized`
   - `payment.captured`
   - `payment.failed`
   - `refund.processed`
4. Set the webhook secret to match your `RAZORPAY_WEBHOOK_SECRET`.

---

## 🧪 Testing & Code Quality

SwiftTray includes a comprehensive suite of unit tests validating money calculations, Razorpay signatures, state transitions, and security logic:

```bash
# Run unit & integration tests
npm test

# Run TypeScript typecheck
npm run typecheck

# Run ESLint
npm run lint

# Build for production
npm run build
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
