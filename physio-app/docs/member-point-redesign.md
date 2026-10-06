# Member Points Redesign

Route: `/admin/crm/member-point` · Component: `AdminMemberPointComponent`
Backend: `MemberEndpoints`, `RewardEndpoints` (`physio-server/PhysioBoo.Presentation/Endpoints`)

This redesign replaces the mock page with a working loyalty module. The visual language (Tailwind cards, tabs, tables) is kept; the work is data wiring, states, accessibility and a corrected enrollment flow.

## 1. UX Audit

| Area | Finding |
| --- | --- |
| Data | Every number, member, transaction and reward was hard-coded. Nothing reached a server. |
| Stats | Four KPI cards showed fixed values ("2,847", "↑ 12%"). |
| Members tab | Client-side filtering of 4 rows. "View" used `alert()`, "Edit" did nothing. |
| Points tab | "Member ID" box was not connected to anything. The balance card was static. "View History" did nothing. Add/Redeem modal inputs had no bindings. |
| Rewards tab | "Redeem" buttons did nothing. |
| Register tab | Collected name, email, phone, date of birth and address. That duplicates patient registration and would create a second copy of a person. |
| Feedback | A custom success banner. No loading, empty or error states. No pagination. |
| Accessibility | Modals had no dialog role, no focus handling, no Escape key. Tabs had no roles. |

## 2. Current Problems

1. No persistence: points and enrollments were lost on reload.
2. A "member" was modelled as a free-standing person instead of a patient.
3. A redemption let the user type any point amount, unrelated to the reward cost.
4. Nothing prevented a balance going negative.

## 3. Information Architecture

```
Members & Loyalty Points
├── KPI strip (total, active, points this month, redemptions this month)
├── Members Directory   search · tier filter · status filter · table · pagination
├── Points & Transactions   member lookup · balance card · actions · history
├── Rewards Catalog     reward cards · redeem
└── Register Member     pick patient · tier · terms
```

Domain model: `MemberPoint` (a loyalty enrollment of one `Patient`), `PointTransaction` (append-only ledger), `Reward` (catalog).

## 4. User Journey

1. **Enroll**: Register tab → search patient → choose tier → accept terms → Enroll. The member appears in the directory with the patient's existing loyalty points.
2. **Earn**: Directory → View (opens Points tab) → Add Points → amount + reason → balance and history update.
3. **Redeem**: Rewards tab (or Points tab → Redeem Points) → pick reward → confirm. The balance drops by the reward cost.
4. **Maintain**: Directory → Edit → change tier or status, or remove the member.

## 5. Layout

Desktop first: `max-w-7xl` container, KPI row of four cards, tabs, content panel. Tablet collapses the KPI row to two columns. Mobile stacks everything in one column; the tab bar scrolls horizontally.

## 6. Wireframes

```
┌ Members & Loyalty Points ─────────────────────────────────────────────┐
│ [Total] [Active] [Points this month] [Redeemed this month]            │
│ Members | Points & Transactions | Rewards | Register                  │
│ ┌ search ─────────────────────┐ [Tier ▾] [Status ▾]                   │
│ ├ ID │ Name │ Contact │ Tier │ Points │ Status │ Actions ┤            │
│ │ …rows / skeleton / empty state…                         │           │
│ └ Page 1 of 4 · 38 members                [Previous] [Next]           │
└───────────────────────────────────────────────────────────────────────┘
```

## 7. Component Hierarchy

A single page component, as in the existing code base. Dialogs are inline and share one `closeModals()`.

```
AdminMemberPointComponent
├── KPI cards
├── Tab bar
├── Members panel        → MemberService.search / stats / update / delete
├── Points panel         → MemberService.transactions / addPoints / redeemPoints
├── Rewards panel        → RewardService.search
├── Register panel       → PatientService.search, MemberService.enroll
└── Dialogs: add points · redeem · edit member
```

If the page grows (reward admin UI), extract the panels into components under `components/layout/admin/crm/member-point/` following the Campaign module.

## 8. UI Specification

- Tier badges: Basic gray, Silver blue, Gold yellow, Platinum purple.
- Status badges: active green, inactive gray, suspended red.
- Transactions: earned in green with "+", redeemed in red with "−", with the running balance under each amount.
- Numbers use the `number` pipe; dates use `yyyy-MM-dd`.

## 9. Interaction Design

- Search is debounced (300 ms) and resets to page 1. Filters apply immediately.
- Member and patient lookups are debounced, need 2+ characters, and cancel stale requests (`switchMap`).
- After add/redeem/edit, the selected member, history, directory and KPIs refresh.
- Redeem is disabled with a reason when the reward is unavailable, no member is selected, the member is not active, or the balance is too low.
- Removing a member asks for confirmation. History is kept (soft delete).
- API errors are toasted by the global interceptor; the page only toasts successes.

## 10. Responsive Behavior

Grid breakpoints `md`/`lg` as in the existing page. Tables scroll horizontally. Modals are `max-w-md` with a 16px side margin.

## 11. Accessibility

- Tab bar has `role="tablist"`/`tab`, `aria-selected`; panels have `role="tabpanel"`.
- Dialogs have `role="dialog"`, `aria-modal`, `aria-labelledby`, a CDK focus trap with auto-capture and focus restore, and close on Escape or backdrop click.
- Every input has a label or `aria-label`; decorative SVGs are `aria-hidden`; errors use `role="alert"`; KPI strip is `aria-live="polite"`.
- Buttons are real `<button type="button">` elements.

## 12. Page States

| State | Behaviour |
| --- | --- |
| Loading | Skeleton rows/cards on first load; `—` in KPI cards. |
| Empty | Directory, history and catalog each have a message. |
| Error | Red banner with Retry for members, history and rewards. |
| Success | Toast ("Member enrolled.", "Points added.", …). |
| Disabled | Submit buttons while submitting or invalid; Redeem with reason. |

## 13. Edge Cases

- Redeeming more than the balance: blocked in the UI, and again in the API (atomic `UPDATE … WHERE points >= cost`).
- Two staff changing the same balance at once: the update is a single SQL statement, so no point is lost.
- Patient already enrolled → `MEMBER_ALREADY_ENROLLED`.
- Inactive or suspended members cannot earn or redeem.
- A patient's points from before enrollment become the opening balance (no ledger row).
- Deleting a reward does not alter past redemptions.

## 14. Performance Considerations

Server-side pagination (10 per page), debounced lookups, one `search_by_id` after a change, ledger indexed on `(MemberId, OccurredAt)`. The reward catalog loads once (up to 50 items).

## 15. Scalability

Per-tenant unique codes (`MEM-`, `TXN-`, `RWD-` via the sequence tracker). Ledger is append-only. If volume grows, add a materialised monthly stats table; the stats query currently aggregates the ledger.

## 16. Enterprise Recommendations

- Add point expiry and tier auto-upgrade rules (ledger entry type `Expired`).
- Add an admin UI for the reward catalog (the API already supports create/update/delete).
- Export members and ledger to CSV for finance reconciliation.
- Audit: tier/status changes use a column-only update and bypass the audit-log hook. Add explicit audit entries if compliance requires it.

---

# Proposed API Contract

All responses are wrapped in `ResponseMessage<T>` (`success`, `data`, `errors`). Enums travel as strings; status, type and category are lowercase, tier is capitalized.

| Purpose | Method | URL | Request | Response `data` | Permission |
| --- | --- | --- | --- | --- | --- |
| Search members | POST | `/api/members/search` | `PagedRequest<{tier, status}>` | `PagedResult<Member>` | `crm:member:read` |
| KPI stats | GET | `/api/members/stats` | – | `MemberStats` | `crm:member:read` |
| Get member | GET | `/api/members/{id}` | – | `Member` | `crm:member:read` |
| Enroll patient | POST | `/api/members` | `{patientId, tier}` | member id | `crm:member:create` |
| Change tier/status | PATCH | `/api/members/{id}` | `{tier, status}` | member id | `crm:member:update` |
| Remove member | DELETE | `/api/members/{id}` | – | member id | `crm:member:delete` |
| Point history | POST | `/api/members/{id}/transactions/search` | `PagedRequest<{type}>` | `PagedResult<PointTransaction>` | `crm:member:read` |
| Add points | POST | `/api/members/{id}/points/add` | `{points, description}` | member id | `crm:point:add` |
| Redeem reward | POST | `/api/members/{id}/points/redeem` | `{rewardId, description?}` | member id | `crm:point:redeem` |
| Search rewards | POST | `/api/rewards/search` | `PagedRequest<{category, available}>` | `PagedResult<Reward>` | `crm:reward:read` |
| Create reward | POST | `/api/rewards` | `{title, description, pointsRequired, category}` | reward id | `crm:reward:create` |
| Update reward | PATCH | `/api/rewards/{id}` | create fields + `available` | reward id | `crm:reward:update` |
| Delete reward | DELETE | `/api/rewards/{id}` | – | reward id | `crm:reward:delete` |

JSON shapes: see `shared/types/member.types.ts`, `reward.types.ts`, `transaction.types.ts`.

Error codes: `MEMBER_ALREADY_ENROLLED`, `MEMBER_NOT_ACTIVE`, `POINT_TRANSACTION_INSUFFICIENT_POINTS`, `POINT_TRANSACTION_INVALID_POINTS`, `REWARD_NOT_AVAILABLE`, `OBJECT_NOT_FOUND`.

Prerequisite data: `Sys_SequenceTrackers` rows for `MemberPoint`, `PointTransaction` and `Reward`.
