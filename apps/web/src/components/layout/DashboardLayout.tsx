import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  Home, 
  ShoppingCart, 
  Package, 
  Users, 
  BarChart2, 
  Settings, 
  LogOut,
  Bell,
  Search,
  Building2,
  Store,
  MapPin,
  CreditCard,
  MonitorPlay
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
  const { user, logout } = useAuthStore();

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

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* Sidebar */}
      <aside className="w-64 bg-slate-50 border-r border-slate-200 flex-col hidden md:flex overflow-y-auto">
        <div className="p-6 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <Building2 size={18} />
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
      <div className="flex-1 flex flex-col min-w-0 bg-white shadow-sm ring-1 ring-slate-100 m-2 rounded-2xl overflow-hidden">
        
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-slate-100 bg-white relative z-10">
          
          <div className="flex items-center flex-1">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search products, orders, or customers..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchActive(true)}
                onBlur={() => setTimeout(() => setIsSearchActive(false), 200)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50/50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-300 transition-all"
              />
              {isSearchActive && searchQuery.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-100 p-2 z-50">
                   <div className="text-sm text-slate-500 p-3">Searching for "{searchQuery}"...</div>
                   <div className="text-xs text-slate-400 px-3 pb-2">(Search endpoint not yet implemented)</div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6 ml-4">
            <div className="relative">
              <button 
                onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }}
                className="text-slate-400 hover:text-slate-600 transition-colors relative"
              >
                <Bell size={20} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              
              {isNotifOpen && (
                <div className="absolute top-full right-0 mt-3 w-80 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-50">
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
            
            <div className="relative border-l border-slate-200 pl-6">
              <button 
                onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}
                className="flex items-center gap-3 text-left focus:outline-none"
              >
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-sm overflow-hidden">
                   <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random`} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-semibold text-slate-900">{user?.name || 'User'}</div>
                  <div className="text-xs text-slate-500">{user?.is_company_owner ? 'Store owner' : 'Staff'}</div>
                </div>
              </button>

              {isProfileOpen && (
                <div className="absolute top-full right-0 mt-3 w-48 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-50">
                  <div className="py-1">
                    <button onClick={() => navigate('/settings')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                      <Settings size={16} className="text-slate-400" />
                      Settings
                    </button>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                      <LogOut size={16} className="text-red-400" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50/30 relative">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
