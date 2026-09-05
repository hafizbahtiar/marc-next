"use client";

import { useState } from "react";

import { KomposerPos } from "@/components/posts/komposer-pos";
import { SuapanPos } from "@/components/posts/suapan-pos";
import type { Post, Profile } from "@/lib/api/types";

/**
 * "Papan pos" — pembungkus klien yang memiliki senarai post kongsi antara
 * `KomposerPos` (cipta) dan `SuapanPos` (papar/padam/edit). Ia wujud kerana
 * `page.tsx` ialah Server Component dan tak boleh memegang state callback
 * klien; tanpa pembungkus ini, `revalidatePath` selepas tindakan pelayan
 * me-render semula pokok pelayan tetapi instance `SuapanPos` yang sedia ada
 * dikekalkan React merentasi render itu, jadi `useState` awalnya tak
 * dijalankan semula dan senarai kekal lapuk. Sila lihat Finding 1 dalam
 * laporan pembetulan akhir untuk butiran.
 */
export function PapanPos({
  posHalamanPertama,
  cursorSeterusnya,
  profileSemasa,
}: {
  posHalamanPertama: Post[];
  cursorSeterusnya: string | null;
  profileSemasa: Profile;
}) {
  const [pos, setPos] = useState(posHalamanPertama);

  function tambahPosBaharu(post: Post) {
    setPos((p) => [post, ...p]);
  }

  function tambahHalamanSeterusnya(posBaharu: Post[]) {
    setPos((p) => [...p, ...posBaharu]);
  }

  function padamPos(id: string) {
    setPos((p) => p.filter((x) => x.id !== id));
  }

  function kemaskiniPos(post: Post) {
    setPos((p) => p.map((x) => (x.id === post.id ? post : x)));
  }

  return (
    <>
      <KomposerPos profile={profileSemasa} onPosBaharu={tambahPosBaharu} />

      <SuapanPos
        pos={pos}
        cursorSeterusnya={cursorSeterusnya}
        profileSemasa={profileSemasa}
        onMuatLanjut={tambahHalamanSeterusnya}
        onDipadam={padamPos}
        onDikemaskini={kemaskiniPos}
      />
    </>
  );
}
