import { useAuthStore } from '@/lib/stores/authStore';
import { useState, useMemo } from 'react';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
} from "recharts";

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
            const res = await axios.get(`${API}/student-score/group-chart/${groupId}`, { headers: { "Authorization": `Bearer ${token}` }, params: { year } });
            return res.data;
        }
    })

    const chartData = useMemo(() => {
        return groupReport.scores.map((item: any) => ({
            month: item.month,
            homework: item.homework,
            attendance: item.attendance,
            total: item.total
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

                    <BarChart
                        data={chartData}
                        margin={{
                            top: 20,
                            right: 30,
                            left: 10,
                            bottom: 20,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="homework"
                            fill="#2563eb"
                            name="Homework"
                            radius={[4, 4, 0, 0]} />
                        <Bar dataKey="attendance"
                            fill="#16a34a"
                            name="Attendance"
                            radius={[4, 4, 0, 0]}
                        />
                        <Bar dataKey="total"
                            fill="#dc2626"
                            name="Total"
                            radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

export default GroupLineGraph