"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Train, Eye, EyeOff, Loader2 } from "lucide-react";
import { authAPI } from "@/lib/api";
import { toast, ToastContainer } from "@/components/Toast";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.register(form);
      toast("success", "Akun berhasil dibuat! Silakan masuk.");
      setTimeout(() => router.push("/login"), 1000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast("error", Array.isArray(msg) ? msg[0] : msg || "Registrasi gagal");
    } finally {
      setLoading(false);
    }
  };

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#060d1a] relative">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rail-700/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-rail-900/20 rounded-full blur-3xl" />

        <div className="relative w-full max-w-md animate-fade-in">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-9 h-9 bg-gradient-to-br from-rail-400 to-rail-700 rounded-xl flex items-center justify-center">
              <Train className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-xl text-white">KAI<span className="text-rail-400">Express</span></span>
          </div>

          <div className="glass-card rounded-2xl p-8">
            <h1 className="font-display text-2xl text-white mb-1.5">Buat Akun Baru</h1>
            <p className="text-white/40 text-sm mb-6">Sudah punya akun? <Link href="/login" className="text-rail-400 hover:text-rail-300">Masuk</Link></p>

            <form onSubmit={submit} className="space-y-4">
              {[
                { key: "name", label: "Nama Lengkap", type: "text", placeholder: "John Doe" },
                { key: "email", label: "Email", type: "email", placeholder: "john@email.com" },
                { key: "phone", label: "Nomor Telepon", type: "tel", placeholder: "08xxxxxxxxxx" },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label className="text-xs text-white/50 mb-1.5 block">{label}</label>
                  <input type={type} required placeholder={placeholder}
                    value={form[key as keyof typeof form]} onChange={f(key as keyof typeof form)}
                    className="w-full px-4 py-3 glass rounded-xl text-white text-sm placeholder-white/20 focus:border-rail-500/50 transition-all border border-white/5"
                  />
                </div>
              ))}
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Password</label>
                <div className="relative">
                  <input type={show ? "text" : "password"} required placeholder="Min. 6 karakter"
                    value={form.password} onChange={f("password")}
                    className="w-full px-4 py-3 pr-10 glass rounded-xl text-white text-sm placeholder-white/20 border border-white/5"
                  />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-rail-600 hover:bg-rail-500 disabled:opacity-50 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all mt-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Mendaftar..." : "Buat Akun"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
