import { KUNCI_TEMA } from "@/lib/tema";

/**
 * Menetapkan tema SEBELUM cat pertama.
 *
 * Tanpa ini, halaman dilukis dalam mod cerah dan kemudian bertukar
 * kepada gelap sebaik React hidrat — kilatan putih yang paling ketara
 * tepat pada waktu malam, iaitu bila mod gelap paling mungkin digunakan.
 * Ia mesti berjalan segerak dalam `<head>`, jadi ia skrip sebaris dan
 * bukan kesan dalam komponen.
 *
 * Logik padanan `ThemeModeNotifier` (marc_flutter): pilihan tersimpan
 * menang; kalau tiada, ikut kecerahan sistem. Mod tema ialah BINARI
 * (cerah/gelap) di kedua-dua klien — "ikut sistem" ialah keadaan awal,
 * bukan pilihan ketiga yang disimpan.
 */
export function SkripTemaAwal() {
  const skrip = `try{var t=localStorage.getItem(${JSON.stringify(KUNCI_TEMA)});var d=t?t==="dark":matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d)}catch(e){}`;

  return <script dangerouslySetInnerHTML={{ __html: skrip }} />;
}
