import { useEffect, useState } from 'react';
import { api, Farmer, SMSBroadcastResponse } from '@/lib/api';
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
  Clock,
  CheckCheck
} from 'lucide-react';

const DISTRICT_OPTIONS = [
  { label: 'All Districts (National Broadcast)', value: '' },
  { label: 'Kampala', value: 'Kampala' },
  { label: 'Wakiso', value: 'Wakiso' },
  { label: 'Mukono', value: 'Mukono' },
  { label: 'Jinja', value: 'Jinja' },
  { label: 'Mbarara', value: 'Mbarara' },
  { label: 'Gulu', value: 'Gulu' },
  { label: 'Arua', value: 'Arua' },
  { label: 'Lira', value: 'Lira' },
  { label: 'Mbale', value: 'Mbale' },
  { label: 'Masaka', value: 'Masaka' },
];

interface BroadcastLogEntry extends SMSBroadcastResponse {
  id: string;
  timestamp: string;
  districtFilter: string;
  customNote: string;
}

export const SMSBroadcastPage = () => {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loadingFarmers, setLoadingFarmers] = useState(true);

  // Broadcast Form State
  const [districtFilter, setDistrictFilter] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [sending, setSending] = useState(false);

  // Results & History State
  const [latestResult, setLatestResult] = useState<SMSBroadcastResponse | null>(null);
  const [broadcastHistory, setBroadcastHistory] = useState<BroadcastLogEntry[]>([]);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const fetchFarmers = async () => {
    setLoadingFarmers(true);
    try {
      const data = await api.getFarmers();
      setFarmers(data);
    } catch (err) {
      console.error('Failed to load farmers:', err);
    } finally {
      setLoadingFarmers(false);
    }
  };

  useEffect(() => {
    fetchFarmers();
  }, []);

  // Filter target active recipients
  const targetRecipients = farmers.filter((f) => {
    if (!f.is_active) return false;
    if (!districtFilter) return true;
    return f.district.toLowerCase() === districtFilter.toLowerCase();
  });

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setStatusMessage(null);

    try {
      const res = await api.triggerBroadcast(
        districtFilter || undefined,
        customNote.trim() || undefined
      );

      setLatestResult(res);
      setStatusMessage({
        type: 'success',
        text: `SMS Broadcast completed! Sent ${res.successful_sends} out of ${res.total_recipients} messages.`,
      });

      const newEntry: BroadcastLogEntry = {
        ...res,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        districtFilter: districtFilter ? districtFilter : 'All Districts (National)',
        customNote: customNote.trim(),
      };
      setBroadcastHistory((prev) => [newEntry, ...prev]);
      setCustomNote('');
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to dispatch SMS broadcast.',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
            <Send className="w-7 h-7 text-emerald-400" />
            <span>SMS Broadcast Hub</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Dispatch agricultural market prices and weather advisories to farmers via Twilio SMS.
          </p>
        </div>
        <button
          onClick={fetchFarmers}
          disabled={loadingFarmers}
          className="flex items-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-2xl text-xs font-semibold transition-all shadow-sm shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${loadingFarmers ? 'animate-spin' : ''}`} />
          <span>Refresh Recipients</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form & History (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Composer Form */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800/80 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Broadcast Composer</h3>
                  <p className="text-xs text-slate-400">Configure target audience and advisory note</p>
                </div>
              </div>
              <span className="text-xs font-mono bg-emerald-950 text-emerald-400 border border-emerald-800/60 px-3.5 py-1 rounded-full font-semibold">
                {targetRecipients.length} Target Recipients
              </span>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-5">
              {/* Region Filter */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                  <Filter className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Target Region / District</span>
                </label>
                <select
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  {DISTRICT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Filter broadcast to farmers in a specific district, or select "All Districts" for nationwide coverage.
                </p>
              </div>

              {/* Custom Advisory Note */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Custom Announcement / Advisory Note (Optional)</span>
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {customNote.length} / 160 chars
                  </span>
                </div>
                <textarea
                  rows={3}
                  placeholder="e.g. Heavy rains expected in Eastern districts. Protect harvested maize!"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  maxLength={160}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Appended directly to daily market prices & weather alerts.
                </p>
              </div>

              {/* Dispatch Button */}
              <button
                type="submit"
                disabled={sending || targetRecipients.length === 0}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-50 text-white font-bold rounded-2xl text-sm transition-all duration-200 flex items-center justify-center space-x-2.5 shadow-xl shadow-emerald-950/80 cursor-pointer"
              >
                <Send className={`w-4 h-4 ${sending ? 'animate-bounce' : ''}`} />
                <span>
                  {sending
                    ? 'Dispatching SMS Messages...'
                    : `Dispatch SMS to ${targetRecipients.length} Farmers`}
                </span>
              </button>

              {/* Status Alert Banner */}
              {statusMessage && (
                <div
                  className={`p-4 rounded-2xl text-sm flex items-center space-x-3 transition-all ${
                    statusMessage.type === 'success'
                      ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-800/60'
                      : 'bg-rose-950/80 text-rose-200 border border-rose-800/60'
                  }`}
                >
                  {statusMessage.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                  <span>{statusMessage.text}</span>
                </div>
              )}
            </form>
          </div>

          {/* Audit History Log */}
          <div className="glass-card rounded-3xl overflow-hidden border border-slate-800/80 shadow-xl">
            <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                  <History className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Broadcast Audit Log</h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {broadcastHistory.length} Sent this session
              </span>
            </div>

            <div className="divide-y divide-slate-800/80">
              {broadcastHistory.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  No broadcasts logged in this session yet. Compose and send a message above.
                </div>
              ) : (
                broadcastHistory.map((log) => (
                  <div key={log.id} className="p-5 space-y-2.5 hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-sm">
                          Target: {log.districtFilter}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          ({new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                        </span>
                      </div>
                      <span className="inline-flex items-center space-x-1 px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800/60 rounded-full text-xs font-mono font-semibold">
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>{log.successful_sends}/{log.total_recipients} Delivered</span>
                      </span>
                    </div>

                    {log.customNote && (
                      <div className="text-xs text-slate-300 italic bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
                        "{log.customNote}"
                      </div>
                    )}

                    <div className="text-[11px] text-slate-400 font-mono bg-slate-950/80 p-3 rounded-xl border border-slate-800/60 line-clamp-2">
                      Preview: {log.message_preview}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Live Mobile Phone Simulator (1 Col) */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-3xl border border-slate-800/80 space-y-4 shadow-2xl">
            <div className="flex items-center space-x-2.5 border-b border-slate-800/80 pb-3.5">
              <Smartphone className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Live Phone Simulator</h3>
            </div>
            <p className="text-xs text-slate-400">
              Realistic preview of the SMS text delivered to smallholder feature phones.
            </p>

            {/* Phone Body Shell */}
            <div className="bg-slate-950 border-4 border-slate-800 rounded-[36px] p-4 shadow-2xl space-y-3 relative mx-auto max-w-xs">
              <div className="w-16 h-1.5 bg-slate-800 rounded-full mx-auto mb-1" />

              <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
                  <span className="font-extrabold text-emerald-400 tracking-wider uppercase">
                    AGRI-MARKET
                  </span>
                  <span className="text-[10px]">Now</span>
                </div>

                <div className="text-slate-200 font-mono text-[11px] leading-relaxed whitespace-pre-line">
                  {latestResult ? (
                    latestResult.message_preview
                  ) : (
                    <>
                      AGRI-MARKET PRICES (Kampala){'\n'}
                      • Maize: UGX 1,200/kg{'\n'}
                      • Coffee: UGX 2,500/kg{'\n'}
                      • Matooke: UGX 35,000/bunch{'\n\n'}
                      WEATHER (Kampala): 26°C, Light rain expected.{'\n'}
                      {customNote && `\nNOTE: ${customNote}\n`}
                      {'\n'}Reply STOP to unsubscribe.
                    </>
                  )}
                </div>
              </div>

              <div className="text-[10px] text-center text-slate-400 font-mono pt-1">
                Twilio Programmable SMS
              </div>
            </div>
          </div>

          {/* Compliance & Best Practices Card */}
          <div className="glass-card p-5 rounded-3xl border border-slate-800/80 space-y-3 text-xs">
            <h4 className="font-bold text-slate-200 flex items-center space-x-2">
              <Info className="w-4 h-4 text-emerald-400" />
              <span>SMS Dispatch Guidelines</span>
            </h4>
            <ul className="space-y-2 text-slate-400 leading-relaxed list-disc list-inside">
              <li>E.164 phone numbers (e.g. <code className="text-emerald-400">+256...</code>) guarantee SMS routing across MTN & Airtel networks.</li>
              <li>Messages exceeding 160 GSM characters are split into concatenated 153-character segments.</li>
              <li>Opt-out footer ("Reply STOP") maintains UCC subscriber regulation compliance.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SMSBroadcastPage;
