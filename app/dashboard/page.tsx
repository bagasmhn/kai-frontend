"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Train, Ticket, Users, TrendingUp, Calendar, ArrowRight, Clock, MapPin } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import { getUser, isAdmin } from "@/lib/auth";
import { jadwalAPI, bookingAPI } from "@/lib/api";
import { toast } from "@/components/Toast";
import { normalizeBooking, normalizeCollection, normalizeJadwal } from "@/lib/normalize";

type Jadwal = ReturnType<typeof normalizeJadwal>;
type Booking = ReturnType<typeof normalizeBooking>;

export default function DashboardPage() {
  const router = useRouter();
  const user = getUser();
  const isAdminUser = isAdmin();

  const [jadwals, setJadwals] = useState<Jadwal[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [jRes, bRes] = await Promise.all([
        jadwalAPI.getAll(),
        isAdmin() ? bookingAPI.getAll() : bookingAPI.getMy(),
      ]);
      setJadwals(normalizeCollection(jRes.data, normalizeJadwal));
      setBookings(normalizeCollection(bRes.data, normalizeBooking));
    } catch {
      toast("error", "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  const fmt = (dt: string) => new Date(dt).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" });
  const fmtCurr = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", notation: "compact" }).format(n);

  if (!user) return null;

  const stats = isAdminUser
    ? [
        { label: "Total Jadwal", value: jadwals.length, icon: Train, color: "text-rail-400", bg: "bg-rail-600/20" },
        { label: "Total Booking", value: bookings.length, icon: Ticket, color: "text-emerald-400", bg: "bg-emerald-600/20" },
        { label: "Pengguna Aktif", value: "-", icon: Users, color: "text-purple-400", bg: "bg-purple-600/20" },
        { label: "Pendapatan", value: "-", icon: TrendingUp, color: "text-gold-400", bg: "bg-yellow-600/20" },
      ]
    : [
        { label: "Total Booking", value: bookings.length, icon: Ticket, color: "text-rail-400", bg: "bg-rail-600/20" },
        { label: "Jadwal Tersedia", value: jadwals.length, icon: Train, color: "text-purple-400", bg: "bg-purple-600/20" },
        { label: "Tiket Aktif", value: bookings.filter((b) => b.status !== "CANCELLED").length, icon: Calendar, color: "text-emerald-400", bg: "bg-emerald-600/20" },
      ];

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 animate-slide-up">
          <div className="text-sm text-white/40 mb-1">Selamat datang kembali,</div>
          <h1 className="font-display text-3xl text-white">{user.name}</h1>
          <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full bg-rail-600/20 border border-rail-500/30 text-xs text-rail-300">
            {isAdmin() ? "Administrator" : "Penumpang"}
          </div>
        </div>

        <div className={`grid grid-cols-2 ${isAdmin() ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-4 mb-8`}>
          {stats.map((stat, index) => (
            <div key={index} className="glass-card rounded-2xl p-5 animate-slide-up" style={{ animationDelay: `${index * 80}ms` }}>
              <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold text-white">{loading ? "—" : stat.value}</div>
              <div className="text-xs text-white/40 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="glass-card rounded-2xl p-6 animate-slide-up" style={{ animationDelay: "200ms" }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-white">Jadwal Terbaru</h2>
              <Link href="/jadwal" className="flex items-center gap-1 text-xs text-rail-400 hover:text-rail-300">
                Lihat semua <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {loading ? (
              <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 glass rounded-xl animate-pulse" />)}</div>
            ) : jadwals.slice(0, 4).map((jadwal) => (
              <div key={jadwal.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-rail-600/20 rounded-lg flex items-center justify-center mt-0.5">
                    <MapPin className="w-4 h-4 text-rail-400" />
                  </div>
                  <div>
                    <div className="text-sm text-white font-medium">{jadwal.asal}{" -> "}{jadwal.tujuan}</div>
                    <div className="flex items-center gap-1 text-xs text-white/40 mt-0.5">
                      <Clock className="w-3 h-3" /> {fmt(jadwal.tanggalBerangkat || jadwal.jamBerangkat)}
                    </div>
                  </div>
                </div>
                <div className="text-sm font-semibold text-rail-400">{fmtCurr(jadwal.harga)}</div>
              </div>
            ))}
          </div>

          <div className="glass-card rounded-2xl p-6 animate-slide-up" style={{ animationDelay: "280ms" }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-white">Booking Terbaru</h2>
              <Link href={isAdmin() ? "/admin/booking" : "/my-booking"} className="flex items-center gap-1 text-xs text-rail-400 hover:text-rail-300">
                Lihat semua <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {loading ? (
              <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 glass rounded-xl animate-pulse" />)}</div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-10 text-white/30 text-sm">
                <Ticket className="w-8 h-8 mx-auto mb-2 opacity-30" />
                Belum ada booking
              </div>
            ) : bookings.slice(0, 4).map((booking) => (
              <div key={booking.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                <div>
                  <div className="text-sm text-white font-medium">{booking.kodeTransaksi || `TRX-${booking.id}`}</div>
                  <div className="text-xs text-white/40 mt-0.5">{booking.totalPenumpang} penumpang</div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">{booking.status}</span>
              </div>
            ))}
          </div>
        </div>

        {!isAdmin() && (
          <div className="mt-6 glass-card rounded-2xl p-6 animate-slide-up" style={{ animationDelay: "360ms" }}>
            <h2 className="font-semibold text-white mb-4">Aksi Cepat</h2>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { href: "/jadwal", label: "Cari & Pesan Tiket", icon: Train, desc: "Temukan jadwal perjalanan" },
                { href: "/my-booking", label: "Tiket Saya", icon: Ticket, desc: "Kelola tiket aktif" },
                { href: "/history", label: "Riwayat Perjalanan", icon: Clock, desc: "Lihat semua riwayat" },
              ].map((action) => (
                <Link key={action.href} href={action.href} className="flex items-center gap-3 p-4 glass rounded-xl hover:bg-white/5 transition-all group">
                  <div className="w-9 h-9 bg-rail-600/25 rounded-xl flex items-center justify-center group-hover:bg-rail-600/40 transition-colors">
                    <action.icon className="w-4.5 h-4.5 text-rail-400" />
                  </div>
                  <div>
                    <div className="text-sm text-white font-medium">{action.label}</div>
                    <div className="text-xs text-white/40">{action.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
