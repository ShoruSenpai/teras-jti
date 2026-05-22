# Laporan Pengujian E2E - Modul Dine-In

Berikut adalah hasil pengujian menggunakan browser secara langsung (debugging) pada aplikasi web Teras JTI untuk alur pesanan Dine-In.

| No. | Skenario Pengujian | Test Case | Hasil yang diharapkan | Hasil Pengujian | Kesimpulan |
|:---:|:---|>---|:---|:---|:---:|
| 1 | Flow Dine-In Normal | Mengakses halaman utama (`/`) dan mengklik tombol "Mulai Pesanan" pada opsi Dine-In | Sistem berhasil meminta token sesi melalui API `/session/create` dan meredirect _user_ ke rute `/dine-in/{token}/menu`. | _User_ berhasil diredirect ke halaman menu dengan parameter token di URL tanpa kendala. | ✅ **Valid** |
| 2 | Flow Dine-In Normal | Memilih dan menambahkan item menu pertama ke dalam keranjang pesanan | Saat tombol "Tambah" ditekan, item akan masuk ke keranjang. Jika ada modal, sistem bisa menanganinya. Bar/Tombol "Checkout" _floating_ akan muncul dengan jumlah _item_ pesanan. | Item berhasil ditambahkan, dan _floating button_ "Checkout" langsung muncul di bagian bawah layar. | ✅ **Valid** |
| 3 | Flow Dine-In Normal | Navigasi ke halaman rekap pesanan dengan mengklik _floating button_ "Checkout" | Sistem meredirect _user_ ke halaman `/dine-in/{token}/menu/checkout` dan menampilkan rekap total harga dengan benar. | _User_ berhasil diredirect ke halaman rekap dan daftar rincian pesanan tampil sesuai pilihan. | ✅ **Valid** |
| 4 | Flow Dine-In Normal | Finalisasi pesanan dengan mengklik tombol konfirmasi "Pesan Sekarang" di halaman checkout | Sistem mengeksekusi pesanan ke API _backend_ dan menampilkan halaman keberhasilan dengan teks "Pesanan Terkirim!" dan status "Menunggu Pembayaran". | Sistem berhasil membuat pesanan, lalu meredirect ke halaman berisi informasi "Pesanan Terkirim!" dan QR Code/instruksi pembayaran. | ✅ **Valid** |
