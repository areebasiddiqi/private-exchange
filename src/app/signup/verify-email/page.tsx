"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Loader2 } from "lucide-react"
import Link from "next/link"

export default function VerifyEmailPage() {
    const [isResending, setIsResending] = useState(false)
    const [message, setMessage] = useState<string | null>(null)
    const supabase = createClient()

    async function handleResend() {
        setIsResending(true)
        setMessage(null)

        try {
            const email = localStorage.getItem("pending_verification_email")
            if (!email) {
                setMessage("Email not found. Please sign up again.")
                return
            }

            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: email,
                options: {
                    emailRedirectTo: `${location.origin}/auth/callback`,
                }
            })

            if (error) {
                setMessage(error.message)
            } else {
                setMessage("Verification email sent! Please check your inbox.")
            }
        } catch (error) {
            setMessage("Failed to resend email. Please try again.")
        } finally {
            setIsResending(false)
        }
    }

    return (
        <div className="container flex h-screen w-screen flex-col items-center justify-center">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Check your email</CardTitle>
                    <CardDescription>
                        We've sent you a verification link to complete your registration
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-lg bg-muted p-4 text-sm">
                        <p className="font-medium mb-2">Next steps:</p>
                        <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                            <li>Check your email inbox</li>
                            <li>Click the verification link</li>
                            <li>Complete your profile setup</li>
                        </ol>
                    </div>

                    {message && (
                        <div className={`rounded-lg p-3 text-sm ${message.includes("sent")
                                ? "bg-green-50 text-green-800 border border-green-200"
                                : "bg-red-50 text-red-800 border border-red-200"
                            }`}>
                            {message}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Button
                            onClick={handleResend}
                            disabled={isResending}
                            variant="outline"
                            className="w-full"
                        >
                            {isResending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Resend verification email
                        </Button>

                        <Button asChild variant="ghost" className="w-full">
                            <Link href="/login">
                                Back to login
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
