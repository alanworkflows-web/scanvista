# ScanVista UX & Design Standards

This document establishes the permanent UX and design rules for ScanVista. Hospitality software should feel **calm, confident, and highly functional**. 

These standards protect the UX from feature bloat and ensure that every new feature looks like it always belonged in ScanVista.

## Core Principles

1. **Clarity over cleverness.**
2. **One primary action per screen.**
3. **Never leave the user wondering what to do next.**
4. **Every save gives immediate feedback** (e.g., using `sonner` toasts).
5. **Every empty state explains how to fill it.**
6. **Every page answers a single question.**

## Visual & Motion Guardrails

- **Animations are for feedback, not decoration.**
  - **Good:** Save → toast, Publish → confetti, Loading → skeleton, expanding sections.
  - **Avoid:** Cards animating every render, constant floating effects, long transitions, multiple simultaneous animations.
- **Maintain consistent hierarchy.** 
  - Same spacing, typography, card language, and button hierarchy across all pages.
- **Information Density > UI Density.**
  - The Dashboard is the product's brain. It should answer actionable questions ("Is my property ready?", "What's missing?", "Can I publish today?") rather than displaying meaningless vanity metrics or charts.

> **Rule of Thumb:** Before adding any new UI element, ask if it helps a hotel manager complete a task faster. If not, omit it.
