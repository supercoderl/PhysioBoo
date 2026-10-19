# About Us Redesign (`/about-us`)

Source design: Claude Design project, `About Us Page.dc.html` (frame 11a: desktop 1440, tablet 834, mobile 390), which imports `About Us.dc.html`, `ValueCard.dc.html` and `ExploreCard.dc.html`.
Code: `src/app/pages/client/about-us` (`about-us.component.ts/.html`, `about-content.ts`, `value-card.component.ts`, `explore-card.component.ts`).

## 1. What changed

The previous page was the purchased template: hotlinked stock images, lorem ipsum, invented claims ("25+ years"), an emergency number, testimonials, an FAQ and a doctor carousel. Those six section components (`about`, `why-choose`, `way`, `doctor`, `testimonial`, `faq`) are removed.

## 2. Structure

```
/about-us
├── Draft notice (until mission, vision and values are approved)
├── Hero: breadcrumb, H1, lead, Find a doctor / Explore our services, photo
├── Who we are: two paragraphs + four capabilities
├── Our mission and vision (PROPOSED COPY tags while draft)
├── Our core values: 4 × ValueCard
├── How PhysioBoo helps: 3 numbered steps + "a request is not a confirmed booking"
├── Explore PhysioBoo: 3 × ExploreCard → /doctor, /services, /hospitals
├── Trust and transparency
└── We're here to help → /contact, /doctor
```

Header and footer are the shared client layout.

## 3. Content

All copy is static in `about-content.ts`; the page makes no API calls.

- `ABOUT_COPY_IS_DRAFT`: set to `false` once mission, vision and values are approved. This removes the banner and the PROPOSED COPY tags.
- `ABOUT_HERO_IMAGE`: `null` until a real photo of PhysioBoo staff or a partner clinic (used with permission) is added. While `null`, tablet and desktop show a decorative icon panel and phones show nothing, so the actions stay near the top.

## 4. Responsive

| Breakpoint | Hero | Values | Steps | Explore |
|---|---|---|---|---|
| < 768 | stacked, full-width buttons | 1 column | vertical rail | 1 column |
| 768–1023 | stacked | 2 columns | 3 across | 1 column |
| ≥ 1024 | text + photo side by side | 4 columns | 3 across | 3 columns |

## 5. Icons added

`heart-handshake`, `accessibility`, `refresh-cw`, `message-circle` (Lucide) in `src/assets/icons`.
