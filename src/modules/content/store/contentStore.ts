import { create } from 'zustand';
import { contentApi } from '@/src/modules/content/infrastructure/content.api';
import { AppError } from '@/src/core/errors/AppError';
import type { Channel } from '@/src/core/types/channel.types';

interface ContentState {
  channels: Channel[];
  featuredChannel: Channel | null;
  isLoading: boolean;
  error: string | null;

  fetchChannels: () => Promise<void>;
  getChannelById: (id: string) => Channel | undefined;
  clearContent: () => void;
}

export const useContentStore = create<ContentState>((set, get) => ({
  channels: [],
  featuredChannel: null,
  isLoading: false,
  error: null,

  fetchChannels: async () => {
    set({ isLoading: true, error: null });
    try {
      const channels = await contentApi.getChannels();
      const featuredChannel = channels.find((ch) => ch.isActive) ?? null;
      set({ channels, featuredChannel, isLoading: false });
    } catch (err) {
      const message =
        err instanceof AppError
          ? err.message
          : 'Error al cargar los canales';
      set({ isLoading: false, error: message });
    }
  },

  getChannelById: (id: string) => {
    return get().channels.find((ch) => ch.id === id);
  },

  clearContent: () =>
    set({ channels: [], featuredChannel: null, error: null }),
}));
