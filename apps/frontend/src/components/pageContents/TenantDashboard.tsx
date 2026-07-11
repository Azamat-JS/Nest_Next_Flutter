'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useForm } from '@tanstack/react-form'
import * as z from 'zod'
import { useTranslations } from 'next-intl'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Plus, ShieldOff, ShieldCheck, Trash, LogOut } from 'lucide-react'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import platformApi from '@/lib/platformApi'
import { usePlatformAuthStore } from '@/lib/stores/platformAuthStore'
import {
    CreateTenantPayload,
    CreateTenantResponse,
    TenantType,
} from '@/lib/types/tenant'

const TenantDashboard = () => {
    const logout = usePlatformAuthStore((state) => state.logout)
    const queryClient = useQueryClient()
    const t = useTranslations('TenantDashboard')
    const tCommon = useTranslations('Common')

    const createTenantSchema = useMemo(() => z.object({
        name: z.string().min(2),
        ownerFirstName: z.string().min(2),
        ownerLastName: z.string(),
        ownerPhone: z.string().regex(/^\d{9}$/, t('ownerPhoneInvalid')),
        ownerPassword: z.string().min(6),
        botToken: z.string(),
    }), [t])

    const [openCreate, setOpenCreate] = useState(false)
    const [createdOwner, setCreatedOwner] = useState<CreateTenantResponse | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<TenantType | null>(null)
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false)
    const [openPurgeConfirm, setOpenPurgeConfirm] = useState(false)
    const [purgeConfirmText, setPurgeConfirmText] = useState('')

    const { data: tenants = [] } = useSuspenseQuery({
        queryKey: ['platform-tenants'],
        queryFn: async () => {
            const res = await platformApi.get<TenantType[]>('/platform-admin/tenants')
            return res.data
        },
        staleTime: 1000 * 60,
    })

    const createTenantMutation = useMutation({
        mutationFn: async (payload: CreateTenantPayload) => {
            const res = await platformApi.post<CreateTenantResponse>('/platform-admin/tenants', payload)
            return res.data
        },
        onSuccess: (data) => {
            setOpenCreate(false)
            createForm.reset()
            setCreatedOwner(data)
            queryClient.invalidateQueries({ queryKey: ['platform-tenants'] })
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message ?? tCommon('errorGeneric'))
        },
    })

    const createForm = useForm({
        defaultValues: { name: '', ownerFirstName: '', ownerLastName: '', ownerPhone: '', ownerPassword: '', botToken: '' },
        validators: { onSubmit: createTenantSchema },
        onSubmit: async ({ value }) => {
            createTenantMutation.mutate({
                ...value,
                ownerPhone: `+998${value.ownerPhone}`,
                botToken: value.botToken || undefined,
            })
        },
    })

    const statusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: 'ACTIVE' | 'SUSPENDED' }) => {
            return await platformApi.patch(`/platform-admin/tenants/${id}/status`, { status })
        },
        onSuccess: () => {
            toast.success(t('statusUpdated'))
            queryClient.invalidateQueries({ queryKey: ['platform-tenants'] })
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message ?? tCommon('errorGeneric'))
        },
    })

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            return await platformApi.delete(`/platform-admin/tenants/${id}`)
        },
        onSuccess: () => {
            toast.success(t('tenantDeleted'))
            setOpenDeleteConfirm(false)
            setDeleteTarget(null)
            queryClient.invalidateQueries({ queryKey: ['platform-tenants'] })
        },
        onError: (error: any) => {
            if (error.response?.status === 400) {
                setOpenDeleteConfirm(false)
                setOpenPurgeConfirm(true)
                return
            }
            toast.error(error.response?.data?.message ?? tCommon('errorGeneric'))
        },
    })

    const purgeMutation = useMutation({
        mutationFn: async (id: string) => {
            return await platformApi.delete(`/platform-admin/tenants/${id}/purge`)
        },
        onSuccess: () => {
            toast.success(t('tenantPurged'))
            setOpenPurgeConfirm(false)
            setDeleteTarget(null)
            setPurgeConfirmText('')
            queryClient.invalidateQueries({ queryKey: ['platform-tenants'] })
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message ?? tCommon('errorGeneric'))
        },
    })

    return (
        <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
                <div className="flex gap-2">
                    <Button onClick={() => setOpenCreate(true)} className="gap-1">
                        <Plus className="h-4 w-4" /> {t('addCenter')}
                    </Button>
                    <Button variant="outline" onClick={logout} className="gap-1">
                        <LogOut className="h-4 w-4" /> {t('logout')}
                    </Button>
                </div>
            </div>

            <Table>
                <TableCaption>{t('tenantCount', { count: tenants.length })}</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-center font-semibold">{tCommon('name')}</TableHead>
                        <TableHead className="text-center font-semibold">{t('statusHeader')}</TableHead>
                        <TableHead className="text-center font-semibold">{t('createdHeader')}</TableHead>
                        <TableHead className="w-16 text-center font-semibold">{tCommon('actions')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tenants.map((tenant) => (
                        <TableRow key={tenant.id}>
                            <TableCell className="text-center font-medium">{tenant.name}</TableCell>
                            <TableCell className="text-center">
                                <Badge variant={tenant.status === 'ACTIVE' ? 'default' : 'destructive'}>
                                    {tenant.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-center text-muted-foreground">
                                {new Date(tenant.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-center">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuGroup>
                                            {tenant.status === 'ACTIVE' ? (
                                                <DropdownMenuItem
                                                    onClick={() => statusMutation.mutate({ id: tenant.id, status: 'SUSPENDED' })}
                                                >
                                                    <ShieldOff className="h-4 w-4" /> {t('suspend')}
                                                </DropdownMenuItem>
                                            ) : (
                                                <DropdownMenuItem
                                                    onClick={() => statusMutation.mutate({ id: tenant.id, status: 'ACTIVE' })}
                                                >
                                                    <ShieldCheck className="h-4 w-4" /> {t('reactivate')}
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuItem
                                                onClick={() => { setDeleteTarget(tenant); setOpenDeleteConfirm(true) }}
                                                className="text-destructive focus:text-destructive"
                                            >
                                                <Trash className="h-4 w-4" /> {t('delete')}
                                            </DropdownMenuItem>
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Create tenant modal */}
            <Dialog open={openCreate} onOpenChange={setOpenCreate}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{t('createDialogTitle')}</DialogTitle>
                        <DialogDescription>{t('createDialogDescription')}</DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={(e) => { e.preventDefault(); createForm.handleSubmit() }}
                        className="flex flex-col gap-5"
                    >
                        <FieldGroup>
                            <createForm.Field name="name">
                                {(field) => {
                                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>{t('centerNameLabel')}</FieldLabel>
                                            <Input
                                                id={field.name}
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                            />
                                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                        </Field>
                                    )
                                }}
                            </createForm.Field>

                            <createForm.Field name="ownerFirstName">
                                {(field) => {
                                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>{t('ownerFirstNameLabel')}</FieldLabel>
                                            <Input
                                                id={field.name}
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                            />
                                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                        </Field>
                                    )
                                }}
                            </createForm.Field>

                            <createForm.Field name="ownerLastName">
                                {(field) => (
                                    <Field>
                                        <FieldLabel htmlFor={field.name}>{t('ownerLastNameLabel')}</FieldLabel>
                                        <Input
                                            id={field.name}
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                        />
                                    </Field>
                                )}
                            </createForm.Field>

                            <createForm.Field name="ownerPhone">
                                {(field) => {
                                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>{t('ownerPhoneLabel')}</FieldLabel>
                                            <div className="flex items-center gap-2">
                                                <span className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground">
                                                    +998
                                                </span>
                                                <Input
                                                    id={field.name}
                                                    type="tel"
                                                    inputMode="numeric"
                                                    value={field.state.value}
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) => field.handleChange(e.target.value.replace(/\D/g, '').slice(0, 9))}
                                                    placeholder="997771122"
                                                />
                                            </div>
                                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                        </Field>
                                    )
                                }}
                            </createForm.Field>

                            <createForm.Field name="ownerPassword">
                                {(field) => {
                                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>{t('ownerPasswordLabel')}</FieldLabel>
                                            <Input
                                                id={field.name}
                                                type="password"
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                placeholder={t('ownerPasswordPlaceholder')}
                                            />
                                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                        </Field>
                                    )
                                }}
                            </createForm.Field>

                            <createForm.Field name="botToken">
                                {(field) => (
                                    <Field>
                                        <FieldLabel htmlFor={field.name}>{t('botTokenLabel')}</FieldLabel>
                                        <Input
                                            id={field.name}
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                        />
                                    </Field>
                                )}
                            </createForm.Field>
                        </FieldGroup>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline" type="button">{tCommon('cancel')}</Button>
                            </DialogClose>
                            <Button type="submit" disabled={createTenantMutation.isPending}>
                                {createTenantMutation.isPending ? t('creating') : t('create')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Owner credentials hand-off modal */}
            <Dialog open={!!createdOwner} onOpenChange={(open) => !open && setCreatedOwner(null)}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{t('centerCreatedTitle')}</DialogTitle>
                        <DialogDescription>
                            {t('centerCreatedDescription')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="rounded-md border p-3 space-y-1 text-sm">
                        <p><span className="text-muted-foreground">{tCommon('phone')}:</span> {createdOwner?.owner.phone}</p>
                        <p><span className="text-muted-foreground">{t('passwordLabel')}:</span> {createForm.state.values.ownerPassword}</p>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setCreatedOwner(null)}>{t('done')}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Safe delete confirmation */}
            <Dialog open={openDeleteConfirm} onOpenChange={setOpenDeleteConfirm}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{t('deleteDialogTitle')}</DialogTitle>
                        <DialogDescription>
                            {t.rich('deleteDialogDescription', {
                                name: deleteTarget?.name ?? '',
                                b: (chunks) => <strong>{chunks}</strong>,
                            })}
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

            {/* Escalated purge confirmation */}
            <Dialog
                open={openPurgeConfirm}
                onOpenChange={(open) => { setOpenPurgeConfirm(open); if (!open) setPurgeConfirmText('') }}
            >
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{t('purgeDialogTitle')}</DialogTitle>
                        <DialogDescription>
                            {t.rich('purgeDialogDescription', {
                                name: deleteTarget?.name ?? '',
                                b: (chunks) => <strong>{chunks}</strong>,
                            })}
                        </DialogDescription>
                    </DialogHeader>
                    <Field>
                        <FieldLabel htmlFor="purge-confirm">{t('centerNameLabel')}</FieldLabel>
                        <Input
                            id="purge-confirm"
                            value={purgeConfirmText}
                            onChange={(e) => setPurgeConfirmText(e.target.value)}
                            placeholder={deleteTarget?.name}
                        />
                    </Field>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">{tCommon('cancel')}</Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            onClick={() => deleteTarget && purgeMutation.mutate(deleteTarget.id)}
                            disabled={purgeConfirmText !== deleteTarget?.name || purgeMutation.isPending}
                        >
                            {purgeMutation.isPending ? t('deleting') : t('permanentlyDelete')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default TenantDashboard
