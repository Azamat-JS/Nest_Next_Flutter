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
];

const currentYear = new Date().getFullYear();

const years = [
    String(currentYear),
    String(currentYear - 1),
    String(currentYear - 2),
];

const LineGraph = ({ studentId, groupId }: { studentId: string, groupId: string }) => {
    const [date, setDate] = React.useState<Date>(new Date());
    const API = process.env.NEXT_PUBLIC_API_URL;
    const token = useAuthStore((state) => state.token);
    const [month, setMonth] = useState(
        String(new Date().getMonth() + 1)
    );

    const [year, setYear] = useState(
        String(new Date().getFullYear())
    );


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
            <div className="flex justify-end gap-3">

                {/* Month Select */}
                <Select
                    value={month}
                    onValueChange={setMonth}
                >
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Select month" />
                    </SelectTrigger>

                    <SelectContent>
                        <SelectGroup>
                            {months.map((m) => (
                                <SelectItem
                                    key={m.value}
                                    value={m.value}
                                >
                                    {m.label}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>

                {/* Year Select */}
                <Select
                    value={year}
                    onValueChange={setYear}
                >
                    <SelectTrigger className="w-32">
                        <SelectValue placeholder="Select year" />
                    </SelectTrigger>

                    <SelectContent>
                        <SelectGroup>
                            {years.map((y) => (
                                <SelectItem
                                    key={y}
                                    value={y}
                                >
                                    {y}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>

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