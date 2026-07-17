# Support & Complaints — Redesign

## UI/UX Skill Output Summary

### Design System (PhysioBoo HIS)
- **Style**: Enterprise SaaS — professional blue (#2563EB), green accent (#059669) for resolved
- **Density**: 8/10 — Dense/Dashboard (8–32px spacing scale, compact table rows, `gap-3.5` cards)
- **Motion**: 3/10 — Subtle only (drawer slide-in 200–300ms, no decorative animation)
- **Validation**: `updateOn: 'blur'` — errors shown only after field is touched (Angular guideline)
- **Icons**: Lucide SVG only via `BooIconComponent` — no emoji, no raw inline SVGs
- **Color tokens**: semantic classes (`bg-blue-100 text-blue-700`) — no hardcoded hex

### UX Domain Findings Applied
- Submit shows `LocalLoadingService` spinner → `ToastService` success/error (not silent)
- Table wrapped in `BooTableAdminComponent` (handles overflow-x-auto, skeleton loading)
- Validation fires on blur, errors shown only when `touched`
- `DialogService.confirmDelete` before any destructive action
- Removed `alert()` for details — replaced with full `DrawerComponent`
- Removed `setTimeout` toast — replaced with `ToastService`

---

## UX Audit

### Current Problems
| # | Issue | Severity |
|---|-------|----------|
| 1 | Tab-based layout mixes admin mgmt + patient-facing FAQ — wrong context for an admin CRM | High |
| 2 | `alert()` for viewing complaint details — blocking, inaccessible | High |
| 3 | `setTimeout` to auto-dismiss success — bypasses `ToastService` | High |
| 4 | Raw `<input>/<select>/<textarea>` instead of shared Boo components | High |
| 5 | Template-driven `ngForm` — no `FormGroup`, no `updateOn: 'blur'` | High |
| 6 | No loading states — frozen UI during async operations | High |
| 7 | No service layer — hardcoded data in component | High |
| 8 | No `AdminContentHeaderComponent` wrapper | Medium |
| 9 | No `BooTableAdminComponent` — no pagination, no sorting | Medium |
| 10 | No KPI strip — zero data visibility at a glance | Medium |
| 11 | `Complaint` type uses loose `string` types — no enums | Medium |
| 12 | FAQ section not appropriate for admin management view | Low |

---

## Information Architecture

```
Support & Complaints (Admin CRM)
├── KPI Strip (Total / Pending / In Progress / Resolved)
├── Complaints Table (paginated, sortable)
│   ├── Ticket # + Subject
│   ├── Patient (name + email)
│   ├── Category
│   ├── Priority badge (Low → Urgent)
│   ├── Status badge (Pending / In Progress / Resolved / Closed)
│   ├── Submitted date + Resolved date
│   └── Actions → Drawer | Delete
└── Complaint Drawer (Log new / Edit existing)
    ├── Status selector (edit-only, prominent at top)
    ├── Patient Info (name, ID, email, phone)
    ├── Classification (category, priority, assigned to)
    └── Complaint Detail (subject, description)
```

---

## API Contract

### 1. Search Complaints
- **POST** `/api/complaints/search`
- Request: `PagedRequest<ComplaintFilter>` — `{ pageNumber, pageSize, search, sort, filter: { start, end, status, priority, category } }`
- Response: `PagedResponse<PaginationData<Complaint>>`

### 2. Get Complaint by ID
- **GET** `/api/complaints/{id}`
- Response: `PagedResponse<Complaint | null>`

### 3. Complaint Stats
- **GET** `/api/complaints/stats`
- Response: `PagedResponse<ComplaintStats>` — `{ total, pending, inProgress, resolved }`

### 4. Create Complaint
- **POST** `/api/complaints`
- Request: `CreateComplaintRequest`
- Response: `PagedResponse<string>` (new complaint ID)

### 5. Update Complaint
- **PATCH** `/api/complaints/{id}`
- Request: `UpdateComplaintRequest`
- Response: `PagedResponse<string>`

### 6. Delete Complaint
- **DELETE** `/api/complaints/{id}`
- Response: `PagedResponse<string>`

---

## UI Specification

### Status Badges (Dense — `px-2 py-0.5`)
| Status | Classes |
|--------|---------|
| Pending | `bg-gray-100 text-gray-700` |
| In Progress | `bg-blue-100 text-blue-700` |
| Resolved | `bg-green-100 text-green-700` |
| Closed | `bg-purple-100 text-purple-700` |

### Priority Badges
| Priority | Classes |
|----------|---------|
| Low | `bg-green-100 text-green-700` |
| Medium | `bg-amber-100 text-amber-700` |
| High | `bg-orange-100 text-orange-700` |
| Urgent | `bg-red-100 text-red-700` |

### Status Selector (Drawer — edit mode only)
4-button pill row at top of drawer — visually selects current status with icon + label.
Each button has a distinct active class (gray / blue / green / purple) matching the badge color.

### KPI Strip
| Card | Icon | Tone |
|------|------|------|
| Total Tickets | inbox | primary |
| Pending | clock | warning |
| In Progress | loader | neutral |
| Resolved | check-circle | success |

---

## Component Hierarchy

```
AdminSupportComplaintComponent (page)
├── AdminContentHeaderComponent
├── CrmComplaintKpiStripComponent
│   └── StatCardComponent ×4
├── CrmComplaintTableCardComponent
│   └── BooTableAdminComponent
│       ├── ColumnDefDirective ×7
│       └── BooActionAdminComponent
└── CrmComplaintDrawerComponent
    └── DrawerComponent
        ├── BooInputComponent ×5
        ├── BooSelectComponent ×3
        ├── BooTextareaComponent ×1
        └── BooButtonAdminComponent ×2
```

---

## Accessibility Checklist (from skill)
- [x] All inputs use `BooInputComponent` with visible labels
- [x] Errors shown only after `touched` (not on page load)
- [x] Destructive action (delete) gated behind `DialogService.confirmDelete`
- [x] Drawer close button has `aria-label="Close drawer"`
- [x] Delete button has `aria-label="Delete complaint"`
- [x] Color is not the only indicator — badges include text label
- [x] Lucide SVG icons only — no emoji as structural elements
- [x] Loading state via `LocalLoadingService` — UI stays interactive, spinner shown

## Responsive Behavior
- Desktop: full 7-column table
- Tablet: Category column collapses
- Mobile: `BooTableAdminComponent` handles overflow-x scroll
