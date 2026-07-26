# Stage 1 — Architecture Review

**Reviewer:** Antigravity AI  
**Date:** 2026-07-18  
**Status:** ⚠️ PASS WITH NOTES

---

## Module Boundaries

| Module | Purpose | Files | Verdict |
|---|---|---|---|
| `src/components/` | Shared UI components (guest, menu, filters) | ~20 files | ✅ Clean |
| `src/pages/` | Manager-facing page components | ~15 files | ✅ Clean |
| `src/founder/` | Founder HQ design system + pages | ~10 files | ✅ Clean, fully isolated |
| `src/platform/` | Health, Insights, Metrics, Subscribers | ~8 files | ✅ Clean |
| `src/middleware/` | Auth middleware | 1 file | ✅ Clean |
| `src/lib/` | Shared utilities, events, permissions, routes | 13 files | ⚠️ See below |
| `src/hooks/` | React hooks | ~2 files | ✅ Clean |
| `src/design/` | Design tokens (Tailwind-based) | ~2 files | ✅ Clean |
| `src/types/` | Shared TypeScript types | ~2 files | ✅ Clean |
| `server.ts` | Express server + ALL API routes | 1 file, 1257 lines | ❌ See finding #1 |

---

## Finding #1 — server.ts is a Monolith (MEDIUM)

`server.ts` contains **all** API route handlers in a single 1,257-line file. This includes:

- OAuth authentication (lines 292–464)
- Property CRUD (lines 484–906)
- Guest management (lines 609–802)
- Billing/Paddle webhooks (lines 92–210)
- Menu/Dish/Category CRUD (lines 998–1226)
- Platform intelligence routes (lines 567–585)

**Risk:** As the platform grows, this becomes increasingly difficult to review, test, and maintain.

**Recommendation:** Extract route handlers into domain-specific modules:
```
src/routes/
  auth.routes.ts
  property.routes.ts
  guest.routes.ts
  billing.routes.ts
  menu.routes.ts
  platform.routes.ts
```

**Severity:** MEDIUM — Not blocking for RC1, but should be addressed before PF-6.

---

## Finding #2 — `src/lib/` contains mixed concerns (LOW)

The `lib/` directory contains both backend-only modules (`events.ts`, `permissions.ts`, `routes.ts`, `db.ts`) and frontend-only modules (`lazyWithPreload.ts`, `rhythmEngine.tsx`, `strategyEngine.tsx`). React components (`.tsx`) and server-only code (`.ts`) coexist in the same directory.

**Recommendation:** Split into `src/lib/server/` and `src/lib/client/` or use bundler-level separation.

**Severity:** LOW — Vite tree-shaking prevents server code from entering the client bundle, but it's confusing for developers.

---

## Finding #3 — Legacy `ownerId` on Property (LOW)

The `Property` model has both `ownerId` (direct User relation) and `orgId` (Organization relation). The codebase still uses `ownerId` extensively for authorization checks in `server.ts` (lines 555, 618, 673, 706, 737, 874, etc.).

**Risk:** Dual ownership creates confusion. The Organization → Membership → User hierarchy should be the single source of truth.

**Recommendation:** Deprecate `ownerId` checks in favor of `req.userContext.orgId` + role checks via the `can()` permission engine. This is a PF-6 migration candidate.

**Severity:** LOW — Currently consistent. But will become technical debt as multi-user organizations grow.

---

## Finding #4 — No Circular Dependencies Detected ✅

Grep analysis confirms no circular import chains across the codebase.

## Finding #5 — Naming Consistency ✅

- Components: PascalCase (e.g., `ExecutiveCard.tsx`, `FounderLayout.tsx`) ✅
- Utilities: camelCase (e.g., `lazyWithPreload.ts`, `permissions.ts`) ✅
- Enums: SCREAMING_SNAKE_CASE (e.g., `CHECKED_IN`, `GENERATED`) ✅

## Finding #6 — Dependency Direction ✅

- UI components import from `lib/` — never the reverse.
- `founder/` components import only from `founder/design-tokens.ts` — never from `pages/` or `components/`.
- `platform/` engines import from `lib/db` and Prisma — never from UI.

## Finding #7 — Dead Code (LOW)

- `src/lib/sync.ts` (188 bytes) — appears unused. Verify and remove.
- `jsonwebtoken` in `package.json` — imported but usage not found in source code. Sessions use `express-session`, not JWT.

---

## Summary

| Area | Verdict |
|---|---|
| Module Boundaries | ⚠️ server.ts needs splitting |
| Circular Dependencies | ✅ None |
| Naming Consistency | ✅ Clean |
| Dependency Direction | ✅ Correct |
| Dead Code | ⚠️ Minor (sync.ts, jsonwebtoken) |
| Folder Organization | ⚠️ lib/ mixes server/client |

**Overall:** Architecture is sound for RC1. The monolithic `server.ts` should be refactored before PF-6 but does not block the release.
