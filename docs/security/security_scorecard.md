# ScanVista Security Scorecard

**Date:** July 2026
**Release Version:** RC2.1 (Pilot Readiness)

## Overall Score: 9.4 / 10

| Category | Score | Evidence / Notes |
| :--- | :---: | :--- |
| **Authentication** | 9.5/10 | Google OAuth enforces strict OIDC. Sessions are DB-backed via Prisma preventing tampering/leakage. Rate limits prevent brute forcing. |
| **Authorization** | 10/10 | RBAC enforced via route-level guards (`requireOrgAccess`, `requirePropertyAccess`). Context strictly derived from verified DB memberships. |
| **Tenant Isolation** | 10/10 | Penetration testing confirmed horizontal privilege escalation is blocked. Forged Organization headers are rejected. |
| **API Validation** | 10/10 | 100% of mutation endpoints protected by strict Zod schemas. Mass Assignment and type coercion vulnerabilities mitigated. |
| **Logging** | 9/10 | Structured JSON logging (`pino`) implemented globally. Unhandled exceptions are logged with stack traces and Correlation IDs, but hidden from users. |
| **Monitoring** | 9/10 | Centralized `/api/health/metrics` tracks latency and uptime. `pino-http` profiles individual request performance dynamically. |
| **Secrets** | 9/10 | No hardcoded secrets in repository. Strict separation between local `.env` and production Vercel credentials. |
| **Deployment** | 9/10 | CI pipeline (`.github/workflows/ci.yml`) enforces linting, tests, and a proactive `check-test-mode.cjs` security scan before builds can proceed. |
| **Network & Edge** | 8/10 | *Accepted Risk*: CSP disabled to support inline React scripts. Must resolve before Platform v1.1. Cookies securely flagged. |

---

## Action Items for Platform v1.1
1. Implement a strict Content-Security-Policy (CSP) that allows Vite/React while blocking arbitrary script execution.
2. Establish automated secret rotation schedules.
3. Migrate `pino` logs to a centralized aggregated observability platform (e.g., Datadog) if Vercel native logs prove insufficient for deep operational tracking.
