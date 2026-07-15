'use client'

import { useMemo } from 'react'
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
import { useTranslations } from "next-intl"
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
import api from "@/lib/api"
import { Plus } from "lucide-react"
import { Textarea } from "./ui/textarea"

const monthValues = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"] as const
const paymentMethodValues = ["CASH", "CREDIT_CARD", "CLICK"] as const

export function AddPaymentDrawer({ openCreate, setOpenCreate, groups, onPaymentAdded, preselectedStudentId }: {
    openCreate: boolean
    setOpenCreate: (open: boolean) => void
    groups: GroupType[]
    onPaymentAdded: () => void
    preselectedStudentId?: string
}) {
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1
    const t = useTranslations('AddPaymentDrawer')
    const tMonths = useTranslations('Common.months')
    const tPaymentMethods = useTranslations('Common.paymentMethods')

    const schema = useMemo(() => z.object({
        studentId: z.string().min(1, t('studentRequired')),
        groupId: z.string().min(1, t('groupRequired')),
        month: z.number().min(1).max(12),
        year: z.number().min(2000),
        amount: z.number().positive(t('amountPositive')),
        paymentMethod: z.enum(paymentMethodValues, { message: t('paymentMethodRequired') }),
        comment: z.string(),
    }), [t])

    const form = useForm({
        defaultValues: {
            studentId: preselectedStudentId ?? '',
            groupId: '',
            month: currentMonth,
            year: currentYear,
            amount: 0,
            paymentMethod: 'CASH' as (typeof paymentMethodValues)[number],
            comment: '',
        },
        validators: { onSubmit: schema },
        onSubmit: async ({ value }) => {
            try {
                const { studentId, groupId, month, year, amount, paymentMethod, comment } = value
                await api.post(`/student-payment/create-payment/${studentId}/${groupId}`, {
                    month,
                    year,
                    amount,
                    paymentMethod,
                    comment: comment?.trim() || undefined,
                })
                form.reset()
                setOpenCreate(false)
                toast.success(t('success'))
                onPaymentAdded()
            } catch (error: any) {
                toast.error(error.response?.data?.message ?? t('error'))
            }
        },
    })

    const years = Array.from({ length: 10 }, (_, i) => currentYear - 2 + i)

    const selectedGroupId = useStore(form.store, (state) => state.values.groupId)
    const groupStudents = groups.find((g) => g.id === selectedGroupId)?.students ?? []

    return (
        <Drawer direction="right" open={openCreate} onOpenChange={setOpenCreate}>
            <DrawerTrigger asChild>
                <Button variant="default" className="gap-1">
                    <Plus className="h-4 w-4" /> {t('trigger')}
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle className="text-xl font-bold">{t('title')}</DrawerTitle>
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
                                            <FieldLabel>{t('groupLabel')}</FieldLabel>
                                            <Select
                                                value={field.state.value}
                                                onValueChange={field.handleChange}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t('selectGroup')} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        <SelectLabel>{t('groupsLabel')}</SelectLabel>
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
                                                <FieldLabel>{t('studentLabel')}</FieldLabel>
                                                <Select
                                                    value={field.state.value}
                                                    onValueChange={field.handleChange}
                                                    disabled={!selectedGroupId}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={selectedGroupId ? t('selectStudent') : t('selectGroupFirst')} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            <SelectLabel>{t('studentsLabel')}</SelectLabel>
                                                            {groupStudents.map((s) => (
                                                                <SelectItem key={s.id} value={s.id}>
                                                                    {[s.firstName, s.lastName].filter(Boolean).join(' ')}
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

                            <div className="grid grid-cols-2 gap-3">
                                <form.Field name="month">
                                    {(field) => (
                                        <Field>
                                            <FieldLabel>{t('monthLabel')}</FieldLabel>
                                            <Select
                                                value={String(field.state.value)}
                                                onValueChange={(v) => field.handleChange(Number(v))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {monthValues.map((m) => (
                                                            <SelectItem key={m} value={m}>
                                                                {tMonths(m)}
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
                                            <FieldLabel>{t('yearLabel')}</FieldLabel>
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
                                            <FieldLabel>{t('amountLabel')}</FieldLabel>
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

                            <form.Field name="paymentMethod">
                                {(field) => {
                                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel>{t('paymentMethodLabel')}</FieldLabel>
                                            <Select
                                                value={field.state.value}
                                                onValueChange={(v) => field.handleChange(v as (typeof paymentMethodValues)[number])}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t('selectPaymentMethod')} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {paymentMethodValues.map((m) => (
                                                            <SelectItem key={m} value={m}>
                                                                {tPaymentMethods(m)}
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

                            <form.Field name="comment">
                                {(field) => (
                                    <Field>
                                        <Label htmlFor={field.name}>{t('commentLabel')}</Label>
                                        <Textarea
                                            id={field.name}
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            placeholder={t('commentPlaceholder')}
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
                    >
                        {t('trigger')}
                    </Button>
                    <DrawerClose asChild>
                        <Button variant="outline">{t('cancel')}</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}
