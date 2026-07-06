"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
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
import { TokenPayload } from '@/lib/types/token_payload'
import { Toggle } from "@/components/ui/toggle"
import { ScoreType } from '@/lib/types/score_type'
import api from "@/lib/api"
import { PlusCircle } from 'lucide-react'

const AddScoreDrawer = ({ openCreate, setOpenCreate, students, groupId, onScoreAdded }: {
    openCreate: boolean
    setOpenCreate: (open: boolean) => void
    students: TokenPayload[]
    groupId: string
    onScoreAdded: () => void
}) => {
    const [type, setType] = useState<ScoreType>('HOMEWORK')
    const [globalScore, setGlobalScore] = useState<number>(0)

    const schema = z.object({
        students: z.array(z.object({
            studentId: z.string(),
            score: z.number(),
            comment: z.string().optional(),
        })),
    })

    const form = useForm({
        defaultValues: { students: [] as z.infer<typeof schema>["students"] },
        validators: { onSubmit: schema },
        onSubmit: async ({ value }) => {
            try {
                await api.post('/student-score/bulk', { groupId, scoreType: type, students: value.students })
                form.reset()
                setGlobalScore(0)
                onScoreAdded()
                toast.success('Scores added successfully')
            } catch (error: any) {
                toast.error(error.response?.data?.message ?? 'Something went wrong')
            }
        },
    })

    return (
        <Drawer direction="right" open={openCreate} onOpenChange={setOpenCreate}>
            <DrawerTrigger asChild>
                <Button className="gap-1">
                    <PlusCircle className="h-4 w-4" /> Add Score
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle className="text-xl font-bold">Add Scores</DrawerTitle>
                </DrawerHeader>
                <div className="no-scrollbar overflow-y-auto px-4">
                    <div className="flex gap-2 mb-4">
                        <Toggle
                            variant="outline"
                            pressed={type === 'HOMEWORK'}
                            onPressedChange={(pressed) => {
                                if (pressed) { setType('HOMEWORK'); form.setFieldValue("students", []); setGlobalScore(0) }
                            }}
                        >
                            Homework
                        </Toggle>
                        <Toggle
                            variant="outline"
                            pressed={type === 'ATTENDANCE'}
                            onPressedChange={(pressed) => {
                                if (pressed) { setType('ATTENDANCE'); form.setFieldValue("students", []); setGlobalScore(0) }
                            }}
                        >
                            Attendance
                        </Toggle>
                    </div>
                    <form
                        id="add-score-form"
                        onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}
                        className="flex flex-col gap-4"
                    >
                        <FieldGroup>
                            <form.Field name="students">
                                {(field) => {
                                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                                    const allSelected = students.length > 0 &&
                                        students.every(s => form.state.values.students.some(st => st.studentId === s.id))

                                    if (type === 'HOMEWORK') {
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel className="font-semibold">Homework Scores</FieldLabel>
                                                <div className="space-y-2">
                                                    {students.map((s) => {
                                                        const entry = form.state.values.students.find(st => st.studentId === s.id)
                                                        return (
                                                            <div key={s.id} className="flex items-center gap-2">
                                                                <span className="w-32 text-sm truncate">{[s.firstName, s.lastName].filter(Boolean).join(' ')}</span>
                                                                <Input
                                                                    type="number"
                                                                    className="flex-1"
                                                                    min={0}
                                                                    value={entry?.score ?? ''}
                                                                    placeholder="Score"
                                                                    onChange={(e) => {
                                                                        const val = e.target.value
                                                                        form.setFieldValue("students", (prev) => {
                                                                            if (val === '') return prev.filter(item => item.studentId !== s.id)
                                                                            const score = Number(val)
                                                                            const idx = prev.findIndex(item => item.studentId === s.id)
                                                                            if (idx >= 0) return prev.map(st => st.studentId === s.id ? { ...st, score } : st)
                                                                            return [...prev, { studentId: s.id, score, comment: "" }]
                                                                        })
                                                                    }}
                                                                />
                                                                <Input
                                                                    type="text"
                                                                    className="flex-1"
                                                                    value={entry?.comment ?? ""}
                                                                    onChange={(e) => {
                                                                        const comment = e.target.value
                                                                        form.setFieldValue("students", (prev) =>
                                                                            prev.map(st => st.studentId === s.id ? { ...st, comment } : st)
                                                                        )
                                                                    }}
                                                                    placeholder="Comment"
                                                                />
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                            </Field>
                                        )
                                    }

                                    return (
                                        <Field>
                                            <FieldLabel className="font-semibold">Attendance Score</FieldLabel>
                                            <Input
                                                type="number"
                                                placeholder="Global attendance score"
                                                value={globalScore}
                                                min={0}
                                                onChange={(e) => {
                                                    const val = Number(e.target.value)
                                                    setGlobalScore(val)
                                                    form.setFieldValue("students", (prev) =>
                                                        prev.map(s => ({ ...s, score: val }))
                                                    )
                                                }}
                                                className="mb-3"
                                            />
                                            <div className="flex items-center gap-2 mb-2">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4"
                                                    checked={allSelected}
                                                    disabled={students.length === 0}
                                                    onChange={(e) => {
                                                        form.setFieldValue("students", e.target.checked
                                                            ? students.map(s => ({ studentId: s.id, score: globalScore }))
                                                            : []
                                                        )
                                                    }}
                                                />
                                                <span className="text-sm font-medium">Select All</span>
                                            </div>
                                            <div className="space-y-1.5">
                                                {students.map((s) => {
                                                    const checked = form.state.values.students.some(st => st.studentId === s.id)
                                                    return (
                                                        <div key={s.id} className="flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                className="h-4 w-4"
                                                                disabled={students.length === 0}
                                                                checked={checked}
                                                                onChange={(e) => {
                                                                    form.setFieldValue("students", (prev) =>
                                                                        e.target.checked
                                                                            ? [...prev, { studentId: s.id, score: globalScore }]
                                                                            : prev.filter(item => item.studentId !== s.id)
                                                                    )
                                                                }}
                                                            />
                                                            <span className="text-sm">{[s.firstName, s.lastName].filter(Boolean).join(' ')}</span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </Field>
                                    )
                                }}
                            </form.Field>
                        </FieldGroup>
                    </form>
                </div>
                <DrawerFooter>
                    <Button type="submit" form="add-score-form">Submit</Button>
                    <DrawerClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

export default AddScoreDrawer
