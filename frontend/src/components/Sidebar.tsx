import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Sprout,
  Users,
  Send,
  ChevronRight,
  X
} from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  backendConnected?: boolean;
}

const navItems = [
  {
    name: 'Overview',
    path: '/',
    icon: LayoutDashboard,
    description: 'Real-time metrics & instant trigger',
  },
  {
    name: 'Crops & Prices',
    path: '/prices',
    icon: Sprout,
    description: 'Commodities & market updates',
  },
  {
    name: 'Farmers Directory',
    path: '/farmers',
    icon: Users,
    description: 'SMS subscribers by district',
  },
  {
    name: 'SMS Broadcast Hub',
    path: '/sms',
    icon: Send,
    description: 'Twilio SMS dispatcher & simulator',
  },
];

// The default React logo SVG (the atom icon used in create-react-app / Vite scaffolds)
const ReactLogo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="-11.5 -10.23174 23 20.46348"
    className="w-7 h-7 react-logo-spin"
    aria-hidden="true"
  >
    <circle cx="0" cy="0" r="2.05" fill="#61dafb" />
    <g stroke="#61dafb" strokeWidth="1" fill="none">
      <ellipse rx="11" ry="4.2" />
      <ellipse rx="11" ry="4.2" transform="rotate(60)" />
      <ellipse rx="11" ry="4.2" transform="rotate(120)" />
    </g>
  </svg>
);

export const Sidebar = ({
  mobileOpen = false,
  onCloseMobile,
  backendConnected = true,
}: SidebarProps) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 left-0 z-50 h-full w-72 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Brand Header */}
          <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ReactLogo />
              <div>
                <h1 className="font-extrabold text-base tracking-tight text-white">
                  Agri-SMS
                </h1>
                <p className="text-xs text-slate-400 font-medium">Market Admin Portal</p>
              </div>
            </div>

            {/* Mobile Close Button */}
            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Main Menu
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `group flex items-center space-x-3.5 px-3.5 py-3 rounded-xl font-medium text-sm transition-colors duration-150 ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-600/90 to-emerald-700/90 text-white shadow-md shadow-emerald-950/50'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`w-5 h-5 shrink-0 ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="truncate">{item.name}</span>
                          {isActive && (
                            <ChevronRight className="w-4 h-4 text-emerald-200 shrink-0" />
                          )}
                        </div>
                        <p
                          className={`text-[11px] truncate mt-0.5 ${
                            isActive ? 'text-emerald-100/80' : 'text-slate-400'
                          }`}
                        >
                          {item.description}
                        </p>
                      </div>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* System Status Footer Card */}
          <div className="p-4 border-t border-slate-800/80">
            <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800/90 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      backendConnected
                        ? 'bg-emerald-500 shadow-sm shadow-emerald-500 animate-pulse'
                        : 'bg-amber-500'
                    }`}
                  />
                  <span className="font-semibold text-slate-200">FastAPI Service</span>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    backendConnected
                      ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60'
                      : 'bg-amber-950/80 text-amber-400 border-amber-800/60'
                  }`}
                >
                  {backendConnected ? 'ONLINE' : 'CONNECTING'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Backend connected via REST API on Port 8000
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;