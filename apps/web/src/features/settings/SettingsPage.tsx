import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Settings, User, Lock, Save, ShieldCheck } from 'lucide-react';
import api from '../../lib/api';
import { useAuthStore } from '../auth/store';

export default function SettingsPage() {
  const { setUser, user: cachedUser } = useAuthStore();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    current_password: '',
    new_password: ''
  });

  const { data: userProfile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await api.get('/profile');
      return res.data;
    }
  });

  useEffect(() => {
    if (userProfile) {
      setFormData(prev => ({
        ...prev,
        name: userProfile.name,
        email: userProfile.email,
      }));
    }
  }, [userProfile]);

  const updateMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.put('/profile', payload);
      return res.data;
    },
    onSuccess: (data) => {
      // Update local state and auth store
      setUser(data.user);
      setFormData(prev => ({ ...prev, current_password: '', new_password: '' }));
      alert('Profile updated successfully!');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to update profile');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      name: formData.name,
      email: formData.email
    };

    if (formData.new_password) {
      if (!formData.current_password) {
        alert('Please enter your current password to set a new one.');
        return;
      }
      payload.current_password = formData.current_password;
      payload.new_password = formData.new_password;
    }

    updateMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="text-blue-600" /> Account Settings
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage your personal profile and security preferences.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50 flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-3xl overflow-hidden shadow-inner ring-4 ring-white">
            {formData.name ? (
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random&size=128`} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User size={32} />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{userProfile?.name || 'User'}</h2>
            <p className="text-sm text-slate-500 mt-1">{userProfile?.email}</p>
            {userProfile?.is_company_owner && (
              <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
                <ShieldCheck size={12}/> Store Owner
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4 border-b border-slate-100 pb-2">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                <div className="relative">
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4 border-b border-slate-100 pb-2">Security</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="password" 
                    placeholder="Required if setting new password"
                    value={formData.current_password}
                    onChange={(e) => setFormData({...formData, current_password: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="password" 
                    placeholder="Leave blank to keep current"
                    value={formData.new_password}
                    onChange={(e) => setFormData({...formData, new_password: e.target.value})}
                    minLength={8}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2 ml-1">Must be at least 8 characters long.</p>
              </div>
            </div>
          </section>

          <div className="pt-6 border-t border-slate-100">
            <button 
              type="submit"
              disabled={updateMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 disabled:opacity-70"
            >
              {updateMutation.isPending ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Save size={18} />
              )}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
