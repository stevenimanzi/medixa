import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Plus, Edit2, Trash2, X } from 'lucide-react';
import api from '../../lib/api';

interface Branch {
  id: number;
  name: string;
  location: string | null;
  phone: string | null;
  is_active: boolean;
}

export default function BranchesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    phone: '',
    is_active: true
  });

  const { data: branches, isLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const res = await api.get('/branches');
      return res.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (payload: typeof formData) => {
      const res = await api.post('/branches', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      handleCloseModal();
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number, payload: typeof formData }) => {
      const res = await api.put(`/branches/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      handleCloseModal();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/branches/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
    }
  });

  const handleOpenModal = (branch?: Branch) => {
    if (branch) {
      setEditingBranch(branch);
      setFormData({
        name: branch.name,
        location: branch.location || '',
        phone: branch.phone || '',
        is_active: branch.is_active
      });
    } else {
      setEditingBranch(null);
      setFormData({ name: '', location: '', phone: '', is_active: true });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBranch(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBranch) {
      updateMutation.mutate({ id: editingBranch.id, payload: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this branch?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="text-blue-600" /> Pharmacy Branches
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage all your physical branch locations.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2"
        >
          <Plus size={18} /> Add New Branch
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches?.map((branch: Branch) => (
          <div key={branch.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-slate-900">{branch.name}</h3>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${branch.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                  {branch.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-start gap-2">
                  <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
                  <span>{branch.location || 'Location not specified'}</span>
                </div>
                {branch.phone && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 shrink-0">📞</span>
                    <span>{branch.phone}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => handleOpenModal(branch)}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit2 size={16} />
              </button>
              <button 
                onClick={() => handleDelete(branch.id)}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        
        {branches?.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
            <MapPin size={48} className="mx-auto mb-3 text-slate-300" />
            <p className="font-medium text-slate-500">No branches found</p>
            <p className="text-sm mt-1">Click "Add New Branch" to create your first location.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                {editingBranch ? 'Edit Branch' : 'Add New Branch'}
              </h2>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Branch Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                    placeholder="e.g. Downtown Branch"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                  <input 
                    type="text" 
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                    placeholder="e.g. 123 Main St, Kigali"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                    placeholder="e.g. +250 788 000 000"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox" 
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-slate-700">Active Branch</label>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all disabled:opacity-70 flex items-center gap-2"
                >
                  {(createMutation.isPending || updateMutation.isPending) && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  {editingBranch ? 'Update Branch' : 'Create Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
