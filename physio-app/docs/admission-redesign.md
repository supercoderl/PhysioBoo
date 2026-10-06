# Admission Redesign

Route: `/admin/inpatient/admission` · Component: `AdminAdmissionComponent`
Backend: `AdmissionEndpoints`; shares its bed logic with Bed Map (see `bed-map-redesign.md`).

## 1. UX Audit & Current Problems

- The 4-step wizard was a mock: it logged the form and showed an `alert()`. Nothing was saved.
- The admission number was generated on the client with a random suffix (possible duplicates).
- Step 1 mixed **patient registration** (name, date of birth, address, emergency contact…) with the admission, creating a second path to register people.
- Department, doctor, ward type and bed were hard-coded lists. "Save Draft" did nothing.

## 2. Information Architecture

```
Admission wizard
1 Patient           → pick an existing patient
2 Admission details → date/time · type · referred by · department · doctor · ward → bed · expected discharge
3 Medical info      → chief complaint · provisional diagnosis · allergies · medications · history
4 Insurance         → has insurance · provider · policy number
→ Confirmation (admission number, bed)
```

## 3. User Journey

Search patient → fill details (optionally choose a free bed) → medical info → insurance → Submit. The server assigns the admission number (`ADM-…`), creates the admission and, if a bed was chosen, claims the bed in the same transaction. A new patient is registered in CRM → Patient first.

## 4. Decisions

- **Existing patients only.** Patient registration stays in one place (the Patient module).
- **Number assigned by the server** from the sequence tracker (`EntityType = Admission`).
- **One active admission per patient** (`ADMISSION_ALREADY_ADMITTED`, plus a filtered unique index).
- **Bed is optional.** An admission without a bed is valid (e.g. emergency waiting). A bed can be assigned later from Bed Map; that stay is not linked to the admission.
- **Discharge** from the admission frees the bed; discharging the bed from Bed Map ends the linked admission. Both run in one transaction.
- "Save Draft" was removed: there is no draft concept on the server.

## 5. Page States, Accessibility, Responsive

- Each step's Next button is disabled with a hint until required fields are filled; Submit shows "Submitting…" and is disabled while pending.
- All inputs have labels; the step list is an `<ol>` with `aria-current`; the success panel is `role="status"`.
- Ward and bed lists show "Loading beds…" / "No free beds"; API errors are toasted by the global interceptor.
- Layout is one column on mobile, two or three columns from `md`.

## 6. Edge Cases

- Bed taken by someone else while the form is open → `BED_NOT_AVAILABLE`; nothing is saved (the admission is not created either).
- Editing or discharging a discharged admission → `ADMISSION_NOT_ADMITTED`.
- Insurance provider is required only when "has insurance" is checked.

## 7. Performance & Scalability

Lookups load once (100 departments, 100 doctors, wards); beds load per selected ward; patient search is debounced and cancels stale requests. Admission search is paginated and indexed on status, date, department and doctor.

## 8. Enterprise Recommendations

- Add a list/board of active admissions (the search endpoint exists; there is no screen yet).
- Replace the doctor/department 100-item lookups with typeahead if the lists grow.
- Link bed transfers to the admission and add an ADT (admit/discharge/transfer) audit trail.

---

# Proposed API Contract

| Purpose | Method | URL | Request | Response `data` | Permission |
| --- | --- | --- | --- | --- | --- |
| Search admissions | POST | `/api/admissions/search` | `PagedRequest<{start,end,status,type,departmentId}>` | `PagedResult<Admission>` | `inpatient:admission:read` |
| Get admission | GET | `/api/admissions/{id}` | – | `Admission` | `inpatient:admission:read` |
| Admit patient | POST | `/api/admissions` | `CreateAdmissionRequest` (incl. optional `bedId`, `expectedDischargeDate`) | admission id | `inpatient:admission:create` |
| Update details | PATCH | `/api/admissions/{id}` | `UpdateAdmissionRequest` | admission id | `inpatient:admission:update` |
| Discharge | POST | `/api/admissions/{id}/discharge` | `{dischargedAt?, notes?}` | admission id | `inpatient:admission:discharge` |

JSON shapes: `shared/types/admission.types.ts`. Times are local wall-clock strings without a timezone.

Error codes: `ADMISSION_ALREADY_ADMITTED`, `ADMISSION_NOT_ADMITTED`, `ADMISSION_INSURANCE_DETAILS_REQUIRED`, `BED_NOT_AVAILABLE`, `OBJECT_NOT_FOUND`.

Prerequisite data: `Sys_SequenceTrackers` row for `Admission` (prefix `ADM-`).
