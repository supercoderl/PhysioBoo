# Admin layout contract

Corrective audit of the Admin workspace geometry, breadcrumbs, viewport behaviour and scrollbars. The Admin Dashboard is the reference: shell gutter only, no page max-width, `gap-4` stacks, `text-xl` heading.

## Root causes found

| # | Symptom | Root cause | Fixed in |
|---|---------|-----------|----------|
| 1 | Breadcrumbs on some pages only, at different offsets | Each page imported `AdminBreadcrumbComponent` itself (or got it through `admin-content-header`); the Dashboard, Finance, Pharmacy, Paraclinical, Nursing pages had none | `admin-layout.component.ts` renders it once; page copies removed |
| 2 | Horizontal jumps between pages | Pages added their own `px-4 sm:px-6`, `max-w-[1600px] mx-auto`, `container p-4 md:p-6` on top of the shell's `px-4` | Page roots no longer pad or cap width |
| 3 | Outer page always scrolled, scrollbar invisible | Page hosts used `min-h-screen` (100vh) inside `#wrapper`, which is shorter than the viewport; `#wrapper::-webkit-scrollbar { display: none }` hid it | Hosts are sized by the shell; scrollbar shown |
| 4 | Long tables grew the page instead of scrolling | No height chain from the shell to the table: tables sat in auto-height blocks, or used `calc(100vh - Nrem)` guesses that ignore the real shell | Flex chain `host → page root → region → table` (below) |
| 5 | Insurance (and Cashier, Inventory, Stock take) table could not scroll sideways | `custom-scrollbar` on the `overflow-x-auto` wrapper set `scrollbar-width: none` and injected `::-webkit-scrollbar { display:none }`, hiding the native bar on **both** axes while drawing only a vertical overlay. The wrapper was also outside the table, so the bar would have sat under the pagination | `CustomScrollbarDirective`, `minTableWidth` on `boo-table-admin` |
| 6 | Directive leaked | One `<style>` per instance and an un-removed `window` resize listener | `scrollbar.directive.ts` |

## Layout contract

```
main (relative, max-h-svh)
└─ header
└─ div.px-4                       ← the only horizontal gutter
   ├─ admin-breadcrumb             ← once, shrink-0, pt-4, mb-3
   └─ #wrapper.boo-scrollbar       ← flex column, flex-1 min-h-0, overflow-auto
      └─ <routed page host>        ← styles.scss: flex column, flex 1 1 0%, min-h-0, min-w-0
         └─ page root              ← flex-1 min-h-0 flex-col gap-4 pb-5   (fill pages)
                                      pb-5 flex-col gap-4                 (stack pages, e.g. Dashboard)
            ├─ header              ← shrink-0
            ├─ KPI / filters       ← shrink-0
            └─ region              ← flex-1 min-h-[22rem], scrolls itself
               └─ table host       ← h-full min-h-0 (boo-table-admin is `display:block; height:100%`)
                  └─ scroll area   ← overflow-auto: header sticky, both bars, footer fixed below
```

* **Fill pages** (Cashier, Insurance, Inventory, Stock take, counting, Retail, Dispense, queue/booking/admission lists, bed map, module pages with tabs): the table or list is the region; headings, KPIs, filters, tabs and the breadcrumb stay put. Every flex item between the host and the scroller carries `min-h-0`; the region carries a `min-h-[..]` floor so a very short viewport scrolls `#wrapper` instead of crushing the table.
* **Stack pages** (Dashboard, Nursing dashboard/handover, Revenue report, Registration, Doctor desk, Prescription, Member points): content simply overflows the host and `#wrapper` scrolls. Their tables still scroll sideways inside their own card.
* **Module pages with tabs** (Laboratory, Radiology, Surgery, Treatment sheet, Medical record, Nursing patient): header + tab bar are a fixed card; `<main class="boo-scrollbar min-h-0 flex-1 overflow-auto">` scrolls the active tab.
* No page sets `min-h-screen`, `h-screen`, `100vh`/`calc(100vh - …)`, `max-w-*` + `mx-auto`, or its own horizontal padding. Drawers and dialogs are overlays and may use viewport units.
* Never add `overflow-hidden` to an ancestor of a scroll area unless the scroll area is *inside* it (card rounding is fine; clipping the bar is not).
* A routed page host is a flex column, so a page that renders several top-level elements (`ng-container` + header + `main`) can use `flex-1` on one of them directly.

## Breadcrumbs

`admin-breadcrumb` is rendered by `app-admin-layout`. It reads `data.breadcrumb` from the activated route chain (`/admin › finance › cashier`), so labels and nesting follow `admin.routes.ts`. Pages must not render their own. `admin-content-header` is now a plain pass-through wrapper (`flex flex-1 min-h-0 flex-col`) kept for the CMS/CRM/System list pages. The component now unsubscribes from router events.

## Scrollbars

One treatment, defined in `src/styles.scss`:

* Tokens `--scrollbar-size` (8px), `--scrollbar-thumb`, `--scrollbar-thumb-hover` (dark-theme overrides under `:root.dark`).
* `.boo-scrollbar`, `[custom-scrollbar]` and every `.overflow-x-auto | .overflow-y-auto | .overflow-auto` inside `#admin-layout` get the same thin track/thumb/hover. Native bars keep their own gutter, so they never cover rows, actions, pagination or the last column; mouse wheel, touch and trackpad behave natively.
* `CustomScrollbarDirective` keeps its vertical overlay (same thumb colour via the tokens) but no longer hides the horizontal bar: `[data-scrollbar-overlay]` collapses only the native vertical bar (`::-webkit-scrollbar:vertical { width: 0 }`). The overlay track now ends at `clientHeight`, above the horizontal bar. Engines without `::-webkit-scrollbar` (Firefox) skip the overlay and use `scrollbar-width: thin` + `scrollbar-color` on both axes.
* Chromium 121+ ignores `::-webkit-scrollbar` once `scrollbar-width`/`scrollbar-color` is set, so the Firefox properties live in `@supports not selector(::-webkit-scrollbar)`.

## Tables

* `boo-table-admin` (shared): new `minTableWidth` input sets the table's `min-width`; columns keep a readable width and the table's **own** scroll area scrolls sideways with the sticky header and the pagination footer staying in place. Host gets `min-w-0`.
* List wrappers for Cashier bills, Insurance companies, Inventory medicines, Stock takes no longer wrap the table in an `overflow-x-auto custom-scrollbar` div with a `min-w-[..]` child; they pass `minTableWidth` and give the table a definite height.
* Revenue report department/doctor/bill tables pass `minTableWidth`.
* Hand-written tables (Retail catalog, counting table, queue, bookings, admissions) sit in a `min-h-0 flex-1 overflow-auto` container with a `sticky top-0` header and a `min-w` on the `<table>`.
* Remaining wrapper-level `overflow-x-auto` tables inside tab content (Lab, Surgery, Nursing, Treatment sheet, Medical record) were already reachable; they now pick up the shared scrollbar styling and are not clipped, because their ancestors scroll rather than hide.

## Accessibility and responsive notes

* Breadcrumb keeps `aria-label="breadcrumb"`; the shell wrapper no longer hides its scrollbar, so keyboard and pointer users can see and reach it. Scroll regions that are keyboard-focusable keep their existing `tabindex`/roles.
* Below `lg`/`xl` the two-pane pages (Cashier, Insurance, Retail, Dispense, counting) fall back to stacked blocks of natural height and `#wrapper` scrolls; their side panels remain drawers where they already were.

## Not covered / follow-ups

* `insurance-claims-workspace` and `dispense-detail-panel` are self-contained workspaces with their own internal scrolling; only their outer size changed.
* Tables on Dashboard widgets (`appointments-panel`, `patient-flow-panel`) rely on wrapper `overflow-x-auto` and were not restructured.
