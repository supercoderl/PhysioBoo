---
name: PhysioBoo
description: A calm, warm-neutral healthcare interface with one rose accent, flat bordered surfaces and restrained motion.
colors:
  primary: "#E11D48"
  primary-hover: "#BE123C"
  primary-pressed: "#9F1239"
  primary-deep: "#9F1239"
  primary-soft: "#FFE9EE"
  primary-active-soft: "#FDD9E1"
  logo-rose: "#F43F5E"
  page: "#FDF8F9"
  surface: "#FFFFFF"
  border: "#EFE3E7"
  border-strong: "#E3D5DA"
  text: "#26141A"
  text-secondary: "#71606A"
  text-muted: "#A1A1AA"
  neutral-50: "#FDF8F9"
  neutral-100: "#FAF1F3"
  neutral-200: "#EFE3E7"
  neutral-300: "#E3D5DA"
  neutral-500: "#85757D"
  neutral-600: "#71606A"
  neutral-700: "#55434B"
  neutral-800: "#3F2129"
  neutral-900: "#26141A"
  danger: "#B42318"
  danger-soft: "#FEF3F2"
  danger-border: "#F3C7C2"
typography:
  display:
    fontFamily: "Geist, Roboto, Helvetica, Arial, sans-serif"
    fontSize: "3.5rem"
    fontWeight: 600
    lineHeight: "4rem"
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Geist, Roboto, Helvetica, Arial, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 600
    lineHeight: "2.75rem"
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Geist, Roboto, Helvetica, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: "1.5rem"
  body:
    fontFamily: "Geist, Roboto, Helvetica, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: "1.5rem"
  label:
    fontFamily: "Geist Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.8125rem"
    fontWeight: 500
    letterSpacing: "0.04em"
rounded:
  xs: "3px"
  button: "10px"
  button-lg: "12px"
  tile: "12px"
  card: "16px"
  card-mobile: "14px"
  pill: "9999px"
spacing:
  gutter-min: "20px"
  gutter-max: "64px"
  content-max: "1760px"
  grid-gap: "16px"
  section-y: "96px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    typography: "{typography.title}"
    rounded: "{rounded.button}"
    height: "44px"
    padding: "0 18px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-primary-pressed:
    backgroundColor: "{colors.primary-pressed}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.neutral-900}"
    rounded: "{rounded.button}"
    height: "44px"
    padding: "0 18px"
  button-outline:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary-deep}"
    rounded: "{rounded.button}"
    height: "44px"
    padding: "0 18px"
  button-soft:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary-deep}"
    rounded: "{rounded.button}"
    height: "44px"
    padding: "0 18px"
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.neutral-900}"
    rounded: "{rounded.pill}"
    height: "34px"
    padding: "0 14px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: "20px"
  icon-tile:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary-deep}"
    rounded: "{rounded.tile}"
    size: "48px"
  search-bar:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: "8px"
---

# Design System: PhysioBoo

## Overview

**Creative North Star: "The Calm Front Desk"**

A well-run clinic reception: warm, orderly and unhurried. The visitor may be unwell, anxious or booking for a relative, so the interface never shouts. It sits on warm off-white and rose-tinted neutrals, speaks in plain sentences, and puts one clear next step on each screen. The same system serves staff in `/admin`, where the calm becomes precision: consistent controls, quiet surfaces, no decoration competing with clinical data.

Density follows the surface. The public site breathes (large section rhythm, generous cards). `/admin` and `/superadmin` pack more per screen but keep the same colors, radii, focus ring and type, so a tenant's staff and their patients feel they use one product.

**Key Characteristics:**
- Warm neutrals, never cool grays. Tailwind's default `gray` and `slate` are remapped to a rose-cast scale.
- One accent, rose `#E11D48`, used rarely and on purpose.
- Flat, bordered surfaces at rest; a soft shadow and a 3px lift appear only on hover or focus.
- Geist for text, Geist Mono for small uppercase eyebrow labels.
- Motion is short, opacity/transform only, and fully switched off under `prefers-reduced-motion`.
- Light and dark themes share one token set (`:root` and `:root.dark`).

## Colors

A warm rose accent on blush-tinted neutrals. Tokens live in `projects/physioboo-ui/styles/tokens.scss` as space-separated RGB (`--twc-*`, so Tailwind can add alpha) and as hex (`--color-*`) for plain CSS. Keep the two in sync. Dark mode redefines every token under `:root.dark`.

### Primary
- **Signal Rose** (#E11D48): primary buttons, links, the focus ring, selected states and `border` accents on hover. Also the legacy gradient start on auth buttons.
- **Deep Rose** (#BE123C / #9F1239): hover and pressed states of Signal Rose. #9F1239 is also the text color on soft rose tiles (`primary-deep`).
- **Blush Tint** (#FFE9EE, active #FDD9E1): icon tiles, soft and outline button fills, hovered options, info banners.
- **Logo Rose** (#F43F5E): the logo mark only.

### Neutral
- **Blush Paper** (#FDF8F9): the page background (`--twc-body`).
- **Clean Surface** (#FFFFFF): cards, headers, inputs (`--bg-surface`).
- **Warm Hairline** (#EFE3E7): default borders and dividers; **Warm Hairline Strong** (#E3D5DA) for borders that must read on hover and for `gray-300` outlines.
- **Plum Ink** (#26141A): primary text, headings, the dark announcement strip (`gray-900`).
- **Dusty Mauve** (#71606A): secondary text, descriptions, labels.
- **Faded Mauve** (#85757D): placeholder text on public inputs.
- **Disabled Gray** (#A1A1AA): table headers, disabled and decorative text only.

### Semantic
- **Alert Brick** (#B42318, soft #FEF3F2, border #F3C7C2): destructive actions and errors. Deliberately distinct from the rose accent so "danger" never reads as "brand".

### Named Rules
**The One Voice Rule.** Rose marks the one action or state that matters on a screen. Most of any page is warm neutral. If rose appears on more than a handful of elements, something is mislabeled as important.

**The Warm Neutral Rule.** Never introduce a cool gray, slate-blue or pure-black text. Use the remapped `gray` scale and Plum Ink.

**The Danger Is Not Brand Rule.** Destructive and error states use Alert Brick, never Signal Rose.

## Typography

**Display / Body Font:** Geist (with Roboto, Helvetica, Arial, sans-serif)
**Label / Mono Font:** Geist Mono (with ui-monospace, SFMono-Regular, Menlo, monospace)

**Character:** Geist is a clean, slightly technical sans that keeps a hospital site from feeling soft or childish; semibold weights carry hierarchy rather than size jumps. Geist Mono appears only in tiny uppercase eyebrow labels (the tenant name over the hero headline), a quiet nod to records and forms.

### Hierarchy
- **Display** (600, 34px/40px mobile, 56px/64px at `lg`, -0.02em): the home hero headline only; `text-balance`.
- **Headline** (600, 24px/30px mobile, 36px/44px at `lg`, -0.01em at `lg`): section titles ("Browse by specialty").
- **Title** (600, 15-16px, 24px line): card titles, button labels (14-15px), list item names.
- **Body** (400, 16px/24px; 18px/28px for hero intro): paragraphs. Hero intro is capped near 540px; reading copy keeps a 640-760px measure; article body uses 808px, Privacy/Terms 1012px.
- **Label** (Geist Mono 500, 12-13px, +0.04em, uppercase): eyebrow above a heading.

### Named Rules
**The Weight Over Size Rule.** Hierarchy comes from 600 vs 400 and from the size steps above, not from extra sizes. Do not invent in-between font sizes.

**The Mono Is An Eyebrow Rule.** Geist Mono is for short uppercase labels only; never body copy or buttons.

## Layout

Desktop first, then tablet and mobile.

- **One public container.** Every public section (header, body, footer) uses `.public-container` from `src/styles.scss`: content capped at `--public-max` (110rem = 1760px), side gutters `--public-gutter: clamp(1.25rem, 4vw, 4rem)` (20px on mobile, about 58px at 1440px, 64px from 1600px). Never write `max-w-[…px] mx-auto px-*`.
- **Section rhythm.** Sections stack with 48px/24px top and bottom padding on mobile and 96px/48px on desktop; a section header sits 18px (mobile) to 32px (desktop) above its grid.
- **Grids.** Cards use `grid-cols-2` on mobile and 4 across at `lg`, with 10px mobile / 16px desktop gaps.
- **Breakpoints.** Tailwind defaults (sm 640, md 768, lg 1024, xl 1280). The header collapses to a menu below `xl`; hero layout and grids switch at `lg`.
- **Sticky header.** A dark announcement strip plus a white bar (64px, 76px at `xl`), sticky at `top-0`.
- **Admin shell.** `/admin` is exactly one viewport tall and scrolls `#wrapper`; its px-4 shell gutter is the only horizontal padding. Pages add no max-width. See `docs/admin-layout-contract.md`.
- **Touch targets.** Buttons are 40/44/52px tall; the 44px default is the touch target. Mobile chips are 38px.

## Elevation & Depth

Flat by default. Surfaces separate with 1px warm borders, not shadows. A soft shadow appears only as a response: hover or focus on cards, an open popover, the focused hero search.

### Shadow Vocabulary
- **Card hover** (`box-shadow: 0 12px 32px rgb(38 20 26 / 0.08)` with border `#E3D5DA`): `.motion-card` on hover and focus-within.
- **Popover / dropdown** (`0 12px 32px rgba(38,20,26,.12)`): account menu, open selects.
- **Hero search** (`0 8px 24px rgba(38,20,26,.06)`, desktop only): the search bar.
- **Compact card** (`0 1px 4px rgba(0,0,0,.1), 0 1px 2px -1px rgba(0,0,0,.1)`): the `card` utility, used inside admin tables and panels.

### Named Rules
**The Flat-By-Default Rule.** Nothing is raised at rest. Shadow and lift are earned by hover, focus or an open state, never decoration.

## Shapes

Softly rounded, never pill-shaped except chips. Corner scale: buttons 10px (12px at large), icon tiles 10-12px, cards 14px mobile and 16px desktop, popovers 12px, the hero search 16px, chips fully round. Borders are 1px warm hairlines. The hero photo is clipped by a gradient mask that fades its left and bottom edges into the page rather than by a hard edge.

## Components

### Buttons
Shared `boo-button` (`projects/physioboo-ui/src/lib/button`). Setting `variant` opts into this system; without it the button keeps the legacy gradient look (`#E11D48` to `#06aed4`) that only the auth pages use. Do not use the legacy look on new screens.
- **Shape:** 10px radius (12px at `lg`); heights 40 (`sm`), 44 (`md`), 52 (`lg`); semibold 14-15px label, single line, 8px icon gap.
- **Primary:** Signal Rose fill, white text. Hover Deep Rose, pressed #9F1239.
- **Secondary:** white fill, warm gray border, Plum Ink text. **Outline:** white fill, rose border, Deep Rose text, Blush Tint on hover. **Soft:** Blush Tint fill, rose border. **Subtle / Ghost:** quiet neutral fills for low-emphasis actions. **Link:** Deep Rose underlined text.
- **States:** 150ms color transition; pressed scales to 0.98 on the public site; disabled is 50% opacity; loading shows a spinner, `cursor-wait`, and `aria-busy`.

### Chips
- **Style:** white fill, 1px warm border, fully round, 34px tall (38px on mobile), 14px text.
- **State:** hover turns the border Signal Rose and text Deep Rose; pressed scales to 0.98.

### Cards / Containers
- **Corner Style:** 14px mobile, 16px desktop.
- **Background:** white surface on the Blush Paper page; skeletons are #F4ECEF.
- **Border:** 1px `gray-200` (#EFE3E7), strengthened to #E3D5DA on hover.
- **Internal Padding:** 16px mobile, 20px desktop.
- **Behavior:** whole-card links lift 3px on hover (hover-capable devices only) and show a trailing chevron that nudges 3px right.

### Icon tiles
48px square (40px mobile), 12px radius, Blush Tint fill, Deep Rose icon at 22px. Used for specialties and feature cards.

### Inputs / Fields
- **Style:** white fill, 1px warm border, 16px radius for the hero search container; inner field is borderless 15-16px text with `gray-500` placeholder.
- **Focus:** the container border turns Signal Rose; every control also gets the global focus ring.
- **Selects:** native `<select>` with an app-drawn chevron; in Chromium 135+ the open list is styled (12px radius, Blush Tint on hover, checkmark on selected).
- **Error / Disabled:** `aria-invalid="true"` turns the border Alert Brick; disabled is 60% opacity on a tinted fill.

### Navigation
- **Style:** 15px medium links, 12px padding, 8px radius. Dark announcement strip above a white bar with a bottom hairline.
- **States:** color transition 150ms; collapses to a menu below `xl`; the account menu is a 200px popover (12px radius, popover shadow).

### Focus ring
One treatment everywhere: a 2px Signal Rose outline with 2px offset on `:focus-visible`. No browser-default blue.

### Motion
Short and functional (`styles.scss`, "Public-site motion system"): 150ms for color changes, 220ms for cards, 280ms for feedback, 400ms for scroll reveal, staggered 60ms. Reveal is progressive enhancement: with no JavaScript everything is visible. Easing is `cubic-bezier(0.22, 1, 0.36, 1)` for entrances and `cubic-bezier(0.4, 0, 0.2, 1)` for state changes. Under `prefers-reduced-motion` all transforms, reveals and fades are removed.

## Do's and Don'ts

### Do:
- **Do** use `.public-container` for every public section wrapper.
- **Do** build buttons with `boo-button` and a `variant`; use `physio-icon` for icons.
- **Do** use the remapped warm `gray` scale and Plum Ink (#26141A) for text.
- **Do** reserve Signal Rose (#E11D48) for the one primary action or state per area.
- **Do** keep surfaces flat with 1px #EFE3E7 borders; add lift and shadow only on hover or focus via `.motion-card` / `.motion-card-lift`.
- **Do** give every interactive control the global 2px rose focus ring and a 44px touch target.
- **Do** write copy that describes an appointment as a request the clinic confirms.
- **Do** honor `prefers-reduced-motion` for any new animation, using the shared motion tokens.

### Don't:
- **Don't** use the legacy gradient button (rose to cyan `#06aed4`) outside the auth pages.
- **Don't** introduce cool grays, blue-tinted neutrals or pure black text.
- **Don't** use Signal Rose for destructive states; use Alert Brick (#B42318).
- **Don't** use #A1A1AA for meaningful text: it is for table headers, disabled and decorative text, and is below AA contrast on white.
- **Don't** add shadows to resting cards, or nest cards inside cards.
- **Don't** hard-code `max-w-[1200px] mx-auto px-*` on public pages.
- **Don't** put Geist Mono in body copy or buttons.
- **Don't** invent testimonials, ratings, patient counts or accreditations.
