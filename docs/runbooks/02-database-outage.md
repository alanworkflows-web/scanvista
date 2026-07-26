# Database Outage Runbook

## Overview
This runbook outlines the steps to take when the platform loses connectivity to the primary PostgreSQL database hosted on Neon. Symptoms include HTTP 503 errors on the `/api/health/metrics` endpoint, elevated HTTP 500 error rates, and failure to process incoming requests.

## Symptoms
- Vercel/Pino logs indicate `PrismaClientInitializationError` or `PrismaClientKnownRequestError`.
- Datadog/Metrics endpoints report database latency as `-1` or timeout.
- User reports of "Internal Server Error" on page loads.

## Triage Steps
1. **Check Neon Status:**
   Visit the Neon Status Page (https://neon.tech/status) to confirm if there is a known upstream outage.
2. **Verify Connection String:**
   Check the Vercel Environment Variables to ensure `DATABASE_URL` is correctly formatted and the password hasn't been rotated.
3. **Connection Pooling Limits:**
   If the error is related to connection exhaustion (`timeout exceeded while waiting for a connection`), check Neon Console to see if the active connections limit has been reached.

## Resolution
- **If upstream outage (Neon):** Switch the Vercel project into "Maintenance Mode" (if supported) or deploy a static maintenance page to prevent compounding errors. Notify stakeholders.
- **If connection exhaustion:** Scale the Neon compute instance to a higher tier or review Vercel Serverless Function concurrency limits. Ensure Prisma is configured with a connection pooler (e.g., PgBouncer transaction mode URL).

## Post-Incident
1. Export logs filtering by `code: INTERNAL_SERVER_ERROR`.
2. Check if any critical `ActivityEvents` failed to process.
3. Write an incident report detailing Time to Detect (TTD) and Time to Mitigate (TTM).
