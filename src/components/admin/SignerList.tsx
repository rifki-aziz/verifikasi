import React, { useState, useMemo } from "react";
import { Pencil, Trash2, Save, X, Link as LinkIcon, Search } from "lucide-react";
import { Signer } from "../../types";

interface SignerListProps {
  signers: Signer[];
  setSigners: React.Dispatch<React.SetStateAction<Signer[]>>;
}

// Tombol salin link
function CopyLinkBtn({ id }: { id: number }) {
  const handleCopy = async () => {
    const link = `${window.location.origin}/signer/${id}`;
    try {
      await navigator.clipboard.writeText(link);
      alert("Link disalin ✨");
    } catch {
      prompt("Salin link ini:", link);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="p-2 rounded bg-white/20 hover:bg-white/30 text-white flex items-center gap-1 text-sm"
      title="Salin tautan publik"
    >
      <LinkIcon className="w-4 h-4" /> Salin Link
    </button>
  );
}

export const SignerList: React.FC<SignerListProps> = ({ signers, setSigners }) => {
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editNama, setEditNama] = useState("");
  const [editJabatan, setEditJabatan] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editFoto, setEditFoto] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const UPLOADS_BASE = useMemo(
    () => (API_BASE ? API_BASE.replace(/\/api\/?$/i, "") : ""),
    [API_BASE]
  );

  // Filter signer berdasarkan keyword pencarian (nama/jabatan/bio)
  const filteredSigners = useMemo(() => {
    const keyword = search.toLowerCase().trim();
    if (!keyword) return signers;
    return signers.filter(
      (s) =>
        s.nama?.toLowerCase().includes(keyword) ||
        s.jabatan?.toLowerCase().includes(keyword) ||
        s.bio?.toLowerCase().includes(keyword)
    );
  }, [signers, search]);

  const handleEdit = (signer: Signer) => {
    setEditingId(signer.id);
    setEditNama(signer.nama ?? "");
    setEditJabatan(signer.jabatan ?? "");
    setEditBio(signer.bio ?? "");
    setEditFoto(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditNama("");
    setEditJabatan("");
    setEditBio("");
    setEditFoto(null);
  };

  const handleSave = async () => {
    if (editingId === null || !editNama.trim()) return;

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("id", String(editingId));
      formData.append("nama", editNama.trim());
      formData.append("jabatan", editJabatan.trim());
      formData.append("bio", editBio.trim());
      if (editFoto) formData.append("foto", editFoto);

      const res = await fetch(`${API_BASE}/update_signer.php`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setSigners((prev) =>
          prev.map((s) =>
            s.id === editingId
              ? {
                  ...s,
                  nama: editNama,
                  jabatan: editJabatan,
                  bio: editBio,
                  photo: data.photo ?? s.photo,
                  foto_url: data.photo
                    ? `${UPLOADS_BASE}/${data.photo}`
                    : s.foto_url,
                }
              : s
          )
        );
        handleCancel();
      } else {
        alert(data.error || "Gagal update signer.");
      }
    } catch (err) {
      console.error(err);
      alert("Kesalahan jaringan.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin hapus penandatangan ini?")) return;

    setIsDeleting(id);
    try {
      const res = await fetch(`${API_BASE}/delete_signer.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();
      if (data.success) {
        setSigners((prev) => prev.filter((s) => s.id !== id));
      } else {
        alert(data.error || "Gagal hapus signer.");
      }
    } catch (err) {
      console.error(err);
      alert("Kesalahan jaringan.");
    } finally {
      setIsDeleting(null);
    }
  };

  if (signers.length === 0) {
    return (
      <div className="text-center text-white/70 text-base py-6">
        Belum ada penandatangan.
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 shadow-2xl border border-white/20">
      {/* Input Pencarian */}
      <div className="flex items-center gap-2 mb-4">
        <Search className="w-5 h-5 text-white/70" />
        <input
          type="text"
          placeholder="Cari penandatangan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>

      {/* Grid daftar signer */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[32rem] overflow-y-auto pr-2">
        {filteredSigners.length > 0 ? (
          filteredSigners.map((signer) => {
            const resolvedFoto = signer.foto_url
              ? signer.foto_url.startsWith("http")
                ? signer.foto_url
                : `${UPLOADS_BASE}/${signer.foto_url.replace(/^\/+/, "")}`
              : signer.photo
              ? `${UPLOADS_BASE}/${signer.photo}`
              : null;

            return (
              <div
                key={signer.id}
                className="flex flex-col items-center bg-white/5 rounded-xl border border-white/10 shadow hover:bg-white/10 transition p-4"
              >
                {resolvedFoto ? (
                  <img
                    src={resolvedFoto}
                    alt={signer.nama || "No Name"}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover border border-white/30 shadow-md mb-3"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-gray-500 flex items-center justify-center text-white font-bold shadow-md mb-3">
                    {signer.nama ? signer.nama.charAt(0).toUpperCase() : "?"}
                  </div>
                )}

                {editingId === signer.id ? (
                  <div className="flex flex-col gap-2 w-full">
                    <input
                      type="text"
                      value={editNama}
                      onChange={(e) => setEditNama(e.target.value)}
                      placeholder="Nama"
                      className="px-2 py-1 rounded border border-gray-300 text-black"
                    />
                    <input
                      type="text"
                      value={editJabatan}
                      onChange={(e) => setEditJabatan(e.target.value)}
                      placeholder="Jabatan"
                      className="px-2 py-1 rounded border border-gray-300 text-black"
                    />
                    <textarea
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      placeholder="Bio"
                      className="px-2 py-1 rounded border border-gray-300 text-black"
                      rows={2}
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setEditFoto(e.target.files ? e.target.files[0] : null)
                      }
                      className="px-2 py-1 rounded border border-gray-300 text-black"
                    />
                  </div>
                ) : (
                  <>
                    <p className="font-semibold text-white text-center truncate w-full">
                      {signer.nama || "Tanpa nama"}
                    </p>
                    <p className="text-sm text-gray-200 text-center truncate w-full">
                      {signer.jabatan || "Tanpa jabatan"}
                    </p>
                    {signer.bio ? (
                      <p className="text-xs text-gray-300 mt-1 text-center line-clamp-3">
                        {signer.bio}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400 italic mt-1 text-center">
                        Belum ada bio
                      </p>
                    )}
                  </>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 mt-3 flex-wrap justify-center">
                  {editingId === signer.id ? (
                    <>
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="p-2 rounded bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                        title="Simpan"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleCancel}
                        className="p-2 rounded bg-gray-600 hover:bg-gray-700 text-white"
                        title="Batal"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(signer)}
                        className="p-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(signer.id)}
                        disabled={isDeleting === signer.id}
                        className="p-2 rounded bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <CopyLinkBtn id={signer.id} />
                    </>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center text-white/70 py-6">
            Tidak ada penandatangan yang cocok.
          </div>
        )}
      </div>
    </div>
  );
};
