'use client'

import { useMemo, useState } from "react"
import Link from "next/link"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import api from "@/lib/api"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { DashboardSchedule, ScheduleLesson } from "@/lib/types/dashboard"
import { useAuthStore } from "@/lib/stores/authStore"

const WEEK_DAYS = [1, 2, 3, 4, 5, 6, 7] as const
const DAY_KEYS = ['1', '2', '3', '4', '5', '6', '7'] as const
const INTERVALS = [15, 30, 60] as const
const LANE_HEIGHT = 52
const LABEL_WIDTH = 144

// Stable per-group accent colors; blocks always carry the group name, so
// identity never relies on color alone.
const GROUP_COLORS = [
    "var(--viz-1)", "var(--viz-2)", "var(--viz-3)", "var(--viz-4)",
    "var(--viz-5)", "var(--viz-6)", "var(--viz-7)", "var(--viz-8)",
]

const toMinutes = (time: string) => {
    const [hour, minute] = time.split(':').map(Number)
    return hour * 60 + minute
}

const toTimeLabel = (minutes: number) =>
    `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`

type PlacedLesson = ScheduleLesson & { start: number; end: number; lane: number }

// First-fit lane assignment so overlapping lessons in one room stack
// vertically instead of hiding each other.
const assignLanes = (lessons: ScheduleLesson[]): { placed: PlacedLesson[]; laneCount: number } => {
    const sorted = [...lessons]
        .map(lesson => ({ ...lesson, start: toMinutes(lesson.time), end: toMinutes(lesson.time) + lesson.durationMinutes }))
        .sort((a, b) => a.start - b.start || a.end - b.end)

    const laneEnds: number[] = []
    const placed = sorted.map(lesson => {
        let lane = laneEnds.findIndex(end => end <= lesson.start)
        if (lane === -1) {
            lane = laneEnds.length
            laneEnds.push(lesson.end)
        } else {
            laneEnds[lane] = lesson.end
        }
        return { ...lesson, lane }
    })
    return { placed, laneCount: Math.max(1, laneEnds.length) }
}

const RoomTimetable = () => {
    const t = useTranslations('RoomTimetable')
    const tDays = useTranslations('Common.days')
    const role = useAuthStore((state) => state.role)

    // JS getDay(): 0 = Sunday; convert to ISO 1..7
    const todayIso = ((new Date().getDay() + 6) % 7) + 1
    const [day, setDay] = useState(todayIso)
    const [interval, setInterval] = useState(30)

    const { data: schedule } = useSuspenseQuery<DashboardSchedule>({
        queryKey: ['dashboard-schedule'],
        queryFn: async () => (await api.get('/dashboard/schedule')).data,
        staleTime: 1000 * 60 * 5,
    })

    const groupColor = useMemo(() => {
        const ids = [...new Set(schedule.lessons.map(l => l.group.id))].sort()
        return new Map(ids.map((id, i) => [id, GROUP_COLORS[i % GROUP_COLORS.length]]))
    }, [schedule.lessons])

    // Shared time range across all days so switching tabs doesn't shift columns.
    const { rangeStart, rangeEnd } = useMemo(() => {
        let start = 8 * 60
        let end = 20 * 60
        for (const lesson of schedule.lessons) {
            const lessonStart = toMinutes(lesson.time)
            start = Math.min(start, lessonStart)
            end = Math.max(end, lessonStart + lesson.durationMinutes)
        }
        return {
            rangeStart: Math.floor(start / 60) * 60,
            rangeEnd: Math.ceil(end / 60) * 60,
        }
    }, [schedule.lessons])

    const slotWidth = interval === 15 ? 56 : interval === 30 ? 72 : 96
    const slotCount = Math.ceil((rangeEnd - rangeStart) / interval)
    const trackWidth = slotCount * slotWidth
    const pxPerMinute = slotWidth / interval

    const dayLessons = schedule.lessons.filter(lesson => lesson.dayOfWeek === day)
    const hasUnassigned = dayLessons.some(lesson => !lesson.roomId)

    const rows = [
        ...schedule.rooms.map(room => ({
            key: room.id,
            name: room.name,
            ...assignLanes(dayLessons.filter(lesson => lesson.roomId === room.id)),
        })),
        ...(hasUnassigned ? [{
            key: 'unassigned',
            name: t('unassigned'),
            ...assignLanes(dayLessons.filter(lesson => !lesson.roomId)),
        }] : []),
    ]

    return (
        <Card size="sm">
            <CardHeader className="border-b">
                <CardTitle>{t('title')}</CardTitle>
                <CardAction>
                    <Select value={String(interval)} onValueChange={(value) => setInterval(Number(value))}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {INTERVALS.map((minutes) => (
                                <SelectItem key={minutes} value={String(minutes)}>
                                    {t('minutes', { count: minutes })}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardAction>
            </CardHeader>
            <CardContent className="space-y-4">
                <Tabs value={String(day)} onValueChange={(value) => setDay(Number(value))}>
                    <TabsList className="w-full justify-start overflow-x-auto">
                        {WEEK_DAYS.map((weekDay) => (
                            <TabsTrigger key={weekDay} value={String(weekDay)}>
                                {tDays(DAY_KEYS[weekDay - 1])}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>

                {rows.length === 0 ? (
                    <div className="flex h-32 flex-col items-center justify-center gap-1 text-sm text-muted-foreground">
                        <p>{t('noRooms')}</p>
                        {role === 'ADMIN' && (
                            <Link href="/settings/rooms" className="text-primary underline-offset-4 hover:underline">
                                {t('addRooms')}
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-lg border">
                        <div style={{ width: LABEL_WIDTH + trackWidth }} className="min-w-full">
                            {/* Header: time labels */}
                            <div className="flex border-b bg-muted/40">
                                <div
                                    className="sticky left-0 z-20 shrink-0 border-r bg-card px-3 py-2 text-xs font-semibold text-muted-foreground"
                                    style={{ width: LABEL_WIDTH }}
                                >
                                    {t('roomsHeader')}
                                </div>
                                {Array.from({ length: slotCount }, (_, i) => (
                                    <div
                                        key={i}
                                        className="shrink-0 border-r py-2 text-center text-xs text-muted-foreground last:border-r-0"
                                        style={{ width: slotWidth }}
                                    >
                                        {toTimeLabel(rangeStart + i * interval)}
                                    </div>
                                ))}
                            </div>

                            {/* Room rows */}
                            {rows.map((row) => (
                                <div key={row.key} className="flex border-b last:border-b-0">
                                    <div
                                        className="sticky left-0 z-20 flex shrink-0 items-center border-r bg-card px-3 text-sm font-medium"
                                        style={{ width: LABEL_WIDTH, minHeight: row.laneCount * LANE_HEIGHT }}
                                    >
                                        <span className="truncate">{row.name}</span>
                                    </div>
                                    <div
                                        className="relative shrink-0"
                                        style={{
                                            width: trackWidth,
                                            height: row.laneCount * LANE_HEIGHT,
                                            backgroundImage: `repeating-linear-gradient(to right, var(--border) 0 1px, transparent 1px ${slotWidth}px)`,
                                        }}
                                    >
                                        {row.placed.map((lesson) => {
                                            const left = (Math.max(lesson.start, rangeStart) - rangeStart) * pxPerMinute
                                            const width = (Math.min(lesson.end, rangeEnd) - Math.max(lesson.start, rangeStart)) * pxPerMinute
                                            if (width <= 0) return null
                                            const color = groupColor.get(lesson.group.id)
                                            const teacherName = [lesson.group.teacher?.firstName, lesson.group.teacher?.lastName].filter(Boolean).join(' ')
                                            const timeRange = `${toTimeLabel(lesson.start)} – ${toTimeLabel(lesson.end)}`
                                            return (
                                                <div
                                                    key={lesson.id}
                                                    className="absolute overflow-hidden rounded-md px-2 py-1"
                                                    title={`${lesson.group.name}\n${timeRange}${teacherName ? `\n${teacherName}` : ''}`}
                                                    style={{
                                                        left: left + 2,
                                                        width: Math.max(width - 4, 24),
                                                        top: lesson.lane * LANE_HEIGHT + 4,
                                                        height: LANE_HEIGHT - 8,
                                                        backgroundColor: `color-mix(in oklab, ${color} 16%, transparent)`,
                                                        borderLeft: `3px solid ${color}`,
                                                    }}
                                                >
                                                    <p className="truncate text-xs font-semibold">{lesson.group.name}</p>
                                                    <p className="truncate text-[11px] text-muted-foreground">{timeRange}</p>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default RoomTimetable
