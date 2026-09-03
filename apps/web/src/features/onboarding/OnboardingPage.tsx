import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Building,
  Hash,
  MapPin,
  Phone,
  Mail,
  Store,
  ArrowRight,
  Check,
  Loader2,
  LogOut
} from 'lucide-react';
import api from '../../lib/api';
import { useAuthStore } from '../auth/store';

const STEPS = [
  { id: 1, label: 'Pharmacy details' },
  { id: 2, label: 'First branch' },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { logout } = useAuthStore();

  const [step, setStep] = useState(1);

  const [pharmacyForm, setPharmacyForm] = useState({
    name: '',
    tin: '',
    location: '',
    phone: '',
    email: '',
  });

  const [branchForm, setBranchForm] = useState({
    name: '',
    location: '',
    phone: '',
  });

  const [error, setError] = useState('');

  // Prefill from whatever already exists, and skip ahead if a step is already done.
  const { data: pharmacy } = useQuery({
    queryKey: ['pharmacy'],
    queryFn: async () => (await api.get('/pharmacy')).data,
  });
  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => (await api.get('/branches')).data,
  });

  useEffect(() => {
    if (pharmacy) {
      setPharmacyForm((prev) => ({
        name: pharmacy.name || prev.name,
        tin: pharmacy.tin || prev.tin,
        location: pharmacy.location || prev.location,
        phone: pharmacy.phone || prev.phone,
        email: pharmacy.email || prev.email,
      }));
      if (pharmacy.name && step === 1) setStep(2);
    }
  }, [pharmacy]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Setup is fully complete elsewhere -> get out of the way.
    if (pharmacy?.name && Array.isArray(branches) && branches.length > 0) {
      navigate('/dashboard', { replace: true });
    }
  }, [pharmacy, branches, navigate]);

  const savePharmacy = useMutation({
    mutationFn: async (payload: typeof pharmacyForm) => (await api.put('/pharmacy', payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacy'] });
      setError('');
      setStep(2);
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Could not save pharmacy details.'),
  });

  const saveBranch = useMutation({
    mutationFn: async (payload: typeof branchForm) =>
      (await api.post('/branches', { ...payload, is_active: true })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      setError('');
      navigate('/dashboard', { replace: true });
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Could not create the branch.'),
  });

  const handleSignOut = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error(e);
    } finally {
      logout();
      navigate('/login');
    }
  };

  const inputClass =
    'w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none';

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      <header className="flex items-center justify-between px-6 py-5 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <Store size={18} />
          </div>
          <span className="font-bold text-lg tracking-tight">Medixa</span>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <LogOut size={16} /> Sign out
        </button>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto px-6 py-12">
        <div className="mb-2 text-sm font-medium text-blue-600">Getting started</div>
        <h1 className="text-2xl font-bold text-slate-900">Let's set up your pharmacy</h1>
        <p className="text-slate-500 mt-1">
          Just two quick steps. These details appear on your receipts and organise your stock by branch.
        </p>

        {/* Stepper */}
        <div className="flex items-center gap-4 mt-8 mb-8">
          {STEPS.map((s, i) => {
            const done = step > s.id;
            const active = step === s.id;
            return (
              <React.Fragment key={s.id}>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${
                      done
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : active
                        ? 'bg-white border-blue-600 text-blue-600'
                        : 'bg-white border-slate-200 text-slate-400'
                    }`}
                  >
                    {done ? <Check size={16} /> : s.id}
                  </div>
                  <span className={`text-sm font-medium ${active || done ? 'text-slate-900' : 'text-slate-400'}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && <div className="flex-1 h-px bg-slate-200" />}
              </React.Fragment>
            );
          })}
        </div>

        {error && <div className="p-3 mb-6 text-sm text-red-600 bg-red-50 rounded-xl">{error}</div>}

        {step === 1 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              savePharmacy.mutate(pharmacyForm);
            }}
            className="bg-white border border-slate-200 rounded-3xl shadow-sm p-8 space-y-6"
          >
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <Building size={16} className="text-slate-400" /> Business name <span className="text-red-500">*</span>
              </label>
              <input
                required
                value={pharmacyForm.name}
                onChange={(e) => setPharmacyForm({ ...pharmacyForm, name: e.target.value })}
                className={inputClass}
                placeholder="e.g. Medixa Pharmacy Ltd"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <Hash size={16} className="text-slate-400" /> Tax ID (TIN)
                </label>
                <input
                  value={pharmacyForm.tin}
                  onChange={(e) => setPharmacyForm({ ...pharmacyForm, tin: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. 102938475"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <Phone size={16} className="text-slate-400" /> Phone number
                </label>
                <input
                  value={pharmacyForm.phone}
                  onChange={(e) => setPharmacyForm({ ...pharmacyForm, phone: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. +250 788 123 456"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <MapPin size={16} className="text-slate-400" /> Physical location
              </label>
              <input
                value={pharmacyForm.location}
                onChange={(e) => setPharmacyForm({ ...pharmacyForm, location: e.target.value })}
                className={inputClass}
                placeholder="e.g. KG 11 Ave, Kigali, Rwanda"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <Mail size={16} className="text-slate-400" /> Email address
              </label>
              <input
                type="email"
                value={pharmacyForm.email}
                onChange={(e) => setPharmacyForm({ ...pharmacyForm, email: e.target.value })}
                className={inputClass}
                placeholder="e.g. info@medixapharmacy.com"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={savePharmacy.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 disabled:opacity-70"
              >
                {savePharmacy.isPending ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                Continue
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveBranch.mutate(branchForm);
            }}
            className="bg-white border border-slate-200 rounded-3xl shadow-sm p-8 space-y-6"
          >
            <p className="text-sm text-slate-500 bg-slate-50 border border-slate-100 rounded-xl p-4">
              Add at least one branch. This is where your stock and sales are tracked. You can add more later.
            </p>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <Store size={16} className="text-slate-400" /> Branch name <span className="text-red-500">*</span>
              </label>
              <input
                required
                value={branchForm.name}
                onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                className={inputClass}
                placeholder="e.g. Main Branch"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <MapPin size={16} className="text-slate-400" /> Location
                </label>
                <input
                  value={branchForm.location}
                  onChange={(e) => setBranchForm({ ...branchForm, location: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. 123 Main St, Kigali"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <Phone size={16} className="text-slate-400" /> Phone number
                </label>
                <input
                  value={branchForm.phone}
                  onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. +250 788 000 000"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={saveBranch.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 disabled:opacity-70"
              >
                {saveBranch.isPending ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                Finish setup
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
