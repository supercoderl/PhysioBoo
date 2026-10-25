# Admission redesign

Route: `/admin/inpatient/admission` · guard `inpatient:admission:read` · page `AdminAdmissionComponent`
(`physio-app/src/app/pages/admin/inpatient/admission/`).

## UX audit and current problems (previous page)

- A 4-step wizard that could only create; no way to see, find, edit or discharge an admission.
- Native `<input type="time">`, hand-rolled patient lookup, raw buttons and hard-coded colours instead of shared components.
- Success screen replaced the page; errors relied on toasts only and a failed submit left no recovery path for a taken bed.

## Information architecture and user journey

Admissions list (server-side search, filters, paging) → row opens a **detail drawer** → **Edit** (form drawer) or **Discharge** (inline panel + confirm dialog). **New admission** opens the same form drawer in create mode.

## Layout

Page header (title, count, Refresh, New admission) · filter bar (search, status, type, department, admitted-between) · filter chips · table · footer with range + pagination. Drawers use the shared 640px `drawer`. The page scrolls with the admin shell; the table only scrolls horizontally on narrow screens.

## Components

`AdminAdmissionComponent` → `AdmissionFormDrawerComponent` (create / edit), `AdmissionDetailDrawerComponent`, helpers in `admission.utils.ts`.
Shared UI: `boo-button`, `boo-search-field`, `boo-filter-chips`, `boo-status-badge`, `boo-pagination`, `boo-empty-state`, `boo-error-state`, `boo-inline-error`, `boo-input`, `boo-checkbox`, `physio-icon`; app components `boo-select`, `boo-datepicker`, `boo-textarea`, `drawer`, `DialogService` confirm, `ToastService`.

## Interaction and states

- Search is debounced (300 ms); every filter resets to page 1; the latest request wins (`switchMap`).
- Loading skeleton, empty (no data / no match with *Clear filters*), forbidden (403), failed with retry, inline refresh error when rows are already shown.
- Form: required fields validate on submit and focus the first invalid field; failed requests keep every entered value. After a failed create with a bed, the bed is cleared and the available-bed list is reloaded.
- Duplicate submit is blocked (`submitting`); discharge asks for confirmation and disables actions while in flight.
- Actions follow permissions: create / update / discharge. Edit and Discharge are offered only while status is `Admitted` (the server rejects them otherwise).

## Responsive and accessibility

Columns collapse by breakpoint (status moves under the patient name on mobile). Dialog roles and labels on drawers, Escape closes (with unsaved-changes confirmation), combobox keyboard support (↑ ↓ Enter) for patient search, `aria-live` counts, `caption`/`scope` on the table, visible focus rings, 40–44 px controls.

## Edge cases

Patient already admitted → server error toast, form kept. Bed no longer available → server error, bed list refreshed. Discharge of an already discharged admission → server error, panel refreshed from the server. Department list not readable → filter shows only "All". Future admission dates are allowed (type `Scheduled`); the API has no date rule.

## Performance and scalability

Server-side paging (20 rows), sorted `-admittedat`; lookups capped at 100 rows; patient search returns 8 rows.

## API contract (existing endpoints used)

| Purpose | Method + URL | Frontend usage |
|---|---|---|
| List / search | `POST /api/admissions/search` (`PagedRequest<{start,end,status,type,departmentId}>`, `search`, `sort`) | list |
| Detail | `GET /api/admissions/{id}` | refresh after save / discharge |
| Admit | `POST /api/admissions` → new id; optional `bedId` + `expectedDischargeDate` assign the bed in the same transaction | form (create) |
| Edit | `PATCH /api/admissions/{id}` (type, department, doctor, referral, clinical text, insurance) | form (edit) |
| Discharge | `POST /api/admissions/{id}/discharge` (`notes`, optional `dischargedAt`) | detail drawer |
| Lookups | `POST /api/patients/search`, departments / doctors search, `GET /api/bed-map/wards`, `POST /api/bed-map/search` (status `Available`) | form |

## Gaps

- No endpoint assigns or moves a bed for an existing admission (bed is chosen at admission only).
- `expectedDischargeDate` is stored on the bed, not returned by the admission API.
- No shared time picker exists; admission time uses `boo-input type="time"`.
- No admission status counts endpoint, so no statistics cards.
- No server-side doctor filter; no cancel transition is exposed (`Cancelled` can only be displayed).
