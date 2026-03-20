import { httpClient } from '@/src/shared/api/httpClient';
import type { User, CreateUserInput, UpdateUserInput } from '@/src/core/types/user.types';

export const usersApi = {
  /**
   * Create a new user. The backend will:
   * 1. Generate a temporary password
   * 2. Send a welcome email with credentials to the user's email
   * 3. Set mustChangePassword = true on the created user
   */
  createUser: (input: CreateUserInput): Promise<User> =>
    httpClient.post<User>('/users', input),

  getUsers: (): Promise<User[]> =>
    httpClient.get<User[]>('/users'),

  getUserById: (id: string): Promise<User> =>
    httpClient.get<User>(`/users/${id}`),

  updateUser: (id: string, input: UpdateUserInput): Promise<User> =>
    httpClient.put<User>(`/users/${id}`, input),

  deleteUser: (id: string): Promise<void> =>
    httpClient.delete<void>(`/users/${id}`),

  /**
   * Re-send the welcome email with a new temporary password to the user.
   */
  resendWelcomeEmail: (id: string): Promise<void> =>
    httpClient.post<void>(`/users/${id}/resend-welcome`, {}),
};
