# Super Admin — Dev Data Generator

**Path:** `/superadmin/platform/dev-data`
**Parent doc:** `superadmin-redesign.md`. **Siblings:** `superadmin-platform-redesign.md`.
**Audience:** the platform owner, in Development environments only.
**Status:** implemented end to end for `hospital-structure` (frontend + backend, untested: not built or run by me).

> **Revision 2 (supersedes the parts below that mention tagging, counts and clearing).**
> Generated rows are written **straight into the real tables** (`Departments`, `Rooms`, `Hospitals`, …). There is **no `Sys_GeneratedData` table, no migration, no per-module counts and no Clear / Clear all**. There is no undo from the page; reset the development database to start over.
> Only two endpoints exist: `GET /api/superadmin/dev-data/modules` and `POST /api/superadmin/dev-data/{moduleKey}/generate` (§14.1, §14.3). §14.2, §14.4, §14.5, the Clear and "N generated" parts of §6-§9 and §12-§13 no longer apply; each card shows the last result instead.
> The backend lives in `PhysioBoo.Infrastructure/Database/DevData/` (one `IDevDataModule` per module, `DevDataService` resolves parents) with `DevDataEndpoints` in Presentation. Rows are saved with `SaveSeedChangesAsync` and an explicit `TenantId`, because `SaveChangesAsync` would stamp the logged-in user's tenant. The owner account has no tenant, so generated rows only show in `/admin` for an admin of the chosen tenant.
> **Implemented modules:** `hospital-structure` (branches, departments, rooms). Others (patients, doctors, appointments, medicines, prescriptions, admissions, lab, radiology, billing) are added one generator at a time.

---

## 1. Purpose

Fill a tenant with realistic fake data in one click per module, so the owner can develop and demo every `/admin` screen without hand-entering records. Generated rows are tracked so they can be removed again without touching real data.

Agreed decisions:

| Decision | Choice |
|---|---|
| Where generation runs | Backend endpoint (not the browser looping over create APIs) |
| Backend structure | One generator class per module behind a registry; Bogus builds the values through the entity constructors |
| Missing parent data | Auto-create the parents, then link to them |
| Cleanup | Every generated row is recorded in `Sys_GeneratedData`; bulk delete per module or for everything |
| Environment | Tool is off outside Development; the server reports this and the page disables itself |
| Target | One tenant (hospital group) chosen on the page; all rows get that `TenantId` |

## 2. UX Audit — Current State

| Area | Finding |
|---|---|
| Existing seeding | `DatabaseSeeder.SetDevelopmentDataAsync` creates one tenant, one hospital and one admin at startup. It runs once, covers no clinical module, and cannot be re-run on demand. |
| Hand entry | Populating a module for a demo means creating each record through its drawer: patients, doctors, medicines, appointments and so on, in the right order. |
| Super Admin | No page exists for developer tooling. |

## 3. Current Problems (to fix)

1. No way to get a populated tenant without manual entry.
2. No way to repeat or undo a seeding run.
3. Dependent data (an appointment needs a patient, a doctor and a hospital) must be created by hand in the right order.

## 4. Information Architecture

```
Platform
├── /platform/sequence-rules
├── /platform/localization
└── /platform/dev-data        ← new
    ├── Target tenant + row count (shared inputs)
    ├── Module grid (one card per module)
    └── Generated data summary + clear actions
```

Sidebar entry: the owner adds an `AdminMenus` row (route `/superadmin/platform/dev-data`), as for the other Super Admin pages.

## 5. User Journey

1. Open the page. The server reports `enabled: true` and the module list.
2. Pick the target tenant (default: the dev tenant) and the row count (default 50).
3. Click **Generate** on a module card (for example Appointments).
4. A result toast and the card summary show what was created, including auto-created parents ("50 appointments · created 10 patients, 5 doctors").
5. Open `/admin` as that tenant and the data is there.
6. Later, click **Clear** on one module, or **Clear all generated data**, and confirm.

## 6. Layout

```
┌ superadmin-page-header: "Dev data generator" ──────────────────────────┐
├ warning note: Development only · writes real rows · tagged for cleanup ┤
├ Controls card ─────────────────────────────────────────────────────────┤
│  Tenant [select ▾]      Rows per module [ 50 ]  (1–1000)               │
├ Module grid (3 cols desktop · 2 tablet · 1 mobile) ────────────────────┤
│ ┌ Patients ───────┐ ┌ Doctors ────────┐ ┌ Appointments ─────────────┐  │
│ │ 120 generated   │ │ 15 generated    │ │ 0 generated               │  │
│ │ needs: –        │ │ needs: Hospital │ │ needs: Patients, Doctors  │  │
│ │ [Generate][Clear]│ │ [Generate][Clear]│ │ [Generate][Clear]         │  │
│ └─────────────────┘ └─────────────────┘ └───────────────────────────┘  │
├ Footer bar (sticky): total generated · [Clear all generated data] ─────┤
└────────────────────────────────────────────────────────────────────────┘
```

Uses the shared pattern: `superadmin-page-header`, `bg-surface rounded-2 border border-borderGray/60` cards, `boo-select`, the same input styling as `ip-access`.

## 7. Component Hierarchy

```
SuperadminDevDataComponent                       (page: pages/superadmin/platform/dev-data/)
├── SuperadminPageHeaderComponent                (existing)
├── dev-data controls (tenant boo-select + count input)   inline in the page
├── SuperadminDevDataModuleCardComponent         (components/layout/superadmin/platform/) one per module
└── DialogService (confirm clear) · ToastService (results)   (existing)

DevDataService (services/admin/dev-data.service.ts)   HTTP + placeholder fallbacks
Types (shared/types/dev-data.types.ts)                 DevDataModule, DevDataResult, DevDataSummary
```

The module card is the only new reusable component: it is rendered once per module and owns the button states.

## 8. UI Specification

- **Controls:** tenant `boo-select` (searchable list from `HospitalGroupService`), numeric input `min=1 max=<server max> step=1`, helper text "Applies to every module you generate".
- **Module card:** title, one-line description, `needs:` chips for dependencies, "N generated" count, primary **Generate** button, tertiary **Clear** button (danger text, shown only when N > 0).
- **Status badge on the card:** `Idle`, `Generating…`, `Done`, `Failed` (colour + text, never colour alone).
- **Clear all:** sticky footer button, danger outline, opens the confirmation dialog with the row count and a warning that dependent rows go too.
- Tokens only (`text-regular`, `border-borderGray`, `text-danger`, `bg-primary`); no new colours.

## 9. Interaction Design

- **Generate:** disabled while any request runs (one at a time per page, so the card summaries stay consistent) or while no tenant is selected or the count is invalid. The clicked card shows a spinner and `Generating…`. On success: toast "Created 50 appointments (and 10 patients, 5 doctors)", the card counts refresh. On failure: toast with the server message, card shows `Failed` and keeps a Retry label on the button.
- **Clear (module):** confirm dialog "Delete 120 generated patients? Appointments, prescriptions and other generated rows that reference them are removed too." → delete → refresh counts.
- **Clear all:** same dialog, total count.
- **Keyboard:** all controls are native buttons/inputs in DOM order; Enter in the count field does nothing (it never submits implicitly); focus returns to the clicked card button after the action; dialogs use the existing `DialogService` focus trap.
- **Debounce:** none needed, no search input.

## 10. Responsive Behaviour

Desktop first: 3-column card grid and horizontal controls. Tablet: 2 columns. Mobile: single column, controls stack, footer bar becomes a static block above the bottom edge. Touch targets are at least 36px high (`h-9`), matching `ip-access`.

## 11. Accessibility

- Cards are `<section aria-labelledby>`; the status badge is announced through an `aria-live="polite"` region on the page ("Appointments: 50 rows generated").
- Disabled buttons carry `aria-disabled` and a visible reason in the helper text (no tenant chosen, request running).
- Danger actions use text plus colour. Contrast follows the existing tokens (AA).
- The warning note uses `role="note"` as on `ip-access`.

## 12. Page States

| State | Behaviour |
|---|---|
| Loading | Skeleton cards (same grid) while `GET /modules` and the tenant list load |
| Disabled (non-Development) | Single empty state: "The generator is switched off on this server." All controls hidden |
| Empty tenant list | Empty state linking to Tenants |
| Idle / Generating / Done / Failed | Per card, see §8 |
| Counts failed to load | Cards render without counts and a retry link in the note |

## 13. Edge Cases

- **Global master data** (lab tests, imaging modalities, appointment types, specialties, insurers, manufacturers, suppliers) is owned by Super Admin and is not generated. A module that needs it uses the existing rows; if there are none, the call returns a warning ("No lab tests exist; add them under Master Data") and the module is skipped rather than failing silently.
- Count above the server maximum is rejected client-side and server-side (400).
- Repeating **Generate** on a module adds another batch; it does not replace the previous one.
- Parents auto-created for a module are tagged under their own module, so **Clear patients** also removes patients created as parents of appointments.
- Clearing a module removes its dependants first (reverse of the dependency order), inside one transaction. Real rows referencing generated rows block the delete and are reported.
- Concurrent generate from two sessions is allowed; batches are independent.
- A failure mid-run rolls the whole request back (one transaction per request), so no half-built batch remains.

## 14. Proposed API Contract

Do NOT assume these exist. Backend is implemented by the owner. All endpoints require Super Admin. **Never answer 403/404 for "disabled" or "unknown module": the app's HTTP interceptor redirects those statuses to the exception pages.** `GET /modules` answers `200` with `enabled: false`; the other endpoints answer `400` with `success: false` and a message.

### 14.1 Status and module list
- **Purpose:** tell the page whether the tool is on and which modules exist.
- **Method / URL:** `GET /api/superadmin/dev-data/modules`
- **Request:** none
- **Response:**
```json
{
  "success": true,
  "data": {
    "enabled": true,
    "maxRows": 1000,
    "modules": [
      {
        "key": "appointments",
        "label": "Appointments",
        "description": "Visits with a patient, doctor and appointment type.",
        "dependsOn": ["patients", "doctors"]
      }
    ]
  }
}
```
- **Frontend usage:** builds the card grid and the count input maximum. Adding a module needs no frontend change.

### 14.2 Generated counts
- **Purpose:** show "N generated" per module for a tenant.
- **Method / URL:** `GET /api/superadmin/dev-data/summary?tenantId={guid}`
- **Response:** `{ "success": true, "data": { "total": 215, "byModule": { "patients": 120, "appointments": 0 } } }`
- **Frontend usage:** card counts, Clear visibility, footer total. Refetched after every generate or clear.

### 14.3 Generate
- **Purpose:** create N rows of a module (and any missing parents) for a tenant.
- **Method / URL:** `POST /api/superadmin/dev-data/{moduleKey}/generate`
- **Request:** `{ "tenantId": "guid", "count": 50 }`
- **Response:**
```json
{
  "success": true,
  "data": {
    "batchId": "guid",
    "created": { "appointments": 50, "patients": 10, "doctors": 5 },
    "warnings": []
  }
}
```
- **Errors:** `400` count out of range, unknown tenant, unknown module, or generator disabled.
- **Frontend usage:** toast text from `created`; `warnings` shown as an info alert under the card.

### 14.4 Clear a module
- **Purpose:** delete generated rows of one module and everything generated that depends on it.
- **Method / URL:** `DELETE /api/superadmin/dev-data/{moduleKey}?tenantId={guid}`
- **Response:** `{ "success": true, "data": { "deleted": { "patients": 120, "appointments": 80 } } }`
- **Frontend usage:** confirm dialog, then toast and refresh.

### 14.5 Clear all
- **Purpose:** delete everything generated for a tenant.
- **Method / URL:** `DELETE /api/superadmin/dev-data?tenantId={guid}`
- **Response:** same shape as 14.4.
- **Frontend usage:** footer button.

### 14.6 Backend notes (informational, not implemented by the frontend)
- `Sys_GeneratedData(Id, TenantId, Module, EntityType, EntityId, BatchId, CreatedAt)` records every inserted row.
- `IModuleDataGenerator { Key; Label; Description; DependsOn; GenerateAsync(tenantId, count, ctx) }`, resolved by a registry that orders dependencies and passes the context so a parent generated earlier in the same request is reused.
- First release: hospital structure (hospital, departments, rooms), patients, doctors, appointments, medicines and inventory, prescriptions, admissions and beds, laboratory, radiology, billing and cashier.

## 15. Performance Considerations

- Backend batches inserts (`AddRange`, one `SaveChanges` per module per request); max 1000 rows per call.
- The frontend sends one request at a time and shows a spinner; no polling. If a run is slow, a long-running job endpoint can be added later without changing the card UI.
- The module list and summary are two small requests; the summary is the only one refetched.

## 16. Scalability

- New module = new generator class on the server; the page is driven by `GET /modules`, so the UI needs no change.
- The dependency graph lives in one place (`dependsOn`), shared by generation order and clear order.
- If generation time grows, the contract can move to a job id plus a status endpoint; the card's `Generating…` state already models this.

## 17. Enterprise Recommendations

- Keep the tool server-gated to Development and never ship the sidebar row to production databases.
- Audit log entries for generate and clear (who, tenant, module, count) so a shared dev database stays explainable.
- Tag demo tenants by name so generated data is never mistaken for a customer.
- Later: seed profiles ("Small clinic", "Large hospital") that run several modules with set counts.

## 18. Frontend Deliverables (Phase 4)

| Item | Path |
|---|---|
| Page | `pages/superadmin/platform/dev-data/dev-data.component.ts` |
| Module card | `components/layout/superadmin/platform/dev-data-module-card.component.ts` |
| Service | `services/admin/dev-data.service.ts` (placeholder responses while the API is missing) |
| Types | `shared/types/dev-data.types.ts` |
| Route | `superadmin.routes.ts` → `platform/dev-data` |
| API constants | `shared/api/base.ts` → `BASE_API.DEVDATA` |

**Placeholder mode:** `DevDataService` has an `API_READY` flag (currently `false`). While false it sends no requests and simulates modules, counts, generate and clear in memory, including the parent auto-creation rule, so the page can be exercised before the backend exists. Set it to `true` once §14 is implemented.
