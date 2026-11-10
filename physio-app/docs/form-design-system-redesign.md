# Form Design System Redesign

Status: Phase 1 (foundation + Patient reference form) implemented. Remaining controls and form migrations are
proposed in section 16 and are not yet done.

Scope: frontend only. No business logic, validation rules or API contracts change.

---

## 1. UX Audit (current state)

| Area | Finding |
| --- | --- |
| Tokens | Colours for form controls are hard-coded in each control (`#e6e8ee`, `#FB7185`, `#85757D`, `border-gray-300`). Only the page-level palette exists in `tokens.scss`. |
| Controls | `boo-input`, `boo-select`, `boo-textarea`, `boo-datepicker` share a height (44px) and radius (6px) by convention, but each re-implements border, focus and disabled styling. Hover and read-only states are missing or inconsistent. |
| Labels | Every control uses its `label` as a placeholder. Pages add a separate `<label>` above with copy-pasted classes. |
| Validation | `boo-input`, `boo-select`, `boo-textarea` render their own error paragraph; `boo-datepicker` renders none, so pages hand-write one. Messages appear and disappear with no reserved space, so the form jumps. |
| Sections | Each page hand-writes `<fieldset>` + Tailwind classes (about 125 occurrences in 29 files). Titles are heavy and look recessed. |
| Layout | Grids (`grid-cols-1 sm:grid-cols-2 ...`) are repeated per page. |
| Actions | `boo-form` has its own hard-coded green/grey buttons. |

## 2. Current Problems

1. No single source of truth for form colours, so a palette change means editing every control.
2. Section cards look recessed; title weight/colour compete with field labels.
3. Error, helper and success messaging is inconsistent between controls.
4. Layout shift when a validation message appears.
5. Required indicators differ (`text-red-500` inside the control vs `text-danger` on page labels).
6. No read-only or success state anywhere.

## 3. Information Architecture

```
BooFormContainer            vertical stack, optional max width
  BooFormSection            outlined card with a title in the border
    BooFormSectionHeader    optional title + description + trailing actions (non-card layouts)
    BooFormRow              responsive grid (1 column mobile, N columns desktop, optional ratio)
      BooFormColumn         optional column span
        BooFormField        label above, control, helper / error / success message
          boo-input | boo-select | boo-textarea | boo-datepicker | boo-checkbox ...
    BooFormDivider          separator, optionally labelled
  BooFormActions            footer row, optionally sticky
```

## 4. User Journey

Receptionist registers a patient: scans three cards top to bottom (Patient, Contact, Care), tabs through fields,
sees a required marker before typing, sees an error under the field only after touching it or on a failed save,
and finds the primary action in a sticky footer. Nothing moves when messages appear.

## 5. Layout

* Section card: 12px radius, 1px border, 24px horizontal padding, title sits in the top border.
* Row gap: 16px horizontal, 8px vertical. Each field reserves one message line (18px), giving about 26px between
  control and next label.
* Breakpoints: 1 column below 640px; 2 columns from 640px; the configured column count from 1024px.
* Ratio (`ratio="2fr 1fr"`) replaces equal columns from 640px.

## 6. Wireframes

```
┌─ PATIENT ─────────────────────────────────────────────┐
│                                                       │
│  First name *            Last name *                  │
│  [__________________]    [__________________]         │
│  helper / error line     helper / error line          │
│                                                       │
│  Date of birth *         Gender *                     │
│  [ dd/mm/yyyy     📅]    [ Select          ⌄]         │
│  34 years old                                         │
└───────────────────────────────────────────────────────┘
```

The title is rendered by the native `legend`, which interrupts the border with a transparent gap, so it blends with
whatever surface the card sits on.

## 7. Component Hierarchy

New (in `@physioboo/ui`, `projects/physioboo-ui/src/lib/forms/`):

| Component | Selector | Purpose |
| --- | --- | --- |
| `BooFormContainerComponent` | `boo-form-container` | Vertical stack of sections, optional `maxWidth`. |
| `BooFormSectionComponent` | `fieldset[boo-form-section]` | Outlined card, `heading`, `description`. |
| `BooFormSectionHeaderComponent` | `boo-form-section-header` | Title, description and trailing actions for plain layouts. |
| `BooFormRowComponent` | `boo-form-row` | Responsive grid, `columns`, `ratio`. |
| `BooFormColumnComponent` | `boo-form-column` | Column `span`. |
| `BooFormFieldComponent` | `boo-form-field` | Label above, required marker, helper, error, success; owns messaging for the control inside it. |
| `BooFormActionsComponent` | `boo-form-actions` | Footer row, `align`, `sticky`. |
| `BooFormDividerComponent` | `boo-form-divider` | Separator. |

Improved: `boo-input` (read-only, success, tokens), `boo-select`, `boo-textarea`, `boo-datepicker` (tokens, hover,
read-only/success where applicable, field-aware messaging), `boo-checkbox` (tokens).

## 8. UI Specification

Tokens (all in `projects/physioboo-ui/styles/tokens.scss`, exposed through the Tailwind preset as `form-*` colours):

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--form-text` | #202124 | existing `--twc-regular` | Input text, section title |
| `--form-muted` | #5F6368 | existing `--twc-secondary` | Labels, helper text, placeholder |
| `--form-border` | #DADCE0 | existing `--twc-border` | Control and card border |
| `--form-border-hover` | #80868B | #9AA0A6 | Hover border |
| `--form-surface` | #FFFFFF | existing `--bg-surface` | Control and card surface |
| `--form-subtle` | #F8F9FA | existing `--twc-body` | Disabled and read-only fill |
| `--form-accent` | #1A73E8 | #8AB4F8 | Focus ring, open select |
| `--form-error` | #D93025 | #F28B82 | Error border, message, required marker |
| `--form-success` | #188038 | #81C995 | Success border and message |

Geometry: control height 44px (existing `middle`), radius 6px, card radius 12px, label 13px / 500, helper 12px.

States:

| State | Border | Fill | Text | Other |
| --- | --- | --- | --- | --- |
| Default | border | surface | text | placeholder = muted |
| Hover | border-hover | surface | text | |
| Focus | accent | surface | text | 1px accent ring (2px total weight) |
| Filled | border | surface | text | placeholder hidden |
| Disabled | border | subtle | muted | not-allowed cursor, no opacity stacking |
| Read-only | border | subtle | text | no hover, no focus ring |
| Error | error | surface | text | message in error colour with icon-free text, `role="alert"` |
| Success | success | surface | text | message in success colour |

Brand note: the application accent is rose (`--twc-primary`) while the requested form accent is blue. They are
separate tokens on purpose. Pointing `--form-accent` at `--twc-primary` is a one-line change if the product prefers
one accent.

## 9. Interaction Design

* Label above the control; clicking it focuses the control (`for`).
* Required marker is `*` in the error colour, `aria-hidden`, plus visually hidden "required".
* Message slot below the control reserves one line. Error replaces helper in the same slot; success likewise.
* Errors show once the control is touched or dirty (existing `booValidationMessage` rule, unchanged).
* A control inside `boo-form-field` does not render its own error paragraph (the field owns messaging); outside a
  field the control behaves exactly as before.

## 10. Responsive Behavior

Desktop first. 3-column rows drop to 2 columns on tablet and 1 on mobile. Long labels truncate with ellipsis and a
`title`; long helper and error text wraps inside the reserved area (min-height, not fixed height).

## 11. Accessibility

* Section: native `fieldset`/`legend`, so assistive tech announces "Patient, group".
* Field: `label for`, message container `aria-live="polite"`, errors `role="alert"`.
* Contrast: all text/background pairs in the table meet WCAG AA (muted #5F6368 on white is 6.1:1; error #D93025 is
  4.9:1; success #188038 is 5.3:1; accent #1A73E8 on white is 4.5:1 for non-text focus indicators).
* Focus is visible on every control; read-only controls stay focusable.
* Touch targets: 44px controls.

## 12. Page States

Loading: skeleton rows inside the section (page responsibility). Empty: n/a. Success: success message / toast.
Error: field-level messages plus page-level summary (existing). Disabled: whole section via `disabled` on the
`fieldset` (native).

## 13. Edge Cases

* Very long label or message: truncation (label) / wrapping (message).
* Section with no title: omit `heading`; the legend is not rendered.
* Select dropdown at the bottom of a card: overflow is visible (card does not clip).
* Dark mode: all `form-*` tokens have dark values.
* Control used outside a field (legacy pages): unchanged behaviour, new colours only.

## 14. Performance Considerations

Presentation-only standalone components, no subscriptions, `OnPush` for layout components. Row and column use CSS
custom properties instead of runtime class generation.

## 15. Scalability

New controls join by implementing `ControlValueAccessor`, reading `form-*` tokens and honouring `BOO_FORM_FIELD`.
Palette changes happen in one file.

## 16. Enterprise Recommendations and Adoption Plan

Implemented in this phase: tokens, layout components, `boo-form-field`, restyled input/select/textarea/datepicker/
checkbox, and all three cards (Patient, Contact, Care) of the registration form. Not yet verified in a browser.

Existing building blocks to align next (no new code needed, token pass only): `boo-switch`, `boo-upload`,
`boo-search-field`, `boo-textarea-v2`, `boo-location-select`, `boo-icon-select`.

Components still to build (not in this phase): PasswordInput, NumberInput, PhoneInput as thin variants of
`boo-input`; MultiSelect; Autocomplete; RadioGroup; TimePicker; DateRangePicker; ImageUpload.

Forms proposed for migration, ordered by value (drawers and dialogs with the most hand-written fieldsets):
`reception/booking/booking-form-drawer`,
`inpatient/admission/admission-form-drawer`, `crm/patient/patient-edit-drawer`, `cms/service/service-edit-drawer`,
`crm/marketing-campaign/campaign-edit-drawer`, `cms/home-configuration/*-edit-drawer`,
`crm/support-complaint/complaint-edit-drawer`, `crm/lead-management/lead-edit-drawer`,
`cms/article-news/article-edit-drawer`, `finance/cashier/*-dialog`, `finance/insurance/insurance-company-form-drawer`.

Migration considerations: replace page-level `<label>` + hand-written error paragraph with `boo-form-field`; keep the
`label` input on controls (still the placeholder); keep control `id`/`name` so `for` links resolve.

---

# Proposed API Contract

None. This redesign is presentation-only and requires no backend endpoints. Existing registration endpoints and
request/response shapes are unchanged.
