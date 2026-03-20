import type { Profile } from '@/src/core/types/profile.types';

/**
 * Domain entity helper for Profile.
 */
export function isKidsProfile(profile: Profile): boolean {
  return profile.isKids;
}

export function profileRequiresPin(profile: Profile): boolean {
  return profile.hasPin;
}
