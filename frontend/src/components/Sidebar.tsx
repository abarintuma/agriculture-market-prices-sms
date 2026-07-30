'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Sprout, 
  Users, 
  Send, 
  TrendingUp,
  Activity
} from 'lucide-react';

const navigation = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Crops & Prices', href: '/prices', icon: Sprout },
  { name: 'Farmers', href: '/farmers', icon: Users },
  { name: 'SMS Broadcasts', href: '/sms', icon: Send },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col min-h-screen border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
        <div className="p-2 bg-emerald-600 rounded-lg text-white">
          <Sprout className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-white leading-none">Agri-SMS</h1>
          <span className="text-xs text-slate-400 font-medium">Market Admin</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Backend System Connection Status */}
      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/60 rounded-xl p-3 flex items-center space-x-3 border border-slate-700/50">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div className="text-xs">
            <p className="font-medium text-slate-200">FastAPI Backend</p>
            <p className="text-slate-400">Connected (Port 8000)</p>
          </div>
        </div>
      </div>
    </aside>
  );
}