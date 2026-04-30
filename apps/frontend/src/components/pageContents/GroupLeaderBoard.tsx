"use client"

import { useAuthStore } from "@/lib/stores/authStore";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { TokenPayload } from "@/lib/types/token_payload";
import { PaginationType } from "@/lib/types/groups";


const GroupLeaderBoard = ({ groupId }: { groupId: string }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const page = Number(searchParams.get('page') ?? 1);
    const limit = Number(searchParams.get('limit') ?? 10);
    const token = useAuthStore((state) => state.token);
    const queryClient = useQueryClient();
    const API = process.env.NEXT_PUBLIC_API_URL;

    const { data: groupData } = useSuspenseQuery({
        queryKey: ["group", groupId],
        queryFn: async () => {
            const res = await axios.get(`${API}/group/${groupId}`, { headers: { Authorization: `Bearer ${token}` } });
            return res.data;
        },
    })

    const { data: groupStudentsData } = useSuspenseQuery({
        queryKey: ["group-leaderboard", groupId, page, limit],
        queryFn: async () => {
            const res = await axios.get(`${API}/student-score/leaderboard/${groupId}`, { headers: { Authorization: `Bearer ${token}` }, params: { page, limit } })
            return res.data;
        }
    });

    const groupStudents: TokenPayload[] = groupStudentsData.data.length > 0 ? groupStudentsData.data : [];
    const meta: PaginationType = groupStudentsData?.meta ?? {}
    const lastPage = meta?.last_page ?? 1;
    return (
        <div>
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
                        <TableHead className="w-24 text-start font-bold text-lg">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {groupStudents.map((s, idx) => {

                        return (<TableRow key={s.id}>
                            <TableCell className="text-center">{idx + 1}</TableCell>
                            <TableCell className="text-center hover:cursor-pointer" onClick={() => router.push(`/groups/${groupId}/${s.id}`)}>{s.username}</TableCell>
                            <TableCell className="text-center"> {new Date().toISOString().split("T")[0]}</TableCell>
                            <TableCell className="text-center">{s?.total ?? 0}</TableCell>
                        </TableRow>)
                    })}
                </TableBody>
            </Table>
        </div>
    )
}

export default GroupLeaderBoard