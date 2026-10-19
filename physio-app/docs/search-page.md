# Search Page (`/search`)

Source design: Claude Design project, `Search Page.dc.html` (frames 13a–13e), which imports `Search.dc.html`, `SearchResult.dc.html` and `InlineError.dc.html`.
Code: `src/app/pages/client/search` (`search.component.ts/.html`, `search-result.component.ts`) and the `search` route in `client.routes.ts`.

## 1. What it does

A new public page under the client layout. Visitors type a keyword and press Search, then switch between All, Doctors, Services, Clinics and Articles.

- **Initial**: hero with the search form, "Popular searches" chips and a "browse by category" grid.
- **All tab**: the four existing search endpoints are called in parallel with `pageSize: 3`. Each section shows its `totalCount` and a "See all N …" link to its tab.
- **Category tabs**: 12 per page with the same pagination as the listing pages, plus that type's filters (an aside on desktop, a bottom sheet below `lg`).

There is no unified search API, and none was added.

## 2. Tabs → endpoints and filters

| Tab | Endpoint | Filters (URL param) | Result opens |
|---|---|---|---|
| Doctors | `POST /api/public/doctors/search` | `specialty`, `clinic` (ids from `/doctors/filters`), `online=true`, `home=true` | `/doctor/:id` |
| Services | `POST /api/public/services/search` | `clinic` (id from `/services/filters`) | `/services/:id` |
| Clinics | `POST /api/public/hospitals/search` | `hospitalType` (HospitalType value) | `/hospitals/:id` |
| Articles | `POST /api/articles/search` | `category` (ArticleCategory name) | `/blog/:id` |
| All | All four, 3 each | none | "See all" switches tab |

## 3. URL state

`/search?q=physio&type=doctors&specialty=…&clinic=…&online=true&page=2`

- Submitting writes `q`, and drops filters. Pressing Search with nothing typed does nothing except focus the field and show the guidance line.
- Changing tab keeps `q` and drops the previous tab's filters. Submit, tab changes and filters all push history entries, so Back/Forward restore them.
- Desktop filters apply immediately. The mobile sheet edits a draft that applies on "Show …"; closing the sheet discards it.
- `type` without `q` falls back to the initial state. Invalid ids, types and categories are ignored.
- **Deviation:** the clinic type filter is `hospitalType`, not `type`, because the design's URL already uses `type` for the tab.

## 4. Loading and errors

- Skeleton rows while loading. Zero results is the empty state, never an error. It offers shortcuts to other tabs that have matches.
- **All tab**: if one endpoint fails, its section shows `boo-inline-error` with its own Try again, and the other sections still render. If all four fail, the page shows the full error block.
- **Category tab**: a failed request shows the full error block. Try again (or pressing Search again) repeats the same request, and the query stays in the field.
- Tab badges show the keyword-only totals from the All requests. The selected tab shows its filtered total, and a badge is hidden while its count is unknown.

## 5. Differences from the prototype

- The dark URL strip and the "Prototype: navigates to …" toast exist only in the prototype.
- Rows show the real avatar or cover image when there is one. Otherwise they fall back to initials (doctors) or the type icon.
- Popular searches are the first three specialties from `/api/public/doctors/filters`, not a hard-coded list. They are hidden if that call fails.
- The breadcrumb uses the site's chevron separator.
- Clinic type and article category options are the real enums: the same four types as the Clinics page, and the five ArticleCategory values.

## 6. Open

- **How visitors reach `/search`.** The header has no search entry yet (header icon, homepage hero?).
- Confirm which fields `/api/articles/search` matches on its keyword.
