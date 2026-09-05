# Modul Auth - marc_next

Modul ini menghubungkan portal web MARC kepada backend Go (`marc_go`).
Dokumen ini merekod keputusan yang **tak dapat dibaca daripada kod**.

## Kenapa Next.js jadi BFF, bukan pelanggan API biasa

Backend Go memasang CORS **per-laluan**, bukan global
(`internal/http/middleware/cors.go`). Hanya tiga laluan mendapatnya:

- `POST /auth/verify-email/confirm`
- `POST /auth/password-reset/confirm`
- `GET /verify/certificates/:token`

`/auth/login`, `/auth/register`, `/auth/refresh`, `/auth/logout` dan
setiap laluan ahli **tiada CORS**. `fetch()` silang-origin daripada
pelayar akan gagal pada preflight.

Jadi pelayar **tak pernah** bercakap dengan Go. Setiap panggilan berlaku
pada pelayan Next (`lib/api/client.ts` ialah satu-satunya tempat yang
memanggil `API_URL`), dan token duduk dalam kuki `httpOnly` yang skrip
klien tak boleh baca. `MARC_API_URL` sengaja **tiada** awalan
`NEXT_PUBLIC_`.

Kesan sampingan yang berguna: XSS pada mana-mana halaman tak boleh
mengambil sesi, tak seperti token dalam `localStorage`.

## IP klien: kenapa `X-Forwarded-For` disiarkan semula

Seni bina BFF mempunyai satu harga yang mesti dibayar secara eksplisit:
backend melihat setiap pengguna web tiba dari **satu** alamat - pelayan
Next.

Dua sistem dalam `marc_go` menggunakan `c.ClientIP()` sebagai identiti:

- **Had kadar.** `RateLimiter.Limit` kunci baldinya pada IP. Satu alamat
  bermakna baldi `auth` (12s/5 burst) menjadi kuota yang dikongsi
  **seluruh portal** - lima cubaan log masuk seminit untuk semua orang.
- **Pengesanan token dicuri.** `consumedIPMatches`
  (`internal/http/handlers/auth.go`) hanya memaafkan guna-semula refresh
  token sebagai perlumbaan bila ia datang dari IP yang sama dengan
  permintaan yang menang. Satu alamat bermakna **setiap** guna-semula web
  lulus semakan itu - tepat perlindungan yang komennya dibina untuk
  menangkap.

Jadi `apiFetch` menyiarkan semula rantaian `X-Forwarded-For` permintaan
masuk pada setiap panggilan backend.

Rantaian itu **tidak dihuraikan di sini**. Gin sudah melakukannya:
`validateHeader` melelar dari **kanan ke kiri** dan memulangkan IP
pertama yang bukan proksi dipercayai, jadi entri yang disuntik klien di
sebelah kiri kalah. Memilih satu entri di Next bermakna menulis semula
algoritma itu dalam TypeScript - dan versi yang salah (ambil `[0]` tanpa
syarat) membenarkan sesiapa memintas had kadar dengan menghantar
`X-Forwarded-For: <rawak>` pada setiap percubaan.

Tiada perubahan backend diperlukan: `trustedProxyRanges`
(`internal/http/router.go`) sudah mengandungi `100.64.0.0/10`, julat
rangkaian peribadi Railway yang Next berhubung daripadanya. Kontrak itu
dikunci oleh `TestClientIPMerentasProksi` dalam repo `marc_go` - menambah
atau membuang julat dalam senarai itu menggagalkan ujian dan bukan
menyebabkan pepijat senyap.

`proxy.ts` menyerahkan rantaian secara **eksplisit**, kerana
`next/headers` tak wujud dalam runtime proxy.

> **Pembangunan tempatan berbeza.** Loopback tiada dalam
> `trustedProxyRanges`, jadi backend mengabaikan XFF dan mengira setiap
> permintaan sebagai `127.0.0.1`. Penyiaran semula ini hanya boleh
> diperhatikan di staging.

## Di mana refresh berlaku, dan kenapa hanya di situ

**`proxy.ts` sahaja.**

Komponen dan susun atur pelayan boleh **membaca** kuki tetapi tak boleh
**menulisnya**. Refresh yang dicuba semasa render akan menghanguskan satu
refresh token setiap permintaan tanpa dapat menyimpan penggantinya - dan
pengesanan guna-semula backend (`refreshReuseGraceWindow`,
`internal/http/handlers/auth.go`) akhirnya membatalkan seluruh *family*,
menendang ahli keluar dari semua peranti.

Isyarat putaran ialah **"kuki akses tiada, kuki refresh ada"**. Kuki
akses diberi `maxAge = expires_in - 30s`, jadi ia luput sebelum tokennya
sendiri dan keadaan itu berlaku secara semula jadi.

Proxy menulis kuki **dua kali** pada putaran:
`request.cookies.set()` supaya render ini nampak token baharu, dan
`response.cookies.set()` supaya pelayar menyimpannya.

## Bila backend tak dapat dihubungi

Kuki **tidak** dipadam. Gangguan seminit tak patut menjadi log keluar
besar-besaran.

Permintaan juga tak diteruskan: tanpa access token, susun atur yang
dilindungi akan melihat "tiada sesi" dan mengubah hala ke
`/api/sesi/tamat`, yang memadam kuki yang baru sahaja dipelihara. Sebab
itu proxy **menulis-semula** (bukan mengubah hala) ke
`/pelayan-luar-talian` dengan status 503 - URL kekal, jadi muat semula
membawa ahli kembali ke tempat asalnya.

## Lapisan gate

| Lapisan | Tempat | Menyemak |
|---|---|---|
| Kewujudan kuki | `proxy.ts` | Ada sesi atau tidak. Tiada panggilan DB. |
| Status akaun | `app/(dilindungi)/layout.tsx` | `skrinGate()` - pending / rejected / emel belum sah |
| Kuat kuasa sebenar | backend Go | `RequireAuth` → `RequireApprovedStatus` → `RequireVerifiedEmail` |

Dua lapisan pertama **bukan sempadan keselamatan**. Ia wujud supaya ahli
melihat penjelasan dan bukan 403. Backend yang menguatkuasakan.

Urutan dalam `skrinGate()` mengikut urutan middleware backend: kelulusan
**sebelum** pengesahan emel. Terbalikkannya dan ahli pending akan
dihantar ke skrin "sahkan emel" yang butang hantar semulanya memang akan
gagal dengan 403 - laluan `POST /auth/verify-email/request` duduk di
bawah `RequireApprovedStatus`.

## Perangkap yang sudah ditemui (jangan ulang)

**Fail `"use server"` hanya boleh mengeksport fungsi async.** Pemalar
`KEADAAN_AWAL` pernah duduk dalam `lib/auth/actions.ts`. Ia lulus
`next build` dan meletup pada POST pertama dengan *"A 'use server' file
can only export async functions, found object."* Sebab itu ia kini dalam
`lib/auth/borang.ts`.

**`redirect()` mesti di luar `try`/`catch`.** Ia melempar isyarat kawalan
dalaman; `catch` akan menangkapnya dan menjadikan tindakan yang berjaya
kelihatan seperti ralat.

**Token tak ditebus semasa memuatkan halaman.** `/sahkan-emel` dan
`/tetap-kata-laluan` memaparkan butang, bukan menebus token pada GET.
Backend memadam token pada percubaan pertama, jadi pengimbas pautan klien
emel atau pra-ambil pelayar akan menghanguskan pautan sebelum ahli
mengklik apa-apa.

## Peraturan yang disalin daripada backend

`lib/auth/phone.ts` ialah port **tepat** `phone.NormalizeMY`
(`internal/phone/phone.go`). Salinan ketiga ada dalam `shared/phone.dart`
(marc_flutter). Ketiga-tiganya mesti berubah bersama - perbezaan
bermakna borang menerima nombor yang backend tolak.

`lib/auth/schemas.ts` mencerminkan tag `binding` struct Go. Ia bukan
sumber kebenaran (backend mengesahkan semula) - ia yang memberi maklum
balas per-medan sebelum satu pun permintaan rangkaian.

## Env

| Nama | Wajib | Nota |
|---|---|---|
| `MARC_API_URL` | ya* | URL yang **pelayan** Next guna. Railway: rangkaian peribadi. |
| `MARC_API_PUBLIC_URL` | ya* | Origin **awam** `marc_go`. Sandaran untuk `MARC_API_URL`. |
| `MARC_REFRESH_TTL_DAYS` | tidak (30) | Padankan dengan `REFRESH_TTL` backend. Kuki yang hidup lebih lama daripada baris DB hanya menghasilkan 401 yang mengelirukan. |

\* Sekurang-kurangnya **satu** daripada dua yang pertama. `MARC_API_URL`
menang bila kedua-duanya ada; `MARC_API_PUBLIC_URL` mengambil alih bila
ia tiada, supaya persekitaran tanpa rangkaian peribadi berjalan tanpa
perubahan kod. Kedua-duanya server sahaja - tiada `NEXT_PUBLIC_`.

### Railway

```
MARC_API_URL=http://${{marc_go.RAILWAY_PRIVATE_DOMAIN}}:8080
MARC_API_PUBLIC_URL=https://${{marc_go.RAILWAY_PUBLIC_DOMAIN}}
```

Rangkaian peribadi ada tiga syarat yang `lib/env.ts` kuatkuasakan atau
dokumenkan: `http://` sahaja (tiada TLS pada `.railway.internal` -
trafik sudah disulitkan Wireguard), **port wajib** (tiada proksi di
depan, jadi tiada 443 tersirat), dan ia **runtime sahaja** - DNS
peribadi tak wujud semasa build, jadi jangan sekali-kali memanggil API
semasa fasa itu.

Persekitaran Railway yang dicipta sebelum 16 Okt 2025 menyelesaikan
`.railway.internal` kepada **IPv6 sahaja**, dan `fetch` Node (undici)
diketahui tergantung di situ. Kalau URL peribadi tamat masa sedangkan
URL awam berfungsi, tetapkan `NODE_OPTIONS=--dns-result-order=ipv4first`
pada perkhidmatan Next.

Backend perlu `PASSWORD_RESET_URL` menunjuk ke
`<web>/tetap-kata-laluan` dan `EMAIL_VERIFY_URL` ke `<web>/sahkan-emel`,
jika tidak `/auth/password-reset/request` menjawab 503 dan pautan
pengesahan jatuh ke halaman HTML Go sendiri.
