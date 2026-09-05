/**
 * Laluan aplikasi, dinamakan sekali di sini. `proxy.ts`, tindakan
 * pelayan dan komponen semuanya merujuk pemalar ini — laluan dalam
 * Bahasa Melayu mudah tersalah eja, dan salah eja dalam senarai
 * pemadanan proxy gagal secara SENYAP (halaman jadi terdedah, bukan
 * pecah).
 */
export const ROUTES = {
  logMasuk: "/log-masuk",
  daftar: "/daftar",
  lupaKataLaluan: "/lupa-kata-laluan",
  tetapKataLaluan: "/tetap-kata-laluan",
  sahkanEmel: "/sahkan-emel",
  utama: "/",
  pos: "/posts",
  menungguKelulusan: "/menunggu-kelulusan",
  akaunDitolak: "/akaun-ditolak",
  sahkanEmelAnda: "/sahkan-emel-anda",
  tamatSesi: "/api/sesi/tamat",
  pelayanLuarTalian: "/pelayan-luar-talian",
  sihat: "/api/sihat",
} as const;

/**
 * Laluan yang boleh dilawati TANPA sesi. Pelawat yang SUDAH log masuk
 * dihalang daripada halaman ini (kecuali laluan token di bawah).
 */
export const LALUAN_TETAMU: readonly string[] = [
  ROUTES.logMasuk,
  ROUTES.daftar,
  ROUTES.lupaKataLaluan,
];

/**
 * Laluan awam yang dibuka melalui PAUTAN DALAM EMEL. Ia mesti berfungsi
 * sama ada ahli log masuk atau tidak: seseorang boleh klik pautan
 * pengesahan dari telefon yang sudah ada sesi, dan mengalihkannya ke
 * papan pemuka akan membuang token dalam URL sebelum ia sempat ditebus.
 */
export const LALUAN_TOKEN: readonly string[] = [
  ROUTES.tetapKataLaluan,
  ROUTES.sahkanEmel,
];

export function laluanAwam(pathname: string): boolean {
  return [...LALUAN_TETAMU, ...LALUAN_TOKEN].some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function laluanTetamu(pathname: string): boolean {
  return LALUAN_TETAMU.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * Sanitasi parameter `?next=` sebelum ia digunakan sebagai destinasi
 * ubah hala. Hanya laluan relatif satu-slash diterima: tanpa semakan ini
 * `?next=https://penipu.example` menjadikan skrin log masuk MARC sebagai
 * pelantar ubah hala terbuka untuk pancingan data.
 */
export function destinasiSelamat(next: string | null | undefined): string {
  if (!next) return ROUTES.utama;
  if (!next.startsWith("/") || next.startsWith("//")) return ROUTES.utama;
  if (laluanAwam(next)) return ROUTES.utama;
  return next;
}
