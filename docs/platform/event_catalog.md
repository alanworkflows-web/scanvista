# Event Catalog

This document defines the frozen event contract for the PF-2 Audit & Event Engine. Every state-changing operation in ScanVista must emit exactly one primary business event as defined below.

| Event Action | Resource Type | Trigger | Actor | Subscribers |
| :--- | :--- | :--- | :--- | :--- |
| **CREATED** | `PROPERTY` | Property onboarding / creation | Owner | Analytics, Audit, Founder HQ |
| **UPDATED** | `PROPERTY` | Property settings changed | Owner / Admin | Audit, Timeline |
| **CREATED** | `GUEST` | Guest reservation added | Admin / API | Analytics, Timeline |
| **UPDATED** | `GUEST` | Guest details changed | Admin / Staff | Audit, Timeline |
| **CHECKED_IN** | `GUEST` | Guest marked as checked-in | Admin / Staff | Timeline, Notification |
| **CHECKED_OUT** | `GUEST` | Guest marked as checked-out | Admin / Staff | Timeline, Notification |
| **CREATED** | `MENU` | Menu category added | Owner / Admin | Analytics |
| **DELETED** | `MENU` | Menu category removed | Owner / Admin | Audit |
| **CREATED** | `DISH` | New dish added to menu | Owner / Admin | Analytics |
| **UPDATED** | `DISH` | Dish details/price changed | Owner / Admin | Audit |
| **GENERATED** | `RECOMMENDATION` | AI system proposes an action | AI / System | Analytics |
| **VIEWED** | `RECOMMENDATION` | Manager views the recommendation | Owner / Admin | Analytics |
| **ACCEPTED** | `RECOMMENDATION` | Manager accepts the proposal | Owner / Admin | Analytics, Timeline |
| **DISMISSED** | `RECOMMENDATION` | Manager dismisses the proposal | Owner / Admin | Analytics |
| **EXECUTED** | `RECOMMENDATION` | System completes accepted action | System | Timeline |

## Event Lifecycle Example: Recommendation

Every recommendation moves through a measurable lifecycle:
`GENERATED` -> `VIEWED` -> `ACCEPTED` / `DISMISSED` -> `EXECUTED`

By correlating these events using the `correlationId`, the Analytics engine can compute the acceptance rate, ignore rate, average time to act, and business impact for every AI suggestion.
