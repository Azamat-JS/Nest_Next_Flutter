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
import platformApi from "@/lib/platformApi"
import { usePlatformAuthStore } from "@/lib/stores/platformAuthStore"

const loginSchema = z.object({
    phone: z.string().min(1, "Required"),
    password: z.string().min(1, "Required"),
})

export function SuperAdminLoginForm() {
    const setPlatformToken = usePlatformAuthStore((state) => state.setPlatformToken)

    const form = useForm({
        defaultValues: { phone: "", password: "" },
        validators: { onSubmit: loginSchema },
        onSubmit: async ({ value }) => {
            try {
                const response = await platformApi.post('/platform-admin/login', value)
                setPlatformToken(response.data.accessToken)
                toast.success('Logged in successfully')
            } catch (error: any) {
                toast.error(error.response?.data?.message ?? 'Something went wrong')
            }
        },
    })

    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle className="text-2xl">SuperAdmin</CardTitle>
                <CardDescription>Sign in to manage education centers</CardDescription>
            </CardHeader>
            <CardContent>
                <form
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
                                        <Input
                                            id={field.name}
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            placeholder="+998901234567"
                                        />
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
