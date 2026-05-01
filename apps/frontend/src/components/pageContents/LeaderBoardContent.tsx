"use client"

import { useSuspenseQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuthStore } from "@/lib/stores/authStore";
import { GroupType, PaginationType } from "@/lib/types/groups";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { LeaderBoardType } from "@/lib/types/token_payload";
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
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Field, FieldLabel, } from "@/components/ui/field"

import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

const LeaderBoardContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const page = Number(searchParams.get('page') ?? 1);
    const limit = Number(searchParams.get('limit') ?? 10);
    const API = process.env.NEXT_PUBLIC_API_URL;
    const token = useAuthStore((state) => state.token);



    const { data } = useSuspenseQuery({
        queryKey: ["students-scores"],
        queryFn: async () => {
            const res = await axios.get(`${API}/student-score/leaderboard`, { headers: { Authorization: `Bearer ${token}` } });
            return res.data;
        },
    })
    const group: GroupType = data;


    const { data: studentsScoreData } = useSuspenseQuery({
        queryKey: ["group-leaderboard", page, limit],
        queryFn: async () => {
            const res = await axios.get(`${API}/student-score/leaderboard`, { headers: { Authorization: `Bearer ${token}` }, params: { page, limit } })
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

    const studentsScores: LeaderBoardType[] = studentsScoreData.data.length > 0 ? studentsScoreData.data : [];
    const meta: PaginationType = studentsScoreData?.meta ?? {}
    const lastPage = meta?.last_page ?? 1;

    return (
        <div className='flex flex-col w-full'>
            <header className='flex items-center gap-6 justify-center text-center mb-4'>
                <Badge className='w-40 h-8 hover:cursor-pointer font-semibold text-lg'>Leader Board</Badge> -
            </header>

            <Table>
                <TableCaption className="text-center font-bold text-lg">
                    Showing {studentsScoreData.length} of {meta?.total ?? 0} students
                </TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12 text-center font-bold text-lg">&#8470;</TableHead>
                        <TableHead className="w-48 text-center font-bold text-lg">Group Name</TableHead>
                        <TableHead className="w-48 text-center font-bold text-lg">Name</TableHead>
                        <TableHead className="w-48 text-center font-bold text-lg">Homework</TableHead>
                        <TableHead className="w-48 text-center font-bold text-lg">Attendance</TableHead>
                        <TableHead className="w-48 text-center font-bold text-2xl text-blue-800">Total Score</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {studentsScores.map((s, idx) => {
                        const rankStyle = getRankStyle(idx);
                        return (<TableRow key={idx} className={rankStyle}>
                            <TableCell className="text-center">{idx + 1}</TableCell>
                            <TableCell className="text-center">{s.group?.name || ""}</TableCell>
                            <TableCell className="text-center">{s.student.username}</TableCell>
                            <TableCell className="text-center"> {s.homework ?? 0}</TableCell>
                            <TableCell className="text-center">{s.attendance ?? 0}</TableCell>
                            <TableCell className="text-center font-bold text-blue-800 text-lg">{s.total ?? 0}</TableCell>
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
        </div>


    )
}

export default LeaderBoardContent;