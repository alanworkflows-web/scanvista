# Network & Edge Security Review

**Date:** July 2026
**Scope:** Helmet Configuration, Rate Limiting, Perimeter Security

## 1. Rate Limiting (WP8)
Review of the `express-rate-limit` configuration in `server.ts`:
- **Auth Endpoint (`/auth/`)**: Strictly limited to `20 requests / 15 minutes` per IP. Highly effective against brute-force login attacks.
- **Manager API (`/api/manager`)**: Capped at `100 requests / 15 minutes` per IP. Prevents authenticated users from scraping or causing excessive DB load.
- **Public API (`/api/properties`)**: Relaxed to `1500 requests / 15 minutes` per IP. Supports heavy public traffic (e.g. guest scans) while still establishing an upper bound against volumetric DDoS.

**Result:** PASS

## 2. Security Headers (WP7)
Review of `helmet` configuration:
- Standard Helmet protections (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Strict-Transport-Security) are successfully applied via `app.use(helmet())`.
- **Content-Security-Policy (CSP):** `contentSecurityPolicy: false` is explicitly set.

**Finding (High):** Disabling CSP globally leaves the React frontend theoretically exposed to Cross-Site Scripting (XSS) if user input is ever rendered dangerously.

**Remediation:** For the Pilot Phase, we accept this risk to prioritize velocity, as React naturally escapes HTML output. However, a strict CSP must be implemented before Platform v1.1.

## Status
⚠️ **WARNING** (1 High finding accepted for Pilot)
