import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';

import { VerificationPage } from './components/VerificationPage';
import { ResultPage } from './components/ResultPage';
import AdminPage from "./pages/AdminPage";
import { AdminLoginPopup } from './components/AdminLoginPopup';
import { Document, Signer } from './types';
import { SignerProfile } from './pages/SignerProfile'; // ✅ tambahin ini
import { verifyDocument, getSigners, getDocuments } from './services/api';
import { initMockData, getDocumentsFromLocalStorage } from './utils/mockData';

// ---------- Helpers ----------
function useQueryParam(name: string) {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  return params.get(name);
}

// Halaman hasil verifikasi (route-driven)
function ResultRoute({ documents }: { documents: Document[] }) {
  const navigate = useNavigate();
  const nomor = useQueryParam('nomor') || '';
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (nomor) {
      setLoading(true);
      verifyDocument(nomor).then(doc => {
        setDocument(doc);
        setLoading(false);
      });
    }
  }, [nomor]);

  function handleBack() {
    navigate('/');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 flex items-center justify-center">
        <div className="text-white text-xl">Memverifikasi dokumen...</div>
      </div>
    );
  }

  return <ResultPage document={document} onBack={handleBack} />;
}

function AppInner() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [signers, setSigners] = useState<Signer[]>([]);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  // ✅ status login disimpan di localStorage agar tidak hilang setelah refresh
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(
    localStorage.getItem("isAdminLoggedIn") === "true"
  );

  const [isLoading, setIsLoading] = useState(true);

  const API_BASE = useMemo(() => {
    const raw = (import.meta.env.VITE_API_BASE_URL || '/backend/api').trim().replace(/\/+$/, '');
    const isLocalHost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';

    if (isLocalHost && /^https:\/\//i.test(raw)) {
      return raw.replace(/^https:/i, 'http:');
    }
    if (!/^https?:\/\//i.test(raw)) {
      const origin = isLocalHost
        ? window.location.origin.replace(/^https:/i, 'http:')
        : window.location.origin;
      return `${origin}${raw.startsWith('/') ? '' : '/'}${raw}`;
    }
    return raw;
  }, []);

  useEffect(() => {
    (async () => {
      try {
        // Initialize mock data first
        initMockData();
        
        // Try to get data from API, fallback to localStorage/mock
        const [apiDocs, apiSigners] = await Promise.all([
          getDocuments(),
          getSigners(),
        ]);
        
        // Combine API data with localStorage data
        const localDocs = getDocumentsFromLocalStorage();
        const combinedDocs = [...apiDocs, ...localDocs.filter(
          local => !apiDocs.some(api => api.id === local.id)
        )];
        
        setDocuments(combinedDocs);
        setSigners(apiSigners);
      } catch (e) {
        console.error('Gagal memuat data:', e);
        // Fallback to mock data
        const localDocs = getDocumentsFromLocalStorage();
        setDocuments(localDocs);
        setSigners([]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [API_BASE]);

  // ✅ simpan login ke localStorage
  const handleLoginSuccess = () => {
    localStorage.setItem("isAdminLoggedIn", "true");
    setShowAdminLogin(false);
    setIsAdminLoggedIn(true);
  };

  // ✅ hapus login dari localStorage saat logout
  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    setIsAdminLoggedIn(false);
  };

  const handleCloseAdminLogin = () => setShowAdminLogin(false);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen text-lg text-white">
        <span className="mr-2">Memuat data...</span>
        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0
             c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    );
  }

  if (isAdminLoggedIn) {
    return <AdminPage signers={signers} onBack={handleLogout} />;
  }

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <div className="relative">
              <VerificationPage
                onOpenAdminLogin={() => setShowAdminLogin(true)}
                showAdminLogin={showAdminLogin}
                onCloseAdminLogin={handleCloseAdminLogin}
                onLoginSuccess={handleLoginSuccess}
              />
              {showAdminLogin && (
                <AdminLoginPopup onLoginSuccess={handleLoginSuccess} onClose={handleCloseAdminLogin} />
              )}
            </div>
          }
        />

        <Route path="/result" element={<ResultRoute documents={documents} />} />

        <Route path="/signer/:id" element={<SignerProfile />} />
        <Route path="/signer/by-name/:name" element={<SignerProfile />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}
