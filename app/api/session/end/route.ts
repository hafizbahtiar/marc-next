import { NextResponse, type NextRequest } from "next/server";

import { buangTokenPadaRespons } from "@/lib/auth/cookies";
import { destinasiSelamat, ROUTES } from "@/lib/auth/routes";

/**
 * Jalan keluar untuk kuki yang backend tolak.
 *
 * Komponen pelayan boleh membaca kuki tetapi tak boleh memadamnya, jadi
 * apabila GET /me menjawab 401 dengan kuki yang masih ada (rahsia JWT
 * diputar, akaun dipadam), susun atur tak dapat membersihkannya sendiri
 * — ia mengubah hala ke sini, di mana pengendali laluan memang boleh
 * menulis kuki.
 *
 * Ini BUKAN butang log keluar. `logKeluarAction` yang memberitahu backend
 * supaya membatalkan refresh token; laluan ini hanya membuang kuki
 * tempatan yang sudah tak bernilai, jadi ia selamat sebagai GET (ia tak
 * boleh dipacu oleh tapak lain untuk membatalkan sesi sebenar sesiapa —
 * paling teruk ia memaksa satu log masuk semula).
 */
export function GET(request: NextRequest) {
  const url = request.nextUrl.clone();
  const next = destinasiSelamat(request.nextUrl.searchParams.get("next"));

  url.pathname = ROUTES.logMasuk;
  url.search = "";
  if (next !== ROUTES.utama) {
    url.searchParams.set("next", next);
  }

  const response = NextResponse.redirect(url);
  buangTokenPadaRespons(response);
  return response;
}
