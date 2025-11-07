// File: src/pages/AdminPage.tsx
import React, { useEffect, useState, useMemo } from "react";
import {
  ArrowLeft,
  FilePlus,
  FileText,
  Users,
  UserPlus,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";
import { Signer, Document } from "../types";
import { DocumentForm } from "../components/admin/DocumentForm";
import { DocumentList } from "../components/admin/DocumentList";
import { DocumentModal } from "../components/admin/DocumentModal";
import { DocumentEditModal } from "../components/admin/DocumentEditModal";
import { AddSignerForm } from "../components/AddSignerForm";
import { SignerList } from "../components/admin/SignerList";
import { initMockData, getDocumentsFromLocalStorage } from "../utils/mockData";

interface AdminPageProps {
  signers: Signer[];
  onBack: () => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ signers, onBack }) => {
  const [allSigners, setAllSigners] = useState<Signer[]>(signers);
  useEffect(() => setAllSigners(signers), [signers]);

  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);

  const [isAddSignerOpen, setIsAddSignerOpen] = useState(false);
  const [selectedSigners, setSelectedSigners] = useState<Signer[]>([]);

  const [activeMenu, setActiveMenu] = useState<
    "dashboard" | "upload" | "documents" | "signers"
  >("dashboard");

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const API_BASE = useMemo(() => {
    const raw =
      (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ||
      "/backend/api";
    return raw.replace(/\/+$/, "");
  }, []);
  const UPLOADS_BASE = useMemo(
    () => API_BASE.replace(/\/api\/?$/i, ""),
    [API_BASE]
  );

  // ====== helper untuk mapping foto_url ======
  const mapSigners = (items: Signer[]): Signer[] =>
    items.map((s) => ({
      ...s,
      foto_url: s.photo ? `${UPLOADS_BASE}/${s.photo}` : undefined,
    }));

  // ====== Load documents ======
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        initMockData();
        const localDocs = getDocumentsFromLocalStorage();

        const res = await fetch(`${API_BASE}/get_documents.php`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          const mappedDocs: Document[] = data.data.map((doc: Document) => ({
            ...doc,
            signers: mapSigners(doc.signers || []),
          }));
          const combined = [...mappedDocs, ...localDocs.filter(
            local => !mappedDocs.some(api => api.id === local.id)
          )];
          setDocuments(combined);
        } else {
          setDocuments(localDocs);
        }
      } catch (error) {
        console.error("Gagal load dokumen:", error);
        const localDocs = getDocumentsFromLocalStorage();
        setDocuments(localDocs);
      } finally {
        setIsLoadingDocuments(false);
      }
    };
    fetchDocuments();
  }, [API_BASE]);

  // ====== Callback setelah AddSignerForm sukses ======
  const handleSignerCreated = (newSigner: Signer) => {
    const mapped = {
      ...newSigner,
      foto_url: newSigner.photo ? `${UPLOADS_BASE}/${newSigner.photo}` : undefined,
    };
    setAllSigners((prev) => [...prev, mapped]);
    setSelectedSigners((prev) => [...prev, mapped]);
  };

  // ====== Callback setelah edit dokumen sukses ======
  const handleDocumentUpdated = (updated: Document) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === updated.id
          ? { ...updated, signers: mapSigners(updated.signers || []) }
          : doc
      )
    );
  };

  // ====== Sidebar Content ======
  const SidebarContent = () => (
    <>
      <h2 className="text-white text-2xl font-bold mb-8">Ruang Admin</h2>
      <nav className="flex-1 space-y-3">
        {[
          { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
          { key: "upload", label: "Upload Dokumen", icon: FilePlus },
          { key: "documents", label: "Daftar Dokumen", icon: FileText },
          { key: "signers", label: "Penandatangan", icon: Users },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => {
              setActiveMenu(item.key as any);
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${activeMenu === item.key
                ? "bg-white/20 text-white font-semibold"
                : "text-white/70 hover:bg-white/10"
              }`}
          >
            <item.icon className="w-5 h-5" /> {item.label}
          </button>
        ))}

        <button
          onClick={() => {
            setIsAddSignerOpen(true);
            setIsSidebarOpen(false);
          }}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg bg-emerald-500/80 hover:bg-emerald-600 text-white transition"
        >
          <UserPlus className="w-5 h-5" /> Tambah Penandatangan
        </button>
      </nav>

      <button
        onClick={() => {
          onBack();
          setIsSidebarOpen(false);
        }}
        className="mt-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition"
      >
        <ArrowLeft className="w-5 h-5" /> Kembali
      </button>
    </>
  );

  const pageTitles: Record<typeof activeMenu, string> = {
    dashboard: "Dashboard",
    upload: "Upload Dokumen",
    documents: "Daftar Dokumen",
    signers: "Daftar Penandatangan",
  };

  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSidebarOpen) setIsSidebarOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isSidebarOpen]);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-indigo-500 via-blue-500 to-sky-400 relative">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-64 bg-white/10 backdrop-blur-xl border-r border-white/20 p-6 flex-col">
        <SidebarContent />
      </aside>

      {/* Sidebar Mobile dengan animasi slide */}
      {/* parent wrapper tetap ada, tapi non-interaktif saat tertutup */}
      <div
        className={`fixed inset-0 md:hidden z-40 ${isSidebarOpen ? "" : "pointer-events-none"}`}
      >
        {/* Overlay (di bawah sidebar) */}
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 z-40 ${isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
          onClick={() => setIsSidebarOpen(false)}
        />

        {/* Sidebar (di atas overlay) */}
        <aside
          className={`absolute left-0 top-0 h-full w-64 bg-white/10 backdrop-blur-xl border-r border-white/20 p-6 flex flex-col transform transition-transform duration-300 z-50 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          aria-hidden={!isSidebarOpen}
        >
          {/* Tombol X di dalam sidebar */}
          <button
            type="button"
            className="absolute top-4 right-4 p-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition z-60"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Tutup sidebar"
          >
            <X className="w-6 h-6" />
          </button>

          <SidebarContent />
        </aside>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto space-y-6">
        {/* Header selalu tampil */}
        <div className="flex items-center gap-4 mb-6 relative z-30">
          {/* Tombol Hamburger (mobile only) → Hilang saat sidebar terbuka */}
          {!isSidebarOpen && (
            <button
              type="button"
              className="md:hidden p-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Buka sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}

          {/* Judul Halaman → ikut hilang kalau sidebar terbuka */}
          {!isSidebarOpen && (
            <h1 className="text-white text-2xl md:text-3xl font-bold">
              {pageTitles[activeMenu]}
            </h1>
          )}
        </div>


        {/* Dashboard */}
        <div className={activeMenu === "dashboard" ? "block" : "hidden"}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Jumlah Dokumen */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 flex items-center gap-4">
              <FileText className="w-10 h-10 text-white/80" />
              <div>
                <p className="text-white/70 text-sm">Jumlah Dokumen</p>
                <p className="text-white text-2xl font-bold">{documents.length}</p>
              </div>
            </div>

            {/* Jumlah Penandatangan */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 flex items-center gap-4">
              <Users className="w-10 h-10 text-white/80" />
              <div>
                <p className="text-white/70 text-sm">Jumlah Penandatangan</p>
                <p className="text-white text-2xl font-bold">{allSigners.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Dokumen */}
        <div
          className={`bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-4 sm:p-6 ${activeMenu === "upload" ? "block" : "hidden"
            }`}
        >
          <DocumentForm
            allSigners={allSigners}
            setAllSigners={setAllSigners}
            documents={documents}
            setDocuments={setDocuments}
            API_BASE={API_BASE}
            onAddSigner={() => setIsAddSignerOpen(true)}
            selectedSigners={selectedSigners}
            setSelectedSigners={setSelectedSigners}
          />
        </div>

        {/* Daftar Dokumen */}
        <div
          className={`bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-4 sm:p-6 ${activeMenu === "documents" ? "block" : "hidden"
            }`}
        >
          <DocumentList
            documents={documents}
            setDocuments={setDocuments}
            onView={(doc) => {
              setSelectedDocument(doc);
              setIsModalOpen(true);
            }}
            onEdit={(doc) => {
              setEditingDocument(doc);
              setIsEditOpen(true);
            }}
            API_BASE={API_BASE}
            isLoading={isLoadingDocuments}
          />
        </div>

        {/* Daftar Penandatangan */}
        <div
          className={`bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-4 sm:p-6 ${activeMenu === "signers" ? "block" : "hidden"
            }`}
        >
          <SignerList signers={allSigners} setSigners={setAllSigners} />
        </div>
      </main>

      {/* Modal Pratinjau Dokumen */}
      {selectedDocument && (
        <DocumentModal
          document={selectedDocument}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          uploadsBase={UPLOADS_BASE}
        />
      )}

      {/* Modal Edit Dokumen */}
      {editingDocument && (
        <DocumentEditModal
          document={editingDocument}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onUpdated={handleDocumentUpdated}
          API_BASE={API_BASE}
          allSigners={allSigners}
        />
      )}

      {/* Modal Tambah Penandatangan */}
      <AddSignerForm
        isOpen={isAddSignerOpen}
        onClose={() => setIsAddSignerOpen(false)}
        onCreated={handleSignerCreated}
      />
    </div>
  );
};

export default AdminPage;
