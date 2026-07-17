# Pharmacy Retail Module Redesign — Hospital Pharmacy POS

**Path:** `admin/pharmacy/retail`
**Current implementation:** `src/app/pages/admin/pharmacy/retail/retail.component.ts` — a single 444-line component with hardcoded mock medicines, `ngModel`-bound search/filter, a plain HTML table for the catalog, and a billing sidebar. No services, no drawers, no payment flow; `processSale()`/`printBill()` only call `alert()`/`console.log()`. Built like a dashboard sub-page, not a point of sale.
**Scope:** Frontend UI/UX only. No backend implementation — see §13 for the proposed API contract. Reuses conventions already established by the Laboratory / Treatment Sheet / Nursing modules (`docs/laboratory-redesign.md`): standalone components, Angular signals, `DrawerComponent`, `StatusBadgeComponent`, `StatCardComponent`, `EmptyStateComponent`, `BooIconComponent`, `BooSelectComponent`, `BooInputComponent`, `LocalLoadingService`, `ToastService`, `DialogService`, Tailwind, mock-fallback services. Unlike those modules, this page is intentionally **not** a multi-tab dashboard — it is a single always-on workspace, because the entire point of a POS is that the cashier never navigates away mid-sale.

---

## 1. UX Audit — Current State

| Area | Current Implementation | Problem |
|---|---|---|
| Layout | 3-column dashboard grid (catalog table 2/3, cart+billing 1/3) | Reads like an admin report, not a till — no sense of "this is where I sell things fast" |
| Catalog | Plain `<table>` rows, no images/cards, no barcode, no categories beyond a 5-item dropdown | Pharmacists scanning shelves need large tappable product cards, not table rows |
| Search | Single text input filtering 3 fields client-side over 8 hardcoded medicines | No barcode scan, no debounce, no recents/favorites, no fallback to a real catalog size |
| Cart | One cart only, per-row qty +/- and a raw discount-% input, totals recomputed via `recalculateCart()` on every keystroke | No multiple concurrent carts (a second customer always interrupts the first), no keyboard shortcuts, no held/suspended sales |
| Customer | Three bare text inputs (name, phone, doctor) | No patient lookup, no insurance, no loyalty, no prescription reference — every sale is anonymous data entry |
| Payment | None — `processSale()` just validates `patientName` and `alert()`s | No payment method, no split tender, no change calculation, no receipt |
| Tax | Hardcoded 5 % constant | No VAT/insurance-aware computation |
| Feedback | `alert()` / `confirm()` | Blocks the UI thread, not accessible, inconsistent with the rest of the app's `ToastService`/`DialogService` |
| Stock awareness | Color-coded stock number in a table cell only | No low-stock/near-expiry/out-of-stock panel, no best-seller or revenue insight |
| Multi-tasking | None | A pharmacist interrupted mid-sale (walk-in pays cash while a phone order is open) has no way to park and resume |
| Accessibility/keyboard | Mouse-only buttons, native `alert()` | No keyboard-first flow, despite barcode scanners and keyboard shortcuts being the actual daily tool of a pharmacy till |

**Root cause:** the page was built as a CRUD-style admin form bound to a hardcoded array, not as a transactional point-of-sale workspace. It has no concept of a held/active cart queue, no payment/tender model, and no patient/insurance integration — the things that actually define hospital pharmacy retail.

---

## 2. Information Architecture

```
Pharmacy Retail (/admin/pharmacy/retail)
├── Sticky POS Header
│   (Module title, cashier/shift info, global medicine search w/ barcode input, New Sale,
│    inventory insight toggle)
├── Retail Queue Bar (Cart A / Cart B / Cart C... — switch instantly, "+ New Cart")
├── Three-Workspace Grid (single screen, no tab navigation away from selling)
│   ├── Left  — Medicine Catalog Workspace
│   │            (Quick Category rail, search results / favorites / recently sold / recommended,
│   │             product cards, barcode scan)
│   ├── Center — Shopping Cart Workspace
│   │            (active cart's line items, inline qty/discount editing, keyboard shortcuts)
│   └── Right  — Customer & Checkout Workspace
│                (Patient/Walk-in lookup, insurance & loyalty, payment summary, Checkout button)
├── Inventory Insight Strip (Low Stock, Near Expiry, Out of Stock, Best Seller, Today's Revenue,
│    Today's Sales) — collapsible, sits under the queue bar
├── Floating Quick Actions (New Sale, Suspend, Resume, Refund, Print Receipt, Reprint, Hold Queue)
├── Drawer: Product Detail Drawer (opened from any product card)
│            — details, manufacturer/generic/brand, batch/expiry, stock, alternatives,
│              interaction warnings, inventory movement
├── Drawer: Customer Lookup Drawer (opened from Checkout Workspace "Search Patient")
│            — patient search, membership/insurance summary, "Use as customer"
└── Dialog: Payment Dialog (opened by Checkout / F4)
             — payment method tabs, split payment, tender & change, receipt preview,
               print / email / SMS receipt
```

**Key IA decision:** unlike Laboratory/Treatment Sheet, this module has **no tab navigation** — tabs would force the cashier to leave the selling surface, which directly violates the "never leave this page" / "sub-30-second sale" requirement. Instead, the three workspaces are permanently visible side by side (collapsing to a 2-panel/1-panel stack on tablet/mobile per §7), and all secondary information (product detail, patient lookup, payment) is layered on top via drawers/dialogs that return focus to the same workspace on close.

---

## 3. User Journey

1. A pharmacist opens **Pharmacy Retail**; the header shows the active cashier/shift and an auto-focused search/barcode input.
2. **Find medicine:** type a name/generic/batch, scan a barcode (`Ctrl+B` focuses the scan input), or tap a Quick Category chip. Results render as product cards with stock/price/insurance/promotion badges.
3. **Add to cart:** one click/tap (or scanning a barcode directly) adds the medicine to the *active* cart with quantity 1; scanning the same barcode again increments quantity. Out-of-stock items are visibly disabled.
4. **Adjust cart:** in the center workspace, the pharmacist edits quantity (+/- or type a number), discount %, or removes a line — totals recompute immediately (subtotal, discount, insurance coverage, VAT, grand total).
5. **Attach customer (optional but required to use insurance/loyalty):** "Search Patient" opens the Customer Lookup Drawer; selecting a patient pulls insurance/loyalty/prescription reference into the Checkout Workspace. If no patient, the sale proceeds as Walk-in Customer.
6. **Multitask:** if a second customer arrives, the pharmacist opens a new cart from the Retail Queue Bar ("Cart B") without losing Cart A, and switches between them instantly. A cart can also be **Suspended** (parked) and **Resumed** later from the Floating Quick Actions.
7. **Checkout:** pressing the large Checkout button (or `F4`/`F5`) opens the Payment Dialog — select Cash / Card / QR / Insurance / Mixed, optionally split across methods, enter tendered cash to see live change, preview the receipt.
8. **Complete sale:** confirming payment (`F5` or the dialog's Complete button) finalizes the transaction, decrements stock optimistically, clears the active cart, shows a success toast, and offers Print/Email/SMS receipt actions.
9. **Recover from interruption:** `Esc` cancels the current dialog/drawer without losing cart state; a suspended cart can be resumed from the Hold Queue at any time.
10. Throughout, the Inventory Insight strip keeps low-stock/near-expiry/out-of-stock counts and today's revenue/sales visible without requiring navigation away from the till.

---

## 4. Layout & Wireframes

### 4.1 Sticky POS Header
`position: sticky; top: 0`. Left: title "Pharmacy Retail" + cashier name/shift badge. Center: global search input with a barcode-scan affordance (`Ctrl+B` focuses it; Enter on a scanned code adds/increments the matching medicine directly, bypassing the catalog grid). Right: "New Sale" (`F2`-adjacent quick action) and an Inventory Insight toggle.

### 4.2 Retail Queue Bar
Horizontal strip of cart tabs ("Cart A", "Cart B", …) each showing item count and a status dot (Active/Held). "+ New Cart" button. Switching is a single click — no confirmation, no data loss. Mirrors the tab-bar visual language from Laboratory (`role="tablist"`, bottom-border active indicator) but represents carts, not data views.

### 4.3 Inventory Insight Strip
6 `StatCardComponent` tiles: Low Stock, Near Expiry, Out of Stock (danger tone), Best Seller (today), Today's Revenue, Today's Sales. Collapsible via the header toggle so it can be hidden during a rush to maximize catalog/cart space.

### 4.4 Three-Workspace Grid (desktop: `grid-cols-[2fr_1.6fr_1.4fr]`)

**Left — Medicine Catalog Workspace**
- Quick Category rail (chips: All, Tablet, Syrup, Injection, Capsule, Ointment, OTC, Controlled — reuses `MedicineCategory` master data already in the system rather than a hardcoded list).
- Result mode tabs (visual chips, not navigation): Search Results / Favorites / Recently Sold / Recommended.
- Product grid of cards (responsive `auto-fill` grid). Each card: name, generic name, strength + package, stock (color-coded), price, insurance badge, promotion ribbon if any. Click = add to active cart. Long-press / secondary "i" icon = open Product Detail Drawer.
- Barcode input embedded in the search bar; out-of-stock cards are dimmed and unclickable with an "Out of Stock" badge instead of a button.

**Center — Shopping Cart Workspace**
- Header: active cart name, item count, "Clear All".
- Line items: name + generic + strength/package, unit, qty stepper (+/-, direct numeric entry, clamped to stock), unit price, discount % (inline editable), insurance-covered amount, computed total, remove icon.
- Empty state via `EmptyStateComponent` ("Cart is empty — scan or search a medicine to begin").
- Keyboard: arrow keys move between rows, `+`/`-` change quantity, `Delete` removes the focused row.

**Right — Customer & Checkout Workspace**
- Customer card: "Search Patient" / "Walk-in Customer" toggle; once a patient is attached, shows MRN, insurance provider + coverage, loyalty points, prescription reference, allergy flag (reused from `Patient` type) with a "Change" link back to the lookup drawer.
- Payment summary: Subtotal, Discount, Insurance Coverage, VAT, **Grand Total**, Balance Due.
- Large primary "Checkout" button (disabled while cart is empty), secondary "Print Bill" / "Hold Sale" buttons.

### 4.5 Floating Quick Actions
Fixed bottom-right stack of icon buttons: New Sale, Suspend Sale, Resume Sale (badge with held-cart count), Refund, Print Receipt, Reprint, Hold Queue. Mirrors the existing floating-action visual pattern already used elsewhere in the admin shell (fixed circular buttons, tooltip on hover).

### 4.6 Quick Sale Mode (Keyboard Shortcuts)
`F2` focus medicine search · `F3` open Customer Lookup Drawer · `F4` open Payment Dialog · `F5` complete sale (only enabled once the Payment Dialog has a valid tender) · `Esc` close current drawer/dialog · `Ctrl+B` focus barcode input. Shortcuts are registered only while the POS workspace is mounted and are suppressed while a text input that isn't the search/barcode field has focus, to avoid hijacking normal typing.

### 4.7 Product Detail Drawer
`DrawerComponent`, width 480px. Sections: medicine identity (name, generic, brand, strength, package), Manufacturer, Batch & Expiry, Stock (current + per-batch breakdown), Alternative Medicines (same generic, different brand/manufacturer), Interaction/Allergy Warnings (placeholder service call against the active cart's patient if attached), Inventory Movement (recent in/out mini-list). Footer: "Add to Cart".

### 4.8 Customer Lookup Drawer
`DrawerComponent`, width 420px. Patient search (name/phone/MRN), result list with avatar/name/MRN/insurance summary, "Use as Customer" action; a "Walk-in Customer" quick form (name + phone only) for when no patient record applies.

### 4.9 Payment Dialog
Large centered modal (reuses `DialogComponent` shell, not the small confirm dialog). Sections: Payment Summary (mirrors the checkout summary), Payment Method tabs (Cash/Card/QR/Insurance/Mixed), Split Payment editor (add multiple method+amount rows that must sum to the grand total), tendered-cash input with live Change calculation, Receipt Preview pane, and Print/Email/SMS receipt actions. "Complete Sale" is disabled until the tendered total covers the grand total.

---

## 5. Component Hierarchy

```
pharmacy/retail/
├── retail.component.ts                          (AdminRetailComponent — shell: header, queue bar,
│                                                   insight strip, 3-workspace grid, floating actions,
│                                                   keyboard shortcut handling, drawer/dialog hosting)
├── retail-catalog-panel.component.ts             (Left workspace — search, categories, product grid)
├── retail-cart-panel.component.ts                (Center workspace — active cart line items)
├── retail-checkout-panel.component.ts            (Right workspace — customer card + payment summary)
├── retail-payment-dialog.component.ts            (Payment method, split tender, change, receipt preview)
├── retail-product-detail-drawer.component.ts     (Product Detail Drawer)
└── retail-customer-lookup-drawer.component.ts    (Customer Lookup Drawer)

shared/types/retail-pos.ts        (RetailMedicineCard, RetailCartLineItem, RetailCart, RetailCustomer,
                                    RetailPaymentMethod, RetailPaymentSplit, RetailTransaction,
                                    RetailInventoryInsight, RetailQuickCategory, enums:
                                    RetailCartStatus, RetailCustomerType)

services/admin/retail-pos.service.ts        (RetailPosService — mock-fallback pattern, same shape
                                              as LaboratoryService)
```

**Reused without modification:** `DrawerComponent`, `DialogComponent`, `StatusBadgeComponent`, `StatCardComponent`, `EmptyStateComponent`, `BooIconComponent`, `BooSelectComponent`, `BooInputComponent`, `LocalLoadingService`, `ToastService`, `DialogService`, `Patient` type (for the attached-customer summary), `MedicineCategory` service (Quick Category rail).

**New (this feature):** everything under `pharmacy/retail/` above, the types file, and the service. The legacy `Medicine` / `CartItem` / `Billing` types in `shared/types/medicine.ts` / `cart.ts` / `bill.ts` are superseded by `RetailMedicineCard` / `RetailCartLineItem` / `RetailTransaction` for this module — they are left untouched since `cashier.component.ts` (Finance → Cashier) still references the old `Medicine`/`CartItem` pair for an unrelated billing screen.

**Not duplicated:** Finance's `cashier.component.ts` keeps its own billing-only cart model; this module's cart is a full POS cart (multi-cart, discount, insurance, payment split) and intentionally does not share a type with Cashier.

---

## 6. UI Specification & Interaction Design

- **Stock → tone:** ≥50 units → success (or neutral), 10–49 → warning, <10 → danger, 0 → danger + "Out of Stock" badge replacing the add action.
- **Cart status → tone:** Active → primary, Held → neutral.
- **Payment method tabs:** single click selects Cash/Card/QR/Insurance; "Mixed" reveals the split-payment row editor instead of a single amount field.
- **Optimistic UI:** adding/removing cart lines, switching/holding/resuming carts, and completing a sale update local signal state immediately; a service error reverts state and shows an error toast — mirrors the Laboratory module's optimistic-update pattern.
- **Keyboard-first:** see §4.6. All quick actions and the Payment Dialog's Complete button are reachable via Tab/Enter; barcode scanners (keyboard-wedge) work against the same search input without special handling.
- **Inline editing:** quantity and discount-% cells are always-editable inputs (not click-to-edit) — POS speed favors zero-click editing over click-then-edit.
- **Destructive actions:** "Clear All" and "Refund" route through `DialogService.confirm()` (`confirmDelete`-style danger confirmation); everything else (remove single line, hold cart) is a single click with toast feedback, consistent with how fast a till needs to move.

---

## 7. Responsive Behavior

| Breakpoint | Layout |
|---|---|
| Desktop (≥1280px) | Full three-workspace grid side by side, queue bar + insight strip visible, floating actions in fixed corner |
| Tablet (768–1279px) | Two-panel workspace: Catalog + Cart visible together; Customer & Checkout collapses into a slide-over panel opened from a "Checkout" button (same `DrawerComponent`), insight strip collapses to 3×2 |
| Mobile (<768px) | Cashier mode: single panel at a time (Catalog → Cart → Checkout) navigated via a bottom segmented control; floating actions collapse into a single "More" button; product grid becomes 2-column |

---

## 8. Accessibility (WCAG 2.1 AA)

- Stock/cart-status/payment badges pair color with text — never color alone.
- Floating Quick Actions and product card "Add" affordances meet 44×44px minimum touch targets.
- Payment Dialog traps focus until resolved (reuses `DialogComponent`'s focus trap) and announces the live Change amount via `aria-live="polite"`.
- Keyboard shortcuts (§4.6) are documented in a visible "Shortcuts" hint and never the *only* way to perform an action — every shortcut has an equivalent clickable control.
- Quantity/discount inputs carry `aria-label`s referencing the medicine name (e.g., "Quantity for Paracetamol 500mg") so screen readers don't announce bare numeric boxes.
- Out-of-stock product cards expose `aria-disabled="true"` rather than being silently unclickable.

---

## 9. Page States

- **Loading (initial):** centered spinner while catalog/categories/insight data loads, matching the Laboratory module's loading treatment.
- **Empty:** catalog search with no matches → `EmptyStateComponent` ("No medicines match your search") with a "Clear Filters" action; empty cart → `EmptyStateComponent` ("Cart is empty — scan or search a medicine").
- **Error:** inline error banner with Retry at the section level (catalog load failure does not block an already-open cart/checkout).
- **Success:** standard populated workspace; sale completion shows a success toast + receipt actions.
- **Disabled:** Checkout button disabled while the active cart is empty; Payment Dialog's Complete button disabled until tendered amount covers the grand total; per-action buttons disable + show inline spinner via their own `LocalLoadingService` key while their request is in flight — never a global page lock (a pharmacist must be able to keep using Cart B while Cart A's sale is being processed).

---

## 10. Edge Cases & Exception Handling

- Scanning a barcode that matches no medicine → toast "No medicine found for this barcode", search field keeps the scanned text so staff can manually search.
- Adding a quantity beyond available stock (manual entry or scan-repeat) → clamps to current stock and shows a warning toast rather than silently failing.
- Completing a sale with a Mixed payment whose split total doesn't equal the grand total → Complete button stays disabled with a visible "Remaining: $X" indicator.
- Suspending a cart that has no items → action is simply disabled (nothing to hold).
- Switching carts mid-edit of a discount/quantity field → the in-progress edit is committed (blur-on-switch) before the panel re-renders for the new cart, so no edits are silently lost.
- Patient attached to a cart has no insurance on file but "Insurance" payment method is selected → Insurance tab shows an inline notice and the Complete button requires switching method, rather than allowing an invalid $0 insurance payment.
- Two pharmacists on different terminals sell the last unit of the same batch simultaneously → client-side stock clamp is optimistic only; the real conflict resolution is a backend concern, surfaced here only as a generic "stock changed, please refresh" error toast on a failed checkout call.

---

## 11. Performance Considerations

- Catalog/category/insight data loads once via `forkJoin` on entry; product search/category filtering is client-side over the loaded catalog page (consistent with the "no npm install" / no new search-indexing dependency constraint).
- Product grid and cart line list use `trackBy` (`id`) so optimistic qty/discount edits don't re-render the whole list.
- Barcode/search input is debounced (reuses `BooInputComponent`'s existing debounced `(search)` output) so fast scanner input doesn't fire a filter pass per keystroke.
- Multiple carts are held entirely in client memory (signals) — no network round-trip when switching the active cart, which is the single biggest contributor to sub-30-second checkout.

---

## 12. Scalability & Enterprise Recommendations

- Keep `RetailPosService` on the same mock-fallback pattern as `LaboratoryService`/`TreatmentSheetService` so backend cutover requires zero caller changes.
- Model `RetailCart` or `RetailMedicineCard` and `RetailTransaction` as first-class types now (not `any`) so downstream features (inventory deduction, insurance claims, loyalty accrual) can be layered in without a type rewrite.
- Barcode handling is a plain string field today (typed by any keyboard-wedge scanner); a camera-based scanner can be wired in later without a contract change.
- Quick Categories reuse the existing `MedicineCategory` master-data service rather than hardcoding a list, so new categories created in Settings automatically appear on the till.
- The multi-cart queue is modeled client-side for now; the API contract already includes hold/resume endpoints (§13) so server-side persistence (e.g., a pharmacist logging out mid-shift) can be added without a UI rewrite.

---

## 13. Proposed Backend API Contract

All endpoints assume hospital/tenant scoping via existing auth middleware (not repeated per row). Response envelope follows the existing `PagedResponse<T>` / `PaginationData<T>` shape used across the app.

| # | Purpose | Method | URL | Request | Response | Frontend Usage |
|---|---|---|---|---|---|---|
| 1 | Search retail medicine catalog | GET | `/api/pharmacy/retail/catalog/search` | `PagedRequest<RetailCatalogFilter>` (query, category, barcode) | `PaginationData<RetailMedicineCard>` | Catalog Workspace search/category grid |
| 2 | Lookup medicine by barcode | GET | `/api/pharmacy/retail/catalog/barcode/{code}` | — | `RetailMedicineCard \| null` | Barcode scan add-to-cart |
| 3 | Get medicine detail | GET | `/api/pharmacy/retail/catalog/{medicineId}` | — | `RetailMedicineCard` + alternatives + movement | Product Detail Drawer |
| 4 | Get favorites / recently sold / recommended | GET | `/api/pharmacy/retail/catalog/suggestions?mode=` | query param | `RetailMedicineCard[]` | Catalog result-mode chips |
| 5 | Get inventory insight | GET | `/api/pharmacy/retail/insight` | — | `RetailInventoryInsight` | Inventory Insight strip |
| 6 | List active carts for this terminal/shift | GET | `/api/pharmacy/retail/carts` | — | `RetailCart[]` | Retail Queue Bar on load |
| 7 | Create a new cart | POST | `/api/pharmacy/retail/carts` | `{ name?: string }` | `RetailCart` | "+ New Cart" / "New Sale" |
| 8 | Add/update a cart line item | PUT | `/api/pharmacy/retail/carts/{cartId}/items/{medicineId}` | `{ quantity, discountPercent }` | `RetailCart` | Add to cart / qty / discount edit |
| 9 | Remove a cart line item | DELETE | `/api/pharmacy/retail/carts/{cartId}/items/{lineItemId}` | — | `RetailCart` | Remove line / Clear All |
| 10 | Attach a customer to a cart | PATCH | `/api/pharmacy/retail/carts/{cartId}/customer` | `RetailCustomer` | `RetailCart` | Customer Lookup Drawer "Use as Customer" |
| 11 | Suspend (hold) a cart | POST | `/api/pharmacy/retail/carts/{cartId}/suspend` | — | `RetailCart` | "Suspend Sale" floating action |
| 12 | Resume a held cart | POST | `/api/pharmacy/retail/carts/{cartId}/resume` | — | `RetailCart` | "Resume Sale" floating action |
| 13 | Search patients for customer lookup | GET | `/api/pharmacy/retail/patients/search` | `{ query }` | `RetailCustomer[]` | Customer Lookup Drawer search |
| 14 | Check clinical/interaction warnings | POST | `/api/pharmacy/retail/cart/{cartId}/warnings` | `{ patientId, medicineIds }` | `RetailClinicalWarning[]` | Product Detail Drawer / cart safety check |
| 15 | Complete a sale (checkout) | POST | `/api/pharmacy/retail/carts/{cartId}/checkout` | `{ paymentSplits: RetailPaymentSplit[], amountTendered }` | `RetailTransaction` | Payment Dialog "Complete Sale" |
| 16 | Refund a completed transaction | POST | `/api/pharmacy/retail/transactions/{transactionId}/refund` | `{ reason, lineItemIds? }` | `RetailTransaction` | "Refund" floating action |
| 17 | Get a transaction (for reprint) | GET | `/api/pharmacy/retail/transactions/{transactionId}` | — | `RetailTransaction` | "Reprint" floating action |
| 18 | Print / export a receipt | GET | `/api/pharmacy/retail/transactions/{transactionId}/receipt` | — | binary (`application/pdf`) | "Print Receipt" action |
| 19 | Email a receipt | POST | `/api/pharmacy/retail/transactions/{transactionId}/receipt/email` | `{ email }` | `string` (status) | Payment Dialog "Email Receipt" |
| 20 | SMS a receipt | POST | `/api/pharmacy/retail/transactions/{transactionId}/receipt/sms` | `{ phone }` | `string` (status) | Payment Dialog "SMS Receipt" |

---

## 14. Deliverables Checklist

- [x] Documentation (`docs/pharmacy-retail-redesign.md`)
- [x] Proposed API contract (§13)
- [x] Types: `src/app/shared/types/retail-pos.ts`
- [x] Service: `src/app/services/admin/retail-pos.service.ts` (mock-fallback)
- [x] `PHARMACY_RETAIL` block in `src/app/shared/api/base.ts`
- [x] Route kept at `/admin/pharmacy/retail`
- [x] Components: shell + Catalog/Cart/Checkout panels + Payment Dialog + Product Detail Drawer + Customer Lookup Drawer
