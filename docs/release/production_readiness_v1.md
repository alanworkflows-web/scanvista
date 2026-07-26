# v1.0 Production Readiness Protocol

This document serves as the mandatory checklist for locking the `v1.0` architecture before commencing work on the Automation & Workflow Engine (PF-6).

All items must be signed off by the engineering team before the platform can be considered "Production Ready."

---

## 1. Architecture 🏛️
- [ ] **Module Boundaries**: Identity, Memory, Measurement, and Intelligence layers are strictly decoupled and communicate via defined interfaces (e.g., `InsightEngine` consuming `HealthEngine`).
- [ ] **Dependency Direction**: The UI strictly depends on the API/Engines; the Engines never depend on the UI.
- [ ] **Code Duplication**: Common utility functions and types have been extracted to `src/lib` or `src/types`.
- [ ] **Event Engine Audit**: Verify the `ActivityEvent` engine successfully captures all destructive or high-impact actions across the platform.

## 2. Security & Privacy 🔒
- [ ] **Authorization Coverage**: Every protected API route enforces middleware that validates Organization, Property, and Role hierarchy.
- [ ] **Tenant Isolation**: Cross-tenant data access tests (`test/isolation.test.ts`) pass with 100% reliability.
- [ ] **Input Validation**: All API endpoints use strict schema validation (e.g., Zod) before touching the database.
- [ ] **Secrets Management**: No hardcoded API keys or secrets exist in the codebase. All secrets are read from `process.env`.
- [ ] **Rate Limiting**: Critical endpoints (login, API key generation, event ingestion) are protected against brute-force attacks.

## 3. Performance ⚡
- [ ] **Query Optimization**: Slow queries (>100ms) have been identified using Prisma telemetry and optimized.
- [ ] **N+1 Queries**: Prisma `include` usage has been audited to prevent N+1 query proliferation on dashboard loads.
- [ ] **Indexes**: High-cardinality foreign keys (`organizationId`, `propertyId`) have explicit database indexes.
- [ ] **Caching**: The `InsightEngine` payload generation is appropriately cached to prevent database strain during morning spikes.

## 4. UI / UX 🎨
- [ ] **Decision Density**: Every widget in the Founder HQ supports a clear decision. Vanity metrics have been purged.
- [ ] **Consistency**: Manager OS and Founder HQ adhere strictly to their respective design systems and token palettes.
- [ ] **Accessibility**: All interactive elements support keyboard navigation and appropriate ARIA labels.
- [ ] **Loading & Error States**: Network latency (simulated at >1000ms) gracefully falls back to skeletons or loading indicators without layout shift.

## 5. Testing 🧪
- [ ] **Unit Tests**: Core engine logic (Health, Insights, Activity) has >80% coverage.
- [ ] **Integration Tests**: Database interactions are tested against a real, isolated PostgreSQL test container.
- [ ] **End-to-End Tests**: Critical user journeys (Manager Onboarding, Walk Mode completion, Founder Login) are automated.

## 6. Operations & Deployment 🚀
- [ ] **Documentation**: API, Architecture, and Runbooks are up to date in `docs/`.
- [ ] **Deployment**: CI/CD pipeline is fully automated. Commits to `main` deploy to staging.
- [ ] **Monitoring**: Uptime monitoring and application error tracking (e.g., Sentry) are configured.
- [ ] **Disaster Recovery**: A documented procedure exists for restoring the database from a backup.
- [ ] **Backup Verification**: Automated database backups are running, and a restoration test has been successfully performed.

---
*Document initialized upon completion of PF-5 Phase 3.*
