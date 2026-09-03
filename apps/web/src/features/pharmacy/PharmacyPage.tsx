import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Store, Building, MapPin, Phone, Mail, Hash, Save, CheckCircle2 } from 'lucide-react';
import api from '../../lib/api';

export default function PharmacyPage() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    tin: '',
    location: '',
    phone: '',
    email: '',
  });

  const [showSuccess, setShowSuccess] = useState(false);

  const { data: pharmacy, isLoading } = useQuery({
    queryKey: ['pharmacy'],
    queryFn: async () => {
      const res = await api.get('/pharmacy');
      return res.data;
    }
  });

  useEffect(() => {
    if (pharmacy) {
      setFormData({
        name: pharmacy.name || '',
        tin: pharmacy.tin || '',
        location: pharmacy.location || '',
        phone: pharmacy.phone || '',
        email: pharmacy.email || '',
      });
    }
  }, [pharmacy]);

  const updateMutation = useMutation({
    mutationFn: async (payload: typeof formData) => {
      const res = await api.put('/pharmacy', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacy'] });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    },
    onError: (error) => {
      alert('Failed to update pharmacy details.');
      console.error(error);
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Pharmacy Details</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-8 space-y-6">
          <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-4">Business Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <Building size={16} className="text-slate-400" /> Business Name <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                placeholder="e.g. Medixa Pharmacy Ltd"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <Hash size={16} className="text-slate-400" /> Tax Identification Number (TIN)
              </label>
              <input 
                type="text" 
                name="tin"
                value={formData.tin}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                placeholder="e.g. 102938475"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <MapPin size={16} className="text-slate-400" /> Physical Location
              </label>
              <input 
                type="text" 
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                placeholder="e.g. KG 11 Ave, Kigali, Rwanda"
              />
            </div>
          </div>

          <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-4 pt-4">Contact Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <Phone size={16} className="text-slate-400" /> Phone Number
              </label>
              <input 
                type="tel" 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                placeholder="e.g. +250 788 123 456"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <Mail size={16} className="text-slate-400" /> Email Address
              </label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                placeholder="e.g. info@medixapharmacy.com"
              />
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-4">
          {showSuccess && (
             <div className="text-green-600 font-medium flex items-center gap-2 text-sm mr-4 animate-in fade-in slide-in-from-right-4">
                <CheckCircle2 size={18} /> Settings saved successfully
             </div>
          )}
          <button 
            type="submit"
            disabled={updateMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 disabled:opacity-70"
          >
            {updateMutation.isPending ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Save size={18} />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
