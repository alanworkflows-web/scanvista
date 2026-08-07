# ScanVista Development Guidelines & Canonical Rules

## Architectural Principles

### The Canonical Component Rule
> **"For every business capability, exactly one production component exists. Duplicate implementations are prohibited. If a replacement is introduced, the old implementation enters LEGACY state, is feature-migrated, verified, then removed. Never maintain two production implementations simultaneously."**

### 1. Guest Experience Architecture
- **Canonical Component**: `src/pages/PropertyPage.tsx` is the sole canonical rendering surface for all guest-facing portals across ScanVista.
- **Routing & Adapters**: Route-specific data fetching (`/p/:propertySlug`, `/preview/:token`, `/g/:token`) is orchestrated through the adapter layer `src/pages/GuestPageLoader.tsx`.
- **Pure Rendering**: `PropertyPage` receives standard `PropertyData` props (along with optional `guest` context and `isPreview` / `isScanned` flags). It does not couple itself directly to one routing format.
- **Unified QR & URLs**: All QR generators, share links, onboarding flows, and published outputs point to `/p/:propertySlug` (or `/g/:token` for personalized guest journeys).

### 2. Migration and Deprecation Standard
When deprecating a legacy component:
1. Establish a feature-by-feature parity checklist.
2. Port all missing features (visual styling, fields, micro-interactions, telemetry/analytics) into the canonical component.
3. Rename the predecessor component to `.legacy.tsx` (retained for exactly one sprint to allow rollback or diff comparison).
4. Verify end-to-end functionality across desktop, mobile, and cold guest QR scan flows.
5. Retire the `.legacy.tsx` component completely.

### 3. Analytics & Telemetry
All user interactions on guest surfaces must emit structured telemetry via `trackEvent`:
- `WIFI_COPIED` (Network SSID and password copying)
- `MENU_SEARCHED` (Dietary filters and search queries)
- `AMENITY_OPENED` / `AMENITY_RESERVATION_CLICK` (Facility exploration and desk bookings)
- `RULE_OPENED` (House rules and local experience guides)
- `GALLERY_VIEWED` (Photo showcase interaction)
- Direct contact triggers (`RECEPTION_CALL_CLICK`, `HOUSEKEEPING_CALL_CLICK`, `ROOM_SERVICE_CALL_CLICK`, `WHATSAPP_CLICK`, `EMERGENCY_CALL_CLICK`, `PHONE_CLICK`, `EMAIL_CLICK`, `WEBSITE_CLICK`).
