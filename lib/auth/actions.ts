"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { ZodError } from "zod";

import { ApiError, ApiUnreachableError } from "@/lib/api/errors";
import * as authApi from "./api";
import type { KeadaanBorang } from "./borang";
import { buangToken, simpanToken } from "./cookies";
import { labelPeranti } from "./device";
import {
  skemaDaftar,
  skemaLogMasuk,
  skemaLupaKataLaluan,
  skemaTetapKataLaluan,
} from "./schemas";
import { destinasiSelamat, ROUTES } from "./routes";
import { accessToken, dapatkanSesi, refreshToken } from "./session";


function ralatMedan(error: ZodError): Record<string, string> {
  const hasil: Record<string, string> = {};
  for (const isu of error.issues) {
    const kunci = String(isu.path[0] ?? "_");
    // Isu PERTAMA setiap medan yang menang. Menyusun beberapa mesej di
    // bawah satu input membuat borang bising tanpa memberitahu apa-apa
    // yang tak diberitahu oleh mesej pertama.
    if (!(kunci in hasil)) hasil[kunci] = isu.message;
  }
  return hasil;
}

/**
 * Tukar apa-apa yang dilemparkan oleh lapisan API kepada `KeadaanBorang`.
 * Melemparkan semula yang tak dikenali adalah sengaja: ralat pengaturcaraan
 * patut mencapai sempadan ralat, bukan menyamar sebagai kegagalan borang.
 */
function keadaanRalat(error: unknown, nilai?: Record<string, string>): KeadaanBorang {
  if (error instanceof ApiError || error instanceof ApiUnreachableError) {
    return { ralat: error.message, nilai };
  }
  throw error;
}

async function label(): Promise<string> {
  const h = await headers();
  return labelPeranti(h.get("user-agent"));
}

// --- Log masuk -------------------------------------------------------

export async function logMasukAction(
  _prev: KeadaanBorang,
  formData: FormData,
): Promise<KeadaanBorang> {
  const mentah = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };
  const nilai = { email: mentah.email };

  const disahkan = skemaLogMasuk.safeParse(mentah);
  if (!disahkan.success) {
    return { medan: ralatMedan(disahkan.error), nilai };
  }

  try {
    const tokens = await authApi.login(disahkan.data, await label());
    simpanToken(await cookies(), tokens);
  } catch (error) {
    return keadaanRalat(error, nilai);
  }

  // `redirect` melempar isyarat kawalan dalaman, jadi ia MESTI berada di
  // luar `try` di atas - `catch` akan menangkapnya dan menjadikan log
  // masuk yang berjaya kelihatan seperti ralat yang tak dikenali.
  redirect(destinasiSelamat(String(formData.get("next") ?? "")));
}

// --- Pendaftaran -----------------------------------------------------

export async function daftarAction(
  _prev: KeadaanBorang,
  formData: FormData,
): Promise<KeadaanBorang> {
  const mentah = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    sahkan_password: String(formData.get("sahkan_password") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    staff_id: String(formData.get("staff_id") ?? ""),
  };
  const nilai = {
    email: mentah.email,
    phone: mentah.phone,
    staff_id: mentah.staff_id,
  };

  const disahkan = skemaDaftar.safeParse(mentah);
  if (!disahkan.success) {
    return { medan: ralatMedan(disahkan.error), nilai };
  }

  try {
    const { email, password, phone, staff_id } = disahkan.data;
    const tokens = await authApi.register({ email, password, phone, staff_id }, await label());
    // Backend mengeluarkan token terus pada 201 - ahli baharu log masuk
    // serta-merta, dan skrin "menunggu kelulusan" itulah yang
    // memberitahunya apa yang berlaku seterusnya.
    simpanToken(await cookies(), tokens);
  } catch (error) {
    return keadaanRalat(error, nilai);
  }

  redirect(ROUTES.utama);
}

// --- Log keluar ------------------------------------------------------

export async function logKeluarAction(): Promise<void> {
  const rt = await refreshToken();
  const store = await cookies();

  if (rt) {
    try {
      await authApi.logout(rt);
    } catch {
      // Log keluar mesti berjaya secara tempatan walau backend tak dapat
      // dihubungi. Baris token yang tertinggal akan luput sendiri; kuki
      // yang tertinggal akan membuat ahli percaya dia masih log masuk.
    }
  }
  buangToken(store);

  redirect(ROUTES.logMasuk);
}

export async function logKeluarSemuaAction(): Promise<void> {
  const at = await accessToken();
  const store = await cookies();

  if (at) {
    try {
      await authApi.logoutAll(at);
    } catch {
      // Sama alasan dengan logKeluarAction.
    }
  }
  buangToken(store);

  redirect(ROUTES.logMasuk);
}

export async function batalkanSesiAction(
  _prev: KeadaanBorang,
  formData: FormData,
): Promise<KeadaanBorang> {
  const at = await accessToken();
  if (!at) return { ralat: "Sesi anda sudah tamat." };

  const id = String(formData.get("id") ?? "");
  if (!id) return { ralat: "Sesi tidak dijumpai." };

  try {
    await authApi.batalkanSesi(at, id);
  } catch (error) {
    return keadaanRalat(error);
  }

  revalidatePath(ROUTES.utama);
  return { berjaya: "Peranti itu telah dilog keluar." };
}

// --- Reset kata laluan -----------------------------------------------

export async function lupaKataLaluanAction(
  _prev: KeadaanBorang,
  formData: FormData,
): Promise<KeadaanBorang> {
  const mentah = { email: String(formData.get("email") ?? "") };

  const disahkan = skemaLupaKataLaluan.safeParse(mentah);
  if (!disahkan.success) {
    return { medan: ralatMedan(disahkan.error), nilai: mentah };
  }

  try {
    await authApi.mintaResetKataLaluan(disahkan.data.email);
  } catch (error) {
    return keadaanRalat(error, mentah);
  }

  // Backend menjawab 204 sama ada akaun itu wujud atau tidak, supaya
  // titik akhir ini tak boleh digunakan untuk menyenaraikan emel yang
  // berdaftar. Mesej di sini mesti mengekalkan sifat itu - "kalau emel
  // itu berdaftar", bukan "emel dihantar".
  return {
    berjaya:
      "Kalau emel itu berdaftar dengan MARC, kami telah menghantar pautan reset kata laluan. Semak peti masuk (dan folder spam) anda.",
  };
}

export async function tetapKataLaluanAction(
  _prev: KeadaanBorang,
  formData: FormData,
): Promise<KeadaanBorang> {
  const mentah = {
    token: String(formData.get("token") ?? ""),
    password: String(formData.get("password") ?? ""),
    sahkan_password: String(formData.get("sahkan_password") ?? ""),
  };

  const disahkan = skemaTetapKataLaluan.safeParse(mentah);
  if (!disahkan.success) {
    return { medan: ralatMedan(disahkan.error) };
  }

  try {
    await authApi.sahkanResetKataLaluan(disahkan.data.token, disahkan.data.password);
    // Backend membatalkan SETIAP sesi apabila kata laluan ditukar
    // (DeleteRefreshTokensByUser dalam transaksi yang sama). Kuki di
    // pelayar ini kini menunjuk kepada token yang sudah mati, jadi ia
    // dibuang di sini dan bukan dibiarkan gagal kemudian.
    buangToken(await cookies());
  } catch (error) {
    return keadaanRalat(error);
  }

  redirect(`${ROUTES.logMasuk}?reset=berjaya`);
}

// --- Pengesahan emel -------------------------------------------------

export async function hantarSemulaPengesahanAction(
  _prev: KeadaanBorang,
  _formData: FormData,
): Promise<KeadaanBorang> {
  const sesi = await dapatkanSesi();
  if (!sesi) return { ralat: "Sesi anda sudah tamat. Sila log masuk semula." };

  try {
    await authApi.mintaPengesahanEmel(sesi.accessToken);
  } catch (error) {
    return keadaanRalat(error);
  }

  return { berjaya: `Emel pengesahan dihantar ke ${sesi.profile.email}. Pautan itu sah selama 1 jam.` };
}

/**
 * Tebus token pengesahan emel.
 *
 * Ini ialah tindakan (POST) dan bukan kesan sampingan semasa memuatkan
 * halaman, walaupun backend turut menyediakan laluan GET yang menebus
 * token. Sebabnya: penebusan itu memadam token, dan pemuatan halaman
 * berlaku tanpa niat pengguna - pengimbas pautan klien emel, pra-ambil
 * pelayar, atau lawatan semula daripada sejarah akan menghanguskan
 * pautan dan menunjukkan "token tidak sah" kepada ahli yang belum pun
 * mengklik apa-apa.
 */
export async function sahkanEmelAction(
  _prev: KeadaanBorang,
  formData: FormData,
): Promise<KeadaanBorang> {
  const token = String(formData.get("token") ?? "");
  if (!token) return { ralat: "Pautan tidak sah." };

  try {
    await authApi.sahkanEmel(token);
  } catch (error) {
    return keadaanRalat(error);
  }

  // Kelayakan tak berubah - status `email_verified` yang berubah, dan itu
  // dibaca semula oleh GET /me pada render seterusnya.
  revalidatePath(ROUTES.utama);
  return { berjaya: "Emel anda telah disahkan." };
}
