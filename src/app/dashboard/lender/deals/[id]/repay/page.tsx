"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

export default function RepayLoanPage() {
    const params = useParams()
    const router = useRouter()
    const dealId = params.id as string

    const [deal, setDeal] = useState<any>(null)
    const [walletBalance, setWalletBalance] = useState<number>(0)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const supabase = createClient()

    useEffect(() => {
        loadDeal()
    }, [dealId])

    const loadDeal = async () => {
        try {
            setLoading(true)

            // Get current user
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                setError("Please log in to view this page")
                return
            }

            // Load deal and wallet balance in parallel
            const [dealResult, walletResult] = await Promise.all([
                supabase
                    .from("deals")
                    .select("*")
                    .eq("id", dealId)
                    .single(),
                supabase
                    .from("wallets")
                    .select("balance")
                    .eq("user_id", user.id)
                    .single()
            ])

            if (dealResult.error || !dealResult.data) {
                setError("Deal not found")
                return
            }

            setDeal(dealResult.data)
            setWalletBalance(walletResult.data?.balance || 0)
        } catch (err) {
            console.error("Error loading deal:", err)
            setError("Failed to load deal")
        } finally {
            setLoading(false)
        }
    }

    const handleRepay = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSubmitting(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                setError("Please log in to submit repayment")
                return
            }

            // Calculate total due
            const principal = Number(deal.loan_amount)
            const interest = principal * (Number(deal.interest_rate) / 100) * (deal.term_months / 12)
            const totalDue = principal + interest

            // Check wallet balance before submitting
            const { data: walletData } = await supabase
                .from("wallets")
                .select("balance")
                .eq("user_id", user.id)
                .single()

            const currentBalance = walletData?.balance || 0
            if (currentBalance < totalDue) {
                setError(`Insufficient wallet balance. You need $${totalDue.toLocaleString(undefined, { maximumFractionDigits: 2 })} but only have $${currentBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}. Please add funds to your wallet first.`)
                setSubmitting(false)
                return
            }

            // Create pending transaction for admin approval
            const { error: insertError } = await supabase
                .from("pending_transactions")
                .insert({
                    user_id: user.id,
                    deal_id: dealId,
                    type: "repayment",
                    amount: totalDue,
                    status: "pending"
                })

            if (insertError) {
                console.error("Error creating pending repayment:", insertError)
                setError(insertError.message || "Failed to submit repayment")
                return
            }

            setSuccess(true)
            setTimeout(() => {
                router.push("/dashboard/lender")
            }, 2000)

        } catch (err: any) {
            console.error("Repayment error:", err)
            setError(err.message || "Failed to submit repayment")
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading loan details...</p>
                </div>
            </div>
        )
    }

    if (error && !deal) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <Button asChild variant="outline">
                    <Link href="/dashboard/lender">
                        <ArrowLeft className="mr-2 size-4" />
                        Back to Dashboard
                    </Link>
                </Button>
            </div>
        )
    }

    // Calculate amounts
    const principal = Number(deal?.loan_amount || 0)
    const interest = principal * (Number(deal?.interest_rate || 0) / 100) * ((deal?.term_months || 12) / 12)
    const totalDue = principal + interest

    return (
        <div className="flex flex-col gap-6 max-w-2xl mx-auto">
            <Button asChild variant="ghost" className="w-fit">
                <Link href="/dashboard/lender">
                    <ArrowLeft className="mr-2 size-4" />
                    Back to Dashboard
                </Link>
            </Button>

            <h1 className="text-3xl font-bold tracking-tight">Repay Loan</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Loan Summary: {deal?.title}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-sm text-gray-500">Principal</div>
                            <div className="text-lg font-semibold">${principal.toLocaleString()}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">Interest Rate</div>
                            <div className="text-lg font-semibold">{deal?.interest_rate}%</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">Term</div>
                            <div className="text-lg font-semibold">{deal?.term_months} Months</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">Total Interest</div>
                            <div className="text-lg font-semibold text-red-600">
                                ${interest.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </div>
                        </div>
                    </div>

                    <div className="border-t pt-4 mt-2">
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-bold">Total Payoff Amount</span>
                            <span className="text-2xl font-bold">
                                ${totalDue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>

                    <div className="border-t pt-4 mt-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Your Wallet Balance</span>
                            <span className={`text-lg font-semibold ${walletBalance >= totalDue ? 'text-green-600' : 'text-red-600'}`}>
                                ${walletBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </span>
                        </div>
                        {walletBalance < totalDue && (
                            <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                                Insufficient balance. You need ${(totalDue - walletBalance).toLocaleString(undefined, { maximumFractionDigits: 2 })} more to repay this loan.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Process Repayment</CardTitle>
                </CardHeader>
                <CardContent>
                    {success ? (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-center">
                            <p className="font-semibold">Repayment Submitted!</p>
                            <p className="text-sm mt-1">Your repayment request is pending admin approval.</p>
                            <p className="text-sm mt-2">Redirecting to dashboard...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleRepay} className="space-y-4">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="amount">Repayment Amount ($)</Label>
                                <Input
                                    id="amount"
                                    name="amount"
                                    type="number"
                                    value={totalDue.toFixed(2)}
                                    readOnly
                                    className="bg-gray-100"
                                />
                                <p className="text-xs text-gray-500">
                                    Full repayment required to close the loan.
                                </p>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700"
                                size="lg"
                                disabled={submitting || walletBalance < totalDue}
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : walletBalance < totalDue ? (
                                    "Insufficient Balance"
                                ) : (
                                    "Confirm Repayment"
                                )}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
