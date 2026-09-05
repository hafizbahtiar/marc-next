"use client";

import { useRef, useState, useTransition } from "react";
import { ImagePlusIcon, XIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { isManagement } from "@/lib/api/types";
import type { Post, Profile } from "@/lib/api/types";
import { ciptaPosAction, mintaUploadURLAction } from "@/lib/posts/actions";

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
      onPosBaharu?.(hasil.data);
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
            onChange={(e) => addFiles(e.target.files)}
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

        <Button type="button" onClick={submitPost} disabled={pending}>
          {pending ? "Menghantar…" : "Hantar"}
        </Button>
      </div>
    </div>
  );
}
