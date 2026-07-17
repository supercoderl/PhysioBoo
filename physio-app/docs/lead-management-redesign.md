# Lead Management — Redesign

## UX Audit

### Current Problems
- Monolithic 600-line component: template, logic, and data all in one file
- Inline modals instead of the shared `DrawerComponent` pattern
- Raw `<input>` / `<select>` tags instead of `BooInputComponent` / `BooSelectComponent`
- `ngModel` bindings instead of `FormGroup` / `FormBuilder`
- `confirm()` native dialog instead of `DialogService`
- No `ToastService` feedback for create/update/delete
- No `LocalLoadingService` — no loading states on async operations
- No service layer — data lives entirely in component state
- No `AdminContentHeaderComponent` wrapper
- Stats computed via an unverified custom `filter` pipe in the template
- No `BooTableAdminComponent` — no pagination, no sorting, no consistent column layout
- `id` field typed as `number` — rest of system uses `string` UUIDs

### Information Architecture
```
Lead Management
├── KPI Strip (Total / New / Qualified / Converted)
├── Filter Bar (Search | Status | Priority | Date range)
├── Leads Table (paginated)
│   ├── Name + ID
│   ├── Contact (phone + email)
│   ├── Service
│   ├── Status badge
│   ├── Priority badge
│   ├── Assigned To
│   ├── Source
│   └── Actions (Edit → Drawer | Delete)
└── Lead Drawer (Create / Edit)
    ├── Contact Info
    ├── Classification (Service / Source / Status / Priority)
    ├── Assignment
    └── Notes
```

### User Journey
1. Land on page → see KPI strip + paginated table
2. Search/filter leads → table reacts immediately (debounced)
3. Click row name or "Edit" action → drawer slides in with form pre-populated
4. Submit → toast success, table updates optimistically
5. Click "New Lead" → empty drawer opens
6. Delete → confirmation dialog → optimistic removal with rollback on error

## Component Hierarchy
```
CrmLeadManagementListComponent (page)
├── AdminContentHeaderComponent
├── CrmLeadKpiStripComponent
├── CrmLeadTableCardComponent
│   └── BooTableAdminComponent
└── CrmLeadDrawerComponent
    └── DrawerComponent
        ├── BooInputComponent
        ├── BooSelectComponent
        └── BooTextareaComponent
```

## API Contract

### 1. Search Leads
- **POST** `/api/leads/search`
- Request: `PagedRequest<LeadFilter>` — `{ pageNumber, pageSize, search, sort, filter: { start, end, status, priority } }`
- Response: `PagedResponse<PaginationData<Lead>>`

### 2. Get Lead by ID
- **GET** `/api/leads/{id}`
- Response: `PagedResponse<Lead | null>`

### 3. Lead Stats
- **GET** `/api/leads/stats`
- Response: `PagedResponse<LeadStats>` — `{ totalLeads, newLeads, qualifiedLeads, convertedLeads }`

### 4. Create Lead
- **POST** `/api/leads`
- Request: `CreateLeadRequest`
- Response: `PagedResponse<string>` (new lead ID)

### 5. Update Lead
- **PATCH** `/api/leads/{id}`
- Request: `UpdateLeadRequest`
- Response: `PagedResponse<string>`

### 6. Delete Lead
- **DELETE** `/api/leads/{id}`
- Response: `PagedResponse<string>`

## UI Specification

### Status Badges
| Status    | Color                        |
|-----------|------------------------------|
| new       | bg-blue-100 text-blue-700    |
| contacted | bg-amber-100 text-amber-700  |
| qualified | bg-purple-100 text-purple-700|
| converted | bg-green-100 text-green-700  |
| lost      | bg-red-100 text-red-700      |

### Priority Badges
| Priority | Color                        |
|----------|------------------------------|
| high     | bg-red-100 text-red-700      |
| medium   | bg-amber-100 text-amber-700  |
| low      | bg-green-100 text-green-700  |

### KPI Strip
| Card       | Icon       | Tone    |
|------------|------------|---------|
| Total      | users      | primary |
| New        | clock      | warning |
| Qualified  | trending-up| neutral |
| Converted  | check-circle| success|

## Responsive Behavior
- Desktop: full table with all columns
- Tablet: hide Source column
- Mobile: collapsed to Name + Status + Actions

## Page States
- **Loading**: skeleton on table rows while first fetch
- **Empty**: "No leads found" with CTA to add first lead
- **Error**: inline error with retry button
- **Filtering**: table reloads with debounce on search input
