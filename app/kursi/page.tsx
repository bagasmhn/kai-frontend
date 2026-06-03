"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import Modal from "@/components/Modal";
import DataTable from "@/components/DataTable";
import { getUser, isAdmin } from "@/lib/auth";
import { kursiAPI, gerbongAPI } from "@/lib/api";
import { toast } from "@/components/Toast";
import { normalizeCollection, normalizeGerbong, normalizeKursi } from "@/lib/normalize";

type Gerbong = ReturnType<typeof normalizeGerbong>;
type Kursi = ReturnType<typeof normalizeKursi>;
const EMPTY = { gerbongId: "", nomor: "" };

export default function KursiPage() {
  const router = useRouter();
  const [data, setData] = useState<Kursi[]>([]);
  const [gerbongs, setGerbongs] = useState<Gerbong[]>([]);
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
      const [kRes, gRes] = await Promise.all([kursiAPI.getAll(), gerbongAPI.getAll()]);
      setData(normalizeCollection(kRes.data, normalizeKursi));
      setGerbongs(normalizeCollection(gRes.data, normalizeGerbong));
    } catch {
      toast("error", "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      gerbongId: Number(form.gerbongId),
      nomor: form.nomor,
    };
    try {
      if (editId) {
        await kursiAPI.update(editId, payload);
        toast("success", "Diperbarui");
      } else {
        await kursiAPI.create(payload);
        toast("success", "Ditambahkan");
      }
      setShowForm(false);
      setEditId(null);
      setForm(EMPTY);
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast("error", msg || "Operasi gagal");
    } finally {
      setSaving(false);
    }
  };

  const del = async (row: Kursi) => {
    if (!confirm("Hapus kursi ini?")) return;
    try {
      await kursiAPI.delete(row.id);
      toast("success", "Dihapus");
      load();
    } catch {
      toast("error", "Gagal menghapus");
    }
  };

  const openEdit = (row: Kursi) => {
    setEditId(row.id);
    setForm({ gerbongId: String(row.gerbongId), nomor: row.nomor });
    setShowForm(true);
  };

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl text-white">Kursi</h1>
            <p className="text-sm text-white/40 mt-0.5">Kelola kursi per gerbong</p>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditId(null);
              setForm(EMPTY);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-rail-600 hover:bg-rail-500 text-white rounded-xl text-sm font-medium transition-all"
          >
            <Plus className="w-4 h-4" /> Tambah Kursi
          </button>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden">
          <DataTable
            loading={loading}
            data={data}
            columns={[
              { key: "id", label: "#", render: (r) => <span className="text-white/30">#{r.id}</span> },
              { key: "nomor", label: "Nomor Kursi", render: (r) => <span className="text-white font-medium">{r.nomor}</span> },
              { key: "gerbong", label: "Gerbong", render: (r) => <span className="text-white/70">Gerbong {r.gerbong?.nama ?? r.gerbongId}</span> },
              { key: "status", label: "Status", render: (r) => <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${r.status === "AVAILABLE" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>{r.status}</span> },
            ]}
            onEdit={openEdit}
            onDelete={del}
          />
        </div>

        <Modal title={editId ? "Edit Kursi" : "Tambah Kursi"} open={showForm} onClose={() => setShowForm(false)} size="sm">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">Gerbong</label>
              <select
                value={form.gerbongId}
                onChange={(e) => setForm({ ...form, gerbongId: e.target.value })}
                required
                className="w-full px-3 py-2.5 glass rounded-xl text-white text-sm border border-white/10 bg-transparent"
              >
                <option value="" className="bg-gray-900">Pilih gerbong</option>
                {gerbongs.map((gerbong) => (
                  <option key={gerbong.id} value={gerbong.id} className="bg-gray-900">
                    {gerbong.nama} - {gerbong.jadwal?.asal}{" -> "}{gerbong.jadwal?.tujuan}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">Nomor Kursi</label>
              <input
                type="text"
                required
                placeholder="A1, B2, dll"
                value={form.nomor}
                onChange={(e) => setForm({ ...form, nomor: e.target.value })}
                className="w-full px-3 py-2.5 glass rounded-xl text-white text-sm border border-white/10"
              />
            </div>
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
