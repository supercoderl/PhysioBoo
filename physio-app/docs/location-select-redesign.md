# Location Select (Country → City → District → Ward)

**Component:** `boo-location-select` (`components/select/boo-location-select/`). **Service:** `LocationService`.
**Audience:** any form that captures an address (hospital group, hospital branch, supplier, manufacturer, patient, doctor).
**First consumer:** the hospital group drawer (admin `/admin/system/common-category/hospital-group` and super-admin tenants).

---

## 1. UX Audit — Current State

| Area | Finding |
|---|---|
| Location input | Forms use free-text `City` / `Country` boxes (hospital group, hospital, supplier, manufacturer, doctor). The same place is typed differently on each record ("HCMC", "Ho Chi Minh City", "TP.HCM"). |
| Reference data | There is no country / city / district / ward data in the frontend or the API. Hospital *wards* in the backend are inpatient units, not administrative areas. |
| Filtering / reporting | Free text cannot be grouped or filtered reliably, so "hospitals per city" style reports are not possible. |

## 2. Current Problems

1. Inconsistent, unvalidated location text.
2. Every form re-implements (or skips) its own location fields.
3. No dependent (cascading) selects in the shared control set.

## 3. Information Architecture

```
boo-location-select  (one form control, value = LocationValue)
├── Country   (always enabled)
├── City      (enabled after a country is chosen)
├── District  (enabled after a city is chosen)
└── Ward      (enabled after a district is chosen)
```

The street address stays a separate free-text `boo-input` below the control.

## 4. User Journey

1. Open a form with the control. Countries load immediately; City, District and Ward are disabled.
2. Pick a **country** → the City list loads for it. City / District / Ward are cleared.
3. Pick a **city** → the District list loads. District / Ward are cleared.
4. Pick a **district** → the Ward list loads. Ward is cleared.
5. Pick a **ward**. The form value is complete.
6. Editing a record: the saved ids are written into the control and every level's option list is loaded so the saved names display.

## 5. Layout

Two-column grid, desktop first. Order reads left → right, top → bottom: Country, City / District, Ward.
Below `sm` (640px) the grid collapses to one column. Each level is a standard `boo-select` so height, radius and focus ring match the rest of the app.

## 6. Wireframe

```
┌──────────────────────┬──────────────────────┐
│ Country *          ▾ │ City *             ▾ │
└──────────────────────┴──────────────────────┘
┌──────────────────────┬──────────────────────┐
│ District *         ▾ │ Ward *             ▾ │
└──────────────────────┴──────────────────────┘
  Ward is required            ← per-level error text
```

## 7. Component Hierarchy

```
boo-location-select            ControlValueAccessor<LocationValue>
└── boo-select × 4             (existing control, bound with ngModel)
LocationService                cached, per-level option loading
shared/types/location.types.ts LocationOption, LocationValue
```

## 8. UI Specification

| Item | Spec |
|---|---|
| Inputs | `required` (boolean), `countryLabel` / `cityLabel` / `districtLabel` / `wardLabel` (default "Country", "City", "District", "Ward") |
| Value | `LocationValue = { countryId, cityId, districtId, wardId }`, each `string \| null` |
| Empty value | all four `null` |
| Required | marks **Country and City** as required (`*`) and makes the control invalid until both are set; District and Ward are always optional (the component registers itself as a validator, so the form needs no extra validator) |
| Error text | shown per missing level once the control is touched (a failed Save calls `markAllAsTouched`), same red text as other controls; plain blur does not reveal them because picking an option blurs the previous select |

## 9. Interaction Design

- Selecting a level clears and reloads every level below it; stale responses from an earlier selection are discarded (`switchMap`).
- A level is disabled while its parent is empty or while its own list is loading.
- Keyboard and focus behaviour is inherited from `boo-select` (Tab between levels, Enter / click to open).
- A failed Save marks the control touched, which reveals every missing level at once.

## 10. Responsive Behavior

2 columns ≥ 640px, 1 column below. No horizontal scrolling at any width.

## 11. Accessibility

- Each level keeps its visible label; required levels show `*`.
- Error text uses `role="alert"`; invalid selects get `aria-invalid`.
- Disabled levels are not focusable. Colours reuse the existing danger token (WCAG AA).

## 12. Page States

| State | Behaviour |
|---|---|
| Loading countries | Country select disabled until the list arrives |
| Loading a child list | That level disabled; levels below stay cleared |
| Empty list for a parent | Select opens with "Empty data" (existing `boo-select` empty state) |
| Load error | Toast "Could not load locations"; the level stays empty and can be retried by reselecting its parent |
| Disabled form | `setDisabledState` disables all four levels |

## 13. Edge Cases

- Saved ids that no longer exist in the reference data: the level shows its label (empty) and the form is invalid until the user re-picks.
- Parent changed while a child request is in flight: the old response is ignored.
- Countries with no cities in the reference data: once the country's city list loads empty, City is **not required** either, so the control is valid with just the country. The control reports validity again after each list loads.

## 14. Performance Considerations

- Lists are cached per parent id in `LocationService` (`shareReplay`), so reopening a drawer does not refetch.
- Child lists load on demand, not up front. Large lists (wards of a big district) rely on the existing `boo-select` scroll list; server-side search can be added later without changing the control's API.

## 15. Scalability

The control only knows `LocationOption { id, name }`, so adding a level (e.g. street) or another country is a data / API change, not a component change.

## 16. API Contract (implemented as the read-only `api/locations/*` endpoints; see `location-api-contract.md`)

All endpoints are `GET`, authenticated, read-only, and return `ResponseMessage<LocationOption[]>`. Countries and cities are sorted by name (ignoring the "Tỉnh" / "Thành phố" prefix); districts and wards by administrative `code`, which keeps "Quận 1, Quận 2, …, Quận 10" in natural order.

```json
{ "success": true, "data": [ { "id": "guid", "name": "Viet Nam", "code": "VN" } ] }
```

| Purpose | Method | URL | Request | Frontend usage |
|---|---|---|---|---|
| List countries | GET | `/api/locations/countries` | none | First load of the control |
| List cities of a country | GET | `/api/locations/countries/{countryId}/cities` | path `countryId` | After a country is picked / restored |
| List districts of a city | GET | `/api/locations/cities/{cityId}/districts` | path `cityId` | After a city is picked / restored |
| List wards of a district | GET | `/api/locations/districts/{districtId}/wards` | path `districtId` | After a district is picked / restored |

Record endpoints (hospital group, hospital, …) should store `countryId`, `cityId`, `districtId`, `wardId` plus the free-text `address`, and return the same four ids (and optionally the resolved names for table display).

## 17. Enterprise Recommendations / Open Questions

- Seed the reference data once (e.g. from the national administrative-unit list) and treat it as read-only master data managed by Super Admin.
- Only Viet Nam has the full four-level hierarchy. Singapore, Thailand, Malaysia, Indonesia, Japan, South Korea, Cambodia and Laos have two levels (state/province stored as *City*, city stored as *District*); the other countries have the country only. More countries can be added by extending `WORLD_COUNTRIES` in the generator and re-running it. Viet Nam data uses the 63-province structure (before the 2025 merger), because it still has the district level.
- Add `GET /api/locations/search?q=` later if a single type-ahead is preferred for very large lists.

## 18. Implementation Status

- **Dataset:** `docs/sql/locations-seed.sql` (PostgreSQL, idempotent, UTF-8) creates `Countries`, `Cities`, `Districts`, `Wards` and loads 249 countries (ISO 3166-1), Viet Nam's 63 provinces/cities, 696 districts and 10,051 wards, plus state/province and city data for 8 other countries (314 cities and 4,509 districts in total). Ids are deterministic UUIDv5 values, so every environment gets the same ids. Run: `psql -v ON_ERROR_STOP=1 -f docs/sql/locations-seed.sql <connection>`.
- **Frontend data:** `LocationService` calls the `api/locations/*` endpoints (§16) and caches each URL for the session. The earlier static JSON and placeholder flag were removed; the data is seeded by `seed-geography.sql`.
- **Hospital group drawer:** City / Country text inputs replaced by `boo-location-select` (required). On save the four ids (`countryId`, `cityId`, `districtId`, `wardId`) are sent flat next to `address`; the backend does not store them yet (see §16), and `HospitalGroup` has optional matching fields for when it returns them.
- **Not yet migrated:** hospital, supplier, manufacturer and doctor drawers.
- **Not done (backend):** EF entities / configuration / migration for the four tables and the four endpoints.
