export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  intervalDays: number;
  maxProfiles: number;
  maxDevices: number;
  channelAccess: 'all' | string[]; // 'all' or list of channelIds
  qualityAccess: 'SD' | 'HD' | '4K';
  isActive: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  plan: Plan;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
}
