# Post/Feed Module - Design

Status: approved
Date: 2026-09-05

## Purpose

Add a member-facing feed to `marc_next`: browse posts, create posts (text +
up to 4 images), edit/delete own posts (or any post if management), like/
unlike, comment with one level of replies, and a management-only
announcement post type. The backend (`marc_go`) already implements all of
this - `/posts`, `/posts/:id`, `/posts/:id/comments`, `/posts/:id/like`,
`/uploads/presign` - this spec covers only the `marc_next` (Next.js BFF +
UI) side.

## Backend contract (reference, not being changed)

- `GET /posts?cursor=&limit=` → `{ posts: PostResponse[], next_cursor: string|null }`
- `GET /posts/:id` → `PostResponse`
- `POST /posts` → body `{ type?: "normal"|"announcement", content, r2_keys? }` → `PostResponse` (201)
- `PATCH /posts/:id` → body `{ content }` → `PostResponse`
- `DELETE /posts/:id` → 204 (owner or management only)
- `POST /posts/:id/like` / `DELETE /posts/:id/like` → 204
- `GET /posts/:id/comments` → `CommentResponse[]`
- `POST /posts/:id/comments` → body `{ content, parent_comment_id? }` → `CommentResponse` (201)
- `POST /uploads/presign` → body `{ content_type }` → `{ upload_url, r2_key }`

`PostResponse` / `CommentResponse` / `AuthorResponse` shapes are defined in
`marc_go/internal/http/handlers/posts_common.go` (`postResponse`,
`commentResponse`, `authorResponse`) - field names are verbatim snake_case
and must be mirrored as-is in `marc_next`'s types, same convention as
`lib/api/types.ts` today.

Announcement posts require the caller to be management
(`authz.IsManagement`); the backend returns 403 otherwise. Edit is
owner-only; delete is owner-or-management (`canModify`).

## Routes & pages

```
app/(dilindungi)/posts/
  page.tsx           feed: composer at top + infinite-scroll post list
  [id]/page.tsx      post detail: full post + comments + reply UI
```

Both live inside the existing `(dilindungi)` route group and inherit the
auth gate (`dapatkanSesi` + `skrinGate`) and `RangkaAplikasi` shell.
`rangka-aplikasi.tsx` gets a "Feed" link added next to the logo (no nav
exists there today).

## Data layer

Mirrors the existing `lib/auth/` split:

- **`lib/api/types.ts`** - add `Post`, `Comment`, `PostAuthor`,
  `PostType = "normal" | "announcement"`, matching backend field names
  verbatim (snake_case, no camelCase conversion).
- **`lib/posts/api.ts`** - thin `apiFetch<T>` wrappers, `server-only`, same
  shape as `lib/auth/api.ts`:
  - `senaraiPos(accessToken, cursor?, limit?)` → `{ posts, next_cursor }`
  - `dapatkanPos(accessToken, id)` → `Post`
  - `ciptaPos(accessToken, body)` → `Post`
  - `kemaskiniPos(accessToken, id, content)` → `Post`
  - `padamPos(accessToken, id)` → `void`
  - `sukaPos(accessToken, id)` / `nyahSukaPos(accessToken, id)` → `void`
  - `senaraiKomen(accessToken, postId)` → `Comment[]`
  - `ciptaKomen(accessToken, postId, content, parentCommentId?)` → `Comment`
  - `mintaUploadURL(accessToken, contentType)` → `{ upload_url, r2_key }`
- **`lib/posts/actions.ts`** - `"use server"` Server Actions wrapping the
  api layer for all mutations (create/edit/delete/like/unlike/comment),
  same `KeadaanBorang`-style error mapping as `lib/auth/actions.ts`
  (`ApiError`/`ApiUnreachableError` → `{ ralat, nilai }`), each followed by
  `revalidatePath` on the affected route(s).

## Components

```
components/posts/
  komposer-pos.tsx     "use client" - textarea, image picker (≤4),
                        announcement toggle (management only), submit
  kad-pos.tsx           single post: author, content, images, counts,
                        edit/delete affordance (owner or management)
  suapan-pos.tsx        "use client" - infinite-scroll list
  senarai-komen.tsx     comments + one level of replies, inline reply form
  butang-suka.tsx        "use client" - optimistic like/unlike toggle
```

### Feed pagination

`page.tsx` server-fetches the first page (`senaraiPos`) and passes it as
initial props to `SuapanPos`. `SuapanPos` is a client component that:

- renders the initial posts,
- observes a sentinel element with `IntersectionObserver`,
- on intersect, fetches the next page through a new authenticated route
  handler `app/api/posts/route.ts` (GET, proxies `senaraiPos` using the
  session cookie) - a route handler fits scroll-triggered GET pagination
  better than a Server Action here,
- stops observing once `next_cursor` is `null`, and shows an "end of feed"
  divider.

### Image upload flow

1. User picks up to 4 image files in `KomposerPos`.
2. For each file: call Server Action `mintaUploadURLAction(contentType)` →
   `{ upload_url, r2_key }` (thin wrapper over `mintaUploadURL`).
3. Browser does `fetch(upload_url, { method: "PUT", body: file })` directly
   to R2 - this call does **not** go through the BFF.
4. Collect all `r2_key`s; on submit, call `ciptaPosAction({ content,
   type, r2_keys })`.
5. Per-file upload/verification failure is shown inline next to that file
   (removable, doesn't block submitting the rest) - the backend rejects
   oversized/malformed images at `POST /posts` time (`storage` package),
   surfaced via the existing `ApiError` message.

### Announcements

`type === "announcement"` posts render with a `Badge` (existing
`components/ui/badge.tsx`) plus a subtle border/background tint on
`KadPos`. No separate feed section/tab. The composer's announcement toggle
only renders when `isManagement(profile)` is true; a 403 from the backend
(stale session/role change) surfaces through the normal action error path.

### New shadcn primitive

`components/ui/textarea.tsx` - does not exist yet, needed for composer and
comment/reply input. No `Dialog`/`Sheet` added; delete uses a simple
two-step confirm (e.g. button becomes "Padam? Sahkan" on first click)
instead of a modal.

## Error handling

- All mutations (create/edit/delete/comment) surface errors inline via the
  existing `KeadaanBorang` pattern, matching auth forms.
- Like/unlike is optimistic: UI flips immediately, reverts + `sonner` toast
  on failure (no form to show an inline error against).
- Empty feed / empty comments: centered plain-text message, no
  illustration - matches the app's current minimal style (no empty-state
  component exists yet, none introduced here).

## Testing

No test framework exists in `marc_next` today (no `*.test.ts` files). This
feature does not introduce one. Verification is manual: `bun run dev` +
browser walkthrough of the golden path (create post → like → comment →
reply → edit → delete) plus edge cases (oversized/invalid image rejected,
announcement toggle hidden for non-management, empty feed state).

## Out of scope (v1)

- Nested replies beyond one level (backend supports arbitrary
  `parent_comment_id` chains; UI only surfaces one level, per decision).
- Notifications UI (backend already writes `notifications` rows on
  like/comment; no notifications screen exists yet - separate module).
- Post search/filtering.
