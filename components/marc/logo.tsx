import Image from "next/image";
import { cn } from "cn";

/**
 * Logo MARC sebenar, disalin daripada `assets/splash` dalam marc_flutter
 * supaya web dan aplikasi mudah alih menunjukkan tanda yang SAMA.
 *
 * Tiga varian kerana satu fail tak boleh melayan setiap permukaan:
 *
 * - `penuh` — jata + "KELAB SUKAN DAN REKREASI MAIWP". Teksnya navy
 *   gelap, jadi ia hanya boleh dibaca atas permukaan CERAH.
 * - `jata`  — lambang sahaja. Berdiri sendiri pada saiz kecil (bar atas),
 *   di mana wordmark dalam varian `penuh` akan menjadi comotan.
 * - `wordmark` — "MARC" serif PUTIH. Untuk permukaan GELAP sahaja;
 *   ia halimunan atas krim.
 *
 * Setiap varian membawa dimensi asalnya supaya Next boleh menempah
 * ruang susun atur dan mengelakkan anjakan tataletak semasa memuat.
 */
const VARIAN = {
  penuh: {
    src: "/marc-logo-penuh.png",
    width: 1052,
    height: 1054,
    alt: "MARC — Kelab Sukan dan Rekreasi MAIWP",
  },
  jata: {
    src: "/marc-jata.png",
    width: 519,
    height: 481,
    alt: "MARC",
  },
  wordmark: {
    src: "/marc-wordmark-putih.png",
    width: 1400,
    height: 460,
    alt: "MARC",
  },
} as const;

export type VarianLogo = keyof typeof VARIAN;

export function Logo({
  varian = "jata",
  className,
  priority = false,
}: {
  varian?: VarianLogo;
  /** Kawal SAIZ di sini (cth `h-8 w-auto`). */
  className?: string;
  /**
   * Set pada logo yang berada dalam paparan pertama skrin auth — ia
   * elemen jenama terbesar di situ, dan memuatkannya lewat menjadikan
   * halaman kelihatan separuh siap.
   */
  priority?: boolean;
}) {
  const v = VARIAN[varian];

  return (
    <Image
      src={v.src}
      alt={v.alt}
      width={v.width}
      height={v.height}
      priority={priority}
      className={cn("w-auto object-contain", className)}
    />
  );
}
