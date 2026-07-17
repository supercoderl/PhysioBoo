# Insurance Claims Management Redesign — Claim Processing Workspace

**Path:** `admin/finance/insurance`
**Current implementation:** `src/app/pages/admin/finance/insurance/insurance.component.ts` — a single demo component with 4 tabs (Policy Verification, New Claim, Claims List, Providers), inline Tailwind forms, a flat `InsuranceClaim[]` array, native `alert()` for every action, no service layer, no drawer, no workflow. Structurally identical to the pre-redesign Surgery/Laboratory pages: a generic CRUD admin page bolted onto insurance data.
**Scope:** Frontend UI/UX only. No backend implementation — see §9 for the proposed API contract. Reuses the conventions established by the Surgery module (`docs/surgery-redesign.md`): standalone Angular components, signals, `LocalLoadingService`, `ToastService`, `BooIconComponent`, `StatusBadgeComponent`, `HttpService.getOr/postOr/patchOr` mock-fallback pattern, Tailwind. Deliberately **does not** reuse the surgery/laboratory *layout* (sticky header + stat-card row + tab bar + table) — see §2 for why.

---

## 1. UX Audit — Current State

| Area | Current Implementation | Problem |
|---|---|---|
| Layout | 4-tab flat page, one concern per tab | No sense of a live caseload — a claims processor has to leave the record entirely to move between "find a claim" and "act on a claim" |
| Data model | One `InsuranceClaim` interface, one `InsuranceProvider`, one `PolicyVerification` — unrelated to each other | No workflow stage, no documents, no timeline, no risk/health signal, no audit trail — cannot represent a real adjudication lifecycle |
| Actions | `submitClaim`, `viewClaimDetails`, `addProvider` all call `alert()` | Blocks the UI thread, not accessible, no real state transition |
| Claims list | Native `<table>`, client-side `getFilteredClaims()` | No card-level context (missing docs, priority, risk) visible without opening a row; no saved views; no bulk workflow action |
| Providers | Static array of 6 hardcoded providers rendered as cards with dead "Edit/Remove" buttons | Not data-driven, no relationship to claims counts |
| Workflow | None — a single `status` enum with 4 values | No verification → documents → coding → submission → insurer review → hospital response → settlement pipeline, which is the entire point of a claims desk |
| Risk / documents | Not modeled | No missing-document tracking, no risk scoring, no approval-velocity signal — exactly what a claims processor triages by |
| Loading/empty/error states | None | No skeleton, no real empty state, no retry |
| Accessibility | No `role`, no keyboard path to any action, `alert()` traps focus | Screen-reader and keyboard users cannot process a claim |

**Root cause:** the page was generated as a flat CRUD form set bound to a single oversimplified `InsuranceClaim` record, never modeling the actual insurance adjudication workflow (verification → documentation → coding → submission → review → response → settlement) that claims desks actually run.

---

## 2. Design Concept — Why Not Another Admin Dashboard

Every previously redesigned module in this codebase (Surgery, Laboratory, Radiology, Pharmacy, Nursing, Treatment Sheet) follows the same shape: sticky hero header → stat-card row → filter bar → tab bar → table-or-cards → drawer. That shape is correct for *operational monitoring* (a ward, an OR, a pharmacy counter) but wrong for *case processing* — a claims desk doesn't monitor a room, it works a queue of individual cases one at a time, in exactly the way an issue tracker (Jira/Linear/Azure Boards) or a service console (Salesforce) works a ticket queue.

Insurance Claims is therefore built as a **three-column claim processing workspace**, not an admin dashboard:

- **No sticky hero header** — replaced by a compact top toolbar (search + smart filters + saved views) that never claims more than 56px.
- **No stat-card row** — replaced by floating widgets (progress rings, mini bar/donut charts, a risk gauge) docked into the toolbar and the left rail footer.
- **No filters-above-table** — filters live in the toolbar as chips/dropdowns that scope the center queue; there is no separate filter bar section.
- **No CRUD table** — the center column is a card queue (compact / comfortable / Kanban / timeline switchable), not a `<table>`.
- **No drawer-as-inspector** — the right column is a permanent, resizable inspector panel that is part of the layout (like Linear's issue panel), not an overlay. Modal dialogs (`DrawerComponent`/`global-dialog`) are reserved for true one-shot actions: Create Claim, Reject, Appeal, Settlement, Upload Documents.
- **No hospital blue** — the workspace uses an ivory/warm-gray/forest-green/olive/amber/graphite palette (§8), scoped to this module only via component-local CSS custom properties, so the rest of the HIS is untouched.

---

## 3. Information Architecture

```
Insurance Claims (/admin/finance/insurance)
├── Top Toolbar (56px, not sticky-hero styled)
│   Global search · Smart Filters (Claim Type, Provider, Status, Date, Department,
│   Doctor, Amount Range) · Saved Views · View density toggle · "New Claim"
├── Workflow Rail (horizontal, clickable stages — filters the center queue when a
│   stage is clicked; shows a live count + avg dwell time per stage)
│   Verification → Document Collection → Coding → Submission → Insurance Review →
│   Hospital Response → Settlement
├── Left Panel (fixed, 260px, collapsible)
│   Insurance Providers (tree, per-provider claim counts)
│   Favorites
│   Smart Folders: Pending / Rejected / Appealed / Approved / Archived
│   Saved Searches
├── Center Panel (fluid)
│   Claims Queue — card-based, density-switchable (Compact / Comfortable / Kanban /
│   Timeline), each card carrying patient, insurer, amount, hospital/department/doctor,
│   priority, submission date, progress ring, status badge, missing-doc indicator,
│   hover actions
├── Right Panel (420px, resizable, collapsible — "Claim Detail Workspace")
│   Tabs: Overview / Documents / Medical Records / Billing / Approval Timeline /
│   Communication / Notes / Audit Logs
│   Embedded document viewer inside the Documents tab
└── Floating Widgets (docked into toolbar right edge + left rail footer)
    Claim Health ring · Risk Score gauge · Missing Documents counter ·
    Approval Velocity sparkline

Dialogs (triggered from queue card hover actions or right panel header):
  Create Claim · Submit Claim · Upload Documents · Approve · Reject · Appeal ·
  Settlement · Print
```

**Key IA decision:** unlike Surgery (room-centric) or Laboratory (order-centric), Insurance Claims is **case-centric with a permanent inspector** — a claims processor spends most of a session on one claim at a time while keeping the queue and provider tree visible for context, exactly the Linear/Jira triage pattern. The right panel is always mounted (never a modal), so switching cases never loses scroll position or panel width.

---

## 4. User Journey

1. A claims processor opens **Insurance Claims** from the sidebar (Finance → Insurance).
2. The workflow rail gives an instant read on where the entire caseload sits (e.g. 14 in Document Collection, 6 in Insurance Review) before any row is opened.
3. The left rail's Smart Folders and provider tree let the processor scope the queue (e.g. "Rejected claims for Bao Viet Insurance") without a modal filter dialog.
4. Clicking a workflow stage filters the center queue to that stage; clicking a card opens/updates the right inspector panel in place — the queue never disappears.
5. Inside the inspector, the processor works the case: reviews Documents (drag-and-drop upload, embedded preview), checks Medical Records and Billing, walks the Approval Timeline, adds Notes, and reviews the Audit Log.
6. State-changing actions (Submit, Approve, Reject, Appeal, Settlement) open a focused dialog scoped to that action; on success the card's workflow stage and progress ring update immediately and the queue re-sorts if a Smart Folder view is active.
7. Floating widgets (claim health ring, risk gauge, missing-doc counter, approval velocity sparkline) update live as the processor works, giving continuous situational awareness without a separate dashboard tab.
8. Kanban/Timeline view lets a team lead re-triage priorities across the whole workflow at a glance; Compact/Comfortable view is what an individual processor uses to work a queue quickly.

---

## 5. Layout & Wireframe

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  🔍 Search claims…      [Provider ▾][Status ▾][Type ▾][Date ▾][Amount ▾]        │
│  ⭐ Saved Views ▾                       [≡ density] [Kanban] [Timeline] [+ New]  │
├─────────────────────────────────────────────────────────────────────────────────┤
│  Verification ● 4   Documents ● 9   Coding ● 3   Submission ● 6                  │
│  Insurance Review ● 11   Hospital Response ● 5   Settlement ● 2                  │
├───────────────┬───────────────────────────────────┬─────────────────────────────┤
│ INSURANCE     │  Claims Queue                       │  Claim Detail Workspace     │
│ PROVIDERS     │  ┌─────────────────────────────┐    │  CLM-2026-000142            │
│  ▸ Bao Viet   │  │ Nguyen Van A   ● Under Review│    │  ┌───────────────────────┐ │
│  ▸ PVI        │  │ Bao Viet · 12,500,000 ₫      │    │  │ Overview │ Docs │ ... │ │
│  ▸ Manulife   │  │ Cardiology · Dr. Tran         │    │  └───────────────────────┘ │
│               │  │ ▓▓▓▓▓▓░░░░ 62%  ⚠ 2 missing   │    │  Patient / Insurance /     │
│ ★ Favorites   │  └─────────────────────────────┘    │  Coverage / Diagnosis /    │
│  Pending  (14)│  ┌─────────────────────────────┐    │  Procedures / Invoice      │
│  Rejected  (3)│  │ Le Thi B      ● Rejected     │    │                             │
│  Appealed  (2)│  │ PVI · 4,200,000 ₫            │    │  [Approve][Reject][Appeal] │
│  Approved (21)│  └─────────────────────────────┘    │                             │
│  Archived     │  …                                   │  ◐ Health 82  ⚠ Risk 24    │
│               │                                       │                             │
│ Saved Searches│                                       │                             │
└───────────────┴───────────────────────────────────────┴─────────────────────────┘
```

Left panel is collapsible to a 44px icon rail; right panel is resizable (`resize: horizontal` on the container, min 360px / max 640px) and collapsible to make the queue full-width on smaller viewports.

---

## 6. Component Hierarchy

```
AdminInsuranceComponent (admin-insurance)                — orchestrator, workspace shell
├── InsuranceProvidersTreeComponent (insurance-providers-tree)   — left panel
├── InsuranceWorkflowRailComponent (insurance-workflow-rail)     — clickable stage rail
├── InsuranceClaimCardComponent (insurance-claim-card)           — center queue card (×N)
├── InsuranceClaimDetailPanelComponent (insurance-claim-detail-panel) — right inspector
└── InsuranceClaimActionDialogComponent (insurance-claim-action-dialog) — modal, mode-driven
    (Create / Submit / Upload / Approve / Reject / Appeal / Settlement)
```

Shared components reused as-is: `BooIconComponent`, `StatusBadgeComponent`, `EmptyStateComponent`, `DrawerComponent` (hosts the action dialog), `LocalLoadingService`, `ToastService`, `DialogService`, `SharedModule`.

---

## 7. UI Specification & Interaction Design

- **Claim card** (center queue): patient name + MRN, insurer chip, claim amount (formatted VND), hospital/department/doctor line, priority flag (Low/Normal/High/Urgent — left edge color bar, not a badge, to avoid badge-fatigue), submission date, circular progress indicator (workflow completion %), status badge, missing-documents pill (only rendered when > 0, amber), hover reveals quick actions (Open, Approve, Reject — icon buttons, no layout shift).
- **Density modes:** Compact (single-line, higher information density, virtual-scroll-ready), Comfortable (current card, default), Kanban (same card, grouped into 7 workflow-stage columns, horizontal scroll), Timeline (cards positioned on a horizontal date axis grouped by submission week).
- **Workflow rail:** each stage is a `button[role=tab]`-like chip showing stage label + live count; clicking sets the active stage filter (toggle — clicking the active stage clears the filter); active stage gets a filled pill, others are outlined.
- **Right inspector tabs:** `role="tablist"`, keyboard arrow navigation, same visual language as `AdminSurgeryComponent`'s tab bar but vertical-safe (wraps on narrow panel widths). Tabs: Overview, Documents, Medical Records, Billing, Approval Timeline, Communication, Notes, Audit Logs.
- **Document viewer:** embedded preview pane inside Documents tab — image documents render inline (`<img>`), PDFs/scans render inside an `<iframe>` sized to the panel, unsupported types fall back to a file-type icon + "Download" affordance. Drag-and-drop zone at the top of the tab (`dragover`/`drop` handlers, no new dependency), falls back to a hidden `<input type="file" multiple>` click affordance.
- **Floating widgets:** Claim Health ring (conic-gradient donut, 0–100, colored by band: ≥80 emerald / 50–79 amber / <50 rose), Risk Score gauge (same conic-gradient technique, inverted color bands), Missing Documents counter (numeral + icon, amber when > 0), Approval Velocity sparkline (inline CSS bar sparkline, last 7 submissions' days-to-decision) — all dependency-free, matching the "no new chart library" convention already used by Surgery/Laboratory dashboards.
- **Dialogs:** each of Create/Submit/Upload/Approve/Reject/Appeal/Settlement is a distinct `mode` of one `InsuranceClaimActionDialogComponent`, hosted in a `DrawerComponent` opened as a centered modal (width scoped per mode), so the queue and inspector remain mounted underneath (visible through the dim overlay) instead of navigating away.

---

## 8. Color Style

Scoped entirely to this module via CSS custom properties declared on the root `admin-insurance` host (`:host { --ic-*: ... }`) plus Tailwind arbitrary-value utilities (`bg-[var(--ic-...)]`) — **no changes to the global `tailwind.config.js` or `--twc-*` variables**, so no other page is affected.

| Token | Value | Usage |
|---|---|---|
| `--ic-ivory` | `#FAF7F0` | Page/panel background |
| `--ic-warm-gray-100..900` | `#F3EFE7 … #3A362E` | Panel borders, secondary text, dividers |
| `--ic-forest` | `#2F5233` | Primary accent — active tab, active stage, primary buttons |
| `--ic-forest-dark` | `#1F3A22` | Hover/pressed state of primary accent |
| `--ic-olive` | `#6B6B3A` | Secondary accent — priority flags, icons |
| `--ic-amber` | `#B8860B` | Warning tone — missing documents, risk mid-band |
| `--ic-emerald` | `#3E7C59` | Success tone — approved/settled, health high-band |
| `--ic-graphite` | `#2A2A28` | Primary text |
| `--ic-rose` | `#A6423B` | Danger tone — rejected, risk high-band (desaturated, not the app's default `rose-*`) |

`StatusBadgeComponent`'s `tone` API (`primary/success/warning/danger/neutral`) is reused as-is for consistency with the rest of the app, but its color mapping is **not** overridden — the module's distinct feel comes from the surrounding surfaces (ivory panels, forest rail, olive flags), not from re-skinning the shared badge, per "reuse shared components" in the project's architecture rules.

---

## 9. Proposed API Contract

| Purpose | Method | URL | Request | Response | Frontend Usage |
|---|---|---|---|---|---|
| List/search claims (queue) | GET | `/api/insurance/claims` | query: `search, status[], providerId, claimType, departmentId, doctorId, minAmount, maxAmount, dateFrom, dateTo, stage, folder, page, pageSize` | `PaginationData<InsuranceClaimCard>` | Center queue (all density modes) |
| Get claim detail | GET | `/api/insurance/claims/{id}` | — | `InsuranceClaimDetail` | Right inspector panel |
| Create claim | POST | `/api/insurance/claims` | `CreateInsuranceClaimRequest` (patientId, providerId, policyNumber, diagnosis, procedures[], claimAmount, departmentId, doctorId, priority) | `InsuranceClaimDetail` | Create Claim dialog |
| Update claim | PUT | `/api/insurance/claims/{id}` | `Partial<CreateInsuranceClaimRequest>` | `InsuranceClaimDetail` | Overview tab inline edits |
| Submit claim | POST | `/api/insurance/claims/{id}/submit` | `{ notes?: string }` | `InsuranceClaimCard` | Submit Claim dialog |
| Approve claim | POST | `/api/insurance/claims/{id}/approve` | `{ approvedAmount: number, notes?: string }` | `InsuranceClaimCard` | Approve dialog |
| Reject claim | POST | `/api/insurance/claims/{id}/reject` | `{ reason: string }` | `InsuranceClaimCard` | Reject dialog |
| Appeal claim | POST | `/api/insurance/claims/{id}/appeal` | `{ groundsForAppeal: string, attachmentIds?: string[] }` | `InsuranceClaimCard` | Appeal dialog |
| Settle claim | POST | `/api/insurance/claims/{id}/settle` | `{ settledAmount: number, settlementDate: string, method: string }` | `InsuranceClaimCard` | Settlement dialog |
| Upload document | POST | `/api/insurance/upload` | multipart: `claimId, file, documentType` | `ClaimDocument` | Documents tab / drag-drop |
| List providers | GET | `/api/insurance/providers` | — | `InsuranceProvider[]` | Left provider tree |
| Provider claim counts (tree) | GET | `/api/insurance/providers/tree` | — | `InsuranceProviderNode[]` | Left panel tree with counts |
| Search patients | GET | `/api/patients/search` | query: `q` | `PatientLookupResult[]` | Create Claim dialog patient picker |
| Claim stats / health | GET | `/api/insurance/claims/stats` | query: `dateFrom, dateTo` | `InsuranceClaimStats` | Floating widgets |
| Claim timeline | GET | `/api/insurance/claims/{id}/timeline` | — | `ClaimTimelineEvent[]` | Approval Timeline tab |
| Claim notes | GET/POST | `/api/insurance/claims/{id}/notes` | POST: `{ message: string }` | `ClaimNote[]` | Notes tab |
| Claim communication | GET/POST | `/api/insurance/claims/{id}/communication` | POST: `{ message: string, direction: 'Outbound' }` | `CommunicationMessage[]` | Communication tab |
| Claim audit log | GET | `/api/insurance/claims/{id}/audit-logs` | — | `AuditLogEntry[]` | Audit Logs tab |
| Saved searches | GET/POST | `/api/insurance/saved-searches` | POST: `{ name: string, query: object }` | `SavedSearch[]` | Toolbar Saved Views |

All endpoints are **not implemented** — the frontend calls them via `HttpService.getOr/postOr/patchOr`, which falls back to bundled mock data on failure (see `InsuranceClaimsService`), exactly the pattern used by `SurgeryService`. No caller changes will be needed when the backend lands.

---

## 10. Page States, Edge Cases, Accessibility, Responsive, Performance

- **Loading:** skeleton cards (3 shimmering placeholders) in the center queue while the initial `forkJoin` (claims + stats + providers tree) resolves; inspector panel shows a skeleton until a claim is selected.
- **Empty:** `EmptyStateComponent` in the center queue when a filter/folder yields zero claims ("No claims match these filters" + Clear Filters CTA); inspector shows an idle empty state ("Select a claim to view details") when nothing is selected.
- **Error:** retry banner identical in shape to Surgery's error state, scoped to the panel that failed to load (queue vs. inspector can fail independently).
- **Disabled:** action buttons (Approve/Reject/Appeal/Settle) disabled with a tooltip when the claim's current stage doesn't permit that action (e.g. Approve is disabled while stage = Document Collection).
- **Accessibility:** workflow rail and tabs use `role="tablist"`/`role="tab"`/`aria-selected`; drag-and-drop upload has a keyboard-operable fallback button; document viewer iframe has a descriptive `title`; all icon-only hover actions have `aria-label`; color is never the sole signal (priority flag also has a text label on focus/hover, status always paired with text).
- **Responsive:** desktop-first three-column layout; below `lg` the left panel collapses to the icon rail automatically and the right panel becomes an overlay (reuses `DrawerComponent`) instead of a fixed column; below `md` the workflow rail becomes horizontally scrollable and density defaults to Compact.
- **Performance:** queue list is paginated server-side (`pageSize` default 30) with "load more" rather than client-side filtering of a full array (fixes the current `getFilteredClaims()` anti-pattern); search input is debounced 300ms; Kanban/Timeline views reuse the same paginated dataset windowed by stage/date rather than fetching separately.

---

## 11. Enterprise Recommendations (Future Iterations)

- Replace the CSS drag-and-drop stand-in with a real upload progress pipeline once file storage is decided.
- Replace conic-gradient widgets with a proper chart library only if the module grows a dedicated analytics tab — current dependency-free approach matches the rest of the codebase's convention and keeps bundle size flat.
- True resizable/split panels (currently CSS `resize: horizontal`) could move to the Angular CDK's `Splitter`-equivalent if the app adopts one elsewhere.
- Saved Views/Searches should eventually sync per-user via the backend (`/api/insurance/saved-searches`) rather than `localStorage`, once auth-scoped preferences exist for other modules too.
