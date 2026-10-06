# Bed Map Redesign

Route: `/admin/inpatient/bed-map` · Component: `AdminBedMapComponent` + `BedAssignDrawerComponent`
Backend: `BedMapEndpoints` (`physio-server/PhysioBoo.Presentation/Endpoints`)

The page and its contract already existed in the frontend. This document records the backend that now serves it, and the rules the UI relies on.

## 1. UX Audit & Current Problems

- The page called `/api/bed-map/*` endpoints that did not exist.
- `Room` (a clinic room) is not a ward or a bed, so there was nothing to read from.
- No way existed to create wards or beds, so even a working API would show an empty map.

## 2. Information Architecture

```
Bed Map
├── Stats strip (total · available · occupied · maintenance · reserved · occupancy %)
├── Filters (ward · status · floor · search)
├── Ward sections → bed tiles (colour = status)
└── Bed details panel → Assign (Available) · Discharge (Occupied) · History
```

Domain: `Ward` 1—n `Bed` 1—n `BedAssignment` (one row per stay). `Bed.CurrentAssignmentId` points at the open stay.

## 3. User Journey

1. Open the map → one `snapshot` call loads wards, counts and beds.
2. Select an available bed → Assign → pick a patient, optional expected discharge and notes.
3. Select an occupied bed → Discharge. If the stay belongs to an admission, that admission is discharged too.
4. History shows the last 50 stays of the bed.

## 4. Rules the UI can rely on

- A bed can only be assigned while `Available`. Two staff booking the same bed: the second gets `BED_NOT_AVAILABLE` (single atomic `UPDATE … WHERE status = 'Available'`).
- A patient can occupy one bed at a time: `BED_PATIENT_ALREADY_ASSIGNED`. Also enforced by a filtered unique index.
- `Occupied` is never set by editing a bed; only assigning a patient sets it. Occupied beds cannot be edited or deleted (`BED_OCCUPIED`).
- Assign, discharge and the admission update happen in one database transaction.
- `bedType` is shown as `Standard`, `ICU`, `Isolation`, `Pediatric`, `Surgical Recovery`; `status` as `Available`, `Occupied`, `Maintenance`, `Reserved`.

## 5. Page States, Accessibility, Responsive

Unchanged from the existing page (loading spinner, error with Retry, empty history message, disabled buttons while a request runs).

## 6. Edge Cases

- Wards that still have beds cannot be deleted (`WARD_HAS_BEDS`).
- Deleting a bed or ward is a soft delete; stay history is kept.
- A ward's floor is the default floor of its beds.

## 7. Performance & Scalability

`snapshot` is one request with two queries (counts grouped in SQL, beds with ward and patient included). Search is paginated. Add paging per ward if a hospital exceeds a few thousand beds.

## 8. Enterprise Recommendations

- Build an admin UI for wards and beds (the service methods `createWard`, `updateBed`, … exist; there is no screen yet). Until then, populate the map through Swagger.
- Add a "cleaning" bed status and a transfer action (move a patient between beds within one admission).
- Stream snapshot changes (SignalR) so several nurses stations stay in sync.

---

# Proposed API Contract

All responses are wrapped in `ResponseMessage<T>`. Enums are strings.

| Purpose | Method | URL | Request | Response `data` | Permission |
| --- | --- | --- | --- | --- | --- |
| Wards with bed counts | GET | `/api/bed-map/wards` | – | `Ward[]` | `inpatient:bed:read` |
| Wards + beds in one call | GET | `/api/bed-map/snapshot` | – | `{ wards, beds }` | `inpatient:bed:read` |
| Bed totals | GET | `/api/bed-map/stats` | – | `BedMapStats` (`occupancyRate` is a percent) | `inpatient:bed:read` |
| Search beds | POST | `/api/bed-map/beds/search` | `PagedRequest<{wardId,status,floor,search}>` | `PagedResult<Bed>` | `inpatient:bed:read` |
| Get bed | GET | `/api/bed-map/beds/{id}` | – | `Bed` | `inpatient:bed:read` |
| Assign patient | POST | `/api/bed-map/beds/{id}/assign` | `{patientId, expectedDischargeDate?, notes?}` | bed id | `inpatient:bed:assign` |
| Discharge | POST | `/api/bed-map/beds/{id}/discharge` | `{dischargeDate?, notes?}` | bed id | `inpatient:bed:assign` |
| Bed history | GET | `/api/bed-map/beds/{id}/history` | – | `BedHistoryEntry[]` | `inpatient:bed:read` |
| Create ward | POST | `/api/bed-map/wards` | `{code?, name, floor, departmentId?}` | ward id | `inpatient:bed:manage` |
| Update ward | PATCH | `/api/bed-map/wards/{id}` | same | ward id | `inpatient:bed:manage` |
| Delete ward | DELETE | `/api/bed-map/wards/{id}` | – | ward id | `inpatient:bed:manage` |
| Create bed | POST | `/api/bed-map/beds` | `{wardId, number, roomNumber?, floor?, bedType, isolationRequired, notes?}` | bed id | `inpatient:bed:manage` |
| Update bed | PATCH | `/api/bed-map/beds/{id}` | create fields + `status` (not `Occupied`) | bed id | `inpatient:bed:manage` |
| Delete bed | DELETE | `/api/bed-map/beds/{id}` | – | bed id | `inpatient:bed:manage` |

JSON shapes: `shared/types/bed.types.ts`, `ward.types.ts`.

Error codes: `BED_NOT_AVAILABLE`, `BED_NOT_OCCUPIED`, `BED_OCCUPIED`, `BED_PATIENT_ALREADY_ASSIGNED`, `BED_DUPLICATE_NUMBER`, `WARD_HAS_BEDS`, `WARD_DUPLICATE_CODE`, `OBJECT_NOT_FOUND`.
