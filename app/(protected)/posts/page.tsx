import { PostBoard } from "@/components/posts/post-board";
import { listPosts } from "@/lib/posts/api";
import { wajibSesi } from "@/lib/auth/session";

export default async function PostsPage() {
  const { accessToken, profile } = await wajibSesi();
  const { posts, next_cursor } = await listPosts(accessToken);

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <header className="grid gap-3">
        <div className="flex items-end justify-between gap-4">
          <div className="grid gap-1">
            <p className="text-sm font-medium text-primary">Komuniti MARC</p>
            <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Feed
            </h1>
          </div>
          <span className="hidden rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground sm:inline-flex">
            Perkongsian ahli
          </span>
        </div>
        <p className="max-w-lg text-sm leading-6 text-muted-foreground">
          Ikuti perkembangan, pengumuman dan cerita daripada komuniti MARC.
        </p>
      </header>

      <PostBoard posHalamanPertama={posts} cursorSeterusnya={next_cursor} profileSemasa={profile} />
    </div>
  );
}
