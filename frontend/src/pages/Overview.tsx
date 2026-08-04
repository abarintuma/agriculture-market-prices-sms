import React, { useEffect, useState } from 'react';
import { api, CropPrice, Farmer, Crop } from '@/lib/api';
import {
  Users,
  Sprout,
  TrendingUp,
  Send,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  Clock
} from 'lucide-react';

export const OverviewPage: React.FC = () => {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [prices, setPrices] = useState<CropPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [farmersData, cropsData, pricesData] = await Promise.all([
        api.getFarmers().catch(() => []),
        api.getCrops().catch(() => []),
        api.getLatestPrices().catch(() => []),
      ]);
      setFarmers(farmersData);
      setCrops(cropsData);
      setPrices(pricesData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleQuickBroadcast = async () => {
    setBroadcasting(true);
    setBroadcastResult(null);
    try {
      const res = await api.triggerBroadcast();
      setBroadcastResult({
        type: 'success',
        message: `Broadcast delivered! Successfully sent SMS to ${res.successful_sends}/${res.total_recipients} farmers across Uganda.`,
      });
    } catch (err: any) {
      setBroadcastResult({
        type: 'error',
        message: `Failed to trigger broadcast: ${err.message || 'Server error'}`,
      });
    } finally {
      setBroadcasting(false);
    }
  };

  const activeFarmersCount = farmers.filter((f) => f.is_active).length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border border-emerald-800/30 p-6 lg:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Market Price & SMS Control Panel
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Automated daily SMS broadcasts delivering real-time commodity market rates and Kampala weather forecast alerts to registered smallholder farmers.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={handleQuickBroadcast}
              disabled={broadcasting || farmers.length === 0}
              className="px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:from-emerald-700 active:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl text-sm transition-all duration-200 flex items-center space-x-2.5 shadow-xl shadow-emerald-950/80 cursor-pointer"
            >
              <Send className={`w-4 h-4 ${broadcasting ? 'animate-bounce' : ''}`} />
              <span>{broadcasting ? 'Dispatching SMS...' : 'Dispatch Daily SMS Blast'}</span>
            </button>
          </div>
        </div>

        {broadcastResult && (
          <div
            className={`mt-6 p-4 rounded-2xl border text-sm flex items-center space-x-3 transition-all ${broadcastResult.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-800/60 text-emerald-200'
                : 'bg-rose-950/80 border-rose-800/60 text-rose-200'
              }`}
          >
            {broadcastResult.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span className="font-medium">{broadcastResult.message}</span>
          </div>
        )}
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Metric 1: Farmers */}
        <div className="glass-card glass-card-hover p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Registered Farmers
            </span>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl lg:text-4xl font-extrabold text-white">
                {loading ? '—' : farmers.length}
              </span>
              <span className="text-xs font-semibold text-emerald-400 flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-0.5" />
                {loading ? '...' : `${activeFarmersCount} active`}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Subscribers receiving SMS alerts in Uganda
            </p>
          </div>
        </div>

        {/* Metric 2: Crops */}
        <div className="glass-card glass-card-hover p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Monitored Commodities
            </span>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
              <Sprout className="w-6 h-6" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl lg:text-4xl font-extrabold text-white">
                {loading ? '—' : crops.length}
              </span>
              <span className="text-xs text-slate-400 font-medium">Crops cataloged</span>
            </div>
            <p className="text-xs text-slate-400">
              Maize, Coffee, Matooke, Beans & more
            </p>
          </div>
        </div>

        {/* Metric 3: Latest Prices */}
        <div className="glass-card glass-card-hover p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Latest Price Records
            </span>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl lg:text-4xl font-extrabold text-white">
                {loading ? '—' : prices.length}
              </span>
              <span className="text-xs font-medium text-emerald-400">Recorded Today</span>
            </div>
            <p className="text-xs text-slate-400">
              Live Ugandan market rates (UGX)
            </p>
          </div>
        </div>
      </div>

      {/* Latest Market Prices Preview Table */}
      <div className="glass-card rounded-3xl overflow-hidden border border-slate-800/80 shadow-xl">
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Kampala Market Price Index
              </h3>
              <p className="text-xs text-slate-400">
                Latest rates published to mobile subscribers
              </p>
            </div>
          </div>
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-xl transition-colors"
            title="Refresh prices"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="divide-y divide-slate-800/80 overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-400 mx-auto" />
              <p>Fetching market price index...</p>
            </div>
          ) : prices.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              No prices logged yet. Add price entries in Crops & Prices.
            </div>
          ) : (
            prices.map((p) => {
              const matchedCrop = crops.find((c) => c.id === p.crop_id);
              return (
                <div
                  key={p.id}
                  className="p-5 px-6 flex items-center justify-between hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-emerald-400 text-sm">
                      {matchedCrop?.name.slice(0, 2).toUpperCase() || 'CR'}
                    </div>
                    <div>
                      <span className="font-bold text-white text-sm">
                        {matchedCrop?.name || `Crop #${p.crop_id}`}
                      </span>
                      <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
                        <span>{p.market_location} Market</span>
                        <span>•</span>
                        <span className="font-mono text-slate-400">Unit: {matchedCrop?.unit || 'kg'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-extrabold text-emerald-400 text-base">
                      UGX {p.price_ugx.toLocaleString()}{' '}
                      <span className="text-xs font-normal text-slate-400">
                        / {matchedCrop?.unit || 'unit'}
                      </span>
                    </span>
                    <div className="flex items-center justify-end space-x-1.5 text-[11px] text-slate-400 mt-0.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>
                        {new Date(p.date_recorded).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;
