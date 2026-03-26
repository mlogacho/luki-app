/**
 * @file favoritesStore.test.ts
 * Unit tests for the favoritesStore Zustand store.
 */

// Mock idb-keyval before importing the store
jest.mock('idb-keyval', () => ({
    get: jest.fn().mockResolvedValue(undefined),
    set: jest.fn().mockResolvedValue(undefined),
}));

import * as idbKeyval from 'idb-keyval';
import { useFavoritesStore } from '../services/favoritesStore';
import type { Movie } from '../services/contentStore';

/** Sample movie fixture used across tests. */
const sampleMovie: Movie = {
    id: 'test-1',
    title: 'Test Movie',
    poster: 'https://example.com/poster.jpg',
    backdrop: 'https://example.com/backdrop.jpg',
    description: 'A test movie.',
    videoUrl: 'https://example.com/stream.m3u8',
    tags: ['Acción', 'Aventura'],
};

const anotherMovie: Movie = {
    id: 'test-2',
    title: 'Another Movie',
    poster: 'https://example.com/poster2.jpg',
    backdrop: 'https://example.com/backdrop2.jpg',
    description: 'Another test movie.',
    videoUrl: 'https://example.com/stream2.m3u8',
    tags: ['Drama'],
};

/**
 * Resets the store state before each test to ensure isolation.
 */
beforeEach(() => {
    useFavoritesStore.setState({ favorites: [], _hasHydrated: false });
    jest.clearAllMocks();
});

describe('favoritesStore', () => {
    describe('initial state', () => {
        it('starts with an empty favorites list', () => {
            const { favorites } = useFavoritesStore.getState();
            expect(favorites).toEqual([]);
        });

        it('starts with _hasHydrated = false', () => {
            const { _hasHydrated } = useFavoritesStore.getState();
            expect(_hasHydrated).toBe(false);
        });
    });

    describe('init', () => {
        it('loads favorites from IndexedDB and sets _hasHydrated', async () => {
            (idbKeyval.get as jest.Mock).mockResolvedValueOnce([sampleMovie]);

            await useFavoritesStore.getState().init();

            const { favorites, _hasHydrated } = useFavoritesStore.getState();
            expect(favorites).toHaveLength(1);
            expect(favorites[0].id).toBe('test-1');
            expect(_hasHydrated).toBe(true);
        });

        it('handles empty IndexedDB (undefined) gracefully', async () => {
            (idbKeyval.get as jest.Mock).mockResolvedValueOnce(undefined);

            await useFavoritesStore.getState().init();

            expect(useFavoritesStore.getState().favorites).toEqual([]);
            expect(useFavoritesStore.getState()._hasHydrated).toBe(true);
        });

        it('is a no-op if already hydrated', async () => {
            useFavoritesStore.setState({ _hasHydrated: true });

            await useFavoritesStore.getState().init();

            expect(idbKeyval.get).not.toHaveBeenCalled();
        });
    });

    describe('addFavorite', () => {
        it('adds a movie to the favorites list', () => {
            useFavoritesStore.getState().addFavorite(sampleMovie);
            expect(useFavoritesStore.getState().favorites).toHaveLength(1);
            expect(useFavoritesStore.getState().favorites[0].id).toBe('test-1');
        });

        it('does not add duplicate favorites', () => {
            useFavoritesStore.getState().addFavorite(sampleMovie);
            useFavoritesStore.getState().addFavorite(sampleMovie);
            expect(useFavoritesStore.getState().favorites).toHaveLength(1);
        });

        it('prepends new favorites (latest first)', () => {
            useFavoritesStore.getState().addFavorite(sampleMovie);
            useFavoritesStore.getState().addFavorite(anotherMovie);
            const ids = useFavoritesStore.getState().favorites.map((f) => f.id);
            expect(ids[0]).toBe('test-2');
            expect(ids[1]).toBe('test-1');
        });
    });

    describe('removeFavorite', () => {
        it('removes a movie by id', () => {
            useFavoritesStore.getState().addFavorite(sampleMovie);
            useFavoritesStore.getState().addFavorite(anotherMovie);
            useFavoritesStore.getState().removeFavorite('test-1');

            const { favorites } = useFavoritesStore.getState();
            expect(favorites).toHaveLength(1);
            expect(favorites[0].id).toBe('test-2');
        });

        it('is a no-op when id does not exist', () => {
            useFavoritesStore.getState().addFavorite(sampleMovie);
            useFavoritesStore.getState().removeFavorite('nonexistent');
            expect(useFavoritesStore.getState().favorites).toHaveLength(1);
        });
    });

    describe('isFavorite', () => {
        it('returns true when movie is in favorites', () => {
            useFavoritesStore.getState().addFavorite(sampleMovie);
            expect(useFavoritesStore.getState().isFavorite('test-1')).toBe(true);
        });

        it('returns false when movie is not in favorites', () => {
            expect(useFavoritesStore.getState().isFavorite('test-1')).toBe(false);
        });
    });

    describe('toggleFavorite', () => {
        it('adds movie when not already a favorite', () => {
            useFavoritesStore.getState().toggleFavorite(sampleMovie);
            expect(useFavoritesStore.getState().isFavorite('test-1')).toBe(true);
        });

        it('removes movie when already a favorite', () => {
            useFavoritesStore.getState().addFavorite(sampleMovie);
            useFavoritesStore.getState().toggleFavorite(sampleMovie);
            expect(useFavoritesStore.getState().isFavorite('test-1')).toBe(false);
        });
    });
});
