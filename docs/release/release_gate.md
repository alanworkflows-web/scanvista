# ScanVista Release Gate — v1.0

Every release must satisfy the criteria below. No release ships unless every gate passes.

| #  | Area           | Status | Reviewer | Date       | Notes |
|----|----------------|--------|----------|------------|-------|
| 1  | Architecture   | ⚠️      | Antigravity | 2026-07-18 | Monolithic server.ts |
| 2  | Security       | ❌      | Antigravity | 2026-07-18 | TEST_MODE bypass in prod |
| 3  | Data Integrity | ❌      | Antigravity | 2026-07-18 | Missing FK indexes |
| 4  | API            | ❌      | Antigravity | 2026-07-18 | Missing PUT validation |
| 5  | UX             | ✅      | Antigravity | 2026-07-18 | Solid |
| 6  | Performance    | ✅      | Antigravity | 2026-07-18 | Fast |
| 7  | AI             | ✅      | Antigravity | 2026-07-18 | No hallucinations |
| 8  | Founder HQ     | ✅      | Antigravity | 2026-07-18 | High decision density |
| 9  | Hospitality    | ✅      | Antigravity | 2026-07-18 | Authentic |
| 10 | Pilot Ready    | ❌      | Antigravity | 2026-07-18 | Pending 3 blockers |

## Gate Rules

1. **Every gate must pass before the release is approved.**
2. A gate passes when its review document exists in `docs/release/` and all critical findings have been resolved or formally accepted as known limitations.
3. Known limitations must be documented in `docs/release/known_limitations.md`.
4. The Release Gate is reviewed by the engineering lead before any pilot deployment.

## Gate Status Legend

| Symbol | Meaning       |
|--------|---------------|
| ⬜      | Not started   |
| 🟡     | In review     |
| ✅      | Passed        |
| ❌      | Failed        |
| ⚠️     | Passed w/note |

## Review Documents

Each gate corresponds to a deliverable document:

| Gate           | Document                         |
|----------------|----------------------------------|
| Architecture   | `architecture_review.md`         |
| Security       | `security_review.md`             |
| Data Integrity | `database_review.md`             |
| API            | `api_review.md`                  |
| UX             | `ux_review.md`                   |
| Performance    | `performance_review.md`          |
| AI             | `ai_review.md`                   |
| Founder HQ     | `founder_hq_review.md`          |
| Hospitality    | `hospitality_review.md`          |
| Pilot Ready    | `pilot_readiness.md`             |

---

*This gate was established upon declaring ScanVista Release Candidate 1 (RC1).*
