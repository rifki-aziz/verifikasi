import React, { useState } from "react";
import {
  Eye,
  Link as LinkIcon,
  ExternalLink,
  FileText,
  Trash2,
  Pencil,
  Download,
  Search,
} from "lucide-react";
import { Document, DocumentFile } from "../../types";
import { copyText } from "./helpers";
import { DocumentViewer } from "./DocumentViewer";

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
  const [viewerFiles, setViewerFiles] = useState<DocumentFile[]>([]);
  const [showViewer, setShowViewer] = useState(false);
  const [viewerTitle, setViewerTitle] = useState("");
  const [viewerDocument, setViewerDocument] = useState<Document | null>(null);

  const buildPublicResultURL = (nomor: string): string => {
    return `${window.location.origin}/result?nomor=${encodeURIComponent(nomor)}`;
  };

  const handleDeleteDocument = async (id: number): Promise<void> => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus dokumen ini?")) return;

    try {
      const res = await fetch(`${API_BASE}/delete_document.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const raw = await res.text();
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${raw}`);

      let result;
      try {
        result = JSON.parse(raw);
      } catch {
        throw new Error("Response bukan JSON: " + raw);
      }

      if (result.success) {
        setDocuments((prev) => prev.filter((doc) => doc.id !== id));
        alert("Dokumen berhasil dihapus");
      } else {
        alert("Gagal menghapus dokumen: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menghapus dokumen: " + (error as Error).message);
    }
  };

  const handleViewDocument = (doc: Document) => {
    if (doc.files && doc.files.length > 0) {
      setViewerFiles(doc.files);
      setViewerTitle(doc.judul);
      setViewerDocument(doc);
      setShowViewer(true);
    } else {
      onView(doc);
    }
  };

  const filteredDocs = documents.filter(
    (doc) =>
      doc.nomor_dokumen.toLowerCase().includes(search.toLowerCase()) ||
      doc.judul.toLowerCase().includes(search.toLowerCase()) ||
      (doc.signer_names && doc.signer_names.some(name => 
        name.toLowerCase().includes(search.toLowerCase())
      ))
  );

  if (isLoading) {
    return (
      <div className="text-center text-white/70 text-base py-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
        Memuat daftar dokumen...
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center text-white/70 text-base py-6">
        <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p>Belum ada dokumen yang diunggah.</p>
        <p className="text-sm mt-2">Gunakan form di atas untuk menambah dokumen baru.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 shadow-2xl border border-white/20">
      {/* Header dengan Search */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-lg">
          Daftar Dokumen ({filteredDocs.length})
        </h3>
        <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-white/70" />
          <input
            type="text"
            placeholder="Cari dokumen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-white placeholder-white/70 focus:outline-none w-48"
          />
        </div>
      </div>

      {filteredDocs.length === 0 ? (
        <div className="text-center text-white/70 py-6">
          <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Tidak ada dokumen yang cocok dengan pencarian "{search}"</p>
        </div>
      ) : (
        /* Grid Dokumen */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[32rem] overflow-y-auto pr-2">
          {filteredDocs.map((doc) => {
            const publicURL = buildPublicResultURL(doc.nomor_dokumen);
            const fileDownloadURL = doc.file_jpg
              ? `${API_BASE}/download.php?file=${encodeURIComponent(doc.file_jpg)}`
              : null;

            return (
              <div
                key={doc.id}
                className="flex flex-col bg-white/5 rounded-xl border border-white/10 shadow hover:bg-white/10 transition p-4"
              >
                {/* Document Icon & Info */}
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="w-10 h-10 text-blue-300 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {doc.judul}
                    </p>
                    <p className="text-xs text-gray-300 truncate">
                      {doc.nomor_dokumen}
                    </p>
                    <p className="text-xs text-gray-400">
                      {doc.created_at}
                    </p>
                  </div>
                </div>

                {/* Signers */}
                {doc.signer_names && doc.signer_names.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-400 mb-1">Penandatangan:</p>
                    <p className="text-xs text-white/80 line-clamp-2">
                      {Array.isArray(doc.signer_names) 
                        ? doc.signer_names.join(', ')
                        : doc.signer_names
                      }
                    </p>
                  </div>
                )}

                {/* Files Count */}
                {doc.files && doc.files.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-blue-300">
                      📎 {doc.files.length} file lampiran
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-1 mt-auto">
                  {/* Row 1 */}
                  <button
                    onClick={() => handleViewDocument(doc)}
                    className="p-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs flex items-center justify-center"
                    title="Lihat"
                  >
                    <Eye className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onEdit(doc)}
                    className="p-2 rounded bg-yellow-600 hover:bg-yellow-700 text-white text-xs flex items-center justify-center"
                    title="Edit"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="p-2 rounded bg-red-600 hover:bg-red-700 text-white text-xs flex items-center justify-center"
                    title="Hapus"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>

                  {/* Row 2 */}
                  <button
                    onClick={() => copyText(publicURL)}
                    className="p-2 rounded bg-slate-600 hover:bg-slate-700 text-white text-xs flex items-center justify-center"
                    title="Copy link"
                  >
                    <LinkIcon className="w-3 h-3" />
                  </button>
                  <a
                    href={publicURL}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs flex items-center justify-center"
                    title="Buka"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  {fileDownloadURL && (
                    <a
                      href={fileDownloadURL}
                      className="p-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-xs flex items-center justify-center"
                      title={`Download ${doc.judul}`}
                    >
                      <Download className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Document Viewer */}
      {showViewer && viewerFiles.length > 0 && (
        <DocumentViewer
          files={viewerFiles}
          isOpen={showViewer}
          onClose={() => {
            setShowViewer(false);
            setViewerDocument(null);
          }}
          uploadsBase={API_BASE.replace(/\/api\/?$/i, '')}
          documentTitle={viewerTitle}
          document={viewerDocument}
          onEdit={onEdit}
          onDelete={handleDeleteDocument}
          API_BASE={API_BASE}
        />
      )}
    </div>
  );
};