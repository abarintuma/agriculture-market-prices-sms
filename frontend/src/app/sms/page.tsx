"use client";

import { useEffect, useState } from "react";
import { api, Farmer, SMSBroadcastResponse } from "@/lib/api";
import {
  Send,
  MessageSquare,
  Filter,
  History,
  CheckCircle2,
  AlertCircle,
  Users,
  Sparkles,
  RefreshCw,
  Smartphone,
  Info,
} from "lucide-react";

const DISTRICT_OPTIONS = [
  { label: "All Districts (National Broadcast)", value: "" },
  { label: "Kampala", value: "Kampala" },
  { label: "Wakiso", value: "Wakiso" },
  { label: "Mukono", value: "Mukono" },
  { label: "Jinja", value: "Jinja" },
  { label: "Mbarara", value: "Mbarara" },
  { label: "Gulu", value: "Gulu" },
  { label: "Arua", value: "Arua" },
  { label: "Lira", value: "Lira" },
  { label: "Mbale", value: "Mbale" },
  { label: "Masaka", value: "Masaka" },
];

interface BroadcastLogEntry extends SMSBroadcastResponse {
  id: string;
  timestamp: string;
  districtFilter: string;
  customNote: string;
}

export default function SMSBroadcastPage() {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loadingFarmers, setLoadingFarmers] = useState(true);

  // Broadcast Form State
  const [districtFilter, setDistrictFilter] = useState("");
  const [customNote, setCustomNote] = useState("");
  const [sending, setSending] = useState(false);

  // Results & History State
  const [latestResult, setLatestResult] = useState<SMSBroadcastResponse | null>(
    null,
  );
  const [broadcastHistory, setBroadcastHistory] = useState<BroadcastLogEntry[]>(
    [],
  );
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchFarmers = async () => {
    setLoadingFarmers(true);
    try {
      const data = await api.getFarmers();
      setFarmers(data);
    } catch (err) {
      console.error("Failed to load farmers:", err);
    } finally {
      setLoadingFarmers(false);
    }
  };

  useEffect(() => {
    fetchFarmers();
  }, []);

  // Calculate targeted recipient count
  const targetRecipients = farmers.filter((f) => {
    if (!f.is_active) return false;
    if (!districtFilter) return true;
    return f.district.toLowerCase() === districtFilter.toLowerCase();
  });

  // Handle Dispatching SMS Broadcast
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setStatusMessage(null);

    try {
      const res = await api.triggerBroadcast(
        districtFilter || undefined,
        customNote.trim() || undefined,
      );

      setLatestResult(res);
      setStatusMessage({
        type: "success",
        text: `Broadcast completed! Sent ${res.successful_sends} out of ${res.total_recipients} messages.`,
      });

      // Append to broadcast history
      const newEntry: BroadcastLogEntry = {
        ...res,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        districtFilter: districtFilter || "All Districts",
        customNote: customNote.trim(),
      };
      setBroadcastHistory((prev) => [newEntry, ...prev]);

      // Reset custom note field
      setCustomNote("");
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to dispatch SMS broadcast.",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Send className="w-7 h-7 text-emerald-400" />
            <span>SMS Broadcast Hub</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Dispatch real-time agricultural market prices and weather updates
            via Twilio SMS.
          </p>
        </div>
        <button
          onClick={fetchFarmers}
          disabled={loadingFarmers}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm transition-colors"
        >
          <RefreshCw
            className={`w-4 h-4 ${loadingFarmers ? "animate-spin" : ""}`}
          />
          <span>Refresh Recipients</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Broadcast Composer Form (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                <span>Broadcast Composer</span>
              </h2>
              <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800/60 px-3 py-1 rounded-full font-mono">
                {targetRecipients.length} Target Recipients
              </span>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-5">
              {/* Target District Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center space-x-1.5">
                  <Filter className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Target Region / District</span>
                </label>
                <select
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  {DISTRICT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Filter broadcast to farmers in a specific district, or select
                  "All Districts" for a nationwide blast.
                </p>
              </div>

              {/* Custom Announcement Note */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-medium text-slate-300 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Custom Announcement / Advisory Note (Optional)</span>
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {customNote.length} / 160 chars
                  </span>
                </div>
                <textarea
                  rows={3}
                  placeholder="e.g. Heavy rains expected in Eastern districts. Protect harvested maize!"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  maxLength={160}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  This note will be automatically appended to the daily market
                  price & weather report.
                </p>
              </div>

              {/* Submit / Trigger Button */}
              <button
                type="submit"
                disabled={sending || targetRecipients.length === 0}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950"
              >
                <Send className="w-4 h-4" />
                <span>
                  {sending
                    ? "Dispatching SMS Broadcast..."
                    : `Dispatch SMS to ${targetRecipients.length} Farmers`}
                </span>
              </button>

              {/* Status Alert Banner */}
              {statusMessage && (
                <div
                  className={`p-4 rounded-xl text-sm flex items-center space-x-3 ${
                    statusMessage.type === "success"
                      ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/60"
                      : "bg-rose-950/80 text-rose-300 border border-rose-800/60"
                  }`}
                >
                  {statusMessage.type === "success" ? (
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
                  )}
                  <span>{statusMessage.text}</span>
                </div>
              )}
            </form>
          </div>

          {/* Audit History Log */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <History className="w-5 h-5 text-emerald-400" />
                <span>Recent Broadcast Activity</span>
              </h2>
              <span className="text-xs text-slate-500">
                {broadcastHistory.length} dispatches logged
              </span>
            </div>

            <div className="divide-y divide-slate-800">
              {broadcastHistory.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No broadcast activity in this session yet. Compose and send a
                  message above to log results!
                </div>
              ) : (
                broadcastHistory.map((log) => (
                  <div
                    key={log.id}
                    className="p-5 space-y-2 hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-semibold text-white text-sm">
                          Target: {log.districtFilter}
                        </span>
                        <span className="text-xs text-slate-400 block mt-0.5">
                          {new Date(log.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800/60 rounded-lg text-xs font-mono">
                          {log.successful_sends}/{log.total_recipients}{" "}
                          Delivered
                        </span>
                      </div>
                    </div>

                    {log.customNote && (
                      <p className="text-xs text-slate-300 italic bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                        "{log.customNote}"
                      </p>
                    )}

                    <div className="text-[11px] text-slate-500 font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800/60 line-clamp-2">
                      Preview: {log.message_preview}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Live Mobile SMS Simulator Preview (1 col) */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Mobile Phone Preview</span>
            </h2>
            <p className="text-xs text-slate-400">
              Simulated look of how the SMS appears on a farmer's feature phone
              (GSM character set).
            </p>

            {/* Simulated Phone Shell */}
            <div className="bg-slate-950 border-2 border-slate-800 rounded-3xl p-4 shadow-2xl space-y-3 relative">
              <div className="w-16 h-1 bg-slate-800 rounded-full mx-auto" />

              <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[10px] text-slate-500 border-b border-slate-800 pb-1.5">
                  <span className="font-semibold text-emerald-400">
                    AGRI-MARKET
                  </span>
                  <span>Now</span>
                </div>

                <div className="text-slate-200 font-mono text-[11px] leading-relaxed whitespace-pre-line">
                  {latestResult ? (
                    latestResult.message_preview
                  ) : (
                    <>
                      AGRI-MARKET PRICES (Kampala) {"\n"}• Maize:
                      UGX 1,200/kg{"\n"}• Coffee: UGX 2,500/kg{"\n"}•
                      Matooke: UGX 35,000/bunch{"\n\n"}
                      WEATHER (Kampala): 26°C, Light rain expected.{"\n"}
                      {customNote && `\nNOTE: ${customNote}\n`}
                      {"\n"}Reply STOP to unsubscribe.
                    </>
                  )}
                </div>
              </div>

              <div className="text-[10px] text-center text-slate-600 font-mono">
                Twilio Programmable SMS
              </div>
            </div>
          </div>

          {/* SMS Broadcast Guidelines */}
          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-3 text-xs text-slate-400">
            <h3 className="font-bold text-slate-200 flex items-center space-x-1.5">
              <Info className="w-4 h-4 text-emerald-400" />
              <span>SMS Delivery Best Practices</span>
            </h3>
            <ul className="space-y-2 list-disc list-inside text-slate-400 leading-relaxed">
              <li>
                E.164 phone number formatting (e.g.,{" "}
                <code className="text-emerald-400">+256...</code>) is required
                for reliable routing.
              </li>
              <li>
                SMS messages over 160 characters are split into concatenated
                153-character segments by telecom carriers.
              </li>
              <li>
                Opt-out instructions ("Reply STOP") comply with Uganda
                Communications Commission (UCC) guidelines.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
