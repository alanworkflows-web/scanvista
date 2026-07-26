# OWASP Top 10 Audit Report

**Date:** July 2026
**Scope:** ScanVista SaaS Platform (RC2.1)

## 1. Broken Access Control (A01:2021)
- **Status:** PASS
- **Evidence:** Route definitions in `server.ts` are gated by `requireAuth`, `requireOrgAccess`, and `requirePropertyAccess`.
- **Risk:** Low. The `x-organization-id` header is verified against the `OrganizationMembership` table to prevent cross-tenant access.
- **Verification:** Passed automated Tenant Isolation tests.

## 2. Cryptographic Failures (A02:2021)
- **Status:** PASS
- **Evidence:** Application enforces `secure: true` for cookies in production. Does not handle raw passwords (Google OAuth only).
- **Risk:** Low. 
- **Verification:** Confirmed express-session flags.

## 3. Injection (A03:2021)
- **Status:** PASS
- **Evidence:** Prisma ORM is used exclusively, preventing SQL injection by design. Command injection is impossible as no `child_process` modules execute arbitrary input.
- **Risk:** Low.

## 4. Insecure Design (A04:2021)
- **Status:** PASS
- **Evidence:** The application employs a secure-by-default permission model. The Founder HQ dashboard relies on append-only Activity Events rather than destructible direct DB modifications.
- **Risk:** Low. 

## 5. Security Misconfiguration (A05:2021)
- **Status:** WARNING
- **Evidence:** `Content-Security-Policy` is explicitly disabled in Helmet configuration. 
- **Risk:** Medium. If React fails to escape an XSS vector, the missing CSP would allow script execution.
- **Remediation:** Accept for pilot to preserve velocity (React mitigates XSS by default), but implement strict CSP before v1.1.

## 6. Vulnerable and Outdated Components (A06:2021)
- **Status:** PASS
- **Evidence:** `npm audit` returns 0 vulnerabilities.
- **Verification:** Documented in `dependency_security.md`.

## 7. Identification and Authentication Failures (A07:2021)
- **Status:** PASS
- **Evidence:** Identity is strictly delegated to Google OAuth (OIDC). Sessions are stored in the database, avoiding JWT invalidation issues.
- **Risk:** Low.

## 8. Software and Data Integrity Failures (A08:2021)
- **Status:** PASS
- **Evidence:** Webhooks from Paddle are verified using HMAC signatures (`paddle.webhooks.unmarshal`). CI pipeline gates deployments.
- **Risk:** Low.

## 9. Security Logging and Monitoring Failures (A09:2021)
- **Status:** PASS
- **Evidence:** Structured logging via `pino` with correlation IDs ensures every request is traceable.
- **Risk:** Low.

## 10. Server-Side Request Forgery (SSRF) (A10:2021)
- **Status:** PASS
- **Evidence:** No endpoints accept a user-provided URL and fetch it server-side.
- **Risk:** Low.

---
**Summary:** The application successfully defends against all major OWASP Top 10 vectors. The only accepted risk for the pilot phase is the relaxed Content-Security-Policy.
