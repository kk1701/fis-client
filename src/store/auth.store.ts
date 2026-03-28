import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser, AccountStatus } from '../types';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  status: AccountStatus | null;
  name: string | null;

  setAuth: (token: string, user: AuthUser, status: AccountStatus, name: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      status: null,
      name: null,

      setAuth: (token, user, status, name) => {
        localStorage.setItem('access_token', token);
        set({ token, user, status, name });
      },

      clearAuth: () => {
        localStorage.removeItem('access_token');
        set({ token: null, user: null, status: null, name: null });
      },

      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'fis-auth',
    }
  )
);