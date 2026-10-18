# Blog Listing Redesign (`/blog`)

Source design: Claude Design project "Brand color consistency issue", `Blog Page.dc.html` (frames 12a and 12b), which imports `Blog Listing.dc.html` and `ArticleCard.dc.html`.
Companion page: the article detail (`/blog/:id`), already built — see `src/app/pages/client/blog/detail`.

## 1. UX Audit

The current `/blog` is the purchased template, not a product page:

- Posts come from the `BLOGS` dummy array; nothing is loaded from the API.
- Every link points at `/react/template/blog/...`, so no card opens an article.
- The pagination (Prev, 1–4, Next) is static markup. The search box and the "Latest News" sidebar do nothing.
- Cards use stock images, a fixed author avatar and a hardcoded `#06aed4` category badge that ignores the brand colours.
- No loading, empty or error state. No way to filter by category.
- The two-column layout with a sticky sidebar leaves only two narrow cards per row on desktop.

## 2. Current Problems

| # | Problem | Impact |
|---|---|---|
| 1 | Dummy data and dead links | Visitors cannot read anything |
| 2 | No search, no category filter | Content is not findable |
| 3 | Pagination is decorative | Only one page is ever visible |
| 4 | Missing-field handling absent | Real articles can lack image, author, excerpt or read time |
| 5 | Off-brand colours and template markup | Inconsistent with Doctors, Services and Article detail |
| 6 | No URL state | Search and page cannot be shared or restored with Back |

## 3. Information Architecture

```
/blog
├── Intro (breadcrumb, H1, lead, search)
├── Featured article        (page 1, All Articles, no search)
└── Articles section
    ├── Heading + live result summary
    ├── Category chips      (All, Medical, Research, Technology, Wellness)
    ├── Card grid | Loading skeletons | Empty | Error
    └── Pagination
```

URL query string is the single source of truth: `/blog?q=knee&category=Medical&page=2`.

## 4. User Journey

1. Visitor lands on `/blog` and sees the newest article featured, then the latest articles.
2. Searches ("knee") or narrows by category. The URL updates and the result summary is announced.
3. Opens a card, which goes to `/blog/:id`. Back restores the same search, category and page.
4. If nothing matches, the empty state offers "Clear search" or "Show all articles".

## 5. Layout

Content width 1200px, 24px gutters on desktop (20px on mobile).

| Breakpoint | Hero | Featured | Grid | Pagination |
|---|---|---|---|---|
| Desktop ≥1024 | 2 columns (title, search) | Image + text, 1.2fr / 1fr | 3 columns | Numbered |
| Tablet 768–1023 | 1 column | 2 equal columns | 2 columns | Numbered |
| Mobile <768 | 1 column, icon-only search button | Stacked | 1 column | "Page x of y" |

## 6. Wireframes

```
Desktop
┌ Home / Blog ──────────────────────────────────────────────┐
│ Health Insights & Advice          Search articles         │
│ lead text                         [ 🔍 input        ][Search]│
├───────────────────────────────────────────────────────────┤
│ [ cover image 4:3 ]   FEATURED · Wellness                 │
│                       Title (H2)                          │
│                       excerpt (3 lines)                   │
│                       (TB) Author · date · 8 min read     │
│                       [Read article →]                    │
├───────────────────────────────────────────────────────────┤
│ Latest articles                  Showing 1–5 of 15 more   │
│ (All Articles)(Medical)(Research)(Technology)(Wellness)   │
│ ┌──────┐ ┌──────┐ ┌──────┐                                │
│ │ card │ │ card │ │ card │                                │
│ └──────┘ └──────┘ └──────┘                                │
│ [‹ Previous]        1 2 3 …        [Next ›]               │
└───────────────────────────────────────────────────────────┘
```

## 7. Component Hierarchy

```
BlogComponent (pages/client/blog/blog.component.ts + .html)
├── ArticleCardComponent         (components/layout/client/article, extended)
└── PublicArticleService.search  (services/public)
```

No new shared component: the featured block and pagination are used only here (pagination markup mirrors the Doctors page). Removed as dead code: `grid.component.ts`, `side-bar.component.ts` and the `BLOGS` dummy data.

`ArticleCardComponent` gains optional inputs `showMeta` (author and read time, off by default so the related-article cards on the detail page are unchanged) and `ctaLabel` (default "Read article"; the listing passes "Read more").

## 8. UI Specification

- Tokens: `primary`, `primaryHover`, `primaryDeep`, `primarySoft`, `surface`, `gray-*`, `danger*`; type and spacing follow the Doctors listing.
- H1 30 / 36 / 44px, semibold, tight tracking. Featured title 22 / 26 / 34px. Section heading 22 / 24 / 26px.
- Search field 52px high, 16px text (avoids iOS zoom). Chips, pagination buttons and clear button ≥44px touch targets.
- Active chip: dark fill (`gray-900`) with a check icon, so state does not depend on colour alone.
- Category badge: `primarySoft` / `primaryDeep`. Initials avatar replaces author photos (the API has a name only).
- Card titles clamp to 2 lines, excerpts to 2 (3 in featured); long titles wrap with `overflow-wrap:break-word`.

## 9. Interaction Design

- Search runs on submit (button or Enter), as designed, with a clear (×) button. It resets to page 1.
- Chips set `category` and reset to page 1; selecting the active chip does nothing.
- Pagination changes `page`, then moves focus to the "Articles" heading and scrolls it into view (respecting reduced motion).
- Every URL change cancels the previous request (`switchMap`). Retry repeats the current query.
- A page beyond the last (old link) falls back to the last page that has results.

## 10. Responsive Behavior

See section 5. Chips scroll horizontally on mobile with the scrollbar hidden and edge padding matching the page gutter.

## 11. Accessibility

- Landmarks: breadcrumb `nav`, `role="search"` form with a visible label, `nav` "Pagination".
- Result summary is `role="status"` `aria-live="polite"`. Error panel is `role="alert"`. Loading grid is `aria-busy`.
- Chips are buttons with `aria-pressed`. Current page has `aria-current="page"`. Disabled Previous/Next use `disabled`.
- The featured image link is `aria-hidden` and not focusable; the title and "Read article" button carry the link (button label includes the title).
- Focus ring visible on all controls; text contrast ≥ 4.5:1 (gray-700 on white or gray-50).
- Animations (skeleton pulse) respect `prefers-reduced-motion`.

## 12. Page States

| State | Behaviour |
|---|---|
| Loading | Hero and chips stay usable; featured and 6 card skeletons (2 on mobile, 4 on tablet) match loaded sizes; summary reads "Loading articles…" |
| Results | Featured (when eligible) plus grid and pagination |
| Empty search | "No articles match “…”" with Clear search and Show all articles |
| Empty category | "No Research articles yet" with View all articles |
| Error | Panel replaces the results; search and filters are kept; Try again repeats the request |
| Last page | Next disabled, no featured |
| Featured without image | Neutral newspaper placeholder, same aspect ratio |

## 13. Edge Cases

- Missing cover image, author, excerpt, read time or date: each is simply not rendered, and the card keeps its height.
- Failed image load falls back to the placeholder.
- Very long title or excerpt: clamped; very long search text is truncated to 100 characters and shown wrapped.
- Unknown `category` in the URL is ignored and treated as All.
- Category `Community` exists in the enum but has no chip; it appears under All Articles only (see recommendations).

## 14. Performance

- One request per query; cancelled when superseded. Lists exclude article content.
- Images are lazy loaded. The grid is paginated at 6 per page (divides evenly into 1, 2 and 3 columns).
- Server render shows the skeleton only; data loads in the browser, as on the other public listings.

## 15. Scalability

Categories are a constant list matching `ArticleCategory`. Adding a category means adding one entry. Tags, sorting and an editor-chosen featured article can be added through the same query object.

## 16. Enterprise Recommendations

- Add an `isFeatured` flag so editors can choose the featured article; until then the newest published article is used.
- Decide whether `Community` gets a chip or is excluded from public search.
- Provide an author profile link when authors become users.
- Add `sitemap` entries and article structured data once slugs are used in URLs.
- The featured article takes one slot of page 1, so page 1 shows 5 grid cards and later pages show 6. Page sizes stay aligned with the API.

---

## Proposed API Contract

Proposal only; backend changes are outside this work. The existing public route is reused where possible.

### Search articles
- **Purpose:** published articles for the listing, newest first.
- **Method / URL:** `POST /api/articles/search`
- **Request:** `{ pageNumber, pageSize: 6, search?, sort: "-publishDate", filter: { start: "", end: "", category: 0..4 | null, status: null } }`
- **Response:** `PagedResponse<PaginationData<PublicArticle>>` (`items`, `totalCount`, `totalPages`, …). `content` should be left out of list items.
- **Frontend usage:** `PublicArticleService.search()` from `BlogComponent.fetch()`.
- **Needs confirming:** visitors only receive Published articles; `search` matches title and excerpt; the endpoint is anonymous.

### Get article
- `GET /api/articles/{id}` (already used by the detail page).
