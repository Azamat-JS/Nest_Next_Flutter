'use client'
import { useAuthStore } from '@/lib/stores/authStore';
import { GroupType } from '@/lib/types/groups';
import axios from 'axios';
import { useState } from 'react';
import { toast } from 'sonner';
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
import { Menu } from 'lucide-react';
import { Badge } from '../ui/badge';
import { TokenPayload } from '@/lib/types/token_payload';
import AddScoreDrawer from '../AddScoreDrawer';
import { useSuspenseQuery } from '@tanstack/react-query';
import { StudentScoreRow } from '@/lib/types/score_type';
import { useQueryClient, useMutation } from "@tanstack/react-query";

type UpdateScorePayload = {
    studentId: string;
    groupId: string;
    homeworkScore?: string;
    attendanceScore?: string;
};

type DeleteStudentPayload = {
    studentId: string;
    groupId: string;
}


const GroupDetailsComponent = ({ groupId }: { groupId: string }) => {
    const token = useAuthStore((state) => state.token);
    const [openCreate, setOpenCreate] = useState(false);
    const [openUpdate, setOpenUpdate] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<TokenPayload | null>(null);
    const API = process.env.NEXT_PUBLIC_API_URL;
    const queryClient = useQueryClient();




    const { data } = useSuspenseQuery({
        queryKey: ["group", groupId],
        queryFn: async () => {
            const res = await axios.get(`${API}/group/${groupId}`, { headers: { Authorization: `Bearer ${token}` } });
            return res.data;
        },
    })

    const updateScoresMutation = useMutation({
        mutationFn: async (payload: UpdateScorePayload) => {
            const { studentId, groupId, homeworkScore, attendanceScore } = payload;
            return await axios.put(`${API}/student-score/${studentId}/${groupId}`, { homeworkScore, attendanceScore }, { headers: { Authorization: `Bearer ${token}` } });
        },
        onSuccess: () => {
            toast.success('Scores updated successfully!');
            setOpenUpdate(false);
            queryClient.invalidateQueries({
                queryKey: ['students', groupId],
                exact: false,
            })
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message ?? 'Something went wrong');
        }
    })

    const deleteStudentMutation = useMutation({
        mutationFn: async (payload: DeleteStudentPayload) => {
            const { studentId, groupId } = payload;
            return await axios.delete(`${API}/student-score/${studentId}/${groupId}`, { headers: { Authorization: `Bearer ${token}` } });
        },
        onSuccess: () => {
            toast.success('Student deleted successfully!');
            setOpenDelete(false);
            queryClient.invalidateQueries({
                queryKey: ['students', groupId],
                exact: false,
            })
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message ?? 'Something went wrong');

        }
    })

    const { data: studentScores } = useSuspenseQuery({
        queryKey: ["students", groupId],
        queryFn: async () => {
            const res = await axios.get(`${API}/student-score/all/students/${groupId}`, { headers: { Authorization: `Bearer ${token}` } });
            return res.data;
        },
    })


    const group: GroupType = data;
    const students: TokenPayload[] = data?.students?.length > 0 ? data.students : [];

    const rows: StudentScoreRow[] = studentScores;
    console.log(rows)
    const scoreMap = new Map<string, StudentScoreRow>();
    studentScores.forEach((s: StudentScoreRow) => {
        scoreMap.set(s.studentId, s);
    })

    return (
        <div className='flex flex-col w-full'>
            <header className='flex items-center gap-6 justify-center text-center'>
                <Badge className='w-40 h-8 font-semibold text-lg'>{group?.name}</Badge> -
                <Badge className='w-40 h-8 text-lg' variant="outline">Teacher: {group?.teacher?.username}</Badge>
            </header>
            <Table>
                <TableCaption>Students of the group.</TableCaption>
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
                    {students.map((s, idx) => {
                        const score = scoreMap.get(s.id);
                        return (<TableRow key={s.id}>
                            <TableCell className="text-center">{idx + 1}</TableCell>
                            <TableCell className="text-center">{s.username}</TableCell>
                            <TableCell className="text-center">{score?.homework ?? 0}</TableCell>
                            <TableCell className="text-center">{score?.attendance ?? 0}</TableCell>
                            <TableCell className="text-center">{score?.total ?? 0}</TableCell>
                            <TableCell className=''><Menu className='h-5 w-5' /></TableCell>
                        </TableRow>)
                    })}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={3}>Total: {students.length} students</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
            <div className='flex justify-end mr-5 mt-4'>
                <AddScoreDrawer openCreate={openCreate} setOpenCreate={setOpenCreate} students={students} groupId={groupId} onScoreAdded={() => queryClient.invalidateQueries({
                    queryKey: ['students', groupId],
                    exact: false,
                })} />
            </div>
        </div>
    )
}

export default GroupDetailsComponent