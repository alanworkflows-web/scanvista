# Pre-Release Code Audit (ScanVista v0.1.0-rc1)

Here is the requested code audit across all areas. This report verifies the current state of the application without making changes.

> [!WARNING]
> The **Build Audit** revealed a significant number of TypeScript errors that should be resolved before cutting the RC.

---

### 1. Dead Code Audit

* **`ManagerRestaurant`**: No references remain in the codebase.
* **`/manager/restaurant`**: 
  * As expected, an explicit redirect exists in `App.tsx` (`<Navigate to="/manager/property" replace />`).
  * **ISSUE FOUND:** There is a stale programmatic route in `src/pages/ManagerPublishing.tsx` (line 193). If a changed item includes "menu", "dish", or "category", the system still tries to link to `/manager/restaurant` instead of `/manager/menu`.
* **`BrandStudio`**: No references remain in the codebase.
* **`houseRules`**:
  * **ISSUE FOUND:** The deprecated string field has not been fully phased out yet. It remains in `prisma/schema.prisma`. Furthermore, it is still actively referenced in `server.ts`, `src/types.ts`, and is rendered in the UI on `src/pages/PropertyPage.tsx` (line 539: `{property.houseRules || "No house rules listed."}`).

---

### 2. Routing Audit

All routes were verified in `src/App.tsx`. 
* **Core Manager Routes Present:** `/manager/home`, `/manager/property`, `/manager/menu`, `/manager/amenities`, `/manager/house-rules`, `/manager/guests`, `/manager/publishing`, `/manager/billing`, `/manager/help`.
* **Additional Routes Present:** `/manager/playbook` and `/manager/experience` also exist.
* **Issues:** No duplicate routes or orphaned imports. The routing layer is structurally sound, though there is one minor redirect leftover for `/manager/setup` -> `/manager/home`.

---

### 3. API Audit

All endpoints inside `server.ts` were extracted and verified. The API relies on Express.js with robust routing logic.

* **Authentication & Public:** `/auth/google`, `/auth/google/callback`, `/api/logout`, `/api/me`.
* **Guest Facing:** `/api/properties/:slug`, `/api/preview/:token`, `/api/guests/:token`, `/api/tracking/event`
* **Manager CRUD Endpoints:** All property, amenity, dish, category, guest, and activity endpoints follow the `/api/manager/...` pattern.
* **Verification:**
  * **Status Codes:** Standard 200/201s for success and 400/401/403/404s for errors are correctly implemented.
  * **Authorization:** Every single `/api/manager/*` endpoint is strictly guarded by the `requireAuth` middleware.
  * **Rate Limiting:** `apiLimiter`, `publicApiLimiter`, and `authLimiter` middlewares are actively securing the root paths.

---

### 4. Database Audit (`prisma/schema.prisma`)

* **`hotelRules` vs `houseRules`:** Both exist on the `Property` model. Because `houseRules` is still rendered in `PropertyPage.tsx`, it's being read but likely not written anymore if the editor migrated to `hotelRules`.
* **`contacts`:** Exists as `Json?` on `Property`. It is actively written (in fact, there is a duplicate key warning during build in `server.ts` due to this).
* **`ActivityEvent`:** Fully configured. Relations exist between `ActivityEvent`, `Property`, `Organization`, and `User`.
* **`displayOrder`:** Actively defined in `MenuCategory` and `FAQ`.
* **Amenity Status:** The `status` field (String, default "ACTIVE") exists on the `Amenity` model.

---

### 5. Build Audit

> [!CAUTION]
> The TypeScript and Lint checks failed, meaning the build might run with runtime anomalies.

* **Production Build (`npm run build`):** SUCCEEDED (Vite bundle built in ~1 minute). However, `esbuild` threw 1 warning: **Duplicate key "contacts"** in an object literal in `server.ts` (line 1595).
* **TypeScript & Linting (`npm run lint`):** FAILED with a large block of type errors:
  * **`server.ts`:** Type mismatches for `GuestCreateInput` and `PropertyCreateInput`. Also, `Property 'subscription' does not exist`.
  * **`src/components/manager/menu/DishCard.tsx`:** `Property 'description' does not exist on type 'Dish'`.
  * **React Component Types:** Numerous errors for missing components (e.g. `Button`, `ImageUploader` not imported in some files).
  * **Component Props Mismatches:** Errors regarding button variants (e.g. Type `"outline"` is not assignable to type `"primary" | "secondary" | "ghost"`).
  * **Types:** Missing properties on the `DiffResult` interface used in `ManagerPublishing.tsx`.

### Recommendation

Before proceeding to the final manual regression testing and tagging **v0.1.0-rc1**, the TypeScript errors (especially those in `server.ts` and `DishCard.tsx`) and the stale `/manager/restaurant` link in `ManagerPublishing.tsx` should be fixed. 

Let me know how you would like to proceed! We can either fix these specific code issues, or if you're comfortable with the risks, proceed directly to your manual QA sign-off.
