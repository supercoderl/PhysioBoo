# Revenue Report - Redesign

## UX Audit / Current Problems
The existing `AdminRevenueReportComponent` (`finance/reports`) is a static mock: hardcoded totals, raw `<table>`/`<input type="date">` markup, `alert()` for export, no pagination, no drill-down, no loading/empty/error states, and raw Tailwind grays/gradients instead of the app's semantic tokens (`bg-surface`, `text-secondary`, etc.). It does not reuse `boo-table-admin`, `boo-select`, `boo-datepicker`, `DialogService`, `ToastService`, or `LocalLoadingService`. It has no way to filter by department/doctor/payment method/insurance, no aging analysis for outstanding revenue, and no refund/discount analytics.

## Information Architecture
1. Header - title, granularity toggle (Day/Week/Month), Refresh, Export.
2. Filter bar - date range presets + custom range, department, doctor, payment method, insurance provider, free-text search, reset.
3. KPI strip - Total Revenue (with trend sparkline), Net Revenue, Avg. Bill Value, Outstanding, Refunds, Discounts, Insurance Revenue, Transactions.
4. Trend + Payment Method charts (2-column row).
5. Department Performance table + Doctor Performance table (tab or 2-column row on wide screens).
6. Insurance Revenue card (by provider, claim status).
7. Outstanding Revenue card (aging buckets 0-30/31-60/61-90/90+).
8. Refund Analysis / Discount Analysis (2-column row).
9. Transactions drill-down table (full `boo-table-admin`: sort, filter, pagination) - row click opens a read-only detail drawer with line items, payment splits, insurance claim, refunds/discounts.

Clicking a department or doctor row applies it as an active filter and scrolls to the Transactions section, rather than opening a second drawer type - keeps drill-down to one interaction pattern per record depth (list to filtered list to single-record drawer).

## Component Hierarchy
```
AdminRevenueReportComponent (page)
├── RevenueFilterBarComponent
├── RevenueKpiStripComponent (admin-analytic-card for headline + boo-stat-card for the rest)
├── RevenueTrendChartComponent (ngx-charts area/line, granularity-aware)
├── RevenuePaymentMethodChartComponent (ngx-charts pie/advanced-pie + legend)
├── RevenueDepartmentTableCardComponent (boo-table-admin)
├── RevenueDoctorTableCardComponent (boo-table-admin)
├── RevenueInsuranceCardComponent
├── RevenueOutstandingCardComponent
├── RevenueRefundDiscountCardComponent
├── RevenueTransactionsTableCardComponent (boo-table-admin)
└── RevenueTransactionDrawerComponent (drawer, read-only)
```

## States
- **Loading**: `LocalLoadingService` keys per section (`summary`, `trend`, `departments`, `doctors`, `insurance`, `outstanding`, `refunds`, `discounts`, `transactions`); `boo-table-admin`'s built-in `[loading]` skeleton for tables, skeleton placeholders for KPI/chart cards.
- **Empty**: each card/table renders a centered icon + message when its data set is empty (e.g. no transactions in range).
- **Error**: `ToastService.error(...)` on failed fetch, per section, without blocking the rest of the page.
- **Success**: normal populated state.
- **Disabled**: Export disabled while `loading('export')`; filter inputs disabled while their dependent section is loading.

## Interaction Design
- Changing any filter re-queries all sections (summary/trend/tables) with the same `RevenueReportFilter`.
- Department/doctor row click -> pushes `departmentIds`/`doctorIds` into the filter and scrolls to Transactions.
- Transaction row click -> opens `RevenueTransactionDrawerComponent` (read-only, reuses generic `<drawer>` shell).
- Export -> `RevenueReportService.export(filter)` returns `{ fileUrl }`, opened in a new tab (same convention as `STOCK_TAKE.EXPORT`).
- Print -> `PrintService.print('REVENUE_REPORT_SUMMARY', { summary, filter }, { skipPreview: false })`.

## Responsive Behavior
Desktop-first. KPI strip becomes horizontally scrollable below `lg`. Charts and performance tables collapse from 2-column to 1-column below `lg`. Filter bar collapses from a 6-column grid to 2/1 columns below `lg`/`sm`. Transactions table relies on `boo-table-admin`'s existing horizontal scroll on narrow viewports.

## Accessibility
Semantic buttons/labels for all filter controls (reusing `boo-select`/`boo-datepicker`, which already handle focus/keyboard). Table rows opening the drawer are real `<button>`/clickable rows with `tabindex` via `boo-table-admin`'s existing row semantics. Color is never the sole signal (status badges always carry text). Chart color scheme kept to a single accent per series with sufficient contrast.

## Edge Cases
- Zero data in selected range across all sections.
- Department/doctor with revenue but zero patients (avoid divide-by-zero on avg/patient).
- Outstanding invoice with no due date.
- Transaction with multiple payment splits (partial cash + insurance).
- Very large transaction counts - always paginated server-side, never fetched in full.

## Performance
All aggregation (summary, trend, breakdowns) computed server-side; the frontend never aggregates raw transactions client-side. Transactions table is server-paginated. Charts capped to the selected granularity's point count (no unbounded series).
