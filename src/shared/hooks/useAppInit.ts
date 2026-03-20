import { useEffect, useState } from 'react';
import { useAuthStore } from '@/src/modules/auth/store/authStore';
import { useProfileStore } from '@/src/modules/profiles/store/profileStore';
import { useContentStore } from '@/src/modules/content/store/contentStore';

interface AppInitResult {
  isReady: boolean;
}

export function useAppInit(): AppInitResult {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      const { restoreSession } = useAuthStore.getState();
      await restoreSession();

      // Read the updated auth state after session restore
      const { isAuthenticated } = useAuthStore.getState();

      if (!cancelled && isAuthenticated) {
        const { fetchProfiles } = useProfileStore.getState();
        const { fetchChannels } = useContentStore.getState();
        await Promise.allSettled([fetchProfiles(), fetchChannels()]);
      }

      if (!cancelled) {
        setIsReady(true);
      }
    }

    initialize();

    return () => {
      cancelled = true;
    };
  }, []);

  return { isReady };
}
