# Beta Readiness Checklist

**Sprint Phase:** P1 (Pilot Readiness)  
**Target:** 3–5 Pilot Hotels

This checklist serves as the final "Go/No-Go" gate before onboarding our very first external pilot customers. 

## 1. Product (Core Workflows)
- [x] **Account Creation:** User can securely sign in with Google Auth and get a workspace provisioned.
- [x] **Onboarding:** User is guided through property creation and given a clear setup checklist.
- [x] **Property Management:** User can manage menus, categories, and dishes.
- [x] **Guest Journey:** User can view arriving guests, generate links, and track statuses.
- [x] **Digital Concierge (Guest App):** QR codes route correctly, menus render fast, UX is polished.
- [x] **Empty States:** "No data" screens actively guide users instead of dead-ending them.

## 2. Security (RC2.1 Confirmed)
- [x] Multi-tenant isolation verified (BOLA/IDOR protection active).
- [x] Zod schema validation applied to mutations.
- [x] Secure session cookies (`HttpOnly`, `SameSite=Lax`).
- [x] Rate Limiting applied on Edge and Express levels.
- [x] **Security Debt:** Content-Security-Policy (CSP) exception logged in Debt Register for v1.1.

## 3. Infrastructure
- [x] Database Indexes optimized for scale.
- [ ] Automated Database Backups configured and tested.
- [ ] Vercel Preview/Production pipelines passing seamlessly.
- [ ] Uptime monitoring (e.g., BetterStack / Pingdom) configured for `GET /api/me`.

## 4. Operations & Support
- [x] **Demo Environment Script** created to allow quick demo tenant provisioning.
- [x] **Founder Support Console** scaffolded to diagnose customer tenants.
- [x] **Help Documentation** created for Managers, Staff, and FAQs.
- [ ] Incident Response Plan drafted (Who gets paged if it breaks on a Saturday?).

## 5. Legal & Privacy
- [x] Privacy Policy published at `/privacy`.
- [x] Terms of Service published at `/terms`.
- [ ] GDPR/CCPA data deletion process documented internally.

## 6. Analytics
- [x] Event Engine (`ActivityEvent`) tracking critical business actions.
- [ ] Crash reporting (e.g., Sentry) active on frontend and backend.

---
**Status:** In Progress. We are steadily closing out P1 deliverables. Once all checkboxes are completed, we proceed to **LR1 — Launch Readiness Review**.
