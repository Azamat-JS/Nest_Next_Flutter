import { useAuthStore } from '@/lib/stores/authStore';
import { useState, useMemo } from 'react';
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
import { useSuspenseQuery } from '@tanstack/react-query';
import axios from 'axios';


const GroupLineGraph = ({ groupId }: { groupId: string }) => {
    const API = process.env.NEXT_PUBLIC_API_URL;
    const token = useAuthStore((state) => state.token);

    const [year, setYear] = useState(
        String(new Date().getFullYear())
    );

    const { data: groupReport } = useSuspenseQuery({
        queryKey: ['group-score-chart', year, groupId],
        queryFn: async () => {
            const res = await axios.get(`${API}/group-chart/${groupId}`, { headers: { "Authorization": `Bearer ${token}` }, params: { year } });
            return res.data;
        }
    })

    const chartData = useMemo(() => {
        return groupReport.scores.map((item: any) => ({
            date: item.date,
            homework: item.homework,
            attendance: item.attendance,
            total: item.homework + item.attendance,
        }));
    }, [groupReport]);

    const currentYear = new Date().getFullYear();

    const years = [
        String(currentYear),
        String(currentYear - 1),
        String(currentYear - 2),
    ];
    return (
        <div className="space-y-4">
            <div className="flex justify-end gap-3">
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
                            bottom: 20,
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

export default GroupLineGraph