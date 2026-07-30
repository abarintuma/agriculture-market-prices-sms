"use client";

import { useEffect, useState } from "react";
import { api, CropPrice, Farmer, Crop } from "@/lib/api";
import {
  Users,
  Sprout,
  TrendingUp,
  Send,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export default function OverviewPage() {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [prices, setPrices] = useState<CropPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<string | null>(null);

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
      console.error("Failed to load dashboard data:", error);
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
      setBroadcastResult(
        `Sent SMS to ${res.successful_sends}/${res.total_recipients} farmers successfully!`,
      );
    } catch (err: any) {
      setBroadcastResult(`Failed to send broadcast: ${err.message}`);
    } finally {
      setBroadcasting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">System Overview</h1>
          <p className="text-slate-400 text-sm">
            Live Ugandan agricultural market prices and SMS broadcast control
            panel.
          </p>
        </div>
        <button
          onClick={loadDashboardData}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Farmers */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm font-medium">
              Registered Farmers
            </span>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-white">
              {loading ? "..." : farmers.length}
            </span>
            <span className="text-xs text-slate-500 block mt-1">
              Active SMS subscribers
            </span>
          </div>
        </div>

        {/* Card 2: Crops */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm font-medium">
              Monitored Crops
            </span>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Sprout className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-white">
              {loading ? "..." : crops.length}
            </span>
            <span className="text-xs text-slate-500 block mt-1">
              Configured commodities
            </span>
          </div>
        </div>

        {/* Card 3: Latest Prices */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm font-medium">
              Latest Price Updates
            </span>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-white">
              {loading ? "..." : prices.length}
            </span>
            <span className="text-xs text-slate-500 block mt-1">
              Recorded today
            </span>
          </div>
        </div>
      </div>

      {/* Instant SMS Broadcast Trigger Section */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-800/40 p-6 rounded-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Send className="w-5 h-5 text-emerald-400" />
              <span>Instant SMS Broadcast</span>
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Fetch current market prices + Kampala weather and deliver SMS
              updates to all registered farmers via Twilio.
            </p>
          </div>
          <button
            onClick={handleQuickBroadcast}
            disabled={broadcasting || farmers.length === 0}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center space-x-2 shrink-0 shadow-lg shadow-emerald-950"
          >
            <Send className="w-4 h-4" />
            <span>
              {broadcasting ? "Sending Broadcast..." : "Dispatch Daily SMS"}
            </span>
          </button>
        </div>

        {broadcastResult && (
          <div className="mt-4 p-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200">
            {broadcastResult}
          </div>
        )}
      </div>

      {/* Latest Prices Preview Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white">
            Current Kampala Market Prices
          </h2>
        </div>
        <div className="divide-y divide-slate-800">
          {prices.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-sm">
              {loading
                ? "Loading market prices..."
                : "No price records found. Add price entries in Crops & Prices."}
            </div>
          ) : (
            prices.map((p) => {
              const matchedCrop = crops.find((c) => c.id === p.crop_id);
              return (
                <div
                  key={p.id}
                  className="p-4 px-6 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
                >
                  <div>
                    <span className="font-semibold text-white">
                      {matchedCrop?.name || `Crop #${p.crop_id}`}
                    </span>
                    <span className="text-xs text-slate-400 block">
                      {p.market_location} Market
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-400">
                      UGX {p.price_ugx.toLocaleString()} /{" "}
                      {matchedCrop?.unit || "unit"}
                    </span>
                    <span className="text-xs text-slate-500 block">
                      Source: {p.price_source}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
