# Nursing — Patient Detail (`/admin/nursing/patient/:patientId`)

Scope: the patient chart page only. The nursing dashboard and handover pages are not covered here.

## Context and data
- Route param is `patientId` (the patient's id, not the admission id). Guarded by `inpatient:nursing:read`.
- The header comes from `GET /api/nursing/patients/{patientId}`; it only resolves for a patient with an **active admission**, otherwise the API answers 404.
- Allergy names, diagnosis and admission date come from `GET /api/treatment-sheet/patients/{patientId}/summary` and are shown only to users with `inpatient:treatment-sheet:read`. Without it, the header shows the allergy **flag** only.

## Page states
| State | Trigger | UI |
|---|---|---|
| Loading | first request | skeleton + `role=status` text |
| Invalid | route param is not a GUID | empty state, no request sent |
| Not found | 404 or empty `data` | empty state, back to dashboard |
| Forbidden | 403 | empty state naming the missing permission |
| Failed | any other error | error state with retry |
| Refresh failed | header or tab refresh fails | previous data stays; inline error with retry (tabs) |

## Layout
Sticky header (identity, ward/bed, doctor, acuity, risk badges, allergy banner, tabs) over six tabs: Overview, Vitals, Medications, Intake & output, Tasks, Notes. Opened tabs stay mounted so unsaved input survives tab switches and Refresh. Tabs follow the WAI-ARIA tab pattern (arrow keys, Home/End).

## Actions and rules
| Action | Endpoint | Permission | Notes |
|---|---|---|---|
| Record vitals | `POST /nursing/patients/{id}/vitals` | `nursing:write` | Client checks the server ranges (SBP 40–300, DBP 20–200, HR 20–300, Temp 30–45, RR 4–80, SpO2 40–100). No default values. Time, author and abnormal flag are set by the server. |
| Give / miss a dose | `PATCH /nursing/mar/{id}` | `nursing:write` | Confirmation first; only `Due` doses. Row is replaced with the server response. No reason text is sent. |
| Complete a task | `PATCH /nursing/tasks/{id}` | `nursing:write` | Confirmation first; only `Pending`/`Overdue`. |
| Record intake/output | `POST /nursing/patients/{id}/io` | `nursing:write` | Volume 1–10,000 mL, notes ≤ 500. |
| Add a note | `POST /nursing/patients/{id}/notes` | `nursing:write` | ≤ 4,000 characters; draft kept on failure. |

Every submit is guarded against double submission; forms keep their values when the request fails. Controls for write actions are hidden without `nursing:write`.

## Known limitations
- The nursing API exposes only an allergy flag, not allergy details; there is no nursing endpoint for allergies, diagnoses or clinical history beyond notes.
- Missed/held doses cannot carry a reason from this page yet (the endpoint accepts one; no input is offered). Held and Refused are not offered.
- Task cancellation is supported by the endpoint but not offered.
- Intake/output balance is computed from the entries on screen, not from a server total; the UI says so.
- Overview shows the first page (50) of tasks, doses, vitals and I/O.
- `boo-select` and `boo-textarea` are app components, not exports of `@physioboo/ui`; the library has no select, textarea or date-picker.
