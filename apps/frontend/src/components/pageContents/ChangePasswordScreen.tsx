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
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import api from "@/lib/api"
import { useAuthStore } from "@/lib/stores/authStore"

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Required"),
    newPassword: z.string().min(6, "Must be at least 6 characters"),
})

const ChangePasswordScreen = () => {
    const setToken = useAuthStore((state) => state.setToken)
    const refreshToken = useAuthStore((state) => state.refreshToken)
    const logout = useAuthStore((state) => state.logout)

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
                toast.success('Password changed successfully')
            } catch (error: any) {
                toast.error(error.response?.data?.message ?? 'Something went wrong')
            }
        },
    })

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Set a new password</CardTitle>
                    <CardDescription>
                        You must change your password before continuing.
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
                                            <FieldLabel htmlFor={field.name}>Current password</FieldLabel>
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
                                            <FieldLabel htmlFor={field.name}>New password</FieldLabel>
                                            <Input
                                                id={field.name}
                                                type="password"
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                placeholder="Min. 6 characters"
                                                autoComplete="new-password"
                                            />
                                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                        </Field>
                                    )
                                }}
                            </form.Field>
                        </FieldGroup>

                        <Button type="submit" className="w-full">
                            Change password
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default ChangePasswordScreen
