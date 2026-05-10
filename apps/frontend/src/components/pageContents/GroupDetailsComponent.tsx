'use client'
import { useAuthStore } from '@/lib/stores/authStore';
import { AddStudentPayload, GroupType, PaginationType } from '@/lib/types/groups';
import axios from 'axios';
import { useState } from 'react';
import { toast } from 'sonner';
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
import { Menu, Edit, Trash, Home, ListChecks, Medal } from 'lucide-react';
import { Input } from "@/components/ui/input"
import { TokenPayload } from '@/lib/types/token_payload';
import AddScoreDrawer from '../AddScoreDrawer';
import { useSuspenseQuery } from '@tanstack/react-query';
import { GroupScoreResponse, StudentScoreRow } from '@/lib/types/score_type';
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
import { Field, FieldGroup, FieldLabel, } from "@/components/ui/field"
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { useStudents } from '@/lib/hooks/studentsHook';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { formatValue } from '@/lib/helper/format_score';
import { Badge } from '../ui/badge';
import GroupLineGraph from '../GroupLineGraph';

type UpdateScorePayload = {
    studentId: string;
    groupId: string;
    type: "HOMEWORK" | "ATTENDANCE";
    date: string;
    value: number;
    comment?: string;
};

type DeleteStudentPayload = {
    studentId: string;
    groupId: string;
}

const date = new Date().toISOString().split('T')[0];


const GroupDetailsComponent = ({ groupId }: { groupId: string }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const page = Number(searchParams.get('page') ?? 1);
    const limit = Number(searchParams.get('limit') ?? 10);
    const token = useAuthStore((state) => state.token);
    const [openCreate, setOpenCreate] = useState(false);
    const [openUpdate, setOpenUpdate] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [openAddStudents, setOpenAddStudents] = useState(false);
    const [newStudentIds, setNewStudentIds] = useState<string[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<TokenPayload | null>(null);
    const [type, setType] = useState<"HOMEWORK" | "ATTENDANCE">("HOMEWORK");
    const [value, setValue] = useState<number>(0); ("HOMEWORK");
    const [comment, setComment] = useState<string | null>(null);
    const API = process.env.NEXT_PUBLIC_API_URL;
    const queryClient = useQueryClient();
    const { data: students = [] } = useStudents()

    const { data } = useSuspenseQuery({
        queryKey: ["group", groupId],
        queryFn: async () => {
            const res = await axios.get(`${API}/group/${groupId}`, { headers: { Authorization: `Bearer ${token}` } });
            return res.data;
        },
    })

    const { data: groupStudentsData } = useSuspenseQuery({
        queryKey: ["group-students", groupId, page, limit],
        queryFn: async () => {
            const res = await axios.get(`${API}/group/${groupId}/students`, { headers: { "Authorization": `Bearer ${token}` }, params: { page, limit } });
            return res.data;
        }
    })

    const updateScoresMutation = useMutation({
        mutationFn: async (payload: UpdateScorePayload) => {
            const { studentId, groupId, date, type, value, comment } = payload;
            return await axios.put(`${API}/student-score/update/${studentId}/${groupId}`, { date, comment, type, value, homeworkScore: type === "HOMEWORK" ? value : undefined, attendanceScore: type === "ATTENDANCE" ? value : undefined }, { headers: { Authorization: `Bearer ${token}` } });
        },
        onSuccess: () => {
            toast.success('Scores updated successfully!');
            setOpenUpdate(false);
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


    const addStudentMutation = useMutation({
        mutationFn: async (payload: AddStudentPayload) => {
            const { groupId, studentIds } = payload;
            const res = await axios.post(`${API}/group/${groupId}/add-students`, { studentIds }, { headers: { Authorization: `Bearer ${token}` } });
            return res.data;
        },
        onSuccess: () => {
            toast.success('Students added successfully!');
            setOpenAddStudents(false);
            queryClient.invalidateQueries({
                queryKey: ['group', groupId],
            })
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message ?? 'Something went wrong');
        }
    })

    const deleteStudentMutation = useMutation({
        mutationFn: async (payload: DeleteStudentPayload) => {
            const { studentId, groupId } = payload;
            return await axios.delete(`${API}/group/delete/${studentId}/${groupId}`, { headers: { Authorization: `Bearer ${token}` } });
        },
        onSuccess: () => {
            toast.success('Student deleted from this group!');
            setOpenDelete(false);
            queryClient.invalidateQueries({
                queryKey: ['group', groupId],
            })
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message ?? 'Something went wrong');

        }
    })

    const { data: studentScores } = useSuspenseQuery<GroupScoreResponse>({
        queryKey: ["students", groupId],
        queryFn: async () => {
            const res = await axios.get(
                `${API}/student-score/today/students/${groupId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return res.data;
        },
    });

    const group: GroupType = data;
    const groupStudents: TokenPayload[] = groupStudentsData.data.length > 0 ? groupStudentsData.data : [];
    const meta: PaginationType = groupStudentsData?.meta ?? {}
    const lastPage = meta?.last_page ?? 1;


    const scoreMap = new Map(
        studentScores.students.map((s) => [s.studentId, s])
    )

    const avgAttendance = studentScores.avgAttendance;
    const avgHomework = studentScores.avgHomework;
    const avgTotal = studentScores.avg;

    const existingStudents = new Set(
        group?.students?.map((s) => s.id) ?? []
    );

    const availableStudents: any = students.filter(
        (s: TokenPayload) => !existingStudents.has(s.id)
    )

    return (
        <>
            <div className="mb-4 flex justify-center items-center gap-6">
                <Badge className='w-40 h-6 font-bold'><Home /> Avg Homework: {formatValue(avgHomework)}</Badge>
                <Badge className='w-40 h-6 font-bold'><ListChecks /> Avg Attendance: {formatValue(avgAttendance)}</Badge>
                <Badge className='w-40 h-6 font-bold'><Medal /> Avg Total: {formatValue(avgTotal)}</Badge>
            </div>
            <Table>
                <TableCaption className="text-center font-bold text-lg">
                    Showing {groupStudents.length} of {meta?.total ?? 0} students
                </TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12 text-center font-bold text-lg">&#8470;</TableHead>
                        <TableHead className="w-48 text-center font-bold text-lg">Name</TableHead>
                        <TableHead className="w-48 text-center font-bold text-lg">Homework</TableHead>
                        <TableHead className="w-48 text-center font-bold text-lg">Attendance</TableHead>
                        <TableHead className="w-48 text-center font-bold text-lg">Date</TableHead>
                        <TableHead className="w-48 text-center font-bold text-lg">Total Score</TableHead>
                        <TableHead className="w-24 text-start font-bold text-lg">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {groupStudents.map((s, idx) => {
                        const score = scoreMap.get(s.id);
                        return (<TableRow key={s.id}>
                            <TableCell className="text-center">{idx + 1}</TableCell>
                            <TableCell className="text-center hover:cursor-pointer" onClick={() => router.push(`/groups/${groupId}/${s.id}`)}>{s.username}</TableCell>
                            <TableCell className="text-center">{score?.homework ?? 0}</TableCell>
                            <TableCell className="text-center">{score?.attendance ?? 0}</TableCell>
                            <TableCell className="text-center"> {new Date().toISOString().split("T")[0]}</TableCell>
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
            </Table>
            <div className='flex gap-3 justify-end mr-5 mt-4'>
                <AddScoreDrawer openCreate={openCreate} setOpenCreate={setOpenCreate} students={groupStudents} groupId={groupId} onScoreAdded={() => queryClient.invalidateQueries({
                    queryKey: ['students', groupId],
                    exact: false,
                })} />

                <Button variant="default" onClick={() => {
                    setOpenAddStudents(true); queryClient.invalidateQueries({
                        queryKey: ['students'],
                    })
                }} className="text-md">
                    Add Students
                </Button>
            </div>

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
                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose>
                            Cancel
                        </DialogClose>
                        <Button type="submit" onClick={() => selectedStudent && updateScoresMutation.mutate({ studentId: selectedStudent?.id, groupId, date, type, value })}>Update</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add students modal */}
            <Dialog open={openAddStudents} onOpenChange={setOpenAddStudents}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Add Students</DialogTitle>
                        <DialogDescription>
                            Add students to this group. Click save when you&apos;re
                            done.
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <Label>Students</Label>
                            <div className="max-h-48 overflow-y-auto border rounded-md p-3 space-y-2">
                                {availableStudents.map((student: any, idx: number) => {
                                    const checked = newStudentIds.includes(student.id);

                                    return (
                                        <label
                                            key={student.id ?? `student-${idx}`}
                                            className="flex items-center gap-2 cursor-pointer"
                                        >
                                            <input
                                                disabled={existingStudents.has(student.id)}
                                                type="checkbox"
                                                checked={checked}
                                                onChange={(e) => {
                                                    if (!student.id) return;
                                                    if (e.target.checked) {
                                                        setNewStudentIds((prev) => [
                                                            ...prev,
                                                            student.id,
                                                        ]);
                                                    } else {
                                                        setNewStudentIds((prev) =>
                                                            prev.filter((id) => id !== student.id)
                                                        );
                                                    }
                                                }}
                                            />
                                            <span>{student.username}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </Field>
                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose>
                            Cancel
                        </DialogClose>
                        <Button type="submit" onClick={() => group && addStudentMutation.mutate({ groupId: group.id, studentIds: newStudentIds })}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* delete student modal */}
            <Dialog open={openDelete} onOpenChange={setOpenDelete}>
                <form>
                    <DialogContent className="sm:max-w-sm">
                        <DialogHeader>
                            <DialogTitle>Delete Student From Group</DialogTitle>
                            <DialogDescription>
                                Are you sure to delete this student from this group?
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

            <GroupLineGraph groupId={groupId} />
        </>
    )
}

export default GroupDetailsComponent