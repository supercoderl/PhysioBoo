# @physioboo/ui

PhysioBoo's internal Angular UI library: the generic, presentation-only building blocks of the PhysioBoo design
system. It is a first-party Angular library (ng-packagr) in the `physio-app` workspace.

The library holds no API calls, routing decisions or page workflows. Pages and the domain components in
`src/app/components` (doctor, clinic, service and article cards, drawers, table cards) compose these parts and own
their data.

## Using it in the app

```ts
import { BooButtonComponent, BooEmptyStateComponent } from '@physioboo/ui';
```

- Always import from `@physioboo/ui`. Never import a file under `projects/physioboo-ui/src/lib/`.
- `tsconfig.json` maps `@physioboo/ui` to `projects/physioboo-ui/src/public-api.ts`, so `ng serve` and `ng build` of
  the app compile the library from source and pick up changes immediately. Building the library separately
  (`ng build physioboo-ui`) checks that it still packages on its own.
- Every component is standalone. Add the ones a template uses to that component's `imports`.

### Styles

The components use Tailwind utility classes and PhysioBoo's design tokens. An app that uses the library must:

1. Include `projects/physioboo-ui/styles/tokens.scss` in its global styles (`angular.json` → `styles`). It defines the
   `--twc-*` and `--color-*` CSS variables for light and dark mode.
2. Use `tailwind.preset.js` as a Tailwind preset and list the library's sources in `content`:

   ```js
   presets: [require('./projects/physioboo-ui/tailwind.preset.js')],
   content: ['./src/**/*.{html,js,ts}', './projects/physioboo-ui/src/**/*.{html,ts}'],
   ```

### Icons

`physio-icon` fetches `<BOO_ICON_PATH>/<name>.svg` in the browser and inlines it. `BOO_ICON_PATH` defaults to
`assets/icons`, which `physio-app` serves from `src/assets/icons`. Provide the token to load them from elsewhere.

## Contents

| Area | Export | Selector |
| --- | --- | --- |
| Icons | `BooIconComponent`, `BOO_ICON_PATH` | `physio-icon` |
| Actions | `BooButtonComponent` (`BooButtonVariant`, `BooButtonSize`) | `button[boo-button]`, `a[boo-button]` |
| | `BooSpinnerComponent` | `boo-spinner` |
| Navigation | `BooBreadcrumbComponent` (`BooBreadcrumbItem`) | `boo-breadcrumb` |
| | `BooPaginationComponent`, `booPageRange()` | `boo-pagination` |
| Feedback | `BooEmptyStateComponent` | `boo-empty-state` |
| | `BooErrorStateComponent` | `boo-error-state` |
| | `BooInlineErrorComponent` (`BooInlineErrorState`) | `boo-inline-error` |
| | `BooStatusBadgeComponent` (`BooBadgeTone`) | `boo-status-badge` |
| Filters and search | `BooSearchFieldComponent` | `boo-search-field` |
| | `BooFilterChipsComponent` (`BooFilterChip`) | `boo-filter-chips` |
| Overlays | `BooSheetComponent` | `boo-sheet` |
| Forms | `BooFormComponent` | `form[boo-form]` |
| | `BooInputComponent` | `boo-input` |
| | `BooCheckboxComponent` | `boo-checkbox` |
| | `BooFieldErrorComponent` | `boo-field-error` |
| | `booValidationMessage()`, `BooControlSize` | |

## Conventions

**Package and entry point.** One package, `@physioboo/ui`, with one entry point, `src/public-api.ts`. A symbol is
public only if `public-api.ts` exports it. Library files import each other with relative paths and never import
from the app.

**Selectors.** Components use the `boo-` prefix: an element selector (`boo-pagination`) for standalone widgets, an
attribute on the native element (`button[boo-button]`, `form[boo-form]`) when the component enhances that element
and must keep its native semantics. `physio-icon` is the one exception: it predates the library and is used in
several hundred templates.

**Exported symbols.** Classes are `Boo<Name>Component`; types and interfaces are `Boo<Name>` (`BooBadgeTone`,
`BooBreadcrumbItem`); functions are `boo<Name>` (`booPageRange`); injection tokens are `BOO_<NAME>`.

**Files.** One component per file, named `<name>.component.ts` inside a folder per area (`lib/state/`,
`lib/forms/`). Templates and styles are inline.

**Inputs.** camelCase nouns or adjectives (`appearance`, `heading`, `busy`, `iconOnly`). Visual options are string
unions with a default: `variant` for colour treatment, `size` for scale, `appearance` for layout variants. Avoid
input names that are also native attributes of the host (`title`, `hidden`) so they cannot change native behaviour.

**Outputs.** Named for the user action, camelCase, without an `on` prefix and not a native DOM event name:
`retry`, `remove`, `clear`, `dismiss`. A value the parent owns uses the `<name>Change` pair (`page` /
`pageChange`). Components report intent and the parent changes state; for example `boo-search-field` emits
`clear` and the parent empties the model.

**States.** `disabled` and `loading` are inputs. A disabled or loading button ignores the pointer, sets
`aria-disabled` (anchors) or `disabled` (buttons), and `aria-busy` while loading. Form controls implement
`ControlValueAccessor` and show the bound control's validation message once it is touched.

**Accessibility.** Icon-only buttons need an `aria-label`. Landmarks and live regions are part of the component
(`nav aria-label="Breadcrumb"`, `role="alert"` on error panels, `role="dialog" aria-modal` on the sheet).
Overlays trap nothing but restore focus to where it came from when they close.

**Styling.** Tailwind utilities against the PhysioBoo tokens only; no hard-coded colours when a token exists.
Layout that depends on where a component sits (margins, widths, flex sizing, responsive visibility) goes on the host
element from the page, not into the component.

**Scope.** A component belongs here when it is presentation-only and either already used in more than one place or
a clear design-system primitive. Domain cards, table cards, drawers that edit a record and page sections stay in the
app.
