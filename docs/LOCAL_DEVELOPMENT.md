# Local Development Guide

## Prerequisites
- Node.js (v18+)
- Postgres database (Neon or local)
- Valid `.env` file in the project root

## One Startup Command

To start the development environment, open a single terminal in the project root and run:

```bash
npm run dev
```

That's it. ScanVista will handle the rest.

## Expected Output

When you run `npm run dev`, the automated bootstrapper will diagnose and heal the environment before launching the server. You should see an output similar to:

```
====================================
ScanVista Development Bootstrap
====================================

1. Verifying environment... ✓
2. Checking database connection...
   Database connected ✓
3. Checking Prisma client...
   Prisma client ready ✓
4. Freeing development ports...
   Ports cleared ✓

====================================
ScanVista Development Status

Frontend      ✓
Backend       ✓
Database      ✓
Prisma        ✓
API           ✓
Authentication ✓
Environment   ✓

READY FOR TESTING
====================================
```

## Common Failures & Automatic Recovery Behavior

ScanVista treats local development reliability as a P0 engineering requirement. The bootstrapper automatically recovers from common issues:

- **Missing Environment Variables**: If `.env` is missing or lacks `DATABASE_URL`, the bootstrapper will safely fail with a clear, actionable error message before attempting to boot the server.
- **Database Unreachable**: Before starting the server, the bootstrapper verifies database connectivity. If Neon/Postgres is down or your IP has changed, it will fail gracefully with diagnostic information.
- **Missing Prisma Client**: If you recently ran `npm install` or cloned the repo, the bootstrapper detects if `node_modules/@prisma/client` is missing and automatically runs `npx prisma generate` for you.
- **Zombie Processes**: If you closed your laptop, put Windows to sleep, or the server crashed, port `3000` may be occupied by a zombie process. The bootstrapper automatically finds the process occupying port `3000` and gracefully terminates it before launching the new server. You will never need to manually run `taskkill` or `kill -9` again.
