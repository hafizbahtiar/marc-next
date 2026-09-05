import { NextResponse } from "next/server";

/**
 * Pemeriksaan kesihatan untuk Railway (`healthcheckPath`).
 *
 * Ia menyemak SATU perkara: proses Next ini hidup dan boleh menjawab.
 * Ia SENGAJA tidak menghubungi backend Go. Railway menggunakan
 * pemeriksaan ini sebagai pintu pagar penggunaan — kalau ia turut
 * menguji backend, gangguan pada perkhidmatan Go akan menyekat setiap
 * penggunaan web, termasuk penggunaan yang membaiki gangguan itu.
 *
 * Laluan ini mesti berada dalam senarai awam `proxy.ts`. Tanpa itu ia
 * mewarisi gate sesi, menjawab 307 ke /log-masuk, dan Railway menandakan
 * penggunaan yang sihat sebagai gagal.
 */
export function GET() {
  return NextResponse.json(
    { status: "ok" },
    // Pemeriksaan kesihatan yang di-cache tak memeriksa apa-apa.
    { headers: { "Cache-Control": "no-store" } },
  );
}
