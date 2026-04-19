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
            students: z.array(
                z.object({
                    studentId: z.string(),
                    score: z.number().min(1),
                })
            ).min(1, "At least one student must be selected"),
        })

    const form = useForm({
        defaultValues: {
            students: [{
                studentId: '',
                score: 0,
            }],
        },
        validators: {
            onSubmit: getSchema()
        },
        onSubmit: async ({ value }) => {
            try {
                axios.post(`${API}/student-score/bulk`, { groupId, scoreType: type, students: value.students }, { headers: { Authorization: `Bearer ${token}` } });
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
                                name="students[0].score"
                                children={(field) => {
                                    const isInvalid =
                                        field.state.meta.isTouched && !field.state.meta.isValid
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>Score</FieldLabel>
                                            {students.map((s) => (
                                                <div key={s.id} className="flex items-center gap-2">
                                                    <span className='w-32'>{s.username}</span>

                                                    <Input
                                                        type="number"
                                                        placeholder="Enter score"
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            form.setFieldValue("students", (prev) => {
                                                                if (value === '') {
                                                                    return prev.filter((item) => item.studentId !== s.id);
                                                                }
                                                                const score = Number(e.target.value);
                                                                const existingIndex = prev.findIndex((item) => item.studentId === s.id);

                                                                if (existingIndex >= 0) {
                                                                    return prev.map((student) => student.studentId === s.id ? { ...student, score } : student);
                                                                }
                                                                return [...prev, { studentId: s.id, score }];
                                                            })
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                            {isInvalid && (
                                                <FieldError errors={field.state.meta.errors} />
                                            )}
                                        </Field>
                                    )
                                }}
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