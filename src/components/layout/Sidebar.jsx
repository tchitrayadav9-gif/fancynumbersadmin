import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  Hash,
  CheckCircle2,
  Clock,
  BadgeDollarSign,
  TrendingUp,
  Settings,
  LogOut,
  PhoneCall,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Add Phone Number', path: '/add-number', icon: PlusCircle },
  { name: 'All Numbers', path: '/numbers', icon: Hash },
  { name: 'Available Numbers', path: '/numbers/available', icon: CheckCircle2 },
  { name: 'Reserved Numbers', path: '/numbers/reserved', icon: Clock },
  { name: 'Sold Numbers', path: '/numbers/sold', icon: BadgeDollarSign },
  { name: 'Sales History', path: '/sales-history', icon: TrendingUp },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar({ isOpen, onClose }) {
  const { logout, admin } = useAuth();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-xs tracking-wide text-white">RAJAHMUNDRY FANCY NUMBERS</h1>
              <p className="text-[10px] text-emerald-400 font-medium">Admin Management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Business Support & Account footer */}
        <div className="p-3 border-t border-slate-800 space-y-3">
          <div className="bg-slate-800/70 rounded-lg p-3 text-xs">
            <p className="text-slate-400 font-medium">Business Support</p>
            <p className="text-emerald-400 font-semibold mt-0.5">📞 {admin?.supportContact || '8499955543'}</p>
            <p className="text-slate-400 truncate mt-1 text-[11px]">{admin?.email}</p>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
