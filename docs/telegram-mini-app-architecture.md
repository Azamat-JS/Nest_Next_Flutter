# Telegram Mini App — Architecture & Implementation Plan

Portal for **parents and students** opened inside Telegram via a per-tenant bot.
No commands, no extra menus — the bot only does two things:
1. Collect the user's phone number (contact-share button or manual typing).
2. Show a **"Open App"** mini-app button that launches the web portal, already
   personalized by phone number.

---

## 1. High-level picture

```
 Telegram user                    NestJS backend                        Next.js frontend
 ─────────────                    ──────────────                        ────────────────
 /start ──────────────────────▶  telegram webhook (per tenant bot)
 ◀── "share your phone" ────────  reply keyboard: request_contact
 shares contact / types phone ─▶  normalize → find Users by phone
                                  (role PARENT|STUDENT, same tenant)
                                  save TelegramLink
 ◀── "Open App" web_app button ─
 taps button ─────────────────────────────────────────────────────▶  /tg (mini app)
                                                                      reads initData
                                  POST /telegram/auth  ◀──────────────  sends initData
                                  validate HMAC w/ tenant botToken
                                  find TelegramLink → issue JWT ────▶  store token,
                                                                      bootstrap & redirect
                                                                      to group details
```

Multi-tenancy: **one bot per tenant** (already modeled — `Tenant.botToken`,
`Tenant.botUsername`, set through platform-admin). The webhook URL carries the
tenant id, so every incoming update is already tenant-scoped.

---

## 2. Data model changes (Prisma)

New table — do **not** put telegram fields on `Users`; a link is a separate
lifecycle (can be revoked/relinked, one telegram account per tenant):

```
model TelegramLink {
  id             String   @id @default(cuid())
  tenantId       String
  tenant         Tenant   @relation(...)
  userId         String            // -> Users (PARENT or STUDENT)
  user           Users    @relation(...)
  telegramUserId BigInt            // Telegram's numeric user id
  chatId         BigInt            // private chat id (== telegramUserId for DMs)
  phone          String            // phone as confirmed during linking (E.164)
  verified       Boolean  @default(false)  // true when linked via contact share
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@unique([tenantId, telegramUserId])
  @@index([userId])
  @@index([tenantId])
}
```

Add to `Tenant`:

```
webhookSecret  String?   // random secret used in X-Telegram-Bot-Api-Secret-Token
```

Notes:
- `Users.phone` is globally `@unique`, so a phone lookup returns at most one
  user; we must still assert `user.tenantId === bot.tenantId`.
- `verified` distinguishes contact-share (Telegram-attested) from manually
  typed phones — see §7 Security.

---

## 3. Backend — new `telegram` module

```
apps/backend/src/telegram/
├── telegram.module.ts
├── telegram-webhook.controller.ts   // @Public() POST /telegram/webhook/:tenantId
├── telegram-bot.service.ts          // thin Bot API client (sendMessage, keyboards)
├── telegram-link.service.ts         // phone normalize → user lookup → create link
├── telegram-auth.service.ts         // initData HMAC validation → JWT issuance
├── telegram-auth.controller.ts      // @Public() POST /telegram/auth
└── dto/
    └── telegram.dto.ts
```

### 3.1 Webhook controller
- Route: `POST /telegram/webhook/:tenantId`, marked `@Public()`.
- Validates `X-Telegram-Bot-Api-Secret-Token` against `tenant.webhookSecret`
  (reject otherwise — this is the only thing preventing forged updates).
- Handles exactly three update shapes, everything else is ignored:
  1. `message.text === '/start'` → send the phone-request message.
  2. `message.contact` → linking flow (verified path).
  3. `message.text` that parses as a phone number → linking flow (manual path).

### 3.2 Bot service
- No framework needed (Telegraf/grammY are overkill for 3 message types and
  complicate per-tenant token handling). Plain `fetch` against
  `https://api.telegram.org/bot<token>/<method>` with the tenant's token.
- Helpers: `sendPhoneRequest(chatId)` (reply keyboard with
  `request_contact: true` + hint "or type your number like +9989…"),
  `sendMiniAppButton(chatId, firstName)` (inline keyboard `web_app: { url }`,
  plus `remove_keyboard` for the contact keyboard),
  `sendNotFound(chatId)`.
- Mini app URL: `${FRONTEND_URL}/tg` — tenant is *not* needed in the URL;
  it is recovered from initData during auth (see 3.4).
- Webhook registration: extend the existing platform-admin "set botToken"
  flow to also generate `webhookSecret` and call `setWebhook` with
  `url = ${API_URL}/telegram/webhook/${tenantId}`, `secret_token`, and
  `allowed_updates: ["message"]`.

### 3.3 Link service
- `normalizePhone(input)` → E.164 (must match however `Users.phone` is stored;
  add a shared helper in `lib/shared/helper` and reuse it at user-creation time
  too so both sides agree).
- Contact path: require `contact.user_id === message.from.id` (rejects
  forwarding someone else's contact) → `verified = true`.
- Manual path: `verified = false` (see §7 for what that gates).
- Lookup: `Users.findUnique({ phone })`; accept only when found, tenant
  matches, and `role ∈ {PARENT, STUDENT}`. Upsert `TelegramLink` on
  `[tenantId, telegramUserId]` (re-linking with a new phone overwrites).
- Not found → polite "number not registered, contact your learning centre"
  message; optionally record into the existing `WaitingList` table.

### 3.4 Mini-app auth (`POST /telegram/auth`)
- Body: `{ initData: string }` — raw `window.Telegram.WebApp.initData`.
- Since the URL has no tenant hint, resolve tenant by validating the HMAC:
  parse `initData`, and check the hash against each candidate. Practical
  approach: keep an in-memory map `telegramUserId → candidate tenants` is
  overkill; instead simply iterate active tenants that have a `botToken` and
  test the HMAC (cheap — one HMAC-SHA256 per tenant; fine for the current
  tenant count). If tenant count grows, embed `tenantId` as a query param in
  the web_app URL and validate only that tenant's token.
- Checks: hash valid, `auth_date` fresh (≤ 5 min), `TelegramLink` exists for
  `[tenantId, telegramUserId]`.
- Issues the **same JWT shape as `users/login`** (`type: 'tenant'`, `userId`,
  `tenantId`, `role`, `mustChangePassword: false` — telegram users never see
  the password-change flow) so the existing `JwtAuthGuard`, tenant context and
  frontend `api.ts` interceptor work unchanged. Return access + refresh token
  (reuse the `Session` table like the normal login does).

### 3.5 New portal endpoints + authorization (the critical part)

Current controllers are ADMIN/TEACHER-oriented, and several read endpoints
have **no role guard at all** — e.g. `student-payment/student-payments/:studentId`
is callable by any authenticated user for any studentId. Once students/parents
get real tokens this becomes a data leak, so authorization must be fixed as
part of this work, not after.

Add a small **access-scope service** (single source of truth):

```
apps/backend/src/lib/guards/student-access.service.ts (or portal module)
  canViewStudent(requester, studentId): ADMIN/TEACHER → yes;
      STUDENT → studentId === requester.userId;
      PARENT  → ParentStudent has (parentId=requester, studentId)
  canViewGroup(requester, groupId): ADMIN/TEACHER → yes;
      STUDENT → member via StudentGroup;
      PARENT  → any child is a member
```

New thin **portal controller** (read-only, roles PARENT|STUDENT, reuses
existing services):

```
apps/backend/src/portal/
├── portal.module.ts
├── portal.controller.ts
└── portal.service.ts
```

Endpoints:
| Endpoint | Returns | Scope rule |
|---|---|---|
| `GET /portal/bootstrap` | STUDENT: profile + their groups. PARENT: children, each with their groups | own data only |
| `GET /portal/groups/:groupId` | group details + students + scores (reuse group/score services) | `canViewGroup` |
| `GET /portal/groups/:groupId/homework` | homework list | `canViewGroup` |
| `GET /portal/groups/:groupId/leaderboard` | group leaderboard | `canViewGroup` |
| `GET /portal/leaderboard` | global (tenant-wide) leaderboard | any tenant member |
| `GET /portal/payments` | STUDENT: own payments. PARENT: all children's payments (grouped by child) | own/children only |
| `GET /portal/students/:studentId/scores` | one student's score detail/chart | `canViewStudent` |

Keeping portal endpoints separate from the admin controllers (rather than
sprinkling role conditions into existing handlers) keeps the admin API
untouched and makes "what can a parent see" auditable in one file.
Additionally, put explicit `@Roles('ADMIN','TEACHER')` on the currently
unguarded admin reads (`group/all`, `users` list, payment/score reads) so a
portal token cannot wander into admin data.

---

## 4. Frontend — mini app as a route group in `apps/frontend`

Reuse the existing app (components, `api.ts`, query client, dark mode) rather
than a new workspace app. New route group with its own layout — no admin
sidebar, Telegram-native feel:

```
apps/frontend/src/app/(telegram)/tg/
├── layout.tsx                    // TelegramProvider (see below), bottom tab bar
├── page.tsx                      // entry: auth → bootstrap → redirect
├── groups/[groupId]/page.tsx     // group details: homework, scores, group leaderboard
├── payments/page.tsx             // own / children's payment history
└── leaderboard/page.tsx          // global leaderboard

apps/frontend/src/lib/telegram/
├── telegram-sdk.ts               // typed access to window.Telegram.WebApp
└── useTelegramAuth.ts            // initData → POST /telegram/auth → authStore
```

Behavior:
- **layout.tsx** loads the Telegram web-app script (`telegram-web-app.js`),
  calls `WebApp.ready()`/`expand()`, syncs `colorScheme` with the existing
  dark-mode setup, runs auth, and renders a 3-tab bottom nav:
  **Group · Payments · Leaderboard**.
- **Entry redirect** (`/tg`): after `GET /portal/bootstrap` —
  - student, 1 group → straight to `/tg/groups/[id]`;
  - student, N groups → tiny group picker;
  - parent, 1 child → that child's group page (child context in a store);
  - parent, N children → child picker, remembered for the session.
- Auth store: reuse `authStore`; the token lives in memory/session only
  (mini app reopens re-auth via initData, so persistence is unnecessary).
- Parent viewing state (selected child) → small zustand store or URL param.
- Guard: if opened outside Telegram (no initData) → friendly "open via the
  bot" screen.
- Extract shared pieces (leaderboard table, homework list, score chart) from
  the admin pages into `components/` where they aren't already reusable,
  instead of duplicating.

---

## 5. Visibility matrix (who sees what)

| Data | STUDENT | PARENT |
|---|---|---|
| Group details / members / homework | own groups (all students of the group visible) | children's groups (all students visible) |
| Group leaderboard | own groups | children's groups |
| Global leaderboard | all students in tenant | all students in tenant |
| Payments | **only own** | **only own children's** |
| Score detail / charts | own | children's |

---

## 6. Implementation phases

1. **Schema + linking** — Prisma migration (`TelegramLink`, `webhookSecret`),
   phone-normalization helper, telegram module (webhook, bot service, link
   service), webhook registration in platform-admin flow. *Testable in
   Telegram: /start → share phone → "Open App" button appears.*
2. **Auth + authorization** — `/telegram/auth` initData validation + JWT,
   access-scope service, portal controller, role-guard tightening on existing
   admin reads.
3. **Mini app UI** — `(telegram)/tg` route group: layout/auth/provider, entry
   redirect, group details, payments, global leaderboard.
4. **Hardening & polish** — rate-limit webhook + `/telegram/auth`, unlink/
   relink handling, WaitingList capture for unknown phones, i18n if needed,
   empty states.

Dev-environment note: Telegram requires **HTTPS** for both the webhook and the
`web_app` URL — use a tunnel (ngrok / cloudflared) for local dev, pointed at
the backend and the Next dev server.

---

## 7. Security decisions & open items

- **Manual phone entry is unverified.** Anyone can type someone else's number
  and, if it matches, gain access to that family's scores and payment history.
  Contact-share is safe (Telegram attests `contact.user_id === from.id`).
  Recommended: treat manual entry as **pending** (`verified=false`) and gate
  it with one cheap check before activating — best fit here is asking for the
  account **password** (users already have one, issued by the centre), or an
  admin approval list. Decision needed before Phase 1 ships to real users.
- **Webhook forgery** is prevented only by the `secret_token` check — it is
  mandatory, not optional.
- **initData freshness** (`auth_date` ≤ 5 min) prevents replay of captured
  initData strings.
- **Existing unguarded reads** (payments by studentId, leaderboards, group
  reads) must get guards in Phase 2 — today it doesn't leak only because all
  token holders are staff.
- Phone format audit: verify how existing `Users.phone` values are stored
  (with/without `+`, country code) before writing the normalizer.
