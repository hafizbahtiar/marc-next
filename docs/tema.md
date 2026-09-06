# Tema & jenama - marc_next

## Sumber kebenaran

Warna **bukan** dipilih untuk web. Ia dipetakan daripada
`marc_flutter/lib/app/theme.dart` (`AppTheme`), yang pula diterbitkan
daripada fail logo `assets/splash/full_logo_android12.png`:

| Peranan | Warna | Asal dalam logo |
|---|---|---|
| `brandRed` - primary | `#E21E28` | merah perisai (~48% piksel berwarna) |
| `brandNavy` - secondary | `#223145` | navy ikon dan wordmark (~15%) |
| `brandRoyal` - tertiary | `#2D3089` | biru diraja huruf "MARC" (~5%) |

Templat emel dalam `marc_go` (`verificationEmailHTML`, resit) masih
menggunakan palet **hijau** `#2F6B4F` yang lebih lama. Itu **kerja
susulan yang belum dibuat**, bukan pilihan reka bentuk - jangan salin
hijau itu ke web.

## Nota pemetaan: Material ≠ shadcn

`secondary` dalam Material ialah warna **jenama kedua** (navy pekat).
`--secondary` dalam shadcn ialah **permukaan** untuk butang sekunder.
Menyalin satu ke satu memberi butang sekunder navy pekat di merata-rata.

Jadi:

- `--secondary` mengambil `secondaryContainer` Flutter (`#D9E2F2`)
- navy sebenar hidup dalam token tambahan `--brand-navy`
- `--accent` dibiarkan **neutral** (`#F1ECEC`), bukan bertona merah -
  ia keadaan tuding untuk butang hantu dan item menu, dan merah di situ
  menjadikan setiap tudingan kelihatan seperti tindakan merosakkan

Token tambahan di luar set shadcn: `--brand-red`, `--brand-navy`,
`--brand-royal`, `--warning`, `--warning-bg`, `--success`, `--success-bg`
(tiga terakhir memadankan `AppSemanticColors`).

`--success` sengaja **hijau** dan bukan warna jenama: status positif
mengikut konvensyen, bukan palet. Sama alasan seperti komen dalam
`AppSemanticColors`.

## Kenapa panel auth navy, bukan merah

Merah ialah warna **tindakan** dalam sistem ini - butang utama, cincin
fokus. Satu panel penuh dengannya menenggelamkan butang yang sepatutnya
menonjol. Navy juga permukaan yang `marc-wordmark-putih.png` memang
dilukis untuknya.

## Aset logo

Disalin daripada `marc_flutter/assets/splash` supaya web dan aplikasi
menunjukkan tanda yang SAMA. Ketiga-tiganya berlatar telus.

| Fail | Kandungan | Guna atas |
|---|---|---|
| `marc-logo-penuh.png` | jata + "KELAB SUKAN DAN REKREASI MAIWP" | permukaan **cerah** (teksnya navy gelap) |
| `marc-jata.png` | lambang sahaja | mana-mana; satu-satunya yang kekal jelas pada 32px |
| `marc-wordmark-putih.png` | "MARC" serif putih | permukaan **gelap** sahaja |

Gunakan `<Logo varian="…" />`, jangan `<Image>` terus - komponen itu
membawa dimensi asal setiap fail supaya Next menempah ruang susun atur
dan tiada anjakan tataletak semasa memuat.

## Tipografi

Inter untuk teks, Fraunces untuk tajuk - padanan `AppTheme._build`, yang
menggunakan `GoogleFonts.interTextTheme` dengan `GoogleFonts.fraunces`
pada `displaySmall` dan `headlineSmall`. Kelas `font-heading` pada `<h1>`.

Jejari `0.75rem` memadankan `BorderRadius.circular(12)` pada input dan
butang dalam tema Flutter.

## Suis tema

Binari cerah/gelap, sama seperti `ThemeModeNotifier` (marc_flutter):
pilihan tersimpan menang, kalau tiada ikut kecerahan sistem. "Ikut
sistem" ialah keadaan **awal**, bukan pilihan ketiga yang disimpan.
Kunci storan `theme_mode` - nama yang sama dengan kunci
SharedPreferences dalam Flutter, supaya satu grep menemui kedua-duanya.

Peralihannya ialah pendedahan bulat dari titik klik, memadankan
`ThemeSwitchReveal`. Flutter menangkap snapshot tema lama dan memotong
lubang yang membesar padanya; web menggunakan View Transitions API, yang
mengambil snapshot itu sendiri - jadi yang tinggal hanyalah
menganimasikan `clip-path` pada lapisan baharu.

**Kilatan tema.** `SkripTemaAwal` ialah skrip sebaris dalam `<head>` dan
mesti kekal begitu. Sebagai kesan komponen, ia berjalan selepas cat
pertama dan pelawat mod gelap melihat kilatan putih.

**Tiada keadaan React dalam `SuisTema`.** Tema hidup dalam kelas
`<html>` yang ditetapkan sebelum React berjalan, jadi pelayan tak boleh
mengetahuinya - menyalinnya ke keadaan komponen menjamin ketidakpadanan
hidrasi. Ikon ditukar oleh CSS `dark:`; pengendali klik membaca DOM.
