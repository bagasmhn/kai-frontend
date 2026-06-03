"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import { getUser } from "@/lib/auth";
import { bookingAPI } from "@/lib/api";
import { toast } from "@/components/Toast";
import { normalizeBooking, normalizeCollection } from "@/lib/normalize";

type Booking = ReturnType<typeof normalizeBooking>;

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getUser()) {
      router.push("/login");
      return;
    }
    bookingAPI.getHistory()
      .then((res) => setHistory(normalizeCollection(res.data, normalizeBooking)))
      .catch(() => toast("error", "Gagal memuat riwayat"))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (dt: string) => new Date(dt).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" });
  const fmtCurr = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(n);

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="font-display text-2xl text-white">Riwayat Perjalanan</h1>
          <p className="text-sm text-white/40 mt-0.5">Semua booking Anda</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-rail-400/30 border-t-rail-400 rounded-full animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-20 glass-card rounded-2xl">
            <Clock className="w-12 h-12 mx-auto mb-3 text-white/20" />
            <p className="text-white/40">Belum ada riwayat</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((booking, index) => (
              <div key={booking.id} className="glass-card rounded-2xl p-5 animate-slide-up" style={{ animationDelay: `${index * 60}ms` }}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-xs text-white/30 mb-1">{booking.kodeTransaksi || `Booking #${booking.id}`}</div>
                    <div className="text-white font-semibold">{booking.totalPenumpang} penumpang</div>
                    <div className="text-xs text-white/40 mt-0.5">{fmt(booking.createdAt)}</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 text-white/60">{booking.status}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="text-white/60">Total penumpang: {booking.totalPenumpang}</div>
                  <div className="text-rail-400">{fmtCurr(booking.totalHarga)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
