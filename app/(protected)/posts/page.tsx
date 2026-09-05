import { PostBoard } from "@/components/posts/post-board";
import { senaraiPos } from "@/lib/posts/api";
import { wajibSesi } from "@/lib/auth/session";

export default async function PostsPage() {
  const { accessToken, profile } = await wajibSesi();
  const { posts, next_cursor } = await senaraiPos(accessToken);

  return (
    <div className="mx-auto grid max-w-3xl gap-8">
      <header className="grid gap-2">
        <p className="text-sm font-medium text-primary">Komuniti MARC</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Feed
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Kongsi dan lihat perkongsian ahli lain.
        </p>
      </header>

      <PostBoard posHalamanPertama={posts} cursorSeterusnya={next_cursor} profileSemasa={profile} />
    </div>
  );
}
