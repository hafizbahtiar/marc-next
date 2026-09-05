import "server-only";

import { API_INTERNAL_URL } from "@/lib/env";
import { ApiError, ApiUnreachableError } from "./errors";

/**
 * Rantaian `X-Forwarded-For` permintaan masuk, disiarkan semula APA
 * ADANYA kepada backend.
 *
 * Nilai ini TIDAK dihuraikan di sini dengan sengaja. Gin sudah melakukan
 * kerja itu - `validateHeader` (gin.go) melelar rantaian dari KANAN ke
 * KIRI dan memulangkan IP pertama yang bukan proksi dipercayai, jadi
 * entri palsu yang disuntik klien di sebelah kiri diabaikan. Memilih
 * satu entri di sini bermakna menulis semula algoritma itu dalam
 * TypeScript, dan versi yang salah (ambil yang paling kiri, tanpa syarat)
 * akan membenarkan sesiapa memintas had kadar dengan menghantar
 * `X-Forwarded-For: <rawak>` pada setiap percubaan.
 *
 * `null` bila tiada - cth pembangunan tempatan, di mana backend jatuh
 * balik kepada alamat jauh sebenar.
 */
async function rantaianIP(): Promise<string | null> {
  try {
    // Import dinamik: modul ini turut dimuatkan oleh `proxy.ts`, di mana
    // `next/headers` tiada. Di sana rantaian diserahkan secara eksplisit,
    // jadi laluan ini tak pernah dicapai - tetapi import statik akan
    // memecahkan bungkusan proxy walaupun begitu.
    const { headers } = await import("next/headers");
    return (await headers()).get("x-forwarded-for");
  } catch {
    return null;
  }
}

type ApiRequest = {
  method?: "GET" | "POST" | "PATCH" | "DELETE" | "PUT";
  /** Objek biasa; dikodkan sebagai JSON. */
  body?: unknown;
  /** Access token untuk header `Authorization: Bearer`. */
  accessToken?: string;
  /** Header tambahan, cth `X-MARC-Device-Label`. */
  headers?: Record<string, string>;
  signal?: AbortSignal;
  /**
   * Rantaian `X-Forwarded-For` untuk disiarkan semula. Hanya diperlukan
   * daripada `proxy.ts`, yang tak boleh menggunakan `next/headers`;
   * pemanggil lain dilayan secara automatik.
   */
  forwardedFor?: string | null;
};

/**
 * Satu-satunya tempat dalam aplikasi ini yang bercakap dengan backend Go.
 *
 * `cache: "no-store"` pada SEMUA permintaan adalah sengaja. Setiap laluan
 * di sini ialah data per-ahli yang dikawal oleh Bearer token; respons yang
 * di-cache oleh Next akan dikongsi merentas pengguna. Titik akhir awam
 * (cth pengesahan sijil) boleh melonggarkan ini secara eksplisit kemudian
 * - lebih selamat lalai ketat dan longgarkan satu per satu.
 */
export async function apiFetch<T>(
  path: string,
  { method = "GET", body, accessToken, headers, signal, forwardedFor }: ApiRequest = {},
): Promise<T> {
  const finalHeaders: Record<string, string> = { ...headers };

  // TANPA ini, backend melihat setiap pengguna web sebagai SATU klien -
  // alamat pelayan Next. Kesannya bukan kosmetik: baldi had kadar
  // `auth` (12s/5) menjadi kuota yang dikongsi seluruh portal, dan
  // `consumedIPMatches` (internal/http/handlers/auth.go) melayan setiap
  // guna-semula refresh token web sebagai "IP sama", yang melemahkan
  // pengesanan token dicuri yang ia dibina untuk menangkap.
  const rantaian = forwardedFor !== undefined ? forwardedFor : await rantaianIP();
  if (rantaian) {
    finalHeaders["X-Forwarded-For"] = rantaian;
  }
  if (body !== undefined) {
    finalHeaders["Content-Type"] = "application/json";
  }
  if (accessToken) {
    finalHeaders["Authorization"] = `Bearer ${accessToken}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_INTERNAL_URL}${path}`, {
      method,
      headers: finalHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
      signal,
    });
  } catch (cause) {
    throw new ApiUnreachableError(cause);
  }

  // 204 No Content ialah jawapan BERJAYA yang paling biasa dalam API ini
  // (logout, sahkan emel, minta reset kata laluan, batalkan sesi). Ia
  // tiada badan langsung, jadi ia diperiksa sebelum sebarang parse JSON.
  if (response.status === 204) {
    return undefined as T;
  }

  const raw = await response.text();
  let parsed: unknown = undefined;
  if (raw) {
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Backend menjawab bukan-JSON. Ini berlaku pada ralat infrastruktur
      // (halaman ralat proksi, 502 gateway) - bukan sesuatu yang handler
      // Go hasilkan sendiri.
      if (!response.ok) {
        throw new ApiError(response.status, "Pelayan MARC memberi respons yang tidak dijangka.");
      }
      throw new ApiError(response.status, "Respons pelayan tidak boleh dibaca.");
    }
  }

  if (!response.ok) {
    throw new ApiError(response.status, errorMessage(parsed, response.status));
  }

  return parsed as T;
}

/**
 * Handler Go menjawab `{"error": "..."}` dalam Bahasa Melayu. Sandaran
 * per-status di bawah hanya digunakan bila badan itu hilang atau
 * berbentuk lain - jangan tambah kes untuk mesej yang backend memang
 * hantar, itu akan jadi salinan kedua yang hanyut.
 */
function errorMessage(parsed: unknown, status: number): string {
  if (
    typeof parsed === "object" &&
    parsed !== null &&
    "error" in parsed &&
    typeof (parsed as { error: unknown }).error === "string"
  ) {
    return (parsed as { error: string }).error;
  }
  if (status === 429) return "Terlalu banyak percubaan. Cuba sebentar lagi.";
  if (status >= 500) return "Pelayan MARC menghadapi masalah. Cuba sebentar lagi.";
  return "Permintaan gagal.";
}
