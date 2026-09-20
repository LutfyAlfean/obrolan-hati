# iaayan love — Obrolan Hati

## Ringkasan
Membangun permainan kartu digital Truth or Dare / Deep Talk yang langsung bisa dimainkan di halaman utama, dengan nuansa pastel lembut, aksen emas-cokelat, dan identitas logo hati “iaayan love”.

## Yang akan dibangun
- Menu utama dengan judul “iaayan love”, subjudul “Kartu Truth or Dare & Deep Talk”, logo hati, rating, dan jumlah terjual.
- Pemilih bahasa Indonesia / English yang mengubah seluruh teks antarmuka dan isi kartu.
- Enam pilihan kategori: Pacar, PDKT, Teman, Pasutri, Keluarga, dan Mantan, masing-masing memiliki warna khas.
- Tombol “Mulai Bermain” yang aktif setelah kategori dipilih.
- Layar permainan dengan kartu fisik berwarna putih, bingkai emas tipis, logo kecil, dan tipografi elegan.
- Kartu dua sisi Truth/Jujur dan Dare/Tantangan dengan animasi flip 3D saat diketuk.
- Konten acak berdasarkan kategori, tipe, dan bahasa; data pertanyaan disimpan dalam struktur JSON sederhana di kode.
- Kontrol kartu selanjutnya, ganti kartu, dan kembali ke menu.
- Tampilan yang rapi untuk ponsel maupun desktop, termasuk animasi yang menghormati pengaturan pengurangan gerak.

## Arah visual
- Latar pink pastel, permukaan putih hangat, aksen emas/bronze dan cokelat tua.
- Judul memakai Playfair Display; isi memakai Poppins.
- Bentuk kartu membulat dengan bayangan lembut dan detail ornamental yang minimal.
- Tidak memakai mode gelap agar pengalaman tetap konsisten dengan tema produk.

## Teknis
- Menggunakan React, TanStack Start, Tailwind CSS v4, dan state lokal tanpa layanan penyimpanan.
- Design tokens didefinisikan di stylesheet global; komponen memakai token semantik.
- Metadata halaman dibuat khusus untuk “iaayan love”.
- Interaksi dan tata letak akan diverifikasi pada ukuran desktop dan ponsel.
