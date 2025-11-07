import React, { useState } from "react";
import { X, Save } from "lucide-react";
import { Signer } from "../types";

interface AddSignerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (signer: Signer) => void; // callback saat sukses buat signer
}

export const AddSignerForm: React.FC<AddSignerFormProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [nama, setNama] = useState("");
  const [jabatan, setJabatan] = useState("");
  const [bio, setBio] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const API_BASE = import.meta.env.VITE_API_BASE_URL; // contoh: http://localhost/backend/api

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) {
      alert("Nama penandatangan wajib diisi.");
      return;
    }
    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append("nama", nama);
      formData.append("jabatan", jabatan);
      formData.append("bio", bio);

      if (photo) {
        formData.append("photo", photo); // ✅ konsisten dengan backend
      }

      const res = await fetch(`${API_BASE}/create_signer.php`, {
        method: "POST",
        body: formData,
      });

      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error("Respon bukan JSON:", text);
        alert("Respon server tidak valid.");
        return;
      }

      if (data.success && data.data?.id) {
        const newSigner: Signer = {
          id: Number(data.data.id),
          nama,
          jabatan,
          bio,
          photo: data.data.photo ?? null, // ✅ konsisten
        };
        onCreated(newSigner);

        // reset form
        setNama("");
        setJabatan("");
        setBio("");
        setPhoto(null);
        onClose();
      } else {
        alert(data.error || "Gagal menambah penandatangan.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-xl relative">
        <button
          className="absolute right-3 top-3 text-gray-500 hover:text-gray-800"
          onClick={onClose}
          aria-label="Tutup"
        >
          <X size={22} />
        </button>

        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4">Tambah Penandatangan</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nama *</label>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring"
                placeholder="Nama lengkap"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Jabatan (opsional)
              </label>
              <input
                type="text"
                value={jabatan}
                onChange={(e) => setJabatan(e.target.value)}
                className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring"
                placeholder="Contoh: Ketua, Sekretaris"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Bio (opsional)
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring"
                placeholder="Tulis bio atau deskripsi penandatangan"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Foto (opsional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setPhoto(e.target.files ? e.target.files[0] : null)
                }
                className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md"
            >
              <Save size={18} />
              {isSaving ? "Menyimpan..." : "Simpan"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
