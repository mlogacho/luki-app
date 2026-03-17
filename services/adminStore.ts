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
const IDB_DB = 'luki-admin';
const IDB_STORE = 'channels';
const IDB_KEY = 'all';

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(IDB_DB, 1);
        req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function idbLoad(): Promise<Channel[]> {
    try {
        if (typeof indexedDB === 'undefined') return [];
        const db = await openDB();
        return new Promise((resolve) => {
            const req = db.transaction(IDB_STORE, 'readonly').objectStore(IDB_STORE).get(IDB_KEY);
            req.onsuccess = () => {
                try { resolve(req.result ? JSON.parse(req.result) : []); }
                catch { resolve([]); }
            };
            req.onerror = () => resolve([]);
        });
    } catch { return []; }
}

async function idbSave(channels: Channel[]): Promise<void> {
    try {
        if (typeof indexedDB === 'undefined') return;
        const db = await openDB();
        return new Promise((resolve) => {
            const tx = db.transaction(IDB_STORE, 'readwrite');
            tx.objectStore(IDB_STORE).put(JSON.stringify(channels), IDB_KEY);
            tx.oncomplete = () => resolve();
            tx.onerror = () => resolve();
        });
    } catch {}
}

let initialized = false;

export const useAdminStore = create<AdminState>()((set, get) => ({
    channels: [],
    isAdminAuth: false,
    _hasHydrated: false,

    // Call once on app start — loads channels from IndexedDB
    init: async () => {
        if (initialized) return;
        initialized = true;
        const channels = await idbLoad();
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
            idbSave(channels);
            return { channels };
        });
    },

    updateChannel: (id, data) => {
        set((state) => {
            const channels = state.channels.map((ch) =>
                ch.id === id ? { ...ch, ...data } : ch
            );
            idbSave(channels);
            return { channels };
        });
    },

    deleteChannel: (id) => {
        set((state) => {
            const channels = state.channels.filter((ch) => ch.id !== id);
            idbSave(channels);
            return { channels };
        });
    },
}));
