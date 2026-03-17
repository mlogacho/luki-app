import { create } from 'zustand';

export interface Channel {
    id: string;
    title: string;
    imageUrl: string;
    videoUrl: string;
    description: string;
    tags: string[];
    createdAt: number;
}

interface AdminState {
    channels: Channel[];
    isAdminAuth: boolean;
    _hasHydrated: boolean;
    init: () => Promise<void>;
    adminLogin: (password: string) => boolean;
    adminLogout: () => void;
    addChannel: (data: Omit<Channel, 'id' | 'createdAt'>) => void;
    updateChannel: (id: string, data: Partial<Omit<Channel, 'id' | 'createdAt'>>) => void;
    deleteChannel: (id: string) => void;
}

const ADMIN_PASS = 'luki2024';
const API_URL = '/api/channels';

async function apiLoad(): Promise<Channel[]> {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) return [];
        return await res.json();
    } catch { return []; }
}

async function apiSave(channels: Channel[]): Promise<void> {
    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ADMIN_PASS}`,
            },
            body: JSON.stringify(channels),
        });
    } catch {}
}

let initialized = false;

export const useAdminStore = create<AdminState>()((set) => ({
    channels: [],
    isAdminAuth: false,
    _hasHydrated: false,

    init: async () => {
        if (initialized) return;
        initialized = true;
        const channels = await apiLoad();
        set({ channels, _hasHydrated: true });
    },

    adminLogin: (password) => {
        if (password === ADMIN_PASS) {
            set({ isAdminAuth: true });
            return true;
        }
        return false;
    },

    adminLogout: () => set({ isAdminAuth: false }),

    addChannel: (data) => {
        set((state) => {
            const channels = [
                { ...data, id: `ch-${Date.now()}`, createdAt: Date.now() },
                ...state.channels,
            ];
            apiSave(channels);
            return { channels };
        });
    },

    updateChannel: (id, data) => {
        set((state) => {
            const channels = state.channels.map((ch) =>
                ch.id === id ? { ...ch, ...data } : ch
            );
            apiSave(channels);
            return { channels };
        });
    },

    deleteChannel: (id) => {
        set((state) => {
            const channels = state.channels.filter((ch) => ch.id !== id);
            apiSave(channels);
            return { channels };
        });
    },
}));
