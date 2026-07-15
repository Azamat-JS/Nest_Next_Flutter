"use client"

import { useMemo, useState } from "react"
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
import { useQuery } from "@tanstack/react-query"
import { useFormatter, useTranslations } from "next-intl"
import { GroupType } from "@/lib/types/groups"
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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import api from "@/lib/api"
import { CalendarIcon, NotebookPen } from "lucide-react"
import { format } from "date-fns"

const hourOptions = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"))

const AddHomeworkDrawer = ({ openCreate, setOpenCreate, groupId, onHomeworkAdded }: {
    openCreate: boolean
    setOpenCreate: (open: boolean) => void
    groupId: string
    onHomeworkAdded: () => void
}) => {
    const t = useTranslations('AddHomeworkDrawer')
    const formatter = useFormatter()
    const [dueDateOpen, setDueDateOpen] = useState(false)

    const { data: group } = useQuery<GroupType>({
        queryKey: ["group", groupId],
        queryFn: async () => (await api.get(`/group/${groupId}`)).data,
        staleTime: 1000 * 60 * 5,
    })

    // Selectable lesson days: the group's scheduled weekdays mapped onto the
    // previous and current calendar weeks (ISO weeks, Monday first). Groups
    // without a configured schedule fall back to every day of both weeks.
    const lessonDayOptions = useMemo(() => {
        const scheduledDays = (group?.lessonSchedules ?? []).map(s => s.dayOfWeek)
        const days = scheduledDays.length > 0 ? scheduledDays : [1, 2, 3, 4, 5, 6, 7]
        const now = new Date()
        const isoToday = now.getDay() === 0 ? 7 : now.getDay()
        const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (isoToday - 1))
        return days
            .flatMap((dayOfWeek) => [
                new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + dayOfWeek - 1 - 7),
                new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + dayOfWeek - 1),
            ])
            .sort((a, b) => a.getTime() - b.getTime())
            .map((date) => format(date, "yyyy-MM-dd"))
    }, [group])

    const schema = useMemo(() => z.object({
        topic: z.string().min(1, t('topicRequired')),
        dueDate: z.string().min(1, t('dueDateRequired')),
        dueHour: z.string().min(1, t('hourRequired')),
        lessonDate: z.string().min(1, t('lessonDayRequired')),
    }), [t])

    const form = useForm({
        defaultValues: { topic: "", dueDate: "", dueHour: "09", lessonDate: "" },
        validators: { onSubmit: schema },
        onSubmit: async ({ value }) => {
            try {
                const dueDate = new Date(`${value.dueDate}T${value.dueHour}:00:00`)
                await api.post('/homework', {
                    groupId,
                    topic: value.topic,
                    dueDate: dueDate.toISOString(),
                    ...(value.lessonDate && { lessonDate: value.lessonDate }),
                })
                form.reset()
                onHomeworkAdded()
                setOpenCreate(false)
                toast.success(t('success'))
            } catch (error: any) {
                toast.error(error.response?.data?.message ?? t('error'))
            }
        },
    })

    return (
        <Drawer direction="right" open={openCreate} onOpenChange={setOpenCreate}>
            <DrawerTrigger asChild>
                <Button className="gap-1">
                    <NotebookPen className="h-4 w-4" /> {t('trigger')}
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle className="text-xl font-bold">{t('title')}</DrawerTitle>
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
                                            <FieldLabel htmlFor={field.name}>{t('topicLabel')}</FieldLabel>
                                            <Input
                                                id={field.name}
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                placeholder={t('topicPlaceholder')}
                                            />
                                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                        </Field>
                                    )
                                }}
                            </form.Field>

                            <form.Field name="lessonDate">
                                {(field) => {
                                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>{t('lessonDayLabel')}</FieldLabel>
                                            <Select value={field.state.value} onValueChange={(val) => field.handleChange(val)}>
                                                <SelectTrigger id={field.name} className="w-full">
                                                    <SelectValue placeholder={t('selectLessonDay')} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {lessonDayOptions.map((day) => (
                                                            <SelectItem key={day} value={day}>
                                                                {formatter.dateTime(new Date(`${day}T00:00:00`), { weekday: 'short', day: 'numeric', month: 'short' })}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
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
                                                <FieldLabel htmlFor={field.name}>{t('dueDateLabel')}</FieldLabel>
                                                <Popover open={dueDateOpen} onOpenChange={setDueDateOpen}>
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
                                                                ? format(new Date(`${field.state.value}T00:00:00`), "PPP")
                                                                : t('dueDateLabel')}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0">
                                                        <Calendar
                                                            mode="single"
                                                            selected={field.state.value ? new Date(`${field.state.value}T00:00:00`) : undefined}
                                                            onSelect={(date) => {
                                                                if (!date) return
                                                                field.handleChange(format(date, "yyyy-MM-dd"))
                                                                setDueDateOpen(false)
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

                                <form.Field name="dueHour">
                                    {(field) => (
                                        <Field className="w-28">
                                            <FieldLabel htmlFor={field.name}>{t('hourLabel')}</FieldLabel>
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
                    <Button type="submit" form="add-homework-form">{t('submit')}</Button>
                    <DrawerClose asChild>
                        <Button variant="outline">{t('cancel')}</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

export default AddHomeworkDrawer
