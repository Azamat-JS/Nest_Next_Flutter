'use client'

import { useMemo, useState } from "react"
import { toast } from "sonner"
import * as z from "zod"
import { useForm } from "@tanstack/react-form"
import { useTranslations } from "next-intl"
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import api from "@/lib/api"
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil, Plus, Trash } from "lucide-react"
import { CourseType } from "@/lib/types/dashboard"

const CoursesSettings = () => {
    const t = useTranslations('CoursesSettings')
    const tCommon = useTranslations('Common')
    const queryClient = useQueryClient()

    const [openForm, setOpenForm] = useState(false)
    const [editTarget, setEditTarget] = useState<CourseType | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<CourseType | null>(null)

    const { data: courses = [] } = useSuspenseQuery<CourseType[]>({
        queryKey: ['courses'],
        queryFn: async () => (await api.get('/course/all')).data,
        staleTime: 1000 * 60,
    })

    const schema = useMemo(() => z.object({
        name: z.string().trim().min(1, t('nameRequired')),
        price: z.number().positive(t('pricePositive')),
        durationMonths: z.number().int().min(1, t('durationMin')).max(60),
        description: z.string(),
    }), [t])

    const form = useForm({
        // Derived from editTarget: useForm re-applies defaultValues on render,
        // so static defaults would wipe values set imperatively via reset().
        defaultValues: {
            name: editTarget?.name ?? '',
            price: editTarget ? Number(editTarget.price) : 0,
            durationMonths: editTarget?.durationMonths ?? 1,
            description: editTarget?.description ?? '',
        },
        validators: { onSubmit: schema },
        onSubmit: async ({ value }) => {
            const payload = {
                name: value.name.trim(),
                price: value.price,
                durationMonths: value.durationMonths,
                description: value.description.trim() || undefined,
            }
            try {
                if (editTarget) {
                    await api.put(`/course/${editTarget.id}`, payload)
                } else {
                    await api.post('/course', payload)
                }
                toast.success(editTarget ? t('updated') : t('created'))
                closeForm()
                queryClient.invalidateQueries({ queryKey: ['courses'] })
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

    const openEdit = (course: CourseType) => {
        setEditTarget(course)
        form.reset()
        setOpenForm(true)
    }

    const closeForm = () => {
        setOpenForm(false)
        setEditTarget(null)
        form.reset()
    }

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => api.delete(`/course/${id}`),
        onSuccess: () => {
            toast.success(t('deleted'))
            setDeleteTarget(null)
            queryClient.invalidateQueries({ queryKey: ['courses'] })
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
                    <Plus className="h-4 w-4" /> {t('createCourse')}
                </Button>
            </div>

            {courses.length === 0 ? (
                <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                    {t('empty')}
                </p>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="font-semibold">{tCommon('name')}</TableHead>
                            <TableHead className="text-center font-semibold">{t('priceHeader')}</TableHead>
                            <TableHead className="text-center font-semibold">{t('durationHeader')}</TableHead>
                            <TableHead className="font-semibold">{t('descriptionHeader')}</TableHead>
                            <TableHead className="w-24 text-center font-semibold">{tCommon('actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {courses.map((course) => (
                            <TableRow key={course.id}>
                                <TableCell className="font-medium">{course.name}</TableCell>
                                <TableCell className="text-center">{Number(course.price).toLocaleString()}</TableCell>
                                <TableCell className="text-center">
                                    <Badge variant="secondary">{t('months', { count: course.durationMonths })}</Badge>
                                </TableCell>
                                <TableCell className="max-w-xs truncate text-muted-foreground">
                                    {course.description || '—'}
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => openEdit(course)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                            onClick={() => setDeleteTarget(course)}
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
                            id="course-form"
                            onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}
                            className="flex flex-col gap-6"
                        >
                            <FieldGroup>
                                <form.Field name="name">
                                    {(field) => {
                                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel htmlFor={field.name}>{tCommon('name')}</FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    value={field.state.value}
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                    placeholder={t('namePlaceholder')}
                                                    autoComplete="off"
                                                />
                                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                            </Field>
                                        )
                                    }}
                                </form.Field>

                                <form.Field name="price">
                                    {(field) => {
                                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel htmlFor={field.name}>{t('priceLabel')}</FieldLabel>
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

                                <form.Field name="durationMonths">
                                    {(field) => {
                                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel htmlFor={field.name}>{t('durationLabel')}</FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    type="number"
                                                    min={1}
                                                    max={60}
                                                    step={1}
                                                    value={field.state.value || ''}
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) => field.handleChange(Number(e.target.value))}
                                                />
                                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                            </Field>
                                        )
                                    }}
                                </form.Field>

                                <form.Field name="description">
                                    {(field) => (
                                        <Field>
                                            <FieldLabel htmlFor={field.name}>{t('descriptionLabel')}</FieldLabel>
                                            <Textarea
                                                id={field.name}
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                placeholder={t('descriptionPlaceholder')}
                                                rows={3}
                                            />
                                        </Field>
                                    )}
                                </form.Field>
                            </FieldGroup>
                        </form>
                    </div>
                    <DrawerFooter>
                        <form.Subscribe selector={(state) => state.isSubmitting}>
                            {(isSubmitting) => (
                                <Button type="submit" form="course-form" disabled={isSubmitting}>
                                    {isSubmitting ? t('saving') : (editTarget ? t('save') : t('createCourse'))}
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
                            {t('deleteDescription', { name: deleteTarget?.name ?? '' })}
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

export default CoursesSettings
