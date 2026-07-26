# ScanVista v1.0 — Known Limitations

This document deliberately catalogs the limitations of the v1.0 release. These are not bugs — they are conscious scope decisions. Each limitation has a recommended resolution timeline.

---

## Language & Localization

| Limitation | Impact | Resolution Timeline |
|---|---|---|
| English only | Limits adoption in non-English markets | v2.0 |
| No RTL layout support | Excludes Arabic/Hebrew markets | v2.0 |
| Currency displayed in USD only | Confuses international properties | v1.1 |

---

## Connectivity & Offline

| Limitation | Impact | Resolution Timeline |
|---|---|---|
| No offline mode | Walk Mode unusable without connectivity | v1.2 |
| No progressive web app (PWA) | Cannot install on mobile home screen | v1.1 |
| No push notifications | Staff miss time-sensitive alerts | v1.2 |

---

## Integrations

| Limitation | Impact | Resolution Timeline |
|---|---|---|
| No POS integration | Kitchen/restaurant data is manual entry | v2.0 |
| No PMS integration | Property management data not synced | v2.0 |
| No channel manager integration | Booking data unavailable | v2.0 |
| No accounting integration | Financial reports are manual | v2.0 |

---

## Mobile & Native

| Limitation | Impact | Resolution Timeline |
|---|---|---|
| No native iOS app | Reduced mobile experience | v1.2 |
| No native Android app | Reduced mobile experience | v1.2 |
| Responsive design only | Complex workflows awkward on small screens | v1.1 |

---

## AI & Intelligence

| Limitation | Impact | Resolution Timeline |
|---|---|---|
| AI recommendations are heuristic, not ML-based | Accuracy limited by rule complexity | v2.0 |
| No natural language query interface | Users cannot ask questions in plain English | v2.0 |
| No predictive analytics | System reacts, doesn't forecast | v2.0 |

---

## Platform & Scale

| Limitation | Impact | Resolution Timeline |
|---|---|---|
| No WebSocket/SSE for real-time events | Live Feed uses polling or static data | v1.1 |
| No background job queue (e.g., BullMQ) | Long operations block the request cycle | v1.1 |
| No horizontal scaling tested | Single-instance deployment assumed | v1.2 |
| No CDN for static assets | Slower load times in distant regions | v1.1 |

---

## Automation

| Limitation | Impact | Resolution Timeline |
|---|---|---|
| No automated workflows (PF-6 pending) | Manual follow-up on all decisions | v1.1 |
| No scheduled reports | Founder must log in to see the brief | v1.1 |
| No email/SMS notifications | Staff must check the app proactively | v1.1 |

---

## Compliance & Legal

| Limitation | Impact | Resolution Timeline |
|---|---|---|
| No GDPR data export/deletion workflow | Cannot fulfill GDPR requests efficiently | v1.1 |
| No audit log export | Compliance reporting is manual | v1.1 |
| No SOC 2 certification | May block enterprise sales | v2.0 |

---

*Knowing your limitations is part of engineering maturity.*

*This document was established upon declaring ScanVista Release Candidate 1 (RC1).*
