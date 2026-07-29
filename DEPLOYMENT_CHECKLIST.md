# Deployment Checklist

This document serves as the pre-flight checklist for deploying ScanVista to production.

## 1. Pre-Deployment Configuration
- [ ] **Environment Variables**: Ensure all required variables are configured in Vercel/Production:
  - `DATABASE_URL` (PostgreSQL connection string)
  - `DIRECT_URL` (PostgreSQL direct connection for Prisma migrations)
  - `SESSION_SECRET` (Must be cryptographically secure, >=32 characters)
  - `GOOGLE_CLIENT_ID` (OAuth ID)
  - `GOOGLE_CLIENT_SECRET` (OAuth Secret)
  - `PADDLE_API_KEY` (Paddle API Key)
  - `PADDLE_WEBHOOK_SECRET` (Paddle Webhook Signature Secret)
  - `NODE_ENV=production`
- [ ] **.env Security**: Ensure `.env` is NOT checked into git.
- [ ] **Log Level**: Ensure `LOG_LEVEL=INFO` or `WARN` is set to prevent `DEBUG` level log spam.

## 2. Security Verifications
- [ ] **Auth Bypass**: Verify `TEST_MODE=true` is **NOT** set in production.
- [ ] **Rate Limits**: Verify proxy limits behave correctly (`trust proxy 1`). If deploying behind Cloudflare AND Vercel, this may need adjustment to `2`.
- [ ] **Dependencies**: Run `npm audit --production`.
  *Note: High severity RSC CSRF bypass in `react-router` is a known false-positive for this SPA architecture and can be safely ignored unless server-side rendering is introduced.*

## 3. Deployment Steps
1. Push to the `main` branch.
2. Vercel automatically initiates the build (`npm run build`).
3. Vercel automatically runs `prisma generate`.
4. Wait for the green build status.

## 4. Post-Deployment Verification
- [ ] Access the production URL via `https://`.
- [ ] Open Chrome DevTools (F12) -> Console. Confirm **no CSP violation errors** appear during navigation or Google OAuth login.
- [ ] Test the `/legal/terms` route and ensure it renders fully (Sections 1-20).
- [ ] Trigger a mock webhook from the Paddle Dashboard and verify it returns HTTP 200 without exposing PII in the Vercel logs.

## 5. Rollback Considerations
- If a critical bug is discovered, use Vercel's **Instant Rollback** feature in the dashboard to revert to the previous working deployment.
- If a database migration caused the issue, manual intervention via Prisma Studio may be required. Never rollback code without verifying Prisma schema compatibility.

## 6. Contacts
- **Security Emergencies**: security@scanvista.com
- **DevOps**: [Insert Contact]
