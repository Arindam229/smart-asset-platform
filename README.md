# AssetFlow — Smart Asset Management & Resource Allocation Platform

**[Live Deployment on Vercel](https://smart-asset-platform.vercel.app/)**

A production-grade, edge-ready platform for managing shared organizational
assets: inventory, booking requests, approval workflows, and utilization
analytics — with a fully animated, mobile-first UI.

## Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript, Tailwind CSS v4)
- **Database**: Neon Serverless Postgres via `@neondatabase/serverless` +
  Drizzle ORM (`neon-http` for queries, `neon-serverless` for transactional
  booking writes)
- **Auth**: Auth.js (NextAuth v5) — JWT sessions, Drizzle adapter, role-based
  middleware (`Admin` / `Consumer`)
- **UI**: shadcn/ui (base-nova / Base UI primitives), Aceternity-style
  components (grid background, spotlight, text-generate effect), Framer
  Motion animations
- **Hosting**: Vercel (Serverless Functions)

## Project Structure

```
app/
  page.tsx                     Landing page (sign in / sign up)
  dashboard/
    layout.tsx                 Responsive shell (sidebar + header)
    page.tsx                   Role-based redirect
    consumer/page.tsx          Asset explorer + booking history
    admin/inventory/page.tsx   Asset CRUD
    admin/approvals/page.tsx   Booking approval queue
    analytics/page.tsx         KPIs + utilization charts
  actions/                     Server actions (assets, bookings, approvals, analytics, auth)
  api/auth/[...nextauth]/      Auth.js route handlers
components/
  ui/                          shadcn/ui primitives
  landing/                     Aceternity-style landing components
  dashboard/                   Sidebar, header, nav
  admin/                       Inventory + approvals + analytics widgets
  shared/                      Status badges, booking dialog, asset card
lib/
  db/                          Drizzle schema, client, transaction helper
  auth.ts / auth.config.ts     Auth.js configuration
supabase/migrations/schema.sql Raw SQL migration + seed data
```

## Prerequisites

- Node.js 20+
- A [Neon](https://neon.tech) Postgres database
- A [Vercel](https://vercel.com) account (for deployment)

## 1. Install dependencies

```bash
npm install
```

## 2. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

| Variable          | Description                                                                 |
| ------------------ | ---------------------------------------------------------------------------- |
| `DATABASE_URL`     | Neon Postgres connection string (`...?sslmode=require`)                      |
| `AUTH_SECRET`      | Random 32-byte secret — generate with `openssl rand -base64 32`              |
| `AUTH_TRUST_HOST`  | Set to `true` (required for non-Vercel hosts)              |

## 3. Set up the database

Apply the schema (tables, enums, constraints, indexes) and seed data using
the raw SQL migration. The easiest way is via the Neon SQL editor or `psql`:

```bash
psql "$DATABASE_URL" -f supabase/migrations/schema.sql
```

Alternatively, push the Drizzle schema directly (equivalent tables, no seed
data):

```bash
npm run db:push
```

The seed data includes a **demo admin account**:

- Email: `admin@assetflow.io`
- Password: `admin12345`

New accounts created via the Sign Up form are always given the `Consumer`
role. To promote another user to `Admin`, run:

```sql
update users set role = 'Admin' where email = 'you@example.com';
```

## 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in with the demo
admin account to access Inventory, Approvals, and Analytics, or sign up for
a new Consumer account to browse assets and request bookings.

### Booking lifecycle

1. **Consumer** browses available assets (`/dashboard/consumer`) and submits
   a booking request. `requestBooking` runs inside an isolated transaction
   (`lib/db/transaction.ts`) that locks the asset row (`FOR UPDATE`),
   re-checks `quantity_available`, decrements stock, and inserts a `Pending`
   booking — preventing overbooking under concurrent requests.
2. **Admin** reviews the queue (`/dashboard/admin/approvals`):
   - **Approve** — booking moves to `Approved` (stock stays allocated).
   - **Reject** — booking moves to `Rejected` and the reserved stock is
     released back to `quantity_available`.
   - **Mark Returned** — booking moves to `Returned` and stock is restored.
3. Every state change writes an `audit_logs` entry and revalidates the
   consumer, inventory, and analytics pages.

## 5. Type-check & build

```bash
npx tsc --noEmit
npm run build
```

All routes declare `export const runtime = "edge"`, so a successful
`next build` confirms the entire app runs on Web-standard APIs only (no
Node-only built-ins outside of the edge-compatible polyfills already in use:
`bcryptjs` for hashing and `@neondatabase/serverless` for Postgres access).

## Deploying to Vercel

This project is optimized for deployment to Vercel. 
Simply push to your GitHub repository and link it to a new project in the Vercel Dashboard. Vercel will automatically detect Next.js and build it.

Ensure you set all the Environment Variables (`DATABASE_URL`, `AUTH_SECRET`, etc.) in the Vercel Dashboard.

Vercel Cron Jobs are automatically configured via the `vercel.json` file.

## Notes on edge runtime

Every layout, page, and route handler in `app/` exports
`export const runtime = "edge"`, and dashboard pages additionally export
`export const dynamic = "force-dynamic"` so data is always fetched fresh.
Server actions that need a real SQL transaction (booking creation, rejection,
and returns) use a dedicated `drizzle-orm/neon-serverless` `Pool` connection
(`lib/db/transaction.ts`) — the default `neon-http` driver used everywhere
else does not support `BEGIN`/`COMMIT`. Both drivers are compatible with standard Node.js serverless functions on Vercel.
