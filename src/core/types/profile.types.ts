export interface Profile {
  id: string;
  userId: string;
  name: string;
  avatarUrl?: string;
  hasPin: boolean;
  isKids: boolean;
  createdAt: string;
}
