"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Wallet,
    TrendingUp,
    DollarSign,
    PieChart,
    Bell,
    ArrowUpRight,
    ArrowDownRight,
    FileText,
    MapPin,
    Clock,
    Loader2
} from "lucide-react"
import Link from "next/link"
import { createStripeCheckout } from "@/app/actions/stripe"

export default function InvestorDashboardPage() {
    const [activeTab, setActiveTab] = useState("dashboard")
    const [wallet, setWallet] = useState<any>(null)
    const [deals, setDeals] = useState<any[]>([])
    const [investments, setInvestments] = useState<any[]>([])
    const [transactions, setTransactions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [depositAmount, setDepositAmount] = useState("")
    const [withdrawAmount, setWithdrawAmount] = useState("")
    const [depositLoading, setDepositLoading] = useState(false)
    const [withdrawLoading, setWithdrawLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const supabase = createClient()

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) return

            // Load wallet
            const { data: walletData } = await supabase
                .from("wallets")
                .select("*")
                .eq("user_id", user.id)
                .single()
            setWallet(walletData)

            // Load available deals
            const { data: dealsData } = await supabase
                .from("deals")
                .select("*")
                .eq("status", "approved")
                .order("created_at", { ascending: false })
            setDeals(dealsData || [])

            // Load investments
            const { data: investmentsData } = await supabase
                .from("investments")
                .select("*, deals(title, interest_rate, term_months, property_location)")
                .eq("investor_id", user.id)
                .order("created_at", { ascending: false })
            setInvestments(investmentsData || [])

            // Load transactions
            const { data: transactionsData } = await supabase
                .from("transactions")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
            setTransactions(transactionsData || [])

        } catch (error) {
            console.error("Error loading data:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleDeposit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        const amount = parseFloat(depositAmount)
        if (!amount || amount < 100) {
            setError("Minimum deposit is $100")
            return
        }

        try {
            setDepositLoading(true)
            await createStripeCheckout(amount)
        } catch (err: any) {
            console.error("Deposit error:", err)
            setError(err.message || "Failed to initiate deposit")
        } finally {
            setDepositLoading(false)
        }
    }

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        const amount = parseFloat(withdrawAmount)
        if (!amount || amount <= 0) {
            setError("Please enter a valid amount")
            return
        }

        if (amount > (wallet?.balance || 0)) {
            setError("Insufficient balance")
            return
        }

        try {
            setWithdrawLoading(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Not authenticated")

            // Create pending withdrawal request in transactions table
            const { error: insertError } = await supabase
                .from("transactions")
                .insert({
                    user_id: user.id,
                    type: "withdrawal",
                    amount: -amount,
                    status: "pending"
                })

            if (insertError) throw insertError

            setWithdrawAmount("")
            alert("Withdrawal request submitted for admin approval")
            loadData()
        } catch (err: any) {
            console.error("Withdrawal error:", err)
            setError(err.message || "Failed to submit withdrawal request")
        } finally {
            setWithdrawLoading(false)
        }
    }

    const totalInvested = investments.reduce((sum, inv) => sum + (inv.amount || 0), 0)
    const activeInvestments = investments.filter(i => i.status === "completed").length

    const getStatusBadge = (status: string) => {
        const variants: Record<string, string> = {
            pending: "bg-yellow-100 text-yellow-800",
            approved: "bg-green-100 text-green-800",
            active: "bg-blue-100 text-blue-800",
            funded: "bg-blue-100 text-blue-800",
            completed: "bg-green-100 text-green-800",
            rejected: "bg-red-100 text-red-800",
        }
        return (
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variants[status] || "bg-gray-100 text-gray-800"}`}>
                {status}
            </span>
        )
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-8">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="deals">Marketplace</TabsTrigger>
                <TabsTrigger value="portfolio">My Portfolio</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
                {/* Wallet Overview */}
                <div className="grid gap-6 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                            <Wallet className="size-4 text-gray-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${(wallet?.balance || 0).toLocaleString()}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
                            <DollarSign className="size-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">${(wallet?.balance || 0).toLocaleString()}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
                            <PieChart className="size-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">${totalInvested.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
                            <TrendingUp className="size-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">{activeInvestments}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Deposit/Withdraw Actions */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ArrowUpRight className="size-5" />
                                Deposit Funds
                            </CardTitle>
                            <CardDescription>Add funds to your investment wallet (min. $100)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleDeposit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="deposit-amount">Amount ($)</Label>
                                    <Input
                                        id="deposit-amount"
                                        type="number"
                                        min="100"
                                        placeholder="10000"
                                        value={depositAmount}
                                        onChange={(e) => setDepositAmount(e.target.value)}
                                        disabled={depositLoading}
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                    disabled={depositLoading}
                                >
                                    {depositLoading ? (
                                        <>
                                            <Loader2 className="mr-2 size-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        "Deposit via Stripe"
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ArrowDownRight className="size-5" />
                                Withdraw Funds
                            </CardTitle>
                            <CardDescription>Withdraw available balance</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleWithdraw} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="withdraw-amount">Amount ($)</Label>
                                    <Input
                                        id="withdraw-amount"
                                        type="number"
                                        min="1"
                                        placeholder="5000"
                                        value={withdrawAmount}
                                        onChange={(e) => setWithdrawAmount(e.target.value)}
                                        disabled={withdrawLoading}
                                    />
                                    <p className="text-sm text-gray-600">
                                        Available: ${(wallet?.balance || 0).toLocaleString()}
                                    </p>
                                </div>
                                <Button
                                    type="submit"
                                    variant="outline"
                                    className="w-full"
                                    disabled={withdrawLoading}
                                >
                                    {withdrawLoading ? (
                                        <>
                                            <Loader2 className="mr-2 size-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        "Request Withdrawal"
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Active Investments */}
                <Card>
                    <CardHeader>
                        <CardTitle>Active Investments</CardTitle>
                        <CardDescription>Your current deal allocations</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {investments.filter(i => i.status === "completed").length > 0 ? (
                            <div className="space-y-4">
                                {investments.filter(i => i.status === "completed").map((inv) => (
                                    <div key={inv.id} className="border rounded-lg p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-semibold">{inv.deals?.title}</h3>
                                                <p className="text-sm text-gray-600 mt-1">{inv.deals?.property_location}</p>
                                                <div className="flex gap-4 mt-2 text-sm">
                                                    <span className="text-gray-600">Your Allocation: <strong className="text-gray-900">${inv.amount?.toLocaleString()}</strong></span>
                                                    <span className="text-gray-600">Interest: <strong className="text-gray-900">{inv.deals?.interest_rate}%</strong></span>
                                                </div>
                                            </div>
                                            {getStatusBadge(inv.status)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-600 py-8">No active investments. Browse the marketplace to find deals.</p>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Deals/Marketplace Tab */}
            <TabsContent value="deals" className="space-y-6">
                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-bold text-gray-900">Marketplace</h2>
                    <p className="text-gray-600">Browse vetted lending opportunities and deploy capital.</p>
                </div>

                {deals.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {deals.map((deal) => (
                            <Card key={deal.id} className="flex flex-col border-2 hover:border-blue-200 hover:shadow-lg transition-all">
                                <CardHeader>
                                    <div className="flex justify-between items-start gap-2">
                                        <CardTitle className="line-clamp-1 text-lg text-gray-900">{deal.title}</CardTitle>
                                        <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-800 px-2.5 py-0.5 text-xs font-semibold uppercase shrink-0">
                                            {deal.property_type}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                                        <MapPin className="size-3" />
                                        {deal.property_location}
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 grid gap-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 rounded-lg p-3">
                                            <div className="flex items-center gap-1 text-gray-500 text-xs">
                                                <DollarSign className="size-3" />
                                                Loan Amount
                                            </div>
                                            <div className="font-bold text-gray-900 mt-1">
                                                ${deal.loan_amount?.toLocaleString() || '0'}
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-3">
                                            <div className="flex items-center gap-1 text-gray-500 text-xs">
                                                <TrendingUp className="size-3" />
                                                Interest Rate
                                            </div>
                                            <div className="font-bold text-green-600 mt-1">
                                                {deal.interest_rate}%
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-3">
                                            <div className="flex items-center gap-1 text-gray-500 text-xs">
                                                <Clock className="size-3" />
                                                Term
                                            </div>
                                            <div className="font-bold text-gray-900 mt-1">
                                                {deal.term_months} Months
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-3">
                                            <div className="text-gray-500 text-xs">LTV</div>
                                            <div className="font-bold text-gray-900 mt-1">
                                                {deal.ltv}%
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                                <div className="p-6 pt-0">
                                    <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                                        <Link href={`/dashboard/investor/deals/${deal.id}`}>
                                            View Deal Details
                                        </Link>
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="border-2 border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <FileText className="size-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900">No active deals</h3>
                            <p className="text-gray-600 mt-2 max-w-sm">
                                Check back later for new investment opportunities. Our team is reviewing deals daily.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </TabsContent>

            {/* Portfolio Tab */}
            <TabsContent value="portfolio" className="space-y-6">
                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-bold text-gray-900">My Portfolio</h2>
                    <p className="text-gray-600">Track your investments and returns.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${totalInvested.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{investments.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Avg. Interest Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {investments.length > 0
                                    ? (investments.reduce((sum, inv) => sum + (inv.deals?.interest_rate || 0), 0) / investments.length).toFixed(1)
                                    : 0}%
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Investments</CardTitle>
                        <CardDescription>Complete history of your deal allocations</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {investments.length > 0 ? (
                            <div className="relative w-full overflow-auto">
                                <table className="w-full caption-bottom text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Deal</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Amount</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Rate</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Date</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {investments.map((inv) => (
                                            <tr key={inv.id} className="border-b hover:bg-gray-50">
                                                <td className="p-4 align-middle font-medium">{inv.deals?.title}</td>
                                                <td className="p-4 align-middle">${inv.amount?.toLocaleString()}</td>
                                                <td className="p-4 align-middle">{inv.deals?.interest_rate}%</td>
                                                <td className="p-4 align-middle">{new Date(inv.created_at).toLocaleDateString()}</td>
                                                <td className="p-4 align-middle">{getStatusBadge(inv.status)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-center text-gray-600 py-8">No investments yet</p>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Transactions Tab */}
            <TabsContent value="transactions" className="space-y-6">
                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-bold text-gray-900">Transaction Ledger</h2>
                    <p className="text-gray-600">All deposits, withdrawals, allocations, and earnings.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Transaction History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {transactions.length > 0 ? (
                            <div className="relative w-full overflow-auto">
                                <table className="w-full caption-bottom text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Date</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Type</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Amount</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map((txn) => (
                                            <tr key={txn.id} className="border-b hover:bg-gray-50">
                                                <td className="p-4 align-middle">{new Date(txn.created_at).toLocaleDateString()}</td>
                                                <td className="p-4 align-middle capitalize">{txn.type}</td>
                                                <td className={`p-4 align-middle font-medium ${txn.type === 'deposit' || txn.type === 'repayment' ? 'text-green-600' : 'text-red-600'}`}>
                                                    {txn.type === 'deposit' || txn.type === 'repayment' ? '+' : '-'}${Math.abs(txn.amount || 0).toLocaleString()}
                                                </td>
                                                <td className="p-4 align-middle">{getStatusBadge(txn.status)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-center text-gray-600 py-8">No transactions found</p>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    )
}
