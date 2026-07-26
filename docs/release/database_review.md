# Stage 3 — Data Integrity Review

**Reviewer:** Antigravity AI  
**Date:** 2026-07-18  
**Status:** ⚠️ PASS WITH NOTES

---

## Prisma Schema Analysis

### Models (14 total)

| Model | Records Cascade On Delete? | Foreign Keys | Verdict |
|---|---|---|---|
| Organization | N/A (root) | — | ✅ |
| OrganizationMembership | Cascade from User & Org | `userId`, `orgId` | ✅ |
| OrganizationInvitation | Cascade from Org | `orgId` | ✅ |
| User | N/A (root) | — | ✅ |
| Property | No cascade (keeps data) | `ownerId`, `orgId` | ⚠️ See #1 |
| Subscription | Cascade from Property | `propertyId` (unique) | ✅ |
| Feedback | Cascade from Property | `propertyId` | ✅ |
| MenuCategory | Cascade from Property | `propertyId` | ✅ |
| Dish | Cascade from MenuCategory | `categoryId` | ✅ |
| Amenity | Cascade from Property | `propertyId` | ✅ |
| Guest | Cascade from Property | `propertyId` | ✅ |
| ActivityEvent | Cascade from Org & Property, SetNull from User | `organizationId`, `propertyId`, `actorId` | ✅ |
| MetricSnapshot | No cascade | `organizationId`, `propertyId` | ⚠️ See #2 |
| Session / OAuthState / WebhookEvent | Standalone | — | ✅ |

---

## Finding #1 — Property has no onDelete cascade from User (LOW)

```prisma
owner  User  @relation(fields: [ownerId], references: [id])
```

If a User is deleted, their properties would be orphaned (Prisma default: `Restrict` — delete would fail). This is actually the **correct** behavior for a production system (you don't want to accidentally cascade-delete an entire hotel's data when removing a user account).

**Verdict:** ✅ Correct by design.

---

## Finding #2 — MetricSnapshot has no cascade delete (LOW)

If an Organization or Property is deleted, MetricSnapshot records referencing them will become orphaned. Unlike ActivityEvents (which cascade), metrics don't clean up.

**Recommendation:** Add `onDelete: Cascade` to the Organization and Property relations, or add a cleanup job.

---

## Indexes

| Index | Type | Model | Verdict |
|---|---|---|---|
| `Organization.slug` | `@unique` | Organization | ✅ |
| `User.email` | `@unique` | User | ✅ |
| `User.googleId` | `@unique` | User | ✅ |
| `Property.slug` | `@unique` | Property | ✅ |
| `Subscription.propertyId` | `@unique` | Subscription | ✅ |
| `OrganizationMembership [userId, orgId]` | `@@unique` | Membership | ✅ |
| `MetricSnapshot [orgId, propId, key, bucket, type]` | `@@unique` | MetricSnapshot | ✅ |
| `OAuthState.stateHash` | `@unique` | OAuthState | ✅ |
| `Guest.token` | `@unique` | Guest | ✅ |
| `Session.sid` | `@unique` | Session | ✅ |

## Finding #3 — Missing indexes on high-query foreign keys (MEDIUM)

The following foreign keys are frequently queried but lack explicit indexes:

| Column | Model | Query Pattern |
|---|---|---|
| `Property.ownerId` | Property | `WHERE ownerId = ?` on every manager request |
| `Property.orgId` | Property | `WHERE orgId = ?` for tenant isolation |
| `Guest.propertyId` | Guest | `WHERE propertyId = ?` on guest list |
| `ActivityEvent.organizationId` | ActivityEvent | `WHERE organizationId = ?` for event queries |
| `ActivityEvent.timestamp` | ActivityEvent | `ORDER BY timestamp DESC` for timeline |

PostgreSQL automatically creates indexes on `@unique` columns and primary keys, but **not** on regular foreign keys.

**Recommendation:** Add `@@index` directives:
```prisma
model Property {
  @@index([ownerId])
  @@index([orgId])
}
model Guest {
  @@index([propertyId])
}
model ActivityEvent {
  @@index([organizationId, timestamp])
}
```

---

## Constraints & Enums

| Feature | Status |
|---|---|
| GuestStatus enum | ✅ Database-level enum |
| ResourceType enum | ✅ Database-level enum |
| ActionType enum | ✅ Database-level enum |
| EventSource enum | ✅ Database-level enum |
| String-based roles (OWNER/ADMIN/MEMBER) | ⚠️ Not a database enum |

## Finding #4 — Roles are strings, not enums (LOW)

`OrganizationMembership.role` is `String @default("MEMBER")`. This means the database will accept any string value (e.g., `"SUPERADMIN"`, `"root"`, `""`) without constraint.

**Recommendation:** Create a `MembershipRole` enum and apply it to the field for database-level validation.

---

## Backup & Migration Strategy

| Area | Status |
|---|---|
| Migration history | ✅ Prisma migrations tracked in `prisma/migrations/` |
| Backup automation | ⚠️ Not configured (Neon provides snapshots, but no documented recovery procedure) |
| Seed data | ⚠️ No `prisma/seed.ts` file found |

---

## Summary

| Area | Verdict |
|---|---|
| Cascade Deletes | ✅ Correctly configured |
| Foreign Keys | ✅ All relations defined |
| Indexes | ⚠️ Missing FK indexes |
| Constraints | ⚠️ Roles not enum-constrained |
| Enums | ✅ Properly used for events |
| Migrations | ✅ Tracked |
| Backups | ⚠️ No documented procedure |
