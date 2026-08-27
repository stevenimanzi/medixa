import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  Home, 
  ShoppingCart, 
  Package, 
  Users, 
  FileText, 
  BarChart2, 
  Megaphone, 
  Tag, 
  Settings, 
  LogOut,
  Bell,
  Search,
  Building2
} from 'lucide-react';
import { useAuthStore } from '../../features/auth/store';
import api from '../../lib/api';

const mainNavigation = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Content', href: '/content', icon: FileText },
  { name: 'Finances', href: '/finances', icon: BarChart2 },
  { name: 'Marketing', href: '/marketing', icon: Megaphone },
  { name: 'Discounts', href: '/discounts', icon: Tag },
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
                  <item.icon size={18} className={({ isActive }: any) => isActive ? 'text-blue-600' : 'text-slate-400'} />
                  {item.name}
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
        <header className="h-16 flex items-center justify-between px-8 border-b border-slate-100 bg-white">
          
          <div className="flex items-center flex-1">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search products, orders, or customers..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50/50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-300 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 ml-4">
            <button className="text-slate-400 hover:text-slate-600 transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-sm overflow-hidden">
                 {/* Dummy Avatar Image */}
                 <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random`} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-semibold text-slate-900">{user?.name || 'User'}</div>
                <div className="text-xs text-slate-500">{user?.is_company_owner ? 'Store owner' : 'Staff'}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50/30">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
