"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Briefcase, DollarSign } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function OnboardingPage() {
    const router = useRouter()
    const supabase = createClient()
    const [isLoading, setIsLoading] = useState(false)
    const [selectedRole, setSelectedRole] = useState<"investor" | "lender" | null>(
        null
    )

    async function onContinue() {
        if (!selectedRole) return

        setIsLoading(true)
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (!user) {
                throw new Error("No user found")
            }

            const { error } = await supabase
                .from("profiles")
                .update({ role: selectedRole })
                .eq("id", user.id)

            if (error) throw error

            if (selectedRole === "lender") {
                router.push("/onboarding/lender")
            } else {
                router.push("/onboarding/investor")
            }
        } catch (error) {
            console.error("Error updating role:", error)
            // Handle error (show toast, etc.)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="container flex h-screen w-screen flex-col items-center justify-center">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[550px]">
                <div className="flex flex-col space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Select your role
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        How do you plan to use Private Money Exchange?
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div
                        className={cn(
                            "cursor-pointer rounded-xl border-2 border-muted p-4 hover:border-primary",
                            selectedRole === "investor" && "border-primary bg-accent"
                        )}
                        onClick={() => setSelectedRole("investor")}
                    >
                        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <DollarSign className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-semibold">Investor</h3>
                        <p className="text-sm text-muted-foreground">
                            I want to deploy capital into vetted lending deals.
                        </p>
                    </div>

                    <div
                        className={cn(
                            "cursor-pointer rounded-xl border-2 border-muted p-4 hover:border-primary",
                            selectedRole === "lender" && "border-primary bg-accent"
                        )}
                        onClick={() => setSelectedRole("lender")}
                    >
                        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <Briefcase className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-semibold">Hard-Money Lender</h3>
                        <p className="text-sm text-muted-foreground">
                            I want to submit deals and get them funded.
                        </p>
                    </div>
                </div>

                <Button
                    className="w-full"
                    size="lg"
                    disabled={!selectedRole || isLoading}
                    onClick={onContinue}
                >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Continue
                </Button>
            </div>
        </div>
    )
}
