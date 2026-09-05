"use client";

import { useState } from "react";
import { toast } from "sonner";

import { LikeButton } from "@/components/posts/like-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Comment, Profile } from "@/lib/api/types";
import { ciptaKomenAction, sukaKomenAction, nyahSukaKomenAction } from "@/lib/posts/actions";

export function CommentList({
  postId,
  komenAwal,
  profileSemasa,
}: {
  postId: string;
  komenAwal: Comment[];
  profileSemasa: Profile;
}) {
  const [komen, setKomen] = useState(komenAwal);

  function addComment(newComment: Comment) {
    setKomen((k) => [...k, newComment]);
  }

  const utama = komen.filter((k) => !k.parent_comment_id);
  const balasanBagiInduk = (indukId: string) => komen.filter((k) => k.parent_comment_id === indukId);

  return (
    <div className="grid gap-4">
      <CommentForm postId={postId} onHantar={addComment} />

      {utama.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">Belum ada komen.</p>
      ) : (
        <div className="grid gap-4">
          {utama.map((k) => (
            <div key={k.id} className="grid gap-3">
              <CommentRow komen={k} />
              {balasanBagiInduk(k.id).length > 0 ? (
                <div className="ml-8 grid gap-3 border-l border-border/70 pl-3">
                  {balasanBagiInduk(k.id).map((balasan) => (
                    <CommentRow key={balasan.id} komen={balasan} />
                  ))}
                </div>
              ) : null}
              <div className="ml-8">
                <ReplyForm postId={postId} parentCommentId={k.id} onHantar={addComment} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CommentRow({ komen }: { komen: Comment }) {
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
              <LikeButton
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

function CommentForm({
  postId,
  onHantar,
}: {
  postId: string;
  onHantar: (komen: Comment) => void;
}) {
  const [isi, setIsi] = useState("");
  const [pending, setPending] = useState(false);

  async function submit() {
    if (!isi.trim()) return;
    setPending(true);
    try {
      const hasil = await ciptaKomenAction(postId, isi.trim());
      if (!hasil.ok) {
        toast.error(hasil.ralat);
        return;
      }
      onHantar(hasil.data);
      setIsi("");
    } finally {
      setPending(false);
    }
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
      <Button type="button" size="sm" className="justify-self-end" onClick={submit} disabled={pending || !isi.trim()}>
        {pending ? "Menghantar…" : "Hantar komen"}
      </Button>
    </div>
  );
}

function ReplyForm({
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

  async function submit() {
    if (!isi.trim()) return;
    setPending(true);
    try {
      const hasil = await ciptaKomenAction(postId, isi.trim(), parentCommentId);
      if (!hasil.ok) {
        toast.error(hasil.ralat);
        return;
      }
      onHantar(hasil.data);
      setIsi("");
      setTerbuka(false);
    } finally {
      setPending(false);
    }
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
        <Button type="button" size="sm" onClick={submit} disabled={pending || !isi.trim()}>
          {pending ? "Menghantar…" : "Hantar"}
        </Button>
      </div>
    </div>
  );
}
