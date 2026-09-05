# Profile & Settings Pages - Design

Status: approved
Date: 2026-09-06

## Purpose

Add member-facing profile view/edit and a settings hub to `marc_next`,
reaching feature parity (for this slice) with `marc_flutter`'s
`lib/features/profile/profile_page.dart`, `edit_profile_page.dart`, and
`settings_page.dart`. Also reworks the app header: the previous flat
avatar+name+theme+logout cluster becomes a shadcn `DropdownMenu` triggered
by the avatar (already implemented, see `components/marc/menu-profil.tsx`
and the updated `components/marc/rangka-aplikasi.tsx`).

This spec covers only the profile/settings slice. Deferred to later specs:
Telegram linking, address management (`address_form_page.dart`,
`manage_addresses_page.dart`), About/FAQ pages, account-deletion request,
and admin-only settings sections (blocked email domains, departments) -
none of these exist on web today and none are in this slice.

## Backend contract (reference, not being changed)

- `GET /me` → `profileResponse` (already fully typed as `Profile` in
  `lib/api/types.ts` - no new fields needed).
- `PATCH /me` → body `updateMeRequest`:
  ```
  { display_name?: string; phone?: string; avatar_r2_key?: string;
    emergency_contact_name?: string; emergency_contact_phone?: string;
    health_notes?: string }
  ```
  All fields are `*string` server-side: omitted = left unchanged, empty
  string = cleared, non-empty = set. Server-side limits: `display_name`
  ≤100 chars, `phone`/`emergency_contact_phone` ≤30 chars (and must pass
  `phone.NormalizeMY` if non-empty), `emergency_contact_name` ≤100 chars,
  `health_notes` ≤500 chars. Returns the updated `profileResponse`.
  (`internal/http/handlers/profile.go:157-266`)
- `POST /uploads/presign` - same generic presign endpoint already used by
  the posts module (`lib/posts/api.ts`'s `mintaUploadURL`); avatar upload
  reuses it as-is, no new backend endpoint.
- `POST /auth/logout-all` → already wired end-to-end
  (`lib/auth/api.ts`'s `logoutAll`, `lib/auth/actions.ts`'s
  `logKeluarSemuaAction`) - settings page just needs a confirm-gated
  button calling the existing action.
- `GET /me/sessions` - already wired (`components/auth/senarai-sesi.tsx`)
  - settings page reuses this component as-is.

## Routes & pages

```
app/(dilindungi)/profil/
  page.tsx           profile view: header + info card
  edit/page.tsx       edit form
app/(dilindungi)/tetapan/
  page.tsx            settings hub
```

`ROUTES.profil = "/profil"` and `ROUTES.tetapan = "/tetapan"` already added
to `lib/auth/routes.ts` as part of the navbar rework. All three pages sit
in the existing `(dilindungi)` route group and inherit its auth gate.

## Data layer

Mirrors `lib/posts/`'s split:

- **`lib/profil/api.ts`** - `server-only`, one function:
  `kemaskiniProfil(accessToken, body): Promise<Profile>` wrapping
  `PATCH /me` via `apiFetch`. Avatar presign reuses
  `mintaUploadURL` from `lib/posts/api.ts` directly (it's generic, not
  posts-specific - no duplicate function).
- **`lib/profil/actions.ts`** - `"use server"`, one Server Action:
  `kemaskiniProfilAction(_prev: KeadaanBorang, formData: FormData):
  Promise<KeadaanBorang>`. Unlike the posts module (which introduced
  `HasilTindakan` because its components need to mutate local list state
  and handle multi-step async flows), this is a classic single-submit
  form - `useActionState` + `KeadaanBorang` (from `lib/auth/borang.ts`,
  already shared infrastructure) is the right fit, matching
  `lib/auth/actions.ts`'s existing pattern exactly. On success, calls
  `revalidatePath(ROUTES.profil)` and redirects to `ROUTES.profil` (the
  edit page's job is done once saved - same UX as Flutter's `context.pop()`
  after save).
- **Avatar upload** inside the edit form follows the same client-side
  presign→PUT-to-R2→submit-key flow as `KomposerPos` (posts module):
  a Server Action `mintaUploadURLAction` equivalent is needed for
  profile - reuse `lib/posts/actions.ts`'s existing
  `mintaUploadURLAction` directly (it's generic: content-type in, presigned
  URL + key out - not posts-specific despite living in that file). The
  resulting `r2_key` is submitted as `avatar_r2_key` in the same form
  submission as the other fields (a hidden input set by client JS after
  a successful upload, or a small client wrapper island around the
  avatar picker within the otherwise-server-rendered edit page).
- **Zod schema** - `lib/profil/schemas.ts`: `skemaKemaskiniProfil`
  mirroring the backend's limits exactly (same numbers as above), reusing
  `normalkanTelefonMY` from `lib/auth/phone.ts` for both phone fields,
  same pattern as `lib/auth/schemas.ts`.

## Components

```
components/profil/
  header-profil.tsx        avatar + name + role (+ management badge), read-only
  kad-info-profil.tsx      info rows: email, phone, member ID, email-verified
                            status, department (if set), position (if set)
  borang-edit-profil.tsx   the edit form: display name, phone, emergency
                            contact name+phone, health notes, avatar picker
components/tetapan/
  kad-tetapan.tsx           reusable "settings group" - label + Card of rows,
                            matches Flutter's SettingsGroupLabel/SettingsCard
  butang-log-keluar-semua.tsx  confirm-gated button wrapping
                            logKeluarSemuaAction (two-step inline confirm,
                            same pattern as KadPos's delete button - no
                            modal)
```

`SuisTema` (existing) is reused as-is inside a settings row on the
`tetapan` page rather than duplicated - it already contains all the
view-transition logic; wrapping it in a row is a layout change only, no
logic change.

## Profile page content

Header: avatar (click-to-change, same action sheet-equivalent as Flutter
- for web, clicking the avatar opens a simple inline
change/remove affordance rather than a native action sheet), display
name, role name, "Pengurusan" badge if `isManagement(profile)`. An "Edit"
button links to `/profil/edit`.

Info card: Email, No. telefon, No. ahli (`member_id`), Status emel
(Disahkan/Belum disahkan), Bahagian (only if `department_name` set),
Jawatan (only if `position` set) - exact field set and conditional
rendering matches `profile_page.dart`'s `_InfoCard`.

## Settings page content (v1)

- **Paparan** - theme toggle row (wraps `SuisTema`)
- **Akaun** - "Peranti yang log masuk" renders `SenaraiSesi` inline on the
  settings page (not a separate screen/route) - consistent with how the
  dashboard already renders it inline today, even though Flutter treats
  active-sessions as its own screen + "Log keluar semua peranti"
  (`ButangLogKeluarSemua`)

## Error handling

- Edit form: Zod client-side validation mirrors backend limits exactly
  (same numbers, same phone normalization), `ApiError`/`ApiUnreachableError`
  → `KeadaanBorang.ralat`, via a small `keadaanRalat`-equivalent helper
  duplicated into `lib/profil/actions.ts` (same ~10-line shape as
  `lib/auth/actions.ts`'s `keadaanRalat`) - duplicated rather than
  extracted to a shared location, since extracting it would mean editing
  `lib/auth/`, which is out of scope for this slice and not needed to
  ship it.
- Avatar upload failure: inline error next to the avatar picker, same
  per-file-style error surface as `KomposerPos`, not swallowed into the
  form's general error.
- Logout-all: two-step inline confirm (click once to arm, click again to
  fire), toast on failure via `sonner` (already mounted globally from the
  posts module work).

## Testing

No test framework exists in this repo (unchanged from the posts module
decision) - manual verification via `bun run dev`: view profile → edit
each field → save → confirm changes persist and reflect immediately →
change avatar → remove avatar → toggle theme from settings → arm and
fire logout-all (in a disposable test session, not the developer's own).

## Out of scope (this slice)

- Telegram linking, address management, About/FAQ, account-deletion
  request, admin-only settings sections (blocked domains, departments,
  activity categories) - all present in the Flutter reference, none
  built here.
- Avatar action-sheet-style UI (view full image, dedicated crop screen)
  - web v1 is a simpler inline change/remove, no cropping (backend
  already handles dimension/size limits server-side regardless).
