# Revenue Report — Redesign

Route: `/admin/finance/reports` · Component: `AdminRevenueReportComponent` · Backend: `api/revenue-report/*` (`RevenueReportEndpoints.cs`, `RevenueReportScope.cs`).

This revision supersedes the first redesign (which replaced a static mock with live data). The data layer stays; the page structure, state handling, filters and definitions are reworked.

## UX Audit / Current Problems

Found by reading the page, its eleven section components, the service and the backend handlers.

| # | Problem | Evidence |
|---|---|---|
| 1 | Flat wall of cards: KPI strip, two charts, two tables, three cards and a table with no hierarchy and no statement of what each block measures. | `revenue-report.component.ts` template |
| 2 | Figures with different bases sit side by side without saying so. "Revenue" is paid payments by **payment date**; the register table lists **bills by bill date** and shows the bill total; "Outstanding" in the KPI strip is bills **dated in the period**, while the aging card is bills dated **up to the end date, as of today**. | `RevenueReportScope` summary comments, `OutstandingBills`, `BillsIn` |
| 3 | The "Transactions" KPI counts payments, the table beneath lists bills, so the two counts never match. | `GetRevenueSummaryQueryHandler` (`TotalTransactions = payments.Count`) |
| 4 | Filter bar mutates its `@Input` filter, emits on every date-picker change (two requests when a preset sets start then end) and cannot show a drill-down: clicking a department row filtered only the transactions, so the department select, the KPIs and the charts disagreed. | `revenue-filter-bar.component.ts`, `onDrilldown` |
| 5 | No invalid-filter state: start after end is silently swapped by the backend (`Range()`), an empty date posts an invalid body. | `RevenueReportScope.Range` |
| 6 | Errors are toasts only; a failed section keeps showing stale or empty data as if it were "no data". `res.success === false` is ignored. | all `load*` methods |
| 7 | Overlapping requests: nothing is cancelled, so a slow response for an old filter can overwrite a newer one. | no `switchMap` |
| 8 | Dates built with `toISOString()` shift to UTC, so late-evening local times send yesterday's date. | `buildDefaultFilter`, `applyPreset` |
| 9 | The trend chart renders a flat stacked area when every bucket is zero (the backend emits empty buckets), instead of an empty state. | `BuildTrend` |
| 10 | The route is guarded by `billing:bill:read` but every endpoint requires `finance:revenue-report:read` (export: `…:export`). A user with only the bill permission gets a page full of 403 toasts. The frontend permission constants do not contain the Finance revenue-report codes. | `admin.routes.ts`, `Permissions.cs`, `permission.constant.ts` |
| 11 | The Print button calls template `REVENUE_REPORT_SUMMARY`, which exists nowhere in the repo or seed data, so it always fails with "Failed to render template". | grep of `physio-server` and `physio-app/src` |
| 12 | Insurance provider is a supported backend filter but has no control. Search (bill / patient number) is supported but has no control. | `RevenueReportFilter` |
| 13 | Growth is `+100%` whenever the previous period had no revenue; the API gives no baseline to tell the two cases apart. | `GrowthPct` |

## Information Architecture

The page is organised by the **question the reader is asking**, and every section states its basis.

1. **Header** — title, the active period in words, Refresh, Export (permission gated).
2. **Reporting toolbar** (sticky) — *Period* (presets, From, To, Granularity) and *Scope* (Department, Doctor, Payment method, Insurance provider, Search), active-filter chips, reset, invalid-range message.
3. **Summary** — "What came in?" A headline panel (collected → refunds → net, growth vs previous period) next to two labelled metric groups: *Collections* and *Billing and receivables*.
4. **Trend and mix** — "How is it moving, and through which channel?" Stacked trend by payment method + payment-method split.
5. **Breakdown** — "Where does it come from?" One tabbed card: Departments / Doctors / Insurance. Rows drill into the whole report (not just one table).
6. **Receivables and adjustments** — "What is still owed, what went back?" Aging buckets with the oldest invoices; refunds and discounts.
7. **Bill register** — "Show me the records." Paginated bills with status; row opens the bill drawer.

### Metric definitions (shown in the page under "How these figures are calculated")

| Label | Backend definition |
|---|---|
| Collected revenue | Sum of `Paid` payments with payment date in the period. |
| Refunds | Sum of refund amounts with refund date in the period. |
| Net collected | Collected revenue − Refunds (server-computed `netRevenue`). |
| Payments | Count of paid payments in the period (`totalTransactions`). |
| Patients | Distinct patients with a paid payment or a bill in the period. |
| Average bill | Mean bill total of non-cancelled bills dated in the period. |
| Discounts | Sum of discount amounts of bills dated in the period. |
| Outstanding (summary) | Unpaid balance of non-cancelled, non-waived bills **dated in the period**. |
| Outstanding (aging) | Unpaid balance of bills dated **up to the end date**, aged **as of today** from due date (or bill date). |
| Growth | Collected revenue vs the immediately preceding period of equal length. |
| Currency | Aggregates sum amounts without converting currency. Bills default to USD; the page formats as USD, consistent with the cashier page. |

## User Journey

1. Finance lead opens the page → default period is the last 30 days, daily.
2. Reads headline and net; compares with previous period via the growth badge.
3. Narrows scope (department / payment method) → every section refreshes once.
4. Spots a department in the breakdown → clicks it → the filter chip appears, the whole report is re-scoped.
5. Opens the register, finds a bill, opens the drawer for line items and splits.
6. Exports the same filter to Excel.

## Layout

Desktop-first, max content width follows the admin shell.

```
┌ Revenue Report                                  [Refresh] [Export] ┐
│ 24 Sep – 23 Oct 2026 · Daily · All departments                      │
├ sticky toolbar ─────────────────────────────────────────────────────┤
│ PERIOD  (Today)(7d)(30d)(Month)(Quarter)  From [..] To [..] Gran [..]│
│ SCOPE   Dept [..] Doctor [..] Method [..] Insurer [..] Search [..]   │
│ chips: Department: Physio ✕   Method: Cash ✕            [Reset]      │
├ SUMMARY ────────────────────────────────────────────────────────────┤
│ ┌ Collected revenue ─────────┐ ┌ Collections ─────────────────────┐ │
│ │ $128,400   ▲ 8.2% vs prev  │ │ Payments · Patients · Insurance  │ │
│ │ − Refunds   $2,100         │ ├ Billing & receivables ───────────┤ │
│ │ = Net       $126,300       │ │ Avg bill · Discounts · Outstanding│ │
│ └────────────────────────────┘ └──────────────────────────────────┘ │
├ TREND & MIX ────────────────────────────────────────────────────────┤
│ ┌ Collected per day (stacked by method) ──────┐ ┌ Payment methods ┐ │
├ BREAKDOWN ──────────────────────────────────────────────────────────┤
│ [Departments] [Doctors] [Insurance]  table / provider list          │
├ RECEIVABLES & ADJUSTMENTS ──────────────────────────────────────────┤
│ ┌ Outstanding aging + oldest invoices ┐ ┌ Refunds | Discounts ────┐ │
├ BILL REGISTER ──────────────────────────────────────────────────────┤
│ table (paginated)                                                    │
└──────────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
AdminRevenueReportComponent (page, signals, request orchestration)
├── revenue-report-section.ts          (per-section loader: state + switchMap + retry; not a component)
├── RevenueFilterBarComponent          (controlled, stateless: [filter] → (filterChange); BooFilterChips)
├── RevenueKpiStripComponent           (headline + two metric groups + definitions)
├── RevenueTrendChartComponent         (ngx-charts stacked area)
├── RevenuePaymentMethodChartComponent (ngx-charts doughnut + amounts)
├── RevenueDepartmentTableCardComponent / RevenueDoctorTableCardComponent / RevenueInsuranceCardComponent
├── RevenueOutstandingCardComponent, RevenueRefundDiscountCardComponent
├── RevenueTransactionsTableCardComponent (boo-table-admin)
├── RevenueTransactionDrawerComponent
└── @physioboo/ui: BooInlineErrorComponent, BooEmptyStateComponent, BooFilterChipsComponent, BooStatusBadgeComponent
```

Reused app components: `AdminContentHeaderComponent`, `ButtonIconComponent`, `BooDatepickerComponent`, `BooSelectComponent`, `BooTableAdminComponent`. Charting: the existing `@swimlane/ngx-charts` (no new dependency).

## UI Specification

- Surfaces: `bg-surface border border-borderGray/60 rounded-2`; section eyebrows `text-xs font-semibold uppercase tracking-wide text-secondary` with a one-line basis note.
- Numbers: `tabular-nums`, right-aligned, `Intl`-formatted USD; counts with thousands separators.
- Growth badge: `BooStatusBadge` success/danger with an arrow icon and text (colour is never the only signal).
- Status badges in the register use `BooStatusBadge` tones: Paid → success, Partial/Pending → warning, Refunded/Void → danger.
- Chart palette: the existing categorical set, one colour per payment method, identical in the trend and the split.

## Interaction Design

- Presets set both dates in one change → one refresh. Custom dates refresh only when the range is valid.
- Search is debounced (400 ms) and ignored under 2 characters except when cleared.
- Every change is compared to the current filter; an identical filter issues no requests.
- A new filter cancels in-flight requests of the previous one (`switchMap`), so a slow older response can never overwrite a newer one.
- Breakdown tabs load lazily: only the visible tab is requested, and a tab is re-requested only if the filter changed since it last loaded.
- Row click on a department/doctor adds it to the filter (chip + select update) and refreshes the whole report.
- Export posts the current valid filter; disabled without `finance:revenue-report:export`, while loading, and while the filter is invalid.

## Responsive Behavior

- ≥1024 px: layouts above. 640–1023 px: summary panel stacks above the metric groups, trend above mix, outstanding above adjustments. <640 px: single column; toolbar controls full width in a 1/2-column grid; tables scroll horizontally inside their card (`boo-table-admin`). Toolbar is sticky only from `lg`.

## Accessibility

- Each section is `<section aria-labelledby>` with a real heading; chips are buttons with "Remove filter …" names; inline errors use `role="alert"`; loading regions use `aria-busy`.
- The invalid-range message is tied to the date inputs and announced with `role="alert"`.
- Tabs use `role="tablist"/"tab"/"tabpanel"` with `aria-selected` and arrow-key navigation.
- Charts are not the only carrier of the data: the payment-method split lists amounts as text, and the trend has a visually-hidden summary line (total and peak bucket) taken from the response.
- Touch targets ≥ 40 px on preset and tab buttons below `lg`.

## Page States

| State | Behaviour |
|---|---|
| No permission (`finance:revenue-report:read`) | Page shell with an access panel; **no request is made**. |
| Loading | Skeletons shaped like the final content per section; the toolbar stays interactive. |
| Empty | Per section message that names the period; no zero-filled charts (an all-zero trend counts as empty). |
| Error | Per-section `boo-inline-error` with retry (retrying/failed states). One failing section never blanks the others. A 403 on a section shows the access message instead of "try again". |
| Invalid filter | Message under the date range; requests are not sent; the previous results stay visible, marked as not matching the toolbar. |
| Success | Normal. |
| Disabled | Export/Refresh disabled while their request runs; Export disabled when filter invalid or permission missing. |

## Edge Cases

- Start after end, an empty/cleared date, or a Daily range longer than 366 days (blocked with a hint to switch to Weekly/Monthly — it would produce hundreds of bars).
- Department/doctor lookups return at most 100 options (existing lookup size); a missing option does not break the filter.
- Insurance filter is hidden without `admin:insurance-company:read` (needed to list providers).
- Payments without a bill and bills without an appointment are absent from department/doctor lists, so their totals may be lower than headline revenue; the page does not add the rows up and does not claim they reconcile.
- Zero revenue but non-zero outstanding; refunds greater than collections (negative net) formatted with a minus sign.
- Drill-down to a department that has no rows after another filter is applied → empty states, chips still removable.

## Performance Considerations

- All aggregation stays server-side; the page never sums rows.
- Initial load fires summary, trend, payment methods, the active breakdown tab, outstanding (2 calls), adjustments (2 calls) and the first register page in parallel; inactive breakdown tabs are not requested.
- Stale requests are cancelled; identical filters do not refetch; search is debounced.
- Register is server-paginated (10/page).

## Scalability

- A filter model change (e.g. a new dimension) touches `RevenueReportFilter`, the filter bar and the section loaders only.
- Sections are independent loaders, so a heavy aggregate can later move to its own endpoint, cache or export job without page changes.
- Trend point count is bounded by the 366-day Daily guard.

## Enterprise Recommendations

1. **Currency**: expose `currency` (or group totals per currency) in every aggregate; today mixed-currency bills would be summed.
2. **Permission alignment**: seed/menu use `billing:bill:read`, the API uses `finance:revenue-report:read`. Align the menu seed and route guard on the finance permission so users are not shown a page they cannot load.
3. **Previous-period baseline**: return `previousRevenue` so "+100%" can be distinguished from "no previous data".
4. **One basis for counts**: add `billCount` (and `paidBillCount`) to the summary so the KPI and the register agree, or add a payments register.
5. **Totals**: return `totals` on the register and breakdown endpoints (including unassigned rows) so a footer can be shown without client math.
6. **Status filter** for the register (`paymentStatuses`), since the table is organised by status.
7. **Printing**: create the `REVENUE_REPORT_SUMMARY` print template (or drop the button) — currently absent.
8. **Audit**: log exports with the filter used.
9. Replace the 100-row lookups with server-side searchable selects.

## Proposed API Contract

Endpoints below already exist and were read from the backend source; all return `ResponseMessage<T>` (`success`, `data`, `errors`) and require `finance:revenue-report:read` (export: `finance:revenue-report:export`). `RevenueReportFilter` = `{ start, end, granularity?, departmentIds?, doctorIds?, paymentMethods?, insuranceProviderIds?, search? }`.

| Purpose | Method + URL | Request | Response (`data`) | Frontend usage |
|---|---|---|---|---|
| KPI totals + growth | `POST /api/revenue-report/summary` | `RevenueReportFilter` | `RevenueSummary` | Summary panel |
| Collected per bucket by method | `POST /api/revenue-report/trend` | filter | `RevenueTrendPoint[]` | Trend chart |
| Collected by method | `POST /api/revenue-report/payment-methods` | filter | `PaymentMethodBreakdown[]` | Mix chart |
| Revenue by department | `POST /api/revenue-report/departments` | filter | `DepartmentRevenuePerformance[]` | Breakdown tab |
| Revenue by doctor | `POST /api/revenue-report/doctors` | filter | `DoctorRevenuePerformance[]` | Breakdown tab |
| Insurance claim amounts | `POST /api/revenue-report/insurance` | filter | `InsuranceProviderRevenue[]` | Breakdown tab |
| Aging buckets | `POST /api/revenue-report/outstanding/summary` | filter | `OutstandingAgingSummary[]` | Receivables |
| Oldest outstanding invoices | `POST /api/revenue-report/outstanding/search` | `PagedRequest<filter>` | `PagedResult<OutstandingInvoice>` | Receivables |
| Refunds | `POST /api/revenue-report/refunds/search` | `PagedRequest<filter>` | `PagedResult<RefundRecord>` | Adjustments |
| Discounts | `POST /api/revenue-report/discounts/search` | `PagedRequest<filter>` | `PagedResult<DiscountRecord>` | Adjustments |
| Bill register | `POST /api/revenue-report/transactions/search` | `PagedRequest<filter>` | `PagedResult<RevenueTransaction>` | Register |
| Bill detail | `GET /api/revenue-report/transactions/{id}` | — | `RevenueTransactionDetail` | Drawer |
| Excel export | `POST /api/revenue-report/export` | filter | `.xlsx` blob | Export button |

Proposed additions (not implemented, not assumed by the UI): `currency` on every aggregate; `previousRevenue` on summary; `billCount` on summary; `totals` on register and breakdown responses; `paymentStatuses` in `RevenueReportFilter`. Lookups reuse `departments/search`, `doctors/search`, `insurance-companies/search`.
