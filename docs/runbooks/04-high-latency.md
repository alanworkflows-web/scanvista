# High Latency Runbook

## Overview
This runbook covers investigation and mitigation steps when the platform experiences high P95 or P99 response times. High latency typically leads to poor user experience and potential downstream timeouts.

## Symptoms
- Vercel function timeout errors (HTTP 504 Gateway Timeout).
- Monitoring logs show `responseTime` exceeding 1000ms consistently.
- Reports of slow dashboard loading.

## Triage Steps
1. **Identify the Bottleneck:** Use Pino logs to check `responseTime` per endpoint. Is the latency isolated to a specific endpoint (e.g., `/api/manager/properties`) or global?
2. **Database Performance:** Check the Neon Console for slow queries or high active connections. Missing indexes often cause sudden latency spikes as data volume grows.
3. **External Dependencies:** Is Paddle (billing) or Google (auth) experiencing high latency? External API calls block the Node event loop if not properly awaited or if the remote server is slow.
4. **Payload Size:** Ensure endpoints are not returning excessive amounts of unpaginated data. 

## Resolution
- If DB-related: Run `EXPLAIN ANALYZE` on the slow query and add missing indexes to `prisma/schema.prisma`.
- If external API related: Implement or check caching mechanisms (e.g., Redis or in-memory caching) for frequently accessed, rarely changing data.
- Short-term mitigation: Temporarily disable non-critical heavy operations (e.g., complex analytics background jobs) to free up DB resources.

## Post-Incident
1. Implement pagination on the offending endpoints if payload size was the issue.
2. Add the missing indexes to the schema.
3. Ensure monitoring thresholds are updated if they failed to catch the latency spike early enough.
