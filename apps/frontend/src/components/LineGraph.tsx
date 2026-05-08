'use client'

import React, { useMemo, useState } from "react"
import { format } from "date-fns"
import { ChevronDownIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useSuspenseQuery } from "@tanstack/react-query"
import axios from "axios"
import { useAuthStore } from "@/lib/stores/authStore"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { ChartResponse } from "@/lib/types/chart_type"

const LineGraph = ({ studentId, groupId }: { studentId: string, groupId: string }) => {
    const [date, setDate] = React.useState<Date>(new Date());
    const API = process.env.NEXT_PUBLIC_API_URL;
    const token = useAuthStore((state) => state.token);
    const month = String(date.getMonth() + 1);
    const year = String(date.getFullYear());


    const { data: chartReport } = useSuspenseQuery({
        queryKey: ['student-score-chart', studentId, groupId, month, year],
        queryFn: async () => {
            const res = await axios.get(`${API}/student-score/chart/${studentId}/${groupId}`, { params: { month, year }, headers: { "Authorization": `Bearer ${token}` } });
            return res.data;
        }
    });

    const chartData = useMemo(() => {
        return chartReport.scores.map((item: any) => ({
            date: item.date,
            homework: item.homework,
            attendance: item.attendance,
            total: item.homework + item.attendance,
        }))
    }, [chartReport]);

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            data-empty={!date}
                            className="w-53 justify-between"
                        >
                            {format(date, "MMMM yyyy")}
                            <ChevronDownIcon />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(d) => d && setDate(d)}
                            defaultMonth={date}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            <div className="h-100 w-full">
                <ResponsiveContainer width="100%" height="100%">

                    <LineChart
                        data={chartData}
                        margin={{
                            top: 20,
                            right: 30,
                            left: 10,
                            bottom: 10,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="homework" stroke="#2563eb"
                            strokeWidth={2}
                            name="Homework" />
                        <Line type="monotone" dataKey="attendance" stroke="#16a34a"
                            strokeWidth={2}
                            name="Attendance" />
                        <Line type="monotone" dataKey="total" stroke="#dc2626"
                            strokeWidth={2}
                            name="Total" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

export default LineGraph