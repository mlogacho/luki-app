import { APP_CONSTANTS } from '@/src/core/constants/app.constants';
import { AppError } from '@/src/core/errors/AppError';
import type { ApiResponse } from '@/src/core/types/api.types';
import { tokenStorage } from '@/src/modules/auth/infrastructure/token.storage';

const BASE_URL = process.env['EXPO_PUBLIC_API_URL'] ?? '';

class HttpClient {
  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      APP_CONSTANTS.API_TIMEOUT_MS
    );

    let response: Response;
    try {
      const token = await tokenStorage.getAccessToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      response = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        signal: controller.signal,
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      });
    } catch (err) {
      clearTimeout(timeoutId);
      throw new AppError('NETWORK_ERROR', 'Sin conexión a internet');
    } finally {
      clearTimeout(timeoutId);
    }

    if (response.status === 401) {
      throw new AppError(
        'AUTH_TOKEN_EXPIRED',
        'La sesión ha expirado. Por favor inicia sesión nuevamente.',
        401
      );
    }

    if (response.status === 403) {
      throw new AppError(
        'AUTH_UNAUTHORIZED',
        'No tienes permisos para realizar esta acción.',
        403
      );
    }

    if (!response.ok) {
      let errorMessage = 'Ha ocurrido un error inesperado.';
      try {
        const errBody = (await response.json()) as { message?: string };
        if (errBody.message) errorMessage = errBody.message;
      } catch {
        // ignore parse errors
      }
      throw new AppError('UNKNOWN_ERROR', errorMessage, response.status);
    }

    // Handle empty responses (e.g. 204 No Content)
    if (response.status === 204) {
      return undefined as unknown as T;
    }

    const json = (await response.json()) as ApiResponse<T>;
    return json.data;
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>('GET', path);
  }

  post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>('POST', path, body);
  }

  put<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>('PUT', path, body);
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>('DELETE', path);
  }
}

export const httpClient = new HttpClient();
