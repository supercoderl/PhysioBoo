# Article & News (CMS) — Redesign

## UX Audit

### Current Problems
- Entire page is a public-blog-style **showcase** built on hardcoded dummy data (`articles: Article[]` literal array) — not connected to any service or API
- No create/edit/delete — staff cannot actually manage content from this admin page
- No `AdminContentHeaderComponent`, no `DrawerComponent`, no `BooTableAdminComponent` — inconsistent with every other CMS admin page (Doctor, Department, Hospital Group, Appointment Type)
- Category filter is a raw `<select>` with `ngModel`, not `BooSelectComponent` / `FormGroup`
- Search is a raw `<input>` with `ngModel`, not `BooInputComponent`
- Pagination buttons are static markup with no logic wired up
- No loading, empty, or error states
- `Article` model (`shared/types/article.types.ts`) has no `content`, `status`, or `id: string` — shaped for display only, not for authoring/editing

### Information Architecture
```
Article & News (CMS)
├── Content Header (title + "New Item" button)
├── Toolbar (Search | Date range | Reload | Filter | Sort)
├── Articles Table (paginated)
│   ├── Cover thumbnail
│   ├── Title (+ slug, click → edit)
│   ├── Category badge
│   ├── Status badge (Draft / Published / Archived)
│   ├── Author
│   ├── Publish Date
│   └── Actions (Delete)
└── Article Drawer (Create / Edit)
    ├── Basic Info (Title, Slug, Category, Tags)
    ├── Media (Cover Image)
    ├── Content (Excerpt, Body)
    └── Publishing (Status, Publish Date, Read Time)
```

### User Journey
1. Land on page → paginated table of existing articles loads (loading skeleton while fetching)
2. Search / filter / sort → table reloads reactively
3. Click "New Item" → empty drawer opens for authoring
4. Click a row title or its edit action → drawer opens pre-filled, fetched via `search_by_id`
5. Save → toast success, table updates optimistically (insert or replace row) without a full reload
6. Delete (row action or in-drawer) → confirmation dialog → optimistic removal with rollback toast on failure

## Component Hierarchy
```
AdminArticleNewsListComponent (page, replaces AdminArticleNewsComponent)
├── AdminContentHeaderComponent
├── CmsArticleNewsTableCardComponent
│   └── BooTableAdminComponent
│       └── BooActionAdminComponent
└── CmsArticleNewsDrawerComponent
    └── DrawerComponent
        ├── BooInputComponent
        ├── BooSelectComponent
        ├── BooTextareaComponent
        └── BooUploadComponent
```

## API Contract

### 1. Search Articles
- **POST** `/api/articles/search`
- Purpose: paginated, filterable, sortable list for the admin table
- Request: `PagedRequest<ArticleFilter>` — `{ pageNumber, pageSize, search, sort, filter: { start, end, status, category } }`
- Response: `PagedResponse<PaginationData<Article>>`
- Frontend usage: `ArticleService.search()`, called from `loadArticles()` on init, page change, search, sort, filter, date-range change

### 2. Get Article by ID
- **GET** `/api/articles/{id}`
- Purpose: hydrate the drawer when editing, and re-fetch the canonical record right after create/update
- Response: `PagedResponse<Article | null>`
- Frontend usage: `ArticleService.search_by_id(id)`, called in drawer `loadDetail()` and after `create`/`update` to emit the full object via `saveSuccess`

### 3. Create Article
- **POST** `/api/articles`
- Request: `CreateArticleRequest` (all `Article` fields except `id`, `createdAt`, `updatedAt`)
- Response: `PagedResponse<string>` (new article ID)
- Frontend usage: `ArticleService.create()` from drawer `onSave()` when `currentId` is null

### 4. Update Article
- **PATCH** `/api/articles/{id}`
- Request: `UpdateArticleRequest` (partial `Article` fields)
- Response: `PagedResponse<string>`
- Frontend usage: `ArticleService.update()` from drawer `onSave()` when editing

### 5. Delete Article
- **DELETE** `/api/articles/{id}`
- Response: `PagedResponse<string>`
- Frontend usage: `ArticleService.delete()` from list `onDelete()` (row action, optimistic removal + rollback) and drawer `onDelete()` (edit mode)

## Data Model

```ts
export interface Article {
    id: string;
    title: string;
    slug: string;
    category: string;          // 'Medical' | 'Research' | 'Technology' | 'Wellness' | 'Community'
    tags: string;               // comma-separated, e.g. "AI, Diagnosis, Technology"
    coverImageUrl: string;
    excerpt: string;
    content: string;
    author: string;
    status: 'Draft' | 'Published' | 'Archived';
    publishDate: string | null;
    readTime: string;           // e.g. "5 min read", derived from content length, editable
    createdAt: string;
    updatedAt: string;
}
```

## UI Specification

### Status Badges
| Status    | Color                        |
|-----------|-------------------------------|
| Draft     | bg-gray-100 text-gray-700     |
| Published | bg-green-100 text-green-700   |
| Archived  | bg-slate-100 text-slate-500   |

### Category Badges
| Category   | Color                         |
|------------|--------------------------------|
| Medical    | bg-blue-100 text-blue-700      |
| Research   | bg-purple-100 text-purple-700  |
| Technology | bg-indigo-100 text-indigo-700  |
| Wellness   | bg-emerald-100 text-emerald-700|
| Community  | bg-amber-100 text-amber-700    |

### Table Columns
| Column        | Sortable | Notes                                   |
|---------------|----------|------------------------------------------|
| Cover         | no       | 40x40 thumbnail, falls back to placeholder icon |
| Title         | yes      | truncated, click opens drawer            |
| Category      | yes      | badge                                     |
| Status        | yes      | badge                                     |
| Author        | no       |                                            |
| Publish Date  | yes      | via `boo-date-admin` formatted date       |
| Actions       | no       | Delete (danger)                            |

## Interaction Design
- Row title / edit action → `onOpenDrawer(id)`
- "New Item" button → `onOpenDrawer(null)`
- Save in drawer → emits `saveSuccess`, list closes drawer and merges result into `tableData` (insert at top if new, replace in place if edited)
- Delete → `DialogService.confirmDelete()` then optimistic list update with rollback toast on API failure, same pattern as Department/Doctor

## Responsive Behavior
- Desktop: all columns visible
- Tablet: hide Author column
- Mobile: Cover + Title + Status + Actions only (handled by `BooTableAdminComponent`'s existing responsive column logic)

## Accessibility
- Cover image `alt` = article title
- Status/Category communicated via badge text, not color alone
- Drawer form fields use `BooInputComponent`/`BooSelectComponent`/`BooTextareaComponent` labels (already WCAG-compliant per shared component library)
- Delete action requires confirmation dialog (no destructive one-click actions)

## Page States
- **Loading**: `boo-table-admin`'s built-in skeleton via `loadingSrv.isLoading('search')`
- **Empty**: shared table empty state ("No articles found")
- **Error**: toast via `ToastService`; delete/save failures roll back optimistic state
- **Drawer loading**: overlay spinner while `search_by_id` resolves in edit mode (same as Department drawer)

## Edge Cases
- Deleting the last article on a non-first page → step back one page (existing Department/Doctor logic, reused as-is)
- Save while `content`/`excerpt` empty → required-field validation blocks submit, toast + `markAllAsTouched()`
- Cover image not yet uploaded → table falls back to a placeholder icon, drawer preview shows empty upload state

## Performance & Scalability
- Server-side pagination, search, sort, and filtering (no client-side array filtering, unlike the current implementation)
- Cover thumbnails only (`40x40`) in the table; full-size image only loaded in the drawer preview
- Debounced search input via existing `boo-input` `(search)` output (shared across all CMS pages)

## Enterprise Recommendations
- Out of scope for this pass (flagged as follow-ups): wiring the public client blog to this same API/model, a rich-text content editor (none exists in the repo today — `BooTextareaComponent` is the interim solution), and an author user-picker (currently free-text).
