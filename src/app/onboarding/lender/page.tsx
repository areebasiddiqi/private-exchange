"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const formSchema = z.object({
    companyName: z.string().min(2, {
        message: "Company name must be at least 2 characters.",
    }),
    fullName: z.string().min(2, {
        message: "Full name must be at least 2 characters.",
    }),
})

export default function LenderOnboardingPage() {
    const router = useRouter()
    const supabase = createClient()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            companyName: "",
            fullName: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)

        try {
            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (!user) throw new Error("No user found")

            const { error } = await supabase
                .from("profiles")
                .update({
                    company_name: values.companyName,
                    full_name: values.fullName,
                    verification_status: "pending", // Explicitly set to pending
                })
                .eq("id", user.id)

            if (error) throw error

            router.push("/dashboard")
            router.refresh()
        } catch (error) {
            console.error("Error updating profile:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="container flex h-screen w-screen flex-col items-center justify-center">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                <div className="flex flex-col space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Lender Details
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Tell us about your lending company.
                    </p>
                </div>
                <div className={cn("grid gap-6")}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="companyName">Company Name</Label>
                                <Input
                                    id="companyName"
                                    placeholder="Acme Lending Co."
                                    disabled={isLoading}
                                    {...form.register("companyName")}
                                />
                                {form.formState.errors.companyName && (
                                    <p className="text-sm text-red-500">
                                        {form.formState.errors.companyName.message}
                                    </p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input
                                    id="fullName"
                                    placeholder="John Doe"
                                    disabled={isLoading}
                                    {...form.register("fullName")}
                                />
                                {form.formState.errors.fullName && (
                                    <p className="text-sm text-red-500">
                                        {form.formState.errors.fullName.message}
                                    </p>
                                )}
                            </div>
                            <Button disabled={isLoading}>
                                {isLoading && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Complete Setup
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
