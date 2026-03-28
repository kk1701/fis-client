import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser, AccountStatus } from '../types';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  status: AccountStatus | null;

  setAuth: (token: string, user: AuthUser, status: AccountStatus) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      status: null,

      setAuth: (token, user, status) => {
        localStorage.setItem('access_token', token);
        set({ token, user, status });
      },

      clearAuth: () => {
        localStorage.removeItem('access_token');
        set({ token: null, user: null, status: null });
      },

      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'fis-auth', // persists to localStorage
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        status: state.status,
      }),
    }
  )
);