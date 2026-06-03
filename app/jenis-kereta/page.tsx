"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import Modal from "@/components/Modal";
import DataTable from "@/components/DataTable";
import { getUser, isAdmin } from "@/lib/auth";
import { jenisKeretaAPI } from "@/lib/api";
import { toast } from "@/components/Toast";
import { normalizeCollection, normalizeJenisKereta } from "@/lib/normalize";

type JenisKereta = ReturnType<typeof normalizeJenisKereta>;
const EMPTY = { nama: "", deskripsi: "" };

export default function JenisKeretaPage() {
  const router = useRouter();
  const [data, setData] = useState<JenisKereta[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (!u || !isAdmin()) {
      router.push("/dashboard");
      return;
    }
    load();
  }, []);

  const load = async () => {
    try {
      const r = await jenisKeretaAPI.getAll();
      setData(normalizeCollection(r.data, normalizeJenisKereta));
    } catch {
      toast("error", "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await jenisKeretaAPI.update(editId, form);
        toast("success", "Data diperbarui");
      } else {
        await jenisKeretaAPI.create(form);
        toast("success", "Data ditambahkan");
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

  const del = async (row: JenisKereta) => {
    if (!confirm(`Hapus ${row.nama}?`)) return;
    try {
      await jenisKeretaAPI.delete(row.id);
      toast("success", "Dihapus");
      load();
    } catch {
      toast("error", "Gagal menghapus");
    }
  };

  const openEdit = (row: JenisKereta) => {
    setEditId(row.id);
    setForm({ nama: row.nama, deskripsi: row.deskripsi || "" });
    setShowForm(true);
  };

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl text-white">Jenis Kereta</h1>
            <p className="text-sm text-white/40 mt-0.5">Kelola jenis kereta</p>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditId(null);
              setForm(EMPTY);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-rail-600 hover:bg-rail-500 text-white rounded-xl text-sm font-medium transition-all"
          >
            <Plus className="w-4 h-4" /> Tambah
          </button>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden">
          <DataTable
            loading={loading}
            data={data}
            columns={[
              { key: "id", label: "#", render: (r) => <span className="text-white/30">#{r.id}</span> },
              { key: "nama", label: "Nama Kereta", render: (r) => <span className="text-white font-medium">{r.nama}</span> },
              { key: "deskripsi", label: "Deskripsi", render: (r) => <span className="text-white/70">{r.deskripsi || "-"}</span> },
            ]}
            onEdit={openEdit}
            onDelete={del}
          />
        </div>

        <Modal title={editId ? "Edit Jenis Kereta" : "Tambah Jenis Kereta"} open={showForm} onClose={() => setShowForm(false)} size="sm">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">Nama Kereta</label>
              <input
                type="text"
                required
                placeholder="Argo Bromo Anggrek"
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                className="w-full px-3 py-2.5 glass rounded-xl text-white text-sm border border-white/10"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">Deskripsi</label>
              <input
                type="text"
                placeholder="Ekonomi, bisnis, eksekutif..."
                value={form.deskripsi}
                onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
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
