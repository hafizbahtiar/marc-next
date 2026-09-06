"use client";

import { useEffect, useRef, useState } from "react";

import { PostCard } from "@/components/posts/post-card";
import type { Post, Profile, SenaraiPosRespons } from "@/lib/api/types";

export function PostFeed({
  pos,
  cursorSeterusnya,
  profileSemasa,
  onMuatLanjut,
  onDipadam,
  onDikemaskini,
}: {
  pos: Post[];
  cursorSeterusnya: string | null;
  profileSemasa: Profile;
  /** Dipanggil dengan post halaman seterusnya selepas berjaya dimuat - ibu bapa yang gabungkan ke senarai dimiliki. */
  onMuatLanjut: (posBaharu: Post[]) => void;
  onDipadam?: (id: string) => void;
  onDikemaskini?: (post: Post) => void;
}) {
  const [cursor, setCursor] = useState(cursorSeterusnya);
  const [memuat, setMemuat] = useState(false);
  const [ralat, setRalat] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const memuatRef = useRef(false);

  useEffect(() => {
    if (!cursor) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadNextPage();
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- muatHalamanSeterusnya ditakrif semula setiap render dengan sengaja (baca `cursor` terkini); guard "sedang memuat" guna `memuatRef` (bukan state `memuat`) supaya tidak terjejas oleh stale closure. Observer dipasang semula bila `cursor` berubah, yang cukup untuk elak pemasangan berulang tanpa henti.
  }, [cursor]);

  async function loadNextPage() {
    if (memuatRef.current || !cursor) return;
    memuatRef.current = true;
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
      onMuatLanjut(data.posts);
      setCursor(data.next_cursor);
    } catch (error) {
      setRalat(error instanceof Error ? error.message : "Gagal muat post.");
    } finally {
      memuatRef.current = false;
      setMemuat(false);
    }
  }

  if (pos.length === 0 && !cursor) {
    return (
      <div className="grid place-items-center gap-2 rounded-2xl border border-dashed bg-card px-6 py-16 text-center">
        <p className="font-medium">Belum ada perkongsian</p>
        <p className="max-w-sm text-sm leading-6 text-muted-foreground">
          Jadilah orang pertama yang berkongsi sesuatu dengan komuniti MARC.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {pos.map((p) => (
        <PostCard
          key={p.id}
          post={p}
          profileSemasa={profileSemasa}
          pautanKeDetail
          onDipadam={onDipadam}
          onDikemaskini={onDikemaskini}
        />
      ))}

      {cursor ? (
        <div ref={sentinelRef} className="min-h-10 py-4 text-center text-sm text-muted-foreground">
          {ralat ? (
            <button type="button" onClick={loadNextPage} className="rounded-lg px-3 py-2 underline underline-offset-4 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
              {ralat} - cuba lagi
            </button>
          ) : memuat ? (
            <span role="status">Memuat perkongsian…</span>
          ) : null}
        </div>
      ) : (
        <p className="py-5 text-center text-xs text-muted-foreground">Anda sudah sampai ke hujung feed.</p>
      )}
    </div>
  );
}
