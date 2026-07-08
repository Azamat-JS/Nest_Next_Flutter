"use client"

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
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import api from "@/lib/api"
import { NotebookPen } from "lucide-react"

const hourOptions = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"))

const schema = z.object({
    topic: z.string().min(1, "Topic is required"),
    dueDate: z.string().min(1, "Due date is required"),
    dueHour: z.string().min(1, "Select an hour"),
})

const AddHomeworkDrawer = ({ openCreate, setOpenCreate, groupId, onHomeworkAdded }: {
    openCreate: boolean
    setOpenCreate: (open: boolean) => void
    groupId: string
    onHomeworkAdded: () => void
}) => {
    const form = useForm({
        defaultValues: { topic: "", dueDate: "", dueHour: "09" },
        validators: { onSubmit: schema },
        onSubmit: async ({ value }) => {
            try {
                const dueDate = new Date(`${value.dueDate}T${value.dueHour}:00:00`)
                await api.post('/homework', { groupId, topic: value.topic, dueDate: dueDate.toISOString() })
                form.reset()
                onHomeworkAdded()
                setOpenCreate(false)
                toast.success('Homework added successfully')
            } catch (error: any) {
                toast.error(error.response?.data?.message ?? 'Something went wrong')
            }
        },
    })

    return (
        <Drawer direction="right" open={openCreate} onOpenChange={setOpenCreate}>
            <DrawerTrigger asChild>
                <Button className="gap-1">
                    <NotebookPen className="h-4 w-4" /> Add Homework
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle className="text-xl font-bold">Add Homework</DrawerTitle>
                </DrawerHeader>
                <div className="no-scrollbar overflow-y-auto px-4">
                    <form
                        id="add-homework-form"
                        onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}
                        className="flex flex-col gap-4"
                    >
                        <FieldGroup>
                            <form.Field name="topic">
                                {(field) => {
                                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>Topic</FieldLabel>
                                            <Input
                                                id={field.name}
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                placeholder="e.g. Chapter 5 exercises"
                                            />
                                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                        </Field>
                                    )
                                }}
                            </form.Field>

                            <div className="flex gap-2">
                                <form.Field name="dueDate">
                                    {(field) => {
                                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                                        return (
                                            <Field data-invalid={isInvalid} className="flex-1">
                                                <FieldLabel htmlFor={field.name}>Due date</FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    type="date"
                                                    value={field.state.value}
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                />
                                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                            </Field>
                                        )
                                    }}
                                </form.Field>

                                <form.Field name="dueHour">
                                    {(field) => (
                                        <Field className="w-28">
                                            <FieldLabel htmlFor={field.name}>Hour</FieldLabel>
                                            <Select value={field.state.value} onValueChange={(val) => field.handleChange(val)}>
                                                <SelectTrigger id={field.name} className="w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {hourOptions.map((h) => (
                                                            <SelectItem key={h} value={h}>{h}:00</SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </Field>
                                    )}
                                </form.Field>
                            </div>
                        </FieldGroup>
                    </form>
                </div>
                <DrawerFooter>
                    <Button type="submit" form="add-homework-form">Submit</Button>
                    <DrawerClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

export default AddHomeworkDrawer
