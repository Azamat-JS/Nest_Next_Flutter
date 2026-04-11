'use client'
import { useSearchParams } from "next/navigation"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useAuthStore } from "@/lib/stores/authStore"
import axios from "axios"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Edit, Menu, Trash } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GroupType, PaginationType } from "@/lib/types/groups"
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
import { TokenPayload } from "@/lib/types/token_payload"
import { GroupDrawer } from "../Drawer"
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query'


const GroupComponent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const page = Number(searchParams.get('page') ?? 1);
    const limit = Number(searchParams.get('limit') ?? 10);
    const token = useAuthStore((state) => state.token);
    const [selectedTeacher, setSelectedTeacher] = useState<TokenPayload | null>(null);
    const API = process.env.NEXT_PUBLIC_API_URL;
    const [openUpdate, setOpenUpdate] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [openCreate, setOpenCreate] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<GroupType | null>(null);
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
    const queryClient = useQueryClient();


    const { data, isLoading } = useQuery({
        queryKey: ['groups', page, limit, token],
        queryFn: async () => {
            const res = await axios.get(`${API}/group/all?page=${page}&limit=${limit}`, { headers: { Authorization: `Bearer ${token}` } })
            return res.data
        },
        enabled: !!token,
        staleTime: 1000 * 60 * 5,
    })

    const { data: teacherData, isLoading: teacherLoading } = useQuery({
        queryKey: ['teachers'],
        queryFn: async () => {
            const res = await axios.get(`${API}/users/teachers`, { headers: { Authorization: `Bearer ${token}` } });
            return res.data;
        },
        enabled: !!token && (openCreate || openUpdate),
        staleTime: 1000 * 60 * 5,
    })

    const { data: studentData, isLoading: studentLoading } = useQuery({
        queryKey: ['students'],
        queryFn: async () => {
            const res = await axios.get(`${API}/users/students`, { headers: { Authorization: `Bearer ${token}` } });
            return res.data;
        },
        enabled: !!token && (openCreate || openUpdate),
        staleTime: 1000 * 60 * 5,
    })

    const students: TokenPayload[] = studentData?.data ?? [];
    const teachers: TokenPayload[] = teacherData?.data ?? [];


    const handleUpdateGroup = async (group: GroupType) => {
        try {
            const res = await axios.put(
                `${API}/group/${group.id}`,
                {
                    name: group.name,
                    teacherId: selectedTeacher!.id,
                    studentIds: selectedStudentIds.filter(Boolean),
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.status === 200) {
                toast.success('Group data updated!');
                setOpenUpdate(false);
                await queryClient.invalidateQueries({
                    queryKey: ['groups'],
                    exact: false,
                })
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message ?? 'Something went wrong');
        }
    };

    const handleDeleteGroup = async (groupId: string) => {
        try {
            const res = await axios.delete(`${API}/group/${groupId}`, { headers: { Authorization: `Bearer ${token}` } })
            if (res.status === 200) {
                toast.success('Group deleted successfully!')
                setOpenDelete(false);
                await queryClient.invalidateQueries({
                    queryKey: ['groups'],
                    exact: false,
                })
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message ?? 'Something went wrong')
        }
    }


    useEffect(() => {
        if (selectedGroup && students.length > 0) {
            setSelectedStudentIds(
                (selectedGroup.students || [])
                    .map((s) => s.id)
                    .filter((id): id is string => Boolean(id))
            );
        }
    }, [selectedGroup, students]);

    const groups: GroupType[] = data?.data ?? []
    const meta: PaginationType = data?.meta ?? {}
    const lastPage = meta?.last_page ?? 1;

    if (isLoading) {
        return <div>Loading...</div>
    }


    return (
        <div className="mt-5">
            <Table className="mt-5">
                <TableCaption>A list of all groups.</TableCaption>

                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12 text-center text-lg font-bold">&#8470;</TableHead>
                        <TableHead className="w-48 text-center text-lg font-bold">Group Name</TableHead>
                        <TableHead className="w-72 text-center text-lg font-bold">Teacher Name</TableHead>
                        <TableHead className="w-24 text-start font-bold  text-lg">Actions</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {groups.map((u, idx) => (
                        <TableRow key={u.id} className="cursor-pointer hover:bg-muted/50"
                            onClick={() => router.push(`/groups/${u.id}`)}>
                            <TableCell className="text-center">{(page - 1) * limit + idx + 1}</TableCell>
                            <TableCell className="text-center">{u.name}</TableCell>

                            <TableCell className="text-center">{u.teacher!.username}</TableCell>

                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Menu className="w-5 h-5" />
                                    </DropdownMenuTrigger>

                                    <DropdownMenuContent align="start">
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedGroup(u);
                                                    setSelectedTeacher(u.teacher ?? null);
                                                    setOpenUpdate(true);
                                                }}
                                            >
                                                <Edit /> Update
                                            </DropdownMenuItem>

                                            <DropdownMenuItem
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenDelete(true);
                                                    setSelectedGroup(u);
                                                }}
                                                className="text-red-500"
                                            >
                                                <Trash /> Delete
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
            <div className="flex items-center justify-between gap-4">
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

            {/* update group modal */}
            <Dialog open={openUpdate} onOpenChange={setOpenUpdate}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Edit Group</DialogTitle>
                        <DialogDescription>
                            Make changes to the group here. Click save when you&apos;re
                            done.
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <Label htmlFor="name-1">Group name</Label>
                            <Input id="name-1" name="name" onChange={(e) => setSelectedGroup(prev => prev ? { ...prev, name: e.target.value } : prev)} value={selectedGroup?.name || ""} />
                        </Field>
                        <Field>
                            <Label htmlFor="email-1">Teacher Name</Label>
                            <Select
                                value={selectedTeacher?.id || ""}
                                onValueChange={(val: string) => {
                                    const teacher = teachers.find(t => t.id === val) || null;
                                    setSelectedTeacher(teacher);
                                    setSelectedGroup(prev => prev ? { ...prev, teacher } : prev);

                                }}
                            >
                                <SelectTrigger className="w-full max-w-48">
                                    <SelectValue placeholder="Select a teacher" />
                                </SelectTrigger>
                                <SelectContent position="popper">
                                    <SelectGroup>
                                        <SelectLabel>Select a new teacher</SelectLabel>
                                        {teachers.map(t => (
                                            <SelectItem key={t.id} value={t.id}>
                                                {t.username}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field>
                            <Label>Students</Label>

                            <div className="max-h-48 overflow-y-auto border rounded-md p-3 space-y-2">
                                {students.map((student, idx) => {
                                    const checked = selectedStudentIds.includes(student.id);

                                    return (

                                        <label
                                            key={student.id ?? `student-${idx}`}
                                            className="flex items-center gap-2 cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={(e) => {
                                                    if (!student.id) return;
                                                    if (e.target.checked) {
                                                        setSelectedStudentIds((prev) => [
                                                            ...prev,
                                                            student.id,
                                                        ]);
                                                    } else {
                                                        setSelectedStudentIds((prev) =>
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
                        <Button type="submit" onClick={() => selectedGroup && handleUpdateGroup(selectedGroup)}>Update</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* delete group modal */}
            <Dialog open={openDelete} onOpenChange={setOpenDelete}>
                <form>
                    <DialogContent className="sm:max-w-sm">
                        <DialogHeader>
                            <DialogTitle>Delete Group</DialogTitle>
                            <DialogDescription>
                                Are you sure to delete this group?
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <DialogClose >
                                Cancel
                            </DialogClose>
                            <Button type="submit" onClick={() => selectedGroup && handleDeleteGroup(selectedGroup.id)} variant="destructive">Delete</Button>
                        </DialogFooter>
                    </DialogContent>
                </form>
            </Dialog>
            <div className="w-full flex justify-end p-5">

                <GroupDrawer openCreate={openCreate} setOpenCreate={setOpenCreate} teachers={teachers} students={students} onGroupCreated={() => queryClient.invalidateQueries({
                    queryKey: ['groups'],
                    exact: false,
                })} />
            </div>
        </div>

    )
}

export default GroupComponent;