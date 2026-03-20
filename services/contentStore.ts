// Re-export from new architecture
export { useContentStore } from '@/src/modules/content/store/contentStore';
export type { Channel } from '@/src/core/types/channel.types';

// Backward-compatible Movie type alias
export type { Channel as Movie } from '@/src/core/types/channel.types';

