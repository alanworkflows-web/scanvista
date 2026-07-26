# OWASP API Security Audit

**Date:** July 2026
**Scope:** `server.ts`, `src/middleware/auth.ts`, REST API endpoints

## 1. API1:2023 - Broken Object Level Authorization (BOLA)
- **Architecture:** The platform heavily relies on `requireOrgAccess` and `requirePropertyAccess` middleware before invoking handlers.
- **Verification:** Handlers like `managerPut("/api/manager/dishes/:id")` fetch the target object and explicitly assert `if (!dish || dish.category.property.ownerId !== userId) return res.status(403)`.
- **Result:** **PASS**. Robust protection against IDOR (Insecure Direct Object Reference) is implemented.

## 2. API2:2023 - Broken Authentication
- **Architecture:** Authentication uses `@quixo3/prisma-session-store` wrapped by `express-session` with cryptographically secure defaults. Google OAuth 2.0 acts as the sole Identity Provider.
- **Verification:** `TEST_MODE` bypass has been explicitly removed and blocked via CI. Rate limiting effectively prevents credential stuffing.
- **Result:** **PASS**.

## 3. API3:2023 - Broken Object Property Level Authorization (Mass Assignment)
- **Architecture:** RC1.1 introduced strict `zod` schemas (`PropertySchema`, `DishSchema`, `AmenitySchema`, etc.) for every mutation endpoint (`managerPost`, `managerPut`).
- **Verification:** Using `.parse()` drops all unspecified fields from the incoming JSON payload. Unchecked property injection into Prisma models is impossible.
- **Result:** **PASS**.

## 4. API4:2023 - Unrestricted Resource Consumption
- **Architecture:** Rate limits restrict `/auth` to 20/15m and `/api/manager` to 100/15m.
- **Verification:** Payload limits are configured via `express.json({ limit: '2mb' })`.
- **Result:** **PASS**.

## 5. API5:2023 - Broken Function Level Authorization
- **Architecture:** Role-Based Access Control (RBAC) is enforced at the route definition level (e.g., `managerPut(..., "ADMIN", handler)`).
- **Verification:** The `requireOrgAccess` and `requirePropertyAccess` layers inject contextual roles, and the route dispatcher validates the user's role against the required route permission.
- **Result:** **PASS**.

## 6. API6:2023 - Unrestricted Access to Sensitive Business Flows
- **Architecture:** Event creation (Activity Events) is restricted to authenticated server-side handlers, never from client-side direct calls.
- **Result:** **PASS**.

## 7. API7:2023 - Server Side Request Forgery (SSRF)
- **Architecture:** The application does not fetch arbitrary URLs requested by the user. Webhooks strictly parse incoming data without fetching remote payloads.
- **Result:** **PASS**.

## 8. API8:2023 - Security Misconfiguration
- **Verification:** Addressed via the *Network & Edge Security Review*.
- **Result:** **WARNING** (Content-Security-Policy disabled).

## 9. API9:2023 - Improper Inventory Management
- **Architecture:** Single monolithic API surface located at `/api/manager`. No deprecated `v1` routes exist yet.
- **Result:** **PASS**.

## 10. API10:2023 - Unsafe Consumption of APIs
- **Verification:** The only external API consumed server-side is Paddle (Billing) and Google (OAuth). Paddle webhooks are protected by robust HMAC signature verification before parsing payload contents.
- **Result:** **PASS**.

---

## Status
✅ **PASS** (Strong API security fundamentals enforced by Zod and strict Middleware).
