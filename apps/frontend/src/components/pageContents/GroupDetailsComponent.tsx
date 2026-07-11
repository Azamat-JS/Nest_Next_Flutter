'use client'
import { AddStudentPayload, PaginationType } from '@/lib/types/groups';
import { useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
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
import { MoreHorizontal, Edit, Trash, UserPlus } from 'lucide-react';
import { Input } from "@/components/ui/input"
import { DeleteStudentPayload, TokenPayload, UpdateScorePayload } from '@/lib/types/token_payload';
import AddScoreDrawer from '../AddScoreDrawer';
import { useSuspenseQuery } from '@tanstack/react-query';
import { GroupScoreResponse } from '@/lib/types/score_type';
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
import api from '@/lib/api';
import { Home, ListChecks, Medal } from 'lucide-react';

const date = new Date().toISOString().split('T')[0];

const GroupDetailsComponent = ({ groupId }: { groupId: string }) => {
    const t = useTranslations('GroupDetailsComponent');
    const tc = useTranslations('Common');
    const router = useRouter();
    const searchParams = useSearchParams();
    const page = Number(searchParams.get('page') ?? 1);
    const limit = Number(searchParams.get('limit') ?? 10);
    const [openCreate, setOpenCreate] = useState(false);
    const [openUpdate, setOpenUpdate] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [openAddStudents, setOpenAddStudents] = useState(false);
    const [newStudentIds, setNewStudentIds] = useState<string[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<TokenPayload | null>(null);
    const [type, setType] = useState<"HOMEWORK" | "ATTENDANCE">("HOMEWORK");
    const [value, setValue] = useState<number>(0);
    const [comment, setComment] = useState<string | null>(null);
    const queryClient = useQueryClient();
    const { data: students = [] } = useStudents();

    const { data: groupStudentsData } = useSuspenseQuery({
        queryKey: ["group-students", groupId, page, limit],
        queryFn: async () => {
            const res = await api.get(`/group/${groupId}/students`, { params: { page, limit } });
            return res.data;
        },
        staleTime: 1000 * 60 * 5,
    });

    const { data: studentScores } = useSuspenseQuery<GroupScoreResponse>({
        queryKey: ["today-scores", groupId],
        queryFn: async () => {
            const res = await api.get(`/student-score/today/students/${groupId}`);
            return res.data;
        },
        staleTime: 1000 * 60 * 2,
    });

    const updateScoresMutation = useMutation({
        mutationFn: async (payload: UpdateScorePayload) => {
            const { studentId, groupId, date, type, value, comment } = payload;
            return await api.put(`/student-score/update/${studentId}/${groupId}`, {
                date, comment, type, value,
                homeworkScore: type === "HOMEWORK" ? value : undefined,
                attendanceScore: type === "ATTENDANCE" ? value : undefined,
            });
        },
        onSuccess: () => {
            toast.success(t('scoreUpdateSuccess'));
            setOpenUpdate(false);
            setValue(0);
            setComment(null);
            setType("HOMEWORK");
            setSelectedStudent(null);
            queryClient.invalidateQueries({ queryKey: ['today-scores', groupId] });
            queryClient.invalidateQueries({ queryKey: ['group', groupId] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message ?? tc('errorGeneric'));
        },
    });

    const addStudentMutation = useMutation({
        mutationFn: async (payload: AddStudentPayload) => {
            const res = await api.post(`/group/${payload.groupId}/add-students`, { studentIds: payload.studentIds });
            return res.data;
        },
        onSuccess: () => {
            toast.success(t('studentsAddedSuccess'));
            setOpenAddStudents(false);
            queryClient.invalidateQueries({ queryKey: ['group', groupId] });
            queryClient.invalidateQueries({ queryKey: ['group-students', groupId] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message ?? tc('errorGeneric'));
        },
    });

    const deleteStudentMutation = useMutation({
        mutationFn: async (payload: DeleteStudentPayload) => {
            return await api.delete(`/group/delete/${payload.studentId}/${payload.groupId}`);
        },
        onSuccess: () => {
            toast.success(t('studentRemovedSuccess'));
            setOpenDelete(false);
            queryClient.invalidateQueries({ queryKey: ['group', groupId] });
            queryClient.invalidateQueries({ queryKey: ['group-students', groupId] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message ?? tc('errorGeneric'));
        },
    });

    const groupStudents: TokenPayload[] = groupStudentsData?.data ?? [];
    const meta: PaginationType = groupStudentsData?.meta ?? {};
    const lastPage = meta?.last_page ?? 1;

    const scoreMap = new Map(studentScores.students.map((s) => [s.studentId, s]));
    const avgAttendance = studentScores.avgAttendance;
    const avgHomework = studentScores.avgHomework;
    const avgTotal = studentScores.avg;

    const existingStudentIds = new Set(groupStudents.map((s) => s.id));
    const availableStudents = (students as TokenPayload[]).filter((s) => !existingStudentIds.has(s.id));

    return (
        <>
            <div className="flex flex-wrap justify-center gap-3 mb-4">
                <Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
                    <Home className="h-3.5 w-3.5" /> {t('avgHomework', { value: formatValue(avgHomework) })}
                </Badge>
                <Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
                    <ListChecks className="h-3.5 w-3.5" /> {t('avgAttendance', { value: formatValue(avgAttendance) })}
                </Badge>
                <Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
                    <Medal className="h-3.5 w-3.5" /> {t('avgTotal', { value: formatValue(avgTotal) })}
                </Badge>
            </div>

            <Table>
                <TableCaption>
                    {t('showingStudents', { count: groupStudents.length, total: meta?.total ?? 0 })}
                </TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12 text-center font-semibold">#</TableHead>
                        <TableHead className="text-center font-semibold">{tc('name')}</TableHead>
                        <TableHead className="text-center font-semibold">{t('homework')}</TableHead>
                        <TableHead className="text-center font-semibold">{t('attendance')}</TableHead>
                        <TableHead className="text-center font-semibold">{t('date')}</TableHead>
                        <TableHead className="text-center font-semibold">{t('total')}</TableHead>
                        <TableHead className="w-16 text-center font-semibold">{tc('actions')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {groupStudents.map((s, idx) => {
                        const score = scoreMap.get(s.id);
                        return (
                            <TableRow key={s.id}>
                                <TableCell className="text-center">{(page - 1) * limit + idx + 1}</TableCell>
                                <TableCell
                                    className="text-center font-medium cursor-pointer hover:text-primary hover:underline"
                                    onClick={() => router.push(`/groups/${groupId}/${s.id}`)}
                                >
                                    {[s.firstName, s.lastName].filter(Boolean).join(' ')}
                                </TableCell>
                                <TableCell className="text-center">{score?.homework ?? 0}</TableCell>
                                <TableCell className="text-center">{score?.attendance ?? 0}</TableCell>
                                <TableCell className="text-center">{date}</TableCell>
                                <TableCell className="text-center font-semibold">{score?.total ?? 0}</TableCell>
                                <TableCell className="text-center">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuGroup>
                                                <DropdownMenuItem onClick={() => {
                                                    setOpenUpdate(true);
                                                    setSelectedStudent(s);
                                                    setValue(score?.homework ?? 0);
                                                    setComment(score?.comment ?? null);
                                                }}>
                                                    <Edit className="h-4 w-4" /> {t('updateScoreAction')}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => { setOpenDelete(true); setSelectedStudent(s); }}
                                                    className="text-destructive focus:text-destructive"
                                                >
                                                    <Trash className="h-4 w-4" /> {t('removeAction')}
                                                </DropdownMenuItem>
                                            </DropdownMenuGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>

            <div className="flex gap-2 justify-end mt-4">
                <AddScoreDrawer
                    openCreate={openCreate}
                    setOpenCreate={setOpenCreate}
                    students={groupStudents}
                    groupId={groupId}
                    onScoreAdded={() => queryClient.invalidateQueries({ queryKey: ['today-scores', groupId] })}
                />
                <Button variant="outline" onClick={() => setOpenAddStudents(true)} className="gap-1">
                    <UserPlus className="h-4 w-4" /> {t('addStudents')}
                </Button>
            </div>

            {/* Pagination */}
            <div className="grid grid-cols-2 items-center mt-4">
                <div className="flex justify-center">
                    <Field orientation="horizontal" className="w-fit">
                        <FieldLabel htmlFor="gd-rows-per-page">{t('rowsPerPage')}</FieldLabel>
                        <Select value={String(limit)} onValueChange={(val) => {
                            const params = new URLSearchParams(searchParams.toString());
                            params.set('limit', val);
                            params.set('page', '1');
                            router.push(`?${params.toString()}`);
                        }}>
                            <SelectTrigger className="w-20" id="gd-rows-per-page">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent align="start">
                                <SelectGroup>
                                    {['5', '10', '15', '20'].map(v => (
                                        <SelectItem key={v} value={v}>{v}</SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </Field>
                </div>
                <div className="flex justify-end">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious href={`?page=${Math.max(1, page - 1)}&limit=${limit}`} text={tc('previous')} />
                            </PaginationItem>
                            {Array.from({ length: lastPage }).map((_, idx) => (
                                <PaginationItem key={idx}>
                                    <PaginationLink href={`?page=${idx + 1}&limit=${limit}`} isActive={page === idx + 1}>
                                        {idx + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext href={`?page=${Math.min(lastPage, page + 1)}&limit=${limit}`} text={tc('next')} />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </div>

            {/* Update score modal */}
            <Dialog open={openUpdate} onOpenChange={setOpenUpdate}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{t('updateScoreAction')}</DialogTitle>
                        <DialogDescription>
                            {t.rich('updateScoreDescription', {
                                name: [selectedStudent?.firstName, selectedStudent?.lastName].filter(Boolean).join(' '),
                                b: (chunks) => <strong>{chunks}</strong>,
                            })}
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <Select value={type} onValueChange={(v: "HOMEWORK" | "ATTENDANCE") => setType(v)}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('selectTypePlaceholder')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="HOMEWORK">{t('homework')}</SelectItem>
                                <SelectItem value="ATTENDANCE">{t('attendance')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input
                            type="number"
                            placeholder={t('scoreValuePlaceholder')}
                            value={value}
                            onChange={(e) => setValue(Number(e.target.value))}
                        />
                        <Input
                            type="text"
                            placeholder={t('commentPlaceholder')}
                            value={comment ?? ""}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">{tc('cancel')}</Button>
                        </DialogClose>
                        <Button
                            onClick={() => selectedStudent && updateScoresMutation.mutate({ studentId: selectedStudent.id, groupId, date, type, value, comment })}
                            disabled={updateScoresMutation.isPending}
                        >
                            {updateScoresMutation.isPending ? t('saving') : t('save')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add students modal */}
            <Dialog open={openAddStudents} onOpenChange={(open) => { setOpenAddStudents(open); if (!open) setNewStudentIds([]); }}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{t('addStudents')}</DialogTitle>
                        <DialogDescription>{t('addStudentsDescription')}</DialogDescription>
                    </DialogHeader>
                    <Field>
                        <Label>{t('availableStudentsLabel')}</Label>
                        <div className="max-h-52 overflow-y-auto rounded-md border p-3 space-y-2">
                            {availableStudents.length === 0
                                ? <p className="text-sm text-muted-foreground text-center py-4">{t('noStudentsAvailable')}</p>
                                : availableStudents.map((student) => (
                                    <label key={student.id} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={newStudentIds.includes(student.id)}
                                            onChange={(e) => {
                                                if (!student.id) return;
                                                setNewStudentIds((prev) =>
                                                    e.target.checked ? [...prev, student.id] : prev.filter((id) => id !== student.id)
                                                );
                                            }}
                                        />
                                        <span className="text-sm">{[student.firstName, student.lastName].filter(Boolean).join(' ')}</span>
                                    </label>
                                ))
                            }
                        </div>
                    </Field>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">{tc('cancel')}</Button>
                        </DialogClose>
                        <Button
                            onClick={() => addStudentMutation.mutate({ groupId, studentIds: newStudentIds })}
                            disabled={newStudentIds.length === 0 || addStudentMutation.isPending}
                        >
                            {addStudentMutation.isPending ? t('adding') : `${t('addLabel')} ${newStudentIds.length > 0 ? `(${newStudentIds.length})` : ''}`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete student confirmation modal */}
            <Dialog open={openDelete} onOpenChange={setOpenDelete}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{t('removeStudentTitle')}</DialogTitle>
                        <DialogDescription>
                            {t.rich('removeStudentDescription', {
                                name: [selectedStudent?.firstName, selectedStudent?.lastName].filter(Boolean).join(' '),
                                b: (chunks) => <strong>{chunks}</strong>,
                            })}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">{tc('cancel')}</Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            onClick={() => selectedStudent && deleteStudentMutation.mutate({ studentId: selectedStudent.id, groupId })}
                            disabled={deleteStudentMutation.isPending}
                        >
                            {deleteStudentMutation.isPending ? t('removing') : t('removeAction')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="mt-8">
                <GroupLineGraph groupId={groupId} />
            </div>
        </>
    );
};

export default GroupDetailsComponent;
