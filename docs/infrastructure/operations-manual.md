# ScanVista Operations Manual

This document outlines the standard operating procedures required to maintain ScanVista in production for pilot customers.

## 1. Uptime Monitoring
We employ external uptime monitoring to ensure the API is accessible globally.
- **Health Check Endpoint:** `GET /api/me` (requires 401 Unauthorized response instead of 500, proving DB connectivity and server execution).
- **Tooling:** BetterStack / DataDog synthetic pings from 3 global regions every minute.

## 2. Backup & Disaster Recovery
- **Database Backups:** Automated `pg_dump` runs nightly via Vercel Cron or GitHub Actions (using `scripts/db-backup.cjs`).
- **Retention:** 30 days of rolling backups.
- **Restore:** In the event of catastrophic data loss, use `scripts/db-restore.cjs` with the latest stable `.dump` file. Target Recovery Time Objective (RTO) is < 1 hour.

## 3. Log Rotation
- Application logs are captured at the edge via Vercel Logs.
- **ActivityEvents:** High-value business logic logs are securely written to the `ActivityEvent` database table for founder analysis and customer audit trails. Old telemetry events are aggressively pruned, while AUDIT events are preserved indefinitely.

## 4. Environment Secrets
All secrets are injected exclusively at runtime:
- `DATABASE_URL` / `DIRECT_URL`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- `SESSION_SECRET`

**No secrets are ever committed to the repository.**

## 5. Security & Incident Response
If a critical vulnerability is discovered (e.g. BOLA access leak), the Founder Escalation Line will be activated, deploying an immediate maintenance mode via Vercel until a patch is verified in staging.
