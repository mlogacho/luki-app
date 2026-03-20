import { create } from 'zustand';
import { httpClient } from '@/src/shared/api/httpClient';
import type { Channel } from '@/src/core/types/channel.types';

export type { Channel };

interface AdminChannelInput {
  title: string;
  videoUrl: string;
  imageUrl: string;
  description: string;
  tags: string[];
}

interface AdminState {
  channels: Channel[];
  _hasHydrated: boolean;

  init: () => Promise<void>;
  addChannel: (data: AdminChannelInput) => void;
  updateChannel: (id: string, data: Partial<AdminChannelInput>) => void;
  deleteChannel: (id: string) => void;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  channels: [],
  _hasHydrated: false,

  init: async () => {
    if (get()._hasHydrated) return;
    try {
      const channels = await httpClient.get<Channel[]>('/channels');
      set({ channels, _hasHydrated: true });
    } catch {
      set({ _hasHydrated: true });
    }
  },

  addChannel: (data: AdminChannelInput) => {
    const channel: Channel = {
      ...data,
      id: `ch-${Date.now()}`,
      category: '',
      isActive: true,
      allowedPlanIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({ channels: [channel, ...state.channels] }));
    httpClient.post<Channel>('/channels', channel).catch(() => {
      // Optimistic update — server sync is best-effort
    });
  },

  updateChannel: (id: string, data: Partial<AdminChannelInput>) => {
    set((state) => ({
      channels: state.channels.map((ch) =>
        ch.id === id
          ? { ...ch, ...data, updatedAt: new Date().toISOString() }
          : ch
      ),
    }));
    httpClient.put<Channel>(`/channels/${id}`, data).catch(() => {});
  },

  deleteChannel: (id: string) => {
    set((state) => ({
      channels: state.channels.filter((ch) => ch.id !== id),
    }));
    httpClient.delete<void>(`/channels/${id}`).catch(() => {});
  },
}));


