# Stage 2 — Security Review

**Reviewer:** Antigravity AI  
**Date:** 2026-07-18  
**Status:** ⚠️ PASS WITH NOTES

---

## Authentication

| Control | Implementation | Verdict |
|---|---|---|
| OAuth 2.0 (Google) | `google-auth-library` with PKCE-like state parameter | ✅ |
| Session Management | `express-session` + `PrismaSessionStore` | ✅ |
| Session Regeneration | `req.session.regenerate()` on login | ✅ |
| Session Cookie Flags | `httpOnly: true`, `sameSite: 'lax'`, `secure` in prod | ✅ |
| Logout | `req.session.destroy()` + `clearCookie('connect.sid')` | ✅ |
| OAuth State CSRF | SHA-256 hashed state stored in DB, 10-min TTL, atomic consume | ✅ Excellent |
| Dev Bypass | Auto-login as `demo@example.com` when `GOOGLE_CLIENT_ID` missing | ✅ Gated to non-prod |

---

## Finding #1 — TEST_MODE bypass in production auth middleware (HIGH)

`src/middleware/auth.ts` line 24:
```typescript
if (process.env.TEST_MODE === "true" && req.headers["x-test-user-id"]) {
```

This allows **any request** to impersonate any user by setting `x-test-user-id` header when `TEST_MODE=true`.

**Risk:** If `TEST_MODE` is accidentally set to `true` in production, the entire authentication layer is bypassed.

**Recommendation:** Remove `TEST_MODE` from production middleware entirely. Use a dedicated test helper that injects sessions directly in the test harness, not in the middleware chain.

**Severity:** HIGH — Must be resolved before RC1 ships.

---

## Authorization

| Control | Implementation | Verdict |
|---|---|---|
| Organization Access | `requireOrgAccess` middleware validates membership | ✅ |
| Property Access | `requirePropertyAccess` validates property belongs to org | ✅ |
| Cross-Tenant Isolation | `property.orgId !== req.userContext.orgId` check | ✅ |
| Role-Based Access | `requireRole()` middleware + `can()` permission engine | ✅ |
| Tenant Isolation Tests | `test/tenant-isolation.test.ts` | ✅ |
| Authorization Regression | `test/authorization-regression.test.ts` | ✅ |

## Finding #2 — Inconsistent authorization pattern (MEDIUM)

Some routes use the centralized `managerGet/Post` helpers (which register routes), while others use raw `app.patch()` (e.g., line 698 for guest PATCH). The raw routes don't get registered in `registeredRoutes[]`, breaking the authorization regression framework.

**Recommendation:** Migrate `app.patch("/api/manager/guests/:id", ...)` to use `managerPatch()` (currently missing — needs to be added to `routes.ts`).

---

## Finding #3 — Amenity update has no Zod validation (MEDIUM)

`PUT /api/manager/amenities/:id` (line 1035) passes `req.body` directly to Prisma:
```typescript
const updated = await prisma.amenity.update({ where: { id }, data: req.body });
```

All other mutation endpoints use Zod validation. This endpoint does not.

**Risk:** Unvalidated input could write unexpected fields to the database.

**Recommendation:** Add `AmenitySchema.partial().parse(req.body)` validation.

---

## Finding #4 — Dish update has no Zod validation (MEDIUM)

`PUT /api/manager/dishes/:id` (line 1123) has the same issue:
```typescript
const updated = await prisma.dish.update({ where: { id }, data: req.body });
```

**Recommendation:** Add `DishSchema.partial().parse(req.body)` validation.

---

## Transport & Headers

| Control | Implementation | Verdict |
|---|---|---|
| Helmet | `helmet()` with CSP disabled | ⚠️ CSP should be enabled |
| CORS | Not explicitly configured (default Express behavior) | ⚠️ See finding |
| Rate Limiting | 3 tiers: auth (20/15min), API (100/15min), public (1500/15min) | ✅ |
| Body Size Limit | `express.json({ limit: '2mb' })` | ✅ |
| trust proxy | `app.set("trust proxy", true)` | ✅ |

## Finding #5 — CSP is disabled (LOW)

```typescript
app.use(helmet({ contentSecurityPolicy: false }));
```

**Risk:** Without Content-Security-Policy, the app is more vulnerable to XSS attacks via injected scripts.

**Recommendation:** Enable a basic CSP that allows `'self'` and known CDN origins (Google Fonts, Dicebear avatars).

---

## Other Security Controls

| Control | Status |
|---|---|
| No `dangerouslySetInnerHTML` | ✅ None found in codebase |
| No raw SQL queries | ✅ Prisma ORM used exclusively |
| No hardcoded secrets in source | ✅ All secrets via `process.env` |
| Session secret enforcement | ✅ Throws in production if missing |
| OAuth redirect validation | ✅ Allowlist of prefixes checked |
| Webhook signature verification | ✅ Paddle SDK `unmarshal()` used |

---

## Summary

| Area | Verdict |
|---|---|
| Authentication | ✅ Solid |
| Authorization | ⚠️ TEST_MODE bypass must be removed |
| Input Validation | ⚠️ 2 endpoints missing Zod validation |
| Transport Security | ⚠️ CSP disabled |
| Session Management | ✅ Excellent |
| Secrets | ✅ Clean |
| SQL Injection | ✅ Not possible (Prisma) |
| XSS | ✅ No dangerouslySetInnerHTML |

**Critical Action Required:** Remove `TEST_MODE` bypass from `auth.ts` before RC1.
