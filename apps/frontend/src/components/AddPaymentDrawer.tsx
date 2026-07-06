'use client'

import { useState } from 'react'
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
import { useForm } from "@tanstack/react-form"
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
import { TokenPayload } from "@/lib/types/token_payload"
import { GroupType } from "@/lib/types/groups"
import { MONTH_NAMES } from "@/lib/types/payment_type"
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

export function AddPaymentDrawer({ openCreate, setOpenCreate, students, groups, onPaymentAdded, preselectedStudentId }: {
    openCreate: boolean
    setOpenCreate: (open: boolean) => void
    students: TokenPayload[]
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
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a student" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            <SelectLabel>Students</SelectLabel>
                                                            {students.map((s) => (
                                                                <SelectItem key={s.id} value={s.id}>
                                                                    {s.username}
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
                            )}

                            <form.Field name="groupId">
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
                    <Button type="submit" form="add-payment-form">Add Payment</Button>
                    <DrawerClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}
