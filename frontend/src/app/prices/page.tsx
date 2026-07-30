"use client";

import { useEffect, useState } from "react";
import { api, Crop, CropPrice } from "@/lib/api";
import {
  Sprout,
  Coins,
  Plus,
  TrendingUp,
  MapPin,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function CropsAndPricesPage() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [prices, setPrices] = useState<CropPrice[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State: New Crop
  const [newCropName, setNewCropName] = useState("");
  const [newCropUnit, setNewCropUnit] = useState("kg");
  const [creatingCrop, setCreatingCrop] = useState(false);
  const [cropMsg, setCropMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Form State: Record Price
  const [selectedCropId, setSelectedCropId] = useState<number | "">("");
  const [priceUgx, setPriceUgx] = useState<string>("");
  const [marketLocation, setMarketLocation] = useState("Kampala");
  const [recordingPrice, setRecordingPrice] = useState(false);
  const [priceMsg, setPriceMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cropsData, pricesData] = await Promise.all([
        api.getCrops().catch(() => []),
        api.getLatestPrices().catch(() => []),
      ]);
      setCrops(cropsData);
      setPrices(pricesData);

      if (cropsData.length > 0 && selectedCropId === "") {
        setSelectedCropId(cropsData[0].id);
      }
    } catch (err) {
      console.error("Error fetching crop/price data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Add New Crop
  const handleAddCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCropName.trim()) return;

    setCreatingCrop(true);
    setCropMsg(null);
    try {
      const created = await api.createCrop(
        newCropName.trim(),
        newCropUnit.trim(),
      );
      setCropMsg({
        type: "success",
        text: `Crop "${created.name}" created successfully!`,
      });
      setNewCropName("");
      fetchData(); // Refresh dropdown and table
    } catch (err: any) {
      setCropMsg({
        type: "error",
        text: err.message || "Failed to create crop.",
      });
    } finally {
      setCreatingCrop(false);
    }
  };

  // Handle Record Market Price
  const handleRecordPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCropId || !priceUgx) return;

    setRecordingPrice(true);
    setPriceMsg(null);
    try {
      const priceNum = parseFloat(priceUgx);
      if (isNaN(priceNum) || priceNum <= 0) {
        throw new Error("Please enter a valid price in UGX.");
      }

      await api.recordPrice(
        Number(selectedCropId),
        priceNum,
        marketLocation.trim(),
      );
      setPriceMsg({
        type: "success",
        text: "Market price updated successfully!",
      });
      setPriceUgx("");
      fetchData(); // Refresh current market prices table
    } catch (err: any) {
      setPriceMsg({
        type: "error",
        text: err.message || "Failed to record price.",
      });
    } finally {
      setRecordingPrice(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Sprout className="w-7 h-7 text-emerald-400" />
            <span>Crops & Market Prices</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage monitored commodities and update daily market prices in UGX.
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Forms Section: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form 1: Add New Crop */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Plus className="w-5 h-5 text-emerald-400" />
            <span>Register New Crop</span>
          </h2>
          <p className="text-xs text-slate-400">
            Add new produce types to track (e.g., Cassava, Matooke, Coffee).
          </p>

          <form onSubmit={handleAddCrop} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Crop Name
              </label>
              <input
                type="text"
                placeholder="e.g. Maize"
                value={newCropName}
                onChange={(e) => setNewCropName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Unit of Measure
              </label>
              <select
                value={newCropUnit}
                onChange={(e) => setNewCropUnit(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="kg">Per Kilogram (kg)</option>
                <option value="50kg bag">50kg Bag</option>
                <option value="100kg bag">100kg Bag</option>
                <option value="bunch">Bunch (e.g. Matooke)</option>
                <option value="liter">Liter</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={creatingCrop || !newCropName.trim()}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-medium rounded-xl text-sm transition-colors flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>{creatingCrop ? "Saving..." : "Add Crop"}</span>
            </button>

            {cropMsg && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
                  cropMsg.type === "success"
                    ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/50"
                    : "bg-rose-950/60 text-rose-300 border border-rose-800/50"
                }`}
              >
                {cropMsg.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{cropMsg.text}</span>
              </div>
            )}
          </form>
        </div>

        {/* Form 2: Record New Price */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Coins className="w-5 h-5 text-emerald-400" />
            <span>Record Market Price Update</span>
          </h2>
          <p className="text-xs text-slate-400">
            Log today's market price in Ugandan Shillings (UGX).
          </p>

          <form onSubmit={handleRecordPrice} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Select Crop
              </label>
              <select
                value={selectedCropId}
                onChange={(e) => setSelectedCropId(Number(e.target.value))}
                required
                disabled={crops.length === 0}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50"
              >
                {crops.length === 0 ? (
                  <option value="">
                    No crops available. Create one first!
                  </option>
                ) : (
                  crops.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.unit})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Price (UGX)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 3200"
                  value={priceUgx}
                  onChange={(e) => setPriceUgx(e.target.value)}
                  required
                  min="1"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Market Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kampala"
                  value={marketLocation}
                  onChange={(e) => setMarketLocation(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={recordingPrice || !selectedCropId || !priceUgx}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-medium rounded-xl text-sm transition-colors flex items-center justify-center space-x-2"
            >
              <TrendingUp className="w-4 h-4" />
              <span>
                {recordingPrice ? "Updating Price..." : "Record Price"}
              </span>
            </button>

            {priceMsg && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
                  priceMsg.type === "success"
                    ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/50"
                    : "bg-rose-950/60 text-rose-300 border border-rose-800/50"
                }`}
              >
                {priceMsg.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{priceMsg.text}</span>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Directory Table: Monitored Commodities & Prices */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">
              Commodity Prices Directory
            </h2>
            <p className="text-xs text-slate-400">
              Latest recorded rates across monitored markets.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {crops.length} commodities listed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider">
                <th className="py-3 px-6">Commodity Name</th>
                <th className="py-3 px-6">Unit</th>
                <th className="py-3 px-6">Latest Price (UGX)</th>
                <th className="py-3 px-6">Market Location</th>
                <th className="py-3 px-6">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    Loading commodity directory...
                  </td>
                </tr>
              ) : crops.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No registered crops found. Use the form above to add your
                    first crop!
                  </td>
                </tr>
              ) : (
                crops.map((crop) => {
                  const latestPrice = prices.find((p) => p.crop_id === crop.id);
                  return (
                    <tr
                      key={crop.id}
                      className="hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-4 px-6 font-semibold text-white">
                        {crop.name}
                      </td>
                      <td className="py-4 px-6 text-slate-400">
                        <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-md text-xs font-mono">
                          {crop.unit}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-bold text-emerald-400">
                        {latestPrice
                          ? `UGX ${latestPrice.price_ugx.toLocaleString()}`
                          : "No price logged"}
                      </td>
                      <td className="py-4 px-6 text-slate-300">
                        {latestPrice ? (
                          <span className="flex items-center space-x-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            <span>{latestPrice.market_location}</span>
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-500">
                        {latestPrice
                          ? new Date(
                              latestPrice.date_recorded,
                            ).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
