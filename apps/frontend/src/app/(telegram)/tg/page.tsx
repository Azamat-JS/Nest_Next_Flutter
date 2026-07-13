"use client"

import { useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Loader2, ChevronRight, Users } from "lucide-react"
import { useTranslations } from "next-intl"
import api from "@/lib/api"
import { useTgStore } from "@/lib/stores/tgStore"
import { PortalBootstrap } from "@/lib/types/portal"
import { Card, CardContent } from "@/components/ui/card"

type GroupChoice = {
    groupId: string
    groupName: string
    teacherName: string
    // Student whose scores this entry is about: the child for parents, null
    // for students themselves.
    studentId: string | null
    studentName: string | null
}

export default function TgEntryPage() {
    const router = useRouter()
    const setSelection = useTgStore((s) => s.setSelection)
    const t = useTranslations('TgHome')

    const { data, isPending, isError } = useQuery({
        queryKey: ['tg-bootstrap'],
        queryFn: async () => (await api.get<PortalBootstrap>('/portal/bootstrap')).data,
    })

    const choices = useMemo<GroupChoice[]>(() => {
        if (!data) return []
        if (data.role === 'STUDENT' || data.role === 'ADMIN' || data.role === 'TEACHER') {
            return (data.groups ?? []).map((g) => ({
                groupId: g.id,
                groupName: g.name,
                teacherName: `${g.teacher.firstName} ${g.teacher.lastName ?? ''}`.trim(),
                // Admins/teachers aren't enrolled in a group, so there is no
                // single "own" student - the group page shows the group at large.
                studentId: data.role === 'STUDENT' ? data.me.id : null,
                studentName: null,
            }))
        }
        return (data.children ?? []).flatMap((child) =>
            child.groups.map((g) => ({
                groupId: g.id,
                groupName: g.name,
                teacherName: `${g.teacher.firstName} ${g.teacher.lastName ?? ''}`.trim(),
                studentId: child.id,
                studentName: `${child.firstName} ${child.lastName ?? ''}`.trim(),
            })),
        )
    }, [data])

    // One possible destination -> skip the picker entirely.
    useEffect(() => {
        if (choices.length === 1) {
            const only = choices[0]
            setSelection(only.groupId, only.studentId)
            router.replace(`/tg/groups/${only.groupId}${only.studentId ? `?student=${only.studentId}` : ''}`)
        }
    }, [choices, router, setSelection])

    if (isPending || choices.length === 1) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (isError) {
        return <p className="py-16 text-center text-sm text-muted-foreground">{t('loadError')}</p>
    }

    if (choices.length === 0) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 text-center">
                <Users className="h-10 w-10 text-muted-foreground" />
                <p className="font-semibold">
                    {data?.role === 'PARENT'
                        ? t('noGroupsParent')
                        : data?.role === 'ADMIN' || data?.role === 'TEACHER'
                            ? t('noGroupsAdmin')
                            : t('noGroupsStudent')}
                </p>
                <p className="text-sm text-muted-foreground">{t('contactCenter')}</p>
            </div>
        )
    }

    return (
        <div className="space-y-3 py-4">
            <h1 className="text-lg font-bold">
                {data?.role === 'PARENT'
                    ? t('chooseGroupParent')
                    : data?.role === 'ADMIN' || data?.role === 'TEACHER'
                        ? t('chooseGroupAdmin')
                        : t('chooseGroupStudent')}
            </h1>
            {choices.map((choice) => (
                <Card
                    key={`${choice.studentId}-${choice.groupId}`}
                    className="cursor-pointer transition-colors hover:bg-muted/50"
                    onClick={() => {
                        setSelection(choice.groupId, choice.studentId)
                        router.push(`/tg/groups/${choice.groupId}${choice.studentId ? `?student=${choice.studentId}` : ''}`)
                    }}
                >
                    <CardContent className="flex items-center justify-between py-4">
                        <div>
                            <p className="font-semibold">{choice.groupName}</p>
                            <p className="text-sm text-muted-foreground">
                                {choice.studentName
                                    ? t('studentTeacher', { studentName: choice.studentName, teacherName: choice.teacherName })
                                    : t('teacherOnly', { teacherName: choice.teacherName })}
                            </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
