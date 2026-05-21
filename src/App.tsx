/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense, lazy, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import { AppProvider } from './context/AppContext';
import MobileBottomNav from './components/MobileBottomNav';
import { QrCode } from 'lucide-react';
import NotFoundPage from './pages/NotFoundPage';
import { useAdminStatus } from './hooks/useAdminStatus';

const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const BagDetailsPage = lazy(() => import('./pages/BagDetailsPage'));
const QuickUpload = lazy(() => import('./components/QuickUpload'));
const BagScanner = lazy(() => import('./components/BagScanner'));

function RouteLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-12 w-12 rounded-full border-4 border-gold-metallic/20 border-t-gold-metallic animate-spin" />
    </div>
  );
}

function QuickScanButton() {
  const isAdmin = useAdminStatus();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  if (!isAdmin || location.pathname.startsWith('/admin')) return null;

  const handleScan = (scannedValue: string) => {
    setIsScannerOpen(false);

    try {
      const parsedUrl = new URL(scannedValue);
      navigate(`${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`);
      return;
    } catch {
      const cleanedValue = scannedValue.trim().replace(/^#/, '');
      navigate(`/bags/${encodeURIComponent(cleanedValue)}`);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsScannerOpen(true)}
        className="fixed bottom-5 right-4 md:bottom-10 md:right-10 z-[100] flex h-16 w-16 items-center justify-center rounded-full border-4 border-maroon-dark bg-gold-metallic text-maroon-dark shadow-2xl shadow-gold-metallic/50 transition-transform hover:scale-110"
        title="Quick Scan"
      >
        <QrCode size={28} />
      </button>

      <Suspense fallback={null}>
        {isScannerOpen ? (
          <BagScanner onScan={handleScan} onClose={() => setIsScannerOpen(false)} />
        ) : null}
      </Suspense>
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Router>
        <main className="relative selection:bg-gold-metallic selection:text-maroon-dark bg-maroon-dark overflow-x-hidden">
          <Navbar />

          <Suspense fallback={<RouteLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/bags/:tagCode" element={<BagDetailsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
          
          {/* Luxury Global Atmosphere */}
          <div className="fixed inset-0 pointer-events-none z-0">
            {/* Soft Luxury Glows */}
            <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-gold-metallic/10 blur-[120px] rounded-full mix-blend-screen"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-maroon-deep/30 blur-[120px] rounded-full mix-blend-screen"></div>
          </div>
        </main>

        <QuickScanButton />
        <Suspense fallback={null}>
          <QuickUpload />
        </Suspense>
        <MobileBottomNav />
        <Analytics />
      </Router>
    </AppProvider>
  );
}
