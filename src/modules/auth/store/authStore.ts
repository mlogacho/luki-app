import { create } from 'zustand';
import { loginUseCase } from '@/src/modules/auth/application/login.usecase';
import { logoutUseCase } from '@/src/modules/auth/application/logout.usecase';
import { tokenStorage } from '@/src/modules/auth/infrastructure/token.storage';
import { AppError } from '@/src/core/errors/AppError';
import type { User } from '@/src/core/types/user.types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await loginUseCase({ email, password });
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      const message =
        err instanceof AppError
          ? err.message
          : 'Ha ocurrido un error inesperado';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await logoutUseCase();
    } catch {
      // Ensure local state is cleared even if logout call fails
    } finally {
      set({ user: null, isAuthenticated: false, isLoading: false, error: null });
    }
  },

  restoreSession: async () => {
    set({ isLoading: true });
    try {
      const [user, accessToken] = await Promise.all([
        tokenStorage.getUser(),
        tokenStorage.getAccessToken(),
      ]);

      if (user && accessToken) {
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        await tokenStorage.clearTokens();
        await tokenStorage.clearUser();
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
