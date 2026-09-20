# Obrolan Hati

Prompt: Pembuatan Website "Obrolan Hati" (Truth or Dare Card Game)

Peran: Bertindaklah sebagai Senior Frontend Developer dan UI/UX Designer.

Tugas: Buatkan saya kode (HTML, CSS, Tailwind CSS, dan JavaScript) untuk sebuah website interaktif bernama "Obrolan Hati". Website ini adalah versi digital dari permainan kartu fisik "Truth or Dare" atau "Deep Talk" yang sedang viral, seperti yang dijual di e-commerce (Shopee/TikTok).

1. Referensi Visual & Desain (Moodboard):

Gaya: Minimalis, estetik, lembut (soft aesthetic), dan modern.

Warna Dominan: Gunakan palet warna pastel, terutama Pink Soft (seperti #FFC0CB atau sejenisnya) sebagai latar belakang utama, dengan aksen Emas/Cokelat Tua (Gold/Bronze) untuk teks judul agar terlihat elegan (mirip dengan desain kotak "Obrolan Hati" di gambar).

Tipografi: Gunakan font Serif yang elegan untuk judul (contoh: Playfair Display) dan font Sans-Serif yang bersih untuk konten kartu (contoh: Poppins atau Inter).

Bentuk: Kartu harus memiliki sudut membulat (rounded corners) dan bayangan halus (drop shadow) agar terlihat seperti kartu fisik.

2. Fitur Utama & Struktur Halaman:

A. Halaman Depan (Landing Page / Menu Utama):

Header: Judul besar "Obrolan Hati" dengan sub-judul "Kartu Truth or Dare & Deep Talk".

Pilihan Kategori (Mode Permainan): Buatkan tombol atau tab menu yang menyerupai pilihan edisi di gambar. Kategori yang harus ada:

Pacar (Pink)

PDKT (Kuning/Hijau)

Teman (Biru)

Pasutri (Merah)

Keluarga (Abu-abu/Cokelat)

Mantan (Hitam/Abu)

Tombol Mulai: Tombol besar "Mulai Bermain" setelah user memilih kategori.

Info: Tampilkan info kecil "Terjual 50rb+" atau "Rating 4.9" untuk memberikan kesan sosial proof (seperti di gambar).

B. Halaman Permainan (Game Screen):

Tampilan Kartu: Di tengah layar, tampilkan satu kartu besar dengan desain persis seperti di gambar (Background putih, border emas tipis, logo "Obrolan Hati" kecil di pojok, dan teks pertanyaan/tantangan di tengah).

Mekanisme Kartu:

Kartu memiliki dua sisi: "Truth" (Jujur) dan "Dare" (Tantangan).

User bisa mengklik kartu untuk membaliknya (animasi flip 3D) atau menekan tombol "Ganti Kartu" untuk mendapatkan pertanyaan acak berikutnya.

Konten Dinamis: Teks di dalam kartu harus berubah secara acak berdasarkan kategori yang dipilih.

Contoh Konten (Pacar/Deep Talk): "Apa hal yang paling kamu takutkan kehilangan dari diriku?" atau "Coba puji aku 3 kali berturut-turut tanpa tersenyum."

Tombol Navigasi:

Tombol "Kartu Selanjutnya" (Next).

Tombol "Kembali ke Menu" (Back).

3. Konten Teks (Copywriting):

Gunakan bahasa Indonesia gaul tapi sopan (santai).

Sertakan placeholder untuk database pertanyaan. Buatkan saya struktur data JSON sederhana untuk menyimpan pertanyaan berdasarkan kategori (Misal: kategori: "Pacar", tipe: "Truth", teks: "...").

bisa pilih Bahasa

nama aplikasi nya "iaayan love" logo aplikasi nya love yang bagus

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/18556434-7159-468d-bbb2-e5312c6f2f79).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
