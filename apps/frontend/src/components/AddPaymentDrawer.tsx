'use client'

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from "@/components/ui/button"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import * as z from "zod"
import { toast } from "sonner"
import { useForm, useStore } from "@tanstack/react-form"
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "./ui/label"
import { GroupType } from "@/lib/types/groups"
import { MONTH_NAMES, StudentPaymentsResponse } from "@/lib/types/payment_type"
import api from "@/lib/api"
import { Plus } from "lucide-react"
import { Textarea } from "./ui/textarea"

const schema = z.object({
    studentId: z.string().min(1, 'Student is required'),
    groupId: z.string().min(1, 'Group is required'),
    month: z.number().min(1).max(12),
    year: z.number().min(2000),
    amount: z.number().positive('Amount must be positive'),
    comment: z.string().optional(),
})

export function AddPaymentDrawer({ openCreate, setOpenCreate, groups, onPaymentAdded, preselectedStudentId }: {
    openCreate: boolean
    setOpenCreate: (open: boolean) => void
    groups: GroupType[]
    onPaymentAdded: () => void
    preselectedStudentId?: string
}) {
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1

    const form = useForm({
        defaultValues: {
            studentId: preselectedStudentId ?? '',
            groupId: '',
            month: currentMonth,
            year: currentYear,
            amount: 0,
            comment: '',
        },
        validators: { onSubmit: schema },
        onSubmit: async ({ value }) => {
            if (hasExistingPayment) {
                toast.warning('This student already has a payment on record. Add it from their payment history page instead.')
                return
            }
            try {
                const { studentId, groupId, month, year, amount, comment } = value
                await api.post(`/student-payment/create-payment/${studentId}/${groupId}`, {
                    month,
                    year,
                    amount,
                    comment: comment?.trim() || undefined,
                })
                form.reset()
                setOpenCreate(false)
                toast.success('Payment added successfully')
                onPaymentAdded()
            } catch (error: any) {
                toast.error(error.response?.data?.message ?? 'Something went wrong')
            }
        },
    })

    const years = Array.from({ length: 10 }, (_, i) => currentYear - 2 + i)

    const selectedGroupId = useStore(form.store, (state) => state.values.groupId)
    const groupStudents = groups.find((g) => g.id === selectedGroupId)?.students ?? []

    const selectedStudentId = useStore(form.store, (state) => state.values.studentId)
    const selectedStudent = groupStudents.find((s) => s.id === selectedStudentId)

    const { data: existingPaymentsData, isFetching: isCheckingExistingPayments } = useQuery<StudentPaymentsResponse>({
        queryKey: ['student-payments', selectedStudentId, 'exists-check'],
        queryFn: async () => {
            const res = await api.get(`/student-payment/student-payments/${selectedStudentId}`, { params: { limit: 1 } })
            return res.data
        },
        enabled: !preselectedStudentId && !!selectedStudentId,
        staleTime: 1000 * 30,
    })

    const hasExistingPayment = !preselectedStudentId && !!selectedStudentId && (existingPaymentsData?.meta?.total ?? 0) > 0

    useEffect(() => {
        if (hasExistingPayment && selectedStudent) {
            toast.warning(
                `A payment was already added to ${[selectedStudent.firstName, selectedStudent.lastName].filter(Boolean).join(' ')} before. Search for them in the table and open their payment history to add a new payment there.`
            )
        }
    }, [hasExistingPayment, selectedStudentId])

    return (
        <Drawer direction="right" open={openCreate} onOpenChange={setOpenCreate}>
            <DrawerTrigger asChild>
                <Button variant="default" className="gap-1">
                    <Plus className="h-4 w-4" /> Add Payment
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle className="text-xl font-bold">Add Payment</DrawerTitle>
                </DrawerHeader>
                <div className="no-scrollbar overflow-y-auto px-4">
                    <form
                        id="add-payment-form"
                        onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}
                        className="flex flex-col gap-6"
                    >
                        <FieldGroup>
                            <form.Field
                                name="groupId"
                                listeners={{
                                    onChange: () => form.setFieldValue('studentId', preselectedStudentId ?? ''),
                                }}
                            >
                                {(field) => {
                                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel>Group</FieldLabel>
                                            <Select
                                                value={field.state.value}
                                                onValueChange={field.handleChange}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a group" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        <SelectLabel>Groups</SelectLabel>
                                                        {groups.map((g) => (
                                                            <SelectItem key={g.id} value={g.id}>
                                                                {g.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                        </Field>
                                    )
                                }}
                            </form.Field>

                            {!preselectedStudentId && (
                                <form.Field name="studentId">
                                    {(field) => {
                                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel>Student</FieldLabel>
                                                <Select
                                                    value={field.state.value}
                                                    onValueChange={field.handleChange}
                                                    disabled={!selectedGroupId}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={selectedGroupId ? "Select a student" : "Select a group first"} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            <SelectLabel>Students</SelectLabel>
                                                            {groupStudents.map((s) => (
                                                                <SelectItem key={s.id} value={s.id}>
                                                                    {[s.firstName, s.lastName].filter(Boolean).join(' ')}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                                {hasExistingPayment && (
                                                    <p className="text-sm text-destructive">
                                                        A payment was already added to this student before. Search for them in the table and open their payment history to add a new payment there.
                                                    </p>
                                                )}
                                            </Field>
                                        )
                                    }}
                                </form.Field>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <form.Field name="month">
                                    {(field) => (
                                        <Field>
                                            <FieldLabel>Month</FieldLabel>
                                            <Select
                                                value={String(field.state.value)}
                                                onValueChange={(v) => field.handleChange(Number(v))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {MONTH_NAMES.map((name, i) => (
                                                            <SelectItem key={i + 1} value={String(i + 1)}>
                                                                {name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </Field>
                                    )}
                                </form.Field>

                                <form.Field name="year">
                                    {(field) => (
                                        <Field>
                                            <FieldLabel>Year</FieldLabel>
                                            <Select
                                                value={String(field.state.value)}
                                                onValueChange={(v) => field.handleChange(Number(v))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {years.map((y) => (
                                                            <SelectItem key={y} value={String(y)}>
                                                                {y}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </Field>
                                    )}
                                </form.Field>
                            </div>

                            <form.Field name="amount">
                                {(field) => {
                                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel>Amount</FieldLabel>
                                            <Input
                                                id={field.name}
                                                type="number"
                                                min={0}
                                                step="0.01"
                                                value={field.state.value || ''}
                                                onBlur={field.handleBlur}
                                                onChange={(e) => field.handleChange(Number(e.target.value))}
                                                placeholder="0.00"
                                            />
                                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                        </Field>
                                    )
                                }}
                            </form.Field>

                            <form.Field name="comment">
                                {(field) => (
                                    <Field>
                                        <Label htmlFor={field.name}>Comment (optional)</Label>
                                        <Textarea
                                            id={field.name}
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            placeholder="Add a note..."
                                            rows={3}
                                        />
                                    </Field>
                                )}
                            </form.Field>
                        </FieldGroup>
                    </form>
                </div>
                <DrawerFooter>
                    <Button
                        type="submit"
                        form="add-payment-form"
                        disabled={hasExistingPayment || isCheckingExistingPayments}
                    >
                        Add Payment
                    </Button>
                    <DrawerClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}
