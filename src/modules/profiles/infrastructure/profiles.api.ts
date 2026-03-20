import { httpClient } from '@/src/shared/api/httpClient';
import type { Profile } from '@/src/core/types/profile.types';

export const profilesApi = {
  getProfiles: (): Promise<Profile[]> =>
    httpClient.get<Profile[]>('/profiles'),

  selectProfile: (profileId: string, pin?: string): Promise<Profile> =>
    httpClient.post<Profile>('/profiles/select', { profileId, pin }),
};
