import React, { useState, useEffect } from "react";
import { UserPlus, Upload, Save, X, Eye, RefreshCw } from "lucide-react";
import { Signer, Document, DocumentFile } from "../../types";
import { SearchableDropdown } from "../SearchableDropdown";
import { MAX_FILE_MB, ALLOWED_TYPES, humanSize, getFileType } from "./helpers";
import { DocumentViewer } from "./DocumentViewer";
import { addDocumentToLocalStorage } from "../../utils/mockData";

interface DocumentFormProps {
  allSigners: Signer[];
  setAllSigners: React.Dispatch<React.SetStateAction<Signer[]>>;
  documents: Document[];
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
  API_BASE: string;
  onAddSigner: () => void;
  selectedSigners: Signer[];
  setSelectedSigners: React.Dispatch<React.SetStateAction<Signer[]>>;
  editingDocument?: Document | null;
  onCancelEdit?: () => void;
}

export const DocumentForm: React.FC<DocumentFormProps> = ({
  allSigners,
  setDocuments,
  API_BASE,
  onAddSigner,
  selectedSigners,
  setSelectedSigners,
  editingDocument,
  onCancelEdit,
}) => {
  const [formData, setFormData] = useState({ nomor_dokumen: "", judul: "" });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<DocumentFile[]>([]);
  const [showViewer, setShowViewer] = useState(false);
  const [lastUploadedDoc, setLastUploadedDoc] = useState<Document | null>(null);

  // Reset form when editing document changes
  useEffect(() => {
    if (editingDocument) {
      setFormData({
        nomor_dokumen: editingDocument.nomor_dokumen,
        judul: editingDocument.judul
      });
      setSelectedSigners(editingDocument.signers || []);
      setSelectedFiles([]);
      setUploadedFiles(editingDocument.files || []);
    } else {
      setFormData({ nomor_dokumen: "", judul: "" });
      setSelectedSigners([]);
      setSelectedFiles([]);
      setUploadedFiles([]);
    }
  }, [editingDocument, setSelectedSigners]);

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
        alert(`${file.name} tidak valid. Hanya JPG/PNG/PDF/DOCX yang diperbolehkan.`);
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
      
      // Add signers
      selectedSigners.forEach(s => form.append("signers[]", String(s.id)));

      // Add files
      selectedFiles.forEach(file => {
        form.append("files[]", file);
      });

      // If editing, add document ID
      if (editingDocument) {
        form.append("id", String(editingDocument.id));
      }

      const endpoint = editingDocument ? 'update_document.php' : 'documents.php';
      const res = await fetch(`${API_BASE}/${endpoint}`, { 
        method: "POST", 
        body: form 
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();

      if (result.success && result.data) {
        const uploadedFilesData: DocumentFile[] = (result.data.files || []).map((f: any, idx: number) => ({
          id: idx,
          document_id: result.data.id,
          file_name: f.file_name || f.stored_name,
          file_path: f.file_path || f.stored_name,
          file_type: getFileType(f.file_name || f.stored_name),
        }));

        const docData: Document = {
          id: Number(result.data.id),
          nomor_dokumen: String(result.data.nomor_dokumen ?? formData.nomor_dokumen),
          judul: String(result.data.judul ?? formData.judul),
          file_jpg: String(result.data.file_jpg ?? uploadedFilesData[0]?.file_path ?? ""),
          created_at: editingDocument?.created_at || new Date().toISOString().split("T")[0],
          signers: selectedSigners,
          signer_names: selectedSigners.map((s: any) =>
            s.jabatan ? `${s.nama} (${s.jabatan})` : s.nama
          ),
          files: uploadedFilesData.length > 0 ? uploadedFilesData : (editingDocument?.files || []),
        };

        if (editingDocument) {
          // Update existing document
          setDocuments(prev => prev.map(doc => 
            doc.id === editingDocument.id ? docData : doc
          ));
          alert("Dokumen berhasil diperbarui!");
          if (onCancelEdit) onCancelEdit();
        } else {
          // Add new document
          setDocuments(prev => [docData, ...prev]);
          setUploadedFiles(uploadedFilesData);
          setLastUploadedDoc(docData);
          
          // Save to localStorage
          addDocumentToLocalStorage(docData);
          
          alert(`Dokumen berhasil disimpan dengan ${uploadedFilesData.length} file!`);
        }

        // Reset form if not editing
        if (!editingDocument) {
          setFormData({ nomor_dokumen: "", judul: "" });
          setSelectedSigners([]);
          setSelectedFiles([]);
        }
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

  const handleCancel = () => {
    if (onCancelEdit) {
      onCancelEdit();
    }
    setFormData({ nomor_dokumen: "", judul: "" });
    setSelectedSigners([]);
    setSelectedFiles([]);
    setUploadedFiles([]);
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">
          {editingDocument ? 'Edit Dokumen' : 'Upload Dokumen Baru'}
        </h2>
        {editingDocument && (
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
          >
            <X className="w-4 h-4" />
            Batal Edit
          </button>
        )}
      </div>

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
            {editingDocument ? 'Upload File Baru (Opsional)' : 'Upload Lampiran (Bisa lebih dari satu)'}
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
              accept="image/*,application/pdf,.doc,.docx"
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
                Format: JPG, PNG, PDF, DOCX (Maks. {MAX_FILE_MB}MB per file)
              </p>
            </div>
          </div>

          {selectedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-white font-medium">File Baru:</h4>
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

          {/* Show existing files when editing */}
          {editingDocument && uploadedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-white font-medium">File Saat Ini:</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {uploadedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="bg-white/10 rounded-lg p-3 border border-white/10 hover:bg-white/20 transition cursor-pointer"
                    onClick={() => setShowViewer(true)}
                  >
                    <div className="text-2xl mb-2 text-center">
                      {getFileType(file.file_name) === 'pdf' && '📄'}
                      {getFileType(file.file_name) === 'image' && '🖼️'}
                      {getFileType(file.file_name) === 'docx' && '📝'}
                    </div>
                    <p className="text-white text-xs text-center truncate">{file.file_name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 bg-red-700 hover:bg-red-800 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 text-lg disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-6 h-6 animate-spin" />
                {editingDocument ? 'Memperbarui...' : 'Menyimpan...'}
              </>
            ) : (
              <>
                <Save className="w-6 h-6" />
                {editingDocument ? 'Perbarui Surat' : 'Simpan Surat'}
              </>
            )}
          </button>
          
          {editingDocument && (
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-3"
            >
              <X className="w-6 h-6" />
              Batal
            </button>
          )}
        </div>
      </form>

      {/* Preview Dokumen yang Baru Diupload */}
      {!editingDocument && uploadedFiles.length > 0 && lastUploadedDoc && (
        <div className="mt-6 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold text-lg">Dokumen Berhasil Diupload</h3>
            <button
              onClick={() => setShowViewer(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
            >
              <Eye className="w-4 h-4" />
              Preview {uploadedFiles.length} File
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {uploadedFiles.map((file, idx) => (
              <div
                key={idx}
                className="bg-white/10 rounded-lg p-3 border border-white/10 hover:bg-white/20 transition cursor-pointer"
                onClick={() => setShowViewer(true)}
              >
                <div className="text-2xl mb-2 text-center">
                  {getFileType(file.file_name) === 'pdf' && '📄'}
                  {getFileType(file.file_name) === 'image' && '🖼️'}
                  {getFileType(file.file_name) === 'docx' && '📝'}
                </div>
                <p className="text-white text-xs text-center truncate">{file.file_name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {showViewer && uploadedFiles.length > 0 && (
        <DocumentViewer
          files={uploadedFiles}
          isOpen={showViewer}
          onClose={() => setShowViewer(false)}
          uploadsBase={API_BASE.replace(/\/api\/?$/i, '')}
          documentTitle={editingDocument?.judul || lastUploadedDoc?.judul}
          document={editingDocument || lastUploadedDoc || undefined}
          API_BASE={API_BASE}
        />
      )}
    </div>
  );
};