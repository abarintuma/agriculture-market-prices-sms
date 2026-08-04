import { useEffect, useState } from 'react';
import { api, Crop, CropPrice } from '@/lib/api';
import {
  Sprout,
  Coins,
  Plus,
  TrendingUp,
  MapPin,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Tag,
  Building2,
  Clock
} from 'lucide-react';

export const CropsPricesPage = () => {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [prices, setPrices] = useState<CropPrice[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State: New Crop
  const [newCropName, setNewCropName] = useState('');
  const [newCropUnit, setNewCropUnit] = useState('kg');
  const [creatingCrop, setCreatingCrop] = useState(false);
  const [cropMsg, setCropMsg] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Form State: Record Price
  const [selectedCropId, setSelectedCropId] = useState<number | ''>('');
  const [priceUgx, setPriceUgx] = useState<string>('');
  const [marketLocation, setMarketLocation] = useState('Kampala');
  const [recordingPrice, setRecordingPrice] = useState(false);
  const [priceMsg, setPriceMsg] = useState<{
    type: 'success' | 'error';
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

      if (cropsData.length > 0 && selectedCropId === '') {
        setSelectedCropId(cropsData[0].id);
      }
    } catch (err) {
      console.error('Error fetching crop/price data:', err);
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
      const created = await api.createCrop(newCropName.trim(), newCropUnit.trim());
      setCropMsg({
        type: 'success',
        text: `Crop "${created.name}" registered successfully!`,
      });
      setNewCropName('');
      fetchData();
    } catch (err: any) {
      setCropMsg({
        type: 'error',
        text: err.message || 'Failed to create crop.',
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
        throw new Error('Please enter a valid price in UGX.');
      }

      await api.recordPrice(
        Number(selectedCropId),
        priceNum,
        marketLocation.trim()
      );
      setPriceMsg({
        type: 'success',
        text: 'Market price logged successfully!',
      });
      setPriceUgx('');
      fetchData();
    } catch (err: any) {
      setPriceMsg({
        type: 'error',
        text: err.message || 'Failed to record price.',
      });
    } finally {
      setRecordingPrice(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
            <Sprout className="w-7 h-7 text-emerald-400" />
            <span>Crops & Market Prices</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Configure agricultural commodities and publish daily market rates in UGX.
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-2xl text-xs font-semibold transition-all shadow-sm shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Forms Grid (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form 1: Add New Crop */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800/80 space-y-5">
          <div className="flex items-center space-x-3 border-b border-slate-800/80 pb-4">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Register New Commodity</h3>
              <p className="text-xs text-slate-400">Add produce types (e.g. Matooke, Cassava, Coffee)</p>
            </div>
          </div>

          <form onSubmit={handleAddCrop} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Crop / Commodity Name
              </label>
              <input
                type="text"
                placeholder="e.g. Yellow Maize"
                value={newCropName}
                onChange={(e) => setNewCropName(e.target.value)}
                required
                className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Standard Unit of Measurement
              </label>
              <select
                value={newCropUnit}
                onChange={(e) => setNewCropUnit(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
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
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-2xl text-sm transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950/50 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{creatingCrop ? 'Saving Commodity...' : 'Add Commodity'}</span>
            </button>

            {cropMsg && (
              <div
                className={`p-3.5 rounded-2xl text-xs flex items-center space-x-2.5 ${
                  cropMsg.type === 'success'
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                    : 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                }`}
              >
                {cropMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                )}
                <span>{cropMsg.text}</span>
              </div>
            )}
          </form>
        </div>

        {/* Form 2: Log Price Update */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800/80 space-y-5">
          <div className="flex items-center space-x-3 border-b border-slate-800/80 pb-4">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Record Market Price</h3>
              <p className="text-xs text-slate-400">Log today's market price in Ugandan Shillings (UGX)</p>
            </div>
          </div>

          <form onSubmit={handleRecordPrice} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Select Crop
              </label>
              <select
                value={selectedCropId}
                onChange={(e) => setSelectedCropId(Number(e.target.value))}
                required
                disabled={crops.length === 0}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-colors"
              >
                {crops.length === 0 ? (
                  <option value="">No crops available. Create one first!</option>
                ) : (
                  crops.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.unit})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Price (UGX)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 3500"
                  value={priceUgx}
                  onChange={(e) => setPriceUgx(e.target.value)}
                  required
                  min="1"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Market Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kampala"
                  value={marketLocation}
                  onChange={(e) => setMarketLocation(e.target.value)}
                  required
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={recordingPrice || !selectedCropId || !priceUgx}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-2xl text-sm transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950/50 cursor-pointer"
            >
              <TrendingUp className="w-4 h-4" />
              <span>{recordingPrice ? 'Logging Price...' : 'Publish Market Price'}</span>
            </button>

            {priceMsg && (
              <div
                className={`p-3.5 rounded-2xl text-xs flex items-center space-x-2.5 ${
                  priceMsg.type === 'success'
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                    : 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                }`}
              >
                {priceMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                )}
                <span>{priceMsg.text}</span>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Directory Table */}
      <div className="glass-card rounded-3xl overflow-hidden border border-slate-800/80 shadow-xl">
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Commodity Directory</h3>
              <p className="text-xs text-slate-400">All registered agricultural products and recorded rates</p>
            </div>
          </div>
          <span className="text-xs font-mono bg-slate-900 border border-slate-800 px-3 py-1 rounded-xl text-slate-400">
            {crops.length} Listed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="py-4 px-6">Commodity</th>
                <th className="py-4 px-6">Unit</th>
                <th className="py-4 px-6">Latest Price (UGX)</th>
                <th className="py-4 px-6">Market</th>
                <th className="py-4 px-6">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-sm text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin text-emerald-400 mx-auto mb-2" />
                    Loading commodities...
                  </td>
                </tr>
              ) : crops.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No crops registered yet. Add your first crop using the form above.
                  </td>
                </tr>
              ) : (
                crops.map((crop) => {
                  const latestPrice = prices.find((p) => p.crop_id === crop.id);
                  return (
                    <tr key={crop.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-6 font-bold text-white">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-xs">
                            {crop.name.slice(0, 2).toUpperCase()}
                          </div>
                          <span>{crop.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-400">
                        <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-300 rounded-lg text-xs font-mono">
                          {crop.unit}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-extrabold text-emerald-400">
                        {latestPrice
                          ? `UGX ${latestPrice.price_ugx.toLocaleString()}`
                          : 'No price logged'}
                      </td>
                      <td className="py-4 px-6 text-slate-300">
                        {latestPrice ? (
                          <span className="inline-flex items-center space-x-1.5 text-xs text-slate-300">
                            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{latestPrice.market_location}</span>
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-400 font-mono">
                        {latestPrice
                          ? new Date(latestPrice.date_recorded).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '—'}
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
};

export default CropsPricesPage;
