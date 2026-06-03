"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Ticket, QrCode, X, Download, Users, Printer } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import { getUser } from "@/lib/auth";
import { bookingAPI } from "@/lib/api";
import { toast } from "@/components/Toast";
import { normalizeBooking, normalizeCollection } from "@/lib/normalize";

type Booking = ReturnType<typeof normalizeBooking>;

export default function MyBookingPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Booking | null>(null);

  useEffect(() => {
    if (!getUser()) {
      router.push("/login");
      return;
    }
    load();
  }, []);

  const load = async () => {
    try {
      const res = await bookingAPI.getMy();
      setBookings(normalizeCollection(res.data, normalizeBooking));
    } catch {
      toast("error", "Gagal memuat booking");
    } finally {
      setLoading(false);
    }
  };

  const openTicket = async (id: number) => {
    try {
      const res = await bookingAPI.getTicket(id);
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      toast("error", "Gagal membuka tiket");
    }
  };

  const downloadTicket = async (booking: Booking) => {
    try {
      const res = await bookingAPI.getTicket(booking.id);
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${booking.kodeTransaksi || `ticket-${booking.id}`}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      toast("success", "Tiket berhasil diunduh");
    } catch {
      toast("error", "Gagal mengunduh tiket");
    }
  };

  const fmt = (dt: string) => new Date(dt).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" });
  const fmtCurr = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(n);

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="font-display text-2xl text-white">Tiket Saya</h1>
          <p className="text-sm text-white/40 mt-0.5">Daftar transaksi booking Anda</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-rail-400/30 border-t-rail-400 rounded-full animate-spin" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 glass-card rounded-2xl">
            <Ticket className="w-12 h-12 mx-auto mb-3 text-white/20" />
            <p className="text-white/40">Belum ada booking</p>
            <button onClick={() => router.push("/jadwal")} className="mt-4 px-5 py-2 bg-rail-600 hover:bg-rail-500 text-white text-sm rounded-xl transition-all">
              Pesan Tiket
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking, index) => (
              <div key={booking.id} className="glass-card rounded-2xl p-5 animate-slide-up" style={{ animationDelay: `${index * 60}ms` }}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-xs text-white/30 mb-1">{booking.kodeTransaksi || `Booking #${booking.id}`}</div>
                    <div className="text-white font-semibold">Total {booking.totalPenumpang} penumpang</div>
                    <div className="text-xs text-white/40 mt-0.5">{fmt(booking.createdAt)}</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 text-white/60">
                    {booking.status}
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 mb-4">
                  {booking.detailBooking.map((detail, idx) => (
                    <div key={`${booking.id}-${idx}`} className="glass rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2 text-white/60">
                        <Users className="w-4 h-4" />
                        <span className="text-sm font-medium">{detail.namaPenumpang}</span>
                      </div>
                      <div className="text-xs text-white/40">NIK: {detail.nik}</div>
                      <div className="text-xs text-white/40 mt-1">Kursi ID: {detail.kursiId}</div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-rail-400 font-semibold">{fmtCurr(booking.totalHarga)}</div>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setSelected(booking)}
                      className="flex items-center gap-1.5 px-3 py-1.5 glass hover:bg-white/5 text-white/60 hover:text-white text-xs rounded-lg transition-all"
                    >
                      <QrCode className="w-3.5 h-3.5" /> Detail
                    </button>
                    <button
                      onClick={() => openTicket(booking.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-rail-600 hover:bg-rail-500 text-white text-xs rounded-lg transition-all"
                    >
                      <Printer className="w-3.5 h-3.5" /> Cetak Tiket
                    </button>
                    <button
                      onClick={() => downloadTicket(booking)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg transition-all"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Tiket
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelected(null)} />
            <div className="relative w-full max-w-lg glass-card rounded-2xl overflow-hidden animate-slide-up">
              <div className="bg-gradient-to-r from-rail-800 to-rail-950 px-6 py-5">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-rail-300 font-medium">DETAIL BOOKING</div>
                  <button onClick={() => setSelected(null)} className="text-white/50 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-3 text-2xl font-display text-white">
                  {selected.kodeTransaksi || `Booking #${selected.id}`}
                </div>
              </div>
              <div className="px-6 py-5 space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-xs text-white/40">Status</span>
                  <span className="text-sm text-white font-medium">{selected.status}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-xs text-white/40">Total Penumpang</span>
                  <span className="text-sm text-white font-medium">{selected.totalPenumpang}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-xs text-white/40">Total Harga</span>
                  <span className="text-sm text-white font-medium">{fmtCurr(selected.totalHarga)}</span>
                </div>
                <div className="space-y-2 pt-2">
                  {selected.detailBooking.map((detail, idx) => (
                    <div key={idx} className="glass rounded-xl p-3">
                      <div className="text-sm text-white font-medium">{detail.namaPenumpang}</div>
                      <div className="text-xs text-white/40 mt-0.5">NIK: {detail.nik}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
