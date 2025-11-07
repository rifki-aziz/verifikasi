// File: src/pages/SignerProfile.tsx
import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getSignerById, getSignerByName } from '../services/signers';
import type { Signer } from '../types';

// BASE URL backend (ambil dari .env)
const API_BASE = (import.meta.env.VITE_API_BASE_URL?.trim() || "/backend/api").replace(/\/+$/, "");

// Tambahan field opsional kalau backend punya
type FullSigner = Signer & {
  foto_url?: string;
  bio?: string;
  links?: { label: string; url: string }[];
};

export function SignerProfile() {
  const { id, name } = useParams();
  const navigate = useNavigate();

  const [signer, setSigner] = useState<FullSigner | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [showImage, setShowImage] = useState(false);

  const humanName = useMemo(() => {
    try {
      return name ? decodeURIComponent(name) : "";
    } catch {
      return name || "";
    }
  }, [name]);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        let data: FullSigner | null = null;

        if (id && /^\d+$/.test(id)) {
          data = (await getSignerById(Number(id))) as FullSigner | null;
        } else if (humanName) {
          data = (await getSignerByName(humanName)) as FullSigner | null;
          if (!data) {
            // fallback minimal biar halaman tetap tampil
            data = { id: 0, nama: humanName, jabatan: "" };
          }
        } else {
          setErr("Parameter tidak valid.");
        }

        if (live) setSigner(data);
      } catch (e: any) {
        if (live) setErr(e?.message || "Gagal memuat data.");
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => {
      live = false;
    };
  }, [id, humanName]);

  const fotoSrc =
    signer?.foto_url
      ? `${API_BASE.replace(/\/api$/, "")}/${signer.foto_url.replace(/^\/+/, "")}`
      : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header actions */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-4 rounded-lg border border-white/20 inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali
          </button>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20">
          {loading ? (
            <div className="text-white/90">Memuat portfolio…</div>
          ) : err ? (
            <div className="text-red-100">{err}</div>
          ) : !signer ? (
            <div className="text-white/90">Data penandatangan tidak ditemukan.</div>
          ) : (
            <>
              {/* Header profil */}
              <div className="flex items-center gap-4 mb-6">
                {fotoSrc ? (
                  <>
                    <img
                      src={fotoSrc}
                      alt={signer.nama}
                      onClick={() => setShowImage(true)}
                      className="w-24 h-24 rounded-lg object-cover ring-2 ring-white/30 cursor-pointer"
                    />

                    {showImage && (
                      <div
                        onClick={() => setShowImage(false)}
                        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
                      >
                        <img
                          src={fotoSrc}
                          alt={signer.nama}
                          className="max-w-[90%] max-h-[90%] rounded-lg shadow-2xl"
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-white/20 ring-2 ring-white/30" />
                )}
                <div>
                  <h1 className="text-3xl font-bold text-white">{signer.nama}</h1>
                  {!!signer.jabatan && <p className="text-white/80">{signer.jabatan}</p>}
                </div>
              </div>

              {!!signer.bio && (
                <p className="text-white/90 leading-relaxed mb-6">{signer.bio}</p>
              )}

              {Array.isArray(signer.links) && signer.links.length > 0 && (
                <div className="mt-4">
                  <p className="text-white font-semibold mb-2">Tautan:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {signer.links.map((l, i) => (
                      <li key={i}>
                        <a
                          href={l.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-white underline underline-offset-4"
                        >
                          {l.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
