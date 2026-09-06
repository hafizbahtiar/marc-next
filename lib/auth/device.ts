/**
 * Label peranti untuk skrin "sesi aktif" (GET /me/sessions).
 *
 * Backend menyimpan header `X-MARC-Device-Label` bila ada dan jatuh
 * balik kepada User-Agent HTTP bila tiada (lihat deviceLabelFromRequest,
 * internal/http/handlers/auth.go). Sandaran itu tak menolong di sini:
 * dalam seni bina BFF, permintaan yang backend nampak datang daripada
 * pelayan Next, jadi User-Agentnya ialah runtime Node - SETIAP sesi web
 * akan kelihatan serupa. Label eksplisit ini yang membuat senarai sesi
 * bermakna untuk pengguna web.
 */
export function labelPeranti(userAgent: string | null | undefined): string {
  if (!userAgent) return "Pelayar web";

  const pelayar =
    // Urutan penting: Edge dan Opera turut membawa "Chrome" dalam UA
    // mereka, dan Chrome membawa "Safari". Padanan yang lebih spesifik
    // mesti diuji dahulu.
    /Edg\//.test(userAgent) ? "Edge" :
    /OPR\/|Opera/.test(userAgent) ? "Opera" :
    /Firefox\//.test(userAgent) ? "Firefox" :
    /Chrome\//.test(userAgent) ? "Chrome" :
    /Safari\//.test(userAgent) ? "Safari" :
    "Pelayar";

  const platform =
    /iPhone|iPad|iPod/.test(userAgent) ? "iOS" :
    /Android/.test(userAgent) ? "Android" :
    /Mac OS X/.test(userAgent) ? "macOS" :
    /Windows/.test(userAgent) ? "Windows" :
    /Linux/.test(userAgent) ? "Linux" :
    null;

  // Guna "-" bukan "·": nilai ni pergi terus dalam header HTTP
  // (X-MARC-Device-Label), yang dihantar sebagai bait Latin-1 - aksara
  // bukan-ASCII macam "·" (U+00B7) sampai sebagai bait tunggal 0xB7 yang
  // BUKAN UTF-8 sah, dan backend tolak dengan SQLSTATE 22021 bila cuba
  // simpan terus ke lajur Postgres (lihat issueTokens, auth.go).
  return platform ? `${pelayar} - ${platform} (web)` : `${pelayar} (web)`;
}
