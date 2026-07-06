'use client'

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
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
import { GroupType, PaginationType } from "@/lib/types/groups"
import { LatestPaymentsResponse, MONTH_NAMES, StudentPaymentType } from "@/lib/types/payment_type"
import { AddPaymentDrawer } from "@/components/AddPaymentDrawer"
import { useAuthStore } from "@/lib/stores/authStore"
import { jwtDecode } from "jwt-decode"
import api from "@/lib/api"

const PaymentsComponent = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const page = Number(searchParams.get('page') ?? 1)
    const limit = Number(searchParams.get('limit') ?? 10)
    const groupIdParam = searchParams.get('groupId') ?? ''
    const searchParam = searchParams.get('search') ?? ''

    const [searchInput, setSearchInput] = useState(searchParam)
    const [openCreate, setOpenCreate] = useState(false)
    const [openUpdate, setOpenUpdate] = useState(false)
    const [openDelete, setOpenDelete] = useState(false)
    const [selectedPayment, setSelectedPayment] = useState<StudentPaymentType | null>(null)
    const [editForm, setEditForm] = useState({ month: 1, year: new Date().getFullYear(), amount: 0, comment: '' })

    const queryClient = useQueryClient()
    const token = useAuthStore((s) => s.token)
    const decoded = token ? jwtDecode<{ role: string }>(token) : null
    const canEdit = decoded?.role === 'ADMIN' || decoded?.role === 'TEACHER'

    const { data: groupsData } = useSuspenseQuery({
        queryKey: ['groups-all'],
        queryFn: async () => {
            const res = await api.get('/group/all', { params: { limit: 200 } })
            return res.data
        },
        staleTime: 1000 * 60 * 10,
    })

    const { data } = useSuspenseQuery<LatestPaymentsResponse>({
        queryKey: ['payments-latest', page, limit, searchParam, groupIdParam],
        queryFn: async () => {
            const params: Record<string, any> = { page, limit }
            if (searchParam) params.search = searchParam
            if (groupIdParam) params.groupId = groupIdParam
            const res = await api.get('/student-payment/latest-per-student', { params })
            return res.data
        },
        staleTime: 1000 * 60 * 5,
    })

    // Debounce search input → URL (skip if already matches current URL param)
    useEffect(() => {
        const currentSearch = searchParams.get('search') ?? ''
        if (searchInput === currentSearch) return
        const t = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString())
            if (searchInput) {
                params.set('search', searchInput)
            } else {
                params.delete('search')
            }
            params.set('page', '1')
            router.push(`?${params.toString()}`)
        }, 400)
        return () => clearTimeout(t)
    }, [searchInput])

    const updatePaymentMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: typeof editForm }) => {
            return await api.put(`/student-payment/update-payment/${id}`, {
                month: data.month,
                year: data.year,
                amount: data.amount,
                comment: data.comment?.trim() || undefined,
            })
        },
        onSuccess: () => {
            toast.success('Payment updated successfully')
            setOpenUpdate(false)
            queryClient.invalidateQueries({ queryKey: ['payments-latest'] })
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message ?? 'Something went wrong')
        },
    })

    const deletePaymentMutation = useMutation({
        mutationFn: async (paymentId: string) => {
            return await api.delete(`/student-payment/delete-payment/${paymentId}`)
        },
        onSuccess: () => {
            toast.success('Payment deleted successfully')
            setOpenDelete(false)
            queryClient.invalidateQueries({ queryKey: ['payments-latest'] })
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message ?? 'Something went wrong')
        },
    })

    const groups: GroupType[] = groupsData?.data ?? []
    const payments: StudentPaymentType[] = data?.data ?? []
    const meta: PaginationType = data?.meta ?? {}
    const lastPage = meta?.last_page ?? 1

    const currentYear = new Date().getFullYear()
    const years = Array.from({ length: 10 }, (_, i) => currentYear - 2 + i)

    return (
        <div className="space-y-4">
            {/* Search and filter bar */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        className="pl-9"
                        placeholder="Search by name or email..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                </div>
                <Select
                    value={groupIdParam || '__all__'}
                    onValueChange={(val) => {
                        const params = new URLSearchParams(searchParams.toString())
                        if (val === '__all__') {
                            params.delete('groupId')
                        } else {
                            params.set('groupId', val)
                        }
                        params.set('page', '1')
                        router.push(`?${params.toString()}`)
                    }}
                >
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by group" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="__all__">All groups</SelectItem>
                            {groups.map((g) => (
                                <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>

            <Table>
                <TableCaption>
                    Showing {payments.length} of {meta?.total ?? 0} students with payments
                </TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12 text-center font-semibold">#</TableHead>
                        <TableHead className="text-center font-semibold">Student</TableHead>
                        <TableHead className="text-center font-semibold">Email</TableHead>
                        <TableHead className="text-center font-semibold">Group</TableHead>
                        <TableHead className="text-center font-semibold">Last Payment</TableHead>
                        <TableHead className="text-center font-semibold">Amount</TableHead>
                        <TableHead className="text-center font-semibold">Comment</TableHead>
                        {canEdit && <TableHead className="w-16 text-center font-semibold">Actions</TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {payments.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={canEdit ? 8 : 7} className="text-center text-muted-foreground py-8">
                                No payments found
                            </TableCell>
                        </TableRow>
                    ) : payments.map((p, idx) => (
                        <TableRow
                            key={p.id}
                            className="hover:bg-muted/50 cursor-pointer"
                            onClick={() => router.push(`/payments/${p.studentId}`)}
                        >
                            <TableCell className="text-center">{(page - 1) * limit + idx + 1}</TableCell>
                            <TableCell className="text-center font-medium hover:text-primary hover:underline">
                                {p.student?.username ?? '—'}
                            </TableCell>
                            <TableCell className="text-center text-muted-foreground">
                                {p.student?.email ?? '—'}
                            </TableCell>
                            <TableCell className="text-center text-muted-foreground">
                                {p.group?.name ?? '—'}
                            </TableCell>
                            <TableCell className="text-center text-muted-foreground">
                                {MONTH_NAMES[p.month - 1]} {p.year}
                            </TableCell>
                            <TableCell className="text-center font-semibold">
                                {Number(p.amount).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-center text-muted-foreground max-w-32 truncate">
                                {p.comment ?? '—'}
                            </TableCell>
                            {canEdit && (
                                <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuGroup>
                                                <DropdownMenuItem onClick={() => {
                                                    setSelectedPayment(p)
                                                    setEditForm({
                                                        month: p.month,
                                                        year: p.year,
                                                        amount: Number(p.amount),
                                                        comment: p.comment ?? '',
                                                    })
                                                    setOpenUpdate(true)
                                                }}>
                                                    <Edit className="h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={() => {
                                                        setSelectedPayment(p)
                                                        setOpenDelete(true)
                                                    }}
                                                >
                                                    <Trash className="h-4 w-4" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Pagination */}
            <div className="grid grid-cols-2 items-center">
                <div className="flex justify-center">
                    <Field orientation="horizontal" className="w-fit">
                        <FieldLabel htmlFor="payments-rows-per-page">Rows per page</FieldLabel>
                        <Select value={String(limit)} onValueChange={(val) => {
                            const params = new URLSearchParams(searchParams.toString())
                            params.set('limit', val)
                            params.set('page', '1')
                            router.push(`?${params.toString()}`)
                        }}>
                            <SelectTrigger className="w-20" id="payments-rows-per-page">
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
                                <PaginationPrevious href={`?page=${Math.max(1, page - 1)}&limit=${limit}${searchParam ? `&search=${searchParam}` : ''}${groupIdParam ? `&groupId=${groupIdParam}` : ''}`} />
                            </PaginationItem>
                            {Array.from({ length: lastPage }).map((_, idx) => (
                                <PaginationItem key={idx}>
                                    <PaginationLink
                                        href={`?page=${idx + 1}&limit=${limit}${searchParam ? `&search=${searchParam}` : ''}${groupIdParam ? `&groupId=${groupIdParam}` : ''}`}
                                        isActive={page === idx + 1}
                                    >
                                        {idx + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext href={`?page=${Math.min(lastPage, page + 1)}&limit=${limit}${searchParam ? `&search=${searchParam}` : ''}${groupIdParam ? `&groupId=${groupIdParam}` : ''}`} />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </div>

            {/* Edit payment modal */}
            <Dialog open={openUpdate} onOpenChange={setOpenUpdate}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Edit Payment</DialogTitle>
                        <DialogDescription>
                            Update payment for <strong>{selectedPayment?.student?.username}</strong>
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <div className="grid grid-cols-2 gap-3">
                            <Field>
                                <Label>Month</Label>
                                <Select
                                    value={String(editForm.month)}
                                    onValueChange={(v) => setEditForm(prev => ({ ...prev, month: Number(v) }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {MONTH_NAMES.map((name, i) => (
                                                <SelectItem key={i + 1} value={String(i + 1)}>{name}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </Field>
                            <Field>
                                <Label>Year</Label>
                                <Select
                                    value={String(editForm.year)}
                                    onValueChange={(v) => setEditForm(prev => ({ ...prev, year: Number(v) }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {years.map((y) => (
                                                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </Field>
                        </div>
                        <Field>
                            <Label>Amount</Label>
                            <Input
                                type="number"
                                min={0}
                                step="0.01"
                                value={editForm.amount}
                                onChange={(e) => setEditForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                            />
                        </Field>
                        <Field>
                            <Label>Comment (optional)</Label>
                            <Input
                                type="text"
                                value={editForm.comment}
                                onChange={(e) => setEditForm(prev => ({ ...prev, comment: e.target.value }))}
                                placeholder="Add a note..."
                            />
                        </Field>
                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                            onClick={() => selectedPayment && updatePaymentMutation.mutate({ id: selectedPayment.id, data: editForm })}
                            disabled={updatePaymentMutation.isPending}
                        >
                            {updatePaymentMutation.isPending ? 'Saving…' : 'Save'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete payment confirmation */}
            <Dialog open={openDelete} onOpenChange={setOpenDelete}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Delete Payment</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the payment for <strong>{selectedPayment?.student?.username}</strong> ({MONTH_NAMES[(selectedPayment?.month ?? 1) - 1]} {selectedPayment?.year})? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            onClick={() => selectedPayment && deletePaymentMutation.mutate(selectedPayment.id)}
                            disabled={deletePaymentMutation.isPending}
                        >
                            {deletePaymentMutation.isPending ? 'Deleting…' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {canEdit && (
                <div className="flex justify-end pt-2">
                    <AddPaymentDrawer
                        openCreate={openCreate}
                        setOpenCreate={setOpenCreate}
                        groups={groups}
                        onPaymentAdded={() => queryClient.invalidateQueries({ queryKey: ['payments-latest'] })}
                    />
                </div>
            )}
        </div>
    )
}

export default PaymentsComponent
