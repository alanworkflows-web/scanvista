# Implementation Plan: Google OAuth & Manager Home Routing

## Overview
The "Session Expired" and "Blank Manager Home" bugs during new Google sign-ups stem from three interacting issues:
1. **Missing Organization Provisioning**: New users are created in the database via Google OAuth, but they aren't assigned an `Organization` or `OrganizationMembership`. When the frontend automatically tries to provision their first property, it fails with a 403 (requires an Organization), causing the property state to remain `undefined`.
2. **Blank Dashboard**: `ManagerHome.tsx` has a hardcoded `if (!property) return null;` which renders a blank white page if the property is undefined (which happens when provisioning fails).
3. **Double-Request OAuth Consumption**: The "Session Expired" screen is triggered by the atomic `consumedAt` check on the OAuth state. Browsers (like Safari) or double-clicks often trigger the callback twice. The first request succeeds, but the second request fails the atomic check and overwrites the browser window with the error screen.

## Proposed Changes

### 1. Fix User Provisioning
#### [MODIFY] [server.ts](file:///c:/Users/alok%20anand%20magada/Documents/scanvista/server.ts)
- Update the `/auth/google/callback` route. After `prisma.user.upsert()`, check if the user has an `OrganizationMembership`.
- If not, auto-create an `Organization` (e.g., `name: "\${payload.name}'s Organization"`) and link it to the user. This guarantees `POST /api/manager/properties` will succeed.

### 2. Handle OAuth Double-Requests
#### [MODIFY] [server.ts](file:///c:/Users/alok%20anand%20magada/Documents/scanvista/server.ts)
- In `/auth/google/callback`, before running the atomic `consumeResult` update, check if the user is *already authenticated* (`req.session.userId`). If they are, simply redirect them to `/manager` instead of showing the "Session Expired" error page. This seamlessly handles browser double-requests.

### 3. Manager Home Fallback & Empty States
#### [MODIFY] [ManagerHome.tsx](file:///c:/Users/alok%20anand%20magada/Documents/scanvista/src/pages/ManagerHome.tsx)
- Replace `if (!property) return null;` with a proper Empty State component.
- If `property` is undefined, display a welcome message and a button to explicitly "Create Your First Property" (which routes to the onboarding flow or manually triggers creation). This guarantees the page is never blank.

## Verification Plan
1. **Incognito Login**: Simulate a brand new user logging in via Google.
2. **Session Verification**: Ensure the user is properly assigned an Organization and Property, landing on `ManagerHome` with the checklist visible.
3. **Double-Callback Simulation**: Manually hit the callback URL twice to verify the second request redirects cleanly instead of throwing a Session Expired error.
4. **Blank Page Prevention**: Force a scenario where `property` is null and verify `ManagerHome.tsx` renders the recovery UI.
