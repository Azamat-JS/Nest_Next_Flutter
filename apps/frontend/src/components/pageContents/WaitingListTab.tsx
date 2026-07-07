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
import { TokenPayload, WaitingListUser, CreateWaitingListPayload } from "@/lib/types/token_payload"
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
import { MoreHorizontal, Edit, Trash, Search, UserPlus } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { useRouter, useSearchParams } from 'next/navigation'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { PaginationType } from "@/lib/types/groups"
import api from "@/lib/api"
import { useForm } from "@tanstack/react-form"
import * as z from "zod"

const createWaitingListSchema = z.object({
    firstName: z.string().min(2),
    lastName: z.string(),
    phone: z.string().regex(/^\d{9}$/, "Enter a valid 9-digit phone number"),
    reason: z.string(),
})

const WaitingListTab = () => {
    const token = useAuthStore((state) => state.token)
    const me = token ? jwtDecode<TokenPayload>(token) : null
    const canCreate = me?.role === 'ADMIN' || me?.role === 'TEACHER'
    const [openCreate, setOpenCreate] = useState(false)
    const [openUpdate, setOpenUpdate] = useState(false)
    const [openDelete, setOpenDelete] = useState(false)
    const [selectedEntry, setSelectedEntry] = useState<WaitingListUser | null>(null)
    const router = useRouter()
    const searchParams = useSearchParams()
    const queryClient = useQueryClient()
    const page = Number(searchParams.get('wlPage') ?? 1)
    const limit = Number(searchParams.get('wlLimit') ?? 10)
    const search = searchParams.get('wlSearch') ?? ''
    const [searchInput, setSearchInput] = useState(search)

    useEffect(() => {
        const handler = setTimeout(() => {
            if (searchInput === search) return
            const params = new URLSearchParams(searchParams.toString())
            if (searchInput) params.set('wlSearch', searchInput); else params.delete('wlSearch')
            params.set('wlPage', '1')
            router.push(`?${params.toString()}`)
        }, 400)
        return () => clearTimeout(handler)
    }, [searchInput])

    const { data } = useSuspenseQuery({
        queryKey: ['waiting-list', page, limit, search],
        queryFn: async () => {
            const res = await api.get('/waiting-list', {
                params: { page, limit, ...(search && { search }) },
            })
            return res.data
        },
        staleTime: 1000 * 60 * 5,
    })

    const updateEntryMutation = useMutation({
        mutationFn: async (entry: WaitingListUser) => {
            return await api.put(`/waiting-list/${entry.id}`, entry)
        },
        onSuccess: () => {
            toast.success('Waiting list entry updated successfully')
            setOpenUpdate(false)
            queryClient.invalidateQueries({ queryKey: ['waiting-list'] })
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message ?? 'Something went wrong')
        },
    })

    const deleteEntryMutation = useMutation({
        mutationFn: async (id: string) => {
            return await api.delete(`/waiting-list/${id}`)
        },
        onSuccess: () => {
            toast.success('Waiting list entry deleted successfully')
            setOpenDelete(false)
            queryClient.invalidateQueries({ queryKey: ['waiting-list'] })
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message ?? 'Something went wrong')
        },
    })

    const createEntryMutation = useMutation({
        mutationFn: async (payload: CreateWaitingListPayload) => {
            return await api.post('/waiting-list', payload)
        },
        onSuccess: () => {
            toast.success('Waiting list entry created successfully')
            setOpenCreate(false)
            createForm.reset()
            queryClient.invalidateQueries({ queryKey: ['waiting-list'] })
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message ?? 'Something went wrong')
        },
    })

    const createForm = useForm({
        defaultValues: { firstName: "", lastName: "", phone: "", reason: "" },
        validators: { onSubmit: createWaitingListSchema },
        onSubmit: async ({ value }) => {
            createEntryMutation.mutate({ ...value, phone: `+998${value.phone}` })
        },
    })

    const entries: WaitingListUser[] = data?.data ?? []
    const meta: PaginationType = data?.meta ?? {}
    const lastPage = meta?.last_page ?? 1

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="relative w-64">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search by name or phone"
                        className="pl-8"
                    />
                </div>
                {canCreate && (
                    <Button onClick={() => setOpenCreate(true)} className="gap-1">
                        <UserPlus className="h-4 w-4" /> Add to waiting list
                    </Button>
                )}
            </div>

            <Table>
                <TableCaption>
                    Showing {entries.length} of {meta?.total ?? 0} waiting list entries
                </TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12 text-center font-semibold">#</TableHead>
                        <TableHead className="text-center font-semibold">Name</TableHead>
                        <TableHead className="text-center font-semibold">Phone</TableHead>
                        <TableHead className="text-center font-semibold">Reason</TableHead>
                        <TableHead className="w-16 text-center font-semibold">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {entries.map((u, idx) => (
                        <TableRow key={u.id}>
                            <TableCell className="text-center">{(page - 1) * limit + idx + 1}</TableCell>
                            <TableCell className="text-center font-medium">
                                {[u.firstName, u.lastName].filter(Boolean).join(' ')}
                            </TableCell>
                            <TableCell className="text-center text-muted-foreground">{u.phone}</TableCell>
                            <TableCell className="text-center text-muted-foreground max-w-64 truncate" title={u.reason ?? ''}>
                                {u.reason || '—'}
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
                                            <DropdownMenuItem onClick={() => { setOpenUpdate(true); setSelectedEntry(u) }}>
                                                <Edit className="h-4 w-4" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => { setOpenDelete(true); setSelectedEntry(u) }}
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
                        <FieldLabel htmlFor="waiting-list-rows-per-page">Rows per page</FieldLabel>
                        <Select value={String(limit)} onValueChange={(val) => {
                            const params = new URLSearchParams(searchParams.toString())
                            params.set('wlLimit', val)
                            params.set('wlPage', '1')
                            router.push(`?${params.toString()}`)
                        }}>
                            <SelectTrigger className="w-20" id="waiting-list-rows-per-page">
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
                                <PaginationPrevious href={`?wlPage=${Math.max(1, page - 1)}&wlLimit=${limit}`} />
                            </PaginationItem>
                            {Array.from({ length: lastPage }).map((_, idx) => (
                                <PaginationItem key={idx}>
                                    <PaginationLink href={`?wlPage=${idx + 1}&wlLimit=${limit}`} isActive={page === idx + 1}>
                                        {idx + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext href={`?wlPage=${Math.min(lastPage, page + 1)}&wlLimit=${limit}`} />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </div>

            {/* Create waiting list entry modal */}
            <Dialog open={openCreate} onOpenChange={setOpenCreate}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Add to Waiting List</DialogTitle>
                        <DialogDescription>Save contact details for someone who isn&apos;t registered yet.</DialogDescription>
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

                            <createForm.Field name="reason">
                                {(field) => {
                                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>Reason (optional)</FieldLabel>
                                            <Textarea
                                                id={field.name}
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                placeholder="e.g. Asked to be notified when the next course starts"
                                            />
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
                            <Button type="submit" disabled={createEntryMutation.isPending}>
                                {createEntryMutation.isPending ? 'Adding…' : 'Add'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit waiting list entry modal */}
            <Dialog open={openUpdate} onOpenChange={setOpenUpdate}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Edit Waiting List Entry</DialogTitle>
                        <DialogDescription>Update details for <strong>{[selectedEntry?.firstName, selectedEntry?.lastName].filter(Boolean).join(' ')}</strong></DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <Label htmlFor="edit-wl-firstName">First name</Label>
                            <Input
                                id="edit-wl-firstName"
                                value={selectedEntry?.firstName ?? ""}
                                onChange={(e) => setSelectedEntry(prev => prev ? { ...prev, firstName: e.target.value } : prev)}
                            />
                        </Field>
                        <Field>
                            <Label htmlFor="edit-wl-lastName">Last name</Label>
                            <Input
                                id="edit-wl-lastName"
                                value={selectedEntry?.lastName ?? ""}
                                onChange={(e) => setSelectedEntry(prev => prev ? { ...prev, lastName: e.target.value } : prev)}
                            />
                        </Field>
                        <Field>
                            <Label htmlFor="edit-wl-phone">Phone</Label>
                            <Input
                                id="edit-wl-phone"
                                value={selectedEntry?.phone ?? ""}
                                onChange={(e) => setSelectedEntry(prev => prev ? { ...prev, phone: e.target.value } : prev)}
                            />
                        </Field>
                        <Field>
                            <Label htmlFor="edit-wl-reason">Reason</Label>
                            <Textarea
                                id="edit-wl-reason"
                                value={selectedEntry?.reason ?? ""}
                                onChange={(e) => setSelectedEntry(prev => prev ? { ...prev, reason: e.target.value } : prev)}
                            />
                        </Field>
                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                            onClick={() => selectedEntry && updateEntryMutation.mutate(selectedEntry)}
                            disabled={updateEntryMutation.isPending}
                        >
                            {updateEntryMutation.isPending ? 'Saving…' : 'Save'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete confirmation modal */}
            <Dialog open={openDelete} onOpenChange={setOpenDelete}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Remove from Waiting List</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to remove <strong>{[selectedEntry?.firstName, selectedEntry?.lastName].filter(Boolean).join(' ')}</strong> from the waiting list? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            onClick={() => selectedEntry && deleteEntryMutation.mutate(selectedEntry.id)}
                            disabled={deleteEntryMutation.isPending}
                        >
                            {deleteEntryMutation.isPending ? 'Removing…' : 'Remove'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default WaitingListTab
