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

## 12. Required Frontend APIs

Frontend-consumption contract only — no implementation. Existing relevant pattern: `MedicalRecordService.getPrescriptions(patientId)` already returns `PrescriptionRow`/`PrescriptionItemRow`; the endpoints below extend that model to support the redesigned workflow.

| Endpoint | Purpose |
|---|---|
| `GET /api/prescriptions/{id}` | Load a single prescription (header + items + status) for the page on open/edit. |
| `POST /api/prescriptions` | Create a new prescription (Save Draft / first save). |
| `PUT /api/prescriptions/{id}` | Update an existing draft (autosave, manual save, inline edits). |
| `POST /api/prescriptions/{id}/issue` | Transition Draft → Issued; server validates required fields and unacknowledged critical warnings. |
| `POST /api/prescriptions/{id}/cancel` | Transition to Cancelled; accepts a reason. |
| `GET /api/patients/{id}/clinical-summary` | Demographics, vitals (height/weight/BMI/blood type), risk/warning flags (allergy, pregnancy, pediatric, elderly, high-risk, controlled-restriction) for the Patient Summary Card. |
| `GET /api/patients/{id}/allergies` | Allergy list, feeding both the warning badge and CDS allergy checks. |
| `GET /api/patients/{id}/diagnoses?encounterId=` | Pre-fill diagnosis section from the current encounter. |
| `GET /api/icd10?query=` | ICD-10 autocomplete for diagnosis entry. |
| `GET /api/medicines?query=` | Drug search/autocomplete (name, generic, brand) for the Add Medication drawer. |
| `GET /api/medicines/{id}` | Full drug detail (strength, form, route options, stock, insurance default) to auto-fill the drawer on selection. |
| `POST /api/prescriptions/cds-check` | Submit patient ID + current draft item list → returns clinical warnings (interaction, duplicate, allergy, contraindication, dose, pregnancy/pediatric, renal/liver) with severities. Called on every add/edit so the table and sidebar always reflect current state. |
| `GET /api/prescriptions/{id}/cost-estimate` | Returns total cost, insurance coverage amount/%, patient payment for the Summary strip — recalculated whenever items change. |
| `GET /api/patients/{id}/prescriptions/recent?limit=3` | Recent Prescriptions sidebar widget. |
| `GET /api/doctors/{id}/favorite-medications` | Favorites sidebar widget. |
| `POST /api/doctors/{id}/favorite-medications` / `DELETE .../{medicationId}` | Manage favorites. |
| `GET /api/prescription-templates?doctorId=` | Prescription Templates sidebar widget. |
| `POST /api/prescriptions/{id}/apply-template/{templateId}` | Bulk-add a template's medications to the current draft. |
| `GET /api/medicines/{id}/stock-status` | Stock status badge in the table (could be embedded in `GET /api/medicines/{id}` instead — listed separately if stock changes faster than catalog data). |
| `GET /api/prescriptions/{id}/print` | Returns a print-ready representation (or PDF URL) for Preview/Print actions. |

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
