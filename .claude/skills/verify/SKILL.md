---
name: verify
description: Build, run, and drive this monorepo (NestJS backend + Next.js frontend) to verify changes end-to-end.
---

# Verifying changes in full-stack-turbo

## Backend (apps/backend, NestJS, port 3002)

- Run: `npm run start` (or `dev` for watch) from `apps/backend`. Ready when log says "server is running on port 3002".
- DB: local Postgres `nestflutter` (DATABASE_URL in `apps/backend/.env`). Migrations: `npx prisma migrate dev`; after schema changes also `npx prisma generate` (migrate does not always refresh the pnpm-hoisted client).
- Auth: `POST /users/login` with `{"phone":"+998XXXXXXXXX","password":"..."}` → `{accessToken}`. Phone is globally unique; tenant is derived from the user. Pass `Authorization: Bearer <token>`.
- Test identity: seed a throwaway tenant + ADMIN user directly via a script in `apps/backend/prisma/` (scripts must live there for module resolution; Prisma 7 needs `new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) })` + `import 'dotenv/config'` — copy the header from `prisma/backfill-tenant.ts`). Hash passwords with `bcrypt.hash(pw, 10)`, set `mustChangePassword: false`. Clean up the tenant's rows afterwards (children first: groups/sessions/users, then tenant).

## Frontend (apps/frontend, Next.js, port 4008)

- Run: `npm run dev` from `apps/frontend` (starts on **port 4008**, not 3000). Talks to backend via `NEXT_PUBLIC_API_URL=http://localhost:3002` in `.env.local`.
- Login page is `/`: a `+998`-prefixed 9-digit tel input + password. Fill only the 9 digits.
- Browser driving: no playwright in the repo; `npm install playwright-core` in the scratchpad and launch with the cached executable
  `~/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`.
- Toasts are sonner: assert on `[data-sonner-toast]` text.

## Gotchas

- `PUT /group/:id` (and similar update usecases) return stale data: the final `findOne` inside `$transaction` uses the outer client, so the response reflects pre-commit state. Verify writes with a follow-up GET, not the PUT response body.
- Check nothing is already on ports 3002/4008 before starting (`lsof -i :3002 -sTCP:LISTEN`).
