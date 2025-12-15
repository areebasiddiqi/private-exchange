"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    FileText,
    TrendingUp,
    DollarSign,
    Plus,
    Bell,
    Clock
} from "lucide-react"
import Link from "next/link"

export default function LenderDashboardPage() {
    const [activeTab, setActiveTab] = useState("dashboard")
    const [deals, setDeals] = useState<any[]>([])
    const [repayments, setRepayments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showDealForm, setShowDealForm] = useState(false)

    const [dealForm, setDealForm] = useState({
        title: "",
        property_location: "",
        property_type: "residential",
        loan_amount: "",
        interest_rate: "",
        term_months: "12",
        ltv: "",
        description: "",
    })

    const supabase = createClient()

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) return

            // Load deals
            const { data: dealsData } = await supabase
                .from("deals")
                .select("*")
                .eq("lender_id", user.id)
                .order("created_at", { ascending: false })
            setDeals(dealsData || [])

            // Load repayments from pending_transactions
            const { data: repaymentsData } = await supabase
                .from("pending_transactions")
                .select("*, deals(title)")
                .eq("user_id", user.id)
                .eq("type", "repayment")
                .order("created_at", { ascending: false })
            setRepayments(repaymentsData || [])

        } catch (error) {
            console.error("Error loading data:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmitDeal = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { error } = await supabase.from("deals").insert({
                lender_id: user.id,
                title: dealForm.title,
                property_location: dealForm.property_location,
                property_type: dealForm.property_type,
                loan_amount: parseFloat(dealForm.loan_amount),
                interest_rate: parseFloat(dealForm.interest_rate),
                term_months: parseInt(dealForm.term_months),
                ltv: parseFloat(dealForm.ltv),
                description: dealForm.description,
                status: "pending",
            })

            if (error) throw error

            setDealForm({
                title: "",
                property_location: "",
                property_type: "residential",
                loan_amount: "",
                interest_rate: "",
                term_months: "12",
                ltv: "",
                description: "",
            })
            setShowDealForm(false)
            loadData()
        } catch (error) {
            console.error("Error submitting deal:", error)
        }
    }

    const activeDeals = deals.filter(d => d.status === "funded" || d.status === "active")
    const pendingDeals = deals.filter(d => d.status === "pending")
    const totalFunded = deals.filter(d => ["funded", "active", "completed"].includes(d.status))
        .reduce((sum, d) => sum + (d.loan_amount || 0), 0)

    const getStatusBadge = (status: string) => {
        const variants: Record<string, string> = {
            pending: "bg-yellow-100 text-yellow-800",
            approved: "bg-green-100 text-green-800",
            active: "bg-blue-100 text-blue-800",
            funded: "bg-blue-100 text-blue-800",
            completed: "bg-gray-100 text-gray-800",
            rejected: "bg-red-100 text-red-800",
            denied: "bg-red-100 text-red-800",
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
                <TabsTrigger value="deals">My Deals</TabsTrigger>
                <TabsTrigger value="repayments">Repayments</TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
                {/* Stats */}
                <div className="grid gap-6 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
                            <FileText className="size-4 text-gray-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{deals.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
                            <TrendingUp className="size-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{activeDeals.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                            <Clock className="size-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{pendingDeals.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Funded</CardTitle>
                            <DollarSign className="size-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">${totalFunded.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <Button onClick={() => setShowDealForm(!showDealForm)} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="mr-2 size-4" />
                        Submit New Deal
                    </Button>
                </div>

                {/* Deal Form */}
                {showDealForm && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Submit New Deal Request</CardTitle>
                            <CardDescription>Submit complete deal documentation for admin review</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmitDeal} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Deal Title</Label>
                                        <Input
                                            id="title"
                                            placeholder="e.g., Austin Multi-Family Rehab"
                                            value={dealForm.title}
                                            onChange={(e) => setDealForm({ ...dealForm, title: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="property_location">Property Location</Label>
                                        <Input
                                            id="property_location"
                                            placeholder="123 Main St, Austin, TX"
                                            value={dealForm.property_location}
                                            onChange={(e) => setDealForm({ ...dealForm, property_location: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="loan_amount">Loan Amount ($)</Label>
                                        <Input
                                            id="loan_amount"
                                            type="number"
                                            placeholder="350000"
                                            value={dealForm.loan_amount}
                                            onChange={(e) => setDealForm({ ...dealForm, loan_amount: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="interest_rate">Interest Rate (%)</Label>
                                        <Input
                                            id="interest_rate"
                                            type="number"
                                            step="0.1"
                                            placeholder="12"
                                            value={dealForm.interest_rate}
                                            onChange={(e) => setDealForm({ ...dealForm, interest_rate: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="term_months">Term (months)</Label>
                                        <Input
                                            id="term_months"
                                            type="number"
                                            placeholder="12"
                                            value={dealForm.term_months}
                                            onChange={(e) => setDealForm({ ...dealForm, term_months: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="ltv">LTV (%)</Label>
                                        <Input
                                            id="ltv"
                                            type="number"
                                            step="0.1"
                                            placeholder="70"
                                            value={dealForm.ltv}
                                            onChange={(e) => setDealForm({ ...dealForm, ltv: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description & Exit Strategy</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Describe the deal and borrower's exit strategy..."
                                        value={dealForm.description}
                                        onChange={(e) => setDealForm({ ...dealForm, description: e.target.value })}
                                        rows={3}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Submit Deal for Approval</Button>
                                    <Button type="button" variant="outline" onClick={() => setShowDealForm(false)}>Cancel</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Deal Pipeline */}
                <Card>
                    <CardHeader>
                        <CardTitle>Deal Pipeline</CardTitle>
                        <CardDescription>Status of all your submitted deals</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {deals.length > 0 ? (
                            <div className="space-y-4">
                                {deals.slice(0, 5).map((deal) => (
                                    <div key={deal.id} className="border rounded-lg p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-semibold">{deal.title}</h3>
                                                <p className="text-sm text-gray-600 mt-1">{deal.property_location}</p>
                                                <div className="flex gap-4 mt-2 text-sm">
                                                    <span className="text-gray-600">Loan: <strong className="text-gray-900">${deal.loan_amount?.toLocaleString()}</strong></span>
                                                    <span className="text-gray-600">Interest: <strong className="text-gray-900">{deal.interest_rate}%</strong></span>
                                                    <span className="text-gray-600">Term: <strong className="text-gray-900">{deal.term_months} mo</strong></span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {getStatusBadge(deal.status)}
                                                {deal.status === "funded" && (
                                                    <Button size="sm" asChild>
                                                        <Link href={`/dashboard/lender/deals/${deal.id}/repay`}>
                                                            Repay
                                                        </Link>
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-600 py-8">No deals submitted yet</p>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Deals Tab */}
            <TabsContent value="deals" className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">All My Deals</h2>
                        <p className="text-gray-600">Complete history of submitted deals</p>
                    </div>
                    <Button onClick={() => { setActiveTab("dashboard"); setShowDealForm(true); }} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="mr-2 size-4" />
                        Submit New Deal
                    </Button>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        {deals.length > 0 ? (
                            <div className="relative w-full overflow-auto">
                                <table className="w-full caption-bottom text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Deal Title</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Location</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Loan Amount</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Rate</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Term</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Status</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Date</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {deals.map((deal) => (
                                            <tr key={deal.id} className="border-b hover:bg-gray-50">
                                                <td className="p-4 align-middle font-medium">{deal.title}</td>
                                                <td className="p-4 align-middle text-sm text-gray-600">{deal.property_location}</td>
                                                <td className="p-4 align-middle">${deal.loan_amount?.toLocaleString()}</td>
                                                <td className="p-4 align-middle">{deal.interest_rate}%</td>
                                                <td className="p-4 align-middle">{deal.term_months} mo</td>
                                                <td className="p-4 align-middle">{getStatusBadge(deal.status)}</td>
                                                <td className="p-4 align-middle text-sm text-gray-600">{new Date(deal.created_at).toLocaleDateString()}</td>
                                                <td className="p-4 align-middle">
                                                    {deal.status === "funded" && (
                                                        <Button size="sm" asChild>
                                                            <Link href={`/dashboard/lender/deals/${deal.id}/repay`}>
                                                                Repay
                                                            </Link>
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-center text-gray-600 py-8">No deals found</p>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Repayments Tab */}
            <TabsContent value="repayments" className="space-y-6">
                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-bold text-gray-900">Repayment History</h2>
                    <p className="text-gray-600">All submitted repayments and their status</p>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        {repayments.length > 0 ? (
                            <div className="relative w-full overflow-auto">
                                <table className="w-full caption-bottom text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Date</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Deal</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Amount</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Type</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {repayments.map((repay) => (
                                            <tr key={repay.id} className="border-b hover:bg-gray-50">
                                                <td className="p-4 align-middle">{new Date(repay.created_at).toLocaleDateString()}</td>
                                                <td className="p-4 align-middle font-medium">{repay.deals?.title || "Unknown"}</td>
                                                <td className="p-4 align-middle text-green-600">${(repay.amount || 0).toLocaleString()}</td>
                                                <td className="p-4 align-middle capitalize">{repay.type || "repayment"}</td>
                                                <td className="p-4 align-middle">{getStatusBadge(repay.status)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-center text-gray-600 py-8">No repayments submitted yet</p>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    )
}
