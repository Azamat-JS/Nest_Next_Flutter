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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, Edit, Trash } from 'lucide-react';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from '../ui/badge';
import { TokenPayload } from '@/lib/types/token_payload';
import AddScoreDrawer from '../AddScoreDrawer';
import { useSuspenseQuery } from '@tanstack/react-query';
import { StudentScoreRow } from '@/lib/types/score_type';
import { useQueryClient, useMutation } from "@tanstack/react-query";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Button } from '../ui/button';

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
    const [homeworkScore, setHomeworkScore] = useState<string>("");
    const [attendanceScore, setAttendanceScore] = useState<string>("");
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
            return await axios.put(`${API}/student-score/update${studentId}/${groupId}`, { homeworkScore, attendanceScore }, { headers: { Authorization: `Bearer ${token}` } });
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
            toast.success('Student deleted from this group!');
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
                            <TableCell className="translate-x-5">
                                <DropdownMenu>
                                    <DropdownMenuTrigger>
                                        <Menu className="h-5 w-5" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start">
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem onClick={() => { setOpenUpdate(true); setSelectedStudent(s) }}>
                                                <Edit /> Update
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => { setOpenDelete(true); setSelectedStudent(s) }} className="text-red-500">
                                                <Trash /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
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

            {/* update user modal */}
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
                        <Field>
                            <Label htmlFor="homework-1">Homework Score</Label>
                            <Input id="homework-1" name="homework" onChange={(e) => setHomeworkScore(e.target.value)} value={homeworkScore} />
                        </Field>
                        <Field>
                            <Label htmlFor="attendance-1">Attendance Score</Label>
                            <Input id="attendance-1" name="attendance" onChange={(e) => setAttendanceScore(e.target.value)} value={attendanceScore} />
                        </Field>
                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose>
                            Cancel
                        </DialogClose>
                        <Button type="submit" onClick={() => selectedStudent && updateScoresMutation.mutate({ studentId: selectedStudent?.id, groupId, homeworkScore: homeworkScore, attendanceScore: attendanceScore })}>Update</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* delete user modal */}
            <Dialog open={openDelete} onOpenChange={setOpenDelete}>
                <form>
                    <DialogContent className="sm:max-w-sm">
                        <DialogHeader>
                            <DialogTitle>Delete profile</DialogTitle>
                            <DialogDescription>
                                Are you sure to delete this user?
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <DialogClose>
                                Cancel
                            </DialogClose>
                            <Button type="submit" onClick={() => selectedStudent && deleteStudentMutation.mutate({ studentId: selectedStudent?.id, groupId })} variant="destructive">Delete</Button>
                        </DialogFooter>
                    </DialogContent>
                </form>
            </Dialog>
        </div>
    )
}

export default GroupDetailsComponent