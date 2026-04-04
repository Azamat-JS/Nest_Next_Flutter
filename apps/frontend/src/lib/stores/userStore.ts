import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
    id: string,
    name: string,
    email: string,
}

interface UserState {
    user: User | null;
    setUser: (user: User | null) => void;
    updateUser: (updates: Partial<User>) => void;
    deleteUser: () => void;
}

export const useUserStore = create<UserState>()(
    persist((set) => ({
        user: null,
        setUser: (user) => set({ user }),
        updateUser: (updates) => set((state) => ({
            user: state.user ? { ...state.user, ...updates } : null
        })),
        deleteUser: () => set({ user: null })
    }), { name: 'user-storage' })
);