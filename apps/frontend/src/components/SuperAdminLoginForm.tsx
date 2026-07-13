'use client'

import { useMemo, useState } from "react"
import { Eye, EyeOff } from "lucide-react"
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
import { useTranslations } from "next-intl"
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import platformApi from "@/lib/platformApi"
import { usePlatformAuthStore } from "@/lib/stores/platformAuthStore"

export function SuperAdminLoginForm() {
    const setPlatformToken = usePlatformAuthStore((state) => state.setPlatformToken)
    const t = useTranslations("SuperAdminLoginForm")
    const [showPassword, setShowPassword] = useState(false)

    const loginSchema = useMemo(() => z.object({
        phone: z.string().min(1, t("required")),
        password: z.string().min(1, t("required")),
    }), [t])

    const form = useForm({
        defaultValues: { phone: "", password: "" },
        validators: { onSubmit: loginSchema },
        onSubmit: async ({ value }) => {
            try {
                const response = await platformApi.post('/platform-admin/login', value)
                setPlatformToken(response.data.accessToken)
                toast.success(t("success"))
            } catch (error: any) {
                toast.error(error.response?.data?.message ?? t("error"))
            }
        },
    })

    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle className="text-2xl">{t("title")}</CardTitle>
                <CardDescription>{t("description")}</CardDescription>
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
                                        <FieldLabel htmlFor={field.name}>{t("phoneLabel")}</FieldLabel>
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
                                        <FieldLabel htmlFor={field.name}>{t("passwordLabel")}</FieldLabel>
                                        <div className="relative">
                                            <Input
                                                id={field.name}
                                                type={showPassword ? "text" : "password"}
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                autoComplete="current-password"
                                                className="pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword((prev) => !prev)}
                                                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                                                tabIndex={-1}
                                            >
                                                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                            </button>
                                        </div>
                                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                    </Field>
                                )
                            }}
                        </form.Field>
                    </FieldGroup>

                    <Button type="submit" className="w-full">
                        {t("submit")}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
