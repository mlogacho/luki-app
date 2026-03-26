import { create } from 'zustand';
import { useAdminStore } from './adminStore';

/**
 * Represents a content item (movie, series episode, or live channel).
 *
 * @property id          - Unique content identifier.
 * @property title       - Display title.
 * @property poster      - Portrait image URL (used in MediaRow cards).
 * @property backdrop    - Wide/landscape image URL (used in Hero).
 * @property description - Short synopsis or description.
 * @property videoUrl    - HLS (.m3u8), MP4, or live stream URL.
 * @property rating      - Optional audience relevance score label.
 * @property tags        - Genre or category labels for display rows.
 * @property isLive      - When true the stream is a live broadcast.
 * @property matchTime   - Scheduled kick-off time (e.g. "18:00 ECT") for live events.
 */
export interface Movie {
    id: string;
    title: string;
    poster: string;
    backdrop: string;
    description: string;
    videoUrl: string; // HLS
    rating?: string;
    tags?: string[];
    isLive?: boolean;
    matchTime?: string;
}

/**
 * Shape of the content Zustand store.
 *
 * @property featured     - Hero item displayed at the top of the home screen.
 * @property trending     - Ordered list of content for row display.
 * @property action       - Secondary content list used for category rows.
 * @property isLoading    - Whether content is being fetched.
 * @property fetchContent - Loads hardcoded content and merges admin channels.
 * @property getMovieById - Returns a Movie by id from any list, or undefined.
 */
interface ContentState {
    featured: Movie | null;
    trending: Movie[];
    action: Movie[];
    fetchContent: () => Promise<void>;
    isLoading: boolean;
    getMovieById: (id: string) => Movie | undefined;
}

/**
 * Global content store (Zustand).
 *
 * Manages the catalogue displayed across the app. On fetch, admin-managed
 * channels are merged and given priority over the hardcoded catalogue.
 *
 * External dependency: {@link useAdminStore} — reads channels persisted
 * via the admin API endpoint (/api/channels).
 */
export const useContentStore = create<ContentState>((set, get) => ({
    featured: null,
    trending: [],
    action: [],
    isLoading: false,
    getMovieById: (id: string) => {
        const { featured, trending, action } = get();
        if (featured?.id === id) return featured;
        return trending.find((m) => m.id === id) ?? action.find((m) => m.id === id);
    },
    fetchContent: async () => {
        set({ isLoading: true });
        // Simulate delay
        await new Promise(r => setTimeout(r, 100));

        /** Placeholder HLS stream used for prototype channels. */
        const DEMO_STREAM = 'https://g2qd3e2ay7an-hls-live.5centscdn.com/channel35/d0dbe915091d400bd8ee7f27f0791303.sdp/playlist.m3u8';

        const featured: Movie = {
            id: 'hero-mundial-2026',
            title: 'FIFA Mundial 2026 — En Vivo',
            poster: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3c/2026_FIFA_World_Cup_logo.svg/800px-2026_FIFA_World_Cup_logo.svg.png',
            backdrop: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3c/2026_FIFA_World_Cup_logo.svg/800px-2026_FIFA_World_Cup_logo.svg.png',
            description: 'Vive la emoción del Mundial FIFA 2026 en LUKI. 104 partidos desde USA, Canadá y México. Transmisión en HD exclusiva para suscriptores LUKI.',
            videoUrl: DEMO_STREAM,
            rating: '100% Relevante',
            tags: ['Mundial 2026', 'En Vivo', 'Deportes'],
            isLive: true,
        };

        /** FIFA World Cup 2026 live match channels (prototype). */
        const worldCupChannels: Movie[] = [
            {
                id: 'wc2026-1',
                title: 'Ecuador vs Grupo A — EN VIVO',
                poster: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Flag_of_Ecuador.svg/320px-Flag_of_Ecuador.svg.png',
                backdrop: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Flag_of_Ecuador.svg/800px-Flag_of_Ecuador.svg.png',
                description: 'Partido de la selección ecuatoriana en la fase de grupos del Mundial 2026.',
                videoUrl: DEMO_STREAM,
                tags: ['Mundial 2026', 'En Vivo', 'Deportes'],
                isLive: true,
                matchTime: '18:00 ECT',
            },
            {
                id: 'wc2026-2',
                title: 'Canal Deportes LUKI — EN VIVO',
                poster: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/FIFA_World_Cup_Trophy.svg/200px-FIFA_World_Cup_Trophy.svg.png',
                backdrop: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/FIFA_World_Cup_Trophy.svg/800px-FIFA_World_Cup_Trophy.svg.png',
                description: 'Canal oficial de deportes LUKI con cobertura 24/7 del Mundial FIFA 2026.',
                videoUrl: DEMO_STREAM,
                tags: ['Mundial 2026', 'En Vivo', 'Deportes'],
                isLive: true,
            },
            {
                id: 'wc2026-3',
                title: 'Cuartos de Final — EN VIVO',
                poster: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/FIFA_World_Cup_Trophy.svg/200px-FIFA_World_Cup_Trophy.svg.png',
                backdrop: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/FIFA_World_Cup_Trophy.svg/800px-FIFA_World_Cup_Trophy.svg.png',
                description: 'Transmisión en vivo de los cuartos de final del Mundial 2026.',
                videoUrl: DEMO_STREAM,
                tags: ['Mundial 2026', 'En Vivo', 'Deportes'],
                isLive: true,
                matchTime: '15:00 ECT',
            },
        ];

        const movieTemplate = (id: string, title: string, img: string): Movie => ({
            id,
            title,
            poster: img,
            backdrop: img,
            description: 'Movie description...',
            videoUrl: DEMO_STREAM,
        });

        const trending = [
            { ...movieTemplate('1', 'Dune', 'https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg'), tags: ['Sci-Fi', 'Aventura', 'Películas'] },
            { ...movieTemplate('2', 'Interstellar', 'https://image.tmdb.org/t/p/w500/gEU2QniL6C8zNFuKAIgDwyDz0cg.jpg'), tags: ['Sci-Fi', 'Drama', 'Películas'] },
            { ...movieTemplate('3', 'Inception', 'https://image.tmdb.org/t/p/w500/9gk7admal4zl248LOkowMIN7048.jpg'), tags: ['Acción', 'Sci-Fi', 'Películas'] },
            { ...movieTemplate('4', 'Blade Runner', 'https://image.tmdb.org/t/p/w500/63N9uy8nd9j7Eog2axpq8lqbCN.jpg'), tags: ['Sci-Fi', 'Acción', 'Películas'] },
        ];

        // Merge admin channels — they take priority over hardcoded content
        const adminChannels = useAdminStore.getState().channels;
        const adminMovies: Movie[] = adminChannels.map((ch) => ({
            id: ch.id,
            title: ch.title,
            poster: ch.imageUrl,
            backdrop: ch.imageUrl,
            description: ch.description || '',
            videoUrl: ch.videoUrl,
            tags: ch.tags || [],
        }));

        // Priority order: admin channels → World Cup live → VOD catalogue
        const activeFeatured = adminMovies.length > 0 ? adminMovies[0] : featured;
        const activeTrending = [...adminMovies, ...worldCupChannels, ...trending];

        set({
            featured: activeFeatured,
            trending: activeTrending,
            action: activeTrending.slice().reverse(),
            isLoading: false
        });
    }
}));
