import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PlatformAuthState {
    platformToken: string | null;
    isPlatformAuthenticated: boolean;
    setPlatformToken: (token: string | null) => void;
    logout: () => void;
}

export const usePlatformAuthStore = create<PlatformAuthState>()(
    persist((set) => ({
        platformToken: null,
        isPlatformAuthenticated: false,
        setPlatformToken: (platformToken) => set({ platformToken, isPlatformAuthenticated: !!platformToken }),
        logout: () => set({ platformToken: null, isPlatformAuthenticated: false }),
    }), {
        name: 'platform-auth-storage',
    })
);
