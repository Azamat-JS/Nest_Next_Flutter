'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import { TokenPayload } from '@/lib/types/token_payload'
import { useAuthStore } from '@/lib/stores/authStore'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Phone, Shield } from 'lucide-react'

const Profile = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

    const { data: user } = useSuspenseQuery<TokenPayload>({
        queryKey: ['me'],
        queryFn: async () => {
            const res = await api.get('/users/me')
            return res.data
        },
        staleTime: 1000 * 60 * 10,
        enabled: isAuthenticated,
    })

    if (!isAuthenticated) {
        return <p className="text-center text-muted-foreground">Please log in to view your profile.</p>
    }

    return (
        <div className="flex justify-center">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">{[user?.firstName, user?.lastName].filter(Boolean).join(' ')}</CardTitle>
                    <Badge variant="secondary" className="mx-auto w-fit capitalize">
                        {user?.role?.toLowerCase()}
                    </Badge>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                    <div className="flex items-center gap-3 rounded-lg border p-3">
                        <User className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                            <p className="text-xs text-muted-foreground">Name</p>
                            <p className="font-medium">{[user?.firstName, user?.lastName].filter(Boolean).join(' ')}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border p-3">
                        <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                            <p className="text-xs text-muted-foreground">Phone</p>
                            <p className="font-medium">{user?.phone}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border p-3">
                        <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                            <p className="text-xs text-muted-foreground">Role</p>
                            <p className="font-medium capitalize">{user?.role?.toLowerCase()}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default Profile
