// File: src/services/signers.ts
import { Signer } from "../types";

// BASE URL API
const API_BASE = (import.meta.env.VITE_API_BASE_URL?.trim() || "/backend/api").replace(/\/+$/, "");

/**
 * Ambil semua penandatangan
 */
export async function getSigners(): Promise<Signer[]> {
  try {
    const res = await fetch(`${API_BASE}/signers.php`);
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      return data.data as Signer[];
    }
    return [];
  } catch (err) {
    console.error("Gagal ambil daftar signers:", err);
    return [];
  }
}

/**
 * Ambil detail penandatangan by ID
 * (backend: signers.php?id=123)
 */
export async function getSignerById(id: number): Promise<Signer | null> {
  try {
    const res = await fetch(`${API_BASE}/signers.php?id=${encodeURIComponent(String(id))}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.success && data.data) {
      return data.data as Signer;
    }
    return null;
  } catch (err) {
    console.error("Gagal ambil detail signer (by id):", err);
    return null;
  }
}

/**
 * Ambil detail penandatangan by Name
 * (backend: signers.php?name=Nama%20Lengkap)
 */
export async function getSignerByName(name: string): Promise<Signer | null> {
  try {
    const res = await fetch(`${API_BASE}/signers.php?name=${encodeURIComponent(name)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.success && data.data) {
      return data.data as Signer;
    }
    return null;
  } catch (err) {
    console.error("Gagal ambil detail signer (by name):", err);
    return null;
  }
}

/**
 * Tambah penandatangan baru
 */
export async function createSigner(nama: string, jabatan?: string): Promise<Signer | null> {
  try {
    const res = await fetch(`${API_BASE}/create_signer.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nama, jabatan }),
    });
    const data = await res.json();
    if (data.success && data.data) {
      return data.data as Signer;
    }
    return null;
  } catch (err) {
    console.error("Gagal membuat signer:", err);
    return null;
  }
}
