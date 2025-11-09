import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import Logo from '/logo2.svg';
import { AdminLoginPopup } from './AdminLoginPopup';

interface VerificationPageProps {
  showAdminLogin: boolean;
  onOpenAdminLogin: () => void;
  onCloseAdminLogin: () => void;
  onLoginSuccess: () => void;
}

export const VerificationPage = ({
  showAdminLogin,
  onOpenAdminLogin,
  onCloseAdminLogin,
  onLoginSuccess
}: VerificationPageProps) => {
  const [documentNumber, setDocumentNumber] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (documentNumber.trim()) {
      // Arahkan ke halaman result dengan query param
      navigate(`/result?nomor=${encodeURIComponent(documentNumber.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo sebagai tombol admin */}
        <div className="text-center mb-8">
          <button
            onClick={onOpenAdminLogin}
            className="inline-flex items-center justify-center w-24 h-24 bg-white/20 rounded-full backdrop-blur-sm mb-4 hover:bg-white/30 transition-all duration-200 hover:scale-105"
            title="Panel Admin"
          >
            <img src={Logo} alt="Logo" className="w-16 h-16" />
          </button>
          <h1 className="text-white text-2xl font-bold">Pondok Pesantren Lirboyo</h1>
          <p className="text-white/90 text-sm mt-1">Kota Kediri</p>
        </div>

        {/* Form Verifikasi */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/20">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Verifikasi Surat</h2>
            <p className="text-white/90 text-sm leading-relaxed">
              Masukkan nomor surat untuk memverifikasi keaslian dan status surat.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="docNumber" className="block text-white font-medium mb-2">
                Nomor surat
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  id="docNumber"
                  type="text"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder="Contoh: DOC001/2024"
                  className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-transparent bg-white focus:outline-none focus:ring-4 focus:ring-white/25 focus:border-white text-gray-700 placeholder-gray-400"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-white text-black font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
            >
              Cek Surat
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/70 text-xs">
              Sistem verifikasi surat resmi Pondok Pesantren Lirboyo Kediri
            </p>
          </div>
        </div>
      </div>

      {/* Popup login admin */}
      {showAdminLogin && (
        <AdminLoginPopup onLoginSuccess={onLoginSuccess} onClose={onCloseAdminLogin} />
      )}
    </div>
  );
};