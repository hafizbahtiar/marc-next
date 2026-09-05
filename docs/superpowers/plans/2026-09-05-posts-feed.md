# Post/Feed Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a member-facing feed to `marc_next` — browse posts, create posts (text + up to 4 images), edit/delete own posts, like/unlike posts and comments, comment with one level of replies, management-only announcements.

**Architecture:** Next.js App Router pages under `app/(dilindungi)/posts/`, backed by a `lib/posts/` data layer (`api.ts` thin backend wrappers, `actions.ts` Server Actions) that mirrors the existing `lib/auth/` structure exactly. The `marc_go` backend already implements every endpoint this feature calls — no backend changes.

**Tech Stack:** Next.js 16 (App Router, Server Actions, Route Handlers), React 19, TypeScript, Tailwind v4, shadcn/radix primitives, `sonner` for toasts, `bun` as package manager/runner. No test framework (none exists in this repo; per approved spec, verification is manual).

**Spec:** `docs/superpowers/specs/2026-09-05-posts-feed-design.md`

## Global Constraints

- Field names in all new types/API payloads are verbatim snake_case, copied from the Go backend's JSON tags — never camelCase (see `lib/api/types.ts` header comment).
- Every new server-side file that only runs on the server starts with `import "server-only";` (see `lib/auth/api.ts`, `lib/auth/session.ts`).
- Server Action files (`"use server"` at the top) may only export async functions — no top-level constants or types. Shared non-function types live in their own plain file (see `lib/auth/borang.ts`'s comment explaining why `KeadaanBorang`/`KEADAAN_AWAL` live outside `actions.ts`).
- No automated tests are added. Each task's verification step is: (a) `bunx tsc --noEmit` for type correctness, and (b) a concrete manual check via `bun run dev` in a browser. This matches the approved spec's Testing section — do not introduce a test framework as part of this work.
- **Do not run `git commit` for any step in this plan.** Every "commit" step in the template below is replaced with `git add <files>` (stage only) — the user stages changes themselves and commits when ready.
- Follow existing conventions exactly: `cn` imported from `"cn"` (re-exported by `lib/utils.ts`), Malay identifier names (`kad-pos.tsx`, `senaraiPos`, etc.) matching the rest of the codebase, `ApiError`/`ApiUnreachableError` from `lib/api/errors.ts` for all backend error handling.

---

### Task 1: Post/Comment types

**Files:**
- Modify: `lib/api/types.ts` (append after existing types)

**Interfaces:**
- Produces: `PostType`, `PostAuthor`, `Post`, `Comment`, `SenaraiPosRespons`, `SenaraiKomenRespons` — consumed by every task from Task 2 onward.

- [ ] **Step 1: Add the types**

Append to `lib/api/types.ts`:

```ts
/** `type` pada post — `postResponse.Type`, internal/http/handlers/posts_common.go. */
export type PostType = "normal" | "announcement";

/** Blok `author` sepunya pada post & comment — `authorResponse`. */
export type PostAuthor = {
  user_id: string;
  member_id: string;
  display_name: string | null;
  avatar_url: string | null;
};

/** GET /posts, GET /posts/:id, POST /posts, PATCH /posts/:id — `postResponse`. */
export type Post = {
  id: string;
  type: PostType;
  content: string;
  created_at: string;
  edited_at: string | null;
  author: PostAuthor;
  images: string[];
  like_count: number;
  comment_count: number;
  liked_by_me: boolean;
};

/** GET /posts/:id/comments, POST /posts/:id/comments, PATCH /comments/:id — `commentResponse`. */
export type Comment = {
  id: string;
  parent_comment_id: string | null;
  content: string;
  created_at: string;
  edited_at: string | null;
  author: PostAuthor;
  like_count: number;
  liked_by_me: boolean;
};

/** GET /posts — keyset pagination, `next_cursor` null pada halaman terakhir. */
export type SenaraiPosRespons = {
  posts: Post[];
  next_cursor: string | null;
};

/** GET /posts/:id/comments. */
export type SenaraiKomenRespons = {
  comments: Comment[];
};
```

- [ ] **Step 2: Type-check**

Run: `cd /Users/hafiz/Developments/marc_next && bunx tsc --noEmit`
Expected: no new errors (existing baseline errors, if any, are unaffected — this step only adds type declarations, nothing imports them yet).

- [ ] **Step 3: Stage**

```bash
git add lib/api/types.ts
```

---

### Task 2: Posts API client

**Files:**
- Create: `lib/posts/api.ts`

**Interfaces:**
- Consumes: `apiFetch<T>` from `lib/api/client.ts` (signature: `apiFetch<T>(path: string, { method?, body?, accessToken?, headers?, signal?, forwardedFor? }): Promise<T>`), `Post`, `Comment`, `PostType`, `SenaraiPosRespons`, `SenaraiKomenRespons` from Task 1.
- Produces: `senaraiPos`, `dapatkanPos`, `ciptaPos`, `kemaskiniPos`, `padamPos`, `sukaPos`, `nyahSukaPos`, `senaraiKomen`, `ciptaKomen`, `sukaKomen`, `nyahSukaKomen`, `mintaUploadURL` — consumed by Task 4 (`actions.ts`).

- [ ] **Step 1: Write the file**

```ts
import "server-only";

import { apiFetch } from "@/lib/api/client";
import type {
  Comment,
  Post,
  PostType,
  SenaraiKomenRespons,
  SenaraiPosRespons,
} from "@/lib/api/types";

/**
 * Pembalut nipis atas laluan `/posts`, `/comments` dan `/uploads/presign`
 * backend Go — padanan `lib/auth/api.ts` untuk domain post/feed.
 */

export function senaraiPos(
  accessToken: string,
  cursor?: string,
  limit = 20,
): Promise<SenaraiPosRespons> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set("cursor", cursor);
  return apiFetch<SenaraiPosRespons>(`/posts?${params.toString()}`, { accessToken });
}

export function dapatkanPos(accessToken: string, id: string): Promise<Post> {
  return apiFetch<Post>(`/posts/${id}`, { accessToken });
}

export function ciptaPos(
  accessToken: string,
  body: { type?: PostType; content: string; r2_keys?: string[] },
): Promise<Post> {
  return apiFetch<Post>("/posts", { method: "POST", body, accessToken });
}

export function kemaskiniPos(accessToken: string, id: string, content: string): Promise<Post> {
  return apiFetch<Post>(`/posts/${id}`, { method: "PATCH", body: { content }, accessToken });
}

export function padamPos(accessToken: string, id: string): Promise<void> {
  return apiFetch<void>(`/posts/${id}`, { method: "DELETE", accessToken });
}

export function sukaPos(accessToken: string, id: string): Promise<void> {
  return apiFetch<void>(`/posts/${id}/like`, { method: "POST", accessToken });
}

export function nyahSukaPos(accessToken: string, id: string): Promise<void> {
  return apiFetch<void>(`/posts/${id}/like`, { method: "DELETE", accessToken });
}

export function senaraiKomen(accessToken: string, postId: string): Promise<SenaraiKomenRespons> {
  return apiFetch<SenaraiKomenRespons>(`/posts/${postId}/comments`, { accessToken });
}

export function ciptaKomen(
  accessToken: string,
  postId: string,
  content: string,
  parentCommentId?: string,
): Promise<Comment> {
  return apiFetch<Comment>(`/posts/${postId}/comments`, {
    method: "POST",
    body: parentCommentId ? { content, parent_comment_id: parentCommentId } : { content },
    accessToken,
  });
}

export function sukaKomen(accessToken: string, id: string): Promise<void> {
  return apiFetch<void>(`/comments/${id}/like`, { method: "POST", accessToken });
}

export function nyahSukaKomen(accessToken: string, id: string): Promise<void> {
  return apiFetch<void>(`/comments/${id}/like`, { method: "DELETE", accessToken });
}

export function mintaUploadURL(
  accessToken: string,
  contentType: string,
): Promise<{ upload_url: string; r2_key: string }> {
  return apiFetch<{ upload_url: string; r2_key: string }>("/uploads/presign", {
    method: "POST",
    body: { content_type: contentType },
    accessToken,
  });
}
```

- [ ] **Step 2: Type-check**

Run: `cd /Users/hafiz/Developments/marc_next && bunx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Stage**

```bash
git add lib/posts/api.ts
```

---

### Task 3: `Textarea` UI primitive

**Files:**
- Create: `components/ui/textarea.tsx`

**Interfaces:**
- Produces: `Textarea` component — consumed by Task 8 (`komposer-pos.tsx`) and Task 10 (`senarai-komen.tsx`).

- [ ] **Step 1: Write the file**

Match the existing `components/ui/input.tsx` styling exactly (same border/focus/disabled/invalid tokens), sized for multi-line text:

```tsx
import * as React from "react"
import { cn } from "cn"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-20 w-full resize-y rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
```

- [ ] **Step 2: Type-check**

Run: `cd /Users/hafiz/Developments/marc_next && bunx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Stage**

```bash
git add components/ui/textarea.tsx
```

---

### Task 4: Posts result type + Server Actions

**Files:**
- Create: `lib/posts/hasil.ts`
- Create: `lib/posts/actions.ts`

**Interfaces:**
- Consumes: everything from Task 2 (`lib/posts/api.ts`), `accessToken` from `lib/auth/session.ts` (signature: `accessToken(): Promise<string | null>`), `ApiError`/`ApiUnreachableError` from `lib/api/errors.ts`, `Post`, `Comment`, `PostType` from Task 1.
- Produces: `HasilTindakan<T>` type; `ciptaPosAction`, `kemaskiniPosAction`, `padamPosAction`, `sukaPosAction`, `nyahSukaPosAction`, `ciptaKomenAction`, `sukaKomenAction`, `nyahSukaKomenAction`, `mintaUploadURLAction` — consumed by Task 6 (`butang-suka.tsx`), Task 7 (`kad-pos.tsx`), Task 8 (`komposer-pos.tsx`), Task 10 (`senarai-komen.tsx`).

- [ ] **Step 1: Write the result-type file**

```ts
/**
 * Keadaan pulangan bersama untuk tindakan pelayan modul post.
 *
 * Fail berasingan daripada `actions.ts` — fail `"use server"` hanya boleh
 * mengeksport fungsi async (lihat komen `KeadaanBorang` di lib/auth/borang.ts
 * untuk sebab yang sama).
 */
export type HasilTindakan<T = void> = { ok: true; data: T } | { ok: false; ralat: string };
```

Path: `lib/posts/hasil.ts`

- [ ] **Step 2: Write the actions file**

```ts
"use server";

import { revalidatePath } from "next/cache";

import { ApiError, ApiUnreachableError } from "@/lib/api/errors";
import type { Comment, Post, PostType } from "@/lib/api/types";
import { accessToken as bacaAccessToken } from "@/lib/auth/session";
import * as postsApi from "./api";
import type { HasilTindakan } from "./hasil";

async function token(): Promise<string> {
  const t = await bacaAccessToken();
  if (!t) throw new Error("Sesi tidak sah.");
  return t;
}

/** Tukar ralat lapisan API kepada mesej. Ralat tak dikenali dilempar semula. */
function ralatDaripada(error: unknown): string {
  if (error instanceof ApiError || error instanceof ApiUnreachableError) return error.message;
  throw error;
}

export async function ciptaPosAction(body: {
  type?: PostType;
  content: string;
  r2_keys?: string[];
}): Promise<HasilTindakan<Post>> {
  try {
    const post = await postsApi.ciptaPos(await token(), body);
    revalidatePath("/posts");
    return { ok: true, data: post };
  } catch (error) {
    return { ok: false, ralat: ralatDaripada(error) };
  }
}

export async function kemaskiniPosAction(id: string, content: string): Promise<HasilTindakan<Post>> {
  try {
    const post = await postsApi.kemaskiniPos(await token(), id, content);
    revalidatePath("/posts");
    revalidatePath(`/posts/${id}`);
    return { ok: true, data: post };
  } catch (error) {
    return { ok: false, ralat: ralatDaripada(error) };
  }
}

export async function padamPosAction(id: string): Promise<HasilTindakan> {
  try {
    await postsApi.padamPos(await token(), id);
    revalidatePath("/posts");
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, ralat: ralatDaripada(error) };
  }
}

export async function sukaPosAction(id: string): Promise<HasilTindakan> {
  try {
    await postsApi.sukaPos(await token(), id);
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, ralat: ralatDaripada(error) };
  }
}

export async function nyahSukaPosAction(id: string): Promise<HasilTindakan> {
  try {
    await postsApi.nyahSukaPos(await token(), id);
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, ralat: ralatDaripada(error) };
  }
}

export async function ciptaKomenAction(
  postId: string,
  content: string,
  parentCommentId?: string,
): Promise<HasilTindakan<Comment>> {
  try {
    const comment = await postsApi.ciptaKomen(await token(), postId, content, parentCommentId);
    revalidatePath(`/posts/${postId}`);
    return { ok: true, data: comment };
  } catch (error) {
    return { ok: false, ralat: ralatDaripada(error) };
  }
}

export async function sukaKomenAction(id: string): Promise<HasilTindakan> {
  try {
    await postsApi.sukaKomen(await token(), id);
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, ralat: ralatDaripada(error) };
  }
}

export async function nyahSukaKomenAction(id: string): Promise<HasilTindakan> {
  try {
    await postsApi.nyahSukaKomen(await token(), id);
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, ralat: ralatDaripada(error) };
  }
}

export async function mintaUploadURLAction(
  contentType: string,
): Promise<HasilTindakan<{ upload_url: string; r2_key: string }>> {
  try {
    const hasil = await postsApi.mintaUploadURL(await token(), contentType);
    return { ok: true, data: hasil };
  } catch (error) {
    return { ok: false, ralat: ralatDaripada(error) };
  }
}
```

Path: `lib/posts/actions.ts`

- [ ] **Step 3: Type-check**

Run: `cd /Users/hafiz/Developments/marc_next && bunx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 4: Stage**

```bash
git add lib/posts/hasil.ts lib/posts/actions.ts
```

---

### Task 5: Feed pagination route handler

**Files:**
- Create: `app/api/posts/route.ts`

**Interfaces:**
- Consumes: `senaraiPos` from Task 2, `accessToken` from `lib/auth/session.ts`, `ApiError`/`ApiUnreachableError` from `lib/api/errors.ts`.
- Produces: `GET /api/posts?cursor=` — JSON `SenaraiPosRespons` on success, `{ error: string }` with matching status on failure. Consumed by Task 9 (`suapan-pos.tsx`, client-side `fetch`).

- [ ] **Step 1: Write the file**

```ts
import { type NextRequest, NextResponse } from "next/server";

import { ApiError, ApiUnreachableError } from "@/lib/api/errors";
import { accessToken } from "@/lib/auth/session";
import { senaraiPos } from "@/lib/posts/api";

/**
 * Proksi halaman KEDUA dan seterusnya feed (GET /posts?cursor=).
 *
 * Halaman PERTAMA dimuat oleh `app/(dilindungi)/posts/page.tsx` (komponen
 * pelayan). Halaman berikutnya dicetuskan oleh scroll di klien — Server
 * Action tak sesuai untuk GET yang dipacu scroll (ia direka untuk
 * mutasi/borang), jadi laluan API biasa ini yang dipanggil terus daripada
 * `SuapanPos` guna `fetch`.
 */
export async function GET(request: NextRequest) {
  const token = await accessToken();
  if (!token) {
    return NextResponse.json({ error: "Sesi tidak sah." }, { status: 401 });
  }

  const cursor = request.nextUrl.searchParams.get("cursor") ?? undefined;

  try {
    const hasil = await senaraiPos(token, cursor);
    return NextResponse.json(hasil, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof ApiUnreachableError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    throw error;
  }
}
```

- [ ] **Step 2: Type-check**

Run: `cd /Users/hafiz/Developments/marc_next && bunx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Stage**

```bash
git add app/api/posts/route.ts
```

---

### Task 6: Mount `<Toaster />` + `ButangSuka` (like button)

**Files:**
- Modify: `app/layout.tsx`
- Create: `components/posts/butang-suka.tsx`

**Interfaces:**
- Consumes: `Toaster` from `components/ui/sonner.tsx` (no props needed — already themed internally); `Button` from `components/ui/button.tsx`; `HasilTindakan` from Task 4.
- Produces: `ButangSuka` component with props `{ id: string; kiraanAwal: number; disukaAwal: boolean; suka: (id: string) => Promise<HasilTindakan>; nyahSuka: (id: string) => Promise<HasilTindakan> }` — consumed by Task 7 (`kad-pos.tsx`, bound to `sukaPosAction`/`nyahSukaPosAction`) and Task 10 (`senarai-komen.tsx`, bound to `sukaKomenAction`/`nyahSukaKomenAction`).

`sonner`'s `<Toaster />` exists as a component in this repo already (`components/ui/sonner.tsx`) but is never rendered — no toast currently shows anywhere in the app. This task mounts it globally since `ButangSuka` is the first consumer of `toast()`.

- [ ] **Step 1: Mount the Toaster**

In `app/layout.tsx`, add the import and render `<Toaster />` once, inside `<body>`, after `{children}`:

```tsx
import { Toaster } from "@/components/ui/sonner";
```

```tsx
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster />
      </body>
```

- [ ] **Step 2: Write `ButangSuka`**

```tsx
"use client";

import { useState, useTransition } from "react";
import { HeartIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { HasilTindakan } from "@/lib/posts/hasil";

/**
 * Butang suka generik — dikongsi antara post dan comment. Ia tak tahu
 * yang mana satu; pemanggil hantar `suka`/`nyahSuka` (tindakan pelayan
 * yang betul untuk jenis entiti itu) sebagai prop.
 */
export function ButangSuka({
  id,
  kiraanAwal,
  disukaAwal,
  suka,
  nyahSuka,
}: {
  id: string;
  kiraanAwal: number;
  disukaAwal: boolean;
  suka: (id: string) => Promise<HasilTindakan>;
  nyahSuka: (id: string) => Promise<HasilTindakan>;
}) {
  const [disuka, setDisuka] = useState(disukaAwal);
  const [kiraan, setKiraan] = useState(kiraanAwal);
  const [pending, startTransition] = useTransition();

  function togol() {
    const disukaBaharu = !disuka;
    setDisuka(disukaBaharu);
    setKiraan((k) => k + (disukaBaharu ? 1 : -1));

    startTransition(async () => {
      const hasil = disukaBaharu ? await suka(id) : await nyahSuka(id);
      if (!hasil.ok) {
        // Undur balik keadaan optimistik — permintaan sebenar gagal.
        setDisuka(!disukaBaharu);
        setKiraan((k) => k - (disukaBaharu ? 1 : -1));
        toast.error(hasil.ralat);
      }
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={togol}
      aria-pressed={disuka}
    >
      <HeartIcon className={cn("size-4", disuka && "fill-primary text-primary")} />
      {kiraan}
    </Button>
  );
}
```

Path: `components/posts/butang-suka.tsx`

- [ ] **Step 3: Type-check**

Run: `cd /Users/hafiz/Developments/marc_next && bunx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 4: Manual verification**

Run: `cd /Users/hafiz/Developments/marc_next && bun run dev`
This component has no page yet — visual verification happens in Task 11/12. For now, confirm the dev server starts with no console errors from the `Toaster` mount (visit any existing page, e.g. `/`, and check the browser console is clean).

- [ ] **Step 5: Stage**

```bash
git add app/layout.tsx components/posts/butang-suka.tsx
```

---

### Task 7: `KadPos` (post card)

**Files:**
- Create: `components/posts/kad-pos.tsx`

**Interfaces:**
- Consumes: `Post`, `Profile` from `lib/api/types.ts` (`isManagement(profile: Profile): boolean`), `ButangSuka` from Task 6, `sukaPosAction`/`nyahSukaPosAction`/`kemaskiniPosAction`/`padamPosAction` from Task 4, `Avatar`/`AvatarImage`/`AvatarFallback` from `components/ui/avatar.tsx`, `Badge` from `components/ui/badge.tsx`, `Button` from `components/ui/button.tsx`, `Textarea` from Task 3.
- Produces: `KadPos` component with props `{ post: Post; profileSemasa: Profile; pautanKeDetail?: boolean }` — consumed by Task 9 (`suapan-pos.tsx`, `pautanKeDetail: true`) and Task 12 (post detail page, `pautanKeDetail: false`).

- [ ] **Step 1: Write the file**

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { ButangSuka } from "@/components/posts/butang-suka";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { isManagement } from "@/lib/api/types";
import type { Post, Profile } from "@/lib/api/types";
import { kemaskiniPosAction, padamPosAction, sukaPosAction, nyahSukaPosAction } from "@/lib/posts/actions";

export function KadPos({
  post,
  profileSemasa,
  pautanKeDetail = true,
}: {
  post: Post;
  profileSemasa: Profile;
  pautanKeDetail?: boolean;
}) {
  const [menyunting, setMenyunting] = useState(false);
  const [kandungan, setKandungan] = useState(post.content);
  const [sahkanPadam, setSahkanPadam] = useState(false);
  const [pending, setPending] = useState(false);

  // Pemilik SENTIASA boleh edit/padam post sendiri; padam sahaja
  // dibenarkan untuk management pada post orang lain (canModify, backend).
  const bolehEdit = post.author.member_id === profileSemasa.member_id;
  const bolehPadam = bolehEdit || isManagement(profileSemasa);

  async function simpanEdit() {
    setPending(true);
    const hasil = await kemaskiniPosAction(post.id, kandungan.trim());
    setPending(false);
    if (!hasil.ok) {
      toast.error(hasil.ralat);
      return;
    }
    setMenyunting(false);
  }

  async function padam() {
    setPending(true);
    const hasil = await padamPosAction(post.id);
    setPending(false);
    if (!hasil.ok) {
      toast.error(hasil.ralat);
      setSahkanPadam(false);
    }
    // Berjaya: `revalidatePath` dalam tindakan sudah memaksa senarai
    // muat semula, jadi kad ini akan hilang tanpa navigasi manual.
  }

  const nama = post.author.display_name?.trim() || post.author.member_id;

  return (
    <article className="grid gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Avatar size="sm">
            {post.author.avatar_url ? <AvatarImage src={post.author.avatar_url} alt="" /> : null}
            <AvatarFallback>{nama.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="flex items-center gap-2 text-sm font-medium">
              {nama}
              {post.type === "announcement" ? (
                <Badge variant="secondary" className="text-primary">
                  Pengumuman
                </Badge>
              ) : null}
            </p>
            <p className="text-xs text-muted-foreground">{tarikhSingkat(post.created_at)}</p>
          </div>
        </div>
      </header>

      {menyunting ? (
        <div className="grid gap-2">
          <Textarea
            value={kandungan}
            onChange={(e) => setKandungan(e.target.value)}
            maxLength={10000}
            disabled={pending}
          />
          <div className="flex gap-2">
            <Button type="button" size="sm" onClick={simpanEdit} disabled={pending || !kandungan.trim()}>
              Simpan
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setKandungan(post.content);
                setMenyunting(false);
              }}
              disabled={pending}
            >
              Batal
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm whitespace-pre-wrap">
          {pautanKeDetail ? (
            <Link href={`/posts/${post.id}`} className="hover:underline">
              {post.content}
            </Link>
          ) : (
            post.content
          )}
        </p>
      )}

      {post.images.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {post.images.map((url) => (
            // eslint-disable-next-line @next/next/no-img-element -- URL R2 bertandatangan, luput; next/image cache tak sesuai.
            <img key={url} src={url} alt="" className="aspect-video w-full rounded-lg object-cover" />
          ))}
        </div>
      ) : null}

      <footer className="flex items-center gap-2">
        <ButangSuka
          id={post.id}
          kiraanAwal={post.like_count}
          disukaAwal={post.liked_by_me}
          suka={sukaPosAction}
          nyahSuka={nyahSukaPosAction}
        />
        <Link
          href={`/posts/${post.id}`}
          className="rounded-lg px-2.5 py-1 text-sm text-muted-foreground hover:bg-muted"
        >
          {post.comment_count} komen
        </Link>

        {!menyunting && bolehEdit ? (
          <Button type="button" size="sm" variant="ghost" className="ml-auto" onClick={() => setMenyunting(true)}>
            Edit
          </Button>
        ) : null}
        {bolehPadam ? (
          sahkanPadam ? (
            <Button type="button" size="sm" variant="destructive" onClick={padam} disabled={pending}>
              Padam? Sahkan
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className={bolehEdit ? "" : "ml-auto"}
              onClick={() => setSahkanPadam(true)}
            >
              Padam
            </Button>
          )
        ) : null}
      </footer>
    </article>
  );
}

function tarikhSingkat(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("ms-MY", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kuala_Lumpur",
  }).format(d);
}
```

Note on ownership check: `post.author.member_id` (human-readable ID) is compared against `profileSemasa.member_id` — both come from the same `profiles.member_id` column, so this is a safe equality check (`Profile` has no `user_id` field to compare against instead).

- [ ] **Step 2: Type-check**

Run: `cd /Users/hafiz/Developments/marc_next && bunx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Stage**

```bash
git add components/posts/kad-pos.tsx
```

---

### Task 8: `KomposerPos` (create-post composer with image upload)

**Files:**
- Create: `components/posts/komposer-pos.tsx`

**Interfaces:**
- Consumes: `ciptaPosAction`, `mintaUploadURLAction` from Task 4, `Textarea` from Task 3, `Checkbox`/`Button` from `components/ui/`, `isManagement`/`Profile` from `lib/api/types.ts`.
- Produces: `KomposerPos` component with props `{ profile: Profile }` — consumed by Task 11 (feed page).

- [ ] **Step 1: Write the file**

```tsx
"use client";

import { useRef, useState, useTransition } from "react";
import { ImagePlusIcon, XIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { isManagement } from "@/lib/api/types";
import type { Profile } from "@/lib/api/types";
import { ciptaPosAction, mintaUploadURLAction } from "@/lib/posts/actions";

const JENIS_DIBENARKAN = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAKS_GAMBAR = 4;

type FailGambar = { file: File; preview: string; ralat?: string };

export function KomposerPos({ profile }: { profile: Profile }) {
  const [kandungan, setKandungan] = useState("");
  const [pengumuman, setPengumuman] = useState(false);
  const [gambar, setGambar] = useState<FailGambar[]>([]);
  const [ralat, setRalat] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const inputFailRef = useRef<HTMLInputElement>(null);

  function tambahFail(fail: FileList | null) {
    if (!fail) return;
    const baharu: FailGambar[] = [];
    for (const f of Array.from(fail)) {
      if (gambar.length + baharu.length >= MAKS_GAMBAR) break;
      baharu.push({
        file: f,
        preview: URL.createObjectURL(f),
        ralat: JENIS_DIBENARKAN.has(f.type) ? undefined : "Jenis fail tidak disokong.",
      });
    }
    setGambar((g) => [...g, ...baharu]);
    if (inputFailRef.current) inputFailRef.current.value = "";
  }

  function buangFail(index: number) {
    setGambar((g) => {
      URL.revokeObjectURL(g[index].preview);
      return g.filter((_, i) => i !== index);
    });
  }

  function hantar() {
    if (!kandungan.trim()) {
      setRalat("Tulis sesuatu dahulu.");
      return;
    }
    if (gambar.some((g) => g.ralat)) {
      setRalat("Buang gambar yang tidak disokong dahulu.");
      return;
    }
    setRalat(null);

    startTransition(async () => {
      const r2Keys: string[] = [];
      for (const g of gambar) {
        const hasilPresign = await mintaUploadURLAction(g.file.type);
        if (!hasilPresign.ok) {
          setRalat(hasilPresign.ralat);
          return;
        }
        try {
          const respons = await fetch(hasilPresign.data.upload_url, {
            method: "PUT",
            headers: { "Content-Type": g.file.type },
            body: g.file,
          });
          if (!respons.ok) throw new Error("upload gagal");
        } catch {
          setRalat(`Gagal upload ${g.file.name}.`);
          return;
        }
        r2Keys.push(hasilPresign.data.r2_key);
      }

      const hasil = await ciptaPosAction({
        type: pengumuman ? "announcement" : "normal",
        content: kandungan.trim(),
        r2_keys: r2Keys,
      });
      if (!hasil.ok) {
        setRalat(hasil.ralat);
        return;
      }

      setKandungan("");
      setPengumuman(false);
      gambar.forEach((g) => URL.revokeObjectURL(g.preview));
      setGambar([]);
      toast.success("Post dihantar.");
    });
  }

  return (
    <div className="grid gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <Textarea
        placeholder="Kongsi sesuatu…"
        value={kandungan}
        onChange={(e) => setKandungan(e.target.value)}
        maxLength={10000}
        disabled={pending}
      />

      {gambar.length > 0 ? (
        <div className="grid grid-cols-4 gap-2">
          {gambar.map((g, i) => (
            <div key={g.preview} className="relative aspect-square overflow-hidden rounded-lg ring-1 ring-foreground/10">
              {/* eslint-disable-next-line @next/next/no-img-element -- pratonton blob: tempatan, bukan aset dioptimumkan. */}
              <img src={g.preview} alt="" className="size-full object-cover" />
              <button
                type="button"
                onClick={() => buangFail(i)}
                className="absolute top-1 right-1 grid size-5 place-items-center rounded-full bg-background/80"
                aria-label="Buang gambar"
              >
                <XIcon className="size-3" />
              </button>
              {g.ralat ? (
                <p className="absolute inset-x-0 bottom-0 bg-destructive/90 px-1 py-0.5 text-[10px] text-destructive-foreground">
                  {g.ralat}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {ralat ? <p className="text-sm text-destructive">{ralat}</p> : null}

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={pending || gambar.length >= MAKS_GAMBAR}
            onClick={() => inputFailRef.current?.click()}
            aria-label="Tambah gambar"
          >
            <ImagePlusIcon />
          </Button>
          <input
            ref={inputFailRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => tambahFail(e.target.files)}
          />

          {isManagement(profile) ? (
            <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Checkbox
                checked={pengumuman}
                onCheckedChange={(v) => setPengumuman(v === true)}
                disabled={pending}
              />
              Pengumuman
            </label>
          ) : null}
        </div>

        <Button type="button" onClick={hantar} disabled={pending}>
          {pending ? "Menghantar…" : "Hantar"}
        </Button>
      </div>
    </div>
  );
}
```

Path: `components/posts/komposer-pos.tsx`

- [ ] **Step 2: Type-check**

Run: `cd /Users/hafiz/Developments/marc_next && bunx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Stage**

```bash
git add components/posts/komposer-pos.tsx
```

---

### Task 9: `SuapanPos` (infinite-scroll feed list)

**Files:**
- Create: `components/posts/suapan-pos.tsx`

**Interfaces:**
- Consumes: `Post`, `Profile`, `SenaraiPosRespons` from `lib/api/types.ts`, `KadPos` from Task 7, `GET /api/posts?cursor=` from Task 5.
- Produces: `SuapanPos` component with props `{ posHalamanPertama: Post[]; cursorSeterusnya: string | null; profileSemasa: Profile }` — consumed by Task 11 (feed page).

- [ ] **Step 1: Write the file**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";

import { KadPos } from "@/components/posts/kad-pos";
import type { Post, Profile, SenaraiPosRespons } from "@/lib/api/types";

export function SuapanPos({
  posHalamanPertama,
  cursorSeterusnya,
  profileSemasa,
}: {
  posHalamanPertama: Post[];
  cursorSeterusnya: string | null;
  profileSemasa: Profile;
}) {
  const [pos, setPos] = useState(posHalamanPertama);
  const [cursor, setCursor] = useState(cursorSeterusnya);
  const [memuat, setMemuat] = useState(false);
  const [ralat, setRalat] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cursor) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) muatHalamanSeterusnya();
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- muatHalamanSeterusnya ditakrif semula setiap render dengan sengaja (baca `cursor`/`memuat` terkini); observer dipasang semula bila `cursor` berubah, yang cukup untuk elak pemasangan berulang tanpa henti.
  }, [cursor]);

  async function muatHalamanSeterusnya() {
    if (memuat || !cursor) return;
    setMemuat(true);
    setRalat(null);
    try {
      const respons = await fetch(`/api/posts?cursor=${encodeURIComponent(cursor)}`, {
        cache: "no-store",
      });
      if (!respons.ok) {
        const badan = (await respons.json().catch(() => null)) as { error?: string } | null;
        throw new Error(badan?.error ?? "Gagal muat post.");
      }
      const data = (await respons.json()) as SenaraiPosRespons;
      setPos((p) => [...p, ...data.posts]);
      setCursor(data.next_cursor);
    } catch (error) {
      setRalat(error instanceof Error ? error.message : "Gagal muat post.");
    } finally {
      setMemuat(false);
    }
  }

  if (pos.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Belum ada post lagi.
      </p>
    );
  }

  return (
    <div className="grid gap-4">
      {pos.map((p) => (
        <KadPos key={p.id} post={p} profileSemasa={profileSemasa} pautanKeDetail />
      ))}

      {cursor ? (
        <div ref={sentinelRef} className="py-4 text-center text-sm text-muted-foreground">
          {ralat ? (
            <button type="button" onClick={muatHalamanSeterusnya} className="underline">
              {ralat} — cuba lagi
            </button>
          ) : memuat ? (
            "Memuat…"
          ) : null}
        </div>
      ) : (
        <p className="py-4 text-center text-xs text-muted-foreground">— hujung feed —</p>
      )}
    </div>
  );
}
```

Path: `components/posts/suapan-pos.tsx`

- [ ] **Step 2: Type-check**

Run: `cd /Users/hafiz/Developments/marc_next && bunx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Stage**

```bash
git add components/posts/suapan-pos.tsx
```

---

### Task 10: `SenaraiKomen` (comments + one level of replies)

**Files:**
- Create: `components/posts/senarai-komen.tsx`

**Interfaces:**
- Consumes: `Comment`, `Profile` from `lib/api/types.ts`, `ButangSuka` from Task 6, `ciptaKomenAction`/`sukaKomenAction`/`nyahSukaKomenAction` from Task 4, `Textarea`/`Button`/`Avatar` from `components/ui/`.
- Produces: `SenaraiKomen` component with props `{ postId: string; komenAwal: Comment[]; profileSemasa: Profile }` — consumed by Task 12 (post detail page).

- [ ] **Step 1: Write the file**

```tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";

import { ButangSuka } from "@/components/posts/butang-suka";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Comment, Profile } from "@/lib/api/types";
import { ciptaKomenAction, sukaKomenAction, nyahSukaKomenAction } from "@/lib/posts/actions";

export function SenaraiKomen({
  postId,
  komenAwal,
  profileSemasa,
}: {
  postId: string;
  komenAwal: Comment[];
  profileSemasa: Profile;
}) {
  const [komen, setKomen] = useState(komenAwal);

  function tambahKomen(baharu: Comment) {
    setKomen((k) => [...k, baharu]);
  }

  const utama = komen.filter((k) => !k.parent_comment_id);
  const balasanBagiInduk = (indukId: string) => komen.filter((k) => k.parent_comment_id === indukId);

  return (
    <div className="grid gap-4">
      <BorangKomen postId={postId} onHantar={tambahKomen} />

      {utama.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">Belum ada komen.</p>
      ) : (
        <div className="grid gap-4">
          {utama.map((k) => (
            <div key={k.id} className="grid gap-3">
              <BarisKomen komen={k} />
              {balasanBagiInduk(k.id).length > 0 ? (
                <div className="ml-8 grid gap-3 border-l border-border/70 pl-3">
                  {balasanBagiInduk(k.id).map((balasan) => (
                    <BarisKomen key={balasan.id} komen={balasan} />
                  ))}
                </div>
              ) : null}
              <div className="ml-8">
                <BorangBalas postId={postId} parentCommentId={k.id} onHantar={tambahKomen} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BarisKomen({ komen }: { komen: Comment }) {
  const nama = komen.author.display_name?.trim() || komen.author.member_id;
  return (
    <div className="flex items-start gap-2.5">
      <Avatar size="sm">
        {komen.author.avatar_url ? <AvatarImage src={komen.author.avatar_url} alt="" /> : null}
        <AvatarFallback>{nama.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="text-sm">
          <span className="font-medium">{nama}</span>{" "}
          <span className="whitespace-pre-wrap">{komen.content}</span>
        </p>
        <ButangSuka
          id={komen.id}
          kiraanAwal={komen.like_count}
          disukaAwal={komen.liked_by_me}
          suka={sukaKomenAction}
          nyahSuka={nyahSukaKomenAction}
        />
      </div>
    </div>
  );
}

function BorangKomen({
  postId,
  onHantar,
}: {
  postId: string;
  onHantar: (komen: Comment) => void;
}) {
  const [isi, setIsi] = useState("");
  const [pending, setPending] = useState(false);

  async function hantar() {
    if (!isi.trim()) return;
    setPending(true);
    const hasil = await ciptaKomenAction(postId, isi.trim());
    setPending(false);
    if (!hasil.ok) {
      toast.error(hasil.ralat);
      return;
    }
    onHantar(hasil.data);
    setIsi("");
  }

  return (
    <div className="grid gap-2">
      <Textarea
        placeholder="Tulis komen…"
        value={isi}
        onChange={(e) => setIsi(e.target.value)}
        maxLength={2000}
        disabled={pending}
        className="min-h-14"
      />
      <Button type="button" size="sm" className="justify-self-end" onClick={hantar} disabled={pending || !isi.trim()}>
        {pending ? "Menghantar…" : "Hantar komen"}
      </Button>
    </div>
  );
}

function BorangBalas({
  postId,
  parentCommentId,
  onHantar,
}: {
  postId: string;
  parentCommentId: string;
  onHantar: (komen: Comment) => void;
}) {
  const [terbuka, setTerbuka] = useState(false);
  const [isi, setIsi] = useState("");
  const [pending, setPending] = useState(false);

  async function hantar() {
    if (!isi.trim()) return;
    setPending(true);
    const hasil = await ciptaKomenAction(postId, isi.trim(), parentCommentId);
    setPending(false);
    if (!hasil.ok) {
      toast.error(hasil.ralat);
      return;
    }
    onHantar(hasil.data);
    setIsi("");
    setTerbuka(false);
  }

  if (!terbuka) {
    return (
      <button type="button" onClick={() => setTerbuka(true)} className="text-xs text-muted-foreground hover:underline">
        Balas
      </button>
    );
  }

  return (
    <div className="grid gap-2">
      <Textarea
        placeholder="Tulis balasan…"
        value={isi}
        onChange={(e) => setIsi(e.target.value)}
        maxLength={2000}
        disabled={pending}
        className="min-h-14"
      />
      <div className="flex justify-end gap-2">
        <Button type="button" size="sm" variant="ghost" onClick={() => setTerbuka(false)} disabled={pending}>
          Batal
        </Button>
        <Button type="button" size="sm" onClick={hantar} disabled={pending || !isi.trim()}>
          {pending ? "Menghantar…" : "Hantar"}
        </Button>
      </div>
    </div>
  );
}
```

Note: `resolveParentCommentID` on the backend already flattens deeper replies onto the top-level parent (see `internal/http/handlers/comments.go`), so `parent_comment_id` on every reply this UI creates is always a top-level comment's ID — the `balasanBagiInduk` grouping above is exhaustive for one level, matching the backend's own invariant.

Path: `components/posts/senarai-komen.tsx`

- [ ] **Step 2: Type-check**

Run: `cd /Users/hafiz/Developments/marc_next && bunx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Stage**

```bash
git add components/posts/senarai-komen.tsx
```

---

### Task 11: Feed page

**Files:**
- Create: `app/(dilindungi)/posts/page.tsx`

**Interfaces:**
- Consumes: `wajibSesi` from `lib/auth/session.ts` (returns `{ accessToken: string; profile: Profile }`), `senaraiPos` from Task 2, `KomposerPos` from Task 8, `SuapanPos` from Task 9.

- [ ] **Step 1: Write the file**

```tsx
import { KomposerPos } from "@/components/posts/komposer-pos";
import { SuapanPos } from "@/components/posts/suapan-pos";
import { senaraiPos } from "@/lib/posts/api";
import { wajibSesi } from "@/lib/auth/session";

export default async function PosPage() {
  const { accessToken, profile } = await wajibSesi();
  const { posts, next_cursor } = await senaraiPos(accessToken);

  return (
    <div className="grid gap-6">
      <header>
        <h1 className="font-heading text-[1.75rem] font-semibold tracking-tight text-balance">
          Feed
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Kongsi dan lihat perkongsian ahli lain.
        </p>
      </header>

      <KomposerPos profile={profile} />

      <SuapanPos posHalamanPertama={posts} cursorSeterusnya={next_cursor} profileSemasa={profile} />
    </div>
  );
}
```

Path: `app/(dilindungi)/posts/page.tsx`

- [ ] **Step 2: Type-check**

Run: `cd /Users/hafiz/Developments/marc_next && bunx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Manual verification**

Run: `cd /Users/hafiz/Developments/marc_next && bun run dev`, log in as a member with an approved/verified account, navigate to `/posts` in the browser.

Check:
- Composer renders; typing + submitting a text-only post shows it in the feed without a full reload (revalidation), and a "Post dihantar." toast appears.
- Picking 1–2 valid images (jpeg/png/webp) previews them, removing one works, submitting attaches them (visible on the created post).
- Picking a non-image file (e.g. a `.pdf`) shows the inline "Jenis fail tidak disokong." error under that thumbnail and blocks submit until removed.
- If logged in as a non-management member: no "Pengumuman" checkbox is visible. If logged in as management: checking it and posting shows the post with the "Pengumuman" badge.
- Liking a post flips the heart and count immediately; unliking reverts it.
- With more than 20 posts in the DB (or `limit` temporarily lowered for testing), scrolling to the bottom loads more posts automatically; reaching the actual end shows "— hujung feed —".

- [ ] **Step 4: Stage**

```bash
git add "app/(dilindungi)/posts/page.tsx"
```

---

### Task 12: Post detail page

**Files:**
- Create: `app/(dilindungi)/posts/[id]/page.tsx`

**Interfaces:**
- Consumes: `wajibSesi` from `lib/auth/session.ts`, `dapatkanPos`/`senaraiKomen` from Task 2, `KadPos` from Task 7, `SenarKomen` from Task 10.

- [ ] **Step 1: Write the file**

```tsx
import { notFound } from "next/navigation";

import { KadPos } from "@/components/posts/kad-pos";
import { SenaraiKomen } from "@/components/posts/senarai-komen";
import { ApiError } from "@/lib/api/errors";
import type { Comment, Post } from "@/lib/api/types";
import { dapatkanPos, senaraiKomen } from "@/lib/posts/api";
import { wajibSesi } from "@/lib/auth/session";

export default async function PosDetailPage({ params }: PageProps<"/posts/[id]">) {
  const { id } = await params;
  const { accessToken, profile } = await wajibSesi();

  let pos: Post;
  let komen: Comment[];
  try {
    [pos, { comments: komen }] = await Promise.all([
      dapatkanPos(accessToken, id),
      senaraiKomen(accessToken, id),
    ]);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return (
    <div className="grid gap-6">
      <KadPos post={pos} profileSemasa={profile} pautanKeDetail={false} />

      <div>
        <h2 className="font-heading text-lg font-semibold">Komen</h2>
        <div className="mt-4">
          <SenaraiKomen postId={pos.id} komenAwal={komen} profileSemasa={profile} />
        </div>
      </div>
    </div>
  );
}
```

Path: `app/(dilindungi)/posts/[id]/page.tsx`

Note: `PageProps<"/posts/[id]">` is Next.js 16's generated typed route helper (same pattern as `LayoutProps<"/">` already used in `app/(dilindungi)/layout.tsx`) — no manual `params` typing needed.

- [ ] **Step 2: Type-check**

Run: `cd /Users/hafiz/Developments/marc_next && bunx tsc --noEmit`
Expected: no new errors. If `PageProps<"/posts/[id]">` isn't recognized, fall back to `{ params }: { params: Promise<{ id: string }> }` — check `app/(auth)/tetap-kata-laluan/page.tsx` or similar for how this repo currently types dynamic route params.

- [ ] **Step 3: Manual verification**

With the dev server running, navigate to `/posts`, click a post's comment count link to reach its detail page.

Check:
- Post content, images, like button, and edit/delete affordances (if owner) render identically to the feed card.
- Commenting adds the comment to the list immediately (no reload) with author name/avatar.
- Clicking "Balas" under a top-level comment opens a reply box; submitting shows the reply indented under that comment.
- Replying is only offered under top-level comments, never under a reply (matches one-level nesting).
- Liking a comment flips independently of the post's like button.
- Visiting `/posts/<invalid-uuid-or-nonexistent-id>` renders the app's not-found page instead of crashing.

- [ ] **Step 4: Stage**

```bash
git add "app/(dilindungi)/posts/[id]/page.tsx"
```

---

### Task 13: Nav link + `ROUTES.pos`

**Files:**
- Modify: `lib/auth/routes.ts`
- Modify: `components/marc/rangka-aplikasi.tsx`

**Interfaces:**
- Consumes: `ROUTES` object from `lib/auth/routes.ts`.
- Produces: `ROUTES.pos = "/posts"`, and a "Feed" link in the app header.

- [ ] **Step 1: Add the route constant**

In `lib/auth/routes.ts`, add `pos: "/posts",` to the `ROUTES` object (after `utama: "/",`):

```ts
  utama: "/",
  pos: "/posts",
```

- [ ] **Step 2: Add the nav link**

In `components/marc/rangka-aplikasi.tsx`, add a "Feed" link next to the logo. Replace:

```tsx
          <Link href={ROUTES.utama} className="flex items-center gap-2.5">
            <Logo varian="jata" className="h-8" />
            <span className="text-base font-semibold tracking-[0.14em]">MARC</span>
          </Link>

          <div className="flex items-center gap-3">
```

with:

```tsx
          <Link href={ROUTES.utama} className="flex items-center gap-2.5">
            <Logo varian="jata" className="h-8" />
            <span className="text-base font-semibold tracking-[0.14em]">MARC</span>
          </Link>

          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link href={ROUTES.pos} className="text-muted-foreground hover:text-foreground">
              Feed
            </Link>
          </nav>

          <div className="flex items-center gap-3">
```

This inserts a `<nav>` between the logo and the right-side profile/theme/logout cluster; the existing `justify-between` on the header's flex container keeps the logo pinned left and the profile cluster pinned right, with the new nav sitting in the middle — confirm this reads correctly in the browser (Step 4) and adjust to `justify-start`/explicit `gap` on the outer container if the middle nav collides with either side at narrow widths.

- [ ] **Step 3: Type-check**

Run: `cd /Users/hafiz/Developments/marc_next && bunx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 4: Manual verification**

With the dev server running, log in and check the header at both a wide (desktop) and narrow (mobile, ~375px) viewport width:
- "Feed" link is visible and navigates to `/posts`.
- The header doesn't overflow or wrap awkwardly at 375px — if it does, wrap the nav in `hidden sm:flex` (matching how the existing name/role block already hides at `sm:block`) so it disappears on narrow screens rather than breaking layout, and note that as a follow-up if a mobile nav is wanted later.

- [ ] **Step 5: Stage**

```bash
git add lib/auth/routes.ts components/marc/rangka-aplikasi.tsx
```

---

## Full golden-path verification (after all tasks)

Run: `cd /Users/hafiz/Developments/marc_next && bun run build`
Expected: production build succeeds (catches any type/lint issue that per-task `tsc --noEmit` checks might miss, e.g. Next.js route typing).

Then `bun run dev`, log in, and walk the complete golden path in one session:
create post with 2 images → like it → comment → reply to the comment → like the reply → edit the post → delete the post (confirm it disappears from the feed).
