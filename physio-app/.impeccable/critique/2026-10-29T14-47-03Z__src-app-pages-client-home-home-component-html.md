---
target: the home page
total_score: 29
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
target_identity: "file:F:\\Workspace\\PhysioBoo\\physio-app\\src\\app\\pages\\client\\home\\home.component.html"
target_fingerprint: "sha256:e55577f9dbdc6d480287c80c79c9ad23a2f584c3d09c488b13cab7f6e4e5cad0"
target_path: "F:\\Workspace\\PhysioBoo\\physio-app\\src\\app\\pages\\client\\home\\home.component.html"
timestamp: 2026-10-29T14-47-03Z
slug: src-app-pages-client-home-home-component-html
---
Method: dual-agent (A: design review · B: detector and source checks)

# Critique: Home page (home.component.html)

## Design Health Score: 29/40 (all ten heuristics scored, none n/a). Good (72%)

| # | Heuristic | Score | Key issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | No timeout state; hung request leaves skeletons forever. |
| 2 | Match System / Real World | 3 | "Popular:" is a false label; "Ready to see a doctor?" overpromises. |
| 3 | User Control and Freedom | 3 | Mobile chip and doctor rows scroll with hidden scrollbars. |
| 4 | Consistency and Standards | 3 | /doctor linked four times under four labels; mono used for numerals. |
| 5 | Error Prevention | 2 | maxlength=100 truncates silently; search cannot be scoped. |
| 6 | Recognition Rather Than Recall | 3 | Request explanation (line 254) is after the doctor cards (line 181). |
| 7 | Flexibility and Efficiency | 2 | No tap-to-call, no location/availability filter. |
| 8 | Aesthetic and Minimalist Design | 3 | Nine same-weight sections; gray-50 bands barely separate. |
| 9 | Error Recovery | 4 | Per-section retry; failure kept separate from empty. |
| 10 | Help and Documentation | 3 | Phone/email are plain text; FAQ far from the process. |

## Design Specificity Verdict
LLM: generic-leaning. Standard healthcare-directory skeleton; same header pattern in every section; nothing says physiotherapy. Product-specific traces: request-not-booking framing, specialty deep links, honest empty/error states.
Deterministic: 4 advisory findings. design-system-font-size x3 (text-[34px] line 18, text-[15px] line 55, text-[17px] line 473; text-[15px] actually appears at 11 places). design-system-color x1 (rgb(0,0,0) on tenant name) is likely a false positive: the element uses text-primaryDeep. No contrast results (source scan only).

## Priority Issues
- [P1] No peak, no product-specific composition. Fix: tenant hero slot, drop stock photo default, vary two section compositions. Commands: layout, bolder.
- [P1] Request process explained too late; phone/email not tappable (no tel:/mailto: in the folder). Fix: move process strip under hero; tel:/mailto: links at 44px. Commands: layout, harden.
- [P2] Rose spent on navigation/decoration: four "All" links, FAQ icons, numerals. Fix: neutral by default, rose on hover. Command: quieter.
- [P2] Accessibility: list-none without role="list" (lines 234, 279, 294, 361, 540); conditionally mounted status region; hidden-scrollbar rows; 38px mobile chips; gray-500 placeholder about 4.2:1. Commands: adapt, harden.
- [P3] Copy: "Popular:" (line 82), "Ready to see a doctor?" (line 567), "Why choose {{tenant.name}}", no tenant.name fallback. Command: clarify.

## Persona red flags
Jordan: no plain-language entry ("where does it hurt"); doctor cards before the request explanation; four links to the same list.
Sam: missing list roles; status region may not announce; hidden-scrollbar rows; low placeholder contrast.
Casey: no scroll cue on rows; small "All" targets; untappable phone; skeleton-only server render.

## Minor observations
ph-stripes dead code (home.component.ts:66); off-ramp type sizes; inconsistent section padding; text-primary link at line 457 about 4.4:1; hard-coded skeleton color; empty testimonial avatar; 10 ngFor loops without trackBy. Unverified: appReveal reduced-motion handling, home.data.ts text.

## Questions
1. What on the page says physiotherapy rather than dentist or GP group?
2. Why four equal links and a tile grid instead of one confident path?
3. With no proof allowed, would a shorter page ending at the process and a tappable phone number be stronger?
