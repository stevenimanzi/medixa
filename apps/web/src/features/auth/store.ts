import { create } from 'zustand';

interface AuthState {
  token: string | null;
  user: any | null;
  setAuth: (token: string, user: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('auth_token') || null,
  user: null, 
  setAuth: (token, user) => {
    localStorage.setItem('auth_token', token);
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem('auth_token');
    set({ token: null, user: null });
  },
}));
