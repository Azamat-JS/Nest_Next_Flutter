'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter, useSearchParams } from 'next/navigation'
import UsersTab from "./UsersTab"
import WaitingListTab from "./WaitingListTab"

const Home = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const tab = searchParams.get('tab') ?? 'users'

    return (
        <Tabs
            value={tab}
            onValueChange={(val) => {
                const params = new URLSearchParams(searchParams.toString())
                params.set('tab', val)
                router.push(`?${params.toString()}`)
            }}
            className="space-y-4"
        >
            <TabsList>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="waiting-list">Waiting List</TabsTrigger>
            </TabsList>
            <TabsContent value="users">
                <UsersTab />
            </TabsContent>
            <TabsContent value="waiting-list">
                <WaitingListTab />
            </TabsContent>
        </Tabs>
    )
}

export default Home
