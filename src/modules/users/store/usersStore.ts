import { create } from 'zustand';
import { usersApi } from '@/src/modules/users/infrastructure/users.api';
import { createUserUseCase } from '@/src/modules/users/application/createUser.usecase';
import { AppError } from '@/src/core/errors/AppError';
import type { User, CreateUserInput, UpdateUserInput } from '@/src/core/types/user.types';

interface UsersState {
  users: User[];
  isLoading: boolean;
  error: string | null;

  fetchUsers: () => Promise<void>;
  createUser: (input: CreateUserInput) => Promise<User>;
  updateUser: (id: string, input: UpdateUserInput) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  resendWelcomeEmail: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useUsersStore = create<UsersState>((set, get) => ({
  users: [],
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const users = await usersApi.getUsers();
      set({ users, isLoading: false });
    } catch (err) {
      const message = err instanceof AppError ? err.message : 'Error al cargar usuarios';
      set({ isLoading: false, error: message });
    }
  },

  createUser: async (input: CreateUserInput) => {
    set({ isLoading: true, error: null });
    try {
      const user = await createUserUseCase(input);
      set((state) => ({ users: [user, ...state.users], isLoading: false }));
      return user;
    } catch (err) {
      const message = err instanceof AppError ? err.message : 'Error al crear el usuario';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  updateUser: async (id: string, input: UpdateUserInput) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await usersApi.updateUser(id, input);
      set((state) => ({
        users: state.users.map((u) => (u.id === id ? updated : u)),
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof AppError ? err.message : 'Error al actualizar el usuario';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  deleteUser: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await usersApi.deleteUser(id);
      set((state) => ({
        users: state.users.filter((u) => u.id !== id),
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof AppError ? err.message : 'Error al eliminar el usuario';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  resendWelcomeEmail: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await usersApi.resendWelcomeEmail(id);
      set({ isLoading: false });
    } catch (err) {
      const message = err instanceof AppError ? err.message : 'Error al reenviar el correo';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
