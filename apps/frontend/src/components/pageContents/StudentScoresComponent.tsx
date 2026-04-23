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

    const lastPage = meta?.last_page ?? 1;

    return (
        <div>
            <Table>
                <TableCaption className="font-bold text-xl text-black">Total - {grandTotal}</TableCaption>
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
            </Table>

            {/* pagination */}
            <div className="grid grid-cols-2 items-center mt-4">

                <div className="flex justify-center">
                    <Field orientation="horizontal" className="w-fit">
                        <FieldLabel htmlFor="select-rows-per-page">Rows per page</FieldLabel>
                        <Select value={String(limit)} onValueChange={(val) => {
                            const params = new URLSearchParams(searchParams.toString());
                            params.set('limit', val);
                            params.set('page', '1');
                            router.push(`?${params.toString()}`);
                        }}>
                            <SelectTrigger className="w-20" id="select-rows-per-page">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent align="start">
                                <SelectGroup>
                                    <SelectItem value="5" >5</SelectItem>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="15">15</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </Field>
                </div>
                <div className="flex justify-end">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious href={`?page=${Math.max(1, page - 1)}&limit=${limit}`} />
                            </PaginationItem>
                            {Array.from({ length: lastPage }).map((_, idx) => (
                                <PaginationItem key={idx}>
                                    <PaginationLink href={`?page=${idx + 1}&limit=${limit}`} isActive={page === idx + 1}>{idx + 1}</PaginationLink>
                                </PaginationItem>
                            )
                            )}

                            <PaginationItem>
                                <PaginationNext href={`?page=${Math.min(lastPage, page + 1)}&limit=${limit}`} />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </div>
        </div>
    )
}

export default StudentScoresComponent