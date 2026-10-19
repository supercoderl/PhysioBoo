# Error Pages (`/exception/:code`, `**`)

Source design: Claude Design project, `Error Pages.dc.html` (frames 12a–12e), which imports `ErrorPage.dc.html` and `InlineError.dc.html`.
Code: `src/app/pages/exception` (`exception.component.ts/.html`, `exception-content.ts`, `exception.routes.ts`) and `src/app/components/ui/inline-error.component.ts`.

## 1. What changed

The old page was a full-height glass card with no header or footer, a bouncing 9xl code and one "Go to Home" button. It is replaced by one template inside the shared client layout; only the icon, eyebrow, copy and actions change per code. The bounce, fade and wiggle animations are gone.

- The exception route now renders inside `ClientComponent`, so the shared header and footer show.
- `**` renders the 404 page in place instead of redirecting to `/exception/404`, so the visitor keeps the URL they typed.
- `/exception/401` redirects to `/auth/login` (with `returnUrl` from `?from=`). Unknown codes show 404.

## 2. Error type → actions

| Type | When it shows | Primary | Secondary |
|---|---|---|---|
| 404 | Unknown route, or a doctor/clinic/service/article that no longer exists | Back to homepage | Find a doctor · Explore clinics |
| 403 | Signed-in user opens an area their role can't use | Back to homepage | Contact us |
| 401 | Not signed in | — redirect to login | — |
| 500 | The page's main request fails on the server | Try again | Back to homepage |
| 503 | Server unavailable (maintenance, tenant missing, overloaded) | Try again | Back to homepage |
| network | Request never reached the server (status 0 / offline) | Try again | Back to homepage |
| Inline | One section's request fails while the page loaded | Try again (in the section) | — |

"Back to homepage" goes to the signed-in user's own area (`homeRouteFor(roles)`).

## 3. Retry

Pass the failed page as `?from=`, e.g. `router.navigate(['/exception', '503'], { queryParams: { from: router.url } })`.

- "Try again" re-navigates to `from` (validated with `canReturnTo`; falls back to the home route). It is not a hard reload.
- While retrying the button is disabled and shows a spinner. If the original page loads, it replaces the error page; if we are still on the error page afterwards, a "still failing" notice appears and the button stays.
- `network` while `navigator.onLine` is false fails straight away without navigating.

Nothing navigates to 500, 503 or network automatically yet. The HTTP interceptor could map page-level 503 and status 0 to these pages, but it can't tell a page's main request from a section's, so that is left to the callers.

## 4. InlineError

`<boo-inline-error what="clinics" [state]="state" [compact]="false" (retry)="reload()" />`

The parent owns the request: set `state` to `retrying` while it re-runs, `failed` if it fails again, and remove the component once it succeeds. `compact` stacks the button under the message for narrow columns and mobile.

## 5. Responsive

| Breakpoint | Alignment | H1 | Buttons | Popular links |
|---|---|---|---|---|
| < 768 | left | 30/38 | full width | 1 column |
| 768–1023 | centred | 38/46 | inline | 2 columns |
| ≥ 1024 | centred | 44/52 | inline | 2 columns |

## 6. Icons added

`wifi-off`, `server`, `circle-pause` (Lucide) in `src/assets/icons`.
