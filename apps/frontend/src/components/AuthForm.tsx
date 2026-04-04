'use client'

import { Button } from "@/components/ui/button"
import {
    Card,
    CardAction,
    CardContent,
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
import axios from "axios"
import { useAuthStore } from "@/lib/stores/authStore"
import { useRouter } from "next/navigation"

export function CardDemo({ id, isLogin, toggle }: { id?: string, isLogin?: boolean, toggle?: () => void }) {
    const API = process.env.NEXT_PUBLIC_API_URL;
    const setToken = useAuthStore((state) => state.setToken);
    const router = useRouter();
    const getSchema = (isLogin: boolean) =>
        z.object({
            username: isLogin
                ? z.string()
                : z.string().min(3),
            email: z.string().email(),
            password: z.string().min(6),
        })
    const form = useForm({
        defaultValues: {
            username: "",
            email: "",
            password: ""
        },
        validators: {
            onSubmit: getSchema(!!isLogin)
        },
        onSubmit: async ({ value }) => {
            try {
                if (isLogin) {
                    const response = await axios.post(`${API}/users/login`, { email: value.email, password: value.password }, {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })

                    if (response.status != 201) {
                        toast.error('Login failed!')
                        return;
                    }
                    localStorage.setItem('token', response.data.token);
                    setToken(response.data.token);
                    toast.success('Login successful!')
                    router.push('/home')
                } else {
                    const response = await axios.post(`${API}/users/register`, value, {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                    if (response.status != 201) {
                        toast.error('Registration failed!')
                        return;
                    }
                    toast.success('Registration successful!')
                    router.push('/home')
                }
            } catch (error: any) {
                toast.error(
                    error.response?.data?.message ?? 'Something went wrong'
                );
            }
        },
    })

    return (
        <Card className="w-full max-w-sm mt-5">
            <CardHeader>
                <CardTitle>{isLogin ? 'Login' : 'Register'}</CardTitle>
                <CardDescription>
                    {isLogin
                        ? 'Enter your username and email below to login to your account'
                        : 'Enter your details below to create an account'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    id={id}
                    onSubmit={(e) => {
                        e.preventDefault()
                        form.handleSubmit()
                    }}
                    className="flex flex-col gap-6"
                >
                    <FieldGroup>

                        {!isLogin && (<form.Field
                            name="username"
                            children={(field) => {
                                const isInvalid =
                                    field.state.meta.isTouched && !field.state.meta.isValid
                                return (
                                    <Field data-invalid={isInvalid}>
                                        <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            aria-invalid={isInvalid}
                                            placeholder="Enter your username"
                                            autoComplete="on"
                                        />
                                        {isInvalid && (
                                            <FieldError errors={field.state.meta.errors} />
                                        )}
                                    </Field>
                                )
                            }}
                        />)}
                        <form.Field
                            name="email"
                            children={(field) => {
                                const isInvalid =
                                    field.state.meta.isTouched && !field.state.meta.isValid
                                return (
                                    <Field data-invalid={isInvalid}>
                                        <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            aria-invalid={isInvalid}
                                            placeholder="Enter your email"
                                            autoComplete="off"
                                        />
                                        {isInvalid && (
                                            <FieldError errors={field.state.meta.errors} />
                                        )}
                                    </Field>
                                )
                            }}
                        />
                        <form.Field
                            name="password"
                            children={(field) => {
                                const isInvalid =
                                    field.state.meta.isTouched && !field.state.meta.isValid
                                return (
                                    <Field data-invalid={isInvalid}>
                                        <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            aria-invalid={isInvalid}
                                            placeholder="Enter your password"
                                            autoComplete="off"
                                        />
                                        {isInvalid && field.state.meta.errors?.map((error, i) => (
                                            <FieldError key={i}>{'message' in error! ? error.message : String(error)}</FieldError>
                                        ))}
                                    </Field>
                                )
                            }}
                        />
                    </FieldGroup>
                    <Button type="submit" className="w-full">
                        {isLogin ? 'Login' : 'Sign Up'}
                    </Button>
                    <Button variant="outline" className="w-full">
                        {isLogin ? 'Login' : 'Sign Up'} with Google
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex justify-between w-full">
                <CardAction>
                    <Button variant="link" onClick={toggle}>
                        {isLogin ? 'Don\'t have an account? Sign Up' : `Already have an account? Login`}
                    </Button>
                </CardAction>
                <Button variant="link" className="text-blue-400">Forgot password?</Button>
            </CardFooter>
        </Card>
    )
}
