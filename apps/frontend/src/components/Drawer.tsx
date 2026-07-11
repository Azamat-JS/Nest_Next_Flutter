'use client'

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
import { useState } from 'react'
import { Label } from "./ui/label"
import { TokenPayload } from "@/lib/types/token_payload"
import api from "@/lib/api"
import { Plus } from "lucide-react"

export function GroupDrawer({ openCreate, setOpenCreate, teachers, students, onGroupCreated }: {
    openCreate: boolean
    setOpenCreate: (open: boolean) => void
    teachers: TokenPayload[]
    students: TokenPayload[]
    onGroupCreated: () => void
}) {
    const [selectedTeacher, setSelectedTeacher] = useState<TokenPayload | null>(null)
    const t = useTranslations('GroupDrawer')

    const form = useForm({
        defaultValues: {
            name: "",
            teacherId: "",
            studentIds: [] as string[],
        },
        validators: {
            onSubmit: z.object({
                name: z.string().min(2),
                teacherId: z.string().min(1),
                studentIds: z.array(z.string()),
            }),
        },
        onSubmit: async ({ value }) => {
            try {
                await api.post('/group', value)
                form.reset()
                setSelectedTeacher(null)
                setOpenCreate(false)
                toast.success(t('success'))
                onGroupCreated()
            } catch (error: any) {
                toast.error(error.response?.data?.message ?? t('error'))
            }
        },
    })

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
                        id="create-group-form"
                        onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}
                        className="flex flex-col gap-6"
                    >
                        <FieldGroup>
                            <form.Field name="name">
                                {(field) => {
                                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>{t('nameLabel')}</FieldLabel>
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

                            <form.Field name="teacherId">
                                {(field) => (
                                    <Field>
                                        <Label>{t('teacherLabel')}</Label>
                                        <Select
                                            value={selectedTeacher?.id ?? ""}
                                            onValueChange={(val) => {
                                                const teacher = teachers.find(candidate => candidate.id === val) ?? null
                                                setSelectedTeacher(teacher)
                                                field.handleChange(val)
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('selectTeacher')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectLabel>{t('teachersLabel')}</SelectLabel>
                                                    {teachers.map((teacher) => (
                                                        <SelectItem key={teacher.id} value={teacher.id}>{[teacher.firstName, teacher.lastName].filter(Boolean).join(' ')}</SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </Field>
                                )}
                            </form.Field>

                            <form.Field name="studentIds">
                                {(field) => (
                                    <Field>
                                        <Label>{t('studentsLabel')}</Label>
                                        <div className="max-h-52 overflow-y-auto rounded-md border p-3 space-y-2">
                                            {students.map((student) => {
                                                const checked = field.state.value.includes(student.id)
                                                return (
                                                    <label key={student.id} className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={checked}
                                                            onChange={(e) => {
                                                                field.handleChange(
                                                                    e.target.checked
                                                                        ? [...field.state.value, student.id]
                                                                        : field.state.value.filter(id => id !== student.id)
                                                                )
                                                            }}
                                                        />
                                                        <span className="text-sm">{[student.firstName, student.lastName].filter(Boolean).join(' ')}</span>
                                                    </label>
                                                )
                                            })}
                                        </div>
                                    </Field>
                                )}
                            </form.Field>
                        </FieldGroup>
                    </form>
                </div>
                <DrawerFooter>
                    <Button type="submit" form="create-group-form">{t('submit')}</Button>
                    <DrawerClose asChild>
                        <Button variant="outline">{t('cancel')}</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}
