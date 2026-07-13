"use client"

import { use, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Loader2, Trophy, Medal, Award, BookOpen, GraduationCap, ArrowLeft } from "lucide-react"
import { useTranslations } from "next-intl"
import api from "@/lib/api"
import { cn } from "@/lib/utils"
import { useTgStore } from "@/lib/stores/tgStore"
import { PortalBootstrap, PortalGroup, PortalScoreEvent } from "@/lib/types/portal"
import { HomeworkType } from "@/lib/types/homework"
import { LeaderBoardType } from "@/lib/types/token_payload"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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

export default function TgGroupPage({ params }: { params: Promise<{ groupId: string }> }) {
    const { groupId } = use(params)
    const searchParams = useSearchParams()
    const router = useRouter()
    const setSelection = useTgStore((s) => s.setSelection)
    const t = useTranslations('TgGroupDetail')

    const { data: bootstrap } = useQuery({
        queryKey: ['tg-bootstrap'],
        queryFn: async () => (await api.get<PortalBootstrap>('/portal/bootstrap')).data,
    })
    // Whose scores to show: the child picked on the entry page for parents,
    // the user themselves for students.
    const studentId = searchParams.get('student') ?? (bootstrap?.role === 'STUDENT' ? bootstrap.me.id : null)

    // Keep the bottom nav's Group tab pointing at the page we're on.
    useEffect(() => {
        setSelection(groupId, studentId)
    }, [groupId, studentId, setSelection])

    const { data: details, isPending, isError, error } = useQuery({
        queryKey: ['tg-group', groupId],
        queryFn: async () => (await api.get<{ group: PortalGroup }>(`/portal/groups/${groupId}`)).data,
    })

    const { data: leaderboard } = useQuery({
        queryKey: ['tg-group-leaderboard', groupId],
        queryFn: async () => (await api.get(`/portal/groups/${groupId}/leaderboard`, { params: { limit: 50 } })).data,
    })

    const { data: homework } = useQuery({
        queryKey: ['tg-group-homework', groupId],
        queryFn: async () => (await api.get(`/portal/groups/${groupId}/homework`, { params: { limit: 50 } })).data,
    })

    const { data: scores } = useQuery({
        queryKey: ['tg-scores', studentId, groupId],
        enabled: !!studentId,
        queryFn: async () => (await api.get(`/portal/scores/${studentId}/${groupId}`, { params: { limit: 30 } })).data,
    })

    if (isPending) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (isError) {
        const status = (error as { response?: { status?: number } })?.response?.status
        return (
            <p className="py-16 text-center text-sm text-muted-foreground">
                {status === 403 ? t('accessDenied') : t('loadError')}
            </p>
        )
    }

    const group = details?.group
    const rows: LeaderBoardType[] = leaderboard?.data ?? []
    const homeworks: HomeworkType[] = homework?.data ?? []
    const scoreEvents: PortalScoreEvent[] = scores?.scores ?? []

    const childName = bootstrap?.role === 'PARENT'
        ? bootstrap.children?.find((c) => c.id === studentId)
        : null
    // Admins/teachers land on the group at large, with no pre-selected
    // student - tapping a leaderboard row is how they drill into Scores.
    const canDrillIntoStudent = bootstrap?.role === 'ADMIN' || bootstrap?.role === 'TEACHER'

    // Only show a way back to the picker if there was actually a choice to
    // make - e.g. a parent with children spread across multiple groups.
    const destinationCount = !bootstrap
        ? 0
        : bootstrap.role === 'PARENT'
            ? (bootstrap.children ?? []).reduce((sum, child) => sum + child.groups.length, 0)
            : (bootstrap.groups ?? []).length
    const canGoBackToPicker = destinationCount > 1

    return (
        <div className="space-y-4 py-4">
            <div>
                {canGoBackToPicker && (
                    <button
                        type="button"
                        onClick={() => router.push('/tg')}
                        className="mb-2 flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        {t('back')}
                    </button>
                )}
                <h1 className="flex items-center gap-2 text-xl font-bold">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    {group?.name}
                </h1>
                <p className="text-sm text-muted-foreground">
                    {t('teacherLine', { teacherName: `${group?.teacher.firstName ?? ''} ${group?.teacher.lastName ?? ''}`.trim() })}
                    {childName && <> · {childName.firstName} {childName.lastName ?? ''}</>}
                </p>
            </div>

            <Tabs defaultValue="leaderboard">
                <TabsList className="w-full">
                    <TabsTrigger value="leaderboard" className="flex-1">{t('tabLeaderboard')}</TabsTrigger>
                    <TabsTrigger value="homework" className="flex-1">{t('tabHomework')}</TabsTrigger>
                    <TabsTrigger value="scores" className="flex-1">{t('tabScores')}</TabsTrigger>
                </TabsList>

                <TabsContent value="leaderboard">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-10 text-center">#</TableHead>
                                <TableHead>{t('student')}</TableHead>
                                <TableHead className="text-center">{t('hw')}</TableHead>
                                <TableHead className="text-center">{t('att')}</TableHead>
                                <TableHead className="text-center">{t('total')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.map((row, idx) => (
                                <TableRow
                                    key={idx}
                                    className={cn(idx < 3 && 'font-semibold', canDrillIntoStudent && 'cursor-pointer')}
                                    onClick={() => {
                                        if (!canDrillIntoStudent) return
                                        router.push(`/tg/groups/${groupId}?student=${row.student.id}`)
                                    }}
                                >
                                    <TableCell className="text-center">{rankIcon(idx)}</TableCell>
                                    <TableCell>{row.student.firstName} {row.student.lastName ?? ''}</TableCell>
                                    <TableCell className="text-center">{row.homework}</TableCell>
                                    <TableCell className="text-center">{row.attendance}</TableCell>
                                    <TableCell className="text-center text-primary">{row.total}</TableCell>
                                </TableRow>
                            ))}
                            {rows.length === 0 && (
                                <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">{t('noScores')}</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TabsContent>

                <TabsContent value="homework" className="space-y-3">
                    {homeworks.map((hw) => (
                        <Card key={hw.id}>
                            <CardContent className="flex items-start gap-3 py-4">
                                <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                                <div className="min-w-0">
                                    <p className="font-medium break-words">{hw.topic}</p>
                                    <p className="text-sm text-muted-foreground">{t('due', { date: new Date(hw.dueDate).toLocaleDateString() })}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {homeworks.length === 0 && (
                        <p className="py-8 text-center text-sm text-muted-foreground">{t('noHomework')}</p>
                    )}
                </TabsContent>

                <TabsContent value="scores">
                    {scores?.total?.total !== undefined && (
                        <p className="mb-2 text-sm text-muted-foreground">{t('totalScoreLabel')} <span className="font-semibold text-primary">{scores.total.total}</span></p>
                    )}
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('date')}</TableHead>
                                <TableHead>{t('type')}</TableHead>
                                <TableHead className="text-center">{t('score')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {scoreEvents.map((event) => (
                                <TableRow key={event.id}>
                                    <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                                    <TableCell><Badge variant="outline">{event.type}</Badge></TableCell>
                                    <TableCell className="text-center font-medium">{event.value}</TableCell>
                                </TableRow>
                            ))}
                            {scoreEvents.length === 0 && (
                                <TableRow><TableCell colSpan={3} className="py-8 text-center text-muted-foreground">{t('noScores')}</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TabsContent>
            </Tabs>
        </div>
    )
}
