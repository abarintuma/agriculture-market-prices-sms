import { useEffect, useState } from 'react';
import { api, Farmer } from '@/lib/api';
import {
  Users,
  UserPlus,
  Phone,
  MapPin,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Filter,
  UserCheck
} from 'lucide-react';

const COMMON_DISTRICTS = [
  'Kampala',
  'Wakiso',
  'Mukono',
  'Jinja',
  'Mbarara',
  'Gulu',
  'Arua',
  'Lira',
  'Mbale',
  'Masaka',
];

export const FarmersPage = () => {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Registration Form State
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [district, setDistrict] = useState('Kampala');
  const [customDistrict, setCustomDistrict] = useState('');
  const [registering, setRegistering] = useState(false);
  const [formMsg, setFormMsg] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const fetchFarmers = async () => {
    setLoading(true);
    try {
      const data = await api.getFarmers();
      setFarmers(data);
    } catch (err: any) {
      console.error('Failed to load farmers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmers();
  }, []);

  const handleRegisterFarmer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phoneNumber.trim()) return;

    setRegistering(true);
    setFormMsg(null);

    const targetDistrict = district === 'Other' ? customDistrict.trim() : district;

    try {
      const registered = await api.registerFarmer(
        fullName.trim(),
        phoneNumber.trim(),
        targetDistrict || 'Kampala'
      );
      setFormMsg({
        type: 'success',
        text: `Farmer "${registered.full_name}" registered successfully!`,
      });
      setFullName('');
      setPhoneNumber('');
      fetchFarmers();
    } catch (err: any) {
      setFormMsg({
        type: 'error',
        text: err.message || 'Failed to register farmer. Check phone format (+256...).',
      });
    } finally {
      setRegistering(false);
    }
  };

  const filteredFarmers = farmers.filter((f) => {
    const q = searchQuery.toLowerCase();
    return (
      f.full_name.toLowerCase().includes(q) ||
      f.phone_number.toLowerCase().includes(q) ||
      f.district.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
            <Users className="w-7 h-7 text-emerald-400" />
            <span>Farmers Directory</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Manage SMS subscribers, register new producers, and organize by Ugandan district.
          </p>
        </div>
        <button
          onClick={fetchFarmers}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-2xl text-xs font-semibold transition-all shadow-sm shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Directory</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form: Register Farmer (1 column) */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800/80 space-y-5 lg:col-span-1 h-fit">
          <div className="flex items-center space-x-3 border-b border-slate-800/80 pb-4">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Register Farmer</h3>
              <p className="text-xs text-slate-400">Add subscriber to SMS broadcast list</p>
            </div>
          </div>

          <form onSubmit={handleRegisterFarmer} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Mukasa John"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Phone Number (E.164 format)
              </label>
              <input
                type="tel"
                placeholder="e.g. +256770000000"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Must include country code (e.g. +256).
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                District
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
              >
                {COMMON_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
                <option value="Other">Other District...</option>
              </select>
            </div>

            {district === 'Other' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Custom District Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kabale"
                  value={customDistrict}
                  onChange={(e) => setCustomDistrict(e.target.value)}
                  required
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={registering || !fullName.trim() || !phoneNumber.trim()}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-2xl text-sm transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950/50 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{registering ? 'Registering...' : 'Add Farmer'}</span>
            </button>

            {formMsg && (
              <div
                className={`p-3.5 rounded-2xl text-xs flex items-center space-x-2.5 ${
                  formMsg.type === 'success'
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                    : 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                }`}
              >
                {formMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                )}
                <span>{formMsg.text}</span>
              </div>
            )}
          </form>
        </div>

        {/* Directory Table & Instant Search (2 columns) */}
        <div className="glass-card rounded-3xl overflow-hidden border border-slate-800/80 lg:col-span-2 flex flex-col shadow-xl">
          {/* Table Header & Search */}
          <div className="p-6 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-emerald-400" />
                <span>Subscribers List</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Showing {filteredFarmers.length} of {farmers.length} registered farmers
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search name, phone (+256...), district..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-4 px-6">Farmer Name</th>
                  <th className="py-4 px-6">Phone Number</th>
                  <th className="py-4 px-6">District</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-sm text-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <RefreshCw className="w-6 h-6 animate-spin text-emerald-400 mx-auto mb-2" />
                      Loading farmer directory...
                    </td>
                  </tr>
                ) : filteredFarmers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      {searchQuery
                        ? 'No farmers matching your search terms.'
                        : 'No registered farmers found. Use the form to register subscribers.'}
                    </td>
                  </tr>
                ) : (
                  filteredFarmers.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-6 font-bold text-white">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-emerald-400">
                            {f.full_name.slice(0, 1).toUpperCase()}
                          </div>
                          <span>{f.full_name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-slate-300">
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg">
                          <Phone className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{f.phone_number}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-300">
                        <span className="inline-flex items-center space-x-1 text-xs">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{f.district}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {f.is_active ? (
                          <span className="inline-flex items-center space-x-1 px-3 py-1 bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 rounded-full text-xs font-semibold">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Subscribed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 bg-slate-800 text-slate-400 rounded-full text-xs font-medium">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-400 font-mono">
                        {new Date(f.registered_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmersPage;
