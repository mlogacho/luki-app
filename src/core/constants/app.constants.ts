export const APP_CONSTANTS = {
  MAX_PROFILES_PER_ACCOUNT: 5,
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 5000,
  TOKEN_REFRESH_THRESHOLD_MS: 5 * 60 * 1000, // 5 min before expiry
  HLS_MAX_BUFFER_LENGTH: 30,
  HLS_MAX_MAX_BUFFER_LENGTH: 60,
  API_TIMEOUT_MS: 10000,
} as const;

export const ROUTES = {
  LOGIN: '/(auth)/login',
  SELECT_PROFILE: '/(app)/select-profile',
  HOME: '/(app)/(tabs)/home',
  PLAYER: '/(app)/player/[id]',
  ADMIN: '/admin',
  UPGRADE: '/(app)/upgrade',
} as const;
