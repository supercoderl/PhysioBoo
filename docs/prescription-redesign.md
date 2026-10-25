# Outpatient → Prescription — redesign

Route: `/admin/clinic/prescription` (permission `pharmacy:prescription:read`).
Scope rule: the page is built only on endpoints that exist in `physio-server` today. Anything the backend cannot do is listed under *Backend gaps* and is not faked in the UI.

## 1. UX audit (state before this change)

| Finding | Evidence |
|---|---|
| The page could never load a prescription | `prescription.component.ts` called `GET /api/prescriptions/new`; the route is `{id:guid}`. |
| The page was written against an invented contract | Frontend `PrescriptionDraft` is nested (`patient`, `doctor`, `items[].dose`, `items[].warnings`); the real `PrescriptionDraftViewModel` is flat (`patientName`, `items[].dosageInstructions`, `items[].clinicalWarnings`). |
| Several actions called URLs/bodies the API does not expose | create `POST /api/prescriptions` (real: `/create`), issue sent a body (real: none), `GET /api/medicines` (does not exist), `PUT` sent the whole draft (real: `UpdatePrescriptionViewModel`). |
| Invented clinical values | Patient height/weight/flags, `stockStatus`, `isAntibiotic`, `isHighAlert`, `isOtc`, "Oral" route default, `insuranceCovered: true` default, autosave of clinical data. |
| No visit/patient entry point | Nothing links Doctor Desk or the patient record to the page. |
| Native `<input type="checkbox">`, hand-built modal preview | Shared `boo-checkbox`, `drawer` exist. |

## 2. Current problems → decisions

* Replace the invented model with the real one (`shared/types/prescription-rx.types.ts`).
* No autosave: edits are held locally and saved explicitly (one in-flight request at a time), so a failed save never loses input and a clinician always knows what is persisted.
* No fabricated values: strength, dosage form, unit and unit price are entered by the prescriber because the medicine search returns none of them.
* Remove the speculative sidebar (favourites, templates, cost estimate, patient risk flags): their payloads were never reconciled with the item model and cannot be filled from real data on this screen.

## 3. Information architecture

```
Prescription page
├─ Entry A  ?id=<prescriptionId>          → prescription workspace
├─ Entry B  ?patientId=<patientId>        → patient's prescriptions (pick one)
└─ Entry C  (no params)                   → empty state explaining how to open one
Workspace
├─ Header: number, status badge, patient, doctor, date, valid-until
├─ Details: diagnosis, instructions  (editable only while Draft)
├─ Medications: table + add/edit drawer (editable only while Draft)
├─ Clinical warnings (stored warnings + on-demand check)
└─ Sticky footer: Save changes · Issue · Cancel prescription
```

## 4. User journey

1. Doctor opens a prescription (from a patient's prescription list or a direct link).
2. Reviews header and medications. If `Draft` and allowed: edits diagnosis/instructions, adds/edits/removes medications.
3. Optionally runs **Check warnings** (allergy / duplicate check).
4. **Save changes** → server persists → page reloads the server copy.
5. **Issue** (needs a saved draft with ≥1 item) → confirmation → status `Issued`.
6. **Cancel prescription** (Draft or Issued) → reason drawer → status `Cancelled`.

## 5. Layout and wireframe (desktop first)

```
┌ Breadcrumb ───────────────────────────────────────────────┐
│ Prescription RX-0001  [Draft]                  [Refresh]  │
│ Patient · Doctor · 21 Oct 2026 · Valid until …            │
├───────────────────────────────────────────────────────────┤
│ Alerts: stored critical warnings / unsaved changes        │
├───────────────────────────────────────────────────────────┤
│ Details            │ diagnosis (textarea) instructions    │
├───────────────────────────────────────────────────────────┤
│ Medications (n)                      [Check] [Add medicine]│
│ table: medicine · dosage · frequency · duration · qty ·   │
│        price · warnings · actions                          │
├───────────────────────────────────────────────────────────┤
│ sticky: total · [Cancel prescription] [Save] [Issue]       │
└───────────────────────────────────────────────────────────┘
```

## 6. Component hierarchy

* `AdminPrescriptionComponent` (page, route params, load/save/issue/cancel orchestration)
  * `PrescriptionActionBarComponent` `rx-action-bar` (title, status, unsaved marker, refresh)
  * `PrescriptionPatientListComponent` `rx-patient-list` (Entry B)
  * `PrescriptionPatientSummaryComponent` `rx-patient-summary`
  * `PrescriptionDiagnosisSectionComponent` `rx-details-form` (diagnosis, instructions)
  * `PrescriptionMedicationTableComponent` `rx-medication-table` (lines + warnings)
  * `PrescriptionMedicationDrawerComponent` `rx-medication-drawer` (medicine search, line form)
  * `PrescriptionCancelDrawerComponent` `rx-cancel-drawer` (reason form)
  * `PrescriptionFooterComponent` `rx-footer` (save, issue, cancel)

Shared UI used: `boo-button`, `boo-input`, `boo-checkbox`, `boo-search-field`, `boo-status-badge`, `boo-empty-state`, `boo-error-state`, `boo-inline-error`, `physio-icon`, `boo-select`, `boo-textarea`, `drawer`, `admin-breadcrumb`, `DialogService` (confirmation), `ToastService`. No shared pagination is needed: the list endpoint is not paged by the client. The shared library has **no date picker or select**; the app-level `boo-select` / `boo-datepicker` are used where such fields exist (the date picker is not needed on this page: `validUntil` is not editable through the API).

## 7. UI specification

* Tokens/classes follow Doctor Desk (`bg-surface`, `border-borderGray`, `text-regular`, `text-secondary`, `rounded-xl`).
* Status tone: Draft → neutral, Issued → primary, Dispensed → success, PartiallyDispensed → warning, Expired → warning, Cancelled → danger.
* Severity tone: Mild → neutral, Moderate → warning, Severe/Critical → danger.
* Quantities and prices use tabular numerals; currency is not assumed (the API sends no currency), so amounts are shown as plain numbers.

## 8. Interaction design

* Editing is allowed only when `status === Draft` **and** the user holds `pharmacy:prescription:update`.
* Medicine search is debounced (300 ms), min 2 characters, backed by `GET /api/pharmacy/inventory/medicines/search` (needs `pharmacy:medicine-inventory:read`; without it the drawer says so and the item cannot be added).
* Unsaved changes are marked in the header; **Issue** is disabled while dirty (the server issues the stored copy).
* Every mutation disables its trigger while in flight (no double submit). Failed requests leave all form values in place and show the server message.
* Destructive/irreversible actions (issue, cancel, remove medication) use confirmation.
* Keyboard: all controls are native buttons/inputs or shared components; drawers trap focus via the shared `drawer`.

## 9. Responsive behaviour

Desktop: details in two columns, full items table. Tablet: details stack; table keeps horizontal scroll inside its card. Mobile: footer actions wrap; table scrolls horizontally (a table, not a card list, to keep dosage columns comparable).

## 10. Accessibility

Labelled controls, `aria-live` for save/reload status, `role="alert"` for errors, status never conveyed by colour alone (text label + dot), 44 px minimum targets on footer actions, drawers labelled via `aria-labelledby`.

## 11. Page states

Loading skeleton · empty (no params / patient without prescriptions) · error with retry · forbidden (403) · not found (404) · read-only (non-Draft or no update permission) · dirty · saving · issuing/cancelling · success toasts.

## 12. Edge cases

* Duplicate medicine in one draft → allowed by API but flagged inline ("already on this prescription").
* Draft with zero items → cannot be issued.
* Item referencing a medicine the user cannot search (no inventory permission) → existing items stay editable; new medicine cannot be chosen.
* Stored warnings come back with numeric `Severity` (no JSON enum converter configured); the UI normalises numbers and strings.
* `PUT` replaces the item set: items missing from the payload are deleted server-side, so the page always sends the complete list.

## 13. Performance, scalability

Single GET per workspace, request cancellation with `switchMap` for search, signals + `OnPush`-friendly inputs. Patient prescription list is unpaged on the server; the table is rendered as-is (typical volumes are small) — see gaps.

## 14. Proposed API contract

Existing endpoints used (no new backend implied):

| Purpose | Method + URL | Request | Response | Frontend use |
|---|---|---|---|---|
| Load prescription | `GET /api/prescriptions/{id}` | – | `PrescriptionDraftViewModel` | workspace |
| Save draft | `PUT /api/prescriptions/{id}` | `{id, diagnosis, instructions, items[]}` | `Guid` | Save changes |
| Issue | `POST /api/prescriptions/{id}/issue` | – | `Guid` | Issue |
| Cancel | `POST /api/prescriptions/{id}/cancel` | `{reason}` | `Guid` | Cancel |
| Warning check | `POST /api/prescriptions/cds-check` | `{patientId, items[], excludePrescriptionId}` | `Record<itemKey, warning[]>` | Check warnings |
| Medicine search | `GET /api/pharmacy/inventory/medicines/search?search&pageNumber&pageSize` | – | paged `MedicineStockViewModel` | item drawer |
| Patient's prescriptions | `GET /api/medical-records/{patientId}/prescriptions` | – | paged `PrescriptionViewModel` | Entry B |

Proposed additions (**not implemented, backend owners to decide**):

| Gap | Proposal |
|---|---|
| Cannot create from a visit | `POST /api/appointments/{id}/prescriptions` that derives patient, doctor, hospital and medical record from the appointment and generates `PrescriptionNumber` server-side. Today `POST /api/prescriptions/create` needs `medicalRecordId`, `hospitalId` and a client-made `prescriptionNumber`, and no API returns the first two for an appointment. |
| Cannot find a visit's prescription | `GET /api/appointments/{id}/prescriptions` or an `appointmentId` filter on the patient list. |
| Medicine detail for prescribing | include `strength`, `dosageForm`, `unit`, `unitPrice`, `isControlledSubstance` in the medicine search result. |
| Acknowledge warnings | expose `AcknowledgeClinicalWarningCommand` (exists, no endpoint). Issue is blocked by unacknowledged *Critical* stored warnings. |
| Valid-until / refills | not updatable through `UpdatePrescriptionViewModel`. |

## 15. Enterprise recommendations

Audit log of issue/cancel; server-side prescription numbering; server-side item price lookup; paged patient prescription list; acknowledge-warning endpoint; a visit-scoped create endpoint.
