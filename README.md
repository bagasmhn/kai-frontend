# KAI Express - Frontend Next.js

Frontend untuk sistem pemesanan tiket kereta api Indonesia, dibangun dengan Next.js 14, TypeScript, dan Tailwind CSS.

## Fitur

### User (Penumpang)
- Register & Login dengan JWT
- Dashboard dengan jadwal & booking terbaru
- Cari & Pesan tiket kereta
- Lihat tiket aktif dengan e-ticket
- Riwayat perjalanan
- Edit profil

### Admin
- Dashboard dengan statistik
- CRUD Jenis Kereta
- CRUD Jadwal Kereta
- CRUD Gerbong
- CRUD Kursi
- Manajemen User
- Laporan & rekap pemasukan

## Setup

1. Install dependencies:
```bash
npm install
```

2. Konfigurasi environment:
```
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000
```

3. Jalankan development server:
```bash
npm run dev
```

4. Buka http://localhost:3001 (atau port yang tersedia)

## Struktur

```
app/
├── page.tsx          # Landing page
├── login/            # Halaman login
├── register/         # Halaman registrasi
├── dashboard/        # Dashboard utama
├── jadwal/           # Jadwal kereta (user: pesan, admin: CRUD)
├── jenis-kereta/     # Admin: CRUD jenis kereta
├── gerbong/          # Admin: CRUD gerbong
├── kursi/            # Admin: CRUD kursi
├── my-booking/       # User: tiket aktif
├── history/          # User: riwayat
├── profile/          # Edit profil
└── admin/
    ├── users/        # Admin: manajemen user
    └── booking/      # Admin: semua booking + rekap

lib/
├── api.ts            # Axios API client + semua endpoint
└── auth.ts           # Auth utilities (token, user)

components/
├── Navbar.tsx        # Navigasi responsif
├── Modal.tsx         # Modal reusable
├── DataTable.tsx     # Tabel data dengan edit/delete
├── Toast.tsx         # Notifikasi toast
├── PageWrapper.tsx   # Layout wrapper
└── LoadingSpinner.tsx
```

## API Base URL
Default: `http://localhost:3000`
Ubah di `.env.local` sesuai URL backend Anda.
