import { profilesApi } from '@/src/modules/profiles/infrastructure/profiles.api';
import type { Profile } from '@/src/core/types/profile.types';

export async function fetchProfilesUseCase(): Promise<Profile[]> {
  return profilesApi.getProfiles();
}

export async function selectProfileUseCase(
  profileId: string,
  pin?: string
): Promise<Profile> {
  return profilesApi.selectProfile(profileId, pin);
}
