# Public layout width

## Problem
Every public-site wrapper (header, footer, and each section of Home, Doctors, Hospitals, Services, Blog, About, Contact,
Search, Privacy, Terms and the detail pages) repeated `max-w-[1200px] mx-auto px-5 xl:px-0`. Content stopped at 1200px
and left large empty margins on wide monitors; the gutter was removed at `xl`, so it also depended on that cap.

## Solution
One class, `.public-container`, in `src/styles.scss` (components layer):

| Token | Value |
|---|---|
| `--public-gutter` | `clamp(1.25rem, 4vw, 4rem)`: 20px on mobile, about 58px at 1440px, 64px from 1600px |
| `--public-max` | `110rem` (1760px) content cap |

The cap applies to the content box, so gutters never reduce it. Result: about 1325px of content at 1440px and 1760px at
1920px, with the same gutter used by the header, body and footer.

## Rules
- Use `.public-container` for any public section wrapper; never a hard-coded `max-w-[…px] mx-auto px-*`.
- Utilities can still adjust it (`max-xl:pr-3` in the header, `max-md:px-0` on the blog list, which supplies its own mobile padding).
- Readable text stays narrow: headings and intro copy keep their own `max-w-[640–760px]`; the article body and the
  Privacy/Terms pages keep their 808/1012px reading column on purpose.
- Admin, patient, superadmin and auth layouts do not use the class.
