"use client"

import { useStudents } from "@/lib/hooks/studentsHook";
import { useAuthStore } from "@/lib/stores/authStore";
import { StudentScoreResponse } from "@/lib/types/score_type";
import { TokenPayload } from "@/lib/types/token_payload";
import axios from "axios";
import { useMemo } from "react";
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
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field, FieldLabel } from "@/components/ui/field"
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation';
import { Menu, Edit, Trash } from 'lucide-react';



const StudentScoresComponent = ({ groupId, studentId }: { groupId: string, studentId: string }) => {
    const token = useAuthStore((state) => state.token);
    const queryClient = useQueryClient();
    const API = process.env.NEXT_PUBLIC_API_URL;
    const { data: students = [] } = useStudents()
    const router = useRouter();


    const { data: studentScoreReport } = useSuspenseQuery<StudentScoreResponse>({
        queryKey: ["studentScores", studentId, groupId],
        queryFn: async () => {
            const res = await axios.get(`${API}/student-score/one-student/${studentId}/${groupId}`, { headers: { Authorization: `Bearer ${token}` } });
            return res.data;
        },
    });


    const student = useMemo(() => {
        return students.find((s: TokenPayload) => s.id === studentId);
    }, [studentId, students])

    const groupedByDate = useMemo(() => {
        return studentScoreReport.scores.reduce((acc, score) => {
            const date = new Date(score.date).toISOString().split('T')[0];

            acc[date] ??= { homework: 0, attendance: 0 };

            if (score.type === 'HOMEWORK') acc[date].homework += score.value;
            if (score.type === 'ATTENDANCE') acc[date].attendance += score.value;

            return acc;
        }, {} as Record<string, { homework: number; attendance: number }>);
    }, [studentScoreReport]);

    const grandTotal = useMemo(() => {
        return Object.values(groupedByDate).reduce((sum, day) => {
            return sum + day.homework + day.attendance;
        }, 0)
    }, [groupedByDate]);

    console.log(groupedByDate)
    if (!student) {
        return <div className="text-gray-500">Loading student...</div>;
    }

    return (
        <div>
            <Table>
                <TableCaption>Student Scores</TableCaption>
                <TableHeader>
                    <TableRow key={groupId}>
                        <TableHead className="w-12 text-center text-lg font-bold">&#8470;</TableHead>
                        <TableHead className="w-48 text-center text-lg font-bold">Homework</TableHead>
                        <TableHead className="w-72 text-center text-lg font-bold">Attendance</TableHead>
                        <TableHead className="w-72 text-center text-lg font-bold">Date</TableHead>
                        <TableHead className="w-24 text-center text-lg font-bold">Total</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Object.entries(groupedByDate).map(([date, value], idx) => (
                        <TableRow key={date}>
                            <TableCell className="text-center">{idx + 1}</TableCell>
                            <TableCell className="text-center">{value.homework}</TableCell>
                            <TableCell className="text-center">{value.attendance}</TableCell>
                            <TableCell className="text-center">{date}</TableCell>
                            <TableCell className="text-center">
                                {value.homework + value.attendance}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell className="text-center font-bold" colSpan={4}>
                            Total
                        </TableCell>
                        <TableCell className="text-center font-bold">
                            {grandTotal}
                        </TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </div>
    )
}

export default StudentScoresComponent