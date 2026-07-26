# Authentication Outage Runbook

## Overview
This runbook covers how to respond when users are unable to authenticate (login or sign-up). Our platform uses Google OAuth via `google-auth-library`.

## Symptoms
- Vercel/Pino logs indicate HTTP 401 Unauthorized for `/auth/google` routes.
- Spikes in `warn` or `error` level logs concerning "Invalid Google ID token".
- User reports of being unable to log in, being stuck in redirect loops, or being repeatedly asked to log in.

## Triage Steps
1. **Google Identity Status:** Check the Google Cloud Status Dashboard to verify if the Google Sign-In service is experiencing issues.
2. **Environment Variables:** Verify that `GOOGLE_CLIENT_ID` in Vercel has not been changed or accidentally deleted.
3. **Session Store:** We use `@quixo3/prisma-session-store`. Verify that the database is reachable (see Database Outage Runbook). If session reads/writes are failing, authentication will fail.
4. **Cookie Configuration:** If this only affects production, verify that the `express-session` cookie configuration sets `secure: true` and `sameSite: 'lax'`. Browsers will reject non-secure cookies on HTTPS domains.

## Resolution
- If it's a cookie/domain issue, ensure `trust proxy` is set to `true` in Express.
- If it's a database session issue, scale the database or flush expired sessions.
- If Google OAuth credentials have expired or been revoked, regenerate them in the GCP console and update Vercel environment variables, then redeploy.

## Post-Incident
1. Check the DB for orphaned sessions.
2. Monitor log levels for 24 hours to ensure 401s drop to standard background noise levels.
