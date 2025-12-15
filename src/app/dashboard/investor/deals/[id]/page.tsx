"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function DealDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const dealId = params.id as string

    const [deal, setDeal] = useState<any>(null)
    const [wallet, setWallet] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [investing, setInvesting] = useState(false)
    const [amount, setAmount] = useState("5000")
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const supabase = createClient()

    useEffect(() => {
        loadData()
    }, [dealId])

    const loadData = async () => {
        try {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push("/login")
                return
            }

            // Load deal
            const { data: dealData, error: dealError } = await supabase
                .from("deals")
                .select("*, profiles(company_name, full_name)")
                .eq("id", dealId)
                .single()

            if (dealError || !dealData) {
                setError("Deal not found")
                return
            }
            setDeal(dealData)

            // Load wallet
            const { data: walletData } = await supabase
                .from("wallets")
                .select("balance")
                .eq("user_id", user.id)
                .single()
            setWallet(walletData)

        } catch (err) {
            console.error("Error loading data:", err)
            setError("Failed to load deal details")
        } finally {
            setLoading(false)
        }
    }

    const handleInvest = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSuccess(false)

        const investAmount = parseFloat(amount)
        if (!investAmount || investAmount < 1000) {
            setError("Minimum investment is $1,000")
            return
        }

        const balance = Number(wallet?.balance || 0)
        if (investAmount > balance) {
            setError("Insufficient balance. Please deposit more funds.")
            return
        }

        try {
            setInvesting(true)
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                setError("Please log in to invest")
                return
            }

            // Create pending transaction for admin approval
            const { error: insertError } = await supabase
                .from("pending_transactions")
                .insert({
                    user_id: user.id,
                    deal_id: dealId,
                    type: "investment",
                    amount: investAmount,
                    status: "pending"
                })

            if (insertError) {
                console.error("Investment error:", insertError)
                setError(insertError.message || "Failed to submit investment")
                return
            }

            setSuccess(true)
            setTimeout(() => {
                router.push("/dashboard/investor?tab=portfolio")
            }, 2000)

        } catch (err: any) {
            console.error("Investment error:", err)
            setError(err.message || "Failed to submit investment")
        } finally {
            setInvesting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading deal details...</p>
                </div>
            </div>
        )
    }

    if (error && !deal) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <Button asChild variant="outline">
                    <Link href="/dashboard/investor">
                        <ArrowLeft className="mr-2 size-4" />
                        Back to Dashboard
                    </Link>
                </Button>
            </div>
        )
    }

    const balance = Number(wallet?.balance || 0)

    return (
        <div className="space-y-6">
            <Button asChild variant="ghost" className="mb-4">
                <Link href="/dashboard/investor">
                    <ArrowLeft className="mr-2 size-4" />
                    Back to Dashboard
                </Link>
            </Button>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold">{deal?.title}</h1>
                        <p className="text-gray-600 text-lg">{deal?.property_location}</p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Investment Highlights</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <div className="text-sm text-gray-500">Loan Amount</div>
                                <div className="text-2xl font-bold">${deal?.loan_amount?.toLocaleString()}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">Interest Rate</div>
                                <div className="text-2xl font-bold text-green-600">{deal?.interest_rate}%</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">Term</div>
                                <div className="text-xl font-semibold">{deal?.term_months} Months</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">LTV</div>
                                <div className="text-xl font-semibold">{deal?.ltv}%</div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Property Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-wrap leading-relaxed">{deal?.description || "No description provided."}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Lender Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-2">
                                <div className="font-semibold">{deal?.profiles?.company_name || "Private Lender"}</div>
                                <div className="text-sm text-gray-500">
                                    Verified Lender on Private Money Exchange
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Card className="sticky top-6">
                        <CardHeader>
                            <CardTitle>Invest in this Deal</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 p-4 bg-gray-100 rounded-lg">
                                <div className="text-sm text-gray-500">Your Available Balance</div>
                                <div className="text-2xl font-bold">${balance.toLocaleString()}</div>
                            </div>

                            {success ? (
                                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-center">
                                    <p className="font-semibold">Investment Submitted!</p>
                                    <p className="text-sm mt-1">Your investment request is pending admin approval.</p>
                                    <p className="text-sm mt-2">Redirecting to portfolio...</p>
                                </div>
                            ) : (
                                <form onSubmit={handleInvest} className="space-y-4">
                                    {error && (
                                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                            {error}
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label htmlFor="amount">Investment Amount ($)</Label>
                                        <Input
                                            id="amount"
                                            name="amount"
                                            type="number"
                                            min="1000"
                                            max={balance}
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            step="1000"
                                            required
                                            disabled={investing}
                                        />
                                        <p className="text-xs text-gray-500">Minimum investment: $1,000</p>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full bg-blue-600 hover:bg-blue-700"
                                        size="lg"
                                        disabled={balance < 1000 || investing}
                                    >
                                        {investing ? (
                                            <>
                                                <Loader2 className="mr-2 size-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : balance < 1000 ? (
                                            "Insufficient Funds"
                                        ) : (
                                            "Commit Capital"
                                        )}
                                    </Button>

                                    {balance < 1000 && (
                                        <p className="text-sm text-center text-gray-500">
                                            <Link href="/dashboard/investor" className="text-blue-600 hover:underline">
                                                Deposit funds
                                            </Link>{" "}
                                            to invest in this deal.
                                        </p>
                                    )}
                                </form>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
