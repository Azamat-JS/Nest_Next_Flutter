"use client"

import { useStudents } from "@/lib/hooks/studentsHook";
import { StudentScoreResponse } from "@/lib/types/score_type";
import { TokenPayload, UpdateScorePayload } from "@/lib/types/token_payload";
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
import { MoreHorizontal, Edit } from 'lucide-react';
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation';
import LineGraph from "../LineGraph";
import { toast } from "sonner";
import { Input } from "../ui/input";
import api from "@/lib/api";
import { useTranslations } from "next-intl";

const StudentScoresComponent = ({ groupId, studentId }: { groupId: string; studentId: string }) => {
    const t = useTranslations('StudentScoresComponent');
    const tCommon = useTranslations('Common');
    const searchParams = useSearchParams();
    const page = Number(searchParams.get('page') ?? 1);
    const limit = Number(searchParams.get('limit') ?? 10);
    const { data: students = [] } = useStudents();
    const router = useRouter();
    const [openUpdate, setOpenUpdate] = useState(false);
    const [comment, setComment] = useState<string>("");
    const [value, setValue] = useState<number>(0);
    const [type, setType] = useState<"HOMEWORK" | "ATTENDANCE">("HOMEWORK");
    const [selectedDate, setSelectedDate] = useState<string>("");
    const queryClient = useQueryClient();

    const { data: studentScoreReport } = useSuspenseQuery<StudentScoreResponse>({
        queryKey: ["studentScores", studentId, groupId, page, limit],
        queryFn: async () => {
            const res = await api.get(`/student-score/one-student/${studentId}/${groupId}`, { params: { page, limit } });
            return res.data;
        },
        staleTime: 1000 * 60 * 5,
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
            toast.success(t('updateSuccess'));
            setOpenUpdate(false);
            setValue(0);
            setComment("");
            setType("HOMEWORK");
            queryClient.invalidateQueries({ queryKey: ['today-scores', groupId] });
            queryClient.invalidateQueries({ queryKey: ['studentScores', studentId, groupId] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message ?? tCommon('errorGeneric'));
        },
    });

    const student = useMemo(() => {
        return (students as TokenPayload[]).find((s) => s.id === studentId);
    }, [studentId, students]);

    const rows = studentScoreReport.scores;
    const lastPage = studentScoreReport.last_page;

    if (!student) {
        return <p className="text-center text-muted-foreground py-8">{t('loadingStudent')}</p>;
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="text-center">
                <h2 className="text-xl font-bold">{[student.firstName, student.lastName].filter(Boolean).join(' ')}</h2>
                <p className="text-sm text-muted-foreground">{t('allTimeTotal')} <span className="font-semibold text-foreground">{studentScoreReport.total?.total ?? 0}</span></p>
            </div>

            <Table>
                <TableCaption>{t('scoreHistoryCaption', { page, lastPage })}</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12 text-center font-semibold">#</TableHead>
                        <TableHead className="text-center font-semibold">{t('type')}</TableHead>
                        <TableHead className="text-center font-semibold">{t('score')}</TableHead>
                        <TableHead className="text-center font-semibold">{t('date')}</TableHead>
                        <TableHead className="text-center font-semibold">{t('total')}</TableHead>
                        <TableHead className="text-center font-semibold">{t('comment')}</TableHead>
                        <TableHead className="w-16 text-center font-semibold">{tCommon('actions')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((row, idx) => (
                        <TableRow key={idx}>
                            <TableCell className="text-center">{(page - 1) * limit + idx + 1}</TableCell>
                            <TableCell className="text-center">
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${row.type === 'HOMEWORK' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'}`}>
                                    {row.type}
                                </span>
                            </TableCell>
                            <TableCell className="text-center">{row.value}</TableCell>
                            <TableCell className="text-center">
                                {new Date(row.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </TableCell>
                            <TableCell className="text-center font-semibold">{row.total}</TableCell>
                            <TableCell className="text-center text-muted-foreground">{row.comment ?? "—"}</TableCell>
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
                                                setType(row.type);
                                                setValue(row.value);
                                                setSelectedDate(row.date);
                                                setComment(row.comment ?? "");
                                            }}>
                                                <Edit className="h-4 w-4" /> {t('edit')}
                                            </DropdownMenuItem>
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Pagination */}
            <div className="grid grid-cols-2 items-center mt-2">
                <div className="flex justify-center">
                    <Field orientation="horizontal" className="w-fit">
                        <FieldLabel htmlFor="ss-rows-per-page">{t('rowsPerPage')}</FieldLabel>
                        <Select value={String(limit)} onValueChange={(val) => {
                            const params = new URLSearchParams(searchParams.toString());
                            params.set('limit', val);
                            params.set('page', '1');
                            router.push(`?${params.toString()}`);
                        }}>
                            <SelectTrigger className="w-20" id="ss-rows-per-page">
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
                                <PaginationPrevious href={`?page=${Math.max(1, page - 1)}&limit=${limit}`} text={tCommon('previous')} />
                            </PaginationItem>
                            {Array.from({ length: lastPage }).map((_, idx) => (
                                <PaginationItem key={idx}>
                                    <PaginationLink href={`?page=${idx + 1}&limit=${limit}`} isActive={page === idx + 1}>
                                        {idx + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext href={`?page=${Math.min(lastPage, page + 1)}&limit=${limit}`} text={tCommon('next')} />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </div>

            {/* Update score modal */}
            <Dialog open={openUpdate} onOpenChange={setOpenUpdate}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{t('updateScoreTitle')}</DialogTitle>
                        <DialogDescription>{t('updateScoreDescription')}</DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <Select value={type} onValueChange={(v: "HOMEWORK" | "ATTENDANCE") => setType(v)}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('selectType')} />
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
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">{tCommon('cancel')}</Button>
                        </DialogClose>
                        <Button
                            onClick={() => updateScoresMutation.mutate({
                                studentId,
                                groupId,
                                date: selectedDate,
                                type,
                                value,
                                comment: comment.trim() === "" ? undefined : comment,
                            })}
                            disabled={updateScoresMutation.isPending}
                        >
                            {updateScoresMutation.isPending ? t('saving') : t('save')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="mt-4">
                <LineGraph groupId={groupId} studentId={studentId} />
            </div>
        </div>
    );
};

export default StudentScoresComponent;
