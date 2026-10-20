# Public Website — Motion & Animation Polish

Status: **Approved and implemented.** See section 7 for what was built and how it differs from the first draft.
Scope: existing public (`/`, client layout) routes and the shared components they use. No new pages, features, layout, content, API or validation changes.
API contract: **not applicable** (motion is presentation-only; no endpoints are proposed or changed).

---

## 1. Audit (what the code does today)

Findings come from reading the client layout, header/footer, the four card components, `boo-button`, `global-dialog`, `toast`, and the Home, Doctor, Doctor Detail, Contact, Clinic/Service/Blog templates.

### What exists
- Tailwind `transition-shadow` on card hover, `transition-colors` on header links and buttons (150 ms), `animate-pulse motion-reduce:animate-none` on skeletons, `animate-spin` on loaders.
- `global-dialog` (200/150 ms backdrop + scale/translate modal) and `toast` (300 ms slide) use `@angular/animations`.
- `provideAnimationsAsync()` is already registered. `aos`, `gsap`, `lottie-web` and `@formkit/auto-animate` are installed; **none is used on the public pages**. The motion system below does not need them.
- Global `:focus-visible` rose outline already exists (`styles.scss`) and is good.

### Most rigid interactions (priority order)

| # | Problem | Where |
|---|---|---|
| 1 | **Every page appears at once.** No entrance, no section reveal, no route-change transition. | all public pages |
| 2 | **Mobile menu, mobile filter drawer, language menu pop in/out instantly** (`*ngIf` only). The filter drawer is a bottom sheet with no slide. | `header.component.html`, `doctor.component.html` (and Clinic/Service/Blog equivalents) |
| 3 | **Cards only change shadow.** No lift, no image response, no keyboard-focus equivalent of hover. Article card is a whole-card link with no focus-within treatment. | doctor/clinic/service/article cards, Home specialty tiles |
| 4 | **Filter chips and results swap abruptly.** Chips appear/disappear with no transition; result list jumps from skeleton to cards; skeleton → results has no fade. | listing pages, search |
| 5 | **FAQ accordion snaps** open/closed; plus/minus icon swaps rather than rotates. | Home |
| 6 | **Form feedback is instant and unstructured.** Field errors, summary banner, submit error and success panel appear/disappear with no transition; borders switch with no easing. | Contact, Doctor Detail request form |
| 7 | **Buttons have colour fade only**; no pressed feedback. `transition-colors` leaves `border` + `box-shadow` unanimated. Legacy (auth) buttons use `transition-all duration-500`, which is too slow. | `boo-button` |
| 8 | **Images pop in** when decoded. | cards, detail heroes, About |
| 9 | **Toast shakes the whole card** (±10 px, 400 ms) and hover-scales to 1.02. `backdrop-blur-sm` on dialog backdrop is a GPU-expensive blur. | `toast`, `global-dialog` (shared with admin) |
| 10 | **No `prefers-reduced-motion` handling** beyond skeleton pulse. The `@angular/animations` triggers ignore it. | global |

### Things that do **not** exist (so are not in scope)
- There is **no multi-step appointment wizard**. The "appointment flow" is a single request form on Doctor Detail (and the Contact form). "Step transitions" therefore become: field-level validation, conditional field reveal (clinic / service selects), submit → success/error. Step order, validation, API and submission logic stay untouched.
- Header does not change on scroll (it is `sticky` and static), so there is no scroll-state header animation to polish.

### Risks to respect
- **SSR + prerender is enabled.** Content must be visible in the server HTML. Reveal animations must be progressive enhancement: hidden state is applied by JS only after hydration, only to elements still below the fold.
- **Shared components** `global-dialog` and `toast` are also used by admin. Changes there reach admin pages (see Decision D1).
- Cards using `aspect-[…]` containers already reserve space, so image fade-in will not shift layout.

---

## 2. Motion system

### Tokens (single source: `:root` in `styles.scss`, mirrored in Tailwind `transitionDuration` / `transitionTimingFunction` where used)

| Token | Value | Use |
|---|---|---|
| `--motion-fast` | 150 ms | hover/press/focus colour, icon rotate, chip |
| `--motion-base` | 220 ms | menus, dropdowns, card lift, validation, accordion |
| `--motion-slow` | 280 ms | drawer, modal, success/error swap |
| `--motion-reveal` | 400 ms | section/heading entrance |
| `--motion-stagger` | 60 ms (cap 6 items → max 360 ms) | card grids |
| `--ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` | entrances |
| `--ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | state changes (already the `material` easing) |
| `--ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | exits (always shorter than the entrance) |

Rules: animate only `opacity` and `transform` (plus `color`/`background-color`/`border-color`/`box-shadow` on small elements). Distances: reveal 12 px, card lift 3 px, menu offset 6 px. Image scale 1.03. Exits ≈ 60–70 % of the entrance duration.

### Reduced motion (global rule)
```
@media (prefers-reduced-motion: reduce)
```
- Reveal, stagger, card lift, image scale, drawer slide, toast slide, accordion height: **disabled**; state changes become instant or a ≤100 ms opacity-only fade.
- Colour/border/shadow changes and focus rings remain (they are not movement).
- Skeleton shimmer becomes a static tint (no pulse).
- `@angular/animations` triggers read the same preference (one small helper returns a zero-duration variant).

### No-JS / failure safety
Hidden-initial states are only applied by the reveal directive after it has verified `IntersectionObserver` support and that the element is below the fold. If the directive never runs, the element is simply visible. The directive removes the hidden state as soon as the block intersects the viewport; it never hides anything that is already on screen, and it does nothing under reduced motion, in print, or without `IntersectionObserver`.

---

## 3. Refined behaviour, per component

Format: **Trigger → Visual → Duration / easing → Reduced motion.**

### 3.1 Page and section entrance
| Item | Spec |
|---|---|
| Hero headline, intro text (Home, listing intros, About, Contact, legal) | In view (first paint of above-the-fold content is **not** hidden — it renders immediately, only a 6 px/200 ms fade-rise on route activation for the intro block). Fade + rise 12 px. 400 ms ease-out. Reduced: none. |
| Content sections below fold (Home sections, About sections, detail-page sections) | Enter viewport (10 % visible) → fade + rise 12 px, once. 400 ms ease-out. Animate the section container, not each paragraph. Reduced: none. |
| Card grids | Same trigger on the grid; children stagger 60 ms, max 6 children then the rest appear together. 400 ms ease-out. Reduced: none. |
| Never animated | Forms, CTAs, primary buttons, breadcrumbs, legal body text, error/empty states. |
| Route change | Page content fades in 180 ms ease-out on `NavigationEnd` (no exit animation — never delays navigation). Scroll position handling unchanged. Reduced: none. |

### 3.2 Cards (doctor, clinic, service, article, search result, Home tiles)
| Trigger | Visual | Timing | Reduced |
|---|---|---|---|
| Hover **or** `:focus-within` (card with links/buttons) | Lift 3 px, shadow `0 12px 32px rgba(38,20,26,.08)`, border → `gray-300` | 220 ms ease-in-out | shadow/border only, no lift |
| Hover/focus on cards with an image | Image scale 1.03 inside `overflow-hidden` container | 300 ms ease-out | none |
| Press (`:active`) on whole-card links (article, Home tile) | Lift cancels (translate 0) | 100 ms | none |
| Article card title | Colour → `primaryDeep` on hover/focus-visible | 150 ms | same |
| "Read article →" arrow | Nudge 3 px right on hover/focus | 150 ms ease-out | none |

Whole-card links (article card, Home specialty tiles) get the full treatment above. Doctor, Clinic and Service cards are not whole-card links (they hold their own buttons), so by default (D3) they get shadow + border on hover/`:focus-within` only: no lift, no pointer cursor, and no image scale unless the image itself sits inside a link (confirmed per template at implementation).

### 3.3 Buttons (`boo-button` design-system variants only)
| Trigger | Visual | Timing | Reduced |
|---|---|---|---|
| Hover | colour / border / background fade (extend `transition-colors` → `color, background-color, border-color, box-shadow`) | 150 ms ease-in-out | same |
| Press | `scale(0.98)` | 100 ms | none |
| Focus-visible | existing outline (unchanged) | instant | same |
| Loading | spinner already present; button fades to 0.8 opacity, keeps size; no layout shift | 150 ms | spinner stays (functional) |
| Disabled | opacity 0.5 fade, no hover/press | 150 ms | same |

Legacy gradient (no `variant`) buttons: `transition-smooth` (500 ms, `transition-all`) → 200 ms, colour only. Used by auth pages; low risk.

### 3.4 Header and navigation
| Item | Visual | Timing | Reduced |
|---|---|---|---|
| Desktop nav link | Colour/background fade; active pill background cross-fades when the route changes | 150 ms | same |
| Language menu | Opens with opacity 0→1 + translateY(-6px→0) + scale .98→1, origin top-right; closes 120 ms fade | 180 ms ease-out | opacity only, 100 ms |
| Mobile menu | Panel fades in with 12 px rise; nav items do **not** stagger (menu must be usable instantly); closes 150 ms | 220 ms ease-out | opacity only |
| Menu icon ↔ close | Cross-fade/rotate 90° | 150 ms | cross-fade only |
| Focus management, Escape, `aria-expanded` | Unchanged | — | — |

Implementation note: the `*ngIf` panels need a mounted-while-exiting state (CSS class toggle with `:enter`/`:leave` via the existing `provideAnimationsAsync`).

### 3.5 Links
- Text links: colour 150 ms. Underline links: `text-decoration-color` transitions 150 ms (`underline-offset` stays fixed).
- Icon-with-arrow links ("View all →"): arrow nudges 3 px on hover/focus-visible, 150 ms ease-out. Reduced: no nudge.
- Footer links: colour 150 ms.

### 3.6 Listing pages and search (Doctor, Clinic, Service, Blog, Search)
| Item | Visual | Timing | Reduced |
|---|---|---|---|
| Filter chip add | fade + scale .96→1 | 180 ms ease-out | opacity only |
| Filter chip remove | fade out in place (exit), then removed | 120 ms ease-in | instant |
| Chip hover/press | background/border fade; press scale .98 | 150 / 100 ms | colour only |
| Toggle buttons (Online / Home visit) selected state | background/border cross-fade (via 3.3) | 150 ms | same |
| Select / input focus | border-colour + ring fade | 150 ms | same |
| Mobile filter drawer | backdrop fade 0→1; sheet slides up (`translateY(100%)→0`); close reverses at 70 % duration | 280 ms ease-out / 200 ms ease-in | opacity fade only |
| Result update (page change, filter change) | Cards container cross-fades 0.5→1 opacity; **no** stagger and no rise after the first reveal | 180 ms | none |
| Skeleton | Restrained pulse: opacity 1→.6 over 1.6 s. Replace nothing structurally. | 1.6 s ease-in-out | static (no pulse) — already true |
| Skeleton → results | Results fade in 180 ms, skeleton removed at once | 180 ms | instant |
| Empty / error | **Shown immediately**, no entrance animation | 0 ms | same |
| Pagination | Buttons use 3.3; scroll-to-results behaviour unchanged | — | — |

Search/filter logic, debounce and URL sync are untouched.

### 3.7 Home FAQ accordion
Trigger: click → answer height/opacity transition using the CSS grid `grid-template-rows: 0fr→1fr` technique (no JS height measuring, no layout-property animation in the animation timeline of the page, only the small row), icon rotates 90° plus/minus cross-fade. 220 ms ease-in-out. Reduced: instant. `aria-expanded` / `aria-controls` unchanged; answer stays in DOM (currently `*ngIf`, which would change to always-rendered + `hidden`/`inert` when closed).

### 3.8 Forms (Contact, Doctor Detail request form)
| Item | Visual | Timing | Reduced |
|---|---|---|---|
| Field focus | border + ring fade | 150 ms | same |
| Field error appears | message fades in with 4 px rise; border → danger via transition. **No shake.** Message is in DOM and announced immediately (opacity only, never `display` delay). | 180 ms | opacity only |
| Error summary banner (Contact) | fade in 180 ms; focus moves to it synchronously, as today | 180 ms | instant |
| Conditional field reveal (facility / service selects, notice banners) | height/opacity via grid-rows technique | 220 ms ease-in-out | instant |
| Submit button | loading state per 3.3; label/icon swap cross-fades | 150 ms | same |
| Submit error banner | fade + 6 px rise | 180 ms | opacity only |
| Success panel | form fades out 120 ms → success panel fades in with 8 px rise; `role=status` text is present from the first frame. Never delayed beyond the 120 ms exit, and validation/error output is never delayed. | 120 + 280 ms | instant swap |

Validation rules, submit logic, API calls, field order: unchanged.

### 3.9 Modals, drawers, toasts
| Item | Change | Reduced |
|---|---|---|
| `global-dialog` | Keep structure and 200/150 ms. Backdrop: remove `backdrop-blur-sm` (expensive) → solid `bg-black/40` fade. Modal: scale .96→1 + 8 px rise, 200 ms ease-out; exit 150 ms ease-in. | opacity only |
| `toast` | Enter: slide 16 px (not 100 %) + fade, 240 ms ease-out. Exit: fade + 8 px, 160 ms. **Remove the shake** (type-change feedback becomes a one-time 150 ms opacity pulse of the left accent). Remove hover `scale-1.02`. | fade only |
| Inline success/error (forms) | per 3.8 | — |

Focus trapping, Escape, backdrop click: unchanged.

### 3.10 Images
- Cards and detail heroes: `opacity 0→1` on `load`, 200 ms ease-out, container keeps its existing aspect-ratio; the placeholder (stripes / initials / icon) remains visible beneath until load, and the error fallback path is unchanged.
- Cached/instantly complete images (`img.complete`) skip the fade.
- Reduced: no fade (instant).
- No Ken-Burns, parallax or continuous image motion.

### 3.11 Page-specific notes
- **Home:** hero block uses 3.1 intro; specialty tiles, doctor, clinic and article grids use stagger; FAQ 3.7; testimonials section reveals as a block.
- **Doctor / Clinic / Service Detail:** hero fades in; each `border-t` section reveals as a block; related cards stagger.
- **Blog / Article Detail:** listing per 3.6; article body is **not** animated (reading content); related cards stagger.
- **About:** section reveals; value/explore cards stagger.
- **Contact:** info cards stagger; form per 3.8; clinic cards at the bottom per 3.2.
- **Privacy / Terms:** intro only; table of contents active-section highlight cross-fades 150 ms; body text static.

---

## 4. Component hierarchy for implementation (CSS-first, no new dependency)

1. **`styles.scss`** — motion tokens (`:root`), `.motion-reveal` / `.motion-reveal.is-visible`, `.motion-stagger > *` delay via `--i`, `.motion-lift` (card hover/focus-within), `.motion-img` (scale), `.motion-press`, and one `@media (prefers-reduced-motion: reduce)` block that neutralises them.
2. **`shared/directives/reveal.directive.ts`** — `[appReveal]` (and `[appRevealStagger]`): `IntersectionObserver`, runs outside Angular zone, `isPlatformBrowser` guard (SSR renders visible), one-shot unobserve, safety timeout, respects `matchMedia('(prefers-reduced-motion)')`. Registered in `SharedModule`.
3. **`@physioboo/ui`** — menu, sheet and chip triggers plus the reduced-motion check live in `projects/physioboo-ui/src/lib/motion/motion.ts`, so the library's filter chips and bottom sheet animate themselves.
4. **`img` fade** — small `[appImgFade]` directive (adds `is-loaded` on `load`; skips if `complete`).
5. Edit existing: `boo-button` (class strings), four cards, `header`, `footer` links, listing templates (chips, drawer, results wrapper), Home FAQ, Contact/Doctor Detail forms, `toast`, `global-dialog`.

`aos`, `gsap`, `lottie-web` are **not** used. (They remain installed for other features; removing them is out of scope.)

---

## 5. Accessibility, performance, edge cases

- **Reduced motion:** global media query + animation helper; verified per item above.
- **Keyboard:** every hover effect has a `:focus-visible` / `:focus-within` twin; menus keep focus order and Escape; no animation blocks input (`pointer-events` never disabled during transitions except on a leaving toast).
- **Contrast:** no colour changes; transitions never pass through low-contrast intermediate text states longer than 150 ms.
- **Screen readers:** error/success text is in the DOM from the first frame (`role=alert`/`status` preserved); accordion uses `inert`/`hidden` when closed.
- **Performance:** transform/opacity only; `will-change` only on the active card and open menu during the transition, removed after; one shared `IntersectionObserver` per page; reveal is one-shot; stagger capped at 6 items; no blur/filter animation; no continuous animation except the skeleton pulse (small, reduced-motion aware).
- **Layout shift:** no animation changes box size outside the accordion/conditional-field grid-rows reveal, which is user-initiated; scroll position is untouched on route change and filter change.
- **Edge cases:** SSR/prerender (visible by default); back/forward navigation (revealed immediately if already scrolled past); anchor links (`#request`, `#specialties`) reveal their target at once so the jump never lands on an empty area; slow devices (short durations; no JS-driven frame loops); print (`@media print` disables motion and forces visibility).
- **Not animated:** error and empty states, validation text, legal body text, primary CTAs, form controls entrance.

---

## 6. Decisions (resolved)

- **D1 — Shared toast/dialog:** scoped to the public site. Admin, superadmin, patient, auth and dev routes keep the original animations, shake and backdrop blur (resolved by route in `isPublicUrl`).
- **D2 — Route fade:** yes. 180 ms opacity-only fade of the routed content, started after the router has already swapped the page; skipped for the first page of a visit.
- **D3 — Cards:** Doctor, Clinic, Service, Search result and Explore cards: shadow + border on hover and `:focus-within`, no lift. Article cards and Home specialty tiles: restrained 3 px lift (hover-capable devices only).



---

## 7. Implementation notes (kept in sync with the code)

### Where things live
| Piece | File |
|---|---|
| Tokens, `.motion-*` classes, reduced-motion and print rules | `src/styles.scss` (bottom section) |
| Scroll reveal (`appReveal`, `appRevealStagger`) | `src/app/shared/directives/reveal.directive.ts` |
| Image fade (`img[appImgFade]`) | `src/app/shared/directives/img-fade.directive.ts` |
| Menu, chip and drawer triggers (`booMenuPop`, `booMenuPanel`, `booChipPop`, `booDrawerSheet`) | `@physioboo/ui`: `projects/physioboo-ui/src/lib/motion/motion.ts` |
| `booMotionState()`, `booPrefersReducedMotion()` | `@physioboo/ui`: `projects/physioboo-ui/src/lib/motion/motion.ts` |
| `isPublicUrl()` | `src/app/shared/utils/motion.utils.ts` |
| Public scope (`.public-motion`) and route fade | `src/app/pages/client/client.component.ts` |

### Scoping
The client layout host carries `.public-motion`. Link/input transitions and the button press feedback are written against it (with `:where()` so utility classes still win), so nothing leaks to admin, patient or auth pages. `boo-button` variants are not used outside the public site; the legacy gradient button is unchanged. `toast` and `global-dialog` pick `admin` / `full` / `reduced` from the current URL.

### Differences from the first draft
- **Reveal safety timeout:** dropped. The hidden state is only applied by JavaScript after hydration and removed on intersection; there is no state to time out.
- **Stagger:** used for static grids (About values/explore cards, Contact info cards). Async lists (doctor/clinic/article grids, search results) reveal as a block when their section enters, and results updates use the 180 ms opacity cross-fade (`motion-fade`) without rise or stagger.
- **FAQ:** answer is always rendered and collapses with the grid-rows technique; collapsed content is `visibility:hidden`. The plus/minus icon still swaps (no rotation).
- **Conditional form fields / banners:** fade-and-rise in (`motion-feedback`, 180 ms; success panel 280 ms) instead of height animation. The form is removed immediately on success, so confirmation is never delayed.
- **Skeletons:** existing `animate-pulse` + `motion-reduce:animate-none` kept as is.
- **Legacy gradient buttons / Home hero / CTAs / legal pages:** intentionally not animated.
- **Fill mode:** all keyframe animations use `backwards` fill so no animated stacking context is left behind (fixed drawers keep their z-order above the sticky header).
- **Language menu, mobile menu, filter drawer, filter chips:** Angular animation triggers with `full` / `reduced` states (reduced = 80–100 ms opacity).

### Component coverage
Home (section reveals, tiles lift, FAQ, chips, view-all arrows); Doctor, Clinic, Service listings (chips, drawer, result cross-fade); Blog listing (result cross-fade); Search (chips, results, row cards); Doctor, Clinic, Service, Article detail (section reveals, image fade, related cards); Contact and Doctor request form (feedback motion, info cards stagger); About (section reveals, stagger); header (language menu, mobile menu); cards (doctor, clinic, service, article, explore, search row); `boo-button` (transition list + press); toast and dialog (public variant).
