"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Train, MapPin, Clock, Shield, ArrowRight, Zap } from "lucide-react";
import { getUser } from "@/lib/auth";
import { ToastContainer } from "@/components/Toast";

export default function Home() {
  const router = useRouter();
  useEffect(() => { if (getUser()) router.push("/dashboard"); }, [router]);

  return (
    <>
      <ToastContainer />
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[#060d1a]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-rail-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-rail-800/20 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 w-[800px] h-px bg-gradient-to-r from-transparent via-rail-500/30 to-transparent -translate-x-1/2" />
        {/* Track lines */}
        <div className="absolute bottom-32 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        <div className="absolute bottom-36 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>

      <div className="relative min-h-screen flex flex-col">
        {/* Navbar */}
        <nav className="flex items-center justify-between px-8 py-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-rail-400 to-rail-700 rounded-xl flex items-center justify-center">
              <Train className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-xl text-white">KAI<span className="text-rail-400">Express</span></span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-5 py-2 text-sm text-white/70 hover:text-white transition-colors">Masuk</Link>
            <Link href="/register" className="px-5 py-2 text-sm bg-rail-600 hover:bg-rail-500 text-white rounded-xl transition-all hover:shadow-lg hover:shadow-rail-500/25">
              Register
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <main className="flex-1 flex items-center justify-center px-6 pb-20">
          <div className="text-center max-w-3xl animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-rail-500/30 text-xs text-rail-300 mb-8">
              <Zap className="w-3.5 h-3.5" />
              Pemesanan tiket real-time
            </div>
            <h1 className="font-display text-5xl md:text-7xl text-white mb-6 leading-tight">
              Pesan Tiket
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rail-300 to-rail-500">
                Kereta API
              </span>
              <br />
              Indonesia
            </h1>
            <p className="text-white/50 text-lg mb-10 max-w-xl mx-auto">
              Platform terpadu untuk pemesanan tiket kereta api. Cepat, mudah, dan terpercaya.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="flex items-center gap-2 px-8 py-3.5 bg-rail-600 hover:bg-rail-500 text-white rounded-xl font-medium transition-all hover:shadow-xl hover:shadow-rail-500/30 hover:-translate-y-0.5">
                Mulai Sekarang <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/login" className="px-8 py-3.5 glass hover:bg-white/5 text-white/80 hover:text-white rounded-xl font-medium transition-all">
                Sudah punya akun?
              </Link>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 mt-16">
              {[
                { icon: MapPin, label: "100+ Rute", desc: "Seluruh Indonesia" },
                { icon: Clock, label: "Real-time", desc: "Jadwal terkini" },
                { icon: Shield, label: "Aman", desc: "Pembayaran terproteksi" },
              ].map((f) => (
                <div key={f.label} className="glass-card rounded-2xl p-5">
                  <div className="w-10 h-10 bg-rail-600/30 rounded-xl flex items-center justify-center mb-3 mx-auto">
                    <f.icon className="w-5 h-5 text-rail-400" />
                  </div>
                  <div className="text-white font-semibold text-sm">{f.label}</div>
                  <div className="text-white/40 text-xs mt-0.5">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
