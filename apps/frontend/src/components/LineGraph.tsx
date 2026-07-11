'use client'

import React, { useMemo, useState } from "react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import api from "@/lib/api"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const monthValues = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"] as const

const currentYear = new Date().getFullYear()
const years = [String(currentYear), String(currentYear - 1), String(currentYear - 2)]

const LineGraph = ({ studentId, groupId }: { studentId: string; groupId: string }) => {
    const [month, setMonth] = useState(String(new Date().getMonth() + 1))
    const [year, setYear] = useState(String(currentYear))
    const t = useTranslations('LineGraph')
    const tMonths = useTranslations('Common.months')

    const { data: chartReport } = useSuspenseQuery({
        queryKey: ['student-score-chart', studentId, groupId, month, year],
        queryFn: async () => {
            const res = await api.get(`/student-score/chart/${studentId}/${groupId}`, { params: { month, year } })
            return res.data
        },
        staleTime: 1000 * 60 * 5,
    })

    const chartData = useMemo(() => {
        return chartReport.scores.map((item: any) => ({
            date: item.date,
            homework: item.homework,
            attendance: item.attendance,
            total: item.homework + item.attendance,
        }))
    }, [chartReport])

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{t('title')}</h3>
                <div className="flex gap-2">
                    <Select value={month} onValueChange={setMonth}>
                        <SelectTrigger className="w-36">
                            <SelectValue placeholder={t('monthPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {monthValues.map((m) => (
                                    <SelectItem key={m} value={m}>{tMonths(m)}</SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
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
            </div>

            <div className="h-72 w-full rounded-lg border p-4">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="homework" stroke="#2563eb" strokeWidth={2} name={t('homework')} dot={false} />
                        <Line type="monotone" dataKey="attendance" stroke="#16a34a" strokeWidth={2} name={t('attendance')} dot={false} />
                        <Line type="monotone" dataKey="total" stroke="#dc2626" strokeWidth={2} name={t('total')} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

export default LineGraph
