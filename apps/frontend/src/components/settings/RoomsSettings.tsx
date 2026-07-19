'use client'

import { useState } from "react"
import { toast } from "sonner"
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
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil, Plus, Trash } from "lucide-react"
import { RoomType } from "@/lib/types/dashboard"

const RoomsSettings = () => {
    const t = useTranslations('RoomsSettings')
    const tCommon = useTranslations('Common')
    const queryClient = useQueryClient()

    const [openForm, setOpenForm] = useState(false)
    const [editTarget, setEditTarget] = useState<RoomType | null>(null)
    const [name, setName] = useState('')
    const [deleteTarget, setDeleteTarget] = useState<RoomType | null>(null)

    const { data: rooms = [] } = useSuspenseQuery<RoomType[]>({
        queryKey: ['rooms'],
        queryFn: async () => (await api.get('/room/all')).data,
        staleTime: 1000 * 60,
    })

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ['rooms'] })
        queryClient.invalidateQueries({ queryKey: ['dashboard-schedule'] })
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    }

    const saveMutation = useMutation({
        mutationFn: async () => {
            if (editTarget) {
                return api.put(`/room/${editTarget.id}`, { name })
            }
            return api.post('/room', { name })
        },
        onSuccess: () => {
            toast.success(editTarget ? t('updated') : t('created'))
            setOpenForm(false)
            setEditTarget(null)
            setName('')
            invalidate()
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message ?? tCommon('errorGeneric'))
        },
    })

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => api.delete(`/room/${id}`),
        onSuccess: () => {
            toast.success(t('deleted'))
            setDeleteTarget(null)
            invalidate()
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
                <Button onClick={() => { setEditTarget(null); setName(''); setOpenForm(true) }} className="gap-1">
                    <Plus className="h-4 w-4" /> {t('addRoom')}
                </Button>
            </div>

            {rooms.length === 0 ? (
                <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                    {t('empty')}
                </p>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="font-semibold">{tCommon('name')}</TableHead>
                            <TableHead className="text-center font-semibold">{t('lessonsHeader')}</TableHead>
                            <TableHead className="w-24 text-center font-semibold">{tCommon('actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rooms.map((room) => (
                            <TableRow key={room.id}>
                                <TableCell className="font-medium">{room.name}</TableCell>
                                <TableCell className="text-center">
                                    <Badge variant="secondary">{room._count?.lessonSchedules ?? 0}</Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => { setEditTarget(room); setName(room.name); setOpenForm(true) }}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                            onClick={() => setDeleteTarget(room)}
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

            {/* Create / rename dialog */}
            <Dialog open={openForm} onOpenChange={(open) => { setOpenForm(open); if (!open) setEditTarget(null) }}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{editTarget ? t('renameTitle') : t('createTitle')}</DialogTitle>
                    </DialogHeader>
                    <form
                        onSubmit={(e) => { e.preventDefault(); if (name.trim()) saveMutation.mutate() }}
                        className="space-y-4"
                    >
                        <Field>
                            <FieldLabel htmlFor="room-name">{tCommon('name')}</FieldLabel>
                            <Input
                                id="room-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={t('namePlaceholder')}
                                autoComplete="off"
                            />
                        </Field>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline" type="button">{tCommon('cancel')}</Button>
                            </DialogClose>
                            <Button type="submit" disabled={!name.trim() || saveMutation.isPending}>
                                {saveMutation.isPending ? t('saving') : t('save')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

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

export default RoomsSettings
