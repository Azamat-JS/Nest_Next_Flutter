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
import { MoreHorizontal, Edit, Trash, Search } from "lucide-react"
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
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useRouter, useSearchParams } from 'next/navigation'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { PaginationType } from "@/lib/types/groups"
import { CreateUserPayload } from "@/lib/types/token_payload"
import api from "@/lib/api"
import { cn } from "@/lib/utils"
import { useForm } from "@tanstack/react-form"
import * as z from "zod"
import { UserPlus } from "lucide-react"

const roleVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
    ADMIN: "default",
    TEACHER: "secondary",
    STUDENT: "outline",
    PARENT: "outline",
}

const CREATABLE_ROLES: Record<string, string[]> = {
    ADMIN: ["ADMIN", "TEACHER", "STUDENT", "PARENT"],
    TEACHER: ["STUDENT", "PARENT"],
}

const createUserSchema = z.object({
    firstName: z.string().min(2),
    lastName: z.string(),
    phone: z.string().regex(/^\d{9}$/, "Enter a valid 9-digit phone number"),
    password: z.string().min(6),
    role: z.string().min(1, "Select a role"),
})

const UsersTab = () => {
    const token = useAuthStore((state) => state.token)
    const me = token ? jwtDecode<TokenPayload>(token) : null
    const [openCreate, setOpenCreate] = useState(false)
    const [openUpdate, setOpenUpdate] = useState(false)
    const [openDelete, setOpenDelete] = useState(false)
    const [selectedUser, setSelectedUser] = useState<TokenPayload | null>(null)
    const creatableRoles = CREATABLE_ROLES[me?.role ?? ""] ?? []
    const router = useRouter()
    const searchParams = useSearchParams()
    const queryClient = useQueryClient()
    const page = Number(searchParams.get('page') ?? 1)
    const limit = Number(searchParams.get('limit') ?? 10)
    const role = searchParams.get('role') ?? ''
    const search = searchParams.get('search') ?? ''
    const [searchInput, setSearchInput] = useState(search)

    useEffect(() => {
        const handler = setTimeout(() => {
            if (searchInput === search) return
            const params = new URLSearchParams(searchParams.toString())
            if (searchInput) params.set('search', searchInput); else params.delete('search')
            params.set('page', '1')
            router.push(`?${params.toString()}`)
        }, 400)
        return () => clearTimeout(handler)
    }, [searchInput])

    const { data } = useSuspenseQuery({
        queryKey: ['users', page, limit, role, search],
        queryFn: async () => {
            const res = await api.get('/users', {
                params: { page, limit, ...(role && { role }), ...(search && { search }) },
            })
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

    const createUserMutation = useMutation({
        mutationFn: async (payload: CreateUserPayload) => {
            return await api.post('/users', payload)
        },
        onSuccess: () => {
            toast.success('User created successfully')
            setOpenCreate(false)
            createForm.reset()
            queryClient.invalidateQueries({ queryKey: ['users'] })
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message ?? 'Something went wrong')
        },
    })

    const createForm = useForm({
        defaultValues: { firstName: "", lastName: "", phone: "", password: "", role: "" },
        validators: { onSubmit: createUserSchema },
        onSubmit: async ({ value }) => {
            createUserMutation.mutate({ ...value, phone: `+998${value.phone}` })
        },
    })

    const users: TokenPayload[] = data?.data ?? []
    const meta: PaginationType = data?.meta ?? {}
    const lastPage = meta?.last_page ?? 1

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative w-64">
                        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search by name or phone"
                            className="pl-8"
                        />
                    </div>
                    <Select value={role || 'ALL'} onValueChange={(val) => {
                        const params = new URLSearchParams(searchParams.toString())
                        if (val === 'ALL') params.delete('role'); else params.set('role', val)
                        params.set('page', '1')
                        router.push(`?${params.toString()}`)
                    }}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="All roles" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="ALL">All roles</SelectItem>
                                {Object.keys(roleVariant).map((r) => (
                                    <SelectItem key={r} value={r} className="capitalize">
                                        {r.toLowerCase()}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                {creatableRoles.length > 0 && (
                    <Button onClick={() => setOpenCreate(true)} className="gap-1">
                        <UserPlus className="h-4 w-4" /> Create user
                    </Button>
                )}
            </div>

            <Table>
                <TableCaption>
                    Showing {users.length} of {meta?.total ?? 0} users
                </TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12 text-center font-semibold">#</TableHead>
                        <TableHead className="text-center font-semibold">Name</TableHead>
                        <TableHead className="text-center font-semibold">Phone</TableHead>
                        <TableHead className="text-center font-semibold">Role</TableHead>
                        <TableHead className="w-16 text-center font-semibold">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((u, idx) => {
                        const isMe = me?.phone === u.phone
                        return (
                            <TableRow key={u.id} className={cn(isMe && "bg-primary/5")}>
                                <TableCell className="text-center">{(page - 1) * limit + idx + 1}</TableCell>
                                <TableCell className="text-center font-medium">
                                    {[u.firstName, u.lastName].filter(Boolean).join(' ')}
                                    {isMe && <span className="ml-2 text-xs text-primary">(you)</span>}
                                </TableCell>
                                <TableCell className="text-center text-muted-foreground">{u.phone}</TableCell>
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

            {/* Create user modal */}
            <Dialog open={openCreate} onOpenChange={setOpenCreate}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Create User</DialogTitle>
                        <DialogDescription>Add a new teacher, student, or parent to your center.</DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={(e) => { e.preventDefault(); createForm.handleSubmit() }}
                        className="flex flex-col gap-5"
                    >
                        <FieldGroup>
                            <createForm.Field name="firstName">
                                {(field) => {
                                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>First name</FieldLabel>
                                            <Input
                                                id={field.name}
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                            />
                                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                        </Field>
                                    )
                                }}
                            </createForm.Field>

                            <createForm.Field name="lastName">
                                {(field) => (
                                    <Field>
                                        <FieldLabel htmlFor={field.name}>Last name (optional)</FieldLabel>
                                        <Input
                                            id={field.name}
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                        />
                                    </Field>
                                )}
                            </createForm.Field>

                            <createForm.Field name="phone">
                                {(field) => {
                                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>Phone number</FieldLabel>
                                            <div className="flex items-center gap-2">
                                                <span className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground">
                                                    +998
                                                </span>
                                                <Input
                                                    id={field.name}
                                                    type="tel"
                                                    inputMode="numeric"
                                                    value={field.state.value}
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) => field.handleChange(e.target.value.replace(/\D/g, "").slice(0, 9))}
                                                    placeholder="997771122"
                                                />
                                            </div>
                                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                        </Field>
                                    )
                                }}
                            </createForm.Field>

                            <createForm.Field name="password">
                                {(field) => {
                                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>Temporary password</FieldLabel>
                                            <Input
                                                id={field.name}
                                                type="password"
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                placeholder="Min. 6 characters"
                                            />
                                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                        </Field>
                                    )
                                }}
                            </createForm.Field>

                            <createForm.Field name="role">
                                {(field) => {
                                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>Role</FieldLabel>
                                            <Select value={field.state.value} onValueChange={(val) => field.handleChange(val)}>
                                                <SelectTrigger id={field.name}>
                                                    <SelectValue placeholder="Select a role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {creatableRoles.map((role) => (
                                                            <SelectItem key={role} value={role} className="capitalize">
                                                                {role.toLowerCase()}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                        </Field>
                                    )
                                }}
                            </createForm.Field>
                        </FieldGroup>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline" type="button">Cancel</Button>
                            </DialogClose>
                            <Button type="submit" disabled={createUserMutation.isPending}>
                                {createUserMutation.isPending ? 'Creating…' : 'Create'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit user modal */}
            <Dialog open={openUpdate} onOpenChange={setOpenUpdate}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>Update details for <strong>{[selectedUser?.firstName, selectedUser?.lastName].filter(Boolean).join(' ')}</strong></DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <Label htmlFor="edit-firstName">First name</Label>
                            <Input
                                id="edit-firstName"
                                value={selectedUser?.firstName ?? ""}
                                onChange={(e) => setSelectedUser(prev => prev ? { ...prev, firstName: e.target.value } : prev)}
                            />
                        </Field>
                        <Field>
                            <Label htmlFor="edit-lastName">Last name</Label>
                            <Input
                                id="edit-lastName"
                                value={selectedUser?.lastName ?? ""}
                                onChange={(e) => setSelectedUser(prev => prev ? { ...prev, lastName: e.target.value } : prev)}
                            />
                        </Field>
                        <Field>
                            <Label htmlFor="edit-phone">Phone</Label>
                            <Input
                                id="edit-phone"
                                value={selectedUser?.phone ?? ""}
                                onChange={(e) => setSelectedUser(prev => prev ? { ...prev, phone: e.target.value } : prev)}
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
                            Are you sure you want to delete <strong>{[selectedUser?.firstName, selectedUser?.lastName].filter(Boolean).join(' ')}</strong>? This action cannot be undone.
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

export default UsersTab
