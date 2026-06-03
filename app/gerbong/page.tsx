"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import Modal from "@/components/Modal";
import DataTable from "@/components/DataTable";
import { getUser, isAdmin } from "@/lib/auth";
import { gerbongAPI, jadwalAPI } from "@/lib/api";
import { toast } from "@/components/Toast";
import { normalizeCollection, normalizeGerbong, normalizeJadwal } from "@/lib/normalize";

type Gerbong = ReturnType<typeof normalizeGerbong>;
type Jadwal = ReturnType<typeof normalizeJadwal>;
const EMPTY = { jadwalId: "", nama: "", kapasitas: "" };

export default function GerbongPage() {
  const router = useRouter();
  const [data, setData] = useState<Gerbong[]>([]);
  const [jadwals, setJadwals] = useState<Jadwal[]>([]);
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
      const [gRes, jRes] = await Promise.all([gerbongAPI.getAll(), jadwalAPI.getAll()]);
      setData(normalizeCollection(gRes.data, normalizeGerbong));
      setJadwals(normalizeCollection(jRes.data, normalizeJadwal));
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
      jadwalId: Number(form.jadwalId),
      nama: form.nama,
      kapasitas: Number(form.kapasitas),
    };
    try {
      if (editId) {
        await gerbongAPI.update(editId, payload);
        toast("success", "Diperbarui");
      } else {
        await gerbongAPI.create(payload);
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

  const del = async (row: Gerbong) => {
    if (!confirm("Hapus gerbong ini?")) return;
    try {
      await gerbongAPI.delete(row.id);
      toast("success", "Dihapus");
      load();
    } catch {
      toast("error", "Gagal menghapus");
    }
  };

  const openEdit = (row: Gerbong) => {
    setEditId(row.id);
    setForm({
      jadwalId: String(row.jadwalId),
      nama: row.nama,
      kapasitas: String(row.kapasitas),
    });
    setShowForm(true);
  };

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl text-white">Gerbong</h1>
            <p className="text-sm text-white/40 mt-0.5">Kelola gerbong kereta</p>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditId(null);
              setForm(EMPTY);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-rail-600 hover:bg-rail-500 text-white rounded-xl text-sm font-medium transition-all"
          >
            <Plus className="w-4 h-4" /> Tambah Gerbong
          </button>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden">
          <DataTable
            loading={loading}
            data={data}
            columns={[
              { key: "id", label: "#", render: (r) => <span className="text-white/30">#{r.id}</span> },
              { key: "nama", label: "Nama Gerbong", render: (r) => <span className="text-white font-medium">{r.nama}</span> },
              { key: "jadwal", label: "Jadwal", render: (r) => <span className="text-white/70">{r.jadwal ? `${r.jadwal.asal} -> ${r.jadwal.tujuan}` : `#${r.jadwalId}`}</span> },
              { key: "kapasitas", label: "Kapasitas", render: (r) => <span className="text-white/70">{r.kapasitas}</span> },
            ]}
            onEdit={openEdit}
            onDelete={del}
          />
        </div>

        <Modal title={editId ? "Edit Gerbong" : "Tambah Gerbong"} open={showForm} onClose={() => setShowForm(false)} size="sm">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">Jadwal</label>
              <select
                value={form.jadwalId}
                onChange={(e) => setForm({ ...form, jadwalId: e.target.value })}
                required
                className="w-full px-3 py-2.5 glass rounded-xl text-white text-sm border border-white/10 bg-transparent"
              >
                <option value="" className="bg-gray-900">Pilih jadwal</option>
                {jadwals.map((jadwal) => (
                  <option key={jadwal.id} value={jadwal.id} className="bg-gray-900">
                    {jadwal.asal}{" -> "}{jadwal.tujuan}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">Nama Gerbong</label>
              <input
                type="text"
                required
                placeholder="LUXURY"
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                className="w-full px-3 py-2.5 glass rounded-xl text-white text-sm border border-white/10"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">Kapasitas</label>
              <input
                type="number"
                required
                value={form.kapasitas}
                onChange={(e) => setForm({ ...form, kapasitas: e.target.value })}
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
