// Base API URL: pakai env variable dulu, kalau tidak ada pakai default
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost/backend/api";

// Semua endpoint API
export const API_ENDPOINTS = {
  signers: `${API_BASE_URL}/signers`,
  verify: `${API_BASE_URL}/verify`,
  documents: `${API_BASE_URL}/documents`,
  uploads: `${API_BASE_URL}/uploads` // jika butuh upload files
}
