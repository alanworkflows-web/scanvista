# Product Principles

*These are the non-negotiable engineering and product rules for building ScanVista. They dictate how the product operates under the hood and in the hands of users.*

1. **The manager decides.** The system never takes executive action on behalf of a manager without explicit approval.
2. **The OS explains.** Recommendations are useless without reasoning. The system must always answer "Why?".
3. **Intelligence must be explainable.** No black-box AI. Every prediction must map to observable facts.
4. **Recommendations are advisory.** They exist to support judgment, not replace it.
5. **Every screen corresponds to a real-world moment.** (e.g., Morning Briefing, Walk Mode, Live Operations). If it doesn't fit a real moment, it shouldn't exist.
6. **Knowledge appears in context.** Wisdom is injected into active workflows exactly when needed, not trapped in an isolated wiki.
7. **Silent coordination over noisy notifications.** When an action is taken, the system silently updates all dependent states (e.g., Housekeeping approval resolves Reception risk). No pop-up spam.
8. **Hospitality first, technology second.** The tech should fade into the background.
9. **Progress over perfection.** Continuous, measurable improvements matter more than seeking an impossible flawless operation.
10. **Reduce cognitive load before adding functionality.** If a new feature makes the system harder to understand, it must be simplified or discarded.
11. **Never optimize for clicks; optimize for decisions.** A great feature reduces the time it takes to make a confident decision, even if it reduces "engagement time."
12. **Every improvement should make tomorrow easier.** The OS must inherently learn from today's friction to prevent it tomorrow.
13. **Context is king.** Data without context is noise. Always surface the operational phase and business goals.
14. **Design for the stressed manager.** Assume the user is currently managing a crisis, a VIP arrival, and a supplier delay simultaneously.
15. **Respect the property's rhythm.** The system should adapt to the time of day, changing its focus from preparation (morning) to execution (peak) to review (closing).
