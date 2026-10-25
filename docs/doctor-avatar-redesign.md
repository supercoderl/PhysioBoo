# Doctor Avatar — Redesign

Scope: upload, preview, replace and remove a doctor's avatar from the Doctor edit drawer (`cms-doctor-drawer`, opened from CMS → Doctors → Edit). Backend work for this feature was explicitly approved by the owner as an exception to Amendment A-001.

## UX Audit / Current Problems
- The list shows `avatar`, but nothing in the UI could set it; the field (`User.ProfilePicture`) was only filled by OAuth sign-in.
- `GET /api/doctors/{id}` did not load `User`, so `avatar` and `fullName` were always empty in the detail response.
- `IFileStorage` / `IS3Uploader` are empty stubs; the only working storage is Cloudinary (`ICloudinaryService`, `Cloudinary` client), already used by insurance-claim documents.

## Information Architecture
- Storage: Cloudinary, folder `doctor-avatars`, public id = server-generated GUID.
- Reference: `User.ProfilePicture` (existing nullable string; **no migration**). The doctor's primary key equals the user id.
- Queries run with `NoTrackingWithIdentityResolution` by default (`Program.cs`), so a loaded entity that is merely mutated is **not** saved. The commands therefore check the doctor exists (tenant-filtered), load the user, and persist with `IUserRepository.UpdateTrackedAsync`.
- Doctor profile fields are untouched: the commands only write `ProfilePicture`, `UpdatedBy`, `UpdatedAt` on the user.

## User Journey
1. Open a doctor in edit mode → avatar section at the top of the drawer (initials when empty).
2. Click the upload button → pick JPEG/PNG/WebP (≤ 5 MB, checked client-side).
3. Preview appears with **Save photo** / **Cancel**.
4. Save → spinner, buttons disabled → toast "Avatar updated" → drawer stays open, list row refreshes.
5. **Remove photo** → confirm dialog → toast "Avatar removed".

## Layout / Wireframe
```
┌ Edit Doctor ───────────────────────── x ┐
│ (  JT  )[⭳]  Profile photo               │
│               JPEG, PNG or WebP, ≤ 5 MB  │
│               [Remove photo]             │
│ ──────────────────────────────────────── │
│ Step form …                              │
```
Preview state replaces the actions with `[Save photo] [Cancel]`.

## Component Hierarchy
`DoctorListComponent` → `CmsDoctorDrawerComponent` (avatar section inline, uses `DoctorService`, `DialogService`, `ToastService`). `avatarChanged` output lets the list patch one row without closing the drawer.

## Interaction, States, Edge Cases
- States: idle, preview, uploading (`isAvatarBusy` blocks double submit, button spinner), success toast, error toast, remove confirm.
- Image that fails to load → falls back to initials.
- Rejected client-side: wrong type, > 5 MB. Always re-validated on the server.
- Re-selecting the same file after Cancel works (input value reset).
- Preview object URL revoked on cancel/close/reset (no leak).
- Closing the drawer discards an unsaved preview.
- Failed refresh after a successful upload does not undo or hide the upload.

## Responsive / Accessibility
- Fixed 80 px avatar with flexible text column; actions wrap on narrow widths.
- Upload button is a real `<button>` with `aria-label` ("Upload avatar"/"Change avatar"), visible focus ring, disabled while busy; action area is `aria-live="polite"`; image has `alt`.

## Performance / Scalability
- File is streamed to Cloudinary; only 12 header bytes are inspected locally. No binary data in the database.
- Old file is deleted best-effort after commit; the new file is deleted if the DB commit fails.

## Security Rules (server)
- Authorization: `hr:doctor:update` on both endpoints.
- Tenant scope: the doctor is loaded through the repository's tenant query filter, so a doctor of another tenant is "not found" (404) — no cross-tenant write.
- Content is identified by magic bytes (JPEG, PNG, WebP); file name and client MIME type are ignored. SVG/HTML/executables are rejected.
- Size limit 5 MB; empty files rejected.
- Storage name is a server GUID; the client file name never reaches storage.
- Only urls inside `doctor-avatars/` on Cloudinary are ever deleted (an OAuth/Google picture is never touched), and only when no other user references the same url.
- Responses expose only the public CDN url.

## Proposed API Contract
| Purpose | Method | URL | Request | Response | Frontend usage |
|---|---|---|---|---|---|
| Upload/replace avatar | POST | `/api/doctors/{id}/avatar` | `multipart/form-data`, field `file` | `200 { success, data: "<avatar url>" }`; `400` codes `DOCTOR_EMPTY_AVATAR_FILE`, `DOCTOR_AVATAR_FILE_TOO_LARGE`, `DOCTOR_UNSUPPORTED_AVATAR_TYPE`, `DOCTOR_AVATAR_UPLOAD_FAILED`; `404` `OBJECT_NOT_FOUND` | `DoctorService.uploadAvatar` |
| Remove avatar | DELETE | `/api/doctors/{id}/avatar` | — | `204`; `404` `OBJECT_NOT_FOUND` | `DoctorService.removeAvatar` |
| Read doctor | GET | `/api/doctors/{id}` | — | `DoctorViewModel` incl. `avatar`, `fullName` (now loads `User.Profile`) | `DoctorService.search_by_id` |

## Enterprise Recommendations
- Add audit-log entries for avatar changes when a generic audit trail is introduced for user profile edits.
- Optionally apply Cloudinary transformations (face-crop 256×256) at delivery time.
- A self-service "my avatar" endpoint for the signed-in user could reuse `DoctorAvatarStorage`.

## Tests
`PhysioBoo.Application.Test/Commands/Doctors/DoctorAvatarCommandTests.cs`: validation (size, empty, id), signature detection (JPEG/PNG/WebP accepted; executable, SVG, truncated rejected), upload success, replace (old file deleted), shared url kept, external picture kept, not found / out-of-scope, spoofed content type, storage failure, DB failure cleanup, remove (with file, without avatar, not found).
Not covered by automated tests: the endpoint authorization attribute and the Angular drawer (the repo has no component-test setup for this drawer).
