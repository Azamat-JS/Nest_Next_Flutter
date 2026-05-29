'use client'

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { TokenPayload } from "@/lib/types/token_payload"
import { useAuthStore } from "@/lib/stores/authStore"
import { jwtDecode } from "jwt-decode"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash } from "lucide-react"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useRouter, useSearchParams } from 'next/navigation'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { PaginationType } from "@/lib/types/groups"
import api from "@/lib/api"
import { cn } from "@/lib/utils"

const roleVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
    ADMIN: "default",
    TEACHER: "secondary",
    STUDENT: "outline",
    PARENT: "outline",
}

const Home = () => {
    const token = useAuthStore((state) => state.token)
    const me = token ? jwtDecode<TokenPayload>(token) : null
    const [openUpdate, setOpenUpdate] = useState(false)
    const [openDelete, setOpenDelete] = useState(false)
    const [selectedUser, setSelectedUser] = useState<TokenPayload | null>(null)
    const router = useRouter()
    const searchParams = useSearchParams()
    const queryClient = useQueryClient()
    const page = Number(searchParams.get('page') ?? 1)
    const limit = Number(searchParams.get('limit') ?? 10)

    const { data } = useSuspenseQuery({
        queryKey: ['users', page, limit],
        queryFn: async () => {
            const res = await api.get('/users', { params: { page, limit } })
            return res.data
        },
        staleTime: 1000 * 60 * 5,
    })

    const updateUserMutation = useMutation({
        mutationFn: async (user: TokenPayload) => {
            return await api.put(`/users/${user.id}`, user)
        },
        onSuccess: () => {
            toast.success('User updated successfully')
            setOpenUpdate(false)
            queryClient.invalidateQueries({ queryKey: ['users'] })
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message ?? 'Something went wrong')
        },
    })

    const deleteUserMutation = useMutation({
        mutationFn: async (userId: string) => {
            return await api.delete(`/users/${userId}`)
        },
        onSuccess: () => {
            toast.success('User deleted successfully')
            setOpenDelete(false)
            queryClient.invalidateQueries({ queryKey: ['users'] })
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message ?? 'Something went wrong')
        },
    })

    const users: TokenPayload[] = data?.data ?? []
    const meta: PaginationType = data?.meta ?? {}
    const lastPage = meta?.last_page ?? 1

    return (
        <div className="space-y-4">
            <Table>
                <TableCaption>
                    Showing {users.length} of {meta?.total ?? 0} users
                </TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12 text-center font-semibold">#</TableHead>
                        <TableHead className="text-center font-semibold">Username</TableHead>
                        <TableHead className="text-center font-semibold">Email</TableHead>
                        <TableHead className="text-center font-semibold">Role</TableHead>
                        <TableHead className="w-16 text-center font-semibold">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((u, idx) => {
                        const isMe = me?.username === u.username
                        return (
                            <TableRow key={u.id} className={cn(isMe && "bg-primary/5")}>
                                <TableCell className="text-center">{(page - 1) * limit + idx + 1}</TableCell>
                                <TableCell className="text-center font-medium">
                                    {u.username}
                                    {isMe && <span className="ml-2 text-xs text-primary">(you)</span>}
                                </TableCell>
                                <TableCell className="text-center text-muted-foreground">{u.email}</TableCell>
                                <TableCell className="text-center">
                                    <Badge variant={roleVariant[u.role ?? ''] ?? 'outline'} className="capitalize text-xs">
                                        {u.role?.toLowerCase()}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuGroup>
                                                <DropdownMenuItem onClick={() => { setOpenUpdate(true); setSelectedUser(u) }}>
                                                    <Edit className="h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => { setOpenDelete(true); setSelectedUser(u) }}
                                                    className="text-destructive focus:text-destructive"
                                                >
                                                    <Trash className="h-4 w-4" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>

            {/* Pagination */}
            <div className="grid grid-cols-2 items-center">
                <div className="flex justify-center">
                    <Field orientation="horizontal" className="w-fit">
                        <FieldLabel htmlFor="users-rows-per-page">Rows per page</FieldLabel>
                        <Select value={String(limit)} onValueChange={(val) => {
                            const params = new URLSearchParams(searchParams.toString())
                            params.set('limit', val)
                            params.set('page', '1')
                            router.push(`?${params.toString()}`)
                        }}>
                            <SelectTrigger className="w-20" id="users-rows-per-page">
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

            {/* Edit user modal */}
            <Dialog open={openUpdate} onOpenChange={setOpenUpdate}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>Update details for <strong>{selectedUser?.username}</strong></DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <Label htmlFor="edit-username">Username</Label>
                            <Input
                                id="edit-username"
                                value={selectedUser?.username ?? ""}
                                onChange={(e) => setSelectedUser(prev => prev ? { ...prev, username: e.target.value } : prev)}
                            />
                        </Field>
                        <Field>
                            <Label htmlFor="edit-email">Email</Label>
                            <Input
                                id="edit-email"
                                value={selectedUser?.email ?? ""}
                                onChange={(e) => setSelectedUser(prev => prev ? { ...prev, email: e.target.value } : prev)}
                            />
                        </Field>
                        <Field>
                            <Label htmlFor="edit-role">Role</Label>
                            <Input
                                id="edit-role"
                                value={selectedUser?.role?.toLowerCase() ?? ""}
                                onChange={(e) => setSelectedUser(prev => prev ? { ...prev, role: e.target.value.toUpperCase() } : prev)}
                            />
                        </Field>
                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                            onClick={() => selectedUser && updateUserMutation.mutate(selectedUser)}
                            disabled={updateUserMutation.isPending}
                        >
                            {updateUserMutation.isPending ? 'Saving…' : 'Save'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete confirmation modal */}
            <Dialog open={openDelete} onOpenChange={setOpenDelete}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>{selectedUser?.username}</strong>? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            onClick={() => selectedUser && deleteUserMutation.mutate(selectedUser.id)}
                            disabled={deleteUserMutation.isPending}
                        >
                            {deleteUserMutation.isPending ? 'Deleting…' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default Home
