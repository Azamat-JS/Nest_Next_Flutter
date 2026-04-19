"use client";
import { useAuthStore } from '@/lib/stores/authStore';
import axios from 'axios';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "./ui/label"
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
import { TokenPayload } from '@/lib/types/token_payload';
import { Toggle } from "@/components/ui/toggle"
import { ScoreType } from '@/lib/types/score_type';



const AddScoreDrawer = ({ openCreate, setOpenCreate, students, groupId }: { openCreate: boolean, setOpenCreate: any, students: TokenPayload[], groupId: string }) => {
    const [type, setType] = useState<ScoreType>('HOMEWORK');
    const API = process.env.NEXT_PUBLIC_API_URL;
    const token = useAuthStore((state) => state.token);
    const getSchema = () =>
        z.object({
            score: z.number(),
            studentIds: z.array(z.string()).min(1, "At least one student must be selected"),
        })
    const form = useForm({
        defaultValues: {
            score: 0,
            studentIds: [] as string[],
        },
        validators: {
            onSubmit: getSchema()
        },
        onSubmit: async ({ value }) => {
            try {
                const requests = value.studentIds.map((studentId) => axios.post(`${API}/student-score/add`, value, { headers: { Authorization: `Bearer ${token}` } }))
                await Promise.all(requests)
                form.reset()
                setOpenCreate(false)
                toast.success('Scores added successfully!')
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
                <Button variant="default" className="text-md">Add Score</Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle className="text-xl font-bold">Add Scores to Students</DrawerTitle>
                </DrawerHeader>
                <div className="no-scrollbar overflow-y-auto px-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <Toggle variant="outline" aria-label="Homework" pressed={type === 'HOMEWORK'} onPressedChange={(pressed) => pressed && setType('HOMEWORK')}>
                            Homework
                        </Toggle>
                        <Toggle variant="outline" aria-label="Attendance" pressed={type === 'ATTENDANCE'} onPressedChange={(pressed) => pressed && setType('ATTENDANCE')}>
                            Attendance
                        </Toggle>
                    </div>
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
                                name="score"
                                children={(field) => {
                                    const isInvalid =
                                        field.state.meta.isTouched && !field.state.meta.isValid
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                                            <Input
                                                id={field.name}
                                                name={field.name}
                                                type="number"
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={(e) => field.handleChange(Number(e.target.value))}
                                                aria-invalid={isInvalid}
                                                placeholder="Enter a score"
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
                                name="studentIds"
                                children={(field) => (
                                    <Field>
                                        <Label>Students</Label>

                                        <div className="max-h-48 overflow-y-auto rounded-md border p-3 space-y-2">
                                            {students.map((student) => {
                                                const checked = field.state.value.includes(student.id);

                                                return (
                                                    <label
                                                        key={student.id}
                                                        className="flex items-center gap-2 cursor-pointer"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={checked}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    field.handleChange([...field.state.value, student.id]);
                                                                } else {
                                                                    field.handleChange(
                                                                        field.state.value.filter((id) => id !== student.id)
                                                                    );
                                                                }
                                                            }}
                                                        />

                                                        <span>{student.username}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
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

export default AddScoreDrawer