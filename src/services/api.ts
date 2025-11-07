import { API_BASE_URL } from "../config";
import { Document, Signer } from "../types";

// 🔍 Verifikasi dokumen berdasarkan nomor
export async function verifyDocument(nomor_dokumen: string): Promise<Document | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/verify.php?nomor_dokumen=${nomor_dokumen}`);
    if (!res.ok) {
      throw new Error("Gagal menghubungi server");
    }
    const data = await res.json();
    return data || null;
  } catch (error) {
    console.error("verifyDocument error:", error);
    return null;
  }
}

// 👥 Ambil semua penandatangan
export async function getSigners(): Promise<Signer[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/signers.php`);
    if (!res.ok) {
      throw new Error("Gagal mengambil data signers");
    }

    const data = await res.json();

    // Pastikan sesuai format dari backend
    if (data.success && Array.isArray(data.data)) {
      return data.data;
    }

    return [];
  } catch (error) {
    console.error("getSigners error:", error);
    return [];
  }
}

// 📄 Buat dokumen baru
export async function createDocument(formData: FormData): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/documents.php`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      throw new Error("Gagal menyimpan dokumen");
    }
    return await res.json();
  } catch (error) {
    console.error("createDocument error:", error);
    throw error;
  }
}
