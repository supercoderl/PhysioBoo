# UI Component Consolidation Redesign

Status: passes 1 and 2 complete; legacy button migration and the public-site forms are still open (see "Remaining work").
Goal: the shared library (`@physioboo/ui` in `projects/physioboo-ui` plus the `boo-*` components in `src/app/components`)
is the single source of truth for interactive UI. Native elements remain only where listed under "Justified exceptions".

## 1. UX Audit

Method: a script scanned every `.html` file and every inline `template` in `.ts` files under `src/` and `projects/`
(853 files, specs excluded) for `<button>`, `<input>`, `<textarea>`, `<select>`, `<table>`. Elements inside the shared
component implementations themselves are not violations and were excluded.

| Native element | Occurrences outside the library | Already shared (`boo-button` attribute) |
| --- | --- | --- |
| `<button>` | 314 | 516 |
| `<input>` (excluding `hidden`, `file`) | 92 | 428 `boo-input` usages |
| `<textarea>` | 16 | 114 `boo-textarea` usages |
| `<select>` | 21 | 206 `boo-select` usages |
| `<table>` | 52 | 37 `boo-table-admin` usages |

The earlier headline count (830 buttons) counted `<button boo-button>` hosts, which are the shared component, not violations.

## 2. Current Problems

1. Close buttons in 20+ drawers/dialogs are hand-styled (`w-8 h-8 rounded-full hover:bg-gray-100`) with three different sizes and colours.
2. "Record name" links in 25+ table cells re-implement the same text-button classes.
3. Drawer "Delete" actions copy `text-red-500 hover:text-red-700`, which bypasses the `danger` token.
4. Header and chat toolbar icon buttons repeat `inlineFlex-center-center ... p-2 rounded-2` per button.
5. Raw form controls in the super-admin drawers, the insurance claim dialog, the public contact/doctor forms and several
   filter bars carry their own height, border and focus styling.
6. Three button components coexist: `boo-button` (library, token based), `boo-button-admin` (inline-style props) and
   `button-icon`. `boo-button` is the target; the other two are legacy and are not extended.
7. About fifteen list pages each re-implement a tablist (`role="tab"`) and a status filter pill row.

## 3. Information Architecture

```
@physioboo/ui           BooButton (a/button[boo-button]), BooInput, BooCheckbox, BooFormField..., BooFilterChips,
                        BooSearchField, BooPagination, BooStatusBadge, BooEmptyState, BooSheet, BooSpinner
src/app/components      boo-select, boo-textarea, boo-datepicker, boo-table-admin, drawer, global-dialog, boo-tag, switch
```

## 4. User Journey

No journey changes. Every refactor keeps the same controls, labels, order, keyboard path and result. The visible
difference is consistent size, radius, hover, focus and disabled treatment.

## 5. Layout

Unchanged. Where a shared control is taller than the native one it replaced, the dense context passes `classname`
(for example the 32px header icon buttons).

## 6. Wireframes

Not applicable: no screen layout changes. Per-control mapping:

```
close X, toolbar icon      -> <button boo-button variant="ghost" [iconOnly]="true" aria-label>
inline record link         -> <button boo-button variant="text" classname="...">
drawer delete              -> <button boo-button variant="ghost" classname="!text-danger">
text/number/search input   -> <boo-form-field><boo-input/></boo-form-field>
native select              -> <boo-form-field><boo-select [options]/></boo-form-field>
textarea                   -> <boo-form-field><boo-textarea/></boo-form-field>
checkbox                   -> <boo-checkbox/>
```

## 7. Component Hierarchy

Unchanged apart from the extension below.

## 8. UI Specification

**Extension: `BooButtonComponent` variant `text`** (backward compatible, new union member only).
Inline text action for table cells and prose: no fixed height, no padding, no border, transparent background,
`text-primary`, underline on hover, 2px primary focus ring, `inline-block max-w-full` so `truncate` works. The `size`
input is ignored. Colour or weight overrides go in `classname` with the `!` prefix (the variant sets its own text colour).
Why not `link`: `link` is a 40px-high underlined button, which would grow table rows.

## 9. Interaction Design

Disabled and loading follow `BooButton` (`pointer-events-none`, 50% opacity, `aria-busy`). Focus ring is the shared
`ring-primary`. No handler, `ngModel`, `formControlName` or `(click)` is altered; attributes are carried over verbatim.

## 10. Responsive Behavior

Shared controls keep their existing breakpoints. Icon-only buttons keep the 40px touch target except in the dense
admin header and chat toolbars, which pass an explicit `classname` size.

## 11. Accessibility

Icon-only buttons keep their `aria-label`. A close button without a label receives `aria-label="Close"`. Focus ring
contrast is the primary rose on the surface colour. Tablists and menu items keep their roles (see exceptions).

## 12. Page States

Loading, empty, error, success and disabled states of each page are untouched; only the element behind a control changes.

## 13. Edge Cases

* Conditional buttons (`*ngIf`) keep their directive.
* Buttons with `[ngClass]`, `[class.x]`, `role`, `aria-pressed`, `aria-selected` or `*ngFor` are not converted
  automatically because their visual state is part of their meaning.
* Buttons containing block content (rows, cards) are not converted.

## 14. Performance Considerations

No change. The attribute selector adds no wrapper element, so DOM size is the same.

## 15. Scalability

`variant="text"` removes the need to copy the class string into every new table card.

## 16. Enterprise Recommendations

1. Introduce `boo-tabs` and `boo-segmented` in the library and migrate the ~15 tablists and pill rows (needs keyboard
   roving-tabindex behaviour designed once).
2. Deprecate `boo-button-admin` and `button-icon` in favour of `boo-button`; migrate 75 + 22 files in a dedicated change.
3. Add a lint rule (template ESLint) that forbids raw `<button>`, `<input>`, `<select>` without an explicit exemption comment.

## Proposed API contract

None. This change is frontend only and calls no new endpoint.

## Library extensions made (all backward compatible)

| Component | Change |
| --- | --- |
| `BooButtonComponent` | New `variant="text"` (inline text action, see section 8). Added to the spec's variant table. |
| `BooInputComponent` | New optional inputs `min`, `max`, `step`, `inputmode`, `ariaLabel`, `ariaDescribedby` and `numberValue`. `numberValue` makes the control emit a number (null when empty): a native `type="number"` input does that, but `boo-input` binds `type` dynamically and so emitted strings. Without it, replacing a native number input would silently change the type sent to the API. Default is off, so existing users are unaffected. |
| `BooFormFieldComponent` | `flag` input transform changed from a const arrow function to a function declaration. AOT rejected the arrow ("Input transform must be a function"); that error was already in the working tree and blocked compilation. |

## Results (pass 1)

| Metric | Before | After |
| --- | --- | --- |
| Native `<button>` without `boo-button` (app templates) | 314 | about 150 |
| Native `<input>` (not hidden/file) | 92 | 58 |
| Native `<textarea>` | 16 | 10 |
| Native `<select>` | 21 | 17 |
| Native `<input type="checkbox">` | 6 | 2 |
| Hand-written pagination (roles list) | 1 | 0 (uses `boo-pagination`) |

Converted: close buttons, drawer delete actions, record-name links, toolbar and header icon buttons, text actions,
submit buttons in the IP-access and audit-log forms, the insurance claim dialog, filters and detail panel, the
super-admin menu, plan, subscription and IP-access forms, the dev-data count field, the booking start-time and duration
fields, the radiology scheduling inputs, the diagnoses search, and four public-site checkboxes. A stray literal word
"trash" rendered inside the permission delete button was removed with the conversion.

## Justified exceptions (native element kept)

| Area | Count (approx.) | Reason |
| --- | --- | --- |
| `role="tab"` tablists and `aria-pressed` filter pills | 31 + 27 | No shared tabs or toggle-chip component exists. Each owns roving tabindex and selected styling. Needs `boo-tabs` / `boo-segmented` (recommendation 1). |
| Print template designer (`ptd-*`: buttons, number/text/colour/range inputs, textareas) | about 35 + 30 | Dedicated 28px-dense property inspector with its own design language; shared controls are 34-44px with floating labels. |
| Combobox inputs (`role="combobox"`): header page search, admission and booking patient lookup | 3 | An ARIA combobox needs a native input with the listbox wired to it; no shared combobox exists. |
| Inline editors that move focus by template reference or `autofocus` (notes, scrumboard titles, add-card/list) | about 10 | `boo-input` does not forward `autofocus` or expose focus. |
| Chat composer textarea, post-comment textarea | 3 | Auto-growing textarea with a hidden measuring twin. |
| Icon library search | 1 | `/` keyboard shortcut focuses the element by reference. |
| JSON input (dev tool) | 1 | Monospace code area; `boo-textarea` has no monospace option. |
| Public-site forms and filters (`pages/client/*`): selects, text/tel/email/search inputs, consent checkbox, honeypot | 17 selects + about 20 inputs | Public site uses its own design tokens and native mobile pickers; the admin `boo-select` is a custom dropdown with floating label. A public variant is a design task, not a swap. |
| List rows, accordion headers, TOC toggles, tile buttons, colour/icon swatches, bed tiles, `menu-tree` chevron | about 45 | Buttons whose content is a whole row, card or tile; `boo-button` sizes a single-line label. |
| Chat widget and header chrome | 9 | Bespoke layout inside the shell. |
| `<table>` (52) | 52 | Read-only semantic tables in clinical tabs. `boo-table-admin` is a server-paged grid with toolbar and footer; there is no static table primitive. `print-layout.ts` and `print.utils.ts` build print HTML, not UI. |
| `<input type="hidden|file">` | all | No shared equivalent; native semantics required. |

## Phase 2: new shared components

All live in `@physioboo/ui`, are standalone, and are covered by Karma specs (`tabs.component.spec.ts`,
`dialog.component.spec.ts`, `feedback.spec.ts`).

| Component | API | Replaces |
| --- | --- | --- |
| `boo-tabs` | `[tabs]: BooTab[]` (`value`, `label`, `icon`, `count`, `disabled`, `dot`, `divider`, `countUnit`), `[value]`, `(valueChange)`, `label`, `variant` = `underline` | `pill` | `stat` | `segment`, `idPrefix`, `panelPrefix`, `controls`, `listClass`, `bordered` | 23 hand-written tablists (list pages, clinical/paraclinical shells, cashier, insurance, revenue, retail carts, public search) and `superadmin-tabs` (now an adapter) |
| `boo-segmented` | `[options]`, `[value]`, `(valueChange)`, `label`, `size`, `iconOnly` (radio group) | 4 toggle-pill rows (lab result filter, prescription status, revenue period, claim density) |
| `boo-dialog` | `heading`, `description`, `size` sm/md/lg, `tone`, `icon`, `busy`, `closable`, `closeOnBackdrop`, `alert`, `form`, `(dismiss)`, `(formSubmit)`; body is projected content, footer is `boo-dialog-footer` | 12 hand-rolled `fixed inset-0` dialogs; `global-dialog` and `cashier-dialog` now render through it |
| `boo-alert` | `tone`, `role` alert/status/note, `heading`, `icon` | 5 hand-styled message boxes |
| `boo-field-error` | added `size="sm"` and `announce` | 56 hand-written `<p role="alert" class="text-xs text-danger">` messages |
| `boo-spinner` | added `inline`, `tone` light/primary/current, `label` | 47 `<physio-icon name="loader" class="animate-spin">` page/panel/dialog loaders and the duplicate `dot-spinner` (deleted) |
| `boo-button` | added `variant="danger"` | red buttons built from `!bg-rose-600` / `!bg-danger` overrides |

Keyboard model shared by tabs and segmented: Arrow keys, Home and End move between enabled items and select them, wrapping;
only the selected item (or the first enabled item when the value matches none) is in the tab order.

### `global-dialog` decision

`global-dialog` is a confirm-only singleton driven by `DialogService` (83 callers). It had no `role="dialog"`, no focus
handling and no way to show form content, so it could not be the general dialog. It stays as the *confirmation* entry point,
now rendered by `boo-dialog` (`alertdialog`, danger/warning/success/info icon, Cancel focused first). One dialog system.
Simplification: the old scale-in animation of the panel is gone; the backdrop fade is kept.

### Spinner rules applied

* Page / panel / table / dialog loading blocks: `boo-spinner inline tone="primary"` (decorative; the container carries `aria-busy`).
* Buttons: unchanged. `boo-button [loading]` still only disables and dims; no spinner was injected into any button.
* Icon-state swaps (search icon becoming a loader while a lookup runs, a refresh icon spinning while reloading) are kept:
  the icon is the control's content, not a loading block.

## Test baseline

| Run | Result |
| --- | --- |
| Clean `HEAD` (separate git worktree), `ng test physioboo-ui` | 7 of 18 failed |
| Working tree before any test-config change | the same 7 failed (identical names and messages) |
| Root cause | the `physioboo-ui` test target had no `styles` or `assets`: Tailwind CSS was never compiled into the test page (buttons measured the browser default 51px instead of 40/44/52px, `nowrap` was missing) and the icon SVGs had no `/assets` to fetch. The app's own test target already had both. |
| Fix | `angular.json`: the library test target now loads `tokens.scss`, `src/styles.scss` and `src/assets`. No test was edited. |
| After | 18 of 18 pass; with the new specs 33 of 33 pass. |

## Browser verification (headless Chrome over the DevTools protocol)

Done against the running dev server on public routes: `/`, `/doctor`, `/hospitals`, `/services`, `/blog`, `/about-us`,
`/contact`, `/search`, `/term`, `/privacy`, `/auth/login` at 1280px and 390px: no error overlay, no console errors, no horizontal
scroll. Checked interactively: the public search tab strip (roving focus, ArrowRight selects and focuses the next tab, URL
updates, counts render), the mobile filter sheet checkboxes (toggle writes `?online=1`), and the contact form validation
messages (`boo-field-error`).

**Not verified in a browser:** every authenticated admin and super-admin page. The documented seed login does not exist in the
dev database and no other credentials were available, so those changes are verified by type-check, build and Karma only.

## Remaining work (stated plainly)

* **Admin pages in a browser**: needs a working login. Highest risk spots to eyeball first: ghost icon buttons on coloured headers
  (chat widget back/close), dialog footers, the stat tab strips, `boo-input numberValue` fields in the super-admin drawers.
* **Legacy buttons**: `boo-button-admin` (132 tags, 59 files; 48 use `background="transparent"`) and `button-icon` (36 tags, 22 files)
  are still in use. They expose inline-style props (`background`, `textColor`, `padding`, `radius`) that do not map to token
  variants, and their default height is 32px against 40px for `boo-button sm`, so a mechanical swap changes layouts. Needs a
  compact size on `boo-button` first, then a per-variant mapping.
* **Public-site forms** (17 native selects, about 20 inputs): needs a public variant of `boo-select` that opens the native picker
  on touch devices, plus `boo-input` support for `autocomplete`, `aria-invalid` and `aria-describedby` wiring from the page.
* **Dialogs left hand-rolled (12 files with `fixed inset-0`)**: note composer and board card editor (inputs with `autofocus`),
  print preview and template picker (popups), table filter/date/column popovers, and the layout drawers/menus. These are
  popovers or drawers rather than modal dialogs, or need a further `boo-dialog` option (non-modal) first.
* Toggle chips that can be deselected (workflow rail, note labels, group-by) are not single-choice, so they are not `boo-segmented`.
