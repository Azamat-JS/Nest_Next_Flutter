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
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, UserPlus, Trash } from "lucide-react"
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
import { TokenPayload } from "@/lib/types/token_payload"
import { GroupDrawer } from "../Drawer"
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useStudents } from "@/lib/hooks/studentsHook"
import api from "@/lib/api"

const GroupComponent = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const page = Number(searchParams.get('page') ?? 1)
    const limit = Number(searchParams.get('limit') ?? 10)
    const [selectedTeacher, setSelectedTeacher] = useState<TokenPayload | null>(null)
    const [openUpdate, setOpenUpdate] = useState(false)
    const [openAddStudents, setOpenAddStudents] = useState(false)
    const [openDelete, setOpenDelete] = useState(false)
    const [openCreate, setOpenCreate] = useState(false)
    const [newStudentIds, setNewStudentIds] = useState<string[]>([])
    const [selectedGroup, setSelectedGroup] = useState<GroupType | null>(null)
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])
    const queryClient = useQueryClient()
    const { data: studentData = [] } = useStudents()

    const { data } = useSuspenseQuery({
        queryKey: ['groups', page, limit],
        queryFn: async () => {
            const res = await api.get('/group/all', { params: { page, limit } })
            return res.data
        },
        staleTime: 1000 * 60 * 5,
    })

    const { data: teacherData } = useSuspenseQuery({
        queryKey: ['teachers'],
        queryFn: async () => {
            const res = await api.get('/users/teachers')
            return res.data
        },
        staleTime: 1000 * 60 * 10,
    })

    const addStudentMutation = useMutation({
        mutationFn: async (payload: AddStudentPayload) => {
            const res = await api.post(`/group/${payload.groupId}/add-students`, { studentIds: payload.studentIds })
            return res.data
        },
        onSuccess: () => {
            toast.success('Students added successfully')
            setOpenAddStudents(false)
            queryClient.invalidateQueries({ queryKey: ['groups'] })
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message ?? 'Something went wrong')
        },
    })

    const updateGroupMutation = useMutation({
        mutationFn: async (group: GroupType) => {
            return await api.put(`/group/${group.id}`, {
                name: group.name,
                teacherId: selectedTeacher!.id,
                studentIds: selectedStudentIds.filter(Boolean),
            })
        },
        onSuccess: () => {
            toast.success('Group updated successfully')
            setOpenUpdate(false)
            queryClient.invalidateQueries({ queryKey: ['groups'] })
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message ?? 'Something went wrong')
        },
    })

    const deleteGroupMutation = useMutation({
        mutationFn: async (groupId: string) => {
            return await api.delete(`/group/${groupId}`)
        },
        onSuccess: () => {
            toast.success('Group deleted successfully')
            setOpenDelete(false)
            queryClient.invalidateQueries({ queryKey: ['groups'] })
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message ?? 'Something went wrong')
        },
    })

    const students: TokenPayload[] = studentData ?? []
    const teachers: TokenPayload[] = teacherData ?? []

    useEffect(() => {
        if (selectedGroup && students.length > 0) {
            setSelectedStudentIds(
                (selectedGroup.students || []).map((s) => s.id).filter((id): id is string => Boolean(id))
            )
        }
    }, [selectedGroup, students])

    useEffect(() => {
        if (openAddStudents) setNewStudentIds([])
    }, [openAddStudents])

    const groups: GroupType[] = data?.data ?? []
    const meta: PaginationType = data?.meta ?? {}
    const lastPage = meta?.last_page ?? 1

    const existingStudents = new Set(selectedGroup?.students?.map((s) => s.id) ?? [])
    const availableStudents = students.filter((s) => !existingStudents.has(s.id))

    return (
        <div className="space-y-4">
            <Table>
                <TableCaption>
                    Showing {groups.length} of {meta?.total ?? 0} groups
                </TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12 text-center font-semibold">#</TableHead>
                        <TableHead className="text-center font-semibold">Name</TableHead>
                        <TableHead className="text-center font-semibold">Teacher</TableHead>
                        <TableHead className="text-center font-semibold">Students</TableHead>
                        <TableHead className="w-16 text-center font-semibold">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {groups.map((u, idx) => (
                        <TableRow key={u.id} className="hover:bg-muted/50">
                            <TableCell className="text-center">{(page - 1) * limit + idx + 1}</TableCell>
                            <TableCell
                                className="text-center font-medium cursor-pointer hover:text-primary hover:underline"
                                onClick={() => router.push(`/groups/${u.id}`)}
                            >
                                {u.name}
                            </TableCell>
                            <TableCell className="text-center text-muted-foreground">{[u.teacher?.firstName, u.teacher?.lastName].filter(Boolean).join(' ')}</TableCell>
                            <TableCell className="text-center text-muted-foreground">{u.students?.length ?? 0}</TableCell>
                            <TableCell className="text-center">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem onClick={(e) => {
                                                e.stopPropagation()
                                                setSelectedGroup(u)
                                                setOpenAddStudents(true)
                                            }}>
                                                <UserPlus className="h-4 w-4" /> Add Students
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={(e) => {
                                                e.stopPropagation()
                                                setSelectedGroup(u)
                                                setSelectedTeacher(u.teacher ?? null)
                                                setOpenUpdate(true)
                                            }}>
                                                <Edit className="h-4 w-4" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setOpenDelete(true)
                                                    setSelectedGroup(u)
                                                }}
                                                className="text-destructive focus:text-destructive"
                                            >
                                                <Trash className="h-4 w-4" /> Delete
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
            <div className="grid grid-cols-2 items-center">
                <div className="flex justify-center">
                    <Field orientation="horizontal" className="w-fit">
                        <FieldLabel htmlFor="groups-rows-per-page">Rows per page</FieldLabel>
                        <Select value={String(limit)} onValueChange={(val) => {
                            const params = new URLSearchParams(searchParams.toString())
                            params.set('limit', val)
                            params.set('page', '1')
                            router.push(`?${params.toString()}`)
                        }}>
                            <SelectTrigger className="w-20" id="groups-rows-per-page">
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
                                <PaginationPrevious href={`?page=${Math.max(1, page - 1)}&limit=${limit}`} />
                            </PaginationItem>
                            {Array.from({ length: lastPage }).map((_, idx) => (
                                <PaginationItem key={idx}>
                                    <PaginationLink href={`?page=${idx + 1}&limit=${limit}`} isActive={page === idx + 1}>
                                        {idx + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext href={`?page=${Math.min(lastPage, page + 1)}&limit=${limit}`} />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </div>

            {/* Edit group modal */}
            <Dialog open={openUpdate} onOpenChange={setOpenUpdate}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Edit Group</DialogTitle>
                        <DialogDescription>Update details for <strong>{selectedGroup?.name}</strong></DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <Label htmlFor="group-name">Group name</Label>
                            <Input
                                id="group-name"
                                value={selectedGroup?.name ?? ""}
                                onChange={(e) => setSelectedGroup(prev => prev ? { ...prev, name: e.target.value } : prev)}
                            />
                        </Field>
                        <Field>
                            <Label>Teacher</Label>
                            <Select
                                value={selectedTeacher?.id ?? ""}
                                onValueChange={(val) => {
                                    const teacher = teachers.find(t => t.id === val) || null
                                    setSelectedTeacher(teacher)
                                    setSelectedGroup(prev => prev ? { ...prev, teacher } : prev)
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a teacher" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Select teacher</SelectLabel>
                                        {teachers.map(t => (
                                            <SelectItem key={t.id} value={t.id}>{[t.firstName, t.lastName].filter(Boolean).join(' ')}</SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </Field>
                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                            onClick={() => selectedGroup && updateGroupMutation.mutate(selectedGroup)}
                            disabled={updateGroupMutation.isPending}
                        >
                            {updateGroupMutation.isPending ? 'Saving…' : 'Save'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add students modal */}
            <Dialog open={openAddStudents} onOpenChange={setOpenAddStudents}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Add Students</DialogTitle>
                        <DialogDescription>Select students to add to <strong>{selectedGroup?.name}</strong></DialogDescription>
                    </DialogHeader>
                    <Field>
                        <Label>Available students</Label>
                        <div className="max-h-52 overflow-y-auto rounded-md border p-3 space-y-2">
                            {availableStudents.length === 0
                                ? <p className="text-sm text-muted-foreground text-center py-4">No students available</p>
                                : availableStudents.map((student) => (
                                    <label key={student.id} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={newStudentIds.includes(student.id)}
                                            onChange={(e) => {
                                                if (!student.id) return
                                                setNewStudentIds(prev =>
                                                    e.target.checked ? [...prev, student.id] : prev.filter(id => id !== student.id)
                                                )
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
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                            onClick={() => selectedGroup && addStudentMutation.mutate({ groupId: selectedGroup.id, studentIds: newStudentIds })}
                            disabled={newStudentIds.length === 0 || addStudentMutation.isPending}
                        >
                            {addStudentMutation.isPending ? 'Adding…' : `Add ${newStudentIds.length > 0 ? `(${newStudentIds.length})` : ''}`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete group confirmation */}
            <Dialog open={openDelete} onOpenChange={setOpenDelete}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Delete Group</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>{selectedGroup?.name}</strong>? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            onClick={() => selectedGroup && deleteGroupMutation.mutate(selectedGroup.id)}
                            disabled={deleteGroupMutation.isPending}
                        >
                            {deleteGroupMutation.isPending ? 'Deleting…' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="flex justify-end pt-2">
                <GroupDrawer
                    openCreate={openCreate}
                    setOpenCreate={setOpenCreate}
                    teachers={teachers}
                    students={students}
                    onGroupCreated={() => queryClient.invalidateQueries({ queryKey: ['groups'] })}
                />
            </div>
        </div>
    )
}

export default GroupComponent
