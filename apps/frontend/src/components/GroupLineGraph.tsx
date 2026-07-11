'use client'

import { useState, useMemo } from 'react'
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
} from "recharts"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import api from '@/lib/api'

const currentYear = new Date().getFullYear()
const years = [String(currentYear), String(currentYear - 1), String(currentYear - 2)]

const GroupLineGraph = ({ groupId }: { groupId: string }) => {
    const [year, setYear] = useState(String(currentYear))
    const t = useTranslations('GroupLineGraph')

    const { data: groupReport } = useSuspenseQuery({
        queryKey: ['group-score-chart', year, groupId],
        queryFn: async () => {
            const res = await api.get(`/student-score/group-chart/${groupId}`, { params: { year } })
            return res.data
        },
        staleTime: 1000 * 60 * 5,
    })

    const chartData = useMemo(() => {
        return groupReport.scores.map((item: any) => ({
            month: item.month,
            homework: item.homework,
            attendance: item.attendance,
            total: item.total,
        }))
    }, [groupReport])

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{t('title')}</h3>
                <Select value={year} onValueChange={setYear}>
                    <SelectTrigger className="w-28">
                        <SelectValue placeholder={t('yearPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            {years.map((y) => (
                                <SelectItem key={y} value={y}>{y}</SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>

            <div className="h-72 w-full rounded-lg border p-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="homework" fill="#2563eb" name={t('homework')} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="attendance" fill="#16a34a" name={t('attendance')} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="total" fill="#dc2626" name={t('total')} radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

export default GroupLineGraph
