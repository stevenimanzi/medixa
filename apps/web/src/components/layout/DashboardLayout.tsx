import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Home,
  Package,
  Users,
  BarChart2,
  Settings,
  LogOut,
  Bell,
  MapPin,
  Store,
  CreditCard,
  MonitorPlay,
  UserCircle
} from 'lucide-react';
import { useAuthStore } from '../../features/auth/store';
import api from '../../lib/api';

const mainNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'POS (Point of Sale)', href: '/pos', icon: MonitorPlay },
  { name: 'Pharmacy Details', href: '/pharmacy', icon: Store },
  { name: 'Branches', href: '/branches', icon: MapPin },
  { name: 'Products & Stock', href: '/products', icon: Package },
  { name: 'Users & Staff', href: '/users', icon: Users },
  { name: 'Expenses', href: '/expenses', icon: CreditCard },
  { name: 'Reports', href: '/reports', icon: BarChart2 },
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error(e);
    } finally {
      logout();
      navigate('/login');
    }
  };

  // Onboarding gate: a brand new account has no pharmacy details and/or no branches yet.
  const { data: pharmacy, isLoading: loadingPharmacy, isError: pharmacyError } = useQuery({
    queryKey: ['pharmacy'],
    queryFn: async () => (await api.get('/pharmacy')).data,
  });
  const { data: branches, isLoading: loadingBranches, isError: branchesError } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => (await api.get('/branches')).data,
  });

  const gateReady = !loadingPharmacy && !loadingBranches && !pharmacyError && !branchesError;
  const setupIncomplete = gateReady && (!pharmacy?.name || !(Array.isArray(branches) && branches.length > 0));

  if (setupIncomplete) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="flex h-screen bg-white font-sans text-slate-900">

      {/* Sidebar */}
      <aside className="w-64 bg-slate-50 border-r border-slate-200 flex-col hidden md:flex overflow-y-auto">
        <div className="p-6 flex items-center gap-3">
          {/* Notifications sit in front of the logo */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="text-slate-400 hover:text-slate-600 transition-colors relative flex items-center"
              aria-label="Notifications"
            >
              <Bell size={20} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-50"></span>
            </button>

            {isNotifOpen && (
              <div className="absolute top-full left-0 mt-3 w-80 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-slate-100 font-semibold text-sm">Notifications</div>
                <div className="max-h-64 overflow-y-auto">
                  <div className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50">
                    <div className="text-sm font-medium text-slate-900">Low Stock Alert</div>
                    <div className="text-xs text-slate-500 mt-1">Paracetamol is running low (12 items left).</div>
                  </div>
                  <div className="px-4 py-3 hover:bg-slate-50 cursor-pointer">
                    <div className="text-sm font-medium text-slate-900">New Order</div>
                    <div className="text-xs text-slate-500 mt-1">Order #RCT-1041 was completed successfully.</div>
                  </div>
                </div>
                <div className="px-4 py-2 border-t border-slate-100 text-center bg-slate-50">
                  <button className="text-xs text-blue-600 font-medium hover:text-blue-700">Mark all as read</button>
                </div>
              </div>
            )}
          </div>
          <span className="font-bold text-lg tracking-tight">Medixa</span>
        </div>

        <nav className="flex-1 px-4 space-y-8 overflow-y-auto pb-4">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">Main</div>
            <div className="space-y-1">
              {mainNavigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-sm font-medium ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-100'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon size={18} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                      {item.name}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        </nav>

        <div className="p-4 mt-auto border-t border-slate-200 space-y-1">
          <NavLink
            to="/pharmacy"
            className="flex items-center gap-3 px-3 py-2 rounded-xl transition-colors text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100/50"
          >
            <UserCircle size={18} className="text-slate-400" />
            Profile
          </NavLink>
          <NavLink
            to="/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-xl transition-colors text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100/50"
          >
            <Settings size={18} className="text-slate-400" />
            Settings
          </NavLink>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut size={18} className="text-slate-400 hover:text-red-500" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0 bg-white overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 bg-slate-50/30 relative">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
