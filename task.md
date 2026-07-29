# Task List: Google Auth & Manager Home Bug Fixes

- [x] Handle OAuth Double-Requests: Update `/auth/google/callback` to redirect already-authenticated users.
- [x] Fix User Provisioning: Create Organization and OrganizationMembership for new users in `/auth/google/callback`.
- [x] Manager Home Fallback: Update `ManagerHome.tsx` to handle `property === null` gracefully instead of returning `null`.
- [x] Run validation pipeline to ensure stability.
