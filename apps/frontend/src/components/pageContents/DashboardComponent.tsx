"use client"

import { useSuspenseQuery } from "@tanstack/react-query"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, Trophy, TrendingUp } from "lucide-react"
import { LeaderBoardType } from "@/lib/types/token_payload"

const DashboardComponent = () => {
    const { data: usersData } = useSuspenseQuery({
        queryKey: ['dashboard-users'],
        queryFn: async () => {
            const res = await api.get('/users', { params: { page: 1, limit: 1 } })
            return res.data
        },
        staleTime: 1000 * 60 * 5,
    })

    const { data: groupsData } = useSuspenseQuery({
        queryKey: ['dashboard-groups'],
        queryFn: async () => {
            const res = await api.get('/group/all', { params: { page: 1, limit: 1 } })
            return res.data
        },
        staleTime: 1000 * 60 * 5,
    })

    const { data: leaderboardData } = useSuspenseQuery({
        queryKey: ['dashboard-leaderboard'],
        queryFn: async () => {
            const res = await api.get('/student-score/leaderboard', { params: { page: 1, limit: 5 } })
            return res.data
        },
        staleTime: 1000 * 60 * 5,
    })

    const totalUsers = usersData?.meta?.total ?? 0
    const totalGroups = groupsData?.meta?.total ?? 0
    const topStudents: LeaderBoardType[] = leaderboardData?.data ?? []
    const topScore = topStudents[0]?.total ?? 0

    const stats = [
        { title: "Total Users", value: totalUsers, icon: Users, description: "Registered accounts" },
        { title: "Total Groups", value: totalGroups, icon: BookOpen, description: "Active study groups" },
        { title: "Top Score", value: topScore, icon: Trophy, description: topStudents[0]?.student?.username ?? "No data" },
        { title: "Students on board", value: leaderboardData?.meta?.total ?? 0, icon: TrendingUp, description: "With recorded scores" },
    ]

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground">Overview of your educational center</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {topStudents.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-3">Top 5 Students</h3>
                    <div className="space-y-2">
                        {topStudents.map((s, idx) => (
                            <div key={idx} className="flex items-center justify-between rounded-lg border p-3">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                                        {idx + 1}
                                    </span>
                                    <div>
                                        <p className="font-medium">{s.student.username}</p>
                                        {s.group && <p className="text-xs text-muted-foreground">{s.group.name}</p>}
                                    </div>
                                </div>
                                <span className="font-bold text-primary">{s.total}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default DashboardComponent
