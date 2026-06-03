"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, DollarSign } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import DataTable from "@/components/DataTable";
import { getUser, isAdmin } from "@/lib/auth";
import { bookingAPI } from "@/lib/api";
import { toast } from "@/components/Toast";
import { normalizeBooking, normalizeCollection } from "@/lib/normalize";

type Booking = ReturnType<typeof normalizeBooking>;
interface Rekap {
  totalPemasukan: number;
  totalTransaksi?: number;
  bulan?: string | number;
  tahun?: string | number;
}

export default function AdminBookingPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rekap, setRekap] = useState<Rekap | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getUser() || !isAdmin()) {
      router.push("/dashboard");
      return;
    }
    load();
  }, []);

  const load = async () => {
    try {
      const [bRes, rRes] = await Promise.all([bookingAPI.getAll(), bookingAPI.getRekap()]);
      setBookings(normalizeCollection(bRes.data, normalizeBooking));
      setRekap(rRes.data?.data || rRes.data || null);
    } catch {
      toast("error", "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  const fmt = (dt: string) => new Date(dt).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" });
  const fmtCurr = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(n);

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="font-display text-2xl text-white">Manajemen Booking</h1>
          <p className="text-sm text-white/40 mt-0.5">Semua transaksi pemesanan tiket</p>
        </div>

        {rekap && (
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-600/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{fmtCurr(rekap.totalPemasukan || 0)}</div>
                <div className="text-xs text-white/40">Total Pemasukan</div>
              </div>
            </div>
            <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-rail-600/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-rail-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{rekap.totalTransaksi || bookings.length}</div>
                <div className="text-xs text-white/40">Total Transaksi</div>
              </div>
            </div>
          </div>
        )}

        <div className="glass-card rounded-2xl overflow-hidden">
          <DataTable
            loading={loading}
            data={bookings}
            columns={[
              { key: "id", label: "#", render: (r) => <span className="text-white/30">#{r.id}</span> },
              { key: "kode", label: "Kode", render: (r) => <span className="text-white font-medium">{r.kodeTransaksi || `TRX-${r.id}`}</span> },
              { key: "user", label: "User", render: (r) => <span className="text-white/60">{r.user?.name || "-"}</span> },
              { key: "penumpang", label: "Penumpang", render: (r) => <span className="text-white/70">{r.totalPenumpang}</span> },
              { key: "harga", label: "Total Harga", render: (r) => <span className="text-rail-400 font-medium">{fmtCurr(r.totalHarga)}</span> },
              { key: "status", label: "Status", render: (r) => <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">{r.status}</span> },
              { key: "createdAt", label: "Tanggal", render: (r) => <span className="text-white/40 text-xs">{fmt(r.createdAt)}</span> },
            ]}
          />
        </div>
      </div>
    </PageWrapper>
  );
}
