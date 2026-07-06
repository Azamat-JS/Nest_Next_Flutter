import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';
import { TokenPayload } from '@/lib/types/token_payload';

interface AuthState {
    token: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    role: string | null;
    tenantId: string | null;
    mustChangePassword: boolean;
    setToken: (token: string | null, refreshToken?: string | null) => void;
    setMustChangePassword: (value: boolean) => void;
    logout: () => void
}

export const useAuthStore = create<AuthState>()(
    persist((set) => ({
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        role: null,
        tenantId: null,
        mustChangePassword: false,
        setToken: (token, refreshToken) => {
            const decoded = token ? jwtDecode<TokenPayload>(token) : null;
            set({
                token,
                isAuthenticated: !!token,
                role: decoded?.role ?? null,
                tenantId: decoded?.tenantId ?? null,
                mustChangePassword: decoded?.mustChangePassword ?? false,
                ...(refreshToken !== undefined && { refreshToken }),
            });
        },
        setMustChangePassword: (value) => set({ mustChangePassword: value }),
        logout: () => set({
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            role: null,
            tenantId: null,
            mustChangePassword: false,
        })
    }), {
        name: 'auth-storage',
    })
);
