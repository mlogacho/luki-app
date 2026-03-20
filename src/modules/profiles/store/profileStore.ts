import { create } from 'zustand';
import {
  fetchProfilesUseCase,
  selectProfileUseCase,
} from '@/src/modules/profiles/application/profiles.usecase';
import { AppError } from '@/src/core/errors/AppError';
import type { Profile } from '@/src/core/types/profile.types';

interface ProfileState {
  profiles: Profile[];
  activeProfile: Profile | null;
  isLoading: boolean;
  error: string | null;

  fetchProfiles: () => Promise<void>;
  selectProfile: (profileId: string, pin?: string) => Promise<void>;
  clearProfiles: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profiles: [],
  activeProfile: null,
  isLoading: false,
  error: null,

  fetchProfiles: async () => {
    set({ isLoading: true, error: null });
    try {
      const profiles = await fetchProfilesUseCase();
      set({ profiles, isLoading: false });
    } catch (err) {
      const message =
        err instanceof AppError
          ? err.message
          : 'Error al cargar los perfiles';
      set({ isLoading: false, error: message });
    }
  },

  selectProfile: async (profileId: string, pin?: string) => {
    set({ isLoading: true, error: null });
    try {
      const profile = await selectProfileUseCase(profileId, pin);
      set({ activeProfile: profile, isLoading: false });
    } catch (err) {
      const message =
        err instanceof AppError ? err.message : 'Error al seleccionar perfil';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  clearProfiles: () =>
    set({ profiles: [], activeProfile: null, error: null }),
}));
