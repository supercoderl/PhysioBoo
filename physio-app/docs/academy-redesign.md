# Academy — Redesign

Routes: `/admin/academy/list` (courses) and `/admin/academy/course/:id` (one course)
Components: `ListAcademyComponent`, `CourseAcademyComponent` · Service: `AcademyService`

Staff training. A course holds ordered lessons (title, text, duration). Everyone signed in can read published courses and tick lessons off; people with `academy:course:manage` can also create and edit courses, lessons and drafts.

## 1. UX Audit
The sidebar had an "Academy" entry pointing to `/admin/academy/list`, but there was no route, page, service or backend: the link led nowhere.

## 2. Current Problems
Everything: no page, no data, no progress tracking, no way for admins to publish content.

## 3. Information Architecture
Course (title, description, category, published/draft) → Lessons (title, content, duration, position) → Completions (one row per user and lesson). Categories are free text taken from the courses themselves.

## 4. User Journey
- **Learner:** Academy → search or filter by category → open a course → read lessons in order → "Mark as complete" (moves on to the next lesson) → see progress on the course tile.
- **Manager:** Academy → Manage (shows drafts, enables "New course") → create a course as a draft → open it → add lessons → Edit course → publish.

## 5. Layout
List: breadcrumb, title and search, Manage toggle, category chips, responsive tile grid. Course: header with progress bar, then a lesson list (left) and a reader (right); on phones they stack.

## 6. Wireframe
```
Academy                       [Search] [Manage] [+ New course]
(Safety) (Onboarding) (Clinical)
┌ Safety ──────┐ ┌ Onboarding ──┐
│ Hand hygiene │ │ First week   │
│ 4 lessons·30m│ │ 6 lessons·45m│
│ ▓▓▓░░ 50%    │ │ ░░░░░ 0%     │
└──────────────┘ └──────────────┘

Hand hygiene [Edit course] [Delete]      ▓▓▓░░ 2/4
┌ Lessons ───────┐ ┌ 2. When to wash ───────────────┐
│ ✔ 1. Why       │ │ (lesson text)                  │
│ ● 2. When      │ │ [Mark as complete]             │
│ ○ 3. How       │ └────────────────────────────────┘
│ + Add lesson   │
└────────────────┘
```

## 7. Component Hierarchy
`ListAcademyComponent` (tiles, filters, new-course dialog) and `CourseAcademyComponent` (header, lesson list, reader, course and lesson dialogs), using `AdminBreadcrumbComponent`, `BooIconComponent`, `EmptyStateComponent`.

## 8. UI Specification
Tiles are white cards with a category pill, a "Draft" pill for unpublished courses and a progress bar (`role="progressbar"`). The open lesson is highlighted; finished lessons show a ticked circle in the primary colour.

## 9. Interaction Design
- Completing a lesson updates the screen at once and opens the next lesson; clicking again marks it not done.
- Dialogs: Esc or a click outside closes them (not while saving); Save is disabled until the form is valid.
- Deleting a course or lesson asks for confirmation.

## 10. Responsive Behaviour
Tiles 3 → 2 → 1 columns; the course page switches from two columns to a stack below `md`; the lesson dialog is a bottom sheet on phones.

## 11. Accessibility
The lesson list is a `nav` with `aria-current` on the open lesson; progress bars carry `aria-valuenow`; icon-only buttons have `aria-label`; dialogs are `role="dialog" aria-modal`; loading skeletons set `aria-busy`.

## 12. Page States
Loading skeletons, empty (no courses / nothing matches), course not found (unpublished, deleted or no access), saving, success toasts; API errors are toasted by the global interceptor.

## 13. Edge Cases
- A draft is "not found" for learners; completing a lesson of a draft returns `ACADEMY_COURSE_NOT_PUBLISHED`.
- Marking a lesson done twice, or undoing one that is not done, does nothing (no error).
- Deleting a course hides its lessons; learners' completion history is kept.
- A deleted lesson no longer counts toward progress.

## 14. Performance
List: one query for courses plus two grouped counts (lessons, completions) for all of them. Course: three queries. No pagination or virtual scroll: an academy is expected to have tens of courses.

## 15. Scalability
Lesson content is plain text (max 20,000 characters). Rich text, video and file attachments would use the file manager and a content-type per lesson. Learner reports (who finished what) can read `LessonCompletions` directly.

## 16. Enterprise Recommendations
Quizzes, certificates, mandatory-course assignment and due dates are the usual next steps for compliance training; none are included. Progress is per user and per lesson, so it can feed those later without changing the API.

---

## 17. API Contract
Login required on every route; the `manage` and write routes need `academy:course:manage`. Responses use `ResponseMessage<T>`.

| # | Purpose | Method | URL | Request | Response | Frontend usage |
| - | ------- | ------ | --- | ------- | -------- | -------------- |
| 1 | Published courses with my progress | GET | `/api/academy/courses?search&category` | — | `CourseSummary[]` | list page |
| 2 | One published course with lessons | GET | `/api/academy/courses/{id}` | — | `Course` | course page (learner) |
| 3 | Mark lesson done | POST | `/api/academy/lessons/{id}/complete` | — | `id` | "Mark as complete" |
| 4 | Mark lesson not done | DELETE | `/api/academy/lessons/{id}/complete` | — | `id` | undo |
| 5 | All courses incl. drafts | GET | `/api/academy/courses/manage?search&category` | — | `CourseSummary[]` | list page, Manage mode |
| 6 | One course incl. a draft | GET | `/api/academy/courses/{id}/manage` | — | `Course` | course page (manager) |
| 7 | Create course | POST | `/api/academy/courses` | `{ title, description?, category, isPublished }` | `CourseSummary` | New course |
| 8 | Update course | PUT | `/api/academy/courses/{id}` | same | `id` | Edit course (also publish) |
| 9 | Delete course | DELETE | `/api/academy/courses/{id}` | — | `id` | Delete |
| 10 | Add lesson | POST | `/api/academy/courses/{courseId}/lessons` | `{ title, content, durationMinutes }` | `Lesson` | Add lesson |
| 11 | Update lesson | PUT | `/api/academy/lessons/{id}` | same | `Lesson` | Edit lesson |
| 12 | Delete lesson | DELETE | `/api/academy/lessons/{id}` | — | `id` | Delete lesson |

## 18. Server behaviour (implemented)
- Tables `Courses`, `Lessons`, `LessonCompletions` (unique per user and lesson while not deleted). New lessons are added at the end of the course.
- Permission `academy:course:manage` (`Permissions.Academy.CourseManage`) must be assigned to the roles that manage content; the frontend checks the same code to show the management controls.
- Deletes are soft deletes. Not implemented: lesson reordering, quizzes, certificates, assignments, attachments.

## 19. Deliverables
- [x] This document and the API contract (§17)
- [x] Types `academy.types.ts`, service `academy.service.ts`, `ACADEMY` in `base.ts` / `loading.ts`, `Permissions.Academy`, routes `academy/list` and `academy/course/:id`
- [x] Two pages (list, course)
- [x] Backend: 3 entities, 3 configurations, 3 repositories, 2 queries, 7 commands, `AcademyEndpoints`
