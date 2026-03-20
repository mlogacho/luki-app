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
}
