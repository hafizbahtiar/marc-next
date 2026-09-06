# Profile & Settings Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a profile view page, a profile edit page (with avatar upload), and a settings hub to `marc_next`, matching the scope of the approved spec.

**Architecture:** Server-rendered pages under `app/(dilindungi)/profil/` and `app/(dilindungi)/tetapan/`, backed by a `lib/profil/` data layer (`api.ts` thin backend wrapper, `actions.ts` Server Action, `schemas.ts` Zod validation) mirroring `lib/auth/`'s existing structure. Avatar upload reuses the posts module's generic presign action (`mintaUploadURLAction` in `lib/posts/actions.ts`) rather than duplicating it. The `marc_go` backend already implements every endpoint this feature calls (`GET/PATCH /me`, `POST /uploads/presign`, `POST /auth/logout-all`, `GET /me/sessions`) - no backend changes.

**Tech Stack:** Next.js 16 (App Router, Server Actions), React 19, TypeScript, Tailwind v4, shadcn/radix primitives, Zod, `bun`.

**Spec:** `docs/superpowers/specs/2026-09-06-profil-tetapan-design.md`

## Global Constraints

- Field names in all API payloads are verbatim snake_case, copied from the Go backend's JSON tags - never camelCase (see `lib/api/types.ts` header comment; `Profile` type already covers every field this feature needs, no new types required).
- Every new server-side-only file starts with `import "server-only";`.
- Server Action files (`"use server"` at the top) may only export async functions - no top-level constants or types.
- This slice uses `KeadaanBorang`/`useActionState` (from `lib/auth/borang.ts`, already shared infrastructure) for the edit-profile form - NOT the posts module's `HasilTindakan` pattern. This is a classic single-submit form, unlike the posts composer's multi-step list-mutation flow.
- Backend `PATCH /me` limits (validate client-side to match exactly): `display_name` ≤100 chars, `phone`/`emergency_contact_phone` ≤30 chars and must pass `normalkanTelefonMY` if non-empty, `emergency_contact_name` ≤100 chars, `health_notes` ≤500 chars. Empty string clears a field; the edit form always submits every field (never omits one for "unchanged"), since the form is always fully seeded with current values.
- No automated tests exist in this repo and none are being added - do not flag missing test coverage as a defect; this is an explicit, approved decision carried over from the posts module's spec.
- Follow existing conventions exactly: `cn` imported from `"cn"`, Malay identifier names, `ApiError`/`ApiUnreachableError` from `lib/api/errors.ts` for backend error handling, ROUTES named once in `lib/auth/routes.ts`.
- Work directly on the current branch (`staging`), no worktree. Every "commit" step in the task template below is replaced with `git add <files>` (stage only) - the user stages/commits at their own pace.

---

### Task 1: `ROUTES.profilEdit` + Zod schema

**Files:**
- Modify: `lib/auth/routes.ts`
- Create: `lib/profil/schemas.ts`

**Interfaces:**
- Consumes: `normalkanTelefonMY(raw: string): string | null` from `lib/auth/phone.ts`.
- Produces: `ROUTES.profilEdit = "/profil/edit"`; `skemaKemaskiniProfil` (Zod schema) - consumed by Task 3 (`lib/profil/actions.ts`).

- [ ] **Step 1: Add the route constant**

In `lib/auth/routes.ts`, add `profilEdit: "/profil/edit",` right after the existing `tetapan: "/tetapan",` line:

```ts
  profil: "/profil",
  tetapan: "/tetapan",
  profilEdit: "/profil/edit",
```

- [ ] **Step 2: Write the schema file**

```ts
import { z } from "zod";

import { normalkanTelefonMY } from "./phone";

/**
 * Peraturan di sini MENCERMINKAN had backend PATCH /me
 * (updateMeRequest, internal/http/handlers/profile.go) - bukan sumber
 * kebenaran, tetapi maklum balas per-medan sebelum permintaan rangkaian.
 *
 * Borang ini SENTIASA menghantar SETIAP medan (bukan patch separa):
 * medan kosong bermaksud ahli sengaja buang nilai itu, bukan "tak
 * diubah" - borang sentiasa disemai dgn nilai semasa dahulu.
 */

const namaPilihan = z
  .string()
  .trim()
  .max(100, "Maksimum 100 aksara.");

const nomborTelefonPilihan = z
  .string()
  .trim()
  .max(30, "Maksimum 30 aksara.")
  .refine((v) => v === "" || normalkanTelefonMY(v) !== null, {
    message: "Format nombor telefon tidak sah (cth 012-345 6789).",
  })
  .transform((v) => (v === "" ? "" : normalkanTelefonMY(v)!));

export const skemaKemaskiniProfil = z.object({
  display_name: namaPilihan,
  phone: nomborTelefonPilihan,
  emergency_contact_name: namaPilihan,
  emergency_contact_phone: nomborTelefonPilihan,
  health_notes: z.string().trim().max(500, "Maksimum 500 aksara."),
});
```

Path: `lib/profil/schemas.ts`

- [ ] **Step 3: Type-check**

Run: `cd /Users/hafiz/Developments/marc_next && bunx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 4: Stage**

```bash
git add lib/auth/routes.ts lib/profil/schemas.ts
```

---

### Task 2: Profile API client

**Files:**
- Create: `lib/profil/api.ts`

**Interfaces:**
- Consumes: `apiFetch<T>` from `lib/api/client.ts`, `Profile` from `lib/api/types.ts`.
- Produces: `kemaskiniProfil(accessToken, body): Promise<Profile>` - consumed by Task 3.

- [ ] **Step 1: Write the file**

```ts
import "server-only";

import { apiFetch } from "@/lib/api/client";
import type { Profile } from "@/lib/api/types";

/**
 * Pembalut nipis atas `PATCH /me` - padanan `lib/auth/api.ts`/`lib/posts/api.ts`
 * untuk domain profil. `GET /me` sudah wujud sebagai `lib/auth/api.ts`'s
 * `me()`; fail ni cuma tambah bahagian TULIS.
 */
export function kemaskiniProfil(
  accessToken: string,
  body: {
    display_name: string;
    phone: string;
    emergency_contact_name: string;
    emergency_contact_phone: string;
    health_notes: string;
    avatar_r2_key?: string;
  },
): Promise<Profile> {
  return apiFetch<Profile>("/me", { method: "PATCH", body, accessToken });
}
```

Path: `lib/profil/api.ts`

- [ ] **Step 2: Type-check**

Run: `cd /Users/hafiz/Developments/marc_next && bunx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Stage**

```bash
git add lib/profil/api.ts
```

---

### Task 3: Edit-profile Server Action

**Files:**
- Create: `lib/profil/actions.ts`

**Interfaces:**
- Consumes: `kemaskiniProfil` from Task 2, `skemaKemaskiniProfil` from Task 1, `KeadaanBorang` from `lib/auth/borang.ts`, `ApiError`/`ApiUnreachableError` from `lib/api/errors.ts`, `accessToken` from `lib/auth/session.ts`, `ROUTES` from `lib/auth/routes.ts`.
- Produces: `kemaskiniProfilAction(_prev: KeadaanBorang, formData: FormData): Promise<KeadaanBorang>` - consumed by Task 8 (`borang-edit-profil.tsx`).

- [ ] **Step 1: Write the file**

```ts
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { ZodError } from "zod";

import { ApiError, ApiUnreachableError } from "@/lib/api/errors";
import { accessToken } from "@/lib/auth/session";
import type { KeadaanBorang } from "@/lib/auth/borang";
import { ROUTES } from "@/lib/auth/routes";
import { kemaskiniProfil } from "./api";
import { skemaKemaskiniProfil } from "./schemas";

function ralatMedan(error: ZodError): Record<string, string> {
  const hasil: Record<string, string> = {};
  for (const isu of error.issues) {
    const kunci = String(isu.path[0] ?? "_");
    if (!(kunci in hasil)) hasil[kunci] = isu.message;
  }
  return hasil;
}

function keadaanRalat(error: unknown, nilai?: Record<string, string>): KeadaanBorang {
  if (error instanceof ApiError || error instanceof ApiUnreachableError) {
    return { ralat: error.message, nilai };
  }
  throw error;
}

export async function kemaskiniProfilAction(
  _prev: KeadaanBorang,
  formData: FormData,
): Promise<KeadaanBorang> {
  const mentah = {
    display_name: String(formData.get("display_name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    emergency_contact_name: String(formData.get("emergency_contact_name") ?? ""),
    emergency_contact_phone: String(formData.get("emergency_contact_phone") ?? ""),
    health_notes: String(formData.get("health_notes") ?? ""),
  };
  const nilai = mentah;

  const disahkan = skemaKemaskiniProfil.safeParse(mentah);
  if (!disahkan.success) {
    return { medan: ralatMedan(disahkan.error), nilai };
  }

  // Hadir hanya bila ahli berinteraksi dengan pemilih avatar dalam sesi
  // edit ini (lihat BorangEditProfil, Task 8) - string kosong bermaksud
  // "buang avatar", ketiadaan medan ni langsung bermaksud "jangan sentuh".
  const avatarR2Key = formData.has("avatar_r2_key")
    ? String(formData.get("avatar_r2_key"))
    : undefined;

  const token = await accessToken();
  if (!token) {
    return { ralat: "Sesi tamat. Sila log masuk semula.", nilai };
  }

  try {
    await kemaskiniProfil(token, { ...disahkan.data, avatar_r2_key: avatarR2Key });
  } catch (error) {
    return keadaanRalat(error, nilai);
  }

  revalidatePath(ROUTES.profil);
  redirect(ROUTES.profil);
}
```

Path: `lib/profil/actions.ts`

- [ ] **Step 2: Type-check**

Run: `cd /Users/hafiz/Developments/marc_next && bunx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Build check (verifies the "use server" export-only-async-functions rule)**

Run: `cd /Users/hafiz/Developments/marc_next && bun run build`
Expected: build succeeds.

- [ ] **Step 4: Stage**

```bash
git add lib/profil/actions.ts
```

---

### Task 4: `HeaderProfil` component

**Files:**
- Create: `components/profil/header-profil.tsx`

**Interfaces:**
- Consumes: `Profile`, `isManagement` from `lib/api/types.ts`, `Avatar`/`AvatarImage`/`AvatarFallback` from `components/ui/avatar.tsx`, `Badge` from `components/ui/badge.tsx`, `Button` from `components/ui/button.tsx`, `ROUTES` from `lib/auth/routes.ts`.
- Produces: `HeaderProfil` component with props `{ profile: Profile }` - consumed by Task 9 (profile page).

- [ ] **Step 1: Write the file**

```tsx
import Link from "next/link";
import { PencilIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { isManagement } from "@/lib/api/types";
import type { Profile } from "@/lib/api/types";
import { ROUTES } from "@/lib/auth/routes";

export function HeaderProfil({ profile }: { profile: Profile }) {
  const nama = profile.display_name?.trim() || profile.email;

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Avatar className="size-14">
          {profile.avatar_url ? <AvatarImage src={profile.avatar_url} alt="" /> : null}
          <AvatarFallback className="bg-accent text-base font-semibold text-accent-foreground">
            {inisial(nama)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="flex items-center gap-2 font-heading text-lg font-semibold">
            {nama}
            {isManagement(profile) ? (
              <Badge variant="secondary" className="text-primary">
                Pengurusan
              </Badge>
            ) : null}
          </p>
          <p className="text-sm text-muted-foreground">{profile.role_name}</p>
        </div>
      </div>

      <Button asChild variant="outline" size="sm">
        <Link href={ROUTES.profilEdit}>
          <PencilIcon />
          Edit
        </Link>
      </Button>
    </div>
  );
}

/** Dua huruf pertama, atau satu bila hanya ada satu perkataan. */
function inisial(nama: string): string {
  const bahagian = nama.split(/[\s@.]+/).filter(Boolean);
  if (bahagian.length === 0) return "?";
  if (bahagian.length === 1) return bahagian[0].slice(0, 2).toUpperCase();
  return (bahagian[0][0] + bahagian[1][0]).toUpperCase();
}
```

Path: `components/profil/header-profil.tsx`

- [ ] **Step 2: Type-check**

Run: `cd /Users/hafiz/Developments/marc_next && bunx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Stage**

```bash
git add components/profil/header-profil.tsx
```

---

### Task 5: `KadInfoProfil` component

**Files:**
- Create: `components/profil/kad-info-profil.tsx`

**Interfaces:**
- Consumes: `Profile` from `lib/api/types.ts`, `Card`/`CardHeader`/`CardTitle`/`CardContent` from `components/ui/card.tsx`.
- Produces: `KadInfoProfil` component with props `{ profile: Profile }` - consumed by Task 9 (profile page).

- [ ] **Step 1: Write the file**

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Profile } from "@/lib/api/types";

export function KadInfoProfil({ profile }: { profile: Profile }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Maklumat</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <Baris label="Emel" nilai={profile.email} />
          <Baris label="No. telefon" nilai={profile.phone ?? "-"} />
          <Baris label="No. ahli" nilai={profile.member_id ?? "Belum dijana"} />
          <Baris
            label="Status emel"
            nilai={profile.email_verified ? "Disahkan" : "Belum disahkan"}
          />
          {profile.department_name ? (
            <Baris label="Bahagian" nilai={profile.department_name} />
          ) : null}
          {profile.position ? <Baris label="Jawatan" nilai={profile.position} /> : null}
        </dl>
      </CardContent>
    </Card>
  );
}

function Baris({ label, nilai }: { label: string; nilai: string }) {
  return (
    <div className="border-b border-border/70 pb-2.5 last:border-0 sm:last:border-b sm:[&:nth-last-child(-n+2)]:border-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium">{nilai}</dd>
    </div>
  );
}
```

Path: `components/profil/kad-info-profil.tsx`

- [ ] **Step 2: Type-check**

Run: `cd /Users/hafiz/Developments/marc_next && bunx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Stage**

```bash
git add components/profil/kad-info-profil.tsx
```

---

### Task 6: `KadTetapan` (reusable settings group) component

**Files:**
- Create: `components/tetapan/kad-tetapan.tsx`

**Interfaces:**
- Consumes: `Card`/`CardContent` from `components/ui/card.tsx`.
- Produces: `KadTetapan` component with props `{ label: string; children: React.ReactNode }` - consumed by Task 11 (settings page).

- [ ] **Step 1: Write the file**

```tsx
import { Card, CardContent } from "@/components/ui/card";

/**
 * Kumpulan tetapan berlabel - padanan `SettingsGroupLabel` + `SettingsCard`
 * Flutter (shared/ui/widgets/settings_section.dart), digabung jadi SATU
 * komponen supaya jarak antara label dan kad tak boleh terlepas.
 */
export function KadTetapan({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <h2 className="px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </h2>
      <Card>
        <CardContent className="grid divide-y divide-border/70 p-0">{children}</CardContent>
      </Card>
    </div>
  );
}
```

Path: `components/tetapan/kad-tetapan.tsx`

- [ ] **Step 2: Type-check**

Run: `cd /Users/hafiz/Developments/marc_next && bunx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Stage**

```bash
git add components/tetapan/kad-tetapan.tsx
```

---

### Task 7: `ButangLogKeluarSemua` component

**Files:**
- Create: `components/tetapan/butang-log-keluar-semua.tsx`

**Interfaces:**
- Consumes: `logKeluarSemuaAction` from `lib/auth/actions.ts` (signature: `(): Promise<void>` - always clears cookies and redirects, never returns to the caller on success), `Button` from `components/ui/button.tsx`.
- Produces: `ButangLogKeluarSemua` component (no props) - consumed by Task 11 (settings page).

- [ ] **Step 1: Write the file**

```tsx
"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { LogOutIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { logKeluarSemuaAction } from "@/lib/auth/actions";

/**
 * Dua-langkah dalam-baris (bukan modal) - padanan corak padam post
 * (KadPos, modul feed): klik pertama sedia, klik kedua sahkan.
 */
export function ButangLogKeluarSemua() {
  const [sahkan, setSahkan] = useState(false);

  if (!sahkan) {
    return (
      <button
        type="button"
        onClick={() => setSahkan(true)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-destructive hover:bg-destructive/10"
      >
        <span className="flex items-center gap-2">
          <LogOutIcon className="size-4" />
          Log keluar semua peranti
        </span>
      </button>
    );
  }

  return (
    <form action={logKeluarSemuaAction} className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-muted-foreground">Log keluar SEMUA peranti?</span>
      <div className="flex gap-2">
        <Button type="button" size="sm" variant="ghost" onClick={() => setSahkan(false)}>
          Batal
        </Button>
        <ButangSahkan />
      </div>
    </form>
  );
}

function ButangSahkan() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" variant="destructive" disabled={pending}>
      {pending ? "Melog keluar…" : "Sahkan"}
    </Button>
  );
}
```

Path: `components/tetapan/butang-log-keluar-semua.tsx`

- [ ] **Step 2: Type-check**

Run: `cd /Users/hafiz/Developments/marc_next && bunx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Stage**

```bash
git add components/tetapan/butang-log-keluar-semua.tsx
```

---

### Task 8: `BorangEditProfil` (edit form + avatar picker)

**Files:**
- Create: `components/profil/borang-edit-profil.tsx`

**Interfaces:**
- Consumes: `kemaskiniProfilAction` from Task 3, `mintaUploadURLAction` from `lib/posts/actions.ts` (signature: `(contentType: string) => Promise<HasilTindakan<{ upload_url: string; r2_key: string }>>`), `HasilTindakan` from `lib/posts/hasil.ts`, `KEADAAN_AWAL`/`KeadaanBorang` from `lib/auth/borang.ts`, `Input`/`Textarea`/`Label`/`Button`/`Avatar`/`AvatarImage`/`AvatarFallback` from `components/ui/`, `Profile` from `lib/api/types.ts`.
- Produces: `BorangEditProfil` component with props `{ profile: Profile }` - consumed by Task 10 (edit page).

- [ ] **Step 1: Write the file**

```tsx
"use client";

import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Profile } from "@/lib/api/types";
import { KEADAAN_AWAL } from "@/lib/auth/borang";
import { mintaUploadURLAction } from "@/lib/posts/actions";
import { kemaskiniProfilAction } from "@/lib/profil/actions";

const JENIS_DIBENARKAN = new Set(["image/jpeg", "image/png", "image/webp"]);

export function BorangEditProfil({ profile }: { profile: Profile }) {
  const [keadaan, formAction] = useActionState(kemaskiniProfilAction, KEADAAN_AWAL);
  const [pratontonAvatar, setPratontonAvatar] = useState<string | null>(profile.avatar_url);
  const [avatarR2Key, setAvatarR2Key] = useState<string | undefined>(undefined);
  const [ralatAvatar, setRalatAvatar] = useState<string | null>(null);
  const [memuatNaik, setMemuatNaik] = useState(false);
  const inputFailRef = useRef<HTMLInputElement>(null);

  async function pilihAvatar(fail: File | undefined) {
    if (!fail) return;
    if (!JENIS_DIBENARKAN.has(fail.type)) {
      setRalatAvatar("Jenis fail tidak disokong.");
      return;
    }
    setRalatAvatar(null);
    setMemuatNaik(true);
    try {
      const hasilPresign = await mintaUploadURLAction(fail.type);
      if (!hasilPresign.ok) {
        setRalatAvatar(hasilPresign.ralat);
        return;
      }
      const respons = await fetch(hasilPresign.data.upload_url, {
        method: "PUT",
        headers: { "Content-Type": fail.type },
        body: fail,
      });
      if (!respons.ok) throw new Error("upload gagal");
      setPratontonAvatar(URL.createObjectURL(fail));
      setAvatarR2Key(hasilPresign.data.r2_key);
    } catch {
      setRalatAvatar("Gagal muat naik gambar.");
    } finally {
      setMemuatNaik(false);
      if (inputFailRef.current) inputFailRef.current.value = "";
    }
  }

  function buangAvatar() {
    setPratontonAvatar(null);
    setAvatarR2Key("");
  }

  return (
    <form action={formAction} className="grid gap-6">
      {keadaan.ralat ? <p className="text-sm text-destructive">{keadaan.ralat}</p> : null}

      <div className="flex items-center gap-4">
        <Avatar className="size-16">
          {pratontonAvatar ? <AvatarImage src={pratontonAvatar} alt="" /> : null}
          <AvatarFallback className="bg-accent text-lg font-semibold text-accent-foreground">
            {(profile.display_name?.trim() || profile.email).slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="grid gap-1.5">
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={memuatNaik}
              onClick={() => inputFailRef.current?.click()}
            >
              {memuatNaik ? "Memuat naik…" : "Tukar gambar"}
            </Button>
            {pratontonAvatar ? (
              <Button type="button" size="sm" variant="ghost" onClick={buangAvatar}>
                Buang
              </Button>
            ) : null}
          </div>
          {ralatAvatar ? <p className="text-xs text-destructive">{ralatAvatar}</p> : null}
        </div>
        <input
          ref={inputFailRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => pilihAvatar(e.target.files?.[0])}
        />
      </div>
      {avatarR2Key !== undefined ? (
        <input type="hidden" name="avatar_r2_key" value={avatarR2Key} />
      ) : null}

      <div className="grid gap-1.5">
        <Label htmlFor="display_name">Nama paparan</Label>
        <Input
          id="display_name"
          name="display_name"
          defaultValue={keadaan.nilai?.display_name ?? profile.display_name ?? ""}
          maxLength={100}
          aria-invalid={Boolean(keadaan.medan?.display_name)}
        />
        {keadaan.medan?.display_name ? (
          <p className="text-xs text-destructive">{keadaan.medan.display_name}</p>
        ) : null}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="phone">No. telefon</Label>
        <Input
          id="phone"
          name="phone"
          defaultValue={keadaan.nilai?.phone ?? profile.phone ?? ""}
          maxLength={30}
          aria-invalid={Boolean(keadaan.medan?.phone)}
        />
        {keadaan.medan?.phone ? (
          <p className="text-xs text-destructive">{keadaan.medan.phone}</p>
        ) : null}
      </div>

      <div className="grid gap-3 border-t border-border/70 pt-4">
        <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Waris
        </h2>
        <div className="grid gap-1.5">
          <Label htmlFor="emergency_contact_name">Nama waris</Label>
          <Input
            id="emergency_contact_name"
            name="emergency_contact_name"
            defaultValue={
              keadaan.nilai?.emergency_contact_name ?? profile.emergency_contact_name ?? ""
            }
            maxLength={100}
            aria-invalid={Boolean(keadaan.medan?.emergency_contact_name)}
          />
          {keadaan.medan?.emergency_contact_name ? (
            <p className="text-xs text-destructive">{keadaan.medan.emergency_contact_name}</p>
          ) : null}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="emergency_contact_phone">No. telefon waris</Label>
          <Input
            id="emergency_contact_phone"
            name="emergency_contact_phone"
            defaultValue={
              keadaan.nilai?.emergency_contact_phone ?? profile.emergency_contact_phone ?? ""
            }
            maxLength={30}
            aria-invalid={Boolean(keadaan.medan?.emergency_contact_phone)}
          />
          {keadaan.medan?.emergency_contact_phone ? (
            <p className="text-xs text-destructive">{keadaan.medan.emergency_contact_phone}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-1.5 border-t border-border/70 pt-4">
        <Label htmlFor="health_notes">Nota kesihatan</Label>
        <Textarea
          id="health_notes"
          name="health_notes"
          defaultValue={keadaan.nilai?.health_notes ?? profile.health_notes ?? ""}
          maxLength={500}
          placeholder="Alahan, kondisi, atau nota (pilihan)"
          aria-invalid={Boolean(keadaan.medan?.health_notes)}
        />
        {keadaan.medan?.health_notes ? (
          <p className="text-xs text-destructive">{keadaan.medan.health_notes}</p>
        ) : null}
      </div>

      <ButangSimpan />
    </form>
  );
}

function ButangSimpan() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="justify-self-start">
      {pending ? "Menyimpan…" : "Simpan"}
    </Button>
  );
}
```

Note: avatar upload/type errors are shown inline (`ralatAvatar`), matching the posts composer's per-file error pattern from the spec - there is no toast-worthy transient event in this form (unlike likes), so `sonner` is not used here.

- [ ] **Step 2: Type-check**

Run: `cd /Users/hafiz/Developments/marc_next && bunx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Stage**

```bash
git add components/profil/borang-edit-profil.tsx
```

---

### Task 9: Profile view page

**Files:**
- Create: `app/(dilindungi)/profil/page.tsx`

**Interfaces:**
- Consumes: `wajibSesi` from `lib/auth/session.ts`, `HeaderProfil` from Task 4, `KadInfoProfil` from Task 5.

- [ ] **Step 1: Write the file**

```tsx
import { HeaderProfil } from "@/components/profil/header-profil";
import { KadInfoProfil } from "@/components/profil/kad-info-profil";
import { wajibSesi } from "@/lib/auth/session";

export default async function ProfilPage() {
  const { profile } = await wajibSesi();

  return (
    <div className="grid gap-6">
      <HeaderProfil profile={profile} />
      <KadInfoProfil profile={profile} />
    </div>
  );
}
```

Path: `app/(dilindungi)/profil/page.tsx`

- [ ] **Step 2: Type-check**

Run: `cd /Users/hafiz/Developments/marc_next && bunx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Stage**

```bash
git add "app/(dilindungi)/profil/page.tsx"
```

---

### Task 10: Profile edit page

**Files:**
- Create: `app/(dilindungi)/profil/edit/page.tsx`

**Interfaces:**
- Consumes: `wajibSesi` from `lib/auth/session.ts`, `BorangEditProfil` from Task 8.

- [ ] **Step 1: Write the file**

```tsx
import { BorangEditProfil } from "@/components/profil/borang-edit-profil";
import { wajibSesi } from "@/lib/auth/session";

export default async function EditProfilPage() {
  const { profile } = await wajibSesi();

  return (
    <div className="mx-auto grid max-w-lg gap-6">
      <header>
        <h1 className="font-heading text-[1.75rem] font-semibold tracking-tight text-balance">
          Edit profil
        </h1>
      </header>

      <BorangEditProfil profile={profile} />
    </div>
  );
}
```

Path: `app/(dilindungi)/profil/edit/page.tsx`

- [ ] **Step 2: Type-check**

Run: `cd /Users/hafiz/Developments/marc_next && bunx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Manual verification**

Run: `cd /Users/hafiz/Developments/marc_next && bun run dev`, log in, navigate to `/profil/edit`.

Check:
- Form is pre-filled with current profile values.
- Editing display name/phone/emergency contact/health notes and saving redirects to `/profil` with the new values visible immediately.
- Submitting an invalid phone number (e.g. "abc") shows an inline field error without leaving the page, and the other fields keep their typed values.
- Clicking "Tukar gambar", picking a valid image, shows a preview immediately; saving persists it (visible on `/profil` and in the navbar avatar after reload).
- Picking a non-image file shows "Jenis fail tidak disokong." inline, without submitting anything.
- Clicking "Buang" (when an avatar exists) then saving removes the avatar (fallback initials show on `/profil`).

- [ ] **Step 4: Stage**

```bash
git add "app/(dilindungi)/profil/edit/page.tsx"
```

---

### Task 11: Settings page

**Files:**
- Create: `app/(dilindungi)/tetapan/page.tsx`

**Interfaces:**
- Consumes: `wajibSesi` from `lib/auth/session.ts`, `KadTetapan` from Task 6, `ButangLogKeluarSemua` from Task 7, `SuisTema` from `components/marc/suis-tema.tsx` (existing), `SenaraiSesi` from `components/auth/senarai-sesi.tsx` (existing, signature: `{ accessToken: string }`).

- [ ] **Step 1: Write the file**

```tsx
import { Suspense } from "react";
import { MoonIcon } from "lucide-react";

import { SenaraiSesi } from "@/components/auth/senarai-sesi";
import { SuisTema } from "@/components/marc/suis-tema";
import { Skeleton } from "@/components/ui/skeleton";
import { KadTetapan } from "@/components/tetapan/kad-tetapan";
import { ButangLogKeluarSemua } from "@/components/tetapan/butang-log-keluar-semua";
import { wajibSesi } from "@/lib/auth/session";

export default async function TetapanPage() {
  const { accessToken } = await wajibSesi();

  return (
    <div className="grid gap-6">
      <header>
        <h1 className="font-heading text-[1.75rem] font-semibold tracking-tight text-balance">
          Tetapan
        </h1>
      </header>

      <KadTetapan label="Paparan">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="flex items-center gap-2 text-sm">
            <MoonIcon className="size-4" />
            Mod gelap
          </span>
          <SuisTema />
        </div>
      </KadTetapan>

      <Suspense fallback={<Skeleton className="h-24 w-full" />}>
        <SenaraiSesi accessToken={accessToken} />
      </Suspense>

      <KadTetapan label="Akaun">
        <ButangLogKeluarSemua />
      </KadTetapan>
    </div>
  );
}
```

Path: `app/(dilindungi)/tetapan/page.tsx`

- [ ] **Step 2: Type-check**

Run: `cd /Users/hafiz/Developments/marc_next && bunx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Manual verification**

Run: `cd /Users/hafiz/Developments/marc_next && bun run dev`, log in, navigate to `/tetapan`.

Check:
- Theme toggle works identically to the navbar's existing theme button.
- Active sessions list renders (reused component, should already work).
- Clicking "Log keluar semua peranti" shows the two-step confirm; clicking "Batal" cancels it; clicking through to "Sahkan" logs out and redirects to `/log-masuk` (verify on a disposable test session, not your own active one, since it invalidates every device).

- [ ] **Step 4: Stage**

```bash
git add "app/(dilindungi)/tetapan/page.tsx"
```

---

## Full verification (after all tasks)

Run: `cd /Users/hafiz/Developments/marc_next && bun run build`
Expected: production build succeeds with `/profil`, `/profil/edit`, and `/tetapan` listed as routes.

Then `bun run dev` and walk the full path: navbar avatar → dropdown → Profil → Edit → change every field + avatar → Simpan → back on Profil with new values → navbar avatar → dropdown → Tetapan → toggle theme → view active sessions → (on a disposable session) log out of all devices.
