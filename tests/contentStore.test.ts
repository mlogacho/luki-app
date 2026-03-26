/**
 * @file contentStore.test.ts
 * Unit tests for the contentStore Zustand store.
 */

import { useContentStore } from '../services/contentStore';

// Mock the adminStore dependency
jest.mock('../services/adminStore', () => ({
    useAdminStore: {
        getState: jest.fn().mockReturnValue({ channels: [] }),
    },
}));

beforeEach(() => {
    useContentStore.setState({
        featured: null,
        trending: [],
        action: [],
        isLoading: false,
    });
});

describe('contentStore', () => {
    describe('fetchContent', () => {
        it('sets isLoading to false after fetching', async () => {
            await useContentStore.getState().fetchContent();
            expect(useContentStore.getState().isLoading).toBe(false);
        });

        it('populates trending with content after fetch', async () => {
            await useContentStore.getState().fetchContent();
            expect(useContentStore.getState().trending.length).toBeGreaterThan(0);
        });

        it('sets a featured item after fetch', async () => {
            await useContentStore.getState().fetchContent();
            expect(useContentStore.getState().featured).not.toBeNull();
        });

        it('includes Mundial 2026 live channel in trending', async () => {
            await useContentStore.getState().fetchContent();
            const { trending } = useContentStore.getState();
            const worldCupChannels = trending.filter(
                (m) => m.tags?.includes('Mundial 2026')
            );
            expect(worldCupChannels.length).toBeGreaterThan(0);
        });

        it('marks World Cup channels as live (isLive: true)', async () => {
            await useContentStore.getState().fetchContent();
            const { trending } = useContentStore.getState();
            const liveChannels = trending.filter((m) => m.isLive === true);
            expect(liveChannels.length).toBeGreaterThan(0);
        });

        it('featured item is the World Cup hero when no admin channels exist', async () => {
            await useContentStore.getState().fetchContent();
            const { featured } = useContentStore.getState();
            expect(featured?.id).toBe('hero-mundial-2026');
        });

        it('uses admin channel as featured when admin channels exist', async () => {
            const { useAdminStore } = require('../services/adminStore');
            useAdminStore.getState.mockReturnValueOnce({
                channels: [
                    {
                        id: 'admin-ch-1',
                        title: 'Admin Channel',
                        imageUrl: 'https://example.com/img.jpg',
                        videoUrl: 'https://example.com/stream.m3u8',
                        description: 'Admin managed channel',
                        tags: ['Noticias'],
                        createdAt: Date.now(),
                    },
                ],
            });

            await useContentStore.getState().fetchContent();
            expect(useContentStore.getState().featured?.id).toBe('admin-ch-1');
        });
    });

    describe('getMovieById', () => {
        it('returns undefined for an unknown id', () => {
            expect(useContentStore.getState().getMovieById('nonexistent')).toBeUndefined();
        });

        it('finds the featured item by id', async () => {
            await useContentStore.getState().fetchContent();
            const featured = useContentStore.getState().featured!;
            const result = useContentStore.getState().getMovieById(featured.id);
            expect(result?.id).toBe(featured.id);
        });

        it('finds a trending item by id', async () => {
            await useContentStore.getState().fetchContent();
            const { trending } = useContentStore.getState();
            const movie = trending[1];
            expect(useContentStore.getState().getMovieById(movie.id)?.id).toBe(movie.id);
        });
    });
});
