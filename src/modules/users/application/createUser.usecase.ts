import { usersApi } from '@/src/modules/users/infrastructure/users.api';
import { AppError } from '@/src/core/errors/AppError';
import { isValidEmail } from '@/src/core/utils/validation.utils';
import type { User, CreateUserInput } from '@/src/core/types/user.types';

/**
 * Creates a new user and triggers the backend to send a welcome email
 * containing the generated temporary password.
 *
 * The backend is responsible for:
 * - Generating a secure temporary password
 * - Sending the welcome email with credentials
 * - Setting mustChangePassword = true on the new user
 */
export async function createUserUseCase(input: CreateUserInput): Promise<User> {
  if (!input.name.trim()) {
    throw new AppError('UNKNOWN_ERROR', 'El nombre es requerido');
  }

  if (!isValidEmail(input.email)) {
    throw new AppError('UNKNOWN_ERROR', 'El correo electrónico no es válido');
  }

  if (!input.role) {
    throw new AppError('UNKNOWN_ERROR', 'El rol es requerido');
  }

  try {
    return await usersApi.createUser(input);
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError('NETWORK_ERROR', 'No se pudo crear el usuario. Verifica tu conexión.');
  }
}
