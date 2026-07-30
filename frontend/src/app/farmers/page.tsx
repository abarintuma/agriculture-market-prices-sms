"use client";

import { useEffect, useState } from "react";
import { api, Farmer } from "@/lib/api";
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
} from "lucide-react";

const COMMON_DISTRICTS = [
  "Kampala",
  "Wakiso",
  "Mukono",
  "Jinja",
  "Mbarara",
  "Gulu",
  "Arua",
  "Lira",
  "Mbale",
  "Masaka",
];

export default function FarmersPage() {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Registration Form State
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [district, setDistrict] = useState("Kampala");
  const [customDistrict, setCustomDistrict] = useState("");
  const [registering, setRegistering] = useState(false);
  const [formMsg, setFormMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchFarmers = async () => {
    setLoading(true);
    try {
      const data = await api.getFarmers();
      setFarmers(data);
    } catch (err: any) {
      console.error("Failed to load farmers:", err);
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

    const targetDistrict =
      district === "Other" ? customDistrict.trim() : district;

    try {
      const registered = await api.registerFarmer(
        fullName.trim(),
        phoneNumber.trim(),
        targetDistrict || "Kampala",
      );
      setFormMsg({
        type: "success",
        text: `Farmer "${registered.full_name}" registered successfully!`,
      });
      setFullName("");
      setPhoneNumber("");
      fetchFarmers(); // Refresh list
    } catch (err: any) {
      setFormMsg({
        type: "error",
        text:
          err.message ||
          "Failed to register farmer. Ensure phone number is valid.",
      });
    } finally {
      setRegistering(false);
    }
  };

  // Filter farmers by name, phone, or district
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Users className="w-7 h-7 text-emerald-400" />
            <span>Farmers Directory</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage SMS subscribers, register new agricultural producers, and
            organize by district.
          </p>
        </div>
        <button
          onClick={fetchFarmers}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form: Register Farmer (1 column) */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 lg:col-span-1 h-fit">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-emerald-400" />
            <span>Register Farmer</span>
          </h2>
          <p className="text-xs text-slate-400">
            Add a farmer to receive market price & weather SMS broadcasts.
          </p>

          <form onSubmit={handleRegisterFarmer} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Mukasa John"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Phone Number (E.164 format)
              </label>
              <input
                type="tel"
                placeholder="e.g. +256770000000"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Include country code (e.g. +256 for Uganda).
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                District
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {COMMON_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
                <option value="Other">Other District...</option>
              </select>
            </div>

            {district === "Other" && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Custom District Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kabale"
                  value={customDistrict}
                  onChange={(e) => setCustomDistrict(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={registering || !fullName.trim() || !phoneNumber.trim()}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-medium rounded-xl text-sm transition-colors flex items-center justify-center space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>{registering ? "Registering..." : "Add Farmer"}</span>
            </button>

            {formMsg && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
                  formMsg.type === "success"
                    ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/50"
                    : "bg-rose-950/60 text-rose-300 border border-rose-800/50"
                }`}
              >
                {formMsg.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{formMsg.text}</span>
              </div>
            )}
          </form>
        </div>

        {/* Directory Table & Search (2 columns) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden lg:col-span-2 flex flex-col">
          {/* Search Header */}
          <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Subscribers List</h2>
              <p className="text-xs text-slate-400">
                {filteredFarmers.length} of {farmers.length} farmers showing
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search name, phone, district..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="py-3 px-6">Farmer Name</th>
                  <th className="py-3 px-6">Phone Number</th>
                  <th className="py-3 px-6">District</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm text-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      Loading farmer directory...
                    </td>
                  </tr>
                ) : filteredFarmers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      {searchQuery
                        ? "No farmers matching your search."
                        : "No farmers registered yet. Add your first farmer using the form."}
                    </td>
                  </tr>
                ) : (
                  filteredFarmers.map((f) => (
                    <tr
                      key={f.id}
                      className="hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-4 px-6 font-semibold text-white">
                        {f.full_name}
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-slate-300">
                        <span className="flex items-center space-x-1.5">
                          <Phone className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{f.phone_number}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-300">
                        <span className="flex items-center space-x-1 text-xs">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          <span>{f.district}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {f.is_active ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 rounded-full text-[11px] font-medium">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 bg-slate-800 text-slate-400 rounded-full text-[11px] font-medium">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-500">
                        {new Date(f.registered_at).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
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
}
