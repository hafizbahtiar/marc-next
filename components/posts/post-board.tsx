"use client";

import { useState } from "react";

import { PostComposer } from "@/components/posts/post-composer";
import { PostFeed } from "@/components/posts/post-feed";
import type { Post, Profile } from "@/lib/api/types";

/**
 * "Papan pos" - pembungkus klien yang memiliki senarai post kongsi antara
 * `PostComposer` (cipta) dan `PostFeed` (papar/padam/edit). Ia wujud kerana
 * `page.tsx` ialah Server Component dan tak boleh memegang state callback
 * klien; tanpa pembungkus ini, `revalidatePath` selepas tindakan pelayan
 * me-render semula pokok pelayan tetapi instance `PostFeed` yang sedia ada
 * dikekalkan React merentasi render itu, jadi `useState` awalnya tak
 * dijalankan semula dan senarai kekal lapuk. Sila lihat Finding 1 dalam
 * laporan pembetulan akhir untuk butiran.
 */
export function PostBoard({
  posHalamanPertama,
  cursorSeterusnya,
  profileSemasa,
}: {
  posHalamanPertama: Post[];
  cursorSeterusnya: string | null;
  profileSemasa: Profile;
}) {
  const [pos, setPos] = useState(posHalamanPertama);

  function addNewPost(post: Post) {
    setPos((p) => [post, ...p]);
  }

  function appendNextPage(newPosts: Post[]) {
    setPos((p) => [...p, ...newPosts]);
  }

  function removePost(id: string) {
    setPos((p) => p.filter((x) => x.id !== id));
  }

  function updatePost(post: Post) {
    setPos((p) => p.map((x) => (x.id === post.id ? post : x)));
  }

  return (
    <div className="grid gap-4">
      <PostComposer profile={profileSemasa} onPosBaharu={addNewPost} />

      <PostFeed
        pos={pos}
        cursorSeterusnya={cursorSeterusnya}
        profileSemasa={profileSemasa}
        onMuatLanjut={appendNextPage}
        onDipadam={removePost}
        onDikemaskini={updatePost}
      />
    </div>
  );
}
