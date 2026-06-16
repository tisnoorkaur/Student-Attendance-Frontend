import { create } from 'zustand';
import { apiFetch } from '../services/api';

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('auth_token') || null,
  isAuthenticated: !!localStorage.getItem('auth_token'),
  isChecking: true,

  login: async (username, password) => {
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      const { token, user } = res;
      localStorage.setItem('auth_token', token);
      set({ token, user, isAuthenticated: true });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    set({ token: null, user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      set({ user: null, isAuthenticated: false, isChecking: false });
      return;
    }

    try {
      const user = await apiFetch('/api/auth/me');
      set({ user, isAuthenticated: true, isChecking: false });
    } catch (err) {
      localStorage.removeItem('auth_token');
      set({ token: null, user: null, isAuthenticated: false, isChecking: false });
    }
  },
}));

export default useAuthStore;
