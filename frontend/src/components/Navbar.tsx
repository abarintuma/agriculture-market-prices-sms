import React, { useState, useEffect } from 'react';
import { Menu, RefreshCw, Radio, Calendar, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  title: string;
  subtitle: string;
  onRefresh?: () => void;
  loading?: boolean;
  onToggleMobileSidebar: () => void;
  backendConnected?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  title,
  subtitle,
  onRefresh,
  loading = false,
  onToggleMobileSidebar,
  backendConnected = true,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-GB', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        {/* Mobile menu button */}
        <button
          onClick={onToggleMobileSidebar}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 lg:hidden transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
            <span>{title}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Date & Time display */}
        <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-400 font-mono">
          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
          <span>{currentTime}</span>
        </div>

        {/* Backend Status indicator badge */}
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs">
          <div
            className={`w-2 h-2 rounded-full ${
              backendConnected ? 'bg-emerald-400 shadow-sm shadow-emerald-400 animate-pulse' : 'bg-amber-400'
            }`}
          />
          <span className="text-slate-300 font-medium text-[11px] hidden sm:inline">
            {backendConnected ? 'API Connected' : 'API Connecting'}
          </span>
        </div>

        {/* Global Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center space-x-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 active:bg-slate-800/80 border border-slate-800 text-slate-200 rounded-xl text-xs font-semibold transition-all shadow-sm disabled:opacity-50"
            title="Refresh current data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
