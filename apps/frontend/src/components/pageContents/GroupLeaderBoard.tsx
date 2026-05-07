"use client"

import { useAuthStore } from "@/lib/stores/authStore";
import { useSuspenseQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { LeaderBoardType } from "@/lib/types/token_payload";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AddStudentPayload, GroupType, PaginationType } from "@/lib/types/groups"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
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
import { useRouter } from "next/navigation";

const GroupLeaderBoard = ({ groupId }: { groupId: string }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const page = Number(searchParams.get('page') ?? 1);
    const limit = Number(searchParams.get('limit') ?? 10);
    const token = useAuthStore((state) => state.token);
    const API = process.env.NEXT_PUBLIC_API_URL;

    const { data: groupStudentsData } = useSuspenseQuery({
        queryKey: ["group-leaderboard", groupId, page, limit],
        queryFn: async () => {
            const res = await axios.get(`${API}/student-score/leaderboard/${groupId}`, { headers: { Authorization: `Bearer ${token}` }, params: { page, limit } })
            return res.data;
        }
    });

    const getRankStyle = (idx: number) => {
        switch (idx) {
            case 0:
                return "bg-blue-200 text-blue-800 font-semibold";
            case 1:
                return "bg-green-200 text-green-800 font-semibold";
            case 2:
                return "bg-yellow-200 text-yellow-800 font-semibold";
            default:
                return "";
        }
    };

    const groupStudents: LeaderBoardType[] = groupStudentsData.data.length > 0 ? groupStudentsData.data : [];
    const meta: PaginationType = groupStudentsData?.meta ?? {}
    const lastPage = meta?.last_page ?? 1;
    return (
        <>
            <Table>
                <TableCaption className="text-center font-bold text-lg">
                    Showing {groupStudentsData.length} of {meta?.total ?? 0} students
                </TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12 text-center font-bold text-lg">&#8470;</TableHead>
                        <TableHead className="w-48 text-center font-bold text-lg">Name</TableHead>
                        <TableHead className="w-48 text-center font-bold text-lg">Homework</TableHead>
                        <TableHead className="w-48 text-center font-bold text-lg">Attendance</TableHead>
                        <TableHead className="w-48 text-center font-bold text-lg">Total Score</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {groupStudents.map((s, idx) => {
                        const rankStyle = getRankStyle(idx);
                        return (<TableRow key={idx} className={rankStyle}>
                            <TableCell className="text-center">{idx + 1}</TableCell>
                            <TableCell className="text-center">{s.student.username}</TableCell>
                            <TableCell className="text-center"> {s.homework ?? 0}</TableCell>
                            <TableCell className="text-center">{s.attendance ?? 0}</TableCell>
                            <TableCell className="text-center">{s.total ?? 0}</TableCell>
                        </TableRow>)
                    })}
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
        </>
    )
}

export default GroupLeaderBoard