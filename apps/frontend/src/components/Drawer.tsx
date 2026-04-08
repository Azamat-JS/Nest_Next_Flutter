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
import axios from "axios"
import { useAuthStore } from "@/lib/stores/authStore"
import { useState, useEffect } from 'react'
import { Label } from "./ui/label"
import { TokenPayload } from "@/lib/types/token_payload"

export function DrawerScrollableContent({ openCreate, setOpenCreate, teachers }: { openCreate: boolean, setOpenCreate: any, teachers: TokenPayload[] }) {
    const [selectedTeacher, setSelectedTeacher] = useState<TokenPayload | null>(null);
    const API = process.env.NEXT_PUBLIC_API_URL;
    const token = useAuthStore((state) => state.token);
    const getSchema = () =>
        z.object({
            name: z.string().min(2),
            teacherId: z.string()
        })
    const form = useForm({
        defaultValues: {
            name: "",
            teacherId: "",
        },
        validators: {
            onSubmit: getSchema()
        },
        onSubmit: async ({ value }) => {
            try {
                await axios.post(`${API}/group`, value, { headers: { Authorization: `Bearer ${token}` } })
                setOpenCreate(false)
            } catch (error: any) {
                toast.error(
                    error.response?.data?.message ?? 'Something went wrong'
                );
            }
        },
    })

    return (
        <Drawer direction="right" open={openCreate} onOpenChange={setOpenCreate}>
            <DrawerTrigger asChild>
                <Button variant="default" className="text-md">Add Group</Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle className="text-xl font-bold">Create a new Group</DrawerTitle>
                </DrawerHeader>
                <div className="no-scrollbar overflow-y-auto px-4">
                    <form
                        id="create-group-form"
                        onSubmit={(e) => {
                            e.preventDefault()
                            form.handleSubmit()
                        }}
                        className="flex flex-col gap-6"
                    >
                        <FieldGroup>


                            <form.Field
                                name="name"
                                children={(field) => {
                                    const isInvalid =
                                        field.state.meta.isTouched && !field.state.meta.isValid
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                                            <Input
                                                id={field.name}
                                                name={field.name}
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                aria-invalid={isInvalid}
                                                placeholder="Enter a group name"
                                                autoComplete="off"
                                            />
                                            {isInvalid && (
                                                <FieldError errors={field.state.meta.errors} />
                                            )}
                                        </Field>
                                    )
                                }}
                            />
                            <form.Field
                                name="teacherId"
                                children={(field) => (
                                    <Field>
                                        <Label>Teacher Name</Label>
                                        <Select
                                            value={selectedTeacher?.id || ""}
                                            onValueChange={(val: string) => {
                                                const teacher = teachers.find(t => t.id === val) || null;
                                                setSelectedTeacher(teacher);
                                                field.handleChange(val);
                                            }}
                                        >
                                            <SelectTrigger className="w-full max-w-48">
                                                <SelectValue placeholder="Select a teacher" />
                                            </SelectTrigger>
                                            <SelectContent position="popper">
                                                <SelectGroup>
                                                    <SelectLabel>Select a teacher</SelectLabel>
                                                    {teachers.map((t) => (
                                                        <SelectItem key={t.id} value={t.id}>
                                                            {t.username}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </Field>
                                )}
                            />
                        </FieldGroup>
                    </form>
                </div>
                <DrawerFooter>
                    <Button type="submit" className="w-full" form="create-group-form">Submit</Button>
                    <DrawerClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}
