export type PortalGroup = {
    id: string
    name: string
    teacher: { id: string; firstName: string; lastName?: string | null }
}

export type PortalProfile = {
    id: string
    firstName: string
    lastName?: string | null
    phone: string
    role: 'PARENT' | 'STUDENT'
    avatarUrl?: string | null
}

export type PortalChild = {
    id: string
    firstName: string
    lastName?: string | null
    avatarUrl?: string | null
    groups: PortalGroup[]
}

export type PortalBootstrap = {
    role: 'PARENT' | 'STUDENT'
    me: PortalProfile
    groups?: PortalGroup[]
    children?: PortalChild[]
}

export type PortalPayment = {
    id: string
    month: number
    year: number
    amount: string
    comment?: string | null
    createdAt: string
    student: { id: string; firstName: string; lastName?: string | null }
    group: { id: string; name: string }
}

export type PortalScoreEvent = {
    id: string
    date: string
    type: 'HOMEWORK' | 'ATTENDANCE' | 'EXAM' | 'QUIZ'
    value: number
    comment?: string | null
}
