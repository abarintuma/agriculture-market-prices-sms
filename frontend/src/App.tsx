import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import OverviewPage from '@/pages/Overview';
import CropsPricesPage from '@/pages/CropsPrices';
import FarmersPage from '@/pages/Farmers';
import SMSBroadcastPage from '@/pages/SMSBroadcast';
import { api } from '@/lib/api';

const routeTitles: Record<string, { title: string; subtitle: string }> = {
  '/': {
    title: 'System Overview',
    subtitle: 'Ugandan agricultural market prices & SMS broadcast control panel',
  },
  '/prices': {
    title: 'Crops & Market Prices',
    subtitle: 'Commodity directory & daily price recording in UGX',
  },
  '/farmers': {
    title: 'Farmers Directory',
    subtitle: 'Manage active SMS subscribers organized by Ugandan district',
  },
  '/sms': {
    title: 'SMS Broadcast Hub',
    subtitle: 'Dispatch market price & weather advisories via Twilio SMS',
  },
};

const MainLayout: React.FC = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [backendConnected, setBackendConnected] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(false);

  const currentRouteMeta = routeTitles[location.pathname] || {
    title: 'Agri-Market Admin',
    subtitle: 'Agricultural Market Prices & SMS System',
  };

  const checkConnection = async () => {
    const isAlive = await api.checkHealth();
    setBackendConnected(isAlive);
  };

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleGlobalRefresh = () => {
    setLoading(true);
    setRefreshKey((prev) => prev + 1);
    checkConnection().finally(() => {
      setTimeout(() => setLoading(false), 500);
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Navigation Sidebar */}
      <Sidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        backendConnected={backendConnected}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          title={currentRouteMeta.title}
          subtitle={currentRouteMeta.subtitle}
          onRefresh={handleGlobalRefresh}
          loading={loading}
          onToggleMobileSidebar={() => setMobileOpen(true)}
          backendConnected={backendConnected}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Routes key={refreshKey}>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/prices" element={<CropsPricesPage />} />
            <Route path="/farmers" element={<FarmersPage />} />
            <Route path="/sms" element={<SMSBroadcastPage />} />
            <Route path="*" element={<OverviewPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <MainLayout />
    </BrowserRouter>
  );
};

export default App;
