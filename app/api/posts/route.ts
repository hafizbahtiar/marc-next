import { type NextRequest, NextResponse } from "next/server";

import { ApiError, ApiUnreachableError } from "@/lib/api/errors";
import { accessToken } from "@/lib/auth/session";
import { listPosts } from "@/lib/posts/api";

/**
 * Proksi halaman KEDUA dan seterusnya feed (GET /posts?cursor=).
 *
 * Halaman PERTAMA dimuat oleh `app/(dilindungi)/posts/page.tsx` (komponen
 * pelayan). Halaman berikutnya dicetuskan oleh scroll di klien - Server
 * Action tak sesuai untuk GET yang dipacu scroll (ia direka untuk
 * mutasi/borang), jadi laluan API biasa ini yang dipanggil terus daripada
 * `SuapanPos` guna `fetch`.
 */
export async function GET(request: NextRequest) {
  const token = await accessToken();
  if (!token) {
    return NextResponse.json({ error: "Sesi tidak sah." }, { status: 401 });
  }

  const cursor = request.nextUrl.searchParams.get("cursor") ?? undefined;

  try {
    const hasil = await listPosts(token, cursor);
    return NextResponse.json(hasil, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof ApiUnreachableError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    throw error;
  }
}
