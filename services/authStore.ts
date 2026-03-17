import { create } from 'zustand';

// Types
export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    plan: 'free' | 'premium';
}

interface AuthState {
    user: User | null;
    isLoading: boolean;
    login: (email: string, pass: string) => Promise<void>;
    logout: () => void;
}

// Mock Service
export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: false,
    login: async (email, pass) => {
        set({ isLoading: true });
        // Simulate API delay (reduced for testing)
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Mock Validation
        if (email.includes('@') && pass === '12345') {
            set({
                isLoading: false,
                user: {
                    id: '123',
                    name: 'Luki User',
                    email: email,
                    plan: 'premium',
                    avatar: 'https://i.pravatar.cc/300'
                }
            });
        } else {
            set({ isLoading: false });
            throw new Error('Invalid Credentials');
        }
    },
    logout: () => set({ user: null }),
}));
