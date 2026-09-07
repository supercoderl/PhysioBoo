# Billing / Cashier — Backend Design Doc

## 0. Summary

Unlike other modules covered in this doc series, the Cashier frontend (`/admin/finance/cashier`) is
**already fully built** — a mature two-pane POS-style workspace (search → invoice table/timeline tabs
→ sticky detail panel → payment/refund modals), comparable in completeness to the Prescriptions and
Retail modules once they were redesigned. This doc therefore documents the existing UI **as-is**
(not a redesign) and focuses the real design work on what's actually missing: the backend. Today only
3 raw `POST` endpoints exist across Bill/BillItem/Payment (create-only, no reads, no updates, and
critically — **Bill amount totals are never recalculated after creation**, anywhere in the codebase).
Every one of the ~11 wired frontend calls under `BASE_API.CASHIER` has zero backend support.

This doc does not redesign Revenue Reporting (`docs/revenue-report-redesign.md`, separate module) or
Insurance Claims (`docs/insurance-claims-redesign.md`, separate module) — both are sibling modules
that read Bill/Payment data but are scoped independently.

---

## 1. UX Audit — Current State (documented as-is, not redesigned)

**Files:** `pages/admin/finance/cashier/{cashier.component.ts, cashier-search-panel.component.ts,
cashier-invoice-table.component.ts, cashier-invoice-detail-panel.component.ts,
cashier-payment-dialog.component.ts, cashier-refund-dialog.component.ts,
cashier-transactions-timeline.component.ts}`, service `services/admin/cashier.service.ts`, types
`shared/types/cashier.types.ts`.

- Dark hero header with 8 KPI tiles (today's revenue, cash collected, card payments, insurance
  claims, outstanding bills, refund amount, completed transactions, average payment time).
- Search panel: global search (patient/MRN/invoice/phone, 250ms debounce), barcode scan input,
  7-state status filter chips, an "Advanced Filters" disclosure (date-from/date-to/department) that
  is **currently dead UI** — not wired to any output event.
- Two-tab left column: Outstanding Invoices table (reuses shared `BooTableAdminComponent` +
  `ColumnDefDirective` + `BooActionAdminComponent`) / Recent Transactions timeline.
- Sticky right-side invoice detail panel: patient/visit mini-stats, itemized charge list, inline-edit
  discount % and insurance coverage amount, summary block, sticky action bar (Receive Payment /
  Print / Refund / Void).
- Payment dialog: 8 payment methods incl. a Mixed/split flow with live remaining-balance validation.
- Refund dialog: capped amount, 5 methods (excludes QRCode/Corporate/Mixed), required reason.
- The component currently does **client-side recomputation** of totals/status after every action
  (discount, insurance, payment, refund, void) because the mock endpoints only return narrow deltas,
  not a full updated invoice — this logic needs to move server-side in the real implementation, with
  the frontend switched to trust the server's returned invoice instead of recomputing locally.

## 2. Current Problems

| # | Problem | Impact |
|---|---|---|
| 1 | Zero backend support for any of the 11 wired cashier endpoints | Page cannot function against a real API today |
| 2 | `Bill.Subtotal`/`TotalAmount`/`PaidAmount`/`OutstandingAmount` never recalculated after creation | `Bill.UpdateAmounts()` exists on the entity but is dead code — no command calls it |
| 3 | Enum vocabularies diverge: `CashierInvoiceStatus`/`CashierPaymentMethod`/`CashierChargeCategory` (frontend) vs `PaymentStatus`/`PaymentMethod`/`ItemType` (backend) | Needs explicit reconciliation, not blind mapping — see §12.0 |
| 4 | `Payment` models a refund as fields on the same row (`RefundAmount`/`RefundDate`/`RefundReason`), but frontend treats refund as a distinct transaction-timeline event type | Needs a domain decision — see §12.0 |
| 5 | No bulk/split-payment support server-side | `CreatePaymentCommand` creates one `Payment` row per call; a Mixed-method payment needs N rows created together |
| 6 | `BillEndpoints.cs` references a named route `GetBillById` in `CreatedAtRoute` that doesn't exist | Dangling reference — the `Location` header on bill creation is currently broken |
| 7 | Advanced filter UI (date range, department) collects state but never emits it | Dead code in `cashier-search-panel.component.ts` |
| 8 | `Bill.AppointmentId` is required (non-nullable) | No support for a walk-in/ad-hoc bill without an appointment — a real cashier workflow often needs this (e.g. retail-adjacent charges, walk-in lab tests) |

## 3. Information Architecture

```
Cashier Workspace
├── Hero header — 8 KPI tiles (dashboard aggregate query)
├── Search panel — global search / barcode / status filter / date+department filter
├── Left column (tabbed)
│   ├── Outstanding Invoices table (paged, filtered)
│   └── Recent Transactions timeline (payments/refunds/voids/reprints)
└── Right panel — selected invoice detail
    ├── Patient/visit mini-stats
    ├── Itemized charges (BillItem rows)
    ├── Discount / Insurance inline editors
    ├── Totals summary
    └── Action bar: Receive Payment / Print / Refund / Void

Payment Dialog (modal) — single method or Mixed/split, with live remaining-balance validation
Refund Dialog (modal) — capped amount, method, required reason
```

## 4. Reused Frontend Infrastructure (already wired, not being changed)

`BooTableAdminComponent`/`ColumnDefDirective`/`BooActionAdminComponent`, `BooIconComponent`,
`ErrorStateComponent`, `DialogService`, `LocalLoadingService`, `ToastService`, `PaginationData`
helpers, `LoadingKeys.CASHIER.*`. Not currently wired but available: `PrintService` (for
`printInvoice`/`printReceipt`, currently unimplemented service stubs), `DrawerComponent` (not needed
— the detail panel is a permanent split-pane, not an overlay).

---

## 12. Backend API Contract (proposed — not implemented)

### 12.0 Required domain model changes (prerequisite)

**Enum reconciliation** — rather than force the frontend's ad-hoc vocabulary onto the backend or vice
versa, extend the backend enums (source of truth) and have the frontend types converge onto them once
implementation starts:

| Backend enum | Change | Reason |
|---|---|---|
| `PaymentStatus` | Add nothing — `Partial` (backend) becomes what the frontend calls `PartiallyPaid`; frontend's `InsurancePending` is **not** a bill-level status, it's better modeled as `Bill.InsuranceClaimNumber != null && InsurancePaidAmount == 0` (a derived condition, not a stored state) | Avoids a redundant status value that could drift from the actual insurance fields |
| `PaymentMethod` | Add `Wallet` already exists; add `Qr` (alias for the frontend's `QRCode`), keep `Card` as the single card method (frontend's `CreditCard`/`DebitCard` split isn't a real backend distinction — collapse to `Card` with an optional `CardBrand` string field on `Payment` if that distinction matters later) | `NetBanking`/`Cheque`/`DemandDraft`/`Upi` (backend) have no frontend equivalent yet — keep them, the cashier UI doesn't need to expose every method immediately |
| `ItemType` | Frontend's `CashierChargeCategory` maps directly: `Medicine→Medicine`, `Laboratory→LabTest`, `Imaging→Imaging`, `Procedure→Procedure`, `Room→RoomCharge`, `Service→Other` (or a new `Service` value if "service" is a distinct concept from "other" in this domain — decide at implementation time) | No new enum needed, just a frontend-side mapping table when wiring the real service |

**`Bill.AppointmentId` becomes nullable** — walk-in/ad-hoc bills need to exist without an appointment. Add a `BillSource` enum (`Appointment`, `WalkIn`, `PharmacySale`) to distinguish origin without overloading nullability semantics.

**Refund modeling decision**: keep refunds as fields on the same `Payment` row (current backend design) rather than introducing a separate `Refund` entity — a full refund sets `RefundAmount = Amount`, a partial refund sets `RefundAmount < Amount`, both leave the original `Payment` row intact for audit purposes. The frontend's `CashierTransactionEvent` (which treats refund as its own timeline event type) is then a **view-layer transformation**: a `Payment` row with `RefundAmount > 0` and `RefundDate` set renders as two timeline entries (the original payment, and a synthetic "Refund" event) rather than two database rows. This avoids the complexity of a new entity for what is fundamentally a state change on an existing payment.

**Bill totals must be recalculated on every mutation** — `Bill.UpdateAmounts()` already exists on the entity (dead code today); every command that changes a `Bill`'s items, discount, insurance coverage, or receives/refunds a payment against it must call this method and persist the result. This is the single most important correctness fix in this entire module.

**New entity: none required** — `Bill`/`BillItem`/`Payment` already have all the fields a real implementation needs; the gap is entirely in the Application/Presentation layers (missing queries, missing recalculation logic), not the Domain layer. This is a smaller domain-model lift than Prescriptions or Pharmacy required.

### 12.1 `GET /api/cashier/dashboard`
- **Purpose**: 8 KPI tiles in the hero header.
- **Response**: `CashierDashboardStatsViewModel` — `todayRevenue, cashCollected, cardPayments, insuranceClaims, outstandingBills, refundAmount, completedTransactions, averagePaymentTimeSeconds`. Computed by aggregating today's `Payment`/`Bill` rows — `averagePaymentTimeSeconds` has no existing data source (no "bill created → payment received" timestamp delta is tracked anywhere); implement it as `0`/omit initially and flag as a follow-up metric once payment-latency tracking exists.
- **Frontend usage**: `CashierService.getDashboardStats()`.

### 12.2 `GET /api/cashier/invoices`
- **Purpose**: Paged, filtered invoice list for the Outstanding Invoices table.
- **Request (query)**: `search?, status?, dateFrom?, dateTo?, departmentId?, pageNumber, pageSize` — matches `CashierInvoiceFilter`, including the currently-dead date/department filters (wire them up as part of this endpoint's implementation, fixing Problem #7).
- **Response**: `PagedResult<CashierInvoiceViewModel>` — the flattened shape the frontend already expects (patient name/MRN/phone inlined, doctor/department as display strings, `charges` embedded). Build this as a projection over `Bill` + `BillItems` + `Patient`/`Appointment`/`Doctor`/`Department` joins — do not require the frontend to make N+1 calls for display data it already expects inlined.
- **Frontend usage**: `CashierService.searchInvoices(filter)`.

### 12.3 `GET /api/cashier/invoices/{id}`
- **Purpose**: Single invoice detail (currently a dead code path in the frontend, but real once wired to a working backend and once mutation endpoints return the server's recalculated invoice instead of the client recomputing locally).
- **Response**: `CashierInvoiceViewModel` (full detail, same shape as the list row plus nothing extra needed since the list already embeds charges).
- **Frontend usage**: `CashierService.getInvoiceDetail(invoiceId)`; also the recommended response shape for §12.5–12.9's mutation endpoints (return the fresh invoice, don't make the frontend guess).

### 12.4 `POST /api/cashier/invoices`
- **Purpose**: Create a bill — replaces the disconnected `POST /api/bills` + separate `POST /api/bill-items/create` calls with one transactional create (header + items), same lesson as Prescriptions/Retail's transactional-create requirement. Also fixes the dangling `GetBillById` `CreatedAtRoute` reference (Problem #6) by actually registering that named route.
- **Request**: `{ patientId, appointmentId?, hospitalId, departmentId, billSource (Appointment|WalkIn|PharmacySale), type (BillType), items: BillItemInput[] }`.
- **Response**: `CashierInvoiceViewModel` with totals computed via `UpdateAmounts()`.

### 12.5 `POST /api/cashier/invoices/{id}/discounts`
- **Purpose**: Apply a discount percentage to the invoice, recalculate totals via `Bill.UpdateAmounts()`.
- **Request**: `{ discountPercent }`. **Response**: full `CashierInvoiceViewModel` (not just the delta the mock currently returns — this is what lets the frontend drop its client-side recompute logic, Problem in §1).
- **Frontend usage**: `CashierService.applyDiscount(invoiceId, discountPercent)`.

### 12.6 `POST /api/cashier/invoices/{id}/insurance`
- **Purpose**: Attach/update insurance coverage on the invoice, recalculate totals.
- **Request**: `{ provider, policyNo, coverageAmount }` — maps to `Bill.InsuranceCompanyId`/`InsuranceClaimNumber`/`InsuranceApprovedAmount` (resolve `provider` string to an `InsuranceCompanyId` FK, or accept the id directly if the frontend is updated to send it).
- **Response**: full `CashierInvoiceViewModel`.

### 12.7 `POST /api/cashier/payments`
- **Purpose**: Receive payment — supports the Mixed/split flow by creating multiple `Payment` rows in one call (fixes Problem #5), then recalculates `Bill.PaidAmount`/`OutstandingAmount`/`PaymentStatus` via `UpdateAmounts()`.
- **Request**: `{ invoiceId, splits: {method, amount}[], amountTendered }`.
- **Response**: `CashierInvoiceViewModel` (updated) — the frontend's `CashierPaymentResult` becomes redundant once the full invoice comes back.
- **Note on atomicity**: same infrastructure limitation documented for module 8/9 (`CheckoutCartCommandHandler`) — this codebase's repository layer has no cross-call transaction wrapper; N payment-row inserts + one Bill update happen sequentially, not atomically, until `IUnitOfWork` gains transaction support.

### 12.8 `POST /api/cashier/refunds`
- **Purpose**: Refund a payment (full or partial) — sets `RefundAmount`/`RefundDate`/`RefundReason` on the targeted `Payment` row per the §12.0 modeling decision, recalculates `Bill` totals.
- **Request**: `{ invoiceId, paymentId?, amount, reason, method }` (if `paymentId` is omitted, refund against the most recent completed payment for that invoice — the frontend's current `refundPayment(invoiceId, ...)` signature doesn't pass a specific payment id, so the backend needs a sensible default).
- **Response**: `CashierInvoiceViewModel`.

### 12.9 `POST /api/cashier/invoices/{id}/void`
- **Purpose**: Void an invoice (sets `Bill.PaymentStatus = Cancelled`, requires a reason).
- **Request**: `{ reason }`. **Response**: `CashierInvoiceViewModel`.

### 12.10 `GET /api/cashier/payment-history`
- **Purpose**: Recent Transactions timeline — reads `Payment` rows (with the refund-as-synthetic-event transformation from §12.0 applied server-side, so the frontend keeps receiving `CashierTransactionEvent[]` as-is).
- **Response**: `List<CashierTransactionEventViewModel>`, paged/limited (e.g. most recent 50).

### 12.11 `GET /api/cashier/invoices/{id}/print` and `GET /api/cashier/payments/{id}/print-receipt`
- **Purpose**: Printable invoice/receipt — same simplification precedent as Retail/Stock Take (JSON representation for a first pass, reuse the app's `PrintTemplate` infrastructure for real PDF output later rather than building a one-off renderer).
- **Frontend usage**: `printInvoice`/`printReceipt` — currently unimplemented stubs, wire to `PrintService` once this exists.

### 12.12 Explicitly deferred / not part of this pass
- `GET /api/payment-methods` — declared in `base.ts`, no service method calls it; skip until a real need (dynamic per-hospital payment method configuration) emerges. Hardcode the method list client-side for now.
- `GET /api/cashier/export` — declared, no service method; export/reporting concerns belong with Revenue Report (`docs/revenue-report-redesign.md`), not duplicated here.
- Online payment-gateway integration (`InitiatePayment`/`Transaction`/`IPaymentGateway`/webhook/callback in `PaymentEndpoints.cs`) — **on review, this is a separate concern, not a Card/QR path for the cashier terminal.** It's an asynchronous, redirect/webhook-based flow suited to remote/online bill-pay (e.g. a patient paying via a link), whereas a cashier's in-person Card/QR payment is synchronous (swipe-and-confirm, immediately settled). §12.7's `ReceivePayment` correctly treats all in-person methods as immediately `Paid` and does **not** delegate to the gateway subsystem — the two payment paths are architecturally distinct, not a fallback for each other. Module 11 ("Payments") is this gateway subsystem, and it is already fully implemented (`InitiatePayment`, `HandleGatewayNotification`, `GetTransactionStatus` all exist and are wired) — its remaining gap, if any, is a frontend remote-payment page, not backend work.

---

## 13. Permissions needed (add to `Permissions.Billing`)

Existing: `BillRead, BillCreate, BillItemRead, BillItemCreate, PaymentRead, PaymentCreate`. Add:
`BillUpdate, BillVoid, BillDiscountApply, BillInsuranceApply, PaymentRefund`.
