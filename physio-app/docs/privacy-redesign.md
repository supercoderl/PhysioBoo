# Privacy Policy Redesign (`/privacy`)

Source design: Claude Design project "Brand color consistency issue", `Privacy Page.dc.html` (frames 13a responsive, 13b print), which imports `Privacy Policy.dc.html`.
Code: `src/app/pages/client/privacy` (`privacy.component.ts/.html`, `privacy-content.ts`).

## 1. UX Audit

The previous `/privacy` was the purchased template:

- Three paragraphs of lorem ipsum and a list of repeated placeholder sentences, with no headings.
- No section structure, so nothing could be linked to (`/privacy#s4` from a form was impossible).
- No last-updated date, no contact details, no print layout.
- The contact form already links to `/privacy` for consent, so visitors landed on meaningless text.

## 2. Current Problems

| # | Problem | Impact |
|---|---|---|
| 1 | Lorem ipsum content | The consent link on the contact form points at nothing |
| 2 | No headings or anchors | Long text cannot be scanned or deep-linked |
| 3 | No last-updated date | Visitors cannot tell whether the policy is current |
| 4 | No print layout | Printed copies carry site navigation and footer |
| 5 | Footer link has no current-page state | Screen reader users are not told where they are |

## 3. Information Architecture

```
/privacy
├── Draft notice (until legal approval)
├── Breadcrumb, H1, lead, Last updated, Print
├── Contents (sticky on desktop, collapsible below 1024px)
├── 13 numbered sections: Introduction · Information We Collect · How We Use Information ·
│   Appointment Requests and Contact Forms · How Information Is Shared · Cookies ·
│   Data Storage and Security · Data Retention · Your Privacy Rights · Third-Party Services ·
│   Children's Privacy · Changes to This Policy · Contact Us
└── Last updated + Back to top
```

Anchors are stable: `#s1` to `#s13`. The contact form can link to `/privacy#s4`.

## 4. User Journey

1. From the footer, the contact form consent line or an email, the visitor opens `/privacy` (optionally with `#sN`).
2. They scan the contents, jump to a section; the heading receives focus and the contents mark the section being read.
3. They print a copy, or follow "Or use the contact form" from Contact Us.

## 5. Layout

| Breakpoint | Layout |
|---|---|
| Desktop ≥1024 | 240px sticky contents + 700px text column, 72px gap, max width 1012px |
| Tablet 768–1023 | Single column, collapsible contents in two columns, "Back to top" per section |
| Mobile <768 | Single column, collapsible contents in one column, 44px touch rows |
| Print | Single column, smaller type, own header (logo + page address) and footer |

## 6. Wireframes

```
Desktop                                   Mobile
[DRAFT banner]                            [DRAFT banner]
Home / Privacy Policy                     Home / Privacy Policy
              Privacy Policy              Privacy Policy
              lead text                   lead text
              Last updated … [Print]      Last updated …  [Print]
CONTENTS      01 Introduction             [Contents · 13 sections  v]
 1 Intro      text…                       01 Introduction
 2 Info…      02 Information We Collect   text…            Back to top
 …            • list                      …
```

## 7. Component Hierarchy

`PrivacyComponent` is a single standalone page component. The copy is data in `privacy-content.ts` (sections, blocks, contact rows) and is rendered through one `ng-template` that highlights `[placeholders]`. No new shared component is introduced: the contents list is specific to this page.

## 8. UI Specification

Uses the existing tokens (`primary`, `primaryDeep`, `primarySoft`, `surface`, gray scale) and the same intro/breadcrumb pattern as Contact.

- H1 40/48 desktop, 36/44 tablet, 30/38 mobile. Section H2 22/30 (20/28 mobile). Body 17/28 (16/26 mobile).
- Section numbers in mono, primaryDeep. Current contents entry: 2px `primary` bar, semibold.
- Placeholders: amber highlight (`#FEF3C7` on `#78350F`). "Needs legal review" amber tag on sections that carry commitments, retention periods, laws or rights.
- Contact block: bordered card, definition list, two columns from `sm`.

## 9. Interaction Design

- Contents links update the URL fragment (`replaceUrl`, so Back is not polluted), scroll the section into view and move focus to its heading.
- Scroll-spy: an `IntersectionObserver` marks the topmost section inside the upper 35% of the viewport.
- Opening `/privacy#s9` scrolls to that section after first render.
- Smooth scrolling is skipped when `prefers-reduced-motion` is set.
- Print calls `window.print()`.

## 10. Responsive Behavior

Desktop first; below 1024px the sticky contents become a disclosure button (`aria-expanded`, `aria-controls`) and each section ends with "Back to top". Long words and addresses wrap (`break-words`).

## 11. Accessibility

- One H1; sections are `<section aria-labelledby>`; headings are focusable (`tabindex="-1"`) as jump targets.
- Contents is a labelled `nav`; the current entry has `aria-current="location"`. The footer Privacy Policy link gets `aria-current="page"` on `/privacy`.
- Breadcrumb has `aria-current="page"`. Touch targets are at least 44px.
- Placeholder highlights are not the only cue: the text itself is in brackets. Amber on dark brown meets AA contrast.

## 12. Page States

Static content, so there is no loading or error state. States that exist: contents collapsed/expanded, current section, draft (banner and review tags shown) vs approved (`PRIVACY_IS_DRAFT = false` hides both), print.

## 13. Edge Cases

- Unknown fragment (`/privacy#foo`): ignored, page opens at the top.
- No `IntersectionObserver` or server render: contents still work, only the highlight is missing; browser-only APIs are guarded.
- Placeholder text that spans a line wrap stays highlighted inline.
- A section with a nested list (section 3) renders the sub-list with circle bullets.

## 14. Performance Considerations

No network requests. The page is lazy-loaded by the existing route. One observer for 13 sections; it is disconnected on destroy.

## 15. Scalability

Copy lives in `privacy-content.ts`. Adding a language means a second content file selected by the language setting; the Terms page (`/term`) can reuse the same section model and template when it is redesigned. Section numbers, anchors and the contents list are derived from the array order.

## 16. Enterprise Recommendations

- Legal must approve every section tagged "Needs legal review" before launch. Facts to confirm first: what technical data is logged, whether analytics or non-essential cookies exist, hosting provider and region, who receives contact-form messages, processors used, retention periods, applicable law and the age threshold.
- When approved: replace every `[placeholder]`, set the real last-updated date, and set `PRIVACY_IS_DRAFT` to `false`.
- Company name, address, email and phone in the contact block should come from tenant settings once those are available.
- Link the appointment and contact forms to `/privacy#s4`.

## 17. Proposed API Contract

The page works with no backend. If the owner later wants editable, versioned policy text per tenant, propose:

### Get privacy policy

- **Purpose:** return the published policy for the current tenant and language.
- **Method / URL:** `GET /api/public/legal/privacy?lang=en`
- **Request:** query `lang` (`en` | `vi`, default `en`).
- **Response:**
  ```json
  {
    "lastUpdated": "2026-10-18",
    "sections": [
      { "id": "s1", "title": "Introduction", "needsReview": false,
        "blocks": [ { "type": "p", "text": "…" }, { "type": "ul", "items": ["…"] } ] }
    ],
    "contact": { "organisation": "…", "email": "…", "postalAddress": "…", "dataProtectionContact": null }
  }
  ```
- **Frontend usage:** `PrivacyComponent` would load this instead of `privacy-content.ts`; the same view model renders it. Loading would show skeleton lines and failure would show a retry state (not needed today).

## 18. Implementation Status

- Built: page, content model, contents with scroll-spy, collapsible contents, print layout and print button, draft banner and review tags, footer `aria-current`, global print rule hiding site header and footer (`styles.scss`).
- Contact form consent line links to `/privacy#s4`. The appointment form does not exist in this app yet.
- Pending (owner/legal): final copy and last-updated date.
