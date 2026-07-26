# Stage 10 — Pilot Readiness

**Reviewer:** Antigravity AI  
**Date:** 2026-07-18  
**Status:** ⚠️ PENDING RESOLUTIONS

---

## The Core Question

> **Could we confidently hand this to five real hotels tomorrow?**

The answer is **"Almost."** 

The platform's architecture is sound. The UX is polished and fast. The data integrity layer is robust, and multi-tenant isolation is strictly enforced. The intelligence layer operates without hallucinations.

However, handing this to real hotels tomorrow carries some operational risk due to a few critical findings identified during the RC1 audit.

---

## Blocking Issues for Pilot Launch

These issues MUST be resolved before onboarding the first 5 pilot hotels:

1. **TEST_MODE Vulnerability (Security Review)**
   - The `TEST_MODE` bypass in `src/middleware/auth.ts` allows complete authentication bypass in production if the environment variable is misconfigured. This is an unacceptable security risk for real customer data.

2. **Missing Input Validation (API/Security Review)**
   - `PUT /api/manager/amenities/:id` and `PUT /api/manager/dishes/:id` lack Zod schema validation, allowing arbitrary payload injection into the database update commands.

3. **Missing Foreign Key Indexes (Database Review)**
   - The `Property.ownerId`, `Guest.propertyId`, and `ActivityEvent.organizationId` foreign keys lack database indexes. While fine in testing, this will cause severe database degradation as the 5 hotels generate thousands of guests and events.

---

## Non-Blocking Issues (Fast-Follows)

These should be addressed during or immediately after the pilot phase, but do not block initial onboarding:

1. **Monolithic API (Architecture Review)**
   - `server.ts` is 1,200+ lines. It works perfectly, but needs refactoring before the team scales.
2. **Lack of Pagination (API Review)**
   - Guest lists and event feeds fetch all records. This will only become a problem after a few months of data accumulation.
3. **No Global Error Boundary (UX Review)**
   - React exceptions cause a white screen rather than a branded fallback.
4. **No CDN / Image Optimization (Performance Review)**
   - Large image uploads will cost bandwidth, but are acceptable for a 5-hotel pilot.

---

## Verdict

ScanVista is **NOT YET** approved for pilot launch. 

The engineering team must resolve the 3 Blocking Issues identified above. Once those are fixed, the platform will be 100% ready for the first 5 hotels.
