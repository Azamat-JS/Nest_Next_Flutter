'use client'

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import * as z from "zod"
import { toast } from "sonner"
import { useForm } from "@tanstack/react-form"
import { useMemo } from "react"
import { useTranslations } from "next-intl"
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import api from "@/lib/api"
import { useAuthStore } from "@/lib/stores/authStore"

const ChangePasswordScreen = () => {
    const t = useTranslations('ChangePasswordScreen')
    const tCommon = useTranslations('Common')
    const setToken = useAuthStore((state) => state.setToken)
    const refreshToken = useAuthStore((state) => state.refreshToken)
    const logout = useAuthStore((state) => state.logout)

    const changePasswordSchema = useMemo(() => z.object({
        currentPassword: z.string().min(1, t('currentPasswordRequired')),
        newPassword: z.string().min(6, t('newPasswordMinLength')),
    }), [t])

    const form = useForm({
        defaultValues: { currentPassword: "", newPassword: "" },
        validators: { onSubmit: changePasswordSchema },
        onSubmit: async ({ value }) => {
            try {
                await api.put('/users/me/password', value)

                if (refreshToken) {
                    const res = await api.post('/users/refresh-token', { refreshToken })
                    setToken(res.data.accessToken)
                } else {
                    logout()
                }
                toast.success(t('success'))
            } catch (error: any) {
                toast.error(error.response?.data?.message ?? tCommon('errorGeneric'))
            }
        },
    })

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">{t('title')}</CardTitle>
                    <CardDescription>
                        {t('description')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}
                        className="flex flex-col gap-5"
                    >
                        <FieldGroup>
                            <form.Field name="currentPassword">
                                {(field) => {
                                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>{t('currentPasswordLabel')}</FieldLabel>
                                            <Input
                                                id={field.name}
                                                type="password"
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                autoComplete="current-password"
                                            />
                                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                        </Field>
                                    )
                                }}
                            </form.Field>

                            <form.Field name="newPassword">
                                {(field) => {
                                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>{t('newPasswordLabel')}</FieldLabel>
                                            <Input
                                                id={field.name}
                                                type="password"
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                placeholder={t('newPasswordPlaceholder')}
                                                autoComplete="new-password"
                                            />
                                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                        </Field>
                                    )
                                }}
                            </form.Field>
                        </FieldGroup>

                        <Button type="submit" className="w-full">
                            {t('submit')}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default ChangePasswordScreen
