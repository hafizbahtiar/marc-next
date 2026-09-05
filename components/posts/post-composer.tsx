"use client";

import { useRef, useState, useTransition } from "react";
import { ImagePlusIcon, MegaphoneIcon, XIcon } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { isManagement } from "@/lib/api/types";
import type { Post, Profile } from "@/lib/api/types";
import { createPostAction, requestUploadUrlAction } from "@/lib/posts/actions";

const JENIS_DIBENARKAN = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAKS_GAMBAR = 4;

type FailGambar = { file: File; preview: string; ralat?: string };

export function PostComposer({
  profile,
  onPosBaharu,
}: {
  profile: Profile;
  onPosBaharu?: (post: Post) => void;
}) {
  const [kandungan, setKandungan] = useState("");
  const [pengumuman, setPengumuman] = useState(false);
  const [gambar, setGambar] = useState<FailGambar[]>([]);
  const [ralat, setRalat] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const inputFailRef = useRef<HTMLInputElement>(null);

  function addFiles(fail: FileList | null) {
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

  function removeFile(index: number) {
    setGambar((g) => {
      URL.revokeObjectURL(g[index].preview);
      return g.filter((_, i) => i !== index);
    });
  }

  function submitPost() {
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
        const hasilPresign = await requestUploadUrlAction(g.file.type);
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

      const hasil = await createPostAction({
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
      onPosBaharu?.(hasil.data);
      toast.success("Post dihantar.");
    });
  }

  const nama = profile.display_name?.trim() || profile.member_id || "Ahli MARC";

  return (
    <section className="overflow-hidden rounded-2xl border bg-card shadow-sm" aria-label="Cipta post baharu">
      <div className="flex gap-3 p-4 pb-3 sm:p-5 sm:pb-4">
        <Avatar className="mt-0.5" size="default">
          {profile.avatar_url ? <AvatarImage src={profile.avatar_url} alt="" /> : null}
          <AvatarFallback>{nama.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="mb-2 text-sm font-semibold">{nama}</p>
          <Textarea
            placeholder="Apa yang ingin anda kongsikan?"
            value={kandungan}
            onChange={(e) => setKandungan(e.target.value)}
            maxLength={10000}
            disabled={pending}
            className="min-h-20 resize-none border-0 bg-transparent px-0 py-0 text-base shadow-none focus-visible:border-0 focus-visible:ring-0 md:text-base"
          />
        </div>
      </div>

      {gambar.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 px-4 sm:px-5">
          {gambar.map((g, i) => (
            <div key={g.preview} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted ring-1 ring-foreground/10">
              {/* eslint-disable-next-line @next/next/no-img-element -- pratonton blob: tempatan, bukan aset dioptimumkan. */}
              <img src={g.preview} alt="" className="size-full object-cover" />
              <button
                type="button"
                onClick={() => removeFile(i)}
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

      {ralat ? <p className="px-4 text-sm text-destructive sm:px-5">{ralat}</p> : null}

      <div className="mt-4 flex items-center justify-between gap-3 border-t bg-muted/20 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={pending || gambar.length >= MAKS_GAMBAR}
            onClick={() => inputFailRef.current?.click()}
            aria-label="Tambah gambar"
            title="Tambah gambar"
          >
            <ImagePlusIcon />
          </Button>
          <span className="hidden text-xs text-muted-foreground sm:inline">Tambah gambar</span>
          <input
            ref={inputFailRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />

          {isManagement(profile) ? (
            <label className="ml-2 flex items-center gap-1.5 border-l pl-3 text-sm text-muted-foreground">
              <Checkbox
                checked={pengumuman}
                onCheckedChange={(v) => setPengumuman(v === true)}
                disabled={pending}
              />
              <MegaphoneIcon className="size-4" />
              <span>Pengumuman</span>
            </label>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-xs tabular-nums text-muted-foreground sm:inline">
            {kandungan.length.toLocaleString("ms-MY")}/10,000
          </span>
          <Button type="button" onClick={submitPost} disabled={pending || !kandungan.trim()} className="rounded-full px-4">
          {pending ? "Menghantar…" : "Hantar"}
          </Button>
        </div>
      </div>
    </section>
  );
}
