import type { Channel } from '@/src/core/types/channel.types';
import type { Subscription } from '@/src/core/types/plan.types';

/**
 * Determines whether a user's subscription allows playback of a given channel.
 *
 * Returns true if:
 * 1. The subscription is active (status === 'active')
 * 2. The subscription has not expired (endDate > now)
 * 3. The plan allows this channel (channelAccess === 'all' or channel.id is in the list)
 * 4. The channel itself is active (isActive === true)
 */
export function canPlayChannel(
  channel: Channel,
  subscription: Subscription | null
): boolean {
  if (!channel.isActive) return false;
  if (!subscription) return false;
  if (subscription.status !== 'active') return false;
  if (new Date(subscription.endDate).getTime() <= Date.now()) return false;

  const { channelAccess } = subscription.plan;
  if (channelAccess === 'all') return true;
  return channelAccess.includes(channel.id);
}
