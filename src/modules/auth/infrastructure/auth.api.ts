import { httpClient } from '@/src/shared/api/httpClient';
import type { User } from '@/src/core/types/user.types';

interface LoginRequest {
  email: string;
  password: string;
  deviceId: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const authApi = {
  login: (req: LoginRequest): Promise<LoginResponse> =>
    httpClient.post<LoginResponse>('/auth/login', req),

  logout: (refreshToken: string): Promise<void> =>
    httpClient.post<void>('/auth/logout', { refreshToken }),

  refreshToken: (token: string): Promise<RefreshResponse> =>
    httpClient.post<RefreshResponse>('/auth/refresh', { refreshToken: token }),

  getMe: (): Promise<User> =>
    httpClient.get<User>('/auth/me'),

  changePassword: (req: ChangePasswordRequest): Promise<void> =>
    httpClient.post<void>('/auth/change-password', req),
};
