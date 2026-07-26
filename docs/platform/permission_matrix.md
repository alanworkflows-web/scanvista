# Permission Matrix

This matrix defines the role-based access control (RBAC) boundaries within the ScanVista multi-tenant architecture. 

## Organization Roles

| Role | Description |
|---|---|
| **OWNER** | Full control over the Organization, its billing, and all associated Properties. Can invite other users and delete the Organization. |
| **ADMIN** | Can manage Properties, create amenities/menus, and view all operational data. Cannot manage billing or delete the Organization. |
| **STAFF** | Read-only access to operational dashboards. Can resolve tasks and handle active guest requests but cannot modify property settings. |

## Feature Access by Role

| Feature / Resource | OWNER | ADMIN | STAFF | Guest (No Auth) |
|---|:---:|:---:|:---:|:---:|
| Read Property Info | ✅ | ✅ | ✅ | ✅ (via QR) |
| Read Menus / Amenities | ✅ | ✅ | ✅ | ✅ (via QR) |
| Update Property Details | ✅ | ✅ | ❌ | ❌ |
| Create/Edit Menus | ✅ | ✅ | ❌ | ❌ |
| View Active Guests | ✅ | ✅ | ✅ | ❌ |
| Manage Organization Settings | ✅ | ❌ | ❌ | ❌ |
| Manage Subscription / Billing | ✅ | ❌ | ❌ | ❌ |
| Invite Users to Organization | ✅ | ❌ | ❌ | ❌ |

## Middleware Enforcement

The access matrix is strictly enforced via the `requireOrgAccess` and `requirePropertyAccess` middleware layers.

- Any request lacking a valid `OrganizationMembership` is instantly rejected with `401 Unauthorized` or `403 Forbidden`.
- Any mutation request (`POST`, `PUT`, `DELETE`) checks the user's `role`. If the user is `STAFF` attempting to edit a menu, it will be rejected at the API boundary, regardless of UI state.
- Cross-tenant access is physically impossible at the database layer; every query for property-related objects enforces a strict `orgId` match against the authenticated user's verified `Organization`.
