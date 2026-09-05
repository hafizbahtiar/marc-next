"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { LikeButton } from "@/components/posts/like-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ROUTES } from "@/lib/auth/routes";
import { isManagement } from "@/lib/api/types";
import type { Post, Profile } from "@/lib/api/types";
import { kemaskiniPosAction, padamPosAction, sukaPosAction, nyahSukaPosAction } from "@/lib/posts/actions";

export function PostCard({
  post,
  profileSemasa,
  pautanKeDetail = true,
  onDipadam,
  onDikemaskini,
  selepasPadam,
}: {
  post: Post;
  profileSemasa: Profile;
  pautanKeDetail?: boolean;
  /** Suapan: buang kad ini daripada senarai dimiliki ibu bapa selepas padam berjaya. */
  onDipadam?: (id: string) => void;
  /** Suapan: gantikan post ini dalam senarai dimiliki ibu bapa selepas edit berjaya. */
  onDikemaskini?: (post: Post) => void;
  /** Halaman detail: navigasi selepas padam berjaya (ibu bapa tak memiliki senarai untuk dibuang). */
  selepasPadam?: () => void;
}) {
  const router = useRouter();
  const [menyunting, setMenyunting] = useState(false);
  const [kandungan, setKandungan] = useState(post.content);
  const [sahkanPadam, setSahkanPadam] = useState(false);
  const [pending, setPending] = useState(false);

  // Pemilik SENTIASA boleh edit/padam post sendiri; padam sahaja
  // dibenarkan untuk management pada post orang lain (canModify, backend).
  const bolehEdit = post.author.member_id === profileSemasa.member_id;
  const bolehPadam = bolehEdit || isManagement(profileSemasa);

  async function saveEdit() {
    setPending(true);
    try {
      const hasil = await kemaskiniPosAction(post.id, kandungan.trim());
      if (!hasil.ok) {
        toast.error(hasil.ralat);
        return;
      }
      setMenyunting(false);
      onDikemaskini?.(hasil.data);
    } finally {
      setPending(false);
    }
  }

  async function deletePost() {
    setPending(true);
    try {
      const hasil = await padamPosAction(post.id);
      if (!hasil.ok) {
        toast.error(hasil.ralat);
        setSahkanPadam(false);
        return;
      }
      // Berjaya: beritahu ibu bapa supaya kad ini hilang serta-merta
      // (tanpa bergantung pada React mengesan semula render pelayan).
      if (onDipadam) {
        onDipadam(post.id);
      } else if (!pautanKeDetail) {
        // Kita berada pada halaman detail post ini - tiada senarai untuk
        // dibuang kad daripadanya, jadi navigasi keluar sebaliknya.
        router.push(ROUTES.pos);
      }
      selepasPadam?.();
    } finally {
      setPending(false);
    }
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
            <p className="text-xs text-muted-foreground">{formatShortDate(post.created_at)}</p>
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
            <Button type="button" size="sm" onClick={saveEdit} disabled={pending || !kandungan.trim()}>
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
          <LikeButton
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
          <Button type="button" size="sm" variant="destructive" onClick={deletePost} disabled={pending}>
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

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("ms-MY", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kuala_Lumpur",
  }).format(d);
}
