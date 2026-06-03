"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Loader2 } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import Modal from "@/components/Modal";
import DataTable from "@/components/DataTable";
import { getUser, isAdmin } from "@/lib/auth";
import { userAPI } from "@/lib/api";
import { toast } from "@/components/Toast";
import { normalizeCollection, normalizeUser } from "@/lib/normalize";

type User = ReturnType<typeof normalizeUser>;
const EMPTY = { name: "", email: "", phone: "" };

export default function AdminUsersPage() {
  const router = useRouter();
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!getUser() || !isAdmin()) {
      router.push("/dashboard");
      return;
    }
    load();
  }, []);

  const load = async () => {
    try {
      const r = await userAPI.getAll();
      setData(normalizeCollection(r.data, normalizeUser));
    } catch {
      toast("error", "Gagal memuat users");
    } finally {
      setLoading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    setSaving(true);
    try {
      await userAPI.update(editId, form);
      toast("success", "User diperbarui");
      setShowForm(false);
      load();
    } catch {
      toast("error", "Gagal mengupdate");
    } finally {
      setSaving(false);
    }
  };

  const del = async (row: User) => {
    if (!confirm(`Hapus user ${row.name}?`)) return;
    try {
      await userAPI.delete(row.id);
      toast("success", "User dihapus");
      load();
    } catch (err: unknown) {
      const msg = (err as any)?.response?.data?.message || (err as any)?.message || "Gagal menghapus";
      toast("error", msg);
      // log full error for debugging
      // eslint-disable-next-line no-console
      console.error("Failed to delete user:", err);
    }
  };

  const openEdit = (row: User) => {
    setEditId(row.id);
    setForm({ name: row.name, email: row.email, phone: row.phone });
    setShowForm(true);
  };

  const fmt = (dt?: string) => (dt ? new Date(dt).toLocaleDateString("id-ID", { dateStyle: "medium" }) : "-");

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-rail-400" /> Manajemen User
            </h1>
            <p className="text-sm text-white/40 mt-0.5">{data.length} user terdaftar</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden">
          <DataTable
            loading={loading}
            data={data}
            columns={[
              { key: "id", label: "#", render: (r) => <span className="text-white/30">#{r.id}</span> },
              {
                key: "name",
                label: "Nama",
                render: (r) => (
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-gradient-to-br from-rail-400 to-gold-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                      {r.name[0]?.toUpperCase()}
                    </div>
                    <span className="text-white font-medium">{r.name}</span>
                  </div>
                ),
              },
              { key: "email", label: "Email", render: (r) => <span className="text-white/70">{r.email}</span> },
              { key: "phone", label: "Telepon", render: (r) => <span className="text-white/50">{r.phone}</span> },
              {
                key: "role",
                label: "Role",
                render: (r) => (
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${r.role === "SUPER_ADMIN" ? "bg-gold-500/20 text-yellow-400" : "bg-white/10 text-white/50"}`}>
                    {r.role}
                  </span>
                ),
              },
              { key: "createdAt", label: "Bergabung", render: (r) => <span className="text-white/40">{fmt(r.createdAt)}</span> },
            ]}
            onEdit={openEdit}
            onDelete={del}
          />
        </div>

        <Modal title="Edit User" open={showForm} onClose={() => setShowForm(false)} size="sm">
          <form onSubmit={submit} className="space-y-4">
            {[
              { key: "name", label: "Nama", type: "text" },
              { key: "email", label: "Email", type: "email" },
              { key: "phone", label: "Telepon", type: "tel" },
            ].map(({ key, label, type }) => (
              <div key={key}>
                <label className="text-xs text-white/50 mb-1.5 block">{label}</label>
                <input
                  type={type}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full px-3 py-2.5 glass rounded-xl text-white text-sm border border-white/10"
                />
              </div>
            ))}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 glass rounded-xl text-white/60 text-sm">
                Batal
              </button>
              <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-rail-600 hover:bg-rail-500 text-white rounded-xl text-sm flex items-center justify-center gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />} Simpan
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </PageWrapper>
  );
}
