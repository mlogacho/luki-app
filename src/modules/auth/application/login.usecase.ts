import Constants from 'expo-constants';
import { authApi } from '@/src/modules/auth/infrastructure/auth.api';
import { tokenStorage } from '@/src/modules/auth/infrastructure/token.storage';
import { AppError } from '@/src/core/errors/AppError';
import type { User } from '@/src/core/types/user.types';

interface LoginInput {
  email: string;
  password: string;
}

interface LoginResult {
  user: User;
}

function generateDeviceId(): string {
  // expo-constants sessionId provides a unique identifier per session
  const sessionId = String(Constants.sessionId ?? '');
  if (sessionId) return sessionId;
  return `device-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function loginUseCase(input: LoginInput): Promise<LoginResult> {
  const deviceId = generateDeviceId();

  try {
    const response = await authApi.login({
      email: input.email,
      password: input.password,
      deviceId,
    });

    await tokenStorage.saveTokens(response.accessToken, response.refreshToken);
    await tokenStorage.saveUser(response.user);

    return { user: response.user };
  } catch (err) {
    if (err instanceof AppError) {
      if (err.statusCode === 401) {
        throw new AppError('AUTH_INVALID_CREDENTIALS', 'Credenciales incorrectas');
      }
      if (err.code === 'NETWORK_ERROR') {
        throw new AppError('NETWORK_ERROR', 'Sin conexión a internet');
      }
      throw err;
    }
    throw new AppError('UNKNOWN_ERROR', 'Ha ocurrido un error inesperado');
  }
}
