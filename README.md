# mytemplate.my

Galeri percuma template prompt AI (imej, teks) dan skill ejen, dibina dengan Astro + Tailwind sebagai laman statik.

## Arahan

```bash
npm install
npm run import        # bina src/data/*.json daripada fail dalam sources/
npm run import:fresh  # muat turun semula semua sumber, kemudian import
npm run dev           # pelayan pembangunan di http://localhost:4321
npm run build         # hasilkan laman statik ke dist/
```

## Bahasa

- English ialah bahasa lalai dan berada di akar (`/`, `/images`, `/prompt/...`). Bahasa Melayu berada di bawah `/ms`.
- Semua teks antara muka ada dalam `src/i18n.ts`. Untuk tambah bahasa, tambah satu kamus di situ dan satu set fail laluan di `src/pages/<kod>/`.
- Badan halaman berada dalam `src/views/`; fail dalam `src/pages/` hanya menetapkan bahasa dan laluan.
- Teks prompt tidak diterjemah; ia kekal dalam bahasa asal.

## Sumber kandungan

Ditakrifkan dalam `scripts/import.mjs` (`SOURCES`) dan dipaparkan di halaman `/kredit`.

| Koleksi | Lesen | Kegunaan |
|---|---|---|
| jau123/nanobanana-trending-prompts | CC BY 4.0 | prompt imej |
| YouMind-OpenLab/awesome-nano-banana-pro-prompts | CC BY 4.0 | prompt imej |
| ZeroLu/awesome-nanobanana-pro | MIT | prompt imej |
| f/prompts.chat | CC0 (prompt) | prompt teks |
| anthropics/skills | lesen bagi setiap skill | pautan sahaja |

## Nota

- Imej contoh dipaut terus dari pelayan koleksi asal, tidak disimpan di sini.
- Penapis kandungan (`BLOCK` dalam `scripts/import.mjs`) berasaskan kata kunci dan sengaja ketat.
- Tajuk prompt daripada koleksi jau123 dijana daripada baris pertama prompt.
- Alamat e-mel di `/kredit` (`hello@mytemplate.my`) perlu ditukar kepada alamat sebenar sebelum pelancaran.
