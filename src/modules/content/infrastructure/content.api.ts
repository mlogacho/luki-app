import { httpClient } from '@/src/shared/api/httpClient';
import type { Channel } from '@/src/core/types/channel.types';

export const contentApi = {
  getChannels: (): Promise<Channel[]> =>
    httpClient.get<Channel[]>('/channels'),

  getChannelById: (id: string): Promise<Channel> =>
    httpClient.get<Channel>(`/channels/${id}`),
};
