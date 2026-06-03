"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, MapPin, Clock, Train, ChevronRight, Loader2 } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import Modal from "@/components/Modal";
import DataTable from "@/components/DataTable";
import { getUser, isAdmin } from "@/lib/auth";
import { jadwalAPI, jenisKeretaAPI, bookingAPI, kursiAPI } from "@/lib/api";
import { toast } from "@/components/Toast";
import { normalizeCollection, normalizeJadwal, normalizeJenisKereta, normalizeKursi } from "@/lib/normalize";

type JenisKereta = ReturnType<typeof normalizeJenisKereta>;
type Jadwal = ReturnType<typeof normalizeJadwal>;
type Kursi = ReturnType<typeof normalizeKursi>;

const EMPTY_FORM = {
  jenisKeretaId: "",
  asal: "",
  tujuan: "",
  tanggalBerangkat: "",
  jamBerangkat: "",
  jamTiba: "",
  harga: "",
};
const EMPTY_BOOK = { namaPenumpang: "", nik: "", kursiId: "" };

export default function JadwalPage() {
  const router = useRouter();

  // NOTE: getUser()/isAdmin() membaca localStorage; itu aman karena komponen ini client-side
  // Tapi agar parsing JSX aman, pastikan seluruh logika di atas blok return sederhana.

  const user = getUser();
  const admin = isAdmin();
  const [jadwals, setJadwals] = useState<Jadwal[]>([]);
  const [jenisKereta, setJenisKereta] = useState<JenisKereta[]>([]);
  const [kursis, setKursis] = useState<Kursi[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bookModal, setBookModal] = useState(false);
  const [selectedJadwal, setSelectedJadwal] = useState<Jadwal | null>(null);
  const [bookFormList, setBookFormList] = useState([EMPTY_BOOK]);
  const [booking, setBooking] = useState(false);


  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    load();
  }, []);

  const load = async () => {
    try {
      
      const [jRes, kRes] = await Promise.all([jadwalAPI.getAll(), jenisKeretaAPI.getAll()]);
      setJadwals(normalizeCollection(jRes.data, normalizeJadwal));
      setJenisKereta(normalizeCollection(kRes.data, normalizeJenisKereta));
    } catch {
      toast("error", "Gagal memuat jadwal");
    } finally {
      setLoading(false);
    }
  };

  const openBook = async (jadwal: Jadwal) => {
    setSelectedJadwal(jadwal);
    setBookFormList([EMPTY_BOOK]);
    setBookModal(true);

    try {
      const res = await kursiAPI.getAll();
      setKursis(normalizeCollection(res.data, normalizeKursi).filter((k) => k.status === "AVAILABLE"));
    } catch {
      toast("error", "Gagal memuat kursi");
    }
  };

  const submitBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJadwal) return;

    // Validasi minimal
    const invalid = bookFormList.some(
      (p) => !p.namaPenumpang.trim() || !p.nik.trim() || !p.kursiId,
    );
    if (invalid) {
      toast("error", "Lengkapi data semua penumpang");
      return;
    }

    // Cegah kursi dobel di transaksi yang sama
    const kursiIds = bookFormList.map((p) => Number(p.kursiId));
    const uniq = new Set(kursiIds);
    if (uniq.size !== kursiIds.length) {
      toast("error", "Kursi tidak boleh dobel dalam 1 transaksi");
      return;
    }

    setBooking(true);
    try {
      await bookingAPI.create({
        penumpang: bookFormList.map((p) => ({
          namaPenumpang: p.namaPenumpang,
          nik: p.nik,
          kursiId: Number(p.kursiId),
        })),
      });
      toast("success", "Booking berhasil!");
      setBookModal(false);
      router.push("/my-booking");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast("error", msg || "Booking gagal");
    } finally {
      setBooking(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      asal: form.asal,
      tujuan: form.tujuan,
      tanggalBerangkat: new Date(form.tanggalBerangkat).toISOString(),
      jamBerangkat: form.jamBerangkat,
      jamTiba: form.jamTiba,
      harga: Number(form.harga),
      jenisKeretaId: Number(form.jenisKeretaId),
    };
    try {
      if (editId) {
        await jadwalAPI.update(editId, payload);
        toast("success", "Jadwal diperbarui");
      } else {
        await jadwalAPI.create(payload);
        toast("success", "Jadwal ditambahkan");
      }
      setShowForm(false);
      setEditId(null);
      setForm(EMPTY_FORM);
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast("error", msg || "Operasi gagal");
    } finally {
      setSaving(false);
    }
  };

  const del = async (jadwal: Jadwal) => {
    if (
      !confirm(`Hapus jadwal ${jadwal.asal} -> ${jadwal.tujuan}?`)
    )
      return;
    try {
      await jadwalAPI.delete(jadwal.id);
      toast("success", "Jadwal dihapus");
      load();
    } catch {
      toast("error", "Gagal menghapus");
    }
  };

  const openEdit = (jadwal: Jadwal) => {
    setEditId(jadwal.id);
    setForm({
      jenisKeretaId: String(jadwal.jenisKeretaId),
      asal: jadwal.asal,
      tujuan: jadwal.tujuan,
      tanggalBerangkat: jadwal.tanggalBerangkat?.slice(0, 10) ?? "",
      jamBerangkat: jadwal.jamBerangkat,
      jamTiba: jadwal.jamTiba,
      harga: String(jadwal.harga),
    });
    setShowForm(true);
  };

  const fmtDate = (value: string) =>
    value ? new Date(value).toLocaleDateString("id-ID", { dateStyle: "medium" }) : "-";
  const fmtTime = (value: string) =>
    value || "-";
  const fmtCurr = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(n);

  const query = search.toLowerCase();
  const filtered = jadwals.filter((jadwal) => {
    const text = `${jadwal.asal} ${jadwal.tujuan}`.toLowerCase();
    return text.includes(query);
  });


  if (!user) return null;

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl text-white">Jadwal Kereta</h1>
            <p className="text-sm text-white/40 mt-0.5">{filtered.length} jadwal tersedia</p>
          </div>
          {admin && (
            <button
              onClick={() => {
                setShowForm(true);
                setEditId(null);
                setForm(EMPTY_FORM);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-rail-600 hover:bg-rail-500 text-white rounded-xl text-sm font-medium transition-all"
            >
              <Plus className="w-4 h-4" /> Tambah Jadwal
            </button>
          )}
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Cari stasiun asal atau tujuan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 glass-card rounded-xl text-white text-sm placeholder-white/20 border border-transparent focus:border-rail-500/30 transition-all"
          />
        </div>

        {admin ? (
          <div className="glass-card rounded-2xl overflow-hidden">
            <DataTable
              loading={loading}
              data={filtered}
              columns={[
                { key: "id", label: "#", render: (r) => <span className="text-white/30">#{r.id}</span> },
                { key: "rute", label: "Rute", render: (r) => <span className="text-white/70">{r.asal} {" -> "} {r.tujuan}</span> },
                { key: "tanggal", label: "Tanggal", render: (r) => <span className="text-white/70">{fmtDate(r.tanggalBerangkat)}</span> },
                { key: "berangkat", label: "Berangkat", render: (r) => <span className="text-white/70">{fmtTime(r.jamBerangkat)}</span> },
                { key: "tiba", label: "Tiba", render: (r) => <span className="text-white/70">{fmtTime(r.jamTiba)}</span> },
                { key: "harga", label: "Harga", render: (r) => <span className="text-rail-400 font-medium">{fmtCurr(r.harga)}</span> },
                { key: "kereta", label: "Jenis Kereta", render: (r) => <span className="text-white/50">{r.jenisKereta?.nama || "-"}</span> },
              ]}
              onEdit={openEdit}
              onDelete={del}
            />
          </div>
        ) : loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-rail-400/30 border-t-rail-400 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-white/30">
            <Train className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Tidak ada jadwal ditemukan</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((jadwal) => (
              <div key={jadwal.id} className="glass-card rounded-2xl p-5 hover:border-rail-500/30 transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-rail-600/20 rounded-lg flex items-center justify-center">
                      <Train className="w-4 h-4 text-rail-400" />
                    </div>
                    <span className="text-xs text-white/40">{jadwal.jenisKereta?.nama || "Kereta"}</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">Tersedia</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-lg font-bold text-white">{jadwal.asal}</div>
                    <div className="flex items-center gap-1 text-xs text-white/40 mt-0.5">
                      <Clock className="w-3 h-3" /> {fmtTime(jadwal.jamBerangkat)}
                    </div>
                  </div>
                  <div className="flex flex-col items-center px-4">
                    <div className="text-white/20 text-xs mb-1">-&gt;</div>
                    <div className="h-px w-10 bg-white/10" />
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">{jadwal.tujuan}</div>
                    <div className="flex items-center justify-end gap-1 text-xs text-white/40 mt-0.5">
                      <MapPin className="w-3 h-3" /> {fmtTime(jadwal.jamTiba)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div className="text-rail-400 font-bold text-base">{fmtCurr(jadwal.harga)}</div>
                  <button
                    onClick={() => openBook(jadwal)}
                    className="px-4 py-1.5 bg-rail-600 hover:bg-rail-500 text-white text-xs rounded-lg transition-all"
                  >
                    Pesan Sekarang
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal title={editId ? "Edit Jadwal" : "Tambah Jadwal"} open={showForm} onClose={() => { setShowForm(false); setEditId(null); }}>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">Jenis Kereta</label>
              <select
                value={form.jenisKeretaId}
                onChange={(e) => setForm({ ...form, jenisKeretaId: e.target.value })}
                required
                className="w-full px-3 py-2.5 glass rounded-xl text-white text-sm border border-white/10 bg-transparent"
              >
                <option value="" className="bg-gray-900">Pilih jenis kereta</option>
                {jenisKereta.map((jk) => (
                  <option key={jk.id} value={jk.id} className="bg-gray-900">
                    {jk.nama}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">Tanggal Berangkat</label>
              <input
                type="date"
                required
                value={form.tanggalBerangkat}
                onChange={(e) => setForm({ ...form, tanggalBerangkat: e.target.value })}
                className="w-full px-3 py-2.5 glass rounded-xl text-white text-sm border border-white/10"
              />
            </div>
            {[
              { key: "asal", label: "Stasiun Asal", type: "text" },
              { key: "tujuan", label: "Stasiun Tujuan", type: "text" },
             { key: "jamBerangkat", label: "Jam Berangkat", type: "time" },
              { key: "jamTiba", label: "Jam Tiba", type: "time" },
              { key: "harga", label: "Harga (Rp)", type: "number" },
            ].map(({ key, label, type }) => (
              <div key={key}>
                <label className="text-xs text-white/50 mb-1.5 block">{label}</label>
                <input
                  type={type}
                  required
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full px-3 py-2.5 glass rounded-xl text-white text-sm border border-white/10"
                />
              </div>
            ))}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 glass rounded-xl text-white/60 text-sm">Batal</button>
              <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-rail-600 hover:bg-rail-500 text-white rounded-xl text-sm flex items-center justify-center gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />} Simpan
              </button>
            </div>
          </form>
        </Modal>

        <Modal
          title={`Pesan Tiket - ${selectedJadwal?.asal} -> ${selectedJadwal?.tujuan}`}
          open={bookModal}
          onClose={() => {
            setBookModal(false);
            setBookFormList([EMPTY_BOOK]);
          }}
        >
          <form onSubmit={submitBook} className="space-y-4">
            <div className="max-h-[60vh] overflow-y-auto pr-1">
              {bookFormList.map((p, idx) => (
                <div key={idx} className="space-y-3 p-3 glass rounded-2xl mb-3">
                  <div className="text-xs text-white/40">Penumpang {idx + 1}</div>

                  <div>
                    <label className="text-xs text-white/50 mb-1.5 block">Nama Penumpang</label>
                    <input
                      type="text"
                      required
                      placeholder="Nama sesuai KTP"
                      value={p.namaPenumpang}
                      onChange={(e) =>
                        setBookFormList((prev) =>
                          prev.map((item, i) =>
                            i === idx ? { ...item, namaPenumpang: e.target.value } : item,
                          ),
                        )
                      }
                      className="w-full px-3 py-2.5 glass rounded-xl text-white text-sm border border-white/10"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-white/50 mb-1.5 block">NIK</label>
                    <input
                      type="text"
                      required
                      placeholder="16 digit NIK"
                      value={p.nik}
                      onChange={(e) =>
                        setBookFormList((prev) =>
                          prev.map((item, i) =>
                            i === idx ? { ...item, nik: e.target.value } : item,
                          ),
                        )
                      }
                      className="w-full px-3 py-2.5 glass rounded-xl text-white text-sm border border-white/10"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-white/50 mb-1.5 block">Pilih Kursi</label>
                    <select
                      value={p.kursiId}
                      onChange={(e) =>
                        setBookFormList((prev) =>
                          prev.map((item, i) =>
                            i === idx ? { ...item, kursiId: e.target.value } : item,
                          ),
                        )
                      }
                      required
                      className="w-full px-3 py-2.5 glass rounded-xl text-white text-sm border border-white/10 bg-transparent"
                    >
                      <option value="" className="bg-gray-900">Pilih kursi</option>
                      {kursis.map((kursi) => (
                        <option key={kursi.id} value={kursi.id} className="bg-gray-900">
                          Gerbong {kursi.gerbong?.nama || "-"} - Kursi {kursi.nomor}
                        </option>
                      ))}
                    </select>
                  </div>

                  {bookFormList.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setBookFormList((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="w-full py-2.5 glass rounded-xl text-white/60 text-sm hover:text-white/80 transition-all"
                    >
                      Hapus Penumpang
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setBookFormList((prev) => [...prev, EMPTY_BOOK])}
              className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white/70 rounded-xl text-sm transition-all"
            >
              + Tambah Penumpang
            </button>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setBookModal(false)}
                className="flex-1 py-2.5 glass rounded-xl text-white/60 text-sm"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={booking}
                className="flex-1 py-2.5 bg-rail-600 hover:bg-rail-500 text-white rounded-xl text-sm flex items-center justify-center gap-2"
              >
                {booking && <Loader2 className="w-4 h-4 animate-spin" />} Konfirmasi Booking
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </PageWrapper>
  );
}
