import { create } from 'zustand';

/**
 * Represents an authenticated user.
 *
 * @property id      - Unique user identifier.
 * @property name    - Display name.
 * @property email   - User email address.
 * @property avatar  - Optional avatar image URL.
 * @property plan    - Subscription tier: 'free' or 'premium'.
 */
export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    plan: 'free' | 'premium';
}

/**
 * Shape of the authentication Zustand store.
 *
 * @property user       - Currently authenticated user, or null if not logged in.
 * @property isLoading  - Whether a login request is in progress.
 * @property login      - Authenticates with email and password. Throws on invalid credentials.
 * @property logout     - Clears the authenticated user from state.
 */
interface AuthState {
    user: User | null;
    isLoading: boolean;
    login: (email: string, pass: string) => Promise<void>;
    logout: () => void;
}

/**
 * Global authentication store (Zustand).
 *
 * Provides login/logout actions and the current user.
 * The login implementation is currently a mock that accepts any email
 * combined with the hardcoded password '12345'.
 *
 * @remarks Replace the mock login implementation with a real API call
 *          before moving to production.
 */
export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: false,
    /**
     * Authenticates the user.
     *
     * @param email - User's email address.
     * @param pass  - User's plaintext password.
     * @throws {Error} When credentials are invalid.
     */
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
    /**
     * Logs out the current user by clearing user state.
     */
    logout: () => set({ user: null }),
}));
