# Home Page Configuration (CMS) — Redesign

## UX Audit

### Current Problems
- Entire page is a single monolithic component (`AdminHomeConfigurationComponent`) with a 380-line inline template and hardcoded dummy arrays (`banners`, `features`, `testimonials`, `settings`) — not connected to any service or API
- Hand-rolled tab nav, hand-rolled cards, hand-rolled modal — no `AdminContentHeaderComponent`, no `DrawerComponent`, no `BooTableAdminComponent`, inconsistent with every other CMS admin page (Article & News, Doctor, Department, Appointment Type)
- The "Add Banner" / "Add Feature" modal is decorative only: its inputs have no `formControlName`, its Save button has no click handler, and Cancel wires to the wrong flag (`showTestimonialModal`) — nothing can actually be saved
- Feature icons are raw emoji (🏥 👨‍⚕️ 🚑 💊 🔬 📱) — not accessible, not themeable, not stylable, violates the SVG-icon convention used everywhere else in the app
- Delete uses the browser's native `confirm()`; Save Settings uses `alert()` — neither goes through `DialogService` / `ToastService`
- No pagination, search, sort, or filter on any of the three lists — everything renders as an unbounded client-side array
- No loading, empty, or error states anywhere on the page
- `Banner` / `Feature` / `Testimonial` models (`shared/types/*.types.ts`) use `id: number`, out of step with every other entity in the app (`id: string`, backend-issued)
- General Settings tab has no backing service — `saveSettings()` only `console.log`s and shows an `alert()`

### Information Architecture
```
Home Page Configuration (CMS)
├── Content Header (title + "New Item" button, button label/action depends on active tab)
├── Tab Navigation (Hero Banners | Features | Testimonials | General Settings)
├── Hero Banners tab
│   ├── Toolbar (Search | Reload | Sort)
│   ├── Banners Table (paginated)
│   └── Banner Drawer (Create / Edit)
├── Features tab
│   ├── Toolbar (Search | Reload | Sort)
│   ├── Features Table (paginated)
│   └── Feature Drawer (Create / Edit)
├── Testimonials tab
│   ├── Toolbar (Search | Reload | Sort)
│   ├── Testimonials Table (paginated)
│   └── Testimonial Drawer (Create / Edit)
└── General Settings tab
    └── Settings Form (hospital identity, contact, emergency banner toggle)
```

### User Journey
1. Land on page → "Hero Banners" tab active by default, paginated table loads (loading state while fetching)
2. Switch tabs → each tab lazily drives its own table-card + drawer + service, independent pagination/search/sort per entity
3. Click "New Item" (label changes contextually: "Add Banner" / "Add Feature" / "Add Testimonial") → empty drawer opens for authoring
4. Click a row or its edit action → drawer opens pre-filled, fetched via `search_by_id`
5. Save → toast success, table updates optimistically (insert or replace row) without a full reload
6. Delete (row action or in-drawer) → `DialogService.confirmDelete()` → optimistic removal with rollback toast on failure
7. "General Settings" tab → form pre-loads current settings via `HomeSettingsService.get()`, "Save Settings" persists via `update()` with a success/error toast (no more `alert()`)

## Component Hierarchy
```
AdminHomeConfigurationComponent (page, tab orchestrator only)
├── AdminContentHeaderComponent
├── (Hero Banners tab)
│   ├── HomeConfigBannerTableCardComponent
│   │   └── BooTableAdminComponent → BooActionAdminComponent
│   └── HomeConfigBannerDrawerComponent
│       └── DrawerComponent → BooInputComponent, BooUploadComponent, BooCheckboxComponent, BooButtonAdminComponent
├── (Features tab)
│   ├── HomeConfigFeatureTableCardComponent
│   └── HomeConfigFeatureDrawerComponent
│       └── DrawerComponent → BooInputComponent, BooSelectComponent (icon picker), BooTextareaComponent, BooCheckboxComponent
├── (Testimonials tab)
│   ├── HomeConfigTestimonialTableCardComponent
│   └── HomeConfigTestimonialDrawerComponent
│       └── DrawerComponent → BooInputComponent, BooSelectComponent (rating), BooTextareaComponent, BooCheckboxComponent
└── (General Settings tab)
    └── Settings form → BooInputComponent, BooTextareaComponent, BooCheckboxComponent, BooButtonAdminComponent
```

## API Contract

### Hero Banners

#### 1. Search Banners
- **POST** `/api/home-banners/search`
- Request: `PagedRequest<BannerFilter>` — `{ pageNumber, pageSize, search, sort, filter: { active } }`
- Response: `PagedResponse<PaginationData<Banner>>`
- Frontend usage: `BannerService.search()`, called on init, page change, search, sort, filter

#### 2. Get Banner by ID
- **GET** `/api/home-banners/{id}`
- Response: `PagedResponse<Banner | null>`
- Frontend usage: `BannerService.search_by_id(id)`, drawer `loadDetail()` and post-save re-fetch

#### 3. Create Banner
- **POST** `/api/home-banners`
- Request: all `Banner` fields except `id`
- Response: `PagedResponse<string>` (new banner ID)
- Frontend usage: `BannerService.create()`

#### 4. Update Banner
- **PATCH** `/api/home-banners/{id}`
- Request: partial `Banner` fields
- Response: `PagedResponse<string>`
- Frontend usage: `BannerService.update()`

#### 5. Delete Banner
- **DELETE** `/api/home-banners/{id}`
- Response: `PagedResponse<string>`
- Frontend usage: `BannerService.delete()`

### Features

Same 5-endpoint shape as Banners, under `/api/home-features` (`FeatureService`, `Feature`, `FeatureFilter`).

### Testimonials

Same 5-endpoint shape as Banners, under `/api/home-testimonials` (`TestimonialService`, `Testimonial`, `TestimonialFilter`).

### General Settings

#### 1. Get Settings
- **GET** `/api/home-settings`
- Purpose: single-record configuration (no pagination) for the "General Settings" tab
- Response: `PagedResponse<HomeSettings>`
- Frontend usage: `HomeSettingsService.get()`, called once in `ngOnInit` when the settings tab component initializes

#### 2. Update Settings
- **PUT** `/api/home-settings`
- Request: `HomeSettings` (full object; single-record resource, no ID in the URL)
- Response: `PagedResponse<HomeSettings>`
- Frontend usage: `HomeSettingsService.update()`, called from `saveSettings()`

## Data Model

```ts
export interface Banner {
    id: string;
    title: string;
    subtitle: string;
    imageUrl: string;
    buttonText: string;
    buttonLink: string;
    order: number;
    active: boolean;
}

export interface Feature {
    id: string;
    icon: string;        // lucide icon name, e.g. "hospital", "stethoscope"
    title: string;
    description: string;
    order: number;
    active: boolean;
}

export interface Testimonial {
    id: string;
    patientName: string;
    rating: number;       // 1-5
    comment: string;
    date: string;
    active: boolean;
}

export interface HomeSettings {
    hospitalName: string;
    tagline: string;
    welcomeMessage: string;
    contactPhone: string;
    contactEmail: string;
    address: string;
    showEmergencyBanner: boolean;
}
```

## UI Specification

### Tabs
| Tab              | Table Columns                                                        |
|------------------|-----------------------------------------------------------------------|
| Hero Banners     | Image, Title/Subtitle, Order, Status badge, Actions                   |
| Features         | Icon, Title/Description, Order, Status badge, Actions                 |
| Testimonials     | Patient, Rating (stars), Comment, Date, Status badge, Actions          |
| General Settings | (form, not a table)                                                    |

### Status Badge
| State    | Color                       |
|----------|------------------------------|
| Active   | bg-green-100 text-green-800 |
| Inactive | bg-gray-100 text-gray-800   |

### Feature Icon Picker
`BooSelectComponent` bound to a fixed lucide icon list (`hospital`, `stethoscope`, `ambulance`, `pill`, `microscope`, `smartphone`, `heart-pulse`, `shield-check`), rendered via `<boo-icon>` in both the select and the table/drawer preview — replaces the emoji field entirely.

## Interaction Design
- Row / edit action → `onOpenDrawer(id)` per entity
- "New Item" (contextual label) → `onOpenDrawer(null)`
- Save in drawer → emits `saveSuccess`, list closes drawer and merges result into that entity's `tableData` (insert at top if new, replace in place if edited) — identical optimistic-update pattern used by Department/Doctor/Article
- Delete → `DialogService.confirmDelete()` then optimistic list update with rollback toast on API failure
- Switching tabs does not refetch data already loaded for a previously visited tab (each tab's list component owns its own signal state and only loads on its own `ngOnInit`)
- "Save Settings" → validates required fields, calls `HomeSettingsService.update()`, shows `ToastService.success`/`error` (no more `alert()`)

## Responsive Behavior
- Desktop: all columns visible per table
- Tablet: Banners hide Order column; Testimonials hide Date column
- Mobile: Image/Icon + Title/Patient + Status + Actions only (via `BooTableAdminComponent`'s existing responsive column logic)
- Settings form: 2-column grid collapses to 1 column below `md`

## Accessibility
- Banner/feature images and icons have descriptive `alt`/`aria-label`; feature icons are semantic SVGs (`boo-icon`), not emoji
- Status communicated via badge text, not color alone
- Star rating rendered with `aria-label="{{rating}} out of 5"` in addition to the visual stars
- Drawer form fields use `BooInputComponent`/`BooSelectComponent`/`BooTextareaComponent`/`BooCheckboxComponent` labels (WCAG-compliant per shared component library)
- Delete requires confirmation dialog, never a bare destructive click
- Tab nav buttons use `role="tab"`/`aria-selected` semantics consistent with the shared tab pattern

## Page States
- **Loading**: `boo-table-admin`'s built-in loading state via `loadingSrv.isLoading('search')`, per entity
- **Empty**: shared table empty state ("No banners/features/testimonials found")
- **Error**: `ToastService`; delete/save failures roll back optimistic state
- **Drawer loading**: overlay spinner while `search_by_id` resolves in edit mode
- **Settings loading**: form disabled + spinner while `HomeSettingsService.get()` resolves on first tab visit

## Edge Cases
- Deleting the last item on a non-first page → step back one page (existing Department/Doctor/Article logic, reused as-is)
- Save with required fields empty → validation blocks submit, toast + `markAllAsTouched()`
- Banner image / feature icon not yet set → table falls back to a placeholder icon
- Rating outside 1-5 → `BooSelectComponent` constrains input to a fixed 1-5 option list, no free-text entry
- Settings save while another save is in flight → button `[loading]`/`[disabled]` bound to `LocalLoadingService.isLoading('update')`

## Performance & Scalability
- Server-side pagination, search, and sort per entity (no client-side array filtering, unlike the current implementation)
- Each tab's table/drawer components are only instantiated when needed inside the tab's `*ngIf`, so inactive tabs do no network work
- Debounced search input via existing `boo-input` `(search)` output, shared across all three tables

## Enterprise Recommendations
- Out of scope for this pass (flagged as follow-ups): drag-and-drop reordering for `order` fields (currently a manual number input), a banner image cropper/aspect-ratio guide, and wiring the public home page to consume these same APIs so Settings/Banners/Features/Testimonials are no longer duplicated as separate public-site dummy data.
