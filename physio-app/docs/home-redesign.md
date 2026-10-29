# Public Home Page — Redesign (trust path and physio character)

Scope of this pass: the two P1 issues from the 2026-10-29 critique of `src/app/pages/client/home/home.component.html`
(score 29/40, snapshot in `.impeccable/critique/`). P2 (rose overuse, accessibility) and P3 (copy) are deliberately
deferred; they are listed under "Deferred" so nothing is lost.

Context files: `PRODUCT.md` (users, request-not-booking principle), `DESIGN.md` (tokens, "The Calm Front Desk"),
`docs/public-layout-width.md` (`.public-container`), `docs/public-motion-redesign.md` (motion tokens),
`docs/home-configuration-redesign.md` (admin CMS that will own tenant content).

---

## 1. UX Audit

What works and must be preserved: task-first hero with one search; production-grade loading, error (with retry) and empty
states for every API-backed section; honest, request-framed copy; no invented testimonials or counts; tenant-name driven
eyebrow; `.public-container` width; DESIGN.md tokens.

## 2. Current Problems (this pass)

| # | Problem | Evidence |
|---|---|---|
| P1-a | The page asks for trust in a "request" at the doctor cards but explains the request 70 lines later, below the doctors. | `home.component.html` doctors at line 181, "How appointment requests work" at line 254. |
| P1-b | The one human offer (phone/email) is plain bold text, so a distressed mobile user must retype it. | CTA band, lines 570–579: `<b>{{ tenant.phone }}</b>`, no `tel:`/`mailto:`. |
| P1-c | Tenant phone and email are always `null`: the public site has no source for them. Fixing P1-b alone changes nothing visible. | `shared/data/client-site.ts` (`CLIENT_TENANT`), comment: "Home settings is staff-only". |
| P1-d | Nothing on the page says physiotherapy. A dental or GP portal would look identical after a name swap. | Critique specificity verdict. |
| P1-e | The hero photo is a generic stock hospital image, faded to 30% on mobile, so it adds noise and no identity. | Line 5: `bg-[url('/assets/images/background/hero-hospital.png')] opacity-30`. |
| P1-f | Every section reuses one header and one card-grid composition (specialties, doctors, clinics, articles). | Critique P1. |

## 3. Information Architecture

Before:
```
Hero (search + chips) → Specialties (tile grid) → Doctors → How requests work → Clinics → Why choose
→ Testimonials* → FAQ → Articles* → Final CTA        (* conditional)
```
After:
```
Hero (search + chips; tenant photo only when published)
Request strip (3 steps + reassurance + contact)        ← moved up, compact; replaces the old section
Specialties (directory panel)                           ← new composition
Doctors → Clinics → Why choose → Testimonials* → FAQ → Articles* → Final CTA (tappable contact)
```
The old "How appointment requests work" section is removed (not duplicated). Section ids `#specialties` is kept
because the footer and router fragment handling link to it.

## 4. User Journey

1. Lands on hero → sees what the site is for and the search (unchanged).
2. Reads the request strip directly below: find a doctor, send a request, get a call back; the appointment is confirmed
   only when the clinic calls. Trust is set before any doctor card appears.
3. Browses specialties in a compact directory, then doctors; every doctor card now sits after the explanation.
4. Wants to talk first: taps the phone number in the strip (or the CTA band) and dials in one tap, or opens an email.
5. If the tenant has published no contact details, the same slot offers "Send us a message" → `/contact`.

## 5. Layout

Desktop-first, `.public-container` (max 1760px, fluid gutter). No new width rules.

- **Hero**: one column, `max-w-[760px]`. When the tenant publishes a photo, lg+ becomes two columns
  `minmax(0,1fr) / minmax(0,0.8fr)`, gap 64px, photo on the right at `aspect-[4/3]`; it is hidden below `lg`.
- **Request strip**: full-width band, `bg-surface`, `border-y border-gray-200`, padding `py-6 lg:py-8`.
  lg: `grid-cols-[1fr_1fr_1fr_auto]` (3 steps + contact block). Below lg: steps stack, contact block last.
- **Specialties panel**: one `bg-surface border border-gray-200 rounded-2xl` panel; rows divided by hairlines,
  `lg:grid-cols-4` / `sm:grid-cols-2` / `grid-cols-1`; rows are 56px tall.
- All other sections unchanged.

## 6. Wireframes

Desktop (≥1024px)
```
┌ header ────────────────────────────────────────────────────────────────────────┐
│ ┌ hero ─────────────────────────────────────────────────────────────────────┐ │
│ │ PHYSIOBOO                                   ·  ╭──╮                       │ │
│ │ Find the right doctor and            (tenant photo column only if set)    │ │
│ │ request an appointment               slot    ╭╯ ╱   ╰╮  (or tenant photo) │ │
│ │ intro text…                                  │╱ ·     │                   │ │
│ │ [🔍 Doctor, specialty…        ][Search]      ╰────────╯                   │ │
│ │ Popular: [chip][chip][chip][chip]                                         │ │
│ └───────────────────────────────────────────────────────────────────────────┘ │
│ ┌ request strip ───────────────────────────────────────────────────────────┐  │
│ │ ①Find a doctor   ②Send a request   ③Get a call back   Prefer to talk?   │  │
│ │  search/browse    on the profile    confirmed only     ☎ +00 000 000     │  │
│ └───────────────────────────────────────────────────────────────────────────┘ │
│ Browse by specialty                                      All doctors →         │
│ ┌ panel ────────────────────────────────────────────────────────────────────┐ │
│ │ ▢ Orthopaedics  ›  │ ▢ Neurology  ›  │ ▢ Cardiology  ›  │ ▢ Paediatrics ›│ │
│ │ ──────────────────────────────────────────────────────────────────────────│ │
│ │ ▢ …             ›  │ …                                                    │ │
│ └───────────────────────────────────────────────────────────────────────────┘ │
│ Doctors in our network … (unchanged)                                           │
```
Mobile (<640px)
```
┌ header ─────────────┐
│ PHYSIOBOO            │
│ H1 (34/40)           │
│ intro                │
│ [🔍 search field   ] │
│ [      Search      ] │
│ ☎ Call the clinic    │  ← only when tenant.phone exists; 44px, below Search
│ chips (scroll)       │
├──────────────────────┤
│ ① Find a doctor      │
│ ② Send a request     │  request strip, stacked, one line each
│ ③ Get a call back    │
│ Prefer to talk? ☎ …  │
├──────────────────────┤
│ Browse by specialty  │
│ ┌──────────────────┐ │
│ │ ▢ Orthopaedics › │ │  single column, 6 rows, hairline dividers
│ │ ▢ Neurology      › │ │
│ └──────────────────┘ │
```

## 7. Component Hierarchy

```
HomeComponent (existing; orchestration, API sections, search)
├── HomeHeroMediaComponent            NEW, presentational: tenant photo, rendered only when published
├── HomeRequestStripComponent         NEW, presentational: steps + contact
│   └── HomeContactLinksComponent?    not created; contact is a small private template inside the strip
├── (specialties panel)               stays inside HomeComponent (API-backed section, shares its state)
├── DoctorCard / ClinicCard / ArticleCard / boo-button / boo-inline-error / boo-empty-state   (reused)
```
Rules: no new abstraction beyond the two presentational components; both are standalone with `@Input()` only and no
service calls, so the page keeps one place that talks to the API. `HomeRequestStripComponent` inputs: `steps`,
`phone`, `email`. `HomeHeroMediaComponent` inputs: `image` (`{url, alt, focalX, focalY} | null`).

## 8. UI Specification (tokens from DESIGN.md)

**Hero (search-first)**
- No decorative visual by default. The hero is one column, `max-w-[760px]`, so the H1, search and chips get the space.
- When a tenant publishes a hero photo, a second column appears (lg+ only): `<img>` `object-cover`, `rounded-2xl`, 1px
  `border-gray-200`, `object-position` from the focal point, explicit `width`/`height`, `fetchpriority="high"`, `alt` from
  the tenant (empty `alt=""` when none is given). If the photo fails to load it hides itself.
- The old `hero-hospital.png` background and its mask are removed from the template.
- A first attempt drew a goniometer (a protractor-like range-of-motion scale) as the default. Reviewed in the browser it
  read as a school protractor: too large, too heavy, not clearly physiotherapy. It was removed.

**Request strip**
- Container: `bg-surface border-y border-gray-200`.
- Step: 32px circle, `bg-gray-100 text-gray-900`, Geist 600 14px numeral (not mono, not rose); title Geist 600 15px
  `text-gray-900`; one-line description 14px `text-gray-700` (existing `HOME_STEPS` copy, trimmed in the template to
  the title plus description; no new copy invented).
- Reassurance line (below the steps on one row at lg, full width on mobile): "Your appointment is confirmed only when
  the clinic calls you." This is existing copy from step 3, not a new claim.
- Contact block: label "Prefer to talk?" (14px `text-gray-700`); phone link
  `<a href="tel:+…">` 44px min height, 16px 600, `text-gray-900`, underline offset 2, icon `phone` 18px; email link
  below it the same way. Hidden fields stay hidden (never placeholder text). If both are `null`:
  `<a routerLink="/contact">Send us a message</a>`.

**Specialties panel**
- Panel: `bg-surface border border-gray-200 rounded-2xl overflow-hidden`.
- Row: `<a>` 56px high, padding `px-4 lg:px-5`, 32px Blush Tint icon tile (`rounded-[10px]`, icon 18px,
  `text-primaryDeep`), name 15px 600, trailing `chevron-right` 16px `text-gray-400` (decorative), hairline divider
  `border-gray-200`. Hover: `bg-gray-50`; focus: global rose focus ring, inset (`outline-offset: -2px`) so it is not clipped.
- Lists carry `role="list"` (Safari/VoiceOver drops list semantics when `list-style: none`).

**Final CTA band (contact only)**
- Phone and email become links with the same treatment as the strip; heading and button unchanged in this pass.

## 9. Interaction Design

- Tap/click phone → `tel:`; email → `mailto:`. No JS. Phone value is normalised for the `href` (digits and a leading
  `+`), the visible text keeps the tenant's formatting.
- Specialty rows reuse the existing `motion-chip` colour transition; no lift (they sit inside a panel, not cards).
- Search, chips, FAQ, retry behavior unchanged.

## 10. Responsive Behavior

| Width | Hero | Request strip | Specialties |
|---|---|---|---|
| ≥1280 | 1 column (2 with a tenant photo) | 3 steps + contact in one row | 4 columns |
| 1024–1279 | 1 column (2 with a tenant photo) | 3 steps in a row, contact beside them | 4 columns |
| 640–1023 | 1 column, no photo | steps stacked in a 3-column grid, contact below | 2 columns |
| <640 | 1 column, no media; phone button under Search when available | steps stacked, one line each | 1 column, first 6 rows |

Touch targets: all new interactive elements ≥44px. No horizontal scroll introduced.

## 11. Accessibility

- Chevrons: `aria-hidden="true"`.
- Tenant image: meaningful `alt` supplied by the tenant, else `alt=""`.
- Request strip is an `<ol role="list">`; numerals are `aria-hidden` (the list provides numbering). Heading: the strip
  has a visually hidden `<h2>` ("How an appointment request works") to keep heading order H1 → H2.
- Contact links: descriptive text ("Call +00 000 000"), not just a number glyph; `tel:`/`mailto:` open the native app.
- Contrast: all new text uses `text-gray-900` / `text-gray-700` on white (AA). The rose pivot dot is decorative.
- Focus order follows reading order; the strip links are reachable by keyboard; inset focus ring in the specialty panel.

## 12. Page States

| Block | Loading | Success | Empty | Error | Disabled |
|---|---|---|---|---|---|
| Hero photo | column absent | tenant photo | column absent | photo hides itself | n/a |
| Request strip | static, no data | static + contact links | contact = "Send us a message" | n/a | n/a |
| Specialties panel | 6–8 skeleton rows `aria-busy` | rows | section hidden (existing rule) | `boo-inline-error` + retry (existing) | n/a |
| Contact links | n/a | phone / email links | link to `/contact` | falls back to static `CLIENT_TENANT` | n/a |

## 13. Edge Cases

- Tenant name very long: eyebrow already `min-w-0`; add `truncate` plus `title` on the eyebrow so it cannot wrap the H1.
- Only one of phone/email present: show only that one; no dangling "or".
- Phone with extension or spaces: `tel:` href keeps digits and `+` only; extension is shown in the text, not dialed.
- Tenant image wrong aspect ratio or low resolution: `object-cover` plus focal point; a `max` display size of 720px
  wide avoids upscaling; on image error the photo hides.
- 1–3 specialties: panel still renders; with 1 row it collapses to a single-row panel (no empty cells); with an odd count the
  last row spans the grid.
- Dark mode: tokens only.
- RTL/long translations: rows use `min-w-0` and `break-words`.

## 14. Performance

- No new dependencies. No decorative asset ships. The removed hero PNG is a saved request; if no other page
  references `assets/images/background/hero-hospital.png`, it can be deleted from the repo (check before deleting).
- Tenant hero image, when present: one request, `fetchpriority="high"`, explicit dimensions (no layout shift), WebP/AVIF
  served by the API; below-the-fold sections keep `appReveal`.
- Site profile is fetched once in the browser (like the other sections) and cached; server render shows the static defaults.
- `trackBy` is added to the new `*ngFor` loops.

## 15. Scalability

- The strip and hero take their content by `@Input`, so a future per-tenant "home blocks" CMS (banners, features,
  testimonials already exist in the admin home-configuration redesign) can drive them without template changes.
- The specialty panel scales to any count with `HOME_SPECIALTY_COUNT` (currently 8) and the existing hide-on-empty rule.
- One site-profile endpoint feeds header, footer, contact page and this page, removing the per-page hard-coded `null`s.

## 16. Enterprise Recommendations

- Treat tenant contact details and hero media as managed content in `/admin` (General Settings tab of Home
  configuration), published through one cached public endpoint.
- Do not ship placeholder phone numbers or stock imagery as tenant defaults.
- Add a visual-regression capture of the home page (light, dark, 375/768/1280) before and after, since this is the
  first screen of every tenant site.
- Track a single event for contact taps (`tel:` / `mailto:`) once analytics exists, to measure whether the trust path helps.

---

## 17. Proposed API contract (proposal only; backend not implemented)

### GET /api/public/site-profile
- **Purpose:** the public, tenant-scoped profile used by the header, footer, contact page and home page. Replaces the
  hard-coded `CLIENT_TENANT` (phone, email, hours, hero media).
- **HTTP method / URL:** `GET /api/public/site-profile`
- **Auth:** none (public). Tenant resolved by host/subdomain like the other public endpoints.
- **Request:** no body. Optional header `If-None-Match`.
- **Response 200:**
```json
{
  "success": true,
  "data": {
    "name": "string",
    "tagline": "string | null",
    "phone": "string | null",
    "email": "string | null",
    "address": "string | null",
    "mapUrl": "string | null",
    "hoursShort": "string | null",
    "hours": [{ "days": "string", "time": "string" }],
    "showEmergency": false,
    "hero": {
      "imageUrl": "string | null",
      "alt": "string | null",
      "width": 1440,
      "height": 1080,
      "focalX": 0.5,
      "focalY": 0.4
    }
  }
}
```
- **Errors:** `404` unknown tenant; `5xx` generic. The frontend treats any failure as "use static defaults".
- **Caching:** `Cache-Control: public, max-age=300`, `ETag`.
- **Frontend usage:** `PublicSiteService.getProfile()` feeds `HomeRequestStripComponent` (phone, email),
  `HomeHeroMediaComponent` (hero) and the CTA band. Until the endpoint exists the service returns `CLIENT_TENANT` with
  `hero: null` (placeholder method, per project rules), so the hero shows no visual and the page shows the "Send us a message" link.

### Admin dependency (separate work)
- `PUT /api/home-settings` (existing, staff-only) needs `hero.imageUrl/alt/focal` and confirmed phone/email fields in its
  General Settings tab. Out of scope for this pass; tracked in `docs/home-configuration-redesign.md`.

---

## 18. Deferred (not in this pass)

| Item | Severity | Command |
|---|---|---|
| Rose spent on "All →" links, FAQ icons, hover states | P2 | quieter |
| `role="list"` on remaining `list-none` lists, permanently mounted status region, scroll cue on mobile doctor row, 44px chips and "All" links, darker placeholder | P2 | adapt, harden |
| "Popular:" label, "Ready to see a doctor?" heading, "Why choose X" claims, `tenant.name` fallback | P3 | clarify |
| Off-ramp font sizes (`34/15/17px`), dead `.ph-stripes` style, `trackBy` on old loops | P3 | polish |

## 19. Open decisions

1. **Hero visual.** Decided after browser review: no default visual. Revisit only with real tenant photography.
2. **"Why choose {{tenant.name}}"** makes unverifiable claims; recommended to move to tenant-supplied content in a later pass.
3. **Hero hide on mobile.** Decided: no media on mobile to protect first-viewport density; revisit with analytics.

## 20. Implementation notes (kept in sync with the code)

Built 2026-10-29. Not built or tested by the assistant (project rule); verify in the running dev server.

### Where things live
| Piece | File |
|---|---|
| Hero photo (only when the tenant publishes one) | `src/app/pages/client/home/home-hero-media.component.ts` |
| Request strip and contact block | `src/app/pages/client/home/home-request-strip.component.ts` |
| Page wiring, specialties panel, CTA links | `home.component.html`, `home.component.ts` |
| Placeholder profile service | `src/app/services/public/public-site.service.ts` |
| Profile types | `src/app/shared/types/public-site.types.ts` |
| `tel:` link helper | `src/app/shared/utils/contact.utils.ts` (`telHref`) |
| Spec | `home.component.spec.ts` (provider added, two tests for profile and phone link) |

### Differences from the design above
- The reassurance line under the steps was not added: step 3 already says the appointment is confirmed only when the clinic calls.
- Specialties panel uses 1 / 2 / 4 columns (not 3 between 1024 and 1279px), so rows divide cleanly at every width.
- No separate contact-links component: the contact block is a small template inside the strip.
- Step numerals are plain Geist in a neutral circle (not mono, not rose).
- The mobile "Call the clinic" button sits under the hero search and appears only when `profile.phone` is set.
- The hero eyebrow (mono tenant name above the H1) was left as it was.

### Behavior to know
- `PublicSiteService.getProfile()` is a placeholder returning `CLIENT_TENANT` with `hero: null`. Until the endpoint exists:
  the hero is a single search-first column, the strip and CTA show "Send us a message", and the mobile call button is hidden.
  Setting a phone in `CLIENT_TENANT` makes every `tel:` link appear, which is the quickest way to preview them.
- `assets/images/background/hero-hospital.png` is no longer referenced anywhere. It was left in the repo; delete it if you agree.

### Open follow-up
- The hero eyebrow conflicts with the Impeccable craft floor (no kicker above a heading). DESIGN.md documents the mono
  eyebrow as part of the system, so removing it is a system decision, not a page fix. Decide before the next pass.
