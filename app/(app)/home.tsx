import { View, ScrollView, RefreshControl, StatusBar } from 'react-native';
import { useEffect, useCallback, useMemo } from 'react';
import { useFocusEffect } from 'expo-router';
import { useContentStore } from '@/src/modules/content/store/contentStore';
import { useAdminStore } from '@/services/adminStore';
import { Hero } from '@/components/Hero';
import { MediaRow } from '@/components/MediaRow';
import { useRouter } from 'expo-router';
import type { Channel } from '@/src/core/types/channel.types';

// Order in which tag rows appear when present
const TAG_ORDER = [
    'Tendencias Globales',
    'Acción', 'Aventura', 'Deportes', 'Noticias', 'Entretenimiento',
    'Películas', 'Series', 'Música', 'Infantil', 'Documentales',
    'Comedia', 'Terror', 'Drama', 'Sci-Fi', 'Anime',
];

export default function Home() {
    const { channels: contentChannels, featuredChannel, fetchChannels, isLoading } = useContentStore();
    const adminChannels = useAdminStore((state) => state.channels);
    const router = useRouter();

    // Load admin channels from API on mount
    useEffect(() => {
        useAdminStore.getState().init();
    }, []);

    // Re-fetch base content on focus
    useFocusEffect(
        useCallback(() => {
            fetchChannels();
        }, [])
    );

    // Wait for admin channels to hydrate before merging
    const hasHydrated = useAdminStore((state) => state._hasHydrated);
    const effectiveAdminChannels = hasHydrated ? adminChannels : [];

    // Admin channels take priority; only show active channels
    const featured: Channel | null = effectiveAdminChannels.find((ch) => ch.isActive) ??
        effectiveAdminChannels[0] ??
        (featuredChannel ?? null);

    // Merge all content — admin first (priority)
    const allChannels: Channel[] = useMemo(
        () => [...effectiveAdminChannels, ...contentChannels],
        [effectiveAdminChannels, contentChannels]
    );

    // Build tag → items map dynamically
    const tagRows: { title: string; items: Channel[] }[] = useMemo(() => {
        const rows: { title: string; items: Channel[] }[] = [];

        // "Tendencias Globales" always shows everything
        if (allChannels.length > 0) {
            rows.push({ title: 'Tendencias Globales', items: allChannels });
        }

        // One row per tag (only those that actually have content)
        const seen = new Set<string>();
        for (const tag of TAG_ORDER.slice(1)) {
            if (seen.has(tag)) continue;
            const items = allChannels.filter((ch) => ch.tags?.includes(tag));
            if (items.length > 0) {
                seen.add(tag);
                rows.push({ title: tag, items });
            }
        }

        // Catch-all for items with tags not in TAG_ORDER
        const extraTags = new Set<string>();
        for (const ch of allChannels) {
            for (const t of ch.tags ?? []) {
                if (!TAG_ORDER.includes(t) && !seen.has(t)) extraTags.add(t);
            }
        }
        for (const tag of extraTags) {
            const items = allChannels.filter((ch) => ch.tags?.includes(tag));
            if (items.length > 0) rows.push({ title: tag, items });
        }

        return rows;
    }, [allChannels]);

    const handlePlay = () => {
        if (featured) {
            router.push({ pathname: '/player/[id]', params: { id: featured.id } });
        }
    };

    return (
        <View className="flex-1 bg-luki-background">
            <StatusBar barStyle="light-content" />
            <ScrollView
                className="flex-1"
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={fetchChannels} tintColor="#FFC107" />
                }
            >
                {featured && <Hero movie={featured} onPlay={handlePlay} />}

                <View className="mt-6 pb-20">
                    {tagRows.map((row) => (
                        <MediaRow key={row.title} title={row.title} items={row.items} />
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

