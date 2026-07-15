'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/authStore'

export function RequireAdmin({ children }: { children: React.ReactNode }) {
    const role = useAuthStore((state) => state.role)
    const router = useRouter()

    useEffect(() => {
        if (role !== 'ADMIN') router.replace('/home')
    }, [role, router])

    if (role !== 'ADMIN') return null
    return <>{children}</>
}

export default RequireAdmin
