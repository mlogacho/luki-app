import { authApi } from '@/src/modules/auth/infrastructure/auth.api';
import { tokenStorage } from '@/src/modules/auth/infrastructure/token.storage';

export async function logoutUseCase(): Promise<void> {
  const refreshToken = await tokenStorage.getRefreshToken();

  // Best-effort: notify server about logout, don't block on failure
  if (refreshToken) {
    try {
      await authApi.logout(refreshToken);
    } catch {
      // Intentionally ignore server errors during logout
    }
  }

  await tokenStorage.clearTokens();
  await tokenStorage.clearUser();
}
