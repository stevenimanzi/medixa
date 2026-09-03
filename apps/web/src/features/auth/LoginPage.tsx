import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import api from '../../lib/api';
import { useAuthStore } from './store';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      const response = await api.post('/auth/login', data);
      setAuth(response.data.token, response.data.user);

      // Route brand new accounts through onboarding first.
      try {
        const [pharmacyRes, branchesRes] = await Promise.all([
          api.get('/pharmacy'),
          api.get('/branches'),
        ]);
        const hasPharmacy = !!pharmacyRes.data?.name;
        const hasBranch = Array.isArray(branchesRes.data) && branchesRes.data.length > 0;
        navigate(hasPharmacy && hasBranch ? '/dashboard' : '/onboarding');
      } catch {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-slate-50 overflow-hidden font-sans">


      <div className="z-10 w-full max-w-[400px] p-8 bg-white rounded-3xl shadow-sm border border-slate-100">
        
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white mb-4 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 2a2 2 0 0 0-2 2v5H4a2 2 0 0 0-2 2v2c0 1.1.9 2 2 2h5v5c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2v-5h5a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-5V4a2 2 0 0 0-2-2h-2z"/></svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Welcome to Medixa</h2>
          <p className="text-sm text-slate-500 mt-2">Log in to manage your pharmacy</p>
        </div>

        {error && <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Email address</label>
            <input
              type="email"
              placeholder="Enter your email address"
              {...register('email')}
              className={`w-full px-4 py-2.5 text-sm transition-colors bg-white border rounded-lg outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-200'}`}
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <a href="#" className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors">Forgot password?</a>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                {...register('password')}
                className={`w-full px-4 py-2.5 text-sm transition-colors bg-white border rounded-lg outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 pr-10 ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-200'}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center items-center py-2.5 px-4 text-sm font-medium text-white transition-colors bg-slate-900 rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
}
