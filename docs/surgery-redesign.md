
## Implementation notes — scheduling, filters and permissions

- Schedule tab filters (search, priority, status, emergency-only, date from/to) and paging (20 per page) are sent to `GET /api/surgery/cases/search`; the list is ordered by scheduled start, oldest first. Timeline and calendar views render the current page only.
- The period switch (Today / Weekly / Monthly) is sent as `range` to `GET /api/surgery/stats` and `/trends`.
- **Schedule Surgery** (`surgery:case:schedule`) posts to `POST /api/surgery/cases`. Room-clash and unusable-room (Maintenance/Closed) checks are enforced by the server; the form keeps its entries when the server rejects the request.
- **Cancel** (`surgery:case:schedule`) asks for a reason (required, max 500) and calls `POST /api/surgery/cases/{id}/cancel`.
- **Record stage** in the detail drawer (`surgery:case:update`) calls `POST /api/surgery/cases/{id}/timeline/{stage}`; stages only move forward.
- Acknowledging alerts requires `surgery:case:update`; the page requires `surgery:case:read`.
