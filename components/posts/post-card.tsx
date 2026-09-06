"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock3Icon, MessageCircleIcon } from "lucide-react";
import { toast } from "sonner";

import { LikeButton } from "@/components/posts/like-button";
import { ConfirmationDialog } from "@/components/marc/confirmation-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ROUTES } from "@/lib/auth/routes";
import { isManagement } from "@/lib/api/types";
import type { Post, Profile } from "@/lib/api/types";
import { updatePostAction, deletePostAction, likePostAction, unlikePostAction } from "@/lib/posts/actions";

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
  const [pending, setPending] = useState(false);

  // Pemilik SENTIASA boleh edit/padam post sendiri; padam sahaja
  // dibenarkan untuk management pada post orang lain (canModify, backend).
  const bolehEdit = post.author.member_id === profileSemasa.member_id;
  const bolehPadam = bolehEdit || isManagement(profileSemasa);

  async function saveEdit() {
    setPending(true);
    try {
      const hasil = await updatePostAction(post.id, kandungan.trim(), post.updated_at);
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

  async function deletePost(): Promise<boolean> {
    setPending(true);
    try {
      const hasil = await deletePostAction(post.id, post.updated_at);
      if (!hasil.ok) {
        toast.error(hasil.ralat);
        return false;
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
      return true;
    } finally {
      setPending(false);
    }
  }

  const nama = post.author.display_name?.trim() || post.author.member_id;

  return (
    <article className="grid gap-3 rounded-2xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Link
            href={`/members/${encodeURIComponent(post.author.user_id)}`}
            className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Lihat profil ${nama}`}
          >
            <Avatar>
              {post.author.avatar_url ? <AvatarImage src={post.author.avatar_url} alt="" /> : null}
              <AvatarFallback>{nama.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
              <Link
                href={`/members/${encodeURIComponent(post.author.user_id)}`}
                className="rounded-sm outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
              >
                {nama}
              </Link>
              {post.type === "announcement" ? (
                <Badge variant="secondary" className="gap-1 text-primary">
                  <span className="size-1.5 rounded-full bg-primary" aria-hidden />
                  Pengumuman
                </Badge>
              ) : null}
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <Clock3Icon className="size-3" aria-hidden />
              <time dateTime={post.created_at}>{relativeTime(post.created_at)}</time>
              {post.edited_at ? <span>(diedit)</span> : null}
            </p>
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
        <p className="text-[0.95rem] leading-7 whitespace-pre-wrap">
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
        <div className={post.images.length === 1 ? "grid" : "grid grid-cols-2 gap-2"}>
          {post.images.map((url) => (
            // eslint-disable-next-line @next/next/no-img-element -- URL R2 bertandatangan, luput; next/image cache tak sesuai.
            <img key={url} src={url} alt="" className="aspect-video w-full rounded-xl object-cover ring-1 ring-foreground/10" />
          ))}
        </div>
      ) : null}

      {pautanKeDetail && post.comment_count > 0 && post.comment_previews?.length ? (
        <div className="grid gap-2 border-t border-border/60 pt-3">
          {post.comment_previews.map((comment) => <CommentPreview key={comment.id} comment={comment} />)}
          {post.comment_count > post.comment_previews.length ? (
            <Link href={`/posts/${post.id}`} className="text-xs font-medium text-muted-foreground hover:text-foreground">
              Lihat semua {post.comment_count} komen
            </Link>
          ) : null}
        </div>
      ) : null}

      <footer className="flex items-center gap-1 border-t border-border/60 pt-2">
          <LikeButton
          id={post.id}
          kiraanAwal={post.like_count}
          disukaAwal={post.liked_by_me}
          suka={likePostAction}
          nyahSuka={unlikePostAction}
        />
        <Link
          href={`/posts/${post.id}`}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <MessageCircleIcon className="size-4" />
          {post.comment_count} komen
        </Link>

        {!menyunting && bolehEdit ? (
          <Button type="button" size="sm" variant="ghost" className="ml-auto text-muted-foreground" onClick={() => setMenyunting(true)}>
            Edit
          </Button>
        ) : null}
        {bolehPadam ? (
          <ConfirmationDialog
            title="Padam post?"
            description="Tindakan ini tidak boleh dibuat asal semula."
            confirmLabel="Padam"
            trigger={
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className={bolehEdit ? "" : "ml-auto"}
                disabled={pending}
              >
                Padam
              </Button>
            }
            onConfirm={deletePost}
          />
        ) : null}
      </footer>
    </article>
  );
}

function CommentPreview({ comment }: { comment: NonNullable<Post["comment_previews"]>[number] }) {
  const [expanded, setExpanded] = useState(false);
  const nama = comment.author.display_name?.trim() || comment.author.member_id;
  const isLong = comment.content.length > 220;

  return (
    <div className="flex items-start gap-2.5">
      <Avatar size="sm">
        {comment.author.avatar_url ? <AvatarImage src={comment.author.avatar_url} alt="" /> : null}
        <AvatarFallback>{nama.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1 rounded-2xl bg-muted/70 px-3 py-2">
        <Link
          href={`/members/${encodeURIComponent(comment.author.user_id)}`}
          className="text-xs font-semibold outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
        >
          {nama}
        </Link>
        <p className={expanded ? "mt-0.5 text-sm whitespace-pre-wrap" : "mt-0.5 line-clamp-3 text-sm whitespace-pre-wrap"}>
          {comment.content}
        </p>
        {isLong ? (
          <button type="button" className="mt-1 text-xs font-medium text-muted-foreground hover:text-foreground" onClick={() => setExpanded((value) => !value)}>
            {expanded ? "Ringkaskan" : "Lihat lagi"}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function relativeTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  const seconds = Math.round((d.getTime() - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat("ms-MY", { numeric: "auto" });
  if (Math.abs(seconds) < 60) return formatter.format(seconds, "second");
  const minutes = Math.round(seconds / 60);
  if (Math.abs(minutes) < 60) return formatter.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return formatter.format(hours, "hour");
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 7) return formatter.format(days, "day");
  return new Intl.DateTimeFormat("ms-MY", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kuala_Lumpur" }).format(d);
}
