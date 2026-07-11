"use client"

import { useSuspenseQuery } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { useSearchParams, useRouter } from "next/navigation"
import { LeaderBoardType } from "@/lib/types/token_payload"
import { PaginationType } from "@/lib/types/groups"
import api from "@/lib/api"
import { Trophy, Medal, Award } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Field, FieldLabel } from "@/components/ui/field"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

const getRankIcon = (idx: number) => {
    if (idx === 0) return <Trophy className="h-4 w-4 text-yellow-500" />
    if (idx === 1) return <Medal className="h-4 w-4 text-gray-400" />
    if (idx === 2) return <Award className="h-4 w-4 text-amber-600" />
    return null
}

const getRankStyle = (idx: number) => {
    if (idx === 0) return "bg-yellow-50 dark:bg-yellow-950/20 font-semibold"
    if (idx === 1) return "bg-slate-50 dark:bg-slate-900/30 font-semibold"
    if (idx === 2) return "bg-amber-50 dark:bg-amber-950/20 font-semibold"
    return ""
}

const GroupLeaderBoard = ({ groupId }: { groupId: string }) => {
    const t = useTranslations('GroupLeaderBoard')
    const tCommon = useTranslations('Common')
    const router = useRouter()
    const searchParams = useSearchParams()
    const page = Number(searchParams.get('page') ?? 1)
    const limit = Number(searchParams.get('limit') ?? 10)

    const { data: groupStudentsData } = useSuspenseQuery({
        queryKey: ["group-leaderboard", groupId, page, limit],
        queryFn: async () => {
            const res = await api.get(`/student-score/leaderboard/${groupId}`, { params: { page, limit } })
            return res.data
        },
        staleTime: 1000 * 60 * 5,
    })

    const groupStudents: LeaderBoardType[] = groupStudentsData?.data ?? []
    const meta: PaginationType = groupStudentsData?.meta ?? {}
    const lastPage = meta?.last_page ?? 1

    return (
        <>
            <Table>
                <TableCaption>
                    {t('showingCount', { count: groupStudents.length, total: meta?.total ?? 0 })}
                </TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12 text-center font-semibold">#</TableHead>
                        <TableHead className="text-center font-semibold">{t('student')}</TableHead>
                        <TableHead className="text-center font-semibold">{t('homework')}</TableHead>
                        <TableHead className="text-center font-semibold">{t('attendance')}</TableHead>
                        <TableHead className="text-center font-semibold text-primary">{t('total')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {groupStudents.map((s, idx) => {
                        const absoluteIdx = (page - 1) * limit + idx
                        return (
                            <TableRow key={idx} className={cn(getRankStyle(absoluteIdx))}>
                                <TableCell className="text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        {getRankIcon(absoluteIdx)}
                                        <span>{absoluteIdx + 1}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center font-medium">{[s.student.firstName, s.student.lastName].filter(Boolean).join(' ')}</TableCell>
                                <TableCell className="text-center">{s.homework ?? 0}</TableCell>
                                <TableCell className="text-center">{s.attendance ?? 0}</TableCell>
                                <TableCell className="text-center font-bold text-primary">{s.total ?? 0}</TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>

            <div className="grid grid-cols-2 items-center mt-4">
                <div className="flex justify-center">
                    <Field orientation="horizontal" className="w-fit">
                        <FieldLabel htmlFor="gl-rows-per-page">{t('rowsPerPage')}</FieldLabel>
                        <Select value={String(limit)} onValueChange={(val) => {
                            const params = new URLSearchParams(searchParams.toString())
                            params.set('limit', val)
                            params.set('page', '1')
                            router.push(`?${params.toString()}`)
                        }}>
                            <SelectTrigger className="w-20" id="gl-rows-per-page">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent align="start">
                                <SelectGroup>
                                    {['5', '10', '15', '20'].map(v => (
                                        <SelectItem key={v} value={v}>{v}</SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </Field>
                </div>
                <div className="flex justify-end">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious href={`?page=${Math.max(1, page - 1)}&limit=${limit}`} text={tCommon('previous')} />
                            </PaginationItem>
                            {Array.from({ length: lastPage }).map((_, idx) => (
                                <PaginationItem key={idx}>
                                    <PaginationLink href={`?page=${idx + 1}&limit=${limit}`} isActive={page === idx + 1}>
                                        {idx + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext href={`?page=${Math.min(lastPage, page + 1)}&limit=${limit}`} text={tCommon('next')} />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </div>
        </>
    )
}

export default GroupLeaderBoard
