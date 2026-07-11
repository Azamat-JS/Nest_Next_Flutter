import { create } from 'zustand'

type TgAuthStatus = 'loading' | 'ready' | 'outside-telegram' | 'error'

// Session state for the Telegram mini app: auth progress plus which
// group/student the user last picked, so the bottom nav's Group tab can jump
// straight back. Deliberately not persisted - every mini app open re-auths.
interface TgState {
    status: TgAuthStatus
    error: string | null
    selectedGroupId: string | null
    selectedStudentId: string | null
    setStatus: (status: TgAuthStatus, error?: string | null) => void
    setSelection: (groupId: string, studentId: string | null) => void
}

export const useTgStore = create<TgState>((set) => ({
    status: 'loading',
    error: null,
    selectedGroupId: null,
    selectedStudentId: null,
    setStatus: (status, error = null) => set({ status, error }),
    setSelection: (groupId, studentId) => set({ selectedGroupId: groupId, selectedStudentId: studentId }),
}))
