export type UserRole = 'superadmin' | 'admin' | 'reseller' | 'subscriber' | 'guest';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  planId: string;
  activeProfileId?: string;
  createdAt: string;
  /** True when the user is logging in for the first time and must change their password */
  mustChangePassword?: boolean;
}

/** Fields required to create a new user via the admin panel */
export interface CreateUserInput {
  name: string;
  email: string;
  role: UserRole;
  planId: string;
}

/** Fields that can be updated on an existing user */
export interface UpdateUserInput {
  name?: string;
  role?: UserRole;
  planId?: string;
}
