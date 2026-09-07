# Prescription Page Redesign — Enterprise HIS/EMR Specification

**Path:** `admin/clinic/prescription`
**Current implementation:** `src/app/pages/admin/clinic/prescription/prescription.component.ts` (single inline-template component, local state only, no API integration)
**Scope:** Frontend UI/UX only. No backend, no DB schema, no stack/library recommendations — reuses this app's existing component conventions (`DrawerComponent`, `StatusBadgeComponent`, `BooSelect`, `BooInput`, `DialogService`, `ToastService`, Tailwind, Lucide icons, signals).

---

## 1. UX Audit — Current State

| Area | Current Implementation | Problem |
|---|---|---|
| Layout | 3-col/2-col split, single scroll | No persistent header/footer; doctor must scroll back up to find patient context or scroll down to issue |
| Patient info | Name, age, gender, phone only | No allergies, no chronic conditions, no risk flags — the data a doctor needs *before* prescribing is missing |
| Diagnosis | Free-text code + description list | No ICD-10 autocomplete, no link to encounter diagnosis already captured elsewhere in the EMR |
| Medications | Repeating card list + inline add form | Doesn't scale past ~5 items; no table semantics (sort/filter/search); dosage timing (morning/noon/evening) isn't modeled at all |
| Clinical safety | None | No allergy/interaction/duplicate/dose warnings — the single highest-value feature for an EMR is absent |
| Data model | `Medication` has only `name/dosage/frequency/duration/instructions/quantity` | Missing generic name, strength, route, dosage form, stock, insurance, controlled-substance flag — can't represent a real prescription |
| Actions | Save Draft / Preview / Issue, calls `alert()` | No autosave, no unsaved-changes guard, no loading/error states, not wired to any service |
| Keyboard | None | Mouse-only; a doctor writing 5+ prescriptions/hour needs full keyboard flow |
| Responsiveness | Grid collapses awkwardly | Medication cards become unreadable below ~768px; no defined tablet/mobile behavior |

**Root cause:** the page was built as a form, not as a clinical workspace. An enterprise HIS prescription screen needs to behave like a data-table-driven dashboard with embedded decision support, not a stacked form.

---

## 2. Information Architecture

```
Prescription Page
├── Sticky Action Bar (top)
│   ├── Prescription identity (ID, status, date, visit/queue)
│   ├── Doctor identity (avatar, name, dept, license no.)
│   └── Primary actions (Save Draft, Preview, Print, Issue, Cancel)
├── Patient Summary Card (below action bar, collapsible on scroll)
│   ├── Identity + vitals (age, DOB, height, weight, BMI, blood type)
│   ├── Contact + insurance
│   └── Risk/warning badge row (allergy, pregnancy, pediatric, elderly, high-risk, controlled-drug restriction)
├── Diagnosis Section (collapsible)
│   ├── Primary / secondary diagnosis + ICD-10
│   └── Clinical notes / symptoms (expand-collapse)
├── Main Workspace (2-column on desktop)
│   ├── Medication Management Table (primary, ~70% width)
│   │   ├── Toolbar: search, filters, Add Medication, column controls
│   │   ├── Sticky-header data table with inline edit + CDS warnings
│   │   └── Prescription Summary strip (totals, cost, coverage)
│   └── Right Sidebar (sticky, ~30% width)
│       ├── Diagnosis recap
│       ├── Clinical alerts feed
│       ├── Recent prescriptions (this patient)
│       ├── Favorite medications / templates
│       └── Doctor notes (scratch pad)
├── Add/Edit Medication Drawer (overlay, triggered from table)
└── Sticky Footer
    └── Save Draft / Preview / Print / Issue Prescription
```

**Key IA decision:** the medication table is the single source of truth on-page; the drawer is only used for adding/editing one line, never for viewing. This keeps the doctor's eyes on one surface (the table) for 90% of the workflow.

---

## 3. Page Layout & Wireframe Descriptions

### 3.1 Sticky Action Bar
- **Position:** `position: sticky; top: 0`, full width, height ~64px, elevated with `shadow-sm` on scroll.
- **Left cluster:** Prescription ID (monospace), `StatusBadgeComponent` (Draft=neutral, Issued=success, Cancelled=danger, Expired=warning), date.
- **Center cluster:** Doctor avatar (32px) + name + department, license number as a muted sub-line; Visit ID and Queue Number as small tags.
- **Right cluster:** secondary actions as icon+text buttons (Save Draft, Preview, Print) followed by a visually dominant primary button (Issue Prescription) and a destructive text-link (Cancel Prescription) gated behind confirmation dialog.
- Bar never disappears; on narrow viewports it collapses to ID + status + a "⋯" overflow menu for secondary actions, keeping Issue always visible.

### 3.2 Patient Summary Card
- Single card, horizontally laid out in 4 zones on desktop (Identity | Vitals | Contact/Insurance | Clinical), wrapping to stacked rows on tablet/mobile.
- **Identity zone:** avatar (40px), full name (bold), gender · age · DOB on one muted line.
- **Vitals zone:** Height / Weight / BMI / Blood type as small label-value pairs in a 2x2 mini-grid. BMI value carries a subtle color tint if out of normal range (info-level, not alarming).
- **Contact/Insurance zone:** phone, insurance provider + status chip.
- **Clinical zone:** Primary diagnosis as a `BooTag`, plus the warning badge row described in §4.
- Card is collapsible: on scroll past a threshold it shrinks to a single-line strip (name, status badges, primary diagnosis) that stays visible — this is the "context never lost" pattern enterprise EMRs use.

### 3.3 Warning Badge Row
Rendered with `StatusBadgeComponent` (dotted variant) in a horizontal wrap row, each backed by an API-provided boolean/severity, never hardcoded:
`Drug Allergy` (danger) · `Pregnancy` (warning) · `Pediatric Patient` (info) · `Elderly Patient` (info) · `High Risk` (danger) · `Controlled Medication Restriction` (warning).
Each badge has a `Tooltip`/`Popover` on hover/focus showing the underlying detail (e.g. which allergy, which restriction) — badges are summaries, not the full story.

### 3.4 Diagnosis Section
- Card with header row (title + expand/collapse chevron, default expanded).
- Primary diagnosis: ICD-10 autocomplete input (`boo-select` in search mode) + free-text description, displayed as a removable tag once added — mirrors the existing diagnosis-add pattern already in the component, upgraded with autocomplete.
- Secondary diagnoses: same pattern, multiple tags.
- Clinical notes / symptoms / doctor notes: `Accordion` with line-clamped preview (3 lines) and "Show more" — long narrative text shouldn't push the medication table below the fold.

### 3.5 Medication Management Table (core section)
**Toolbar (sticky, above table header):**
- Search box (`boo-search`) filtering by medication/generic/brand name.
- Filter chips: status (Active/Held/Discontinued), insurance-covered, controlled-substance.
- "Add Medication" primary button (opens drawer), right-aligned.

**Table:**
- Sticky header (`position: sticky; top: <toolbar height>`), horizontal scroll on narrow viewports with the Medication name column pinned left.
- Columns (in order): Medication (name + generic + brand stacked) · Strength · Form · Route · Dose · Frequency · Morning/Noon/Afternoon/Evening (4 narrow icon-checkbox columns, only rendered when frequency = "scheduled" pattern) · Duration · Quantity · Instructions (truncated, tooltip for full text) · Insurance · Stock Status (badge: In Stock/Low/Out) · Clinical Warnings (severity icon stack, see §5) · Status · Actions (edit/duplicate/remove icon buttons).
- Row-level badges under the medication name: Antibiotic, Controlled Drug, High Alert, OTC, Prescription Only, Insurance Covered — rendered as small `BooTag` chips, max 3 visible + "+N" overflow popover.
- Inline editing: Dose, Frequency, Duration, Quantity, Instructions are editable directly in-row (click-to-edit pattern, Enter to commit, Escape to revert) for fast corrections without opening the drawer; structural changes (drug swap, route, form) require the drawer.
- Keyboard: `Tab`/`Shift+Tab` moves across editable cells, `↑`/`↓` moves rows, `Enter` opens edit on focused cell or commits if already editing, `Escape` cancels edit, `Ctrl+Enter` (or a dedicated shortcut) opens Add Medication.
- Sorting: click column header (Medication, Quantity, Status). Pagination: client-side for ≤50 rows (typical prescription), with a page-size control hidden by default since prescriptions rarely exceed one page — included for edge cases (chronic-care patients with long med lists).
- Empty state: centered illustration + "No medications added yet" + Add Medication CTA.

**Prescription Summary strip** (directly below table, same card):
Total Medications · Total Quantity · Total Daily Doses · Estimated Cost · Insurance Coverage (amount + %) · Patient Payment (amount), laid out as a horizontal stat row, wraps to 2x3 grid on tablet/mobile.

### 3.6 Add/Edit Medication Drawer
- Large right-side drawer (reuse `DrawerComponent`, width ~560–640px desktop, full-screen on mobile).
- **Top:** Drug Search (autocomplete over medicine catalog) — selecting a drug auto-fills Generic Name, Brand, Strength, Dosage Form, Route, and immediately triggers a CDS check (see §5) shown inline below the search field.
- **Form body**, grouped with section labels (matches existing patient-drawer convention):
  - *Drug Identity:* Generic Name, Brand Name, Strength, Dosage Form, Route (read-only/derived unless overridden).
  - *Dosing:* Dose, Frequency (preset dropdown: QD/BID/TID/QID/PRN/custom), Morning/Noon/Afternoon/Evening toggle checkboxes (only shown for "scheduled" frequency), Before/After Meal radio, PRN toggle.
  - *Duration & Supply:* Duration (number + unit days/weeks), Quantity, Unit, Refill count.
  - *Notes:* Doctor Instructions (textarea), Pharmacy Notes (textarea).
- **Live preview panel** at the bottom of the drawer (or sticky within it): renders the medication exactly as it will appear as a table row, including badges and any active CDS warnings — so the doctor sees the real output before committing.
- **Footer (sticky in drawer):** Cancel · Save & Add Another · Save.
- Drawer integrates with the app's existing unsaved-changes guard (`DrawerComponent` already supports this) so navigating away mid-entry prompts confirmation.

### 3.7 Right Sidebar (sticky)
Vertically stacked cards, `position: sticky; top: <action bar + summary height>`, independently scrollable if content overflows viewport height:
- **Diagnosis recap** — primary/secondary as compact tags (mirrors §3.4, for at-a-glance reference while scrolling the table).
- **Medication Count** — simple stat.
- **Clinical Alerts** — live feed of all active warnings across the whole prescription (aggregates §5), sorted by severity, click-to-scroll to the offending row.
- **Recent Prescriptions** — last 3 for this patient, collapsed list, click to view (read-only) in a popover/modal.
- **Favorite Medications** — doctor's personal quick-add list; clicking adds directly to the table (skips the drawer) for the highest-frequency prescriptions.
- **Prescription Templates** — named bundles (e.g. "Hypertension Starter") that add multiple rows at once.
- **Doctor Notes** — free-text scratchpad, autosaved with the draft.

On tablet/mobile, sidebar content collapses into a bottom-sheet or a tab within the page (see §6) rather than disappearing.

### 3.8 Sticky Footer
- Always visible (`position: sticky; bottom: 0`), mirrors the action bar's primary actions: Save Draft (secondary), Preview (secondary), Print (secondary), Issue Prescription (primary, dominant). Keeping these in both header and footer means the doctor never scrolls to act — this directly supports the <30s goal.

---

## 4. Risk & Warning Badges (Patient-level)

Driven entirely by API flags, never inferred client-side:

| Badge | Tone | Source field (example) |
|---|---|---|
| Drug Allergy | danger | `patient.allergies.length > 0` |
| Pregnancy | warning | `patient.isPregnant` |
| Pediatric Patient | info | `patient.age < 18` (or API-provided flag) |
| Elderly Patient | info | `patient.age >= 65` |
| High Risk | danger | `patient.riskLevel === 'High'` |
| Controlled Medication Restriction | warning | `patient.controlledSubstanceRestricted` |

---

## 5. Clinical Decision Support (CDS) — Medication-level

Warnings are **always API-sourced**, rendered immediately after a drug is selected (in the drawer) and persist on the table row (as an icon stack with severity color), never computed in the frontend.

**Warning types:** Drug Interaction · Duplicate Medication · Allergy Warning · Contraindication · High Dose · Low Dose · Pregnancy Warning · Pediatric Warning · Renal Adjustment · Liver Adjustment.

**Severity scale and treatment:**

| Severity | Color | Behavior |
|---|---|---|
| Info | gray/blue | Icon only, tooltip on hover |
| Low | blue | Icon + tooltip |
| Medium | amber | Icon + tooltip, included in sidebar Clinical Alerts feed |
| High | orange | Same as Medium + inline banner in drawer when adding the drug |
| Critical | red | Blocking banner in drawer ("Acknowledge to continue") + must be explicitly acknowledged (checkbox/button) before Save is enabled; surfaced in Issue Prescription confirmation dialog as a final check |

Each warning renders as an `Alert`/`Tooltip` combination: compact icon in the table, full text + recommended action in a `Popover` on click, and a roll-up list in the sidebar "Clinical Alerts" card for prescription-wide visibility.

---

## 6. Responsive Behavior

| Breakpoint | Layout |
|---|---|
| Desktop (≥1280px) | Full layout as described: sticky action bar, patient card, 70/30 table+sidebar split, sticky footer. |
| Tablet (768–1279px) | Sidebar collapses into a tab strip ("Medications" / "Insights") above the table — same content, just not side-by-side. Patient Summary Card switches from 4-zone row to 2x2 grid. Table scrolls horizontally with Medication column pinned. |
| Mobile (<768px) | Action bar collapses to ID/status + overflow menu. Patient Summary Card becomes a single-line collapsed strip by default (tap to expand). Medication table becomes a stacked card list (one card per medication, key fields only: name, dose, frequency, warnings, actions) — full table view available via a "Table view" toggle for power users. Drawer becomes full-screen. Sticky footer becomes a 2-button bar (Issue primary, "⋯" for the rest). |

Keyboard-first interactions (table tab/arrow navigation) are desktop/tablet-with-keyboard features; mobile relies on touch targets ≥44px and the stacked-card layout.

---

## 7. Page States

| State | Treatment |
|---|---|
| Loading (initial) | Skeleton: action bar renders immediately (static chrome), patient card and table show shimmer placeholders matching final layout dimensions to avoid layout shift. |
| Empty (no medications yet) | Table empty state per §3.5; summary strip shows zeros; Issue Prescription disabled with tooltip "Add at least one medication." |
| Error (load failure) | Inline error card replacing the section that failed (e.g. patient card fails independently of table) with "Retry" action — partial failure shouldn't block the whole page. |
| Success | Toast on Save Draft ("Draft saved"), Issue ("Prescription issued"), with the action bar status badge updating immediately (optimistic) then reconciled on API response. |
| Validation | Inline field-level errors in the drawer (e.g. quantity required, duration must be > 0); table rows with invalid/incomplete data get a small warning indicator and block Issue until resolved. |
| Disabled | Issued/Cancelled/Expired prescriptions render the whole page read-only (table cells non-editable, Add Medication hidden, footer reduced to Print/Preview only) — same screen, not a separate view. |

---

## 8. End-to-End Workflow

1. Doctor opens visit → Prescription tab loads with patient context pre-populated (skeleton → loaded).
2. Doctor reviews warning badges and allergy flags in the patient card (already visible, no extra click).
3. Doctor adds/confirms diagnosis (often already pulled from the encounter).
4. Doctor clicks **Add Medication** or a **Favorite/Template** shortcut in the sidebar.
5. In the drawer, doctor searches a drug; selecting it auto-fills fields and triggers CDS instantly.
6. If a Critical/High warning appears, doctor must acknowledge before saving; otherwise saves directly.
7. **Save & Add Another** lets the doctor keep adding without closing the drawer — the primary lever for hitting <30s for multi-drug prescriptions.
8. Table updates live; summary strip and sidebar Clinical Alerts update accordingly.
9. Doctor reviews the table (inline-edits a dose if needed), checks the summary (cost/coverage), clicks **Preview** if desired.
10. Doctor clicks **Issue Prescription** → confirmation dialog summarizing item count and any unacknowledged Medium+ warnings → confirm → status badge flips to "Issued", footer reduces to Print/Preview, page becomes read-only.
11. Autosave runs in the background throughout (debounced, on every meaningful change) so steps 4–9 are never lost even if the doctor never explicitly hits Save Draft.

---

## 9. Edge Cases & Exception Handling

- **Network failure mid-edit:** autosave retries with backoff; if it ultimately fails, a persistent (non-blocking) banner says "Changes not saved — retry" rather than a toast that disappears.
- **Concurrent edit** (e.g. pharmacist updates dispense status while doctor has the page open): on Issue, re-fetch and diff; if the prescription changed server-side, show a conflict dialog rather than silently overwriting.
- **Drug not found in catalog:** drawer allows a manual "Add custom medication" fallback with a clear "Not catalog-verified" tag, and CDS warnings are explicitly shown as "unavailable" rather than silently skipped.
- **Stock = 0 or insurance not covered:** row still addable (doctor's call) but Stock Status / Insurance columns show explicit Out of Stock / Not Covered badges so the choice is informed, not hidden.
- **Critical warning ignored:** cannot Issue without acknowledgment recorded; acknowledgment is logged (sent to API) for audit purposes.
- **Very long medication list (chronic care, 20+ items):** table pagination kicks in; summary strip still aggregates across all pages, not just the visible page.
- **Navigating away with unsaved changes:** existing app-wide unsaved-changes guard fires (already implemented for `DrawerComponent`); apply the same pattern at the page level for the whole prescription form.
- **Issuing with zero medications:** blocked, see Empty state above.
- **Cancelling an already-issued prescription:** requires confirmation dialog with reason capture (free text), since this is a clinically significant, audit-relevant action.

---

## 10. Accessibility (WCAG 2.1 AA)

- All interactive table cells and drawer fields reachable via `Tab`, with visible focus rings (not just color change) meeting 3:1 contrast against adjacent colors.
- Severity badges/icons never rely on color alone — each pairs an icon shape (info circle, warning triangle, critical octagon) with the color, plus a text label available to screen readers via `aria-label`.
- `StatusBadgeComponent`, `Alert`, and warning icons get explicit `role="status"`/`aria-live="polite"` regions so screen-reader users hear new CDS warnings as they appear, not just sighted users.
- Critical-warning acknowledgment control is a real checkbox/button (not a styled div) with an explicit label, so it's operable via keyboard and announced correctly.
- Drawer traps focus while open and returns focus to the triggering "Add Medication" button on close (standard modal a11y pattern).
- Sticky header/footer must not cover focused elements when tabbing — verify `scroll-padding` accounts for sticky bar heights.
- Color contrast: body text ≥4.5:1, badge text on tinted backgrounds ≥4.5:1 (verify the existing amber/emerald/red Tailwind tints meet this at the weights used).
- Touch targets ≥44x44px on mobile card view, including icon-only action buttons.
- Form errors are announced (`aria-describedby` linking field to its error message) not just shown visually in red.

---

## 11. Component Hierarchy & Reuse

```
PrescriptionPageComponent
├── PrescriptionActionBarComponent          (new — sticky header)
│   └── StatusBadgeComponent                (existing)
├── PatientSummaryCardComponent             (new)
│   └── StatusBadgeComponent (dotted)       (existing, reused for warning row)
│   └── BooTagComponent                     (existing, primary diagnosis tag)
├── DiagnosisSectionComponent               (new)
│   ├── BooSelectComponent (search mode)    (existing, ICD-10 autocomplete)
│   ├── BooTagComponent                     (existing, diagnosis chips)
│   └── AccordionComponent                  (new shared component — notes expand/collapse)
├── MedicationTableComponent                (new — core)
│   ├── BooSearchComponent                  (existing, toolbar search)
│   ├── FilterChipsComponent                (existing pattern from prescriptions-tab)
│   ├── DataTable (native table + Tailwind) (existing pattern, extended with sticky header + inline edit)
│   ├── BooTagComponent (row badges)        (existing)
│   ├── StatusBadgeComponent (stock/status) (existing)
│   ├── ClinicalWarningIconStack            (new)
│   ├── TooltipComponent / PopoverComponent (new shared components)
│   └── PaginationComponent                 (new shared component)
├── PrescriptionSummaryStripComponent       (new)
├── PrescriptionSidebarComponent            (new, sticky)
│   ├── ClinicalAlertsFeedComponent         (new)
│   ├── RecentPrescriptionsListComponent    (new, reuses prescriptions-tab card pattern read-only)
│   └── TemplatesAndFavoritesComponent      (new)
├── MedicationDrawerComponent               (new, built on existing DrawerComponent)
│   ├── DrugSearchAutocompleteComponent     (new, boo-select pattern + debounced API search)
│   ├── BooInputComponent / BooSelectComponent / BooCheckboxComponent (existing, dosing/duration fields)
│   ├── MedicationLivePreviewComponent      (new)
│   └── ClinicalWarningBannerComponent      (new, High/Critical inline banner)
├── DialogService (Issue/Cancel confirmations) (existing)
└── PrescriptionFooterComponent             (new — sticky footer, mirrors action bar primary actions)
```

**New shared components worth promoting to `src/app/components/` (reusable beyond this page):** `AccordionComponent`, `TooltipComponent`, `PopoverComponent`, `PaginationComponent`, `ClinicalWarningIconStack` (could generalize to a generic "annotation stack"). Everything else composes existing primitives (`Drawer`, `StatusBadge`, `BooTag`, `BooSelect`, `BooInput`, `BooCheckbox`, `DialogService`, `ToastService`).

---

## 12. Backend API Contract (proposed — not implemented)

**Current backend reality (as of this proposal):** `PhysioBoo.Presentation/Endpoints/PrescriptionEndpoints.cs` exposes exactly one route, `POST api/prescriptions/create`, backed by `Commands/Prescriptions/CreatePrescription` — which builds only the `Prescription` header row and does **not** create any `PrescriptionItem` rows (those require N separate calls to `POST api/prescription-items/create`). No `Queries/Prescriptions` folder exists — the only read shape anywhere in the backend is `Queries/MedicalRecords/GetPrescriptions`, scoped to a patient and returning fake pagination (`page 1 of 1` always). No Update/Issue/Cancel/CDS/cost/favorites/templates support exists at all. `Prescription.Status` (`PrescriptionStatus` enum: `Active, Dispensed, PartiallyDispensed, Expired, Cancelled`) has no `Draft`/`Issued` states and defaults to `Active` in the constructor — this does not match the frontend's `Draft | Issued | Cancelled | Expired` vocabulary and must be reconciled (see §12.0).

The frontend's `PrescriptionService` (`src/app/services/admin/prescription.service.ts`) currently calls 10 endpoints under `BASE_API.PRESCRIPTION_RX`, none of which exist server-side today. This section is the full contract to close that gap. Endpoints that already exist elsewhere in the backend and should be **reused, not duplicated**, are called out explicitly.

### 12.0 Required domain model changes (prerequisite to any endpoint below)

| Change | Reason |
|---|---|
| `PrescriptionStatus` enum: add `Draft`, add `Issued`; keep `Dispensed`/`PartiallyDispensed`/`Expired`/`Cancelled`; drop or repurpose `Active` | FE models the lifecycle as `Draft → Issued → (Dispensed by pharmacy) / Cancelled / Expired`. Dispensing status is a pharmacy-side concern already tracked separately by `PrescriptionItem.QuantityDispensed` — `Prescription.Status` should reflect the doctor-authored lifecycle, not conflate the two. |
| `Prescription` constructor default status → `Draft` (not `Active`) | A newly created prescription via Save Draft must not appear as already-active/issued. |
| Add domain methods `Issue()`, `Cancel(reason)` on `Prescription` (replacing generic `SetStatus()` calls from the application layer) | Encodes valid transitions (e.g. cannot Issue from `Cancelled`) at the domain layer per Clean Architecture convention already used elsewhere in `PhysioBoo.Domain`. |
| `Prescription`: add `CancelReason` (string?), `IssuedAt` (DateTime?), `CancelledAt` (DateTime?) | FE cancel flow captures a reason (§9 Edge Cases); issue/cancel timestamps needed for audit and for the "Cancelling an already-issued prescription" edge case. |
| `PrescriptionItem`: add `TimingMorning`/`TimingNoon`/`TimingAfternoon`/`TimingEvening` (bool), `IsPrn` (bool), `BeforeAfterMeal` (enum: `Before`/`After`/`None`), `Unit` (string), `RefillCount` (int), `IsInsuranceCovered` (bool), `IsCatalogVerified` (bool, default true — false for custom/manual entries) | Every one of these fields is rendered and edited in `rx-medication-table`/`rx-medication-drawer` today with no backend counterpart — the domain model is currently too thin to persist what the UI already collects. |
| New entity `PrescriptionClinicalWarning` (`PrescriptionItemId`, `Type`, `Severity`, `Message`, `RecommendedAction`, `AcknowledgedBy`, `AcknowledgedAt`) | CDS results must persist server-side (not just live in FE memory) so Critical-warning acknowledgement is auditable at Issue time, per §9 "Critical warning ignored" edge case. |
| New entity `FavoriteMedication` (`DoctorId`, `MedicineId`, custom default dosing fields) | Backs the Favorites sidebar widget; currently no persistence layer exists for it. |
| New entity `PrescriptionTemplate` + `PrescriptionTemplateItem` (`DoctorId`, `Name`, ordered list of default medication lines) | Backs the Templates sidebar widget and "apply template" bulk-add action. |
| `CreatePrescriptionCommand`: extend to accept a nested `Items[]` array and insert both header + items in one transaction | Today creation is two non-transactional round trips (header, then N item calls) — a partial failure leaves an orphaned header with no items. |

### 12.1 `GET /api/prescriptions/{id}`
- **Purpose**: Load a single prescription (header + items + status + persisted clinical warnings) when the page opens in edit mode.
- **Request**: path `id` (guid). `id = "new"` is **not** a valid backend call — the frontend must stop hardcoding `prescriptionId = 'new'` and instead only call this once a real id exists (see §12.2 for creation-first flow).
- **Response**: `PagedResponse<PrescriptionDraft>` — `id, prescriptionNumber, patientId, doctorId, appointmentId, medicalRecordId, status, prescriptionDate, diagnosis[], instructions, items: PrescriptionItemDraft[], pharmacistNotes, refillCount, maxRefills, validUntil`. Each `PrescriptionItemDraft` includes all §12.0 fields plus any persisted `clinicalWarnings[]`.
- **Frontend usage**: `PrescriptionService.getDraft(prescriptionId)`.

### 12.2 `POST /api/prescriptions`
- **Purpose**: Create a new prescription in `Draft` status — replaces today's disconnected header-only `POST api/prescriptions/create`. Called once, on first save, with the full item list already attached (transactional).
- **Request**: `{ patientId, doctorId, appointmentId, medicalRecordId, hospitalId, diagnosis[], instructions?, items: PrescriptionItemInput[] }` (items array may be empty — an empty-but-saved draft is valid).
- **Response**: `PagedResponse<PrescriptionDraft>` (same shape as §12.1, with server-generated `id`/`prescriptionNumber`).
- **Frontend usage**: `PrescriptionService.saveDraft(draft)` when `draft.id` is not yet set (first save of a new prescription). Requires the page to actually be entered with `patientId`/`doctorId`/`appointmentId`/`medicalRecordId` route/state context — currently absent (see §11/§14 IA gap: no navigation handoff from Doctor Desk into this page with that context).

### 12.3 `PUT /api/prescriptions/{id}`
- **Purpose**: Update an existing Draft (autosave, manual Save Draft, inline table edits). Rejected (409) if `status != Draft`.
- **Request**: same shape as §12.2's body, full replace of `diagnosis`/`instructions`/`items` for simplicity (matches the FE's whole-draft autosave model rather than a partial-patch model).
- **Response**: `PagedResponse<PrescriptionDraft>`.
- **Frontend usage**: `PrescriptionService.saveDraft(draft)` when `draft.id` is already set; also the debounced (1200ms) autosave path in `prescription.component.ts`.

### 12.4 `POST /api/prescriptions/{id}/issue`
- **Purpose**: Transition `Draft → Issued`. Server-side validates: at least one item present, no unacknowledged `Critical`-severity `PrescriptionClinicalWarning`, all required item fields populated (dose/frequency/duration/quantity). Sets `IssuedAt`.
- **Request**: `{}` (no body needed — server re-validates against persisted state, not client-supplied state, to prevent a stale-client bypass of the Critical-warning gate).
- **Response**: `PagedResponse<PrescriptionDraft>` with `status: "Issued"`, or `422` with a structured validation error list if blocked.
- **Frontend usage**: `PrescriptionService.issue(draft)`.

### 12.5 `POST /api/prescriptions/{id}/cancel`
- **Purpose**: Transition to `Cancelled` from `Draft` or `Issued`. Sets `CancelReason`, `CancelledAt`.
- **Request**: `{ reason: string }` (required, non-empty — today's FE hardcodes `'Cancelled by doctor'` client-side; the drawer/dialog for reason entry described in §9 needs to actually collect this and send it here).
- **Response**: `PagedResponse<PrescriptionDraft>` with `status: "Cancelled"`.
- **Frontend usage**: `PrescriptionService.cancel(draft, reason)`.

### 12.6 `POST /api/prescriptions/cds-check`
- **Purpose**: Submit patient id + current (possibly unsaved) item list → returns clinical warnings (interaction, duplicate, allergy, contraindication, high/low dose, pregnancy/pediatric, renal/liver) keyed by item id. Called live from the drawer (400ms debounce) on every med add/edit — must operate on draft data, not just persisted items, since items aren't saved until the drawer's Save.
- **Request**: `{ patientId: string, items: { medicineId, doseText, frequency, durationInDays }[] }`.
- **Response**: `PagedResponse<Record<string, ClinicalWarning[]>>` — `ClinicalWarning: { id, type, severity, message, recommendedAction }`.
- **Frontend usage**: `PrescriptionService.checkClinicalWarnings(patientId, items)`.
- **Note**: acknowledgement of a returned warning (checkbox in the drawer) must be persisted via §12.1's item update, writing to `PrescriptionClinicalWarning.AcknowledgedBy/AcknowledgedAt`, so §12.4's Issue-time re-validation can trust it server-side rather than re-trusting client state.

### 12.7 `POST /api/prescriptions/{id}/cost-estimate`
- **Purpose**: Compute total cost, insurance coverage amount/%, patient payment from the current item list — replaces the FE's hardcoded 80%-coverage client-side calculation in `rx-medication-table`'s `summary()`.
- **Request**: `{ items: { medicineId, quantity }[] }` (POST, not GET, since it must reflect unsaved draft edits, matching the existing FE method signature `getCostEstimate(prescriptionId, items)`).
- **Response**: `PagedResponse<PrescriptionSummaryTotals>` — `{ totalCost, insuranceCoverageAmount, insuranceCoveragePercent, patientPayment, currency }`. Insurance percent must be sourced from the patient's actual insurance record, not a fixed constant.
- **Frontend usage**: `PrescriptionService.getCostEstimate(prescriptionId, items)` — currently a dead method (defined but never called); wiring it into the Summary strip is an implementation-time task once this endpoint exists.

### 12.8 `GET /api/medical-records/{patientId}/prescriptions` (existing — reuse, do not duplicate)
- **Already implemented**: `MedicalRecordEndpoints.cs` line 201, backed by `GetMedicalRecordPrescriptionsQuery`, returning `PagedResult<PrescriptionViewModel>` (full items included, but fake pagination — always page 1 of 1).
- **Change needed**: fix the handler's pagination to be real (`skip/take` against the actual query, real `totalCount`), and add an optional `limit` query param.
- **Frontend usage**: replaces the proposed-but-nonexistent `GET /api/patients/{id}/prescriptions/recent` — `PrescriptionService.getRecentPrescriptions(patientId)` should call this existing endpoint with `?limit=3`, mapping `PrescriptionViewModel[]` down to the FE's flatter `RecentPrescriptionSummary` shape client-side (or add a `medicationNames` computed field server-side to avoid client-side flattening).

### 12.9 `GET /api/medical-records/{patientId}/allergies` (existing — reuse for CDS/warning-badge context)
- **Already implemented**: `MedicalRecordEndpoints.cs` line 138. The Patient Summary Card's allergy badge and CDS allergy-check (§12.6) should source from this existing endpoint rather than a new `/api/patients/{id}/allergies` — avoids a second allergy read path diverging from the Medical Record module's data.

### 12.10 `GET /api/medical-records/{patientId}/demographics` (existing — reuse for Patient Summary Card)
- **Already implemented**: `MedicalRecordEndpoints.cs` line 96. Covers the "clinical-summary" need (demographics/vitals) originally proposed as a new `/api/patients/{id}/clinical-summary` — reuse this instead. If it lacks risk flags (pregnancy/pediatric/elderly/high-risk/controlled-restriction), extend its `ViewModel` rather than standing up a parallel endpoint.

### 12.11 `GET /api/medical-records/{patientId}/diagnoses?encounterId=` (existing — reuse for Diagnosis Section pre-fill)
- **Already implemented**: `MedicalRecordEndpoints.cs` line 180. Diagnosis Section (§3.4) pre-fill should call this rather than a new endpoint.

### 12.12 `GET /api/medicines?query=` (extend existing group — currently missing)
- **Current state**: `MedicineEndpoints.cs` exposes only `POST api/medicines/create` — no search/list route exists at all.
- **Change needed**: add `GET api/medicines?query=&page=&pageSize=` to the existing `api/medicines` group, searching by name/generic/brand, paginated (never return the full catalog — hospital networks run tens of thousands of SKUs, per §14 scalability note).
- **Response**: `PagedResponse<PaginationData<MedicineCatalogItem>>` — `{ id, name, genericName, brandName, strength, dosageForm, isControlledSubstance, isHighAlert, isOtc, defaultInsuranceCovered }`.
- **Frontend usage**: `PrescriptionService.searchMedicines(query)` in the drawer's debounced (250ms) drug search.

### 12.13 `GET /api/medicines/{id}` (extend existing group)
- **Purpose**: Full drug detail to auto-fill the drawer on selection (strength, form, route options, stock, insurance default) and to disambiguate a catalog vs. custom-entered medicine.
- **Response**: `PagedResponse<MedicineDetail>` extending §12.12's shape with `routeOptions[]`, `stockStatus`, `pricePerUnit`.
- **Frontend usage**: called from the drawer immediately after `searchMedicines` selection.

### 12.14 `GET /api/doctors/{doctorId}/favorite-medications`, `POST .../favorite-medications`, `DELETE .../favorite-medications/{id}`
- **Purpose**: CRUD for the Favorites sidebar widget, backed by the new `FavoriteMedication` entity (§12.0).
- **Request/Response**: `POST` body `{ medicineId, defaultDose?, defaultFrequency? }`; all responses `PagedResponse<FavoriteMedication[]>` or single item.
- **Frontend usage**: `PrescriptionService.getFavorites(doctorId)`; add/remove actions from the sidebar (not yet implemented client-side — currently read-only in the sidebar spec).

### 12.15 `GET /api/prescription-templates?doctorId=`, `POST /api/prescriptions/{id}/apply-template/{templateId}`
- **Purpose**: List a doctor's saved templates; bulk-apply one to the current draft (appends its items), backed by the new `PrescriptionTemplate`/`PrescriptionTemplateItem` entities (§12.0).
- **Response** (list): `PagedResponse<PrescriptionTemplate[]>` — `{ id, name, itemCount }`. **Response** (apply): `PagedResponse<PrescriptionDraft>` with the template's items appended.
- **Frontend usage**: `PrescriptionService.getTemplates(doctorId)`; sidebar template click-to-apply.

### 12.16 `GET /api/prescriptions/{id}/print`
- **Purpose**: Print-ready representation (server-rendered HTML fragment or PDF URL) for Preview/Print actions — replaces today's bespoke in-component modal + `window.print()`, ideally reusing the app's existing shared print-template infrastructure (`components/print/print-template-picker`) rather than a one-off.
- **Response**: `PagedResponse<{ url: string } | { html: string }>`.
- **Frontend usage**: Preview/Print buttons in `rx-action-bar`/`rx-footer`.

### 12.17 `GET /api/icd10?query=`
- **Purpose**: ICD-10 code+description autocomplete for the Diagnosis Section (currently two free-text inputs with no lookup at all).
- **Response**: `PagedResponse<{ code: string, description: string }[]>`.
- **Frontend usage**: `boo-select` search-mode autocomplete in `rx-diagnosis-section`.
- **Note**: requires sourcing an ICD-10 code table (static seed data or a licensed terminology service) — flagged as a data-sourcing dependency, not just an endpoint, before implementation.

---

## 13. UX Improvements That Directly Reduce Time-to-Issue and Error Rate

- **Favorites + Templates** skip the drawer entirely for the doctor's most common prescriptions — the single biggest lever for the <30s goal on routine cases.
- **Save & Add Another** keeps the doctor in the drawer across multiple drugs instead of reopening it each time.
- **Inline table editing** avoids round-tripping through the drawer for simple corrections (dose, duration, quantity).
- **Auto-fill from drug selection** (generic/brand/strength/form/route) removes redundant manual entry, which is also where transcription errors happen.
- **Immediate CDS feedback** (in the drawer, before the row is even saved) catches allergy/interaction errors at the cheapest point to fix them, rather than after Issue.
- **Persistent action bar + footer** mean Issue is always one click away — no scrolling required regardless of medication list length.
- **Autosave** removes the cognitive overhead of remembering to save, and protects against losing work on interruption (a frequent real-world occurrence in clinical settings).
- **Sticky patient/warning context** ensures allergy and risk flags stay visible the entire time the doctor is adding medications, rather than requiring a scroll-up to re-check.

---

## 14. Scalability & Maintainability Recommendations

- **Split the monolithic inline-template component** into the hierarchy in §11 — each section (action bar, patient card, table, drawer, sidebar) becomes an independently testable, independently loadable component, matching the pattern already used by `medical-record.component.ts`'s tab architecture.
- **Centralize the medication/diagnosis/patient types** (`shared/types/`) into the richer shapes implied by §3.5/§12 (generic name, strength, route, dosage form, stock, insurance, controlled flag, CDS warning array per item) — the current `Medication` interface is too thin to support this design and should be extended, not replaced, to avoid breaking the existing `prescriptions-tab.component.ts` read view.
- **One `PrescriptionService`** (new, alongside `MedicalRecordService`) owning all endpoints in §12, with the table/drawer/sidebar components consuming it via inputs/outputs or signals — keeps API logic out of presentation components.
- **CDS results modeled as a first-class, reusable warning type** (`severity`, `type`, `message`, `affectedItemId`) so the same rendering component (`ClinicalWarningIconStack`) works in the table, the drawer banner, and the sidebar feed without duplication.
- **Lazy-load the drawer's drug catalog search** and debounce it — catalogs in a large hospital network can be tens of thousands of SKUs; never fetch the full list client-side.
- **Keep the table virtualization-ready**: even though pagination is the default per §3.5, design the row-rendering component so it could later be swapped for a virtual-scroll strategy without restructuring, since some specialties (oncology, chronic polypharmacy) routinely exceed 30+ line items.
- **Status-driven read-only mode** (§7 Disabled state) should be a single derived flag (`isEditable = status === 'Draft'`) threaded through props, not duplicated conditionals scattered across components — this is what keeps Issued/Cancelled prescriptions safely immutable as the feature grows.
