"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Train, Eye, EyeOff, Loader2 } from "lucide-react";
import { authAPI } from "@/lib/api";
import { setAuth } from "@/lib/auth";
import { toast, ToastContainer } from "@/components/Toast";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
     const res = await authAPI.login(form);

const { access_token } = res.data;

setAuth(access_token);

toast("success", "Login berhasil");

setTimeout(() => {
  router.push("/dashboard");
}, 800);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast("error", msg || "Email atau password salah");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen flex">
        {/* Left panel */}
        <div className="hidden lg:flex flex-1 flex-col justify-between p-12 bg-gradient-to-br from-rail-950 to-[#060d1a] relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzAgMzBtLTI4IDBhMjggMjggMCAxIDAgNTYgMCAyOCAyOCAwIDEgMC01NiAwIiBzdHJva2U9InJnYmEoMTMsMTM1LDIzMywwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9nPjwvc3ZnPg==')] opacity-30" />
          <div className="absolute top-1/3 left-1/2 w-64 h-64 bg-rail-600/20 rounded-full blur-3xl -translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-2.5 mb-16">
              <div className="w-9 h-9 bg-gradient-to-br from-rail-400 to-rail-700 rounded-xl flex items-center justify-center">
                <Train className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-xl text-white">KAI<span className="text-rail-400">Express</span></span>
            </div>
            <h2 className="font-display text-4xl text-white mb-4">Selamat datang<br />kembali</h2>
            <p className="text-white/50 text-base max-w-xs">Masuk untuk mengakses tiket, jadwal, dan riwayat perjalanan Anda.</p>
          </div>
          <div className="relative grid grid-cols-2 gap-4">
            {["Jakarta → Bandung", "Surabaya → Yogyakarta", "Malang → Jakarta", "Semarang → Solo"].map((r) => (
              <div key={r} className="glass rounded-xl p-3 text-xs text-white/60">{r}</div>
            ))}
          </div>
        </div>

        {/* Form panel */}
        <div className="flex-1 flex items-center justify-center p-8 bg-[#060d1a]">
          <div className="w-full max-w-sm animate-fade-in">
            <div className="lg:hidden flex items-center gap-2 mb-8">
              <div className="w-8 h-8 bg-gradient-to-br from-rail-400 to-rail-700 rounded-lg flex items-center justify-center">
                <Train className="w-4 h-4 text-white" />
              </div>
              <span className="font-display text-lg text-white">KAI<span className="text-rail-400">Express</span></span>
            </div>
            <h1 className="font-display text-3xl text-white mb-2">Masuk</h1>
            <p className="text-white/40 text-sm mb-8">Belum punya akun? <Link href="/register" className="text-rail-400 hover:text-rail-300">Daftar sekarang</Link></p>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Email</label>
                <input type="email" required placeholder="nama@email.com"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 glass-card rounded-xl text-white text-sm placeholder-white/20 focus:border-rail-500/50 transition-all border border-transparent"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Password</label>
                <div className="relative">
                  <input type={show ? "text" : "password"} required placeholder="••••••••"
                    value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-4 py-3 pr-10 glass-card rounded-xl text-white text-sm placeholder-white/20 focus:border-rail-500/50 transition-all border border-transparent"
                  />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-rail-600 hover:bg-rail-500 disabled:opacity-50 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-rail-500/25 mt-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? "Memproses..." : "Masuk"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
