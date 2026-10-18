# Terms & Conditions Redesign (`/term`)

Design source: Claude Design project "Terms Page" / "Terms Conditions" (desktop, tablet, mobile and print frames). Same layout as the Privacy Policy ([privacy-redesign.md](privacy-redesign.md)); all copy is DRAFT and needs legal review.

## 1. UX Audit
The previous page was a single block of long text with a generic breadcrumb banner, no contents, no dates, no print layout and copy from another product (it referred to "Doccure" and a payment-terms placeholder, though PhysioBoo takes no payments).

## 2. Current Problems
- No way to jump to a section or see where you are.
- No effective / last-updated dates.
- Wrong product copy; payment wording that does not apply.
- Health disclaimer not visible; no emergency guidance.
- Not printable; no stable section anchors.

## 3. Information Architecture
Header (title, lead, Effective and Last updated dates, Print) → health disclaimer summary → contents → 17 numbered sections (#s1 to #s17) → footer line with last updated and back to top. Section 9 holds the full health notice; section 14 links to `/privacy`; section 17 holds contact details and a link to `/contact`.

## 4. User Journey
Visitor arrives from the footer, the privacy policy or a form → scans contents → jumps to a section (URL fragment updates, focus moves to the heading) → optionally prints.

## 5. Layout
Desktop: 240px sticky contents column + 700px reading column (72px gap). Tablet and mobile: single column with a collapsible contents panel (two columns when open on tablet) and a per-section "Back to top".

## 6. Wireframes
```
[DRAFT banner]
Home / Terms & Conditions
            Terms & Conditions
            lead paragraph
            Effective [date]  Last updated [date]      [Print]
            ┌ Not medical advice. Not an emergency service. ┐
CONTENTS    01 Introduction and Acceptance of Terms
 1 …        …
```

## 7. Component Hierarchy
`TermComponent` (`pages/client/term/`) renders one template with a shared `#copy` template for plain text, `[placeholder]` marks and `<<link|/route>>` links. Content lives in `term-content.ts` (typed blocks: `p`, `ul` with sub-items, `notice`, `contact`).

## 8. UI Specification
Uses the Privacy page tokens: rose primary for numbers and links, amber highlight for placeholders and review tags, rose-tinted panel for the health summary, bordered panel for the IMPORTANT notice.

## 9. Interaction Design
Contents links scroll smoothly (instant with reduced motion), update the URL fragment and focus the heading. Scroll-spy marks the section being read. The disclaimer summary link jumps to section 9. Print opens the browser print dialog.

## 10. Responsive Behavior
Breakpoints as the Privacy page: desktop ≥ lg with sticky contents; below lg a collapsible contents panel; print layout hides banners, contents, buttons and links, shows the page address and a footer with the last updated date.

## 11. Accessibility
Breadcrumb with `aria-current`, labelled landmarks (contents, disclaimer, notice with `role="note"`), `aria-current="location"` on the active contents item, `aria-expanded` on the mobile toggle, 44px touch targets, heading focus after jumps, reduced-motion respected, amber/rose text on tinted backgrounds checked for AA.

## 12. Page States
Static content: no loading or error states. Draft state shows the banner and "Needs legal review" tags (`TERMS_IS_DRAFT`). Contents collapsed/expanded on small screens.

## 13. Edge Cases
Unknown URL fragment is ignored. Long words wrap (`break-words`). Without `IntersectionObserver` the first section stays marked. Server-side rendering is guarded with `isPlatformBrowser`.

## 14. Performance Considerations
Lazy-loaded route, no network calls, one observer disconnected on destroy.

## 15. Scalability
Adding or editing a section only touches `term-content.ts`; section numbers and the contents list are derived. Anchors are stable ids, not numbers. The footer link is `/term`; if the route should become `/terms`, change the route and add a redirect.

## 16. Enterprise Recommendations
Have legal approve every section tagged "Needs legal review" (1, 5, 6, 7, 8, 11, 13, 15, 16) before setting `TERMS_IS_DRAFT` to false. Product to confirm: public accounts (5), clinic response to requests (7), online cancellation (8), how listing info is checked (6). Section 13 (liability) intentionally has no sample wording. Consider sharing one legal-page component between Privacy and Terms; not done yet to avoid refactoring the published Privacy page.

## 17. Proposed API Contract
The page works with no backend. For editable, versioned text per tenant:

### Get terms
- **Purpose:** return the published terms for the current tenant and language.
- **Method / URL:** `GET /api/public/legal/terms?lang=en`
- **Request:** query `lang` (`en` | `vi`, default `en`).
- **Response:**
  ```json
  {
    "effectiveDate": "2026-10-18",
    "lastUpdated": "2026-10-18",
    "sections": [
      { "id": "s1", "title": "…", "needsReview": true,
        "blocks": [ { "type": "p", "text": "…" }, { "type": "notice", "title": "IMPORTANT", "items": ["…"] } ] }
    ],
    "contact": { "organisation": "…", "email": "…", "postalAddress": "…", "registrationNumber": null }
  }
  ```
- **Frontend usage:** `TermComponent` would load this instead of `term-content.ts`; loading would show skeleton lines and failure a retry state.

## 18. Implementation Status
- Built: `term-content.ts`, `term.component.ts/html` (replaces the old inline template), draft banner and review tags, dates, health summary, contents with scroll-spy, collapsible contents, print layout, footer `aria-current` on Terms of Service. Global print rules already exist in `styles.scss` from the Privacy work.
- Pending (owner/legal): final copy, dates, emergency number, company details.
