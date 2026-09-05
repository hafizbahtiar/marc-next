# Railway — marc_next

`marc_next` ialah perkhidmatan **kedua** dalam projek Railway `marc`,
di sebelah `marc_go`. Tiada Docker (Railpack), sama seperti backend.

```
projek: marc
environment: staging · production
├── marc_go     perkhidmatan Go + Postgres plugin
└── marc_next   perkhidmatan ini
```

Meletakkannya dalam projek yang **sama** bukan sekadar kemas: rangkaian
peribadi Railway hanya wujud dalam satu projek + environment. Perkhidmatan
dalam projek berasingan mesti bercakap melalui internet awam.

## Pemboleh ubah persekitaran

| Nama | Nilai Railway |
|---|---|
| `MARC_API_URL` | `http://${{marc_go.RAILWAY_PRIVATE_DOMAIN}}:8080` |
| `MARC_API_PUBLIC_URL` | `https://${{marc_go.RAILWAY_PUBLIC_DOMAIN}}` |
| `MARC_REFRESH_TTL_DAYS` | `30` — padankan dengan `REFRESH_TTL` marc_go |

Gantikan `marc_go` dengan nama perkhidmatan sebenar kalau ia berbeza;
rujukan `${{...}}` diselesaikan mengikut **nama perkhidmatan**, bukan
nama repo.

Penjelasan penuh setiap satu ada dalam
[`.env.example`](../.env.example) dan [`docs/auth.md`](./auth.md).

### `PORT`

Jangan tetapkan. Railway menyuntiknya, dan `next start` membacanya
sendiri. Ia juga **tak boleh** diletak dalam `.env` — pelayan HTTP
dinaikkan sebelum Next memuatkan fail env, jadi nilai di situ diabaikan
secara senyap.

### `NODE_ENV`

Jangan tetapkan. `next start` sudah menetapkannya kepada `production`,
dan nilai itu **membawa muatan**: `lib/env.ts` menjadikan kuki sesi
`Secure` hanya apabila `NODE_ENV === "production"`. Menimpanya dengan
apa-apa nilai lain menghantar token sesi melalui HTTP kosong.

## Build & start

Railpack mengesan `bun.lock` dan `packageManager: bun@1.4.0` dalam
`package.json`, jadi ia menggunakan bun tanpa konfigurasi.

| | Arahan |
|---|---|
| Build | `bun run build` |
| Start | `bun run start` |

Binaan ialah keluaran Next standard (bukan `standalone`), jadi
`node_modules` mesti kekal selepas build — itu tingkah laku lalai
Railpack, jangan tambah langkah pemangkasan.

## Config as code

Tidak wajib — tetapan papan pemuka sudah memadai. Kalau mahu ia
dijejaki git, letak `railway.json` di akar repo:

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "builder": "RAILPACK",
    "buildCommand": "bun run build"
  },
  "deploy": {
    "startCommand": "bun run start",
    "healthcheckPath": "/api/sihat",
    "healthcheckTimeout": 120,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

Konfigurasi dalam kod **menimpa** papan pemuka, jadi selepas menambah
fail ini, papan pemuka berhenti menjadi tempat perubahan dibuat.

## Healthcheck

`GET /api/sihat` → `200 {"status":"ok"}`.

Ia menyemak SATU perkara: proses Next hidup. Ia **tidak** menghubungi
backend Go dengan sengaja — Railway menggunakan pemeriksaan ini sebagai
pintu pagar penggunaan, jadi kalau ia turut menguji backend, gangguan
pada `marc_go` akan menyekat setiap penggunaan web, termasuk penggunaan
yang membaiki gangguan itu.

Laluan itu disenaraikan sebagai awam dalam `proxy.ts`. Ia **mesti**
kekal begitu: tanpanya ia mewarisi gate sesi, menjawab 307 ke
`/log-masuk`, dan Railway menandakan penggunaan yang sihat sebagai gagal.

## Yang perlu ditetapkan pada `marc_go`

Web tak berfungsi sepenuhnya sehingga backend tahu di mana ia berada:

| Env pada marc_go | Nilai |
|---|---|
| `PASSWORD_RESET_URL` | `https://<domain-web>/tetap-kata-laluan` |
| `EMAIL_VERIFY_URL` | `https://<domain-web>/sahkan-emel` |

Tanpa `PASSWORD_RESET_URL`, `POST /auth/password-reset/request` menjawab
**503** dan borang "lupa kata laluan" mati.

`CORS_ALLOWED_ORIGINS` **tidak** perlu domain web ini. Pelayar tak pernah
memanggil backend Go secara terus — semua panggilan melalui pelayan
Next. Menambahnya di situ tak merosakkan apa-apa, tetapi ia menandakan
salah faham tentang seni bina; lihat [`docs/auth.md`](./auth.md).

## Perangkap

**Env diperlukan semasa BUILD, bukan runtime sahaja.** `/daftar` dan
`/lupa-kata-laluan` dipra-render pada masa build, dan ia mengimport
`lib/env.ts`, yang melempar bila kedua-dua URL kosong. Kalau build gagal
dengan *"Tetapkan MARC_API_URL…"*, pemboleh ubah itu tiada pada
perkhidmatan — bukan pepijat kod.

**DNS peribadi ialah runtime sahaja.** `*.railway.internal` tak
menyelesaikan semasa fasa build. Membaca URL itu sebagai rentetan
(seperti yang kita buat) selamat; **memanggilnya** semasa build tidak.
Jangan tambah pengambilan data pada masa build ke API ini.

**`http://` dan port yang eksplisit.** Nama `.railway.internal` tiada
sijil TLS (trafik sudah disulitkan Wireguard) dan tiada proksi di depan,
jadi tiada 443 yang tersirat. `lib/env.ts` menolak kedua-dua kesilapan
semasa boot dan bukan membiarkannya menjadi tamat masa yang senyap.

**Undici dan IPv6.** Environment Railway yang dicipta sebelum
**16 Okt 2025** menyelesaikan `.railway.internal` kepada IPv6 **sahaja**,
dan `fetch` Node diketahui tergantung di situ. Gejalanya khusus: URL
peribadi tamat masa sedangkan URL awam berfungsi. Pembetulannya, pada
perkhidmatan Next:

```
NODE_OPTIONS=--dns-result-order=ipv4first
```

Environment yang lebih baharu dwi-tindanan, jadi ia tak diperlukan.

**IP klien merentas rangkaian peribadi.** Railway menghantar permintaan
melalui julat CGNAT `100.64.0.0/10`, yang `marc_go` percayai secara
eksplisit (`trustedProxyRanges`, `internal/http/router.go`) — julat yang
sama yang perkhidmatan Next berhubung daripadanya.

Itu yang membuat penyiaran semula `X-Forwarded-For` berfungsi tanpa
sebarang perubahan backend, dan ia **membawa muatan**: tanpanya, had
kadar `auth` menjadi kuota yang dikongsi seluruh portal dan pengesanan
guna-semula refresh token menjadi lemah untuk trafik web. Butiran penuh
dalam [`docs/auth.md`](./auth.md).

Kalau `trustedProxyRanges` pernah diubah, `TestClientIPMerentasProksi`
dalam `marc_go` akan gagal — itu sengaja.

## Perintah

Sama seperti bahagian Deployment dalam `marc_go/README.md` (repo bersebelahan).

```bash
railway link                        # pilih projek marc + perkhidmatan
railway logs                        # log perkhidmatan semasa
railway variables --json            # semak env (nilai penuh, tak dipotong)
railway variables --set "KEY=value" # auto-redeploy
railway up                          # deploy dari mesin ini
```
