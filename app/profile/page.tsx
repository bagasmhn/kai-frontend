"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Loader2, Save } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import { getUser, setAuth, type User as UserType } from "@/lib/auth";
import { toast } from "@/components/Toast";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (!u) {
      router.push("/login");
      return;
    }
    setUser(u);
    setForm({ name: u.name, email: u.email, phone: u.phone });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const updated = { ...user, ...form };
      setAuth(localStorage.getItem("token")!, updated);
      setUser(updated);
      toast("success", "Profil diperbarui secara lokal");
    } catch {
      toast("error", "Gagal memperbarui profil");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <PageWrapper>
      <div className="max-w-lg mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="font-display text-2xl text-white">Profil Saya</h1>
          <p className="text-sm text-white/40 mt-0.5">Kelola informasi akun Anda</p>
        </div>

        <div className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
            <div className="w-16 h-16 bg-gradient-to-br from-rail-400 to-gold-500 rounded-2xl flex items-center justify-center text-2xl font-bold text-white">
              {user.name[0]?.toUpperCase()}
            </div>
            <div>
              <div className="text-lg font-semibold text-white">{user.name}</div>
              <div className="text-sm text-white/40">{user.email}</div>
              <div className="inline-flex mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rail-600/30 text-rail-300">
                {user.role}
              </div>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {[
              { key: "name", label: "Nama Lengkap", type: "text" },
              { key: "email", label: "Email", type: "email" },
              { key: "phone", label: "Nomor Telepon", type: "tel" },
            ].map(({ key, label, type }) => (
              <div key={key}>
                <label className="text-xs text-white/50 mb-1.5 block">{label}</label>
                <input
                  type={type}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full px-4 py-3 glass rounded-xl text-white text-sm border border-white/5 focus:border-rail-500/30 transition-all"
                />
              </div>
            ))}
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-rail-600 hover:bg-rail-500 disabled:opacity-50 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all mt-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </form>
        </div>
      </div>
    </PageWrapper>
  );
}
