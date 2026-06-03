type AnyRecord = Record<string, unknown>;

function isRecord(value: unknown): value is AnyRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function unwrapPayload(payload: unknown): unknown {
  if (!isRecord(payload)) return payload;
  if ("data" in payload && payload.data !== undefined) return payload.data;
  if ("items" in payload) return payload.items;
  if ("results" in payload) return payload.results;
  return payload;
}

function firstDefined<T>(...values: Array<T | null | undefined>): T | undefined {
  return values.find((value) => value !== null && value !== undefined);
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function asString(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }
  return undefined;
}

function asObject(value: unknown): AnyRecord | undefined {
  return isRecord(value) ? value : undefined;
}

function normalizeNested<T>(value: unknown, mapper: (item: unknown) => T): T | undefined {
  const payload = unwrapPayload(value);
  if (payload === undefined || payload === null) return undefined;
  return mapper(payload);
}

export function normalizeCollection<T>(payload: unknown, mapper: (item: unknown) => T): T[] {
  const unwrapped = unwrapPayload(payload);
  if (Array.isArray(unwrapped)) return unwrapped.map(mapper);
  if (isRecord(unwrapped)) {
    const nested = firstDefined(unwrapped.data, unwrapped.items, unwrapped.results);
    if (Array.isArray(nested)) return nested.map(mapper);
  }
  return [];
}

export function normalizeSingle<T>(payload: unknown, mapper: (item: unknown) => T): T | null {
  const unwrapped = unwrapPayload(payload);
  if (unwrapped === undefined || unwrapped === null) return null;
  return mapper(unwrapped);
}

export interface NormalizedJenisKereta {
  id: number;
  nama: string;
  deskripsi?: string;
}

export function normalizeJenisKereta(item: unknown): NormalizedJenisKereta {
  const obj = asObject(item) ?? {};
  return {
    id: asNumber(firstDefined(obj.id, obj.jenisKeretaId, obj.jenis_kereta_id)) ?? 0,
    nama: asString(firstDefined(obj.nama, obj.name, obj.namaKereta)) ?? "",
    deskripsi: asString(firstDefined(obj.deskripsi, obj.description)),
  };
}

export interface NormalizedJadwal {
  id: number;
  asal: string;
  tujuan: string;
  tanggalBerangkat: string;
  jamBerangkat: string;
  jamTiba: string;
  harga: number;
  jenisKeretaId: number;
  jenisKereta?: NormalizedJenisKereta;
}

export function normalizeJadwal(item: unknown): NormalizedJadwal {
  const obj = asObject(item) ?? {};
  const jenisKereta = normalizeNested(
    firstDefined(obj.jenisKereta, obj.kereta, obj.jenis_kereta),
    normalizeJenisKereta,
  );

  return {
    id: asNumber(firstDefined(obj.id, obj.jadwalId, obj.jadwal_id)) ?? 0,
    asal: asString(firstDefined(obj.asal, obj.asalStasiun, obj.from)) ?? "",
    tujuan: asString(firstDefined(obj.tujuan, obj.tujuanStasiun, obj.to)) ?? "",
    tanggalBerangkat: asString(firstDefined(obj.tanggalBerangkat, obj.tanggal, obj.date)) ?? "",
    jamBerangkat: asString(firstDefined(obj.jamBerangkat, obj.berangkat, obj.waktuBerangkat)) ?? "",
    jamTiba: asString(firstDefined(obj.jamTiba, obj.tiba, obj.waktuTiba)) ?? "",
    harga: asNumber(firstDefined(obj.harga, obj.price, obj.tarif)) ?? 0,
    jenisKeretaId: asNumber(firstDefined(obj.jenisKeretaId, obj.keretaId, obj.jenis_kereta_id)) ?? 0,
    jenisKereta,
  };
}

export interface NormalizedGerbong {
  id: number;
  nama: string;
  kapasitas: number;
  jadwalId: number;
  jadwal?: Pick<NormalizedJadwal, "id" | "asal" | "tujuan">;
}

export function normalizeGerbong(item: unknown): NormalizedGerbong {
  const obj = asObject(item) ?? {};
  const jadwal = asObject(obj.jadwal);

  return {
    id: asNumber(firstDefined(obj.id, obj.gerbongId, obj.gerbong_id)) ?? 0,
    nama: asString(firstDefined(obj.nama, obj.name)) ?? "",
    kapasitas: asNumber(firstDefined(obj.kapasitas, obj.capacity)) ?? 0,
    jadwalId: asNumber(firstDefined(obj.jadwalId, obj.scheduleId, obj.jadwal_id)) ?? 0,
    jadwal: jadwal
      ? {
          id: asNumber(firstDefined(jadwal.id, jadwal.jadwalId)) ?? 0,
          asal: asString(firstDefined(jadwal.asal, jadwal.asalStasiun)) ?? "",
          tujuan: asString(firstDefined(jadwal.tujuan, jadwal.tujuanStasiun)) ?? "",
        }
      : undefined,
  };
}

export interface NormalizedKursi {
  id: number;
  nomor: string;
  status: string;
  gerbongId: number;
  gerbong?: Pick<NormalizedGerbong, "id" | "nama" | "jadwal">;
}

export function normalizeKursi(item: unknown): NormalizedKursi {
  const obj = asObject(item) ?? {};
  const gerbong = asObject(obj.gerbong);

  return {
    id: asNumber(firstDefined(obj.id, obj.kursiId, obj.kursi_id)) ?? 0,
    nomor: asString(firstDefined(obj.nomor, obj.nomorKursi, obj.noKursi)) ?? "",
    status: asString(firstDefined(obj.status, obj.state)) ?? "AVAILABLE",
    gerbongId: asNumber(firstDefined(obj.gerbongId, obj.gerbong_id)) ?? 0,
    gerbong: gerbong
      ? {
          id: asNumber(firstDefined(gerbong.id, gerbong.gerbongId)) ?? 0,
          nama: asString(firstDefined(gerbong.nama, gerbong.name)) ?? "",
          jadwal: normalizeNested(firstDefined(gerbong.jadwal, gerbong.schedule), (value) => {
            const normalized = normalizeJadwal(value);
            return {
              id: normalized.id,
              asal: normalized.asal,
              tujuan: normalized.tujuan,
            };
          }),
        }
      : undefined,
  };
}

export interface NormalizedDetailBooking {
  id?: number;
  kursiId: number;
  namaPenumpang: string;
  nik: string;
  kursi?: NormalizedKursi;
}

export interface NormalizedBooking {
  id: number;
  kodeTransaksi: string;
  totalPenumpang: number;
  totalHarga: number;
  status: string;
  createdAt: string;
  user?: {
    id?: number;
    name?: string;
    email?: string;
  };
  detailBooking: NormalizedDetailBooking[];
}

export function normalizeBooking(item: unknown): NormalizedBooking {
  const obj = asObject(item) ?? {};
  const user = asObject(obj.user);
  const details = Array.isArray(obj.detailBooking) ? obj.detailBooking : [];

  return {
    id: asNumber(firstDefined(obj.id, obj.transaksiId)) ?? 0,
    kodeTransaksi: asString(firstDefined(obj.kodeTransaksi, obj.kode, obj.bookingCode)) ?? "",
    totalPenumpang: asNumber(firstDefined(obj.totalPenumpang, obj.total_passenger)) ?? 0,
    totalHarga: asNumber(firstDefined(obj.totalHarga, obj.total_harga)) ?? 0,
    status: asString(firstDefined(obj.status, obj.state)) ?? "",
    createdAt: asString(firstDefined(obj.createdAt, obj.created_at, obj.tanggal)) ?? "",
    user: user
      ? {
          id: asNumber(firstDefined(user.id, user.userId)) ?? undefined,
          name: asString(firstDefined(user.name, user.fullName)) ?? undefined,
          email: asString(firstDefined(user.email, user.username)) ?? undefined,
        }
      : undefined,
    detailBooking: details.map((detail) => {
      const d = asObject(detail) ?? {};
      return {
        id: asNumber(firstDefined(d.id, d.detailBookingId)) ?? undefined,
        kursiId: asNumber(firstDefined(d.kursiId, d.seatId)) ?? 0,
        namaPenumpang: asString(firstDefined(d.namaPenumpang, d.passengerName)) ?? "",
        nik: asString(firstDefined(d.nik, d.identityNumber)) ?? "",
        kursi: normalizeNested(d.kursi, normalizeKursi),
      };
    }),
  };
}

export interface NormalizedUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt?: string;
}

export function normalizeUser(item: unknown): NormalizedUser {
  const obj = asObject(item) ?? {};
  return {
    id: asNumber(firstDefined(obj.id, obj.userId, obj.user_id)) ?? 0,
    name: asString(firstDefined(obj.name, obj.fullName, obj.nama)) ?? "",
    email: asString(firstDefined(obj.email, obj.username)) ?? "",
    phone: asString(firstDefined(obj.phone, obj.noHp, obj.no_telepon)) ?? "",
    role: asString(firstDefined(obj.role, obj.userRole)) ?? "",
    createdAt: asString(firstDefined(obj.createdAt, obj.created_at)),
  };
}

