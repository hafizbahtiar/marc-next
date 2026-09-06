import { NextResponse, type NextRequest } from "next/server";

import { ApiError } from "@/lib/api/errors";
import * as authApi from "@/lib/auth/api";
import {
  COOKIE_AKSES,
  COOKIE_REFRESH,
  buangTokenPadaRespons,
  simpanToken,
} from "@/lib/auth/cookies";
import { labelPeranti } from "@/lib/auth/device";
import { laluanTetamu, ROUTES } from "@/lib/auth/routes";
import type { TokenPair } from "@/lib/api/types";

/**
 * Navigation selepas idle boleh menghasilkan beberapa permintaan RSC serentak.
 * Refresh token ialah single-use, jadi semua permintaan itu mesti berkongsi
 * satu refresh yang sedang berjalan, bukan menghantar token yang sama berkali-kali.
 * Map ini sengaja hanya hidup sepanjang instance proxy semasa; setiap respons
 * tetap menulis pasangan token yang sama kepada pelayar.
 */
const refreshSedangBerjalan = new Map<string, Promise<TokenPair>>();

/**
 * Proxy (Middleware dalam Next 15 dan ke bawah) memegang SATU tanggungjawab
 * yang tak boleh dipegang di tempat lain: memutar access token dan menulis
 * kuki baharu.
 *
 * Komponen dan susun atur pelayan boleh MEMBACA kuki tetapi tak boleh
 * menulisnya, jadi refresh yang cuba berlaku semasa render akan
 * menghanguskan satu refresh token setiap permintaan tanpa pernah dapat
 * menyimpan penggantinya - dan pengesanan guna-semula backend akhirnya
 * membatalkan seluruh family, menendang ahli keluar. Di sini, sebelum
 * render bermula, kuki masih boleh ditulis.
 *
 * Semakan status akaun (pending/rejected/emel belum sah) SENGAJA tiada di
 * sini. Ia memerlukan GET /me, dan dokumentasi Next menegaskan proxy
 * bukan tempat untuk pengambilan data yang perlahan. Gate itu duduk dalam
 * susun atur `(dilindungi)`, tempat backend tetap menjadi penguat kuasa
 * sebenar - proxy cuma mengelakkan lawatan yang jelas sia-sia.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const adaAkses = Boolean(request.cookies.get(COOKIE_AKSES)?.value);
  const rt = request.cookies.get(COOKIE_REFRESH)?.value;

  // Kuki akses luput lebih awal daripada kuki refresh (lihat
  // JURANG_LUPUT_SAAT), jadi keadaan "tiada akses, ada refresh" ialah
  // isyarat putaran yang biasa - bukan pengecualian.
  if (!adaAkses && rt) {
    return await putarToken(request, rt);
  }

  const adaSesi = adaAkses || Boolean(rt);

  if (!adaSesi && !laluanAwamProxy(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.logMasuk;
    url.search = "";
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  if (adaSesi && laluanTetamu(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.utama;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

/**
 * Laluan yang boleh dilalui tanpa sesi. Ini termasuk laluan token
 * (pengesahan emel, tetapkan kata laluan) yang mesti dibuka daripada
 * pautan emel oleh sesiapa sahaja.
 */
function laluanAwamProxy(pathname: string): boolean {
  return (
    pathname === ROUTES.logMasuk ||
    pathname === ROUTES.daftar ||
    pathname === ROUTES.lupaKataLaluan ||
    pathname === ROUTES.tetapKataLaluan ||
    pathname === ROUTES.sahkanEmel ||
    pathname === ROUTES.claimAccount ||
    pathname === ROUTES.tamatSesi ||
    pathname === ROUTES.pelayanLuarTalian ||
    pathname === ROUTES.sokongMARC ||
    // Pemeriksaan kesihatan Railway tiba tanpa kuki. Tanpa baris ini ia
    // dapat 307 ke /log-masuk dan setiap penggunaan ditandakan gagal.
    pathname === ROUTES.sihat
  );
}

async function putarToken(request: NextRequest, rt: string) {
  try {
    const tokens = await refreshTokenSekali(request, rt);

    // Kuki ditulis DUA KALI dengan sengaja. `request.cookies` ialah apa
    // yang komponen pelayan baca dalam render ini; `response.cookies`
    // ialah apa yang pelayar simpan untuk permintaan seterusnya. Menulis
    // satu sahaja bermakna render ini menggunakan token lama, atau
    // pelayar tak pernah menerima token baharu.
    request.cookies.set(COOKIE_AKSES, tokens.access_token);
    request.cookies.set(COOKIE_REFRESH, tokens.refresh_token);
    const response = NextResponse.next({ request });
    simpanToken(response.cookies, tokens);
    return response;
  } catch (error) {
    // 401 di sini bermakna token refresh itu mati - luput, dilog keluar
    // di tempat lain, atau familynya dibatalkan selepas guna-semula
    // dikesan. Tiada apa yang boleh dipulihkan; buang kuki dan minta log
    // masuk semula.
    if (error instanceof ApiError && error.isUnauthorized) {
      const url = request.nextUrl.clone();
      url.pathname = ROUTES.logMasuk;
      url.search = "";
      if (!laluanAwamProxy(request.nextUrl.pathname)) {
        url.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
      }
      const response = NextResponse.redirect(url);
      buangTokenPadaRespons(response);
      return response;
    }

    // Backend tak dapat dihubungi. Kuki DIKEKALKAN - memadamnya di sini
    // akan menjadikan gangguan pelayan sementara sebagai log keluar
    // besar-besaran untuk setiap ahli yang sedang dalam talian.
    //
    // Permintaan itu juga TAK BOLEH diteruskan. Tanpa access token, susun
    // atur yang dilindungi akan melihat "tiada sesi", mengubah hala ke
    // /api/sesi/tamat, dan membuang kuki yang baru sahaja kita pelihara -
    // gangguan seminit menjadi log masuk semula untuk semua orang.
    // Tulis-semula (bukan ubah hala) mengekalkan URL, jadi muat semula
    // membawa ahli kembali ke tempat asalnya sebaik backend pulih.
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.pelayanLuarTalian;
    url.search = "";
    return NextResponse.rewrite(url, { status: 503 });
  }
}

function refreshTokenSekali(request: NextRequest, rt: string): Promise<TokenPair> {
  const sedangBerjalan = refreshSedangBerjalan.get(rt);
  if (sedangBerjalan) return sedangBerjalan;

  const refresh = authApi.refresh(
    rt,
    labelPeranti(request.headers.get("user-agent")),
    // `next/headers` tiada di sini, jadi rantaian diserahkan terus
    // daripada permintaan. Tanpanya, backend merekod alamat pelayan
    // Next sebagai `created_ip` sesi - dan skrin "peranti yang log
    // masuk" memaparkan IP yang sama untuk setiap peranti.
    request.headers.get("x-forwarded-for"),
  ).finally(() => {
    refreshSedangBerjalan.delete(rt);
  });

  refreshSedangBerjalan.set(rt, refresh);
  return refresh;
}

export const config = {
  /**
   * Aset statik dan gambar yang dioptimumkan Next dilangkau: ia tiada
   * kaitan dengan sesi, dan menjalankan putaran token untuk setiap satu
   * akan menggandakan trafik ke backend tanpa sebab.
   */
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
