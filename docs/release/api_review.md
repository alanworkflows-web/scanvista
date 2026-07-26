# Stage 4 — API Review

**Reviewer:** Antigravity AI  
**Date:** 2026-07-18  
**Status:** ⚠️ PASS WITH NOTES

---

## Endpoint Inventory

| Endpoint | Method | Purpose | Auth | Role | Verdict |
|---|---|---|---|---|---|
| `/auth/google` | `GET` | OAuth Initiation | None | None | ✅ |
| `/auth/google/callback` | `GET` | OAuth Callback | None | None | ✅ |
| `/api/logout` | `POST` | Session Destroy | None | None | ✅ |
| `/api/me` | `GET` | Current User Info | Session + Org | Any | ✅ |
| `/api/properties/:slug` | `GET` | Public Property Fetch | None (Public) | None | ✅ |
| `/api/manager/properties` | `GET` | Manager Property List | Session + Org | ADMIN | ✅ |
| `/api/manager/properties` | `POST` | Create Property | Session + Org | OWNER | ✅ |
| `/api/manager/properties/:slug` | `PUT` | Update Property | Session + Org | ADMIN | ✅ |
| `/api/manager/properties/:slug/portal` | `POST` | Billing Portal | Session + Org | OWNER | ✅ |
| `/api/manager/properties/:slug/amenities` | `POST` | Create Amenity | Session + Org | ADMIN | ✅ |
| `/api/manager/amenities/:id` | `PUT` | Update Amenity | Session + Org | ADMIN | ⚠️ |
| `/api/manager/amenities/:id` | `DELETE` | Delete Amenity | Session + Org | ADMIN | ✅ |
| `/api/manager/properties/:slug/categories` | `POST` | Create Category | Session + Org | ADMIN | ✅ |
| `/api/manager/categories/:id` | `PUT` | Update Category | Session + Org | ADMIN | ✅ |
| `/api/manager/categories/:id` | `DELETE`| Delete Category | Session + Org | ADMIN | ✅ |
| `/api/manager/properties/:slug/dishes` | `POST` | Create Dish | Session + Org | ADMIN | ✅ |
| `/api/manager/dishes/:id` | `PUT` | Update Dish | Session + Org | ADMIN | ⚠️ |
| `/api/manager/dishes/:id` | `DELETE`| Delete Dish | Session + Org | ADMIN | ✅ |
| `/api/manager/properties/:slug/guests` | `GET` | List Guests | Session + Org | ADMIN | ✅ |
| `/api/manager/properties/:slug/guests` | `POST` | Create Guest | Session + Org | ADMIN | ✅ |
| `/api/manager/guests/:id` | `PATCH` | Update Guest | Session + Org | Any | ⚠️ |
| `/api/manager/guests/:id` | `DELETE`| Delete Guest | Session + Org | ADMIN | ✅ |
| `/api/guests/:token` | `GET` | Public Guest Journey | None (Public) | None | ✅ |
| `/api/platform/health` | `GET` | Platform Health | Session | OWNER | ✅ |
| `/api/platform/insights/brief`| `GET` | Founder Brief | Session | OWNER | ✅ |

---

## REST Consistency

| Principle | Adherence |
|---|---|
| HTTP Verbs | ✅ Used correctly (GET for read, POST for create, PUT/PATCH for update, DELETE for remove) |
| Resource Naming | ✅ Plural nouns (`/properties`, `/amenities`, `/guests`) |
| Nested Resources | ✅ Used appropriately (`/properties/:slug/guests`) |
| Status Codes | ⚠️ Mostly 200/400/403/404/500, but some endpoints return 200 on error |
| Pagination | ❌ Not implemented on list endpoints |

## Finding #1 — No pagination on list endpoints (MEDIUM)

Endpoints like `GET /api/manager/properties/:slug/guests` return all matching records:
```typescript
let guests = await prisma.guest.findMany({
  where: { propertyId: property.id },
  orderBy: { arrivalDate: 'asc' }
});
```

**Risk:** As a hotel acquires thousands of guests over a year, this query will degrade performance and increase memory usage, potentially crashing the server or browser.

**Recommendation:** Implement cursor-based pagination (limit/cursor parameters) for guest and activity event endpoints.

---

## Finding #2 — Inconsistent Validation (MEDIUM)

As noted in the Security Review, `PUT /api/manager/amenities/:id` and `PUT /api/manager/dishes/:id` do not use Zod validation, whereas the corresponding `POST` endpoints do.

Additionally, error responses from Zod are returned as:
```json
{ "error": "Validation Error", "details": [...] }
```
But `PATCH /api/manager/guests/:id` uses:
```json
{ "error": "Invalid data", "details": [...] }
```
**Recommendation:** Create a centralized validation middleware or error handler.

---

## Finding #3 — PATCH guest route bypasses central registration (LOW)

```typescript
app.patch("/api/manager/guests/:id", [requireAuth, ...
```
This bypasses `managerPatch()` (which doesn't exist yet in `routes.ts`).

---

## Summary

| Area | Verdict |
|---|---|
| REST Consistency | ✅ Good |
| HTTP Status Codes | ✅ Generally correct |
| Input Validation | ⚠️ Inconsistent |
| Pagination | ❌ Missing |
| Versioning | ⚠️ No `/v1/` prefix |
| Error Formatting | ⚠️ Inconsistent |

**Overall:** The API is functional and secure, but lacks maturity in pagination and centralized error handling.
