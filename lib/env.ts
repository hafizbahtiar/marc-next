/**
 * Konfigurasi persekitaran - SERVER SAHAJA.
 *
 * Tiada satu pun pemboleh ubah di sini berawalan `NEXT_PUBLIC_`, dan itu
 * disengajakan: URL backend tak sepatutnya bocor ke bundle pelayar
 * kerana browser TAK PERNAH memanggil backend Go secara terus. Router
 * `/auth/login`, `/auth/register`, `/auth/refresh` dan `/auth/logout`
 * di backend TIADA middleware CORS (lihat internal/http/middleware/cors.go
 * - CORS dipasang per-route pada laluan awam terpilih sahaja), jadi
 * fetch() silang-origin dari pelayar akan gagal. Next.js bertindak
 * sebagai BFF: setiap panggilan berlaku di server, dan token duduk dalam
 * kuki httpOnly yang JavaScript pelayar tak boleh baca.
 */

/** Buang slash di hujung supaya `${API_INTERNAL_URL}${path}` tak jadi `//auth`. */
function kemas(url: string): string {
  return url.replace(/\/+$/, "");
}

const peribadi = process.env.MARC_API_URL?.trim();
const awam = process.env.MARC_API_PUBLIC_URL?.trim();

if (!peribadi) {
  throw new Error("Tetapkan MARC_API_URL untuk panggilan server-to-server. Salin .env.example ke .env.local.");
}
if (!awam) {
  throw new Error("Tetapkan MARC_API_PUBLIC_URL untuk trigger atau URL yang dicapai dari luar.");
}

/**
 * URL dalaman yang panggilan sisi pelayan gunakan. Jangan tukar kepada
 * URL public sebagai fallback: Railway perlu menggunakan rangkaian
 * private untuk process-to-process traffic.
 */
export const API_INTERNAL_URL = kemas(peribadi);

/**
 * Origin AWAM backend - untuk apa-apa yang mesti dicapai dari LUAR
 * rangkaian peribadi: pautan yang dibuka pelayar, dan nilai yang
 * diserahkan kepada gateway pembayaran.
 *
 * Gunakan hanya untuk trigger/pautan yang perlu dicapai dari luar Railway.
 * Ia tidak boleh digunakan oleh apiFetch untuk panggilan process-to-process.
 */
export const API_PUBLIC_URL = kemas(awam);

/**
 * Nama `.railway.internal` TIADA sijil TLS - rangkaian peribadi Railway
 * sudah disulitkan melalui Wireguard, dan dokumentasinya secara
 * eksplisit menyuruh gunakan `http://`. `https://` ke sana gagal dengan
 * ralat handshake yang tak menyebut TLS langsung, jadi ia ditangkap di
 * sini di mana pembetulannya jelas.
 */
if (API_INTERNAL_URL.startsWith("https://") && API_INTERNAL_URL.includes(".railway.internal")) {
  throw new Error(
    "MARC_API_URL menggunakan https:// pada hos .railway.internal. " +
      "Rangkaian peribadi Railway tiada TLS - guna http:// dan sertakan port, " +
      "cth http://marc-go.railway.internal:8080",
  );
}

/**
 * Rangkaian peribadi Railway memerlukan port yang eksplisit: tiada
 * proksi di depan perkhidmatan dalaman, jadi tiada 80/443 yang tersirat.
 * Tanpa semakan ini, kegagalannya ialah tamat masa sambungan yang senyap.
 */
if (API_INTERNAL_URL.includes(".railway.internal") && !/:\d+$/.test(API_INTERNAL_URL)) {
  throw new Error(
    "MARC_API_URL menunjuk ke hos .railway.internal tanpa port. " +
      "Sertakan port yang perkhidmatan Go dengar, cth :8080",
  );
}

/**
 * Hayat kuki refresh token, dalam hari. MESTI sepadan (atau lebih pendek
 * daripada) REFRESH_TTL backend - kuki yang hidup lebih lama daripada
 * baris `refresh_tokens` dalam DB cuma menghasilkan 401 yang mengelirukan
 * pada refresh, bukan sesi yang lebih panjang.
 */
export const REFRESH_TTL_DAYS = Number(
  process.env.MARC_REFRESH_TTL_DAYS ?? "30",
);

/** Kuki `Secure` di luar pembangunan tempatan. */
export const COOKIE_SECURE = process.env.NODE_ENV === "production";
