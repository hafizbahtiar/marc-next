import { notFound } from "next/navigation";

import { PostCard } from "@/components/posts/post-card";
import { CommentList } from "@/components/posts/comment-list";
import { ApiError } from "@/lib/api/errors";
import type { Comment, Post } from "@/lib/api/types";
import { dapatkanPos, senaraiKomen } from "@/lib/posts/api";
import { wajibSesi } from "@/lib/auth/session";

export default async function PostDetailPage({ params }: PageProps<"/posts/[id]">) {
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
    <div className="mx-auto grid max-w-3xl gap-6">
      <PostCard post={pos} profileSemasa={profile} pautanKeDetail={false} />

      <div>
        <h2 className="font-heading text-lg font-semibold">Komen</h2>
        <div className="mt-4">
          <CommentList postId={pos.id} komenAwal={komen} profileSemasa={profile} />
        </div>
      </div>
    </div>
  );
}
