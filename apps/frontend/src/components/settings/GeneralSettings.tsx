'use client'

import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Check, GraduationCap, Pencil, Plus, Trash, Upload, X } from "lucide-react"
import { BranchType, OrganizationSettings } from "@/lib/types/dashboard"

// Logos are stored inline as data URLs (no file storage backend), so uploads
// are downscaled client-side to keep them small.
const LOGO_MAX_SIZE_PX = 128
const LOGO_MAX_DATA_URL_LENGTH = 90_000

const GeneralSettings = () => {
    const t = useTranslations('GeneralSettings')
    const tCommon = useTranslations('Common')
    const queryClient = useQueryClient()

    const { data: org } = useSuspenseQuery<OrganizationSettings>({
        queryKey: ['organization'],
        queryFn: async () => (await api.get('/organization')).data,
        staleTime: 1000 * 60,
    })

    const { data: branches = [] } = useSuspenseQuery<BranchType[]>({
        queryKey: ['branches'],
        queryFn: async () => (await api.get('/organization/branches')).data,
        staleTime: 1000 * 60,
    })

    const [name, setName] = useState(org.name)
    const [startTime, setStartTime] = useState(org.workStartTime)
    const [endTime, setEndTime] = useState(org.workEndTime)
    const [editingHours, setEditingHours] = useState<'start' | 'end' | null>(null)
    useEffect(() => {
        setName(org.name)
        setStartTime(org.workStartTime)
        setEndTime(org.workEndTime)
    }, [org.name, org.workStartTime, org.workEndTime])

    const fileInputRef = useRef<HTMLInputElement>(null)

    const [branchEdit, setBranchEdit] = useState<{ id: string; name: string } | null>(null)
    const [newBranchName, setNewBranchName] = useState<string | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<BranchType | null>(null)

    const updateOrg = useMutation({
        mutationFn: async (payload: Partial<OrganizationSettings>) =>
            (await api.patch('/organization', payload)).data,
        onSuccess: (data: OrganizationSettings) => {
            queryClient.setQueryData(['organization'], data)
            setEditingHours(null)
            toast.success(t('saved'))
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message ?? tCommon('errorGeneric'))
        },
    })

    const handleLogoFile = (file: File) => {
        const img = new Image()
        const url = URL.createObjectURL(file)
        img.onload = () => {
            URL.revokeObjectURL(url)
            const scale = Math.min(1, LOGO_MAX_SIZE_PX / Math.max(img.width, img.height))
            const canvas = document.createElement('canvas')
            canvas.width = Math.max(1, Math.round(img.width * scale))
            canvas.height = Math.max(1, Math.round(img.height * scale))
            canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
            const dataUrl = canvas.toDataURL('image/png')
            if (dataUrl.length > LOGO_MAX_DATA_URL_LENGTH) {
                toast.error(t('logoTooLarge'))
                return
            }
            updateOrg.mutate({ logoUrl: dataUrl })
        }
        img.onerror = () => {
            URL.revokeObjectURL(url)
            toast.error(tCommon('errorGeneric'))
        }
        img.src = url
    }

    const saveHours = (which: 'start' | 'end') => {
        const nextStart = which === 'start' ? startTime : org.workStartTime
        const nextEnd = which === 'end' ? endTime : org.workEndTime
        // "HH:mm" strings compare correctly lexicographically.
        if (!nextStart || !nextEnd || nextStart >= nextEnd) {
            toast.error(t('hoursInvalid'))
            return
        }
        updateOrg.mutate(which === 'start' ? { workStartTime: nextStart } : { workEndTime: nextEnd })
    }

    const cancelHours = () => {
        setStartTime(org.workStartTime)
        setEndTime(org.workEndTime)
        setEditingHours(null)
    }

    const saveBranch = useMutation({
        mutationFn: async ({ id, name }: { id?: string; name: string }) =>
            id
                ? api.put(`/organization/branches/${id}`, { name })
                : api.post('/organization/branches', { name }),
        onSuccess: (_data, vars) => {
            toast.success(vars.id ? t('branchUpdated') : t('branchCreated'))
            setBranchEdit(null)
            setNewBranchName(null)
            queryClient.invalidateQueries({ queryKey: ['branches'] })
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message ?? tCommon('errorGeneric'))
        },
    })

    const deleteBranch = useMutation({
        mutationFn: async (id: string) => api.delete(`/organization/branches/${id}`),
        onSuccess: () => {
            toast.success(t('branchDeleted'))
            setDeleteTarget(null)
            queryClient.invalidateQueries({ queryKey: ['branches'] })
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message ?? tCommon('errorGeneric'))
        },
    })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">{t('title')}</h1>
                <p className="text-muted-foreground">{t('description')}</p>
            </div>

            <div className="grid items-start gap-6 lg:grid-cols-2">
                {/* Organization name + logo */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('orgTitle')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-3">
                            <span className="w-44 shrink-0 text-sm font-medium">{t('nameLabel')}</span>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={t('namePlaceholder')}
                                className="max-w-xs"
                                autoComplete="off"
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                disabled={!name.trim() || name.trim() === org.name || updateOrg.isPending}
                                onClick={() => updateOrg.mutate({ name: name.trim() })}
                            >
                                <Check className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="w-44 shrink-0 text-sm font-medium">{t('logoLabel')}</span>
                            {org.logoUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={org.logoUrl}
                                    alt={org.name}
                                    className="h-10 w-10 rounded object-contain"
                                />
                            ) : (
                                <GraduationCap className="h-8 w-8 text-muted-foreground" />
                            )}
                            <Button
                                className="gap-1"
                                disabled={updateOrg.isPending}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="h-4 w-4" /> {t('uploadLogo')}
                            </Button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) handleLogoFile(file)
                                    e.target.value = ''
                                }}
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    {/* Branches */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('branchesTitle')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {branches.length === 0 && newBranchName === null && (
                                <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                                    {t('branchesEmpty')}
                                </p>
                            )}

                            {branches.map((branch) =>
                                branchEdit?.id === branch.id ? (
                                    <div key={branch.id} className="flex items-center gap-2">
                                        <Input
                                            value={branchEdit.name}
                                            onChange={(e) => setBranchEdit({ id: branch.id, name: e.target.value })}
                                            placeholder={t('branchNamePlaceholder')}
                                            autoFocus
                                            autoComplete="off"
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            disabled={!branchEdit.name.trim() || saveBranch.isPending}
                                            onClick={() => saveBranch.mutate({ id: branch.id, name: branchEdit.name.trim() })}
                                        >
                                            <Check className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => setBranchEdit(null)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div key={branch.id} className="flex items-center gap-2">
                                        <Input value={branch.name} readOnly tabIndex={-1} />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => setBranchEdit({ id: branch.id, name: branch.name })}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                            onClick={() => setDeleteTarget(branch)}
                                        >
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )
                            )}

                            {newBranchName !== null ? (
                                <div className="flex items-center gap-2">
                                    <Input
                                        value={newBranchName}
                                        onChange={(e) => setNewBranchName(e.target.value)}
                                        placeholder={t('branchNamePlaceholder')}
                                        autoFocus
                                        autoComplete="off"
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        disabled={!newBranchName.trim() || saveBranch.isPending}
                                        onClick={() => saveBranch.mutate({ name: newBranchName.trim() })}
                                    >
                                        <Check className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => setNewBranchName(null)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    variant="outline"
                                    className="w-full gap-1"
                                    onClick={() => setNewBranchName('')}
                                >
                                    <Plus className="h-4 w-4" /> {t('addBranch')}
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    {/* Working hours */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('hoursTitle')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {([
                                { key: 'start' as const, label: t('startLabel'), value: startTime, set: setStartTime },
                                { key: 'end' as const, label: t('endLabel'), value: endTime, set: setEndTime },
                            ]).map(({ key, label, value, set }) => (
                                <div key={key} className="flex items-center gap-3">
                                    <span className="w-44 shrink-0 text-sm font-medium">{label}</span>
                                    <Input
                                        type="time"
                                        value={value}
                                        disabled={editingHours !== key}
                                        onChange={(e) => set(e.target.value)}
                                        className="max-w-36"
                                    />
                                    {editingHours === key ? (
                                        <>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                disabled={updateOrg.isPending}
                                                onClick={() => saveHours(key)}
                                            >
                                                <Check className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={cancelHours}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => {
                                                cancelHours()
                                                setEditingHours(key)
                                            }}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Delete branch confirmation */}
            <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{t('deleteBranchTitle')}</DialogTitle>
                        <DialogDescription>
                            {t('deleteBranchDescription', { name: deleteTarget?.name ?? '' })}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">{tCommon('cancel')}</Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            onClick={() => deleteTarget && deleteBranch.mutate(deleteTarget.id)}
                            disabled={deleteBranch.isPending}
                        >
                            {deleteBranch.isPending ? t('deleting') : t('delete')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default GeneralSettings
