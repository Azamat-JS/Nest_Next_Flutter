"use client"

import { useEffect, useState } from "react"
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import { useTranslations } from "next-intl"
import api from "@/lib/api"
import { HomeworkType } from "@/lib/types/homework"
import { PaginationType } from "@/lib/types/groups"
import AddHomeworkDrawer from "../AddHomeworkDrawer"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
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
import { useAuthStore } from "@/lib/stores/authStore"

const formatDueDate = (value: string) => {
    const date = new Date(value)
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
}

const GroupHomeworks = ({ groupId }: { groupId: string }) => {
    const t = useTranslations('GroupHomeworks')
    const tCommon = useTranslations('Common')
    const router = useRouter()
    const searchParams = useSearchParams()
    const queryClient = useQueryClient()
    const page = Number(searchParams.get('page') ?? 1)
    const limit = Number(searchParams.get('limit') ?? 10)
    const search = searchParams.get('search') ?? ''
    const [searchInput, setSearchInput] = useState(search)
    const [openAddHomework, setOpenAddHomework] = useState(false)
    const role = useAuthStore((state) => state.role)
    const canManage = role === 'ADMIN' || role === 'TEACHER'

    useEffect(() => {
        const handler = setTimeout(() => {
            if (searchInput === search) return
            const params = new URLSearchParams(searchParams.toString())
            if (searchInput) params.set('search', searchInput); else params.delete('search')
            params.set('page', '1')
            router.push(`?${params.toString()}`)
        }, 400)
        return () => clearTimeout(handler)
    }, [searchInput])

    const { data } = useSuspenseQuery({
        queryKey: ["group-homeworks", groupId, page, limit, search],
        queryFn: async () => {
            const res = await api.get(`/homework/group/${groupId}`, {
                params: { page, limit, ...(search && { search }) },
            })
            return res.data
        },
        staleTime: 1000 * 60 * 2,
    })

    const homeworks: HomeworkType[] = data?.data ?? []
    const meta: PaginationType = data?.meta ?? {}
    const lastPage = meta?.last_page ?? 1

    return (
        <div className="space-y-4">
            <div className="flex justify-center">
                <div className="relative w-64">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder={t('searchPlaceholder')}
                        className="pl-8"
                    />
                </div>
            </div>

            <Table>
                <TableCaption>
                    {t('showingHomeworks', { count: homeworks.length, total: meta?.total ?? 0 })}
                </TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12 text-center font-semibold">#</TableHead>
                        <TableHead className="text-center font-semibold">{t('topicHeader')}</TableHead>
                        <TableHead className="text-center font-semibold">{t('dueDateHeader')}</TableHead>
                        <TableHead className="text-center font-semibold">{t('createdAtHeader')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {homeworks.map((h, idx) => (
                        <TableRow key={h.id}>
                            <TableCell className="text-center">{(page - 1) * limit + idx + 1}</TableCell>
                            <TableCell className="text-center font-medium">{h.topic}</TableCell>
                            <TableCell className="text-center">{formatDueDate(h.dueDate)}</TableCell>
                            <TableCell className="text-center text-muted-foreground">{new Date(h.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {canManage && (
                <div className="flex gap-2 justify-end">
                    <AddHomeworkDrawer
                        openCreate={openAddHomework}
                        setOpenCreate={setOpenAddHomework}
                        groupId={groupId}
                        onHomeworkAdded={() => queryClient.invalidateQueries({ queryKey: ['group-homeworks', groupId] })}
                    />
                </div>
            )}

            <div className="grid grid-cols-2 items-center">
                <div className="flex justify-center">
                    <Field orientation="horizontal" className="w-fit">
                        <FieldLabel htmlFor="hw-rows-per-page">{t('rowsPerPage')}</FieldLabel>
                        <Select value={String(limit)} onValueChange={(val) => {
                            const params = new URLSearchParams(searchParams.toString())
                            params.set('limit', val)
                            params.set('page', '1')
                            router.push(`?${params.toString()}`)
                        }}>
                            <SelectTrigger className="w-20" id="hw-rows-per-page">
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
        </div>
    )
}

export default GroupHomeworks
