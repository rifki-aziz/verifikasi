import React, { useState } from "react";
import { UserPlus, Upload, Save, X } from "lucide-react";
import { Signer, Document } from "../../types";
import { SearchableDropdown } from "../SearchableDropdown";
import { MAX_FILE_MB, ALLOWED_TYPES, humanSize } from "./helpers";

interface DocumentFormProps {
  allSigners: Signer[];
  setAllSigners: React.Dispatch<React.SetStateAction<Signer[]>>;
  documents: Document[];
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
  API_BASE: string;
  onAddSigner: () => void;
  selectedSigners: Signer[];
  setSelectedSigners: React.Dispatch<React.SetStateAction<Signer[]>>;
}

export const DocumentForm: React.FC<DocumentFormProps> = ({
  allSigners,
  setDocuments,
  API_BASE,
  onAddSigner,
  selectedSigners,
  setSelectedSigners,
}) => {
  const [formData, setFormData] = useState({ nomor_dokumen: "", judul: "" });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignerToggle = (signer: Signer) => {
    setSelectedSigners(prev => {
      const isSelected = prev.some(s => s.id === signer.id);
      return isSelected ? prev.filter(s => s.id !== signer.id) : [...prev, signer];
    });
  };

  const handleFilesSelect = (files: FileList) => {
    const validFiles: File[] = [];
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        alert(`${file.name} tidak valid. Hanya JPG/PNG/PDF yang diperbolehkan.`);
        continue;
      }
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        alert(`${file.name} melebihi batas ${MAX_FILE_MB} MB.`);
        continue;
      }
      validFiles.push(file);
    }
    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) handleFilesSelect(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nomor_dokumen || !formData.judul || selectedSigners.length === 0) {
      alert("Mohon lengkapi semua field yang diperlukan");
      return;
    }

    setIsSaving(true);
    try {
      const form = new FormData();
      form.append("nomor_dokumen", formData.nomor_dokumen.trim());
      form.append("judul", formData.judul.trim());
      selectedSigners.forEach(s => form.append("signers[]", String(s.id)));

      selectedFiles.forEach(file => {
        form.append("files[]", file);
      });

      const res = await fetch(`${API_BASE}/documents.php`, { method: "POST", body: form });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();

      if (result.success && result.data) {
        alert("Dokumen berhasil disimpan!");
        const newDoc: Document = {
          id: Number(result.data.id),
          nomor_dokumen: String(result.data.nomor_dokumen ?? formData.nomor_dokumen),
          judul: String(result.data.judul ?? formData.judul),
          file_jpg: String(result.data.file_path ?? ""),
          created_at: new Date().toISOString().split("T")[0],
          signers: selectedSigners,
          signer_names: selectedSigners.map((s: any) =>
            s.jabatan ? `${s.nama} (${s.jabatan})` : s.nama
          ),
        };
        setDocuments(prev => [newDoc, ...prev]);
        setFormData({ nomor_dokumen: "", judul: "" });
        setSelectedSigners([]);
        setSelectedFiles([]);
      } else {
        alert("Gagal menyimpan dokumen: " + (result.error ?? "Unknown error"));
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menyimpan dokumen.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nomor & Judul Dokumen */}
        <div>
          <label className="block text-white font-medium mb-2">Nomor Surat *</label>
          <input
            name="nomor_dokumen"
            value={formData.nomor_dokumen}
            onChange={handleInputChange}
            className="w-full p-3 rounded-lg border-2 border-transparent bg-white focus:ring-4 focus:ring-white/25 text-gray-700"
            placeholder="Contoh: DOC003/2024"
            required
          />
        </div>

        <div>
          <label className="block text-white font-medium mb-2">Judul Surat *</label>
          <textarea
            name="judul"
            value={formData.judul}
            onChange={handleInputChange}
            rows={3}
            placeholder="Contoh: Surat Undangan Rapat Koordinasi"
            className="w-full p-3 rounded-lg border-2 border-transparent bg-white focus:ring-4 focus:ring-white/25 text-gray-700 resize-none"
            required
          />
        </div>

        {/* Penandatangan */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-white font-medium">
              Penandatangan * ({selectedSigners.length} dipilih)
            </label>
            <button
              type="button"
              onClick={onAddSigner}
              className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold px-3 py-2 rounded-md border border-white/20"
            >
              <UserPlus size={16} />
              Tambah Penandatangan
            </button>
          </div>

          <SearchableDropdown
            signers={allSigners}
            selectedSigners={selectedSigners}
            onSignerToggle={handleSignerToggle}
            placeholder="Pilih penandatangan dokumen"
          />
        </div>

        {/* Upload Multiple Files */}
        <div>
          <label className="block text-white font-medium mb-2">
            Upload Lampiran (Bisa lebih dari satu)
          </label>
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
              dragOver
                ? "border-white bg-white/20"
                : "border-white/50 bg-white/10 hover:bg-white/20 hover:border-white"
            }`}
            onDragOver={e => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <input
              id="file-input"
              type="file"
              multiple
              accept="image/*,application/pdf"
              onChange={e => {
                if (e.target.files) handleFilesSelect(e.target.files);
              }}
              className="hidden"
            />
            <div className="space-y-2">
              <div className="w-16 h-16 mx-auto bg-white/20 rounded-lg flex items-center justify-center">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <p className="text-white font-medium">
                Klik atau drag & drop beberapa file di sini
              </p>
              <p className="text-white/70 text-sm">
                Format: JPG, PNG, PDF (Maks. {MAX_FILE_MB}MB per file)
              </p>
            </div>
          </div>

          {selectedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              {selectedFiles.map((file, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-white/20 text-white px-3 py-2 rounded-md border border-white/20"
                >
                  <span className="truncate">
                    {file.name} — {humanSize(file.size)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSaving}
          className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 text-lg"
        >
          {isSaving ? "Menyimpan..." : <>
            <Save className="w-6 h-6" />
            Simpan Surat
          </>}
        </button>
      </form>
    </div>
  );
};
