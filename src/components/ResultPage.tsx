// File: src/components/ResultPage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, XCircle, Eye, ArrowLeft, X, Link as LinkIcon } from 'lucide-react';
import { Document, Signer } from '../types';
import Logo from '../asset/logo/logo.png';

interface ResultPageProps {
  document: Document | null;
  onBack: () => void;
}

function CopyLinkButton() {
  async function copy() {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      alert('Link disalin ke clipboard ✨');
    } catch {
      window.prompt('Salin link ini:', url);
    }
  }
  return (
    <button
      onClick={copy}
      className="bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-4 rounded-lg transition-all border border-white/20 inline-flex items-center gap-2"
      title="Copy link halaman ini"
    >
      <LinkIcon className="w-4 h-4" />
      Copy Link
    </button>
  );
}

export const ResultPage = ({ document, onBack }: ResultPageProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Kalau dokumen tidak ditemukan
  if (!document) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-400 via-red-500 to-red-600 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20 text-center animate-fadeIn">
            <XCircle className="w-16 h-16 text-white mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Surat Tidak Ditemukan</h2>
            <p className="text-white/90 mb-6 leading-relaxed">
              Nomor surat yang Anda masukkan tidak terdaftar dalam sistem. Periksa kembali nomor surat atau hubungi pihak pondok pesantren.
            </p>
            <button
              onClick={onBack}
              className="bg-white text-red-600 font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 transition-all duration-200 transform hover:scale-[1.02] shadow-lg inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PRIORITAS: pakai array signers dari API jika ada (klik-able by link /signer/:id)
  const signers: Signer[] = Array.isArray((document as any).signers)
    ? (document as any).signers
    : [];

  // Fallback: pakai string signer_names → link by name
  const signerNames = !signers.length && document.signer_names
    ? String(document.signer_names).split(',').map((name: string) => name.trim()).filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto">
        {/* Logo + Judul */}
        <div className="text-center mb-8 pt-8 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 rounded-full backdrop-blur-sm mb-4 mx-auto">
            <img src={Logo} alt="Logo Pesantren" className="w-16 h-16" />
          </div>
          <h1 className="text-white text-xl font-bold mb-1">Surat ini dikelola Oleh:</h1>
          <h2 className="text-white text-3xl font-bold mb-2">Sekretariat Pondok Pesantren Lirboyo Kota Kediri</h2>
        </div>

        {/* Informasi Dokumen */}
        <div className="space-y-4 mb-6">
          <div className="text-center">
            <h3 className="text-white font-medium text-sm uppercase tracking-wide mb-1">Nomor Surat</h3>
            <p className="text-white text-2xl font-bold">{document.nomor_dokumen}</p>
          </div>
          <div className="text-center">
            <p className="text-white text-xl font-semibold leading-tight">{document.judul}</p>
          </div>
        </div>

        {/* Valid Badge */}
        <div className="flex justify-center mb-6">
          <div className="w-full bg-green-500 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center gap-3 text-lg">
            <CheckCircle className="w-6 h-6" />
            VALID
          </div>
        </div>

        {/* Kartu Utama */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20 mb-6 animate-fadeIn">
          {/* Penandatangan */}
          <div className="mb-6">
            <h3 className="text-white font-semibold text-lg mb-4">Surat ini telah ditandatangani oleh:</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto animate-fadeIn">
              {signers.length > 0 ? (
                // link by ID
                signers.map((s) => (
                  <Link
                    key={s.id}
                    to={`/signer/${s.id}`}
                    className="block rounded-lg p-3 backdrop-blur-sm border border-white/10 bg-white/20 hover:bg-white/30 transition"
                    title="Lihat portfolio penandatangan"
                  >
                    <span className="text-white font-medium">
                      {s.nama}{s.jabatan ? ` — ${s.jabatan}` : ''}
                    </span>
                  </Link>
                ))
              ) : (
                // link by NAME (fallback)
                signerNames.length ? signerNames.map((name, i) => (
                  <Link
                    key={`${name}-${i}`}
                    to={`/signer/by-name/${encodeURIComponent(name)}`}
                    className="block rounded-lg p-3 backdrop-blur-sm border border-white/10 bg-white/20 hover:bg-white/30 transition"
                    title="Lihat portfolio penandatangan"
                  >
                    <span className="text-white font-medium">{name}</span>
                  </Link>
                )) : (
                  <div className="text-white/70">Tidak ada penandatangan yang terdaftar.</div>
                )
              )}
            </div>
          </div>

          {/* Lihat Surat */}
          <div className="flex justify-center mb-6">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-orange-500 text-white px-6 py-3 rounded-full font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-105"
            >
              <Eye className="w-6 h-6" />
              Lihat Surat
            </button>
          </div>
        </div>

        {/* Aksi bawah: Kembali + Copy Link */}
        <div className="text-center animate-fadeIn space-x-2">
          <button
            onClick={onBack}
            className="bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20 inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Verifikasi Surat Lain
          </button>

          <CopyLinkButton />
        </div>
      </div>

      {/* Modal Preview Dokumen */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[700px] max-h-[90vh] relative animate-scaleIn p-4 flex justify-center items-center">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-black"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="w-full max-h-[85vh] flex justify-center">
              <div className="aspect-[210/297] w-full max-w-[600px] bg-gray-50 rounded-xl overflow-hidden shadow flex items-center justify-center">
                {document.file_jpg ? (
                  <img
                    src={`http://localhost/backend/uploads/${document.file_jpg}`}
                    alt="Dokumen"
                    className="w-full h-full object-contain"
                  />

                ) : (
                  <div className="text-gray-500 text-center">
                    Tidak ada file untuk dokumen ini
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
