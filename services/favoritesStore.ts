import { create } from 'zustand';
import { get as idbGet, set as idbSet } from 'idb-keyval';
import { Movie } from './contentStore';

/**
 * Shape of the favorites Zustand store.
 *
 * @property favorites      - List of movies/channels saved by the user.
 * @property _hasHydrated   - Internal flag: true once IndexedDB has been read.
 * @property init           - Loads persisted favorites from IndexedDB (no-op if already hydrated).
 * @property addFavorite    - Adds a movie to the favorites list if not already present.
 * @property removeFavorite - Removes a movie from the favorites list by id.
 * @property isFavorite     - Returns true if the movie id is in the favorites list.
 * @property toggleFavorite - Adds the movie if absent, removes it if present.
 */
interface FavoritesState {
    favorites: Movie[];
    _hasHydrated: boolean;
    init: () => Promise<void>;
    addFavorite: (movie: Movie) => void;
    removeFavorite: (id: string) => void;
    isFavorite: (id: string) => boolean;
    toggleFavorite: (movie: Movie) => void;
}

const IDB_KEY = 'luki-favorites';

/**
 * Loads the favorites list from IndexedDB.
 *
 * @returns Array of Movie objects, or an empty array on error / unsupported environment.
 */
async function idbLoad(): Promise<Movie[]> {
    try {
        const stored = await idbGet<Movie[]>(IDB_KEY);
        return stored ?? [];
    } catch {
        return [];
    }
}

/**
 * Persists the favorites list to IndexedDB.
 *
 * @param favorites - Updated array to save. Silently ignores errors.
 */
async function idbSave(favorites: Movie[]): Promise<void> {
    try {
        await idbSet(IDB_KEY, favorites);
    } catch {}
}

/**
 * Global favorites store (Zustand).
 *
 * Persists the user's saved content list using IndexedDB (via idb-keyval).
 * Provides toggle, add, remove and query actions for the favorites list.
 */
export const useFavoritesStore = create<FavoritesState>()((set, get) => ({
    favorites: [],
    _hasHydrated: false,

    init: async () => {
        if (get()._hasHydrated) return;
        const favorites = await idbLoad();
        set({ favorites, _hasHydrated: true });
    },

    addFavorite: (movie) => {
        const { favorites } = get();
        if (favorites.some((f) => f.id === movie.id)) return;
        const updated = [movie, ...favorites];
        set({ favorites: updated });
        idbSave(updated);
    },

    removeFavorite: (id) => {
        const updated = get().favorites.filter((f) => f.id !== id);
        set({ favorites: updated });
        idbSave(updated);
    },

    isFavorite: (id) => get().favorites.some((f) => f.id === id),

    toggleFavorite: (movie) => {
        if (get().isFavorite(movie.id)) {
            get().removeFavorite(movie.id);
        } else {
            get().addFavorite(movie);
        }
    },
}));
