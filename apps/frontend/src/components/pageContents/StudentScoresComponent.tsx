"use client"

import { useStudents } from "@/lib/hooks/studentsHook";
import { useAuthStore } from "@/lib/stores/authStore";
import { StudentScoreResponse } from "@/lib/types/score_type";
import { TokenPayload, UpdateScorePayload } from "@/lib/types/token_payload";
import axios from "axios";
import { useMemo, useState } from "react";
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
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '../ui/button';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
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
import { Menu, Edit } from 'lucide-react';
import { Field, FieldLabel, FieldGroup, } from "@/components/ui/field"
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation';
import LineGraph from "../LineGraph";
import { toast } from "sonner";
import { Input } from "../ui/input";

const StudentScoresComponent = ({ groupId, studentId }: { groupId: string, studentId: string }) => {
    const token = useAuthStore((state) => state.token);
    const searchParams = useSearchParams();
    const page = Number(searchParams.get('page') ?? 1);
    const limit = Number(searchParams.get('limit') ?? 10)
    const API = process.env.NEXT_PUBLIC_API_URL;
    const { data: students = [] } = useStudents()
    const router = useRouter();
    const [openUpdate, setOpenUpdate] = useState(false);
    const [comment, setComment] = useState<string>("");
    const [value, setValue] = useState<number>(0);
    const [type, setType] = useState<"HOMEWORK" | "ATTENDANCE">("HOMEWORK");
    const queryClient = useQueryClient();
    const [selectedDate, setSelectedDate] = useState<string>("");




    const { data: studentScoreReport } = useSuspenseQuery<StudentScoreResponse>({
        queryKey: ["studentScores", studentId, groupId, page, limit],
        queryFn: async () => {
            const res = await axios.get(`${API}/student-score/one-student/${studentId}/${groupId}`, { headers: { Authorization: `Bearer ${token}` }, params: { page, limit }, });
            return res.data;
        },
    });
    console.log(studentScoreReport)

    const updateScoresMutation = useMutation({
        mutationFn: async (payload: UpdateScorePayload) => {
            const { studentId, groupId, date, type, value, comment } = payload;
            return await axios.put(`${API}/student-score/update/${studentId}/${groupId}`, { date, comment, type, value, homeworkScore: type === "HOMEWORK" ? value : undefined, attendanceScore: type === "ATTENDANCE" ? value : undefined }, { headers: { Authorization: `Bearer ${token}` } });
        },
        onSuccess: () => {
            toast.success('Scores updated successfully!');
            setOpenUpdate(false);
            setValue(0),
                setComment("");
            setType("HOMEWORK");
            queryClient.invalidateQueries({
                queryKey: ['students', groupId],
                exact: false,
            })
            queryClient.invalidateQueries({ queryKey: ['group', groupId] });

        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message ?? 'Something went wrong');
        }
    })

    const student = useMemo(() => {
        return students.find((s: TokenPayload) => s.id === studentId);
    }, [studentId, students])

    const rows = studentScoreReport.scores;

    if (!student) {
        return <div className="text-gray-500">Loading student...</div>;
    }

    const lastPage = studentScoreReport.last_page;

    return (
        <div>
            <Table>
                <TableCaption className="font-bold text-xl text-black">Total (all time): {studentScoreReport.total?.total}</TableCaption>
                <TableHeader>
                    <TableRow key={groupId}>
                        <TableHead className="w-12 text-center text-lg font-bold">&#8470;</TableHead>
                        <TableHead className="w-48 text-center text-lg font-bold">Homework</TableHead>
                        <TableHead className="w-48 text-center font-bold text-lg">Attendance</TableHead>
                        <TableHead className="w-48 text-center font-bold text-lg">Date</TableHead>
                        <TableHead className="w-24 text-center text-lg font-bold">Total</TableHead>
                        <TableHead className="w-48 text-center font-bold text-lg">Comment</TableHead>
                        <TableHead className="w-24 text-start text-lg font-bold">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((row, idx) => (
                        <TableRow key={idx}>
                            <TableCell className="text-center">{idx + 1}</TableCell>
                            <TableCell className="text-center">{row.homework}</TableCell>
                            <TableCell className="text-center">{row.attendance}</TableCell>
                            <TableCell className="text-center">{row.date}</TableCell>
                            <TableCell className="text-center">
                                {row.homework + row.attendance}
                            </TableCell>
                            <TableCell className="text-center">{row.comment}</TableCell>
                            <TableCell className="translate-x-5">
                                <DropdownMenu>
                                    <DropdownMenuTrigger>
                                        <Menu className="h-5 w-5" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start">
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem onClick={() => { setOpenUpdate(true); const currentType = row.homework > 0 ? 'HOMEWORK' : 'ATTENDANCE'; setType(currentType); setValue(currentType === 'HOMEWORK' ? row.homework : row.attendance); setSelectedDate(row.date); setComment(row.comment ?? "") }}>
                                                <Edit /> Update
                                            </DropdownMenuItem>
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
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

            {/* update student scores modal */}
            <Dialog open={openUpdate} onOpenChange={setOpenUpdate}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Edit Student Scores</DialogTitle>
                        <DialogDescription>
                            Make changes to the student's scores here. Click save when you&apos;re
                            done.
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <Select onValueChange={(v: "HOMEWORK" | "ATTENDANCE") => setType(v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="HOMEWORK">Homework</SelectItem>
                                <SelectItem value="ATTENDANCE">Attendance</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input
                            type="number"
                            value={value}
                            onChange={(e) => setValue(Number(e.target.value))}
                        />
                        <Input
                            type="text"
                            placeholder="Comment"
                            value={comment ?? ""}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose>
                            Cancel
                        </DialogClose>
                        <Button type="submit" onClick={() => studentId && updateScoresMutation.mutate({ studentId, groupId, date: selectedDate, type, value, comment: comment.trim() === "" ? undefined : comment })}>Update</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <LineGraph groupId={groupId} studentId={studentId} />
        </div>
    )
}

export default StudentScoresComponent