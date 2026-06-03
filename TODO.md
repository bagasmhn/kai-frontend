# TODO - Multi tiket booking

## Step 1
- Identifikasi komponen UI booking yang membatasi ke 1 tiket.
- Temuan: `app/jadwal/page.tsx` modal “Pesan Tiket” hanya membuat 1 `bookForm`.

## Step 2
- Rancang ulang state booking menjadi list penumpang.
- Ubah `EMPTY_BOOK` dan `bookForm` menjadi array penumpang.

## Step 3
- Ubah UI modal: tampilkan list input penumpang + tombol tambah/hapus penumpang.
- Pastikan select kursi per penumpang memakai data kursi `AVAILABLE`.

## Step 4
- Ubah `submitBook` agar mengirim payload `penumpang: [...]` sesuai jumlah penumpang.

## Step 5
- Tambahkan validasi minimal (nama/nik/kursi wajib) dan (opsional) cegah kursi dobel di transaksi yang sama.

## Step 6
- Testing: coba booking 2 penumpang dengan kursi berbeda, pastikan sukses & kursi ter-lock.

## Status
- UI booking sudah diubah menjadi multi penumpang (dan submit mengirim array penumpang[]). Build sukses.

