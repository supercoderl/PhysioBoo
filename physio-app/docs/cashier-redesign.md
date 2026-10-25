# Cashier — Redesign (`/admin/finance/cashier`)

Route permission: `billing:bill:read`. Last synchronized with the implementation: 2026-10-24.

## 0. Summary

The previous page was a dark hero with eight KPI tiles, a "Find a bill" panel, a two-tab table and a
detail panel. It was written against a mock backend, and the real backend (`CashierEndpoints.cs`) now exists
with a different contract. The page could not work: the service sent no query parameters (the
`pageNumber`, `pageSize` and `limit` parameters are required by the endpoints), the types used names the API
never returns (`invoiceNo`, `PartiallyPaid`, `CreditCard`…), and totals were recomputed in the browser.

The redesign is a **queue + checkout** workspace:

- a plain page header, four *real* summary figures and one toolbar;
- a compact **bill queue** on the left (what needs attention, sorted by the API by bill date);
- a **bill panel** on the right that shows the selected bill's charges, totals, payments and every action the
  user is permitted to take, without leaving the queue;
- payment, refund, discount and insurance are focused **dialogs** started from the bill panel; the server's
  response replaces local state, nothing is recomputed in the browser.

## 1. UX Audit (previous page)

| Area | Finding |
|---|---|
| Hierarchy | Dark hero with 8 equal tiles competes with the work; two of them (`averagePaymentTimeSeconds` is always 0, `cardPayments`/`insuranceClaims` are method splits) carry no decision value. |
| Search | "Find a bill" panel with barcode input, a dead "Advanced Filters" disclosure (date/department emitted nothing) and a free-text department box. |
| List | One wide table with 9 columns incl. 4 amounts and a row action menu duplicating the detail panel's actions. |
| Detail | Edited discount/insurance inline with client-side recomputation of totals and status. |
| Payment | Free-typed amounts, fictional methods (`CreditCard`, `QRCode`, `Corporate`, `Mixed`) the API rejects. |
| Trust | Success toasts and local state updates were not driven by the server's returned invoice. |

## 2. Current Problems (and resolution)

1. API contract mismatch → types, service and enums rewritten from the backend view models.
2. Filter/paging parameters not sent → service builds `HttpParams` (`pageNumber`, `pageSize`, `search`, `status`, `dateFrom`, `dateTo`).
3. Totals computed in the browser → removed; the response of every mutation is the updated invoice.
4. Dead date filter → wired (`dateFrom` / `dateTo`, `DateOnly`).
5. Permission handling used only the route guard → every mutation is gated by its own permission (§7).
6. No duplicate-submit protection → each dialog locks while its request is in flight.
7. Form data lost on failure → dialogs stay open with their values until the server accepts.

## 3. Information Architecture

```
Cashier
├── Header ............ title, one-line context, Refresh
├── Summary strip ..... collected today · outstanding · refunded today · payments today   (GET /dashboard)
├── Workspace (xl: 2 columns, below xl: queue + drawer)
│   ├── Queue column
│   │   ├── Toolbar ... search, status, date from/to, Reset, active filter chips
│   │   ├── Tabs ...... Bills | Recent payments (needs billing:payment:read)
│   │   └── Bills list or Recent payments list (paged / latest 100)
│   └── Bill panel (selected bill)
│       ├── Header .... bill no, status badge, date, patient, visit/department/doctor
│       ├── Balance ... total · paid · outstanding
│       ├── Charges ... line items with category, qty, unit price, line total
│       ├── Totals .... subtotal, tax, discount, insurance, total
│       ├── Payments .. payments and refunds recorded on the bill (from payment history)
│       └── Sticky action bar: Collect payment · Refund · Discount · Insurance · Void
└── Dialogs: Collect payment · Refund · Discount · Insurance
```

## 4. User Journey

1. Cashier opens the page; the queue loads newest bills first, the first bill is selected.
2. Searches by bill number or patient MRN (the API searches these two fields only), or filters by status/date.
3. Reviews the selected bill: patient, charges, totals, payments already taken.
4. **Collect payment** → picks a method per line, amounts default to the outstanding balance, confirms.
5. The server returns the updated bill; the queue row, panel, summary strip and payment list refresh.
6. Exceptions: **Refund** (pick the payment, amount ≤ that payment, reason), **Discount** / **Insurance**
   (separately permissioned), **Void** (only when nothing has been collected).

## 5. Layout

- Page: `max-w-[1600px]`, `px-4 sm:px-6`, `pt-5 pb-10`, `space-y-5`, same as the redesigned pharmacy pages.
- Summary strip: `grid-cols-2 lg:grid-cols-4`.
- Workspace: `xl:grid-cols-[minmax(0,1fr)_minmax(420px,520px)]`; the bill panel is `xl:sticky xl:top-4` with its own scroll.
- Below `xl` the bill panel opens in the shared `drawer` (640 px, clamped to the viewport).

### Wireframe (≥ 1280 px)

```
┌ Cashier ───────────────────────────────────────────────────── [Refresh] ┐
│ Collected today │ Outstanding │ Refunded today │ Payments today          │
├──────────────────────────────────────────┬───────────────────────────────┤
│ [search…] [Status ▾] [From] [To] [Reset] │ BILL-0042  ● Partial          │
│ chips                                    │ Jane Doe · MRN 1001           │
│ ( Bills | Recent payments )              │ Outstanding   $120.00         │
│ ┌ BILL-0042  Jane Doe   $120.00  ● ───┐  │ Charges ……………………………………          │
│ │ BILL-0041  John Roe   $0.00    ● ───┤  │ Totals  ……………………………………          │
│ │ …                                   │  │ Payments ………………………………          │
│ └ pagination ─────────────────────────┘  │ [Collect payment] [⋯ actions] │
└──────────────────────────────────────────┴───────────────────────────────┘
```

## 6. Component Hierarchy

```
AdminCashierComponent                (page state, data loading, mutations)
├── CashierSummaryStripComponent     (presentational)
├── CashierFilterBarComponent        (boo-input, boo-select, boo-datepicker, boo-filter-chips)
├── CashierBillListComponent         (boo-table-admin, boo-status-badge)
├── CashierPaymentsListComponent     (recent payments)
├── CashierBillPanelComponent        (selected bill, action bar)  — inline or inside <drawer>
├── CashierDialogComponent           (modal shell: overlay, focus, Escape, footer slot)
├── CashierPaymentDialogComponent
├── CashierRefundDialogComponent
└── CashierAdjustmentDialogComponent (discount | insurance)
```

Shared components reused from `@physioboo/ui`: `BooButtonComponent`, `BooInputComponent`, `BooStatusBadgeComponent`,
`BooFilterChipsComponent`, `BooEmptyStateComponent`, `BooErrorStateComponent`, `BooInlineErrorComponent`,
`BooIconComponent`. From the app: `BooSelectComponent`, `BooDatepickerComponent`, `BooTextareaComponent`,
`BooTableAdminComponent` + `ColumnDefDirective`, `StatCardComponent`, `DrawerComponent`, `ToastService`.

## 7. Permissions

| Action | Permission | Notes |
|---|---|---|
| Open page, list, detail, summary | `billing:bill:read` | route guard |
| Recent payments, per-bill payment list | `billing:payment:read` | tab hidden, panel shows a note |
| Collect payment | `billing:payment:create` | |
| Refund | `billing:payment:refund` (+ `billing:payment:read` to choose the payment) | |
| Discount | `billing:bill:discount-apply` | |
| Insurance | `billing:bill:insurance-apply` (+ `admin:insurance-company:read` for the company list) | |
| Void | `billing:bill:void` | |

Buttons without the permission are not rendered. The frontend `Permissions.Billing` constant was extended with
the five missing codes (they already existed on the server).

## 8. UI Specification

- Status badge tones (`PaymentStatus`): Pending → warning, Partial → primary, Paid → success, Overdue → danger,
  Cancelled → neutral, Refunded → danger, Waived → neutral. Always dotted + label (never colour alone).
- Amounts: `tabular-nums`, `currency:'USD'` pipe (same as the pharmacy pages); outstanding > 0 in `text-rose-700`.
- Controls: `boo-input` / `boo-select` / `boo-datepicker` at their default (middle) size; buttons `boo-button`.
- Dialogs: `max-w-lg`, z-index 10001 (above the drawer), `role="dialog"`, `aria-modal`, Escape closes (unless submitting), focus moves into the dialog.

## 9. Interaction Design

- Search is debounced 350 ms; any filter change resets to page 1. Out-of-order responses are dropped (`switchMap`).
- Selecting a row selects the bill (keyboard: the bill number is a button). On `< xl` it also opens the drawer.
- Payment dialog: method rows (method + amount); **Add line** for split tender; the sum must be `> 0` and `≤` outstanding; confirm disabled otherwise and while submitting.
- Refund dialog: lists the bill's payments that have not been refunded yet, amount capped to the chosen payment, reason required. A payment is refunded once: the server overwrites (does not add to) a payment's refund amount, so a second refund would shrink the first.
- Void uses the adjustment dialog in its danger tone: a reason is required and the button states what it does. No separate confirm prompt.
- After any success: toast, close dialog, replace the bill from the response, then reload summary, list and payments.

## 10. Responsive Behaviour

- `≥ xl`: two columns. `lg`: single column, summary 4-up. `< lg`: summary 2-up, filters stack, table scrolls horizontally inside its card (`min-w-[640px]`), drawer fills the viewport.
- Touch targets ≥ 36 px for row actions; dialog content scrolls inside `max-h-[calc(100vh-2rem)]`.

## 11. Accessibility

- Landmarks: `main`, `section[aria-label]`; `h1` once; `dl` for balances; live region (`aria-live="polite"`) for the remaining balance in the payment dialog.
- Dialogs trap initial focus and return to the opener; Escape closes; errors use `role="alert"`.
- Status is conveyed by text, not colour alone; contrast follows the existing tokens (WCAG AA).

## 12. Page States

| Region | Loading | Empty | Error | Disabled |
|---|---|---|---|---|
| Summary | skeleton figures | zeros are real zeros | inline error + retry | — |
| Bills | table loading overlay | "No bills match" (reset filters) / "No bills yet" | `boo-error-state` + retry, filters kept | — |
| Bill panel | skeleton | "Select a bill" | `boo-inline-error` for payments | actions hidden/disabled by status & permission |
| Payments | skeleton | "No payments recorded" | inline error + retry | needs `payment:read` |
| Dialogs | submit button `loading` | — | server message toast; dialog stays open with data | submit disabled until valid |

Action availability (derived only from fields the API returns):

- Collect payment: status not `Cancelled`/`Paid` and `remainingBalance > 0`.
- Refund: `paidAmount > 0`, and the dialog finds a payment without a refund among the latest 100 transactions.
- Discount / Insurance: status not `Cancelled`/`Paid`.
- Void: status not `Cancelled` and `paidAmount === 0` (the server does not enforce this; the UI does, to avoid voiding a bill with money on it).

## 13. Edge Cases

- Double click / Enter on confirm → ignored while a request is pending.
- Server rejects (validation, 4xx) → global error toast, dialog keeps its values.
- Bill changes under the user (another cashier) → the server response replaces the row; a bill that leaves the filtered list stays selected in the panel until the user selects another.
- A payment older than the latest-100 window cannot be refunded from the UI (no per-bill payment endpoint) → the refund dialog explains why.
- User lacks `payment:read` → payments section and tab are replaced by a note; refund unavailable.
- Selecting a bill from "Recent payments" that is not on the current page loads it by id.

## 14. Performance

Server paging (page size 12), debounced search, `switchMap` cancellation, `OnPush`-friendly signals, payment
history fetched once per refresh (limit 100) and shared by the tab and the bill panel.

## 15. Scalability

Types mirror the view models one-to-one; adding a payment method means extending one list in the types file.
The per-bill payments source is isolated in the service (`getPaymentHistory`) so it can switch to a dedicated endpoint (§17) without touching components.

## 16. Backend API Contract (consumed — all exist in `CashierEndpoints.cs`)

All responses are `{ success, data, errors, detailedErrors }`.

| Purpose | Method + URL | Request | Response (`data`) | Permission | Frontend usage |
|---|---|---|---|---|---|
| Summary | `GET /api/cashier/dashboard` | — | `{ todayRevenue, cashCollected, cardPayments, insuranceClaims, outstandingBills, refundAmount, completedTransactions, averagePaymentTimeSeconds }` | `bill:read` | summary strip (4 figures) |
| Bills | `GET /api/cashier/invoices` | query `search, status, dateFrom, dateTo, departmentId, pageNumber, pageSize` | `PagedResult<Invoice>` | `bill:read` | queue |
| Bill | `GET /api/cashier/invoices/{id}` | — | `Invoice \| null` | `bill:read` | open from a payment |
| Payments | `GET /api/cashier/payment-history` | query `limit` | `TransactionEvent[]` | `payment:read` | tab, panel, refund picker |
| Pay | `POST /api/cashier/payments` | `{ invoiceId, splits:[{method, amount}], amountTendered }` | updated `Invoice` | `payment:create` | payment dialog |
| Refund | `POST /api/cashier/refunds` | `{ invoiceId, paymentId, amount, reason, method }` | updated `Invoice` | `payment:refund` | refund dialog |
| Discount | `POST /api/cashier/invoices/{id}/discounts` | `{ discountPercent }` | updated `Invoice` | `bill:discount-apply` | adjustment dialog |
| Insurance | `POST /api/cashier/invoices/{id}/insurance` | `{ insuranceCompanyId, policyNo, coverageAmount }` | updated `Invoice` | `bill:insurance-apply` | adjustment dialog |
| Void | `POST /api/cashier/invoices/{id}/void` | `{ reason }` | updated `Invoice` | `bill:void` | void dialog |
| Companies | `POST /api/insurance-companies/search` | `PagedRequest` | `PagedResult<InsuranceCompany>` | `insurance-company:read` | insurance select |

`Invoice` = `{ id, billNumber, billDate, visitType, departmentName, doctorName, patientId, patientName, patientMrn, patientPhone, charges[], subtotal, taxRate, taxAmount, discountPercent, discountAmount, insuranceCoverageAmount, totalAmount, paidAmount, remainingBalance, status }`.
`status` ∈ `Pending | Partial | Paid | Overdue | Cancelled | Refunded | Waived`; payment `method` ∈ `Cash | Card | Upi | NetBanking | Cheque | DemandDraft | Insurance | Wallet | Qr`.

## 17. Backend limitations (not worked around, not invented)

1. **Search** matches bill number and patient MRN only — not patient name or phone. The placeholder says so.
2. **No payments-by-bill endpoint.** The panel and refund picker use `payment-history?limit=100` filtered by bill; older payments are not listed.
3. **Refund** has no server-side cap and *overwrites* `RefundAmount` with the requested value (a second refund on the same payment would reduce the first); it also ignores `method`. The UI offers only payments without a refund, caps the amount to the payment amount and sends the payment's own method.
4. **Payment** has no server-side check that the splits do not exceed the balance, and records no reference/transaction number. The UI caps the total to the balance and offers no reference field.
5. **Void** does not check for collected payments; the UI only allows it when `paidAmount === 0`.
6. **Receipt/print:** `POST /print-invoice` returns the invoice JSON, not a document. No print or receipt action is offered.
7. **`averagePaymentTimeSeconds`** is always 0 and is not shown. `Refunded`/`Overdue`/`Waived` statuses are never set by cashier flows but exist in the enum and filter.
8. **Department filter** is supported by the API but there is no cashier department lookup, so it is not exposed.
9. Recommended follow-ups (backend, out of scope here): `GET /api/cashier/invoices/{id}/payments`, server-side refund/payment caps, void guard, payment reference field.

## 18. Enterprise Recommendations

Audit trail view per bill, shift/cash-drawer reconciliation, receipt PDF, idempotency keys on `POST /payments` and `POST /refunds` (real duplicate protection needs the server), department filter lookup.
