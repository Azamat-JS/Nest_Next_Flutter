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
    const [globalScore, setGlobalScore] = useState<number>(0);
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
            students: [] as { studentId: string, score: number }[],
        },
        validators: {
            onSubmit: getSchema()
        },
        onSubmit: async ({ value }) => {
            try {
                await axios.post(`${API}/student-score/bulk`, { groupId, scoreType: type, students: value.students }, { headers: { Authorization: `Bearer ${token}` } });
                form.reset()
                setOpenCreate(false)
                setGlobalScore(0)
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
                                name="students"
                                children={(field) => {
                                    const allSelected = students.length > 0 &&
                                        students.every(s =>
                                            form.state.values.students.some(st => st.studentId === s.id)
                                        );
                                    const isInvalid =
                                        field.state.meta.isTouched && !field.state.meta.isValid
                                    return (
                                        type === 'HOMEWORK' ? <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name} className='font-bold flex justify-end'>Score</FieldLabel>
                                            {students.map((s) => (
                                                <div key={s.id} className="flex items-center gap-2">
                                                    <span className='w-32'>{s.username}</span>
                                                    <Input
                                                        type="number"
                                                        value={
                                                            form.state.values.students.find(st => st.studentId === s.id)?.score ?? ''
                                                        }
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
                                        </Field> : <Field>

                                            <FieldLabel htmlFor={field.name} className='font-bold flex justify-end'>Select All</FieldLabel>
                                            <Input
                                                type="number"
                                                placeholder="Enter Attendance Score"
                                                value={globalScore}
                                                onChange={(e) => {
                                                    const value = Number(e.target.value);
                                                    setGlobalScore(value);
                                                    form.setFieldValue("students", (prev) =>
                                                        prev.map((s) => ({ ...s, score: value }))
                                                    )
                                                }}
                                            />
                                            <div className="flex items-center gap-2 mt-2">
                                                <input
                                                    type="checkbox"
                                                    checked={allSelected}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            form.setFieldValue("students", students.map((s) => ({
                                                                studentId: s.id,
                                                                score: globalScore,
                                                            })))
                                                        } else {
                                                            form.setFieldValue("students", []);
                                                        }
                                                    }}
                                                />
                                                <span className='text-sm'>Apply to all students</span>
                                            </div>

                                            {students.map((s) => {
                                                const checked = form.state.values.students.some((st) => st.studentId === s.id);
                                                return (
                                                    <div key={s.id} className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={checked}
                                                            onChange={(e) => {

                                                                form.setFieldValue("students", (prev) => {
                                                                    if (e.target.checked) {
                                                                        return [...prev, { studentId: s.id, score: globalScore }];
                                                                    } else {
                                                                        return prev.filter((item) => item.studentId !== s.id);
                                                                    }
                                                                })

                                                            }}
                                                        />
                                                        <span className="text-sm w-32">{s.username}</span>
                                                    </div>
                                                )
                                            })}
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