'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/authStore'

export function RequireStaff({ children }: { children: React.ReactNode }) {
    const role = useAuthStore((state) => state.role)
    const router = useRouter()

    useEffect(() => {
        if (role === 'STUDENT') router.replace('/groups')
    }, [role, router])

    if (role === 'STUDENT') return null
    return <>{children}</>
}

export default RequireStaff
