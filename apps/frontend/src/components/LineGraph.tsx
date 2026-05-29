'use client'

import React, { useMemo, useState } from "react"
import { useSuspenseQuery } from "@tanstack/react-query"
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

const months = [
    { label: "January", value: "1" },
    { label: "February", value: "2" },
    { label: "March", value: "3" },
    { label: "April", value: "4" },
    { label: "May", value: "5" },
    { label: "June", value: "6" },
    { label: "July", value: "7" },
    { label: "August", value: "8" },
    { label: "September", value: "9" },
    { label: "October", value: "10" },
    { label: "November", value: "11" },
    { label: "December", value: "12" },
]

const currentYear = new Date().getFullYear()
const years = [String(currentYear), String(currentYear - 1), String(currentYear - 2)]

const LineGraph = ({ studentId, groupId }: { studentId: string; groupId: string }) => {
    const [month, setMonth] = useState(String(new Date().getMonth() + 1))
    const [year, setYear] = useState(String(currentYear))

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
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Score Chart</h3>
                <div className="flex gap-2">
                    <Select value={month} onValueChange={setMonth}>
                        <SelectTrigger className="w-36">
                            <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {months.map((m) => (
                                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <Select value={year} onValueChange={setYear}>
                        <SelectTrigger className="w-28">
                            <SelectValue placeholder="Year" />
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
                        <Line type="monotone" dataKey="homework" stroke="#2563eb" strokeWidth={2} name="Homework" dot={false} />
                        <Line type="monotone" dataKey="attendance" stroke="#16a34a" strokeWidth={2} name="Attendance" dot={false} />
                        <Line type="monotone" dataKey="total" stroke="#dc2626" strokeWidth={2} name="Total" dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

export default LineGraph
