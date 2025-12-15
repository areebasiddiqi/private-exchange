"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const formSchema = z.object({
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    password: z.string().min(6, {
        message: "Password must be at least 6 characters.",
    }),
})

export default function LoginPage() {
    const router = useRouter()
    const supabase = createClient()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: values.email,
                password: values.password,
            })

            if (error) {
                setError(error.message)
                return
            }

            router.push("/dashboard")
            router.refresh()
        } catch (error) {
            setError("Something went wrong. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <Button
                        variant="ghost"
                        asChild
                        className="mb-8"
                    >
                        <Link href="/">
                            <ArrowLeft className="mr-2 size-4" />
                            Back to Home
                        </Link>
                    </Button>
                    <h1 className="text-4xl font-bold text-gray-900">
                        Private Money Exchange
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Sign in to your account
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Login</CardTitle>
                        <CardDescription>
                            Enter your credentials to access your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="your@email.com"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    autoCorrect="off"
                                    disabled={isLoading}
                                    {...form.register("email")}
                                />
                                {form.formState.errors.email && (
                                    <p className="text-sm text-red-500">
                                        {form.formState.errors.email.message}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    autoCapitalize="none"
                                    autoComplete="current-password"
                                    disabled={isLoading}
                                    {...form.register("password")}
                                />
                                {form.formState.errors.password && (
                                    <p className="text-sm text-red-500">
                                        {form.formState.errors.password.message}
                                    </p>
                                )}
                            </div>
                            {error && <p className="text-sm text-red-500">{error}</p>}
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Sign In
                            </Button>
                        </form>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">New to the platform?</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Button
                                variant="outline"
                                className="w-full"
                                asChild
                            >
                                <Link href="/signup?type=investor">
                                    Sign Up as Investor
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full"
                                asChild
                            >
                                <Link href="/signup?type=lender">
                                    Sign Up as Lender
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <p className="text-center text-sm text-gray-500">
                    By signing in, you agree to our{" "}
                    <Link href="#" className="underline hover:text-gray-700">Terms of Service</Link>
                    {" "}and{" "}
                    <Link href="#" className="underline hover:text-gray-700">Privacy Policy</Link>
                </p>
            </div>
        </div>
    )
}
