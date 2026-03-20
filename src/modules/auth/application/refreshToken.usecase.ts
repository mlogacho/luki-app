import { authApi } from '@/src/modules/auth/infrastructure/auth.api';
import { tokenStorage } from '@/src/modules/auth/infrastructure/token.storage';
import { AppError } from '@/src/core/errors/AppError';

export async function refreshTokenUseCase(): Promise<string> {
  const refreshToken = await tokenStorage.getRefreshToken();

  if (!refreshToken) {
    throw new AppError(
      'AUTH_TOKEN_EXPIRED',
      'La sesión ha expirado. Por favor inicia sesión nuevamente.'
    );
  }

  const response = await authApi.refreshToken(refreshToken);

  await tokenStorage.saveTokens(response.accessToken, response.refreshToken);

  return response.accessToken;
}
