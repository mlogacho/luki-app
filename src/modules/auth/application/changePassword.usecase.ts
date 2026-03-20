import { authApi } from '@/src/modules/auth/infrastructure/auth.api';
import { tokenStorage } from '@/src/modules/auth/infrastructure/token.storage';
import { AppError } from '@/src/core/errors/AppError';

interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export async function changePasswordUseCase(
  input: ChangePasswordInput
): Promise<void> {
  if (input.newPassword.length < 6) {
    throw new AppError(
      'AUTH_INVALID_CREDENTIALS',
      'La nueva contraseña debe tener al menos 6 caracteres'
    );
  }

  if (input.currentPassword === input.newPassword) {
    throw new AppError(
      'AUTH_INVALID_CREDENTIALS',
      'La nueva contraseña debe ser diferente a la actual'
    );
  }

  try {
    await authApi.changePassword({
      currentPassword: input.currentPassword,
      newPassword: input.newPassword,
    });

    // Update stored user to clear the mustChangePassword flag
    const user = await tokenStorage.getUser();
    if (user) {
      await tokenStorage.saveUser({ ...user, mustChangePassword: false });
    }
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(
      'UNKNOWN_ERROR',
      'No se pudo cambiar la contraseña. Intenta de nuevo.'
    );
  }
}
