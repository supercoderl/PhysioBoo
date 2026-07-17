# Marketing Campaign (CRM) — Redesign

## 0. Summary

Replace the current `marketing-campaign` page (a single-file, inline-template demo with
hard-coded rows, `alert()`/`confirm()` stubs, and no service layer — see §1) with a
**Marketing Campaign** list module that matches the rest of the CRM: a KPI strip, a filter
bar, a `boo-table-admin` list, and a create/edit **drawer** — following the exact
list + table-card + drawer pattern already used by `crm/patient`.

Visual identity: reuse the CRM house style as-is (KPI strip of `boo-stat-card` tiles, sticky
`admin-content-header`, `boo-table-admin`, right-side `drawer`). No new visual language is
introduced — the goal is architectural conformance, not a redesign of the aesthetic.

## 1. UX Audit — Current State

**Files:**
`src/app/pages/admin/crm/marketing-campaign/marketing-campaign.component.ts`,
`src/app/shared/types/campaign.types.ts`, `src/app/shared/types/audience-segment.types.ts`

- Single standalone component, fully inline template/logic, 6 hard-coded `Campaign` rows and
  5 hard-coded `AudienceSegment` rows — no service layer, no pagination, no drawer, no
  `boo-table-admin`.
- Stats are computed client-side from the hard-coded array (`getActiveCampaigns()`,
  `getTotalReach()`, `getTotalConversions()`) instead of coming from a stats endpoint.
- Filters are plain `<select>`/`<input>` with `[(ngModel)]` and client-side `Array.filter`
  (`applyFilters()`), no debounce, no server round-trip.
- Grid/List view toggle re-implements the same data twice in the template (card grid +
  native `<table>`), duplicating status-badge and budget-bar markup.
- Every mutation (`createCampaign`, `saveDraft`, `pauseCampaign`) mutates the local array and
  calls `alert()`/`confirm()` — nothing persists, inconsistent with `DialogService` /
  `ToastService` used everywhere else in the admin app.
- `Campaign` (in `campaign.types.ts`) stores `targetAudience` as a free-text string instead of
  a reference to `AudienceSegment`, so segment sizing/criteria can't be looked up or reused by
  the API layer.
- No `campaign.service.ts` exists under `src/app/services/admin/`.

## 2. Current Problems

| # | Problem | Impact |
|---|---|---|
| 1 | No service layer / hard-coded data | Page cannot talk to a real backend; nothing persists |
| 2 | `alert()`/`confirm()` for every action | Inconsistent with `DialogService`/`ToastService` conventions used across the app |
| 3 | No `boo-table-admin`, no drawer | Doesn't match the CRM's `crm/patient` list+drawer pattern; harder to maintain/extend |
| 4 | Client-side filtering only | No pagination, no server-side search — won't scale past a handful of campaigns |
| 5 | `targetAudience` as free text | Can't validate against real segments or show segment size/criteria in the form |
| 6 | Duplicate grid/list markup | Same campaign fields rendered twice, doubling the surface for bugs |
| 7 | Stats computed client-side | Won't reflect server-side aggregates (e.g. spend across paginated results) |

## 3. Information Architecture

```
Marketing Campaign (route: admin/crm/marketing-campaign)
├── Header — title, "New Campaign" button
├── KPI Strip — Total Campaigns · Active · Total Reach · Conversions (boo-stat-card x4)
├── Table Card — boo-table-admin
│   Columns: Campaign (name + code) · Type · Status · Audience · Duration · Budget/Spent · Reach · Conversions · Actions
└── Drawer (create / edit)
    ├── Details        — Name, Type, Goal, Status (edit-only)
    ├── Audience        — Segment select (shows count), Start/End Date
    ├── Budget          — Budget amount, Spent (edit-only, read-only display)
    └── Description     — free text
```

No separate detail/analytics page in this pass — row click opens the same drawer used for
edit, consistent with `crm/patient`. A dedicated campaign-analytics page is a candidate for a
future iteration, not in scope here.

## 4. User Journey

1. Marketing/CRM staff opens **Marketing Campaigns** → KPI strip shows Total / Active / Reach /
   Conversions; table lists campaigns paginated, most recent first.
2. Searches by name or filters by Type / Status via the table's built-in search + filter
   affordances (same as `crm/patient`).
3. Clicks **New Campaign** → drawer opens with Details/Audience/Budget/Description sections →
   picks an Audience Segment (segment size shown inline) → sets dates and budget → **Save**
   creates the campaign as `Draft` and the row appears optimistically at the top of the table.
4. Clicks a row (or its "Edit" action) → drawer opens pre-filled via `search_by_id` → staff can
   change Status (e.g. Draft → Scheduled → Active → Paused/Completed/Cancelled), edit budget,
   dates, or description → **Save Changes**.
5. From the row action menu, staff can **Delete** a campaign → `DialogService.confirmDelete`
   confirmation → optimistic removal with rollback on error (same as `crm/patient`).

## 5. Layout

Desktop (≥1280px):

```
┌──────────────────────────────────────────────────────────────────────────┐
│ admin-content-header: "Marketing Campaigns"                [+ New]        │
├──────────────────────────────────────────────────────────────────────────┤
│ KPI STRIP — Total Campaigns · Active · Total Reach · Conversions          │
├──────────────────────────────────────────────────────────────────────────┤
│ boo-table-admin                                                          │
│  Campaign | Type | Status | Audience | Duration | Budget | Reach | Conv. │
│  ...paginated rows...                                                    │
└──────────────────────────────────────────────────────────────────────────┘
                                                    ┌───────────────────────┐
                                                    │ DRAWER (760px)         │
                                                    │ Details / Audience /   │
                                                    │ Budget / Description   │
                                                    └───────────────────────┘
```

Mobile (< 768px): KPI strip collapses to a 2-column grid (`grid-cols-2`), table scrolls
horizontally inside `boo-table-admin` (existing behavior), drawer becomes full-width (existing
`drawer` component behavior).

## 6. Component Hierarchy

```
CrmMarketingCampaignListComponent      (pages/admin/crm/marketing-campaign/list.component.ts)
├── AdminContentHeaderComponent
├── ButtonIconComponent                 ("New Campaign")
├── CrmCampaignKpiStripComponent        (boo-stat-card x4)
├── CrmCampaignTableCardComponent       (boo-table-admin + boo-action-admin)
└── CrmCampaignDrawerComponent          (drawer + reactive form)
```

## 7. UI Specification

- KPI tiles: `boo-stat-card` — `Total Campaigns` (icon `megaphone`, tone `primary`),
  `Active` (icon `zap`, tone `success`), `Total Reach` (icon `users`, tone `neutral`),
  `Conversions` (icon `target`, tone `warning`).
- Status badge colors (table + drawer), matching existing badge conventions:
  `Draft` gray, `Scheduled` blue, `Active` green, `Paused` amber, `Completed` purple,
  `Cancelled` red.
- Type badge: plain text label (Email / SMS / Social / Multi-Channel / Push), no color coding
  (mirrors `patient` table's plain "Type" column).
- Budget cell shows `Spent / Budget` with a slim progress bar identical in spirit to the
  original prototype's budget bar, but as a compact inline bar (`h-1.5`) under the two values.

## 8. Interaction Design

- Row click or "Edit" action opens the drawer in edit mode (`currentId` set).
- "New Campaign" opens the drawer in create mode (`currentId = null`).
- Save: create → `POST /api/campaigns`, then `GET /api/campaigns/{id}` to hydrate the full
  row (same two-step pattern as `patient-drawer`) → `saveSuccess` emits → list does an
  optimistic insert/update.
- Delete: `DialogService.confirmDelete` → optimistic removal → rollback toast on error.
- Status transitions are edited via a `boo-select` in the drawer, not a separate quick-action
  menu, keeping scope aligned with `patient`'s edit-only-in-drawer pattern (a "Pause"
  quick-action can be added later using `ROLE`-style dedicated endpoints if needed).

## 9. Responsive Behavior

Same as `crm/patient`: `boo-table-admin` scrolls horizontally on narrow viewports, KPI strip
reflows to `grid-cols-2`, drawer becomes full-width below `md`.

## 10. Accessibility

- All form fields use `boo-input`/`boo-select`/`boo-textarea` (already keyboard-navigable,
  labelled).
- Status/Type badges carry sufficient text contrast (existing badge palette already
  WCAG-AA-checked elsewhere in the app; reused as-is).
- Drawer close button and destructive "Delete" action both keyboard-reachable, matching
  `patient-drawer`.

## 11. Page States

- **Loading:** `boo-table-admin`'s built-in `loading` shimmer, driven by
  `loadingSrv.isLoading('search')`.
- **Empty:** `boo-table-admin`'s built-in empty state (no campaigns match filters).
- **Success:** table populated, KPI strip reflects current aggregate stats.
- **Error:** `ToastService.error(...)` on failed create/update/delete, with optimistic
  rollback for delete (identical to `patient` list).
- **Disabled:** drawer form fields disabled + spinner overlay while `search_by_id` is loading
  an existing campaign (`loadingSrv.isLoading('search-by-id')`), matching `patient-drawer`.

## 12. Edge Cases

- Deleting the last item on the current page steps back a page (same logic as
  `CrmPatientListComponent.onDelete`).
- Segment with 0 members can still be selected (informational only, not blocking).
- End Date before Start Date: client-side validation error on the drawer form (`Validators`),
  no dedicated backend rule assumed beyond standard field validation.

## 13. Performance Considerations

- Server-side pagination/search/sort via `POST /api/campaigns/search` (identical contract
  shape to `PatientService.search`), so the page never loads more than one page of campaigns
  at a time.
- KPI numbers come from a dedicated `GET /api/campaigns/stats` call, not computed by summing
  all campaigns client-side.

## 14. Scalability

- `CampaignFilter` follows the same `{ start, end, type, status }` shape as other CRM filters
  (`PatientFilter`, `HospitalFilter`), so it composes with the existing filter-bar/table
  filter affordances without new UI primitives.
- Audience segments are referenced by `audienceSegmentId`, so segment management can be
  extracted into its own admin screen later without touching the campaign contract.

## 15. Enterprise Recommendations

- Add a dedicated campaign-analytics/detail page (funnel, channel breakdown) as a follow-up —
  out of scope for this pass, which focuses on bringing the list to parity with the rest of
  the CRM.
- Consider a bulk-action bar (`boo-table-admin` already supports `BulkAction`) for
  pause/cancel across multiple campaigns once the backend exposes bulk endpoints.

---

## 16. Proposed API Contract

No backend implementation in this pass — these are placeholder-service methods aligned to
the same contract shape as `PatientService`, ready to be wired to a real backend.

### 16.1 Search campaigns

- **Purpose:** Paginated, filtered, sorted campaign list for the table.
- **Method:** `POST`
- **URL:** `/api/campaigns/search`
- **Request:**
  ```json
  {
    "pageNumber": 1,
    "pageSize": 10,
    "search": "wellness",
    "sort": "-createdDate",
    "filter": {
      "start": "2026-01-01",
      "end": "2026-12-31",
      "type": null,
      "status": null
    }
  }
  ```
- **Response:** `PagedResponse<PaginationData<Campaign>>` (same envelope as `PatientService.search`)
- **Frontend usage:** `CrmMarketingCampaignListComponent.loadCampaigns()`

### 16.2 Get campaign by id

- **Purpose:** Hydrate the drawer on edit, and re-fetch the full row after create/update.
- **Method:** `GET`
- **URL:** `/api/campaigns/{id}`
- **Response:** `PagedResponse<Campaign | null>`
- **Frontend usage:** `CrmCampaignDrawerComponent.loadDetail()`

### 16.3 Create campaign

- **Purpose:** Create a new campaign (starts as `Draft`).
- **Method:** `POST`
- **URL:** `/api/campaigns`
- **Request:** `CreateCampaignRequest` (name, type, audienceSegmentId, startDate, endDate, budget, goal, description)
- **Response:** `PagedResponse<string>` (new campaign id)
- **Frontend usage:** `CrmCampaignDrawerComponent.onSave()` (create branch)

### 16.4 Update campaign

- **Purpose:** Edit an existing campaign, including status transitions.
- **Method:** `PATCH`
- **URL:** `/api/campaigns/{id}`
- **Request:** `UpdateCampaignRequest` (same fields as create, plus `status`)
- **Response:** `PagedResponse<string>`
- **Frontend usage:** `CrmCampaignDrawerComponent.onSave()` (update branch)

### 16.5 Delete campaign

- **Purpose:** Remove a campaign.
- **Method:** `DELETE`
- **URL:** `/api/campaigns/{id}`
- **Response:** `PagedResponse<string>`
- **Frontend usage:** `CrmMarketingCampaignListComponent.onDelete()`

### 16.6 Campaign stats

- **Purpose:** Aggregate KPI numbers for the strip (independent of table pagination).
- **Method:** `GET`
- **URL:** `/api/campaigns/stats`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "totalCampaigns": 42,
      "activeCampaigns": 7,
      "totalReach": 128500,
      "totalConversions": 3120
    }
  }
  ```
- **Frontend usage:** `CrmMarketingCampaignListComponent.loadStats()` → `CrmCampaignKpiStripComponent`

### 16.7 Audience segment lookup

- **Purpose:** Populate the Audience Segment `boo-select` in the drawer.
- **Method:** `GET`
- **URL:** `/api/audience-segments/lookup`
- **Response:** `PagedResponse<{ id: string; name: string; count: number }[]>`
- **Frontend usage:** `CrmCampaignDrawerComponent` (segment options, loaded once via a resolver or on drawer open)
