// File: src/components/DocumentList.tsx
import React, { useState } from "react";
import {
  Eye,
  Link as LinkIcon,
  ExternalLink,
  FileText,
  Trash2,
  Pencil,
  Download,
} from "lucide-react";
import { Document } from "../../types";
import { copyText } from "./helpers";

interface DocumentListProps {
  documents: Document[];
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
  onView: (doc: Document) => void;
  onEdit: (doc: Document) => void;
  API_BASE: string;
  isLoading?: boolean;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  setDocuments,
  onView,
  onEdit,
  API_BASE,
  isLoading = false,
}) => {
  const [search, setSearch] = useState("");

  const buildPublicResultURL = (nomor: string): string => {
    return `${window.location.origin}/result?nomor=${encodeURIComponent(nomor)}`;
  };

  const handleDeleteDocument = async (id: number): Promise<void> => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus dokumen ini?")) return;

    try {
      const res = await fetch(`${API_BASE}/delete_document.php`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const raw = await res.text();
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${raw}`);

      const result = JSON.parse(raw);
      if (result.success) {
        setDocuments((prev) => prev.filter((doc) => doc.id !== id));
      } else {
        alert("Gagal menghapus dokumen: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menghapus dokumen.");
    }
  };

  const filteredDocs = documents.filter(
    (doc) =>
      doc.nomor_dokumen.toLowerCase().includes(search.toLowerCase()) ||
      doc.judul.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="text-center text-white/70 text-base py-6">
        Memuat daftar dokumen...
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center text-white/70 text-base py-6">
        Belum ada dokumen yang diunggah.
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 shadow-2xl border border-white/20">
      {/* Input Pencarian */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Cari dokumen..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Grid Dokumen */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[32rem] overflow-y-auto pr-2">
        {filteredDocs.map((doc) => {
          const publicURL = buildPublicResultURL(doc.nomor_dokumen);
          const fileDownloadURL = doc.file_jpg
            ? `${API_BASE}/download.php?file=${encodeURIComponent(doc.file_jpg)}`
            : null;

          return (
            <div
              key={doc.id}
              className="flex flex-col items-center bg-white/5 rounded-xl border border-white/10 shadow hover:bg-white/10 transition p-4"
            >
              <FileText className="w-12 h-12 text-blue-300 mb-3" />
              <p className="text-sm font-semibold text-white text-center truncate w-full">
                {doc.judul}
              </p>
              <p className="text-xs text-gray-300 text-center truncate w-full">
                {doc.nomor_dokumen}
              </p>

              <div className="flex gap-2 mt-3 flex-wrap justify-center">
                <button
                  onClick={() => onView(doc)}
                  className="p-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
                  title="Lihat"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onEdit(doc)}
                  className="p-2 rounded bg-yellow-600 hover:bg-yellow-700 text-white"
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => copyText(publicURL)}
                  className="p-2 rounded bg-slate-600 hover:bg-slate-700 text-white"
                  title="Copy link"
                >
                  <LinkIcon className="w-4 h-4" />
                </button>
                <a
                  href={publicURL}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white"
                  title="Buka"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                {/* ✅ Tombol Download lewat download.php */}
                {fileDownloadURL && (
                  <a
                    href={fileDownloadURL}
                    className="p-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white"
                    title={`Download ${doc.judul}`}
                  >
                    <Download className="w-4 h-4" />
                  </a>
                )}
                <button
                  onClick={() => handleDeleteDocument(doc.id)}
                  className="p-2 rounded bg-red-600 hover:bg-red-700 text-white"
                  title="Hapus"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
