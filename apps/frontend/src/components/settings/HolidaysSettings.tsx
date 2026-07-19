'use client'

import { useMemo, useState } from "react"
import { toast } from "sonner"
import * as z from "zod"
import { useForm } from "@tanstack/react-form"
import { useFormatter, useTranslations } from "next-intl"
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import api from "@/lib/api"
import { cn } from "@/lib/utils"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
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
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer"
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Pencil, Plus, Trash } from "lucide-react"
import { HolidayType } from "@/lib/types/dashboard"

const HolidaysSettings = () => {
    const t = useTranslations('HolidaysSettings')
    const tCommon = useTranslations('Common')
    const formatter = useFormatter()
    const queryClient = useQueryClient()

    const [openForm, setOpenForm] = useState(false)
    const [dateOpen, setDateOpen] = useState(false)
    const [editTarget, setEditTarget] = useState<HolidayType | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<HolidayType | null>(null)

    const { data: holidays = [] } = useSuspenseQuery<HolidayType[]>({
        queryKey: ['holidays'],
        queryFn: async () => (await api.get('/holiday/all')).data,
        staleTime: 1000 * 60,
    })

    // Backend serializes @db.Date as "yyyy-MM-ddT00:00:00.000Z"; keep only the
    // date part and parse it as local midnight so the display never shifts a day.
    const toLocalDate = (iso: string) => new Date(`${iso.slice(0, 10)}T00:00:00`)
    const formatDate = (iso: string) =>
        formatter.dateTime(toLocalDate(iso), { year: 'numeric', month: 'long', day: 'numeric' })

    const schema = useMemo(() => z.object({
        date: z.string().min(1, t('dateRequired')),
        reason: z.string().trim().min(1, t('reasonRequired')),
    }), [t])

    const form = useForm({
        // Derived from editTarget: useForm re-applies defaultValues on render,
        // so static defaults would wipe values set imperatively via reset().
        defaultValues: {
            date: editTarget ? editTarget.date.slice(0, 10) : '',
            reason: editTarget?.reason ?? '',
        },
        validators: { onSubmit: schema },
        onSubmit: async ({ value }) => {
            const payload = {
                date: value.date,
                reason: value.reason.trim(),
            }
            try {
                if (editTarget) {
                    await api.put(`/holiday/${editTarget.id}`, payload)
                } else {
                    await api.post('/holiday', payload)
                }
                toast.success(editTarget ? t('updated') : t('created'))
                closeForm()
                queryClient.invalidateQueries({ queryKey: ['holidays'] })
            } catch (error: any) {
                toast.error(error.response?.data?.message ?? tCommon('errorGeneric'))
            }
        },
    })

    const openCreate = () => {
        setEditTarget(null)
        form.reset()
        setOpenForm(true)
    }

    const openEdit = (holiday: HolidayType) => {
        setEditTarget(holiday)
        form.reset()
        setOpenForm(true)
    }

    const closeForm = () => {
        setOpenForm(false)
        setEditTarget(null)
        form.reset()
    }

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => api.delete(`/holiday/${id}`),
        onSuccess: () => {
            toast.success(t('deleted'))
            setDeleteTarget(null)
            queryClient.invalidateQueries({ queryKey: ['holidays'] })
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message ?? tCommon('errorGeneric'))
        },
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">{t('title')}</h1>
                    <p className="text-muted-foreground">{t('description')}</p>
                </div>
                <Button onClick={openCreate} className="gap-1">
                    <Plus className="h-4 w-4" /> {t('createHoliday')}
                </Button>
            </div>

            {holidays.length === 0 ? (
                <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                    {t('empty')}
                </p>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="font-semibold">{t('dateHeader')}</TableHead>
                            <TableHead className="font-semibold">{t('reasonHeader')}</TableHead>
                            <TableHead className="w-24 text-center font-semibold">{tCommon('actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {holidays.map((holiday) => (
                            <TableRow key={holiday.id}>
                                <TableCell className="font-medium">{formatDate(holiday.date)}</TableCell>
                                <TableCell className="max-w-xs truncate text-muted-foreground">
                                    {holiday.reason}
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => openEdit(holiday)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                            onClick={() => setDeleteTarget(holiday)}
                                        >
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

            {/* Create / edit drawer */}
            <Drawer direction="right" open={openForm} onOpenChange={(open) => { if (!open) closeForm() }}>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle className="text-xl font-bold">
                            {editTarget ? t('editTitle') : t('createTitle')}
                        </DrawerTitle>
                    </DrawerHeader>
                    <div className="no-scrollbar overflow-y-auto px-4">
                        <form
                            id="holiday-form"
                            onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}
                            className="flex flex-col gap-6"
                        >
                            <FieldGroup>
                                <form.Field name="date">
                                    {(field) => {
                                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel htmlFor={field.name}>{t('dateLabel')}</FieldLabel>
                                                <Popover open={dateOpen} onOpenChange={setDateOpen}>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            id={field.name}
                                                            type="button"
                                                            variant="outline"
                                                            onBlur={field.handleBlur}
                                                            className={cn(
                                                                "w-full justify-start gap-2 font-normal",
                                                                !field.state.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            <CalendarIcon className="h-4 w-4" />
                                                            {field.state.value
                                                                ? formatDate(field.state.value)
                                                                : t('datePlaceholder')}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0">
                                                        <Calendar
                                                            mode="single"
                                                            selected={field.state.value ? toLocalDate(field.state.value) : undefined}
                                                            onSelect={(date) => {
                                                                if (!date) return
                                                                field.handleChange(format(date, "yyyy-MM-dd"))
                                                                setDateOpen(false)
                                                            }}
                                                            autoFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                            </Field>
                                        )
                                    }}
                                </form.Field>

                                <form.Field name="reason">
                                    {(field) => {
                                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel htmlFor={field.name}>{t('reasonLabel')}</FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    value={field.state.value}
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                    placeholder={t('reasonPlaceholder')}
                                                    autoComplete="off"
                                                />
                                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                            </Field>
                                        )
                                    }}
                                </form.Field>
                            </FieldGroup>
                        </form>
                    </div>
                    <DrawerFooter>
                        <form.Subscribe selector={(state) => state.isSubmitting}>
                            {(isSubmitting) => (
                                <Button type="submit" form="holiday-form" disabled={isSubmitting}>
                                    {isSubmitting ? t('saving') : (editTarget ? t('save') : t('createHoliday'))}
                                </Button>
                            )}
                        </form.Subscribe>
                        <DrawerClose asChild>
                            <Button variant="outline">{tCommon('cancel')}</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>

            {/* Delete confirmation */}
            <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{t('deleteTitle')}</DialogTitle>
                        <DialogDescription>
                            {t('deleteDescription', { date: deleteTarget ? formatDate(deleteTarget.date) : '' })}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">{tCommon('cancel')}</Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? t('deleting') : t('delete')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default HolidaysSettings
