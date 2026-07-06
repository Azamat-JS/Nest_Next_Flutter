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

const loginSchema = z.object({
    phone: z.string().regex(/^\d{9}$/, "Enter a valid 9-digit phone number"),
    password: z.string().min(6),
})

export function LoginForm({ id }: { id?: string }) {
    const setToken = useAuthStore((state) => state.setToken)

    const form = useForm({
        defaultValues: { phone: "", password: "" },
        validators: { onSubmit: loginSchema },
        onSubmit: async ({ value }) => {
            try {
                const phone = `+998${value.phone}`
                const response = await api.post('/users/login', { phone, password: value.password })

                setToken(response.data.accessToken, response.data.refreshToken)
                toast.success('Logged in successfully')
            } catch (error: any) {
                toast.error(error.response?.data?.message ?? 'Something went wrong')
            }
        },
    })

    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle className="text-2xl">Welcome back</CardTitle>
                <CardDescription>Enter your credentials to sign in</CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    id={id}
                    onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}
                    className="flex flex-col gap-5"
                >
                    <FieldGroup>
                        <form.Field name="phone">
                            {(field) => {
                                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                                return (
                                    <Field data-invalid={isInvalid}>
                                        <FieldLabel htmlFor={field.name}>Phone number</FieldLabel>
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
                                                onChange={(e) => field.handleChange(e.target.value.replace(/\D/g, "").slice(0, 9))}
                                                placeholder="997771122"
                                                autoComplete="tel-national"
                                            />
                                        </div>
                                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                    </Field>
                                )
                            }}
                        </form.Field>

                        <form.Field name="password">
                            {(field) => {
                                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                                return (
                                    <Field data-invalid={isInvalid}>
                                        <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                                        <Input
                                            id={field.name}
                                            type="password"
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            placeholder="Min. 6 characters"
                                            autoComplete="current-password"
                                        />
                                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                    </Field>
                                )
                            }}
                        </form.Field>
                    </FieldGroup>

                    <Button type="submit" className="w-full">
                        Sign In
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
