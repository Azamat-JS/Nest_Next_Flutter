"use client"

import { useQuery } from "@tanstack/react-query"
import { Loader2, Trophy, Medal, Award } from "lucide-react"
import api from "@/lib/api"
import { cn } from "@/lib/utils"
import { LeaderBoardType } from "@/lib/types/token_payload"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

const rankIcon = (idx: number) => {
    if (idx === 0) return <Trophy className="h-4 w-4 text-yellow-500" />
    if (idx === 1) return <Medal className="h-4 w-4 text-gray-400" />
    if (idx === 2) return <Award className="h-4 w-4 text-amber-600" />
    return <span className="text-xs text-muted-foreground">{idx + 1}</span>
}

export default function TgLeaderboardPage() {
    const { data, isPending, isError } = useQuery({
        queryKey: ['tg-global-leaderboard'],
        queryFn: async () => (await api.get('/portal/leaderboard', { params: { limit: 50 } })).data,
    })

    if (isPending) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (isError) {
        return <p className="py-16 text-center text-sm text-muted-foreground">Could not load the leaderboard.</p>
    }

    const rows: LeaderBoardType[] = data?.data ?? []

    return (
        <div className="space-y-4 py-4">
            <h1 className="flex items-center gap-2 text-xl font-bold">
                <Trophy className="h-5 w-5 text-primary" />
                Global leaderboard
            </h1>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-10 text-center">#</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Group</TableHead>
                        <TableHead className="text-center">Total</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((row, idx) => (
                        <TableRow key={idx} className={cn(idx < 3 && 'font-semibold')}>
                            <TableCell className="text-center">{rankIcon(idx)}</TableCell>
                            <TableCell>{row.student.firstName} {row.student.lastName ?? ''}</TableCell>
                            <TableCell className="text-muted-foreground">{row.group?.name}</TableCell>
                            <TableCell className="text-center text-primary">{row.total}</TableCell>
                        </TableRow>
                    ))}
                    {rows.length === 0 && (
                        <TableRow><TableCell colSpan={4} className="py-8 text-center text-muted-foreground">No scores yet</TableCell></TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
