# Pre-Release Fix Checklist

- `[ ]` **Routing & Dead Code**
  - `[ ]` Fix stale `/manager/restaurant` link in `src/pages/ManagerPublishing.tsx`.
  - `[ ]` Migrate `PropertyPage.tsx` from `houseRules` to `hotelRules`.

- `[ ]` **Server Types & Errors (`server.ts`)**
  - `[ ]` Fix duplicate `contacts` key.
  - `[ ]` Fix `GuestCreateInput` type mismatch.
  - `[ ]` Fix `PropertyCreateInput` type mismatch.
  - `[ ]` Fix `Property 'subscription' does not exist` error.

- `[ ]` **Frontend Component Types**
  - `[ ]` Add `description` to `Dish` type in `src/types.ts` / fix `DishCard.tsx`.
  - `[ ]` Fix missing properties on `DiffResult` interface.
  - `[ ]` Fix `Button` variants (`"outline"` -> `"secondary"` or `"ghost"`) across multiple pages.
  - `[ ]` Fix missing `ImageUploader` and `Button` imports.
