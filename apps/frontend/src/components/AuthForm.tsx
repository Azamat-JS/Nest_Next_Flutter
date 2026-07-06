'use client'

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardAction,
    CardDescription,
    CardFooter,
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
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./ui/select"

type UserRole = "STUDENT" | "TEACHER" | "ADMIN" | "PARENT"
const roles: UserRole[] = ["STUDENT", "TEACHER", "ADMIN", "PARENT"]

export function CardDemo({ id, isLogin, toggle }: { id?: string; isLogin?: boolean; toggle?: () => void }) {
    const setToken = useAuthStore((state) => state.setToken)
    const router = useRouter()

    const phoneSchema = z.string().regex(/^\d{9}$/, "Enter a valid 9-digit phone number")

    const loginSchema = z.object({
        phone: phoneSchema,
        password: z.string().min(6),
        role: z.string(),
    })

    const registerSchema = z.object({
        firstName: z.string().min(2),
        lastName: z.string().optional(),
        phone: phoneSchema,
        password: z.string().min(6),
        role: z.string().min(1, "Select a role"),
    })

    const form = useForm({
        defaultValues: { firstName: "", lastName: "", phone: "", password: "", role: "" },
        validators: { onSubmit: isLogin ? loginSchema : registerSchema },
        onSubmit: async ({ value }) => {
            try {
                const endpoint = isLogin ? '/users/login' : '/users/register'
                const phone = `+998${value.phone}`
                const payload = isLogin
                    ? { phone, password: value.password }
                    : { ...value, phone }

                const response = await api.post(endpoint, payload)

                localStorage.setItem('token', response.data.accessToken)
                setToken(response.data.accessToken)
                toast.success(isLogin ? 'Logged in successfully' : 'Account created successfully')
                router.push('/home')
            } catch (error: any) {
                toast.error(error.response?.data?.message ?? 'Something went wrong')
            }
        },
    })

    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle className="text-2xl">{isLogin ? 'Welcome back' : 'Create account'}</CardTitle>
                <CardDescription>
                    {isLogin
                        ? 'Enter your credentials to sign in'
                        : 'Fill in the details below to get started'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    id={id}
                    onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}
                    className="flex flex-col gap-5"
                >
                    <FieldGroup>
                        {!isLogin && (
                            <form.Field name="firstName">
                                {(field) => {
                                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>First name</FieldLabel>
                                            <Input
                                                id={field.name}
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                placeholder="Your first name"
                                                autoComplete="given-name"
                                            />
                                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                        </Field>
                                    )
                                }}
                            </form.Field>
                        )}

                        {!isLogin && (
                            <form.Field name="lastName">
                                {(field) => {
                                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>Last name (optional)</FieldLabel>
                                            <Input
                                                id={field.name}
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                placeholder="Your last name"
                                                autoComplete="family-name"
                                            />
                                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                        </Field>
                                    )
                                }}
                            </form.Field>
                        )}

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
                                            autoComplete={isLogin ? "current-password" : "new-password"}
                                        />
                                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                    </Field>
                                )
                            }}
                        </form.Field>

                        {!isLogin && (
                            <form.Field name="role">
                                {(field) => {
                                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>Role</FieldLabel>
                                            <Select value={field.state.value} onValueChange={(val) => field.handleChange(val as UserRole)}>
                                                <SelectTrigger id={field.name}>
                                                    <SelectValue placeholder="Select your role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        <SelectLabel>Roles</SelectLabel>
                                                        {roles.map((role) => (
                                                            <SelectItem key={role} value={role} className="capitalize">
                                                                {role.toLowerCase()}
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
                        )}
                    </FieldGroup>

                    <Button type="submit" className="w-full">
                        {isLogin ? 'Sign In' : 'Create Account'}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex justify-between">
                <CardAction>
                    <Button variant="link" onClick={toggle} className="px-0">
                        {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                    </Button>
                </CardAction>
            </CardFooter>
        </Card>
    )
}
