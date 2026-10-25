# Reception registration redesign (`/admin/reception/registration`)

Status: implemented in `physio-app/src/app/pages/admin/reception/registration/`.

## Problems with the previous page
- A 4-step wizard for ~12 real fields, with random pre-filled values (`randomText`, `randomEmail`) and a hardcoded
  default doctor id, and a leftover static "Registration complete" block rendered above the wizard.
- Sent `address`, `city`, `postalCode` as required although the server stores none of them.
- Free-text inputs for doctor / hospital GUIDs; invented income, appointment-time and communication option lists.
- Reset the form with `confirm()`, no existing-patient lookup, no duplicate handling.

## Workflow
1. **Find an existing patient** (debounced, 2+ characters, stale responses dropped with `switchMap`).
2. **Single form**, grouped: Patient, Contact, Care (primary doctor, occupation); Insurance and Medical background are
   collapsed optional sections.
3. **Submit**: client validation → search by the entered phone number → if someone matches, show them and require
   "Register anyway" → `POST /api/patients` → read the generated patient number back.
4. **Done state**: links to bookings and patient records (only when the user holds the permission), "Register another".

## API contract used (existing)
| Purpose | Call | Permission |
|---|---|---|
| Search patients | `POST /api/patients/search` (`search` text, full-text on the server) | `reception:patient:read` |
| Register | `POST /api/patients` (`CreatePatientViewModel` + `profile`) | `reception:patient:register` |
| Read patient number | `GET /api/patients/{id}` | `reception:patient:read` |
| Doctors for primary doctor | `POST /api/doctors/search` | existing |

Server-required fields: first/last name, date of birth (1900 – today), gender, blood group, marital status, email,
phone (`^\+?[0-9][0-9\s\-().]{5,19}$`), primary doctor.

## Limitations
- The server has no duplicate rule. The phone-number check is a client-side prompt only; it never blocks.
- The server accepts but does not persist address/city/postal code, so they are not collected.
- The booking page cannot be opened with a patient preselected, so follow-up links go to the booking list.
- Referral and preferred hospital/doctor fields were removed (no lookups exist for them in this flow).

## Accessibility and responsive
Labels bound to every control, `aria-invalid` + `aria-describedby` messages, focus moves to the first invalid field, the
duplicate warning and the success panel. One column on mobile, two on tablet, three on desktop for the Patient group;
sticky action bar; no fixed heights.
