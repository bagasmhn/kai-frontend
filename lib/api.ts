import axios from "axios";

const BASE = process.env.NEXT_PUBLIC_API_URL || "https://kereta-api-ticketing-system-production.up.railway.app";

export const api = axios.create({
  baseURL: BASE,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  register: (data: { name: string; email: string; password: string; phone: string }) =>
    api.post("/api/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post("/api/auth/login", data),
};

// User
export const userAPI = {
  getAll: () => api.get("/api/user"),
  getById: (id: number) => api.get(`/api/user/${id}`),
  update: (id: number, data: Partial<{ name: string; email: string; phone: string }>) =>
    api.put(`/api/user/${id}`, data),
  delete: (id: number) => api.delete(`/api/user/${id}`),
  getAllAdmin: () => api.get("/api/user/admin/all"),
};

// JenisKereta
export const jenisKeretaAPI = {
  create: (data: { nama: string; deskripsi?: string }) =>
    api.post("/api/jenis-kereta", data),
  getAll: () => api.get("/api/jenis-kereta"),
  getById: (id: number) => api.get(`/api/jenis-kereta/${id}`),
  update: (id: number, data: Partial<{ nama: string; deskripsi?: string }>) =>
    api.put(`/api/jenis-kereta/${id}`, data),
  delete: (id: number) => api.delete(`/api/jenis-kereta/${id}`),
};

// Jadwal
export const jadwalAPI = {
  create: (data: {
    jenisKeretaId: number;
    asal: string;
    tujuan: string;
    tanggalBerangkat: string;
    jamBerangkat: string;
    jamTiba: string;
    harga: number;
  }) =>
    api.post("/api/jadwal", data),
  getAll: () => api.get("/api/jadwal"),
  getById: (id: number) => api.get(`/api/jadwal/${id}`),
  update: (
    id: number,
    data: {
      asal?: string;
      tujuan?: string;
      tanggalBerangkat?: string;
      jamBerangkat?: string;
      jamTiba?: string;
      harga?: number;
      jenisKeretaId?: number;
    },
  ) =>
    api.put(`/api/jadwal/${id}`, data),
  delete: (id: number) => api.delete(`/api/jadwal/${id}`),
};

// Gerbong
export const gerbongAPI = {
  create: (data: { jadwalId: number; nama: string; kapasitas: number }) =>
    api.post("/api/gerbong", data),
  getAll: () => api.get("/api/gerbong"),
  getById: (id: number) => api.get(`/api/gerbong/${id}`),
  update: (id: number, data: { jadwalId?: number; nama?: string; kapasitas?: number }) =>
    api.put(`/api/gerbong/${id}`, data),
  delete: (id: number) => api.delete(`/api/gerbong/${id}`),
};

// Kursi
export const kursiAPI = {
  create: (data: { gerbongId: number; nomor: string }) =>
    api.post("/api/kursi", data),
  getAll: () => api.get("/api/kursi"),
  getById: (id: number) => api.get(`/api/kursi/${id}`),
  update: (id: number, data: { gerbongId?: number; nomor?: string; status?: string }) =>
    api.put(`/api/kursi/${id}`, data),
  delete: (id: number) => api.delete(`/api/kursi/${id}`),
};

// Booking
export const bookingAPI = {
  create: (data: { penumpang: { namaPenumpang: string; nik: string; kursiId: number }[] }) =>
    api.post("/api/booking", data),
  getAll: () => api.get("/api/booking"),
  getMy: () => api.get("/api/booking/my"),
  getHistory: () => api.get("/api/booking/history/my"),
  getRekap: () => api.get("/api/booking/rekap/pemasukan"),
  getTicket: (id: number) => api.get(`/api/booking/ticket/${id}`, { responseType: "blob" }),
};
