import { PapanPos } from "@/components/posts/papan-pos";
import { senaraiPos } from "@/lib/posts/api";
import { wajibSesi } from "@/lib/auth/session";

export default async function PosPage() {
  const { accessToken, profile } = await wajibSesi();
  const { posts, next_cursor } = await senaraiPos(accessToken);

  return (
    <div className="grid gap-6">
      <header>
        <h1 className="font-heading text-[1.75rem] font-semibold tracking-tight text-balance">
          Feed
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Kongsi dan lihat perkongsian ahli lain.
        </p>
      </header>

      <PapanPos posHalamanPertama={posts} cursorSeterusnya={next_cursor} profileSemasa={profile} />
    </div>
  );
}
