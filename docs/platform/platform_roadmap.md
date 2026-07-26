# Platform Roadmap

This document tracks the foundational engineering phases of ScanVista's platform architecture. These phases represent infrastructure milestones that enable product features, rather than the product features themselves.

---

## 🟢 PF-1: Identity & Multi-Tenancy (Completed)
**Objective**: Guarantee tenant isolation and support complex hospitality organizations.
**Scope**: 
- Transition from 1-to-1 User/Property to `OrganizationMembership` model.
- Strict layered Authorization Middleware (`requireAuth` -> `requireOrgAccess` -> `requirePropertyAccess`).
- Declarative permission bounds and cross-tenant isolation testing.

---

## 🟢 PF-2: Audit & Event Engine (Completed)
**Objective**: Create a robust "Business Memory" by recording the history of how the state came to be.
**Scope**: 
- Centralized Permissions Engine.
- `ActivityEvent` table for append-only Domain Events.
- Evolved `logEvent` engine with decoupled Store -> Publish architecture.
- Enums, Correlation IDs, and Event retention rules.

---

## 🟢 PF-3: Metrics & Analytics Engine (Completed)
**Objective**: Turn raw operational events into actionable business intelligence and standard KPIs.
**Scope**: 
- `MetricSnapshot` table to cache expensive aggregations.
- Standardized Time Buckets (Today, Yesterday, 7 Days, 30 Days, Year).
- Platform, Hospitality, Product, and AI metric streams.
- Formalized Event Subscribers (Analytics, Timeline, Notification).

---

## 🟡 PF-4: Intelligence Engine (In Progress)
**Objective**: Sit between raw metrics and visual dashboards to interpret data, calculate health, and generate founder briefs.
**Scope**: 
- `Health Engine` for Organization/Property scoring.
- `Insight Engine` for anomaly detection, trend comparison, and text-based brief generation.

---

## ⚪ PF-5: Founder HQ (Planned)
**Objective**: Centralized visual intelligence dashboard for hospitality group owners and investors, powered by PF-4.
**Scope**: 
- Morning Brief UI.
- Customer Health Ranking UI.
- Feature Adoption tracking UI.
- Real-time global metric visualizations.

---

## ⚪ PF-6: Automation & Workflow Engine (Planned)
**Objective**: Enable properties to automate routine hospitality operations.
**Scope**: 
- Silent Coordination and Operational Threads.
- Configurable rules (e.g., "If VIP Checks In -> Notify Kitchen -> Queue Welcome SMS").
- Advanced webhook integrations and real-time triggers.

---

## ⚪ PF-7: Continuous Improvement & AI (Planned)
**Objective**: Build proactive, context-aware operational guidance and continuous improvement loops.
**Scope**: 
- Integration with external LLMs and the internal Business Memory.
- Opportunity Pipeline and automated recommendations based on friction identification.
- Machine learning loop fed by Recommendation Lifecycle analytics.
