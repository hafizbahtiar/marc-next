# marc_next

Portal web MARC (Kelab Sukan dan Rekreasi MAIWP). Next.js 16 + Tailwind
v4 + shadcn/ui, bercakap dengan backend Go `marc_go`.

## Mula

```bash
bun install
cp .env.example .env.local   # isi URL internal dan public
bun run dev
```

Backend Go mesti berjalan (lalai `http://localhost:8080`). Pelayar tak
pernah memanggilnya terus - lihat [`docs/auth.md`](docs/auth.md).

## Backend API dan Railway

Next.js bertindak sebagai BFF. Semua operasi server-to-server daripada
`lib/api/client.ts` mesti menggunakan `MARC_API_URL`:

- `MARC_API_URL` - URL internal/private backend Go. Di Railway gunakan
  `http://${{marc_go.RAILWAY_PRIVATE_DOMAIN}}:8080`.
- `MARC_API_PUBLIC_URL` - URL public backend Go. Gunakan hanya untuk
  trigger atau pautan yang perlu dicapai dari luar Railway, contohnya
  `https://${{marc_go.RAILWAY_PUBLIC_DOMAIN}}`.

Kedua-dua pemboleh ubah diperlukan. Jangan gunakan URL public sebagai
fallback kepada URL internal; ia menyebabkan trafik dalaman keluar melalui
internet dan boleh memecahkan flow Railway private networking.

## Skrip

| Perintah | Kegunaan |
|---|---|
| `bun run dev` | Pelayan pembangunan |
| `bun run build` | Binaan produksi (turut menjalankan TypeScript) |
| `bun run lint` | ESLint |
| `bun x tsc --noEmit` | Semakan jenis sahaja |

## Struktur

```
app/(auth)/          Log masuk, daftar, reset kata laluan, sahkan emel
app/(akaun)/         Skrin status: menunggu kelulusan, ditolak, sahkan emel
app/(dilindungi)/    Kawasan ahli (perlu approved + emel disahkan)
app/api/sesi/tamat/  Membuang kuki yang backend tolak
proxy.ts             Putaran token + gate kasar
lib/api/             Satu-satunya klien HTTP ke backend Go
lib/auth/            Sesi, kuki, tindakan pelayan, skema, laluan
```

## Dokumentasi

- [`docs/auth.md`](docs/auth.md) - seni bina auth, lapisan gate, perangkap
- [`docs/tema.md`](docs/tema.md) - palet, aset logo, tipografi, suis tema
- [`docs/railway.md`](docs/railway.md) - penempatan, env, healthcheck, perangkap
