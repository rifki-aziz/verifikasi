import { API_BASE_URL } from "../config";
import { Document, Signer } from "../types";
import { getMockDocumentByNumber, mockSigners } from "../utils/mockData";

// 🔍 Verifikasi dokumen berdasarkan nomor
export async function verifyDocument(nomor_dokumen: string): Promise<Document | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/verify.php?nomor_dokumen=${encodeURIComponent(nomor_dokumen)}`);
    
    if (!res.ok) {
      // Fallback to mock data if API fails
      console.warn('API failed, using mock data');
      return getMockDocumentByNumber(nomor_dokumen);
    }
    
    const data = await res.json();
    
    if (data.success && data.data) {
      return data.data as Document;
    }
    
    // Fallback to mock data if document not found in API
    return getMockDocumentByNumber(nomor_dokumen);
    
  } catch (error) {
    console.error("verifyDocument error:", error);
    // Fallback to mock data on network error
    return getMockDocumentByNumber(nomor_dokumen);
  }
}

// 👥 Ambil semua penandatangan
export async function getSigners(): Promise<Signer[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/signers.php`);
    
    if (!res.ok) {
      console.warn('Signers API failed, using mock data');
      return mockSigners;
    }

    const data = await res.json();

    if (data.success && Array.isArray(data.data)) {
      return data.data as Signer[];
    }

    return mockSigners;
  } catch (error) {
    console.error("getSigners error:", error);
    return mockSigners;
  }
}

// 📄 Ambil semua dokumen
export async function getDocuments(): Promise<Document[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/get_documents.php`);
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    
    const data = await res.json();
    
    if (data.success && Array.isArray(data.data)) {
      return data.data as Document[];
    }
    
    return [];
  } catch (error) {
    console.error("getDocuments error:", error);
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
      throw new Error(`HTTP ${res.status}`);
    }
    
    const result = await res.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to create document');
    }
    
    return result;
  } catch (error) {
    console.error("createDocument error:", error);
    throw error;
  }
}

// 📄 Update dokumen
export async function updateDocument(formData: FormData): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/update_document.php`, {
      method: "POST",
      body: formData,
    });
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    
    const result = await res.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to update document');
    }
    
    return result;
  } catch (error) {
    console.error("updateDocument error:", error);
    throw error;
  }
}

// 🗑️ Hapus dokumen
export async function deleteDocument(documentId: number): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/delete_document.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: documentId }),
    });
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    
    const result = await res.json();
    return result.success === true;
  } catch (error) {
    console.error("deleteDocument error:", error);
    return false;
  }
}

// 👤 Buat penandatangan baru
export async function createSigner(formData: FormData): Promise<Signer | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/create_signer.php`, {
      method: "POST",
      body: formData,
    });
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    
    const result = await res.json();
    
    if (result.success && result.data) {
      return result.data as Signer;
    }
    
    return null;
  } catch (error) {
    console.error("createSigner error:", error);
    return null;
  }
}

// 👤 Update penandatangan
export async function updateSigner(formData: FormData): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/update_signer.php`, {
      method: "POST",
      body: formData,
    });
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    
    const result = await res.json();
    return result.success === true;
  } catch (error) {
    console.error("updateSigner error:", error);
    return false;
  }
}

// 🗑️ Hapus penandatangan
export async function deleteSigner(signerId: number): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/delete_signer.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: signerId }),
    });
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    
    const result = await res.json();
    return result.success === true;
  } catch (error) {
    console.error("deleteSigner error:", error);
    return false;
  }
}