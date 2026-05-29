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
                toast.success('Group created successfully')
                onGroupCreated()
            } catch (error: any) {
                toast.error(error.response?.data?.message ?? 'Something went wrong')
            }
        },
    })

    return (
        <Drawer direction="right" open={openCreate} onOpenChange={setOpenCreate}>
            <DrawerTrigger asChild>
                <Button variant="default" className="gap-1">
                    <Plus className="h-4 w-4" /> Add Group
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle className="text-xl font-bold">Create New Group</DrawerTitle>
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
                                            <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                                            <Input
                                                id={field.name}
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                placeholder="Group name"
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
                                        <Label>Teacher</Label>
                                        <Select
                                            value={selectedTeacher?.id ?? ""}
                                            onValueChange={(val) => {
                                                const teacher = teachers.find(t => t.id === val) ?? null
                                                setSelectedTeacher(teacher)
                                                field.handleChange(val)
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a teacher" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectLabel>Teachers</SelectLabel>
                                                    {teachers.map((t) => (
                                                        <SelectItem key={t.id} value={t.id}>{t.username}</SelectItem>
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
                                        <Label>Students (optional)</Label>
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
                                                        <span className="text-sm">{student.username}</span>
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
                    <Button type="submit" form="create-group-form">Create Group</Button>
                    <DrawerClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}
