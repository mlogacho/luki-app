import type { Channel } from '@/src/core/types/channel.types';

/**
 * Domain entity helper for Channel.
 */
export function isChannelAccessibleByPlan(
  channel: Channel,
  planId: string
): boolean {
  return channel.allowedPlanIds.includes(planId);
}
