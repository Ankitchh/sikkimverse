**Summary**

- **Repo:** sikkimverse — high-level checklist of missing/required items to get the app building and running without runtime errors.

**Missing / Generated Artifacts**

- **Prisma client generation:** Ensure `prisma generate` has been run so `src/generated/prisma/client.ts` and `src/generated/prisma/index.ts` are present. The project already contains generated artifacts, but a fresh environment must run generation. See [package.json](package.json).

**Required Environment Variables**

- **DATABASE_URL**: (required) Postgres connection string used by Prisma. Alternatively set **DIRECT_DATABASE_URL** if you need to pass the raw DB URL to the PrismaPg adapter.
- **NEXTAUTH_SECRET**: (required) signing secret used by NextAuth/jwt and middleware.
- **NEXTAUTH_URL**: (recommended) canonical site URL for NextAuth callbacks.
- **NEXT_PUBLIC_APP_URL**: (recommended) public URL used by `next.config.ts` and UI fallbacks.
- **NEXT_PUBLIC_SUPABASE_URL**: (required for uploads) public Supabase URL used by the server-side upload route.
- **SUPABASE_SERVICE_ROLE_KEY**: (required for uploads) service role key used by server upload API.
- **SUPABASE_STORAGE_BUCKET**: (optional) defaults to `sikkimverse-media` in code.
- **INTERNAL_API_KEY**: (recommended) used by internal server-to-server calls from upload plumbing.
- **RAZORPAY_KEY_ID** and **RAZORPAY_KEY_SECRET**: (required for payments) used by subscription creation and billing routes.
- **RAZORPAY_WEBHOOK_SECRET**: (required for webhook verification) used by webhook route.
- **NEXT_PUBLIC_RAZORPAY_KEY_ID**: (optional client-side public key used in billing UI)
- **RESEND_API_KEY**: (required to send emails when enabled) or otherwise email sending will be a no-op.
- **EMAIL_FROM**: (optional) sender default; fallback provided in code (`SIKKIMVERSE <noreply@sikkimverse.in>`).
- **GOOGLE_CLIENT_ID**, **GOOGLE_CLIENT_SECRET**: (optional but required to enable Google OAuth sign-in).
- **OPENAI_API_KEY**: (optional) enables AI tutor, embeddings, semantic search.
- **CLOUDFLARE_TURNSTILE_SECRET_KEY**: (optional) used by registration endpoint if Turnstile CAPTCHA is enabled.
- **VERCEL**: (optional) `VERCEL === '1'` branch used in upload route detection.

Notes: many API routes and the health check will report missing keys; review [src/app/api/health/route.ts](src/app/api/health/route.ts) to see which keys are required for your desired features.

**Build & Setup Steps (minimum to run locally)**

- Install dependencies: `npm install`
- Generate Prisma client: `npx prisma generate` (or `npm run postinstall`)
- Apply or create migrations: `npx prisma migrate dev` (or `migrate deploy` for production)
- Seed database (optional but recommended): `npm run seed`
- Start dev server: `npm run dev`

**Common Runtime Errors & How to Fix**

- Missing generated Prisma client: run `npx prisma generate` or `npm run postinstall`. The repository includes `postinstall` and `build` hooks to write `src/generated/prisma/index.ts`.
- `DATABASE_URL environment variable is not set`: set `DATABASE_URL` (or `DIRECT_DATABASE_URL`) in your `.env`.
- NextAuth errors / login failures: ensure `NEXTAUTH_SECRET` and provider secrets (e.g., Google) are configured.
- Upload route errors: ensure `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are present.
- Payments/billing errors: ensure `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET` are configured.
- Email sending failures: set `RESEND_API_KEY` or adapt `src/lib/email.ts` to your SMTP provider.

**Not-implemented / TODO-like notes found**

- UI-only placeholders (non-blocking): comments in
  - [src/app/practice/writing/page.tsx](src/app/practice/writing/page.tsx) — SVG stroke-order demo note
  - [src/app/learn/page.tsx](src/app/learn/page.tsx) — PATH_NODES are illustrative
- These are informational and not required to run the app; they are UX improvements.

**Suggested Improvements / Defensive Changes**

- Add a sample `.env.example` listing all required env variables with descriptions and safe defaults.
- Add a small startup script or README section that runs `prisma generate`, `prisma migrate`, and `npm run seed` in order.
- Add runtime guards for optional external services so missing API keys degrade gracefully (the code already checks some keys but add clearer health checks).

**Actionable checklist**

- **(High)** Create `.env.example` with the keys listed above.
- **(High)** Run `npm install` then `npm run postinstall` to ensure generated Prisma files exist.
- **(High)** Set `DATABASE_URL` and run `npx prisma migrate dev` followed by `npm run seed`.
- **(Medium)** Provide values for third-party keys you intend to use: `RESEND_API_KEY`, `OPENAI_API_KEY`, `RAZORPAY_*`, `SUPABASE_*`.
- **(Low)** Review UI TODOs and add any desired UX work.

If you want, I can:

- create a `.env.example` and add a small `README-SETUP.md` with the exact commands to provision a local dev environment;
- run `npm install` and `npx prisma generate` here to confirm generation (I will only run commands if you ask).
