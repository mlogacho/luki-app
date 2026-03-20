import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '@/src/core/types/user.types';

const KEYS = {
  ACCESS_TOKEN: 'luki_access_token',
  REFRESH_TOKEN: 'luki_refresh_token',
  USER: 'luki_user',
} as const;

export const tokenStorage = {
  saveTokens: async (access: string, refresh: string): Promise<void> => {
    await Promise.all([
      SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, access),
      SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, refresh),
    ]);
  },

  getAccessToken: async (): Promise<string | null> => {
    return SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);
  },

  getRefreshToken: async (): Promise<string | null> => {
    return SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);
  },

  clearTokens: async (): Promise<void> => {
    await Promise.all([
      SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN),
      SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN),
    ]);
  },

  saveUser: async (user: User): Promise<void> => {
    await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
  },

  getUser: async (): Promise<User | null> => {
    const raw = await AsyncStorage.getItem(KEYS.USER);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  },

  clearUser: async (): Promise<void> => {
    await AsyncStorage.removeItem(KEYS.USER);
  },
};
