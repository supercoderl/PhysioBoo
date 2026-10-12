# Admin — Rose Theme (colour system)

**Scope:** the whole app (admin, Super Admin, auth pages and the public site). There is no per-area class any more; Rose is the default in `src/styles.scss`.
**Mechanism:** `:root` (and `:root.dark`) in `src/styles.scss` define the palette twice, side by side: `--twc-*` as space-separated RGB (Tailwind needs it for alpha) and `--color-*` as hex (plain CSS, SVG, inline styles). Keep the two in sync. Tailwind names are in `tailwind.config.js`; ng-zorro takes its colours from `src/theme.less`.

## 1. Tokens

All tokens are space-separated RGB (`--twc-*`) so Tailwind can apply alpha. New Tailwind colour names were added in `tailwind.config.js`.

| Role | Value | Token / Tailwind name |
|---|---|---|
| Primary (buttons, links, active, focus) | #E11D48 | `--twc-primary` / `primary` |
| Primary hover / pressed | #BE123C / #9F1239 | `primaryHover` / `primaryPressed` |
| Primary soft (tinted bg) / deep (text on soft) | #FFE9EE / #9F1239 | `primarySoft` / `primaryDeep` |
| Logo mark | #F43F5E | `logo` |
| Page background | #FDF8F9 | `body` |
| Surface (cards, tables, inputs) | #FFFFFF | `surface` |
| Border / divider | #EFE3E7 | `borderGray` |
| Table row divider | #F4F4F2 | `rowDivider` |
| Text primary | #26141A | `regular`, `neutral` |
| Text secondary | #71606A | `secondary` |
| Placeholder / disabled / table header | #A1A1AA | `placeholder` |
| Sidebar bg / item text | #FDF3F5 / #3F2129 | `menu` / `brandDark` |
| Sidebar group title / divider | #A98A93 / #F3E1E6 | `sidebarGroup` / `sidebarDivider` |
| Sidebar active (bg, text) | #FDD9E1, #BE123C 600 | `sidebarActive`, `primaryHover` |
| Sidebar hover | #FBE7EC | `sidebarHover` |
| Destructive (text / border / hover bg) | #B42318 / #F3C7C2 / #FEF3F2 | `danger` / `dangerBorder` / `dangerSoft` |

Hex aliases for plain CSS: `--color-primary`, `--color-primary-hover`, `--color-primary-pressed`, `--color-primary-soft`, `--color-primary-active-soft` (#FDD9E1), `--color-primary-deep`, `--color-bg`, `--color-surface`, `--color-border`, `--color-text`, `--color-text-secondary`, `--color-text-muted`.

A dark variant exists for every token (rose lifted to #FB7185).

## 2. Usage rules (as specified)

1. Rose only for primary buttons, links, the active nav item, focus ring, running/done status and DEV ONLY / notice badges. Never body text, descriptions or labels.
2. One filled primary button per screen; repeated row actions are outlined (white, `#EFE3E7` border, rose text).
3. Descriptions and helper text use secondary gray.
4. Notice banners: `primarySoft` background, `primaryDeep` text, small filled rose badge in white mono text.
5. Focus: `2px solid` rose outline with a 2px offset on every `:focus-visible` inside the theme.
6. Destructive actions use the deeper red, outlined, never filled outside confirm dialogs.

## 3. Applied in this pass

- Tokens, focus ring and Tailwind names (above); Geist and Geist Mono loaded from Google Fonts in `index.html` (`font-mono` now maps to Geist Mono).
- Sidebars (both share `sidebar-item`): tinted background, sentence-case 12px group titles, active / hover colours, dividers, logo mark colour.
- Super Admin shell: page padding 36 / 40px, page title 30px / 600 / -0.025em, secondary description.
- Shared table (`boo-table-admin`): white header with a `#EFE3E7` bottom border and `#A1A1AA` 12px labels, `#F4F4F2` row dividers, warm row hover, no zebra striping or vertical header lines, warm loading shimmer.
- Dev data: 14px cards, 42px inputs with rose focus border + ring, mono numeric field, outlined 32px Generate buttons, status dot + text (idle gray, running pulsing rose, done solid rose, failed deep red), dependency chips (ready = soft rose, not ready = neutral; "ready" means generated earlier in this session), DEV ONLY notice banner.

## 4. Blue removal pass

- **Tailwind classes:** every `blue-*`, `sky-*` and `indigo-*` utility (text, bg, border, ring, outline, divide, stroke, fill, gradient stops, accent, shadow) was rewritten to the Rose names by shade: 50-200 to `primarySoft` (or `primary/25` for lines), 300-400 to `primary/70`, 500-600 to `primary`, 700 to `primaryHover`, 800+ to `primaryPressed`.
- **Hex and `rgb()` values** with a blue hue (about 195-250 degrees) and real saturation were mapped by lightness: pale tints to #FFE9EE, light to #FDD9E1 / #FB7185, mid to #E11D48, dark to #9F1239, near-black blue to #26141A. Violets and purples were deliberately left alone; slate and gray neutrals were handled in a second pass (see section 5). 8-digit hex (`#E2EDFF40`) was handled separately.
- **Runtime accent override removed:** `ThemeConfigService` used to set `--twc-primary` inline from a saved accent preset whose default was blue (`21 101 192`). That override, not the stylesheet, was what kept the dashboard blue after login. There is now a single accent, `rose`; saved choices from the old palette fall back to it and the inline override is cleared. The Theme settings page shows only Rose.
- **ng-zorro:** `src/theme.less` now imports ng-zorro itself and sets `@primary-color`, links, info and processing colours to the Rose palette; the separate ng-zorro entry was removed from `angular.json` `styles`.
- **Role colour picker** (`ColorUtils.roleColors`): the Blue and Indigo options became Rose and Stone.
- **Dashboard (Super Admin):** quick-link circles use `primarySoft` with a rose icon and `#FDD9E1` on hover; text links are rose with a `primaryHover` hover; letter avatars use `primarySoft` with `primaryDeep` letters.
- **Secondary buttons** (`boo-button-admin` with a border): default text is `--color-text`, neutral border `#EFE3E7`, and the border turns rose on hover.
- **Intentionally unchanged:** third-party brand logos (Facebook, Google, LinkedIn, Messenger SVGs, the US flag), the insurer name "Blue Cross", and green status badges (Active etc.).

## 5. Not covered (follow-ups)

- **Cool grays are now warm:** Tailwind's default `gray` and `slate` palettes (blue-tinted, and behind most hover states: `hover:bg-gray-100`, `hover:bg-gray-50`, `hover:bg-slate-100`, …) are overridden in `tailwind.config.js` with a warm neutral scale (50 `#FDF8F9`, 100 `#FAF1F3`, 200 `#EFE3E7`, 300 `#E3D5DA`, 400 `#A1A1AA`, 500 `#85757D`, 600 `#71606A`, 700 `#55434B`, 800 `#3F2129`, 900 `#26141A`), and the exact Tailwind slate / gray hex values hard-coded in 64 files were mapped to the same scale.
- **Green / amber / red status colours** stay as semantic status colours.
- **Shape and size tokens** (14px cards, 42px inputs, 36-40px padding) are applied to the Super Admin shell and the dev data page, not to every admin form control.
- **Pages that use `text-primary` for titles** now render those titles in rose; switch them to `text-regular` per rule 1 as each page is revisited.
- Geist loads from Google Fonts, so it needs network access; self-hosting is the offline option.
